import { SecurityActorContext } from "@/types/security-hardening.types";
import {
  SeatInventoryHeader,
  SeatInventoryItem,
  GenerateInventoryPayload,
  RegenerateInventoryPayload,
  SyncInventoryPayload,
  ValidateInventoryResult,
  InventoryConfiguration,
  InventoryItemStatus,
  InventorySnapshotRecord,
} from "@/types/seat-inventory-integration.types";
import { SeatInventoryIntegrationRepository } from "@/lib/repositories/seat-inventory-integration.repository";
import { HallDesignerRepository } from "@/lib/repositories/hall-designer.repository";
import { structuralObjectRepository } from "@/lib/repositories/structural-object.repository";
import { publishingWorkflowService } from "@/lib/services/publishing-workflow.service";
import { SeatInventoryEngine } from "@/lib/engine/seat-inventory-engine";
import { securityAuditService } from "@/lib/services/security-audit.service";
import {
  TenantAccessError,
  NotFoundError,
  ConflictError,
  AuthorizationError,
  ValidationError,
} from "@/lib/errors/app-error";

/**
 * ==============================================================================
 * CineSphere OS — Seat Inventory Integration Service (Phase 4 – Part 13)
 * ==============================================================================
 * Production domain service generating immutable show seat inventory snapshots
 * from active published layout versions. Guarantees zero mutation of historical
 * shows while synchronizing new shows dynamically.
 * ==============================================================================
 */

export class SeatInventoryIntegrationService {
  private static instance: SeatInventoryIntegrationService | null = null;
  private inventoryRepo = SeatInventoryIntegrationRepository.getInstance();
  private designerRepo = HallDesignerRepository.getInstance();
  private structuralRepo = structuralObjectRepository;
  private publishingService = publishingWorkflowService;
  private auditService = securityAuditService;

  private constructor() {}

  public static getInstance(): SeatInventoryIntegrationService {
    if (!SeatInventoryIntegrationService.instance) {
      SeatInventoryIntegrationService.instance = new SeatInventoryIntegrationService();
    }
    return SeatInventoryIntegrationService.instance;
  }

  // ----------------------------------------------------------------------------
  // 1. Generate Seat Inventory from Published Layout
  // ----------------------------------------------------------------------------

  public async generateInventory(
    actor: SecurityActorContext,
    payload: GenerateInventoryPayload
  ): Promise<{ header: SeatInventoryHeader; items: SeatInventoryItem[] }> {
    const { theatreId, showId, hallId, layoutVersionId } = payload;
    this.assertTenantAccess(actor, theatreId);

    // 1. Check if inventory already exists for this show
    const existing = this.inventoryRepo.getInventoryByShow(showId, theatreId);
    if (existing) {
      const items = this.inventoryRepo.getInventoryItems(existing.id, theatreId);
      return { header: existing, items };
    }

    // 2. Resolve Layout Version (via Show Compatibility Layer or Published Version)
    let targetVersionId = layoutVersionId;
    if (!targetVersionId) {
      const published = this.designerRepo.getPublishedLayoutForHall(hallId, theatreId);
      if (published) {
        targetVersionId = published.id;
      } else {
        const layoutDefs = this.designerRepo.listLayoutDefinitions(theatreId, hallId);
        const primaryDef = layoutDefs[0];
        if (!primaryDef || !primaryDef.currentPublishedVersionId) {
          throw new NotFoundError(
            `Cannot generate seat inventory: No active published layout version exists for hall '${hallId}'.`
          );
        }
        targetVersionId = primaryDef.currentPublishedVersionId;
      }
    }

    const version = this.designerRepo.getLayoutVersionById(targetVersionId, theatreId);
    if (!version) {
      throw new NotFoundError(`Layout version '${targetVersionId}' not found for theatre '${theatreId}'.`);
    }

    const structuralObjects = await this.structuralRepo.listByLayoutVersion(theatreId, version.id);

    // 3. Generate Deterministic Inventory Blueprint
    const inventoryId = `inv-${showId}-${Date.now().toString(36)}`;
    const { header, items } = SeatInventoryEngine.generateInventoryBlueprint({
      inventoryId,
      theatreId,
      showId,
      hallId,
      layoutVersion: version,
      structuralObjects,
      actorId: actor.userId,
    });

    // 4. Save Inventory & Mapping
    this.inventoryRepo.saveInventory(header, items);

    // 5. Record Immutable Point-in-Time Snapshot
    const snapshot: InventorySnapshotRecord = {
      id: `snap-${inventoryId}`,
      inventoryId,
      showId,
      theatreId,
      hallId,
      layoutVersionId: version.id,
      layoutVersionNumber: version.versionNumber,
      totalSeats: items.length,
      grossValue: items.reduce((acc, curr) => acc + curr.calculatedPrice, 0),
      snapshotPayload: {
        header,
        items,
        pricingRulesApplied: {
          baseShowPrice: 200,
          resolvedAt: new Date().toISOString(),
        },
      },
      createdAt: new Date().toISOString(),
      createdBy: actor.userId,
    };
    this.inventoryRepo.recordSnapshot(snapshot);

    // 6. Security Audit Log
    await this.auditService.recordAudit({
      actor,
      module: "SEAT_INVENTORY",
      action: "GENERATE_INVENTORY",
      description: `Generated immutable seat inventory snapshot (${items.length} seats) for show '${showId}' from layout v${version.versionNumber}`,
      metadata: { showId, inventoryId, versionId: version.id, totalSeats: items.length },
    });

    return { header, items };
  }

  // ----------------------------------------------------------------------------
  // 2. Regenerate Inventory (Strict Guard: Zero Bookings Required)
  // ----------------------------------------------------------------------------

  public async regenerateInventory(
    actor: SecurityActorContext,
    payload: RegenerateInventoryPayload
  ): Promise<{ header: SeatInventoryHeader; items: SeatInventoryItem[] }> {
    const { theatreId, showId, reason, forceOverrideWithZeroBookings } = payload;
    this.assertTenantAccess(actor, theatreId);
    this.assertAdminRole(actor);

    const existingHeader = this.inventoryRepo.getInventoryByShow(showId, theatreId);
    if (!existingHeader) {
      throw new NotFoundError(`No existing inventory found for show '${showId}' to regenerate.`);
    }

    // Critical Invariant: Never mutate inventory if bookings already exist!
    if (existingHeader.bookedSeats > 0) {
      throw new ConflictError(
        `Regeneration Rejected: Show '${showId}' has ${existingHeader.bookedSeats} active ticket booking(s). Modifying inventory would invalidate existing patron seats.`
      );
    }

    const config = this.inventoryRepo.getConfiguration(theatreId);
    if (!config.allowRegenerationWithZeroBookings && !forceOverrideWithZeroBookings) {
      throw new ValidationError(
        `Theatre policy prohibits inventory regeneration for show '${showId}'.`
      );
    }

    // Re-resolve active published layout version
    const def = this.designerRepo.getLayoutDefinitionById(existingHeader.layoutDefinitionId, theatreId);
    if (!def || !def.currentPublishedVersionId) {
      throw new NotFoundError(`Active published layout version not found for layout definition '${existingHeader.layoutDefinitionId}'.`);
    }

    const version = this.designerRepo.getLayoutVersionById(def.currentPublishedVersionId, theatreId);
    if (!version) {
      throw new NotFoundError(`Layout version '${def.currentPublishedVersionId}' not found.`);
    }

    const structuralObjects = await this.structuralRepo.listByLayoutVersion(theatreId, version.id);

    const inventoryId = `inv-${showId}-${Date.now().toString(36)}`;
    const { header, items } = SeatInventoryEngine.generateInventoryBlueprint({
      inventoryId,
      theatreId,
      showId,
      hallId: existingHeader.hallId,
      layoutVersion: version,
      structuralObjects,
      actorId: actor.userId,
    });

    this.inventoryRepo.saveInventory(header, items);

    await this.auditService.recordAudit({
      actor,
      module: "SEAT_INVENTORY",
      action: "REGENERATE_INVENTORY",
      description: `Regenerated inventory for show '${showId}' (Reason: ${reason})`,
      metadata: { showId, previousVersionId: existingHeader.layoutVersionId, newVersionId: version.id },
    });

    return { header, items };
  }

  // ----------------------------------------------------------------------------
  // 3. Sync Inventory for New Shows
  // ----------------------------------------------------------------------------

  public async syncInventory(
    actor: SecurityActorContext,
    payload: SyncInventoryPayload
  ): Promise<{ syncedShowIds: string[]; skippedShowIds: string[] }> {
    const { theatreId, targetShowIds } = payload;
    this.assertTenantAccess(actor, theatreId);

    const syncedShowIds: string[] = [];
    const skippedShowIds: string[] = [];

    const showIdsToProcess = targetShowIds || [];
    for (const showId of showIdsToProcess) {
      const existing = this.inventoryRepo.getInventoryByShow(showId, theatreId);
      if (existing) {
        skippedShowIds.push(showId);
        continue;
      }

      try {
        await this.generateInventory(actor, {
          theatreId,
          showId,
          hallId: "hall-pun-aud1", // Default / mapped hall
        });
        syncedShowIds.push(showId);
      } catch {
        skippedShowIds.push(showId);
      }
    }

    return { syncedShowIds, skippedShowIds };
  }

  // ----------------------------------------------------------------------------
  // 4. Load & Validate Inventory
  // ----------------------------------------------------------------------------

  public async loadInventory(
    actor: SecurityActorContext,
    showId: string,
    theatreId: string
  ): Promise<{ header: SeatInventoryHeader; items: SeatInventoryItem[] }> {
    this.assertTenantAccess(actor, theatreId);

    let header = this.inventoryRepo.getInventoryByShow(showId, theatreId);
    if (!header) {
      // Auto-generate if not yet initialized
      const genResult = await this.generateInventory(actor, {
        theatreId,
        showId,
        hallId: "hall-pun-aud1",
      });
      header = genResult.header;
    }

    const items = this.inventoryRepo.getInventoryItems(header.id, theatreId);

    // Evaluate expired seat locks
    const now = new Date().toISOString();
    for (const item of items) {
      if (item.status === "RESERVED" && item.lockedUntil && item.lockedUntil < now) {
        this.inventoryRepo.updateSeatStatus({
          inventoryId: header.id,
          internalSeatId: item.internalSeatId,
          status: "AVAILABLE",
          theatreId,
          lockedBy: undefined,
          lockedUntil: undefined,
        });
      }
    }

    return { header, items };
  }

  public async validateInventory(
    actor: SecurityActorContext,
    showId: string,
    theatreId: string
  ): Promise<ValidateInventoryResult> {
    this.assertTenantAccess(actor, theatreId);

    const { header, items } = await this.loadInventory(actor, showId, theatreId);
    const version = this.designerRepo.getLayoutVersionById(header.layoutVersionId, theatreId);
    if (!version) {
      throw new NotFoundError(`Layout version '${header.layoutVersionId}' not found.`);
    }

    return SeatInventoryEngine.validateInventoryIntegrity(items, version);
  }

  public async updateSeatStatus(
    actor: SecurityActorContext,
    params: {
      showId: string;
      internalSeatId: string;
      status: InventoryItemStatus;
      theatreId: string;
      lockedBy?: string;
      lockedUntil?: string;
      bookingId?: string;
      ticketId?: string;
    }
  ): Promise<SeatInventoryItem> {
    const { showId, internalSeatId, status, theatreId, lockedBy, lockedUntil, bookingId, ticketId } = params;
    this.assertTenantAccess(actor, theatreId);

    const header = this.inventoryRepo.getInventoryByShow(showId, theatreId);
    if (!header) {
      throw new NotFoundError(`No inventory found for show '${showId}'.`);
    }

    const config = this.inventoryRepo.getConfiguration(theatreId);
    if (status === "MAINTENANCE" && !config.maintenanceSeatsEnabled) {
      throw new ValidationError(`Maintenance seat blocking is disabled by theatre policy for '${theatreId}'.`);
    }

    return this.inventoryRepo.updateSeatStatus({
      inventoryId: header.id,
      internalSeatId,
      status,
      theatreId,
      lockedBy,
      lockedUntil,
      bookingId,
      ticketId,
    });
  }

  // ----------------------------------------------------------------------------
  // 5. Theatre Inventory Governance Configuration
  // ----------------------------------------------------------------------------

  public async getConfiguration(
    actor: SecurityActorContext,
    theatreId: string
  ): Promise<InventoryConfiguration> {
    this.assertTenantAccess(actor, theatreId);
    return this.inventoryRepo.getConfiguration(theatreId);
  }

  public async updateConfiguration(
    actor: SecurityActorContext,
    theatreId: string,
    updates: Partial<InventoryConfiguration>
  ): Promise<InventoryConfiguration> {
    this.assertTenantAccess(actor, theatreId);
    this.assertAdminRole(actor);

    const updated = this.inventoryRepo.updateConfiguration(theatreId, updates);

    await this.auditService.recordAudit({
      actor,
      module: "SEAT_INVENTORY",
      action: "UPDATE_CONFIG",
      description: `Updated seat inventory configuration for theatre '${theatreId}'`,
      metadata: { theatreId },
    });

    return updated;
  }

  // ----------------------------------------------------------------------------
  // Security Checks
  // ----------------------------------------------------------------------------

  private assertTenantAccess(actor: SecurityActorContext, theatreId: string): void {
    if (actor.role === "SUPER_ADMIN") return;
    if (actor.theatreId !== theatreId) {
      throw new TenantAccessError(
        `Security Violation: User '${actor.userId}' cannot access inventory for theatre '${theatreId}'.`
      );
    }
  }

  private assertAdminRole(actor: SecurityActorContext): void {
    if (actor.role !== "SUPER_ADMIN" && actor.role !== "THEATRE_ADMIN" && actor.role !== "HALL_MANAGER") {
      throw new AuthorizationError(
        `Action forbidden: Only administrators or hall managers can perform inventory administrative operations.`
      );
    }
  }
}

export const seatInventoryIntegrationService = SeatInventoryIntegrationService.getInstance();
