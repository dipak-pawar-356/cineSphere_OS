/**
 * ==============================================================================
 * CineSphere OS — Seat Inventory Integration Repository (Phase 4 – Part 13)
 * ==============================================================================
 * Multi-tenant repository managing immutable seat inventory snapshots,
 * individual seat items, show mappings, and theatre inventory policies.
 * ==============================================================================
 */

import {
  SeatInventoryHeader,
  SeatInventoryItem,
  InventoryMappingRecord,
  InventorySnapshotRecord,
  InventoryConfiguration,
  InventoryItemStatus,
  TicketSeatInventoryReference,
} from "@/types/seat-inventory-integration.types";
import { TenantAccessError, NotFoundError, ConflictError } from "@/lib/errors/app-error";

export class SeatInventoryIntegrationRepository {
  private static instance: SeatInventoryIntegrationRepository | null = null;

  // In-memory multi-tenant storage
  private inventories: Map<string, SeatInventoryHeader> = new Map(); // Key: inventoryId
  private showToInventory: Map<string, string> = new Map();         // Key: showId -> inventoryId
  private items: Map<string, SeatInventoryItem[]> = new Map();       // Key: inventoryId -> items
  private mappings: Map<string, InventoryMappingRecord> = new Map(); // Key: showId
  private snapshots: Map<string, InventorySnapshotRecord[]> = new Map(); // Key: showId -> snapshots
  private configurations: Map<string, InventoryConfiguration> = new Map(); // Key: theatreId

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): SeatInventoryIntegrationRepository {
    if (!SeatInventoryIntegrationRepository.instance) {
      SeatInventoryIntegrationRepository.instance = new SeatInventoryIntegrationRepository();
    }
    return SeatInventoryIntegrationRepository.instance;
  }

  // ----------------------------------------------------------------------------
  // 1. Inventory Header & Items
  // ----------------------------------------------------------------------------

  public saveInventory(
    header: SeatInventoryHeader,
    itemsList: SeatInventoryItem[]
  ): void {
    this.inventories.set(header.id, header);
    this.showToInventory.set(header.showId, header.id);
    this.items.set(header.id, itemsList);

    const mapping: InventoryMappingRecord = {
      id: `map-${header.showId}`,
      theatreId: header.theatreId,
      showId: header.showId,
      hallId: header.hallId,
      layoutDefinitionId: header.layoutDefinitionId,
      layoutVersionId: header.layoutVersionId,
      layoutVersionNumber: header.layoutVersionNumber,
      inventoryId: header.id,
      mappingStatus: "BOUND",
      isLocked: true,
      createdAt: header.generatedAt,
    };
    this.mappings.set(header.showId, mapping);
  }

  public getInventoryByShow(showId: string, theatreId: string): SeatInventoryHeader | undefined {
    const invId = this.showToInventory.get(showId);
    if (!invId) return undefined;
    const inv = this.inventories.get(invId);
    if (!inv) return undefined;
    if (inv.theatreId !== theatreId) {
      throw new TenantAccessError(`Inventory for show '${showId}' does not belong to theatre '${theatreId}'.`);
    }
    return inv;
  }

  public getInventoryById(inventoryId: string, theatreId: string): SeatInventoryHeader | undefined {
    const inv = this.inventories.get(inventoryId);
    if (!inv) return undefined;
    if (inv.theatreId !== theatreId) {
      throw new TenantAccessError(`Inventory '${inventoryId}' does not belong to theatre '${theatreId}'.`);
    }
    return inv;
  }

  public getInventoryItems(inventoryId: string, theatreId: string): SeatInventoryItem[] {
    const inv = this.getInventoryById(inventoryId, theatreId);
    if (!inv) return [];
    return this.items.get(inventoryId) || [];
  }

  public updateSeatStatus(params: {
    inventoryId: string;
    internalSeatId: string;
    status: InventoryItemStatus;
    theatreId: string;
    lockedBy?: string;
    lockedUntil?: string;
    bookingId?: string;
    ticketId?: string;
  }): SeatInventoryItem {
    const { inventoryId, internalSeatId, status, theatreId, lockedBy, lockedUntil, bookingId, ticketId } = params;
    const itemsList = this.getInventoryItems(inventoryId, theatreId);
    const item = itemsList.find((i) => i.internalSeatId === internalSeatId);
    if (!item) {
      throw new NotFoundError(`Seat '${internalSeatId}' not found in inventory '${inventoryId}'.`);
    }

    item.status = status;
    item.lockedBy = lockedBy ?? item.lockedBy;
    item.lockedUntil = lockedUntil ?? item.lockedUntil;
    item.bookingId = bookingId ?? item.bookingId;
    item.ticketId = ticketId ?? item.ticketId;
    item.updatedAt = new Date().toISOString();

    // Recalculate header metrics
    const header = this.inventories.get(inventoryId);
    if (header) {
      header.availableSeats = itemsList.filter((i) => i.status === "AVAILABLE").length;
      header.bookedSeats = itemsList.filter((i) => i.status === "BOOKED").length;
      header.blockedSeats = itemsList.filter((i) => i.status === "BLOCKED" || i.status === "RESERVED").length;
      header.maintenanceSeats = itemsList.filter((i) => i.status === "MAINTENANCE").length;
      header.updatedAt = new Date().toISOString();
    }

    return item;
  }

  /**
   * Atomic transactional batch seat status update.
   * Pre-validates all target seat IDs before applying any mutations.
   */
  public batchUpdateSeatStatuses(params: {
    inventoryId: string;
    theatreId: string;
    updates: Array<{
      internalSeatId: string;
      status: InventoryItemStatus;
      lockedBy?: string;
      lockedUntil?: string;
      bookingId?: string;
      ticketId?: string;
    }>;
  }): SeatInventoryItem[] {
    const { inventoryId, theatreId, updates } = params;
    const itemsList = this.getInventoryItems(inventoryId, theatreId);
    const byId = new Map(itemsList.map((i) => [i.internalSeatId, i]));

    // Phase 1: Validate all targets before any mutation (transactional atomicity)
    for (const u of updates) {
      const target = byId.get(u.internalSeatId);
      if (!target) {
        throw new NotFoundError(`Seat '${u.internalSeatId}' not found in inventory '${inventoryId}'.`);
      }
      if (target.status === "BOOKED" && u.status !== "BOOKED") {
        throw new ConflictError(
          `Cannot transition booked seat '${target.displaySeatNumber}' to '${u.status}' without an explicit ticket cancellation.`
        );
      }
    }

    // Phase 2: Apply updates atomically
    const now = new Date().toISOString();
    const updatedItems: SeatInventoryItem[] = [];
    for (const u of updates) {
      const target = byId.get(u.internalSeatId)!;
      target.status = u.status;
      if (u.lockedBy !== undefined) target.lockedBy = u.lockedBy;
      if (u.lockedUntil !== undefined) target.lockedUntil = u.lockedUntil;
      if (u.bookingId !== undefined) target.bookingId = u.bookingId;
      if (u.ticketId !== undefined) target.ticketId = u.ticketId;
      target.updatedAt = now;
      updatedItems.push(target);
    }

    // Phase 3: Recompute header aggregate counters once
    const header = this.inventories.get(inventoryId);
    if (header) {
      header.availableSeats = itemsList.filter((i) => i.status === "AVAILABLE").length;
      header.bookedSeats = itemsList.filter((i) => i.status === "BOOKED").length;
      header.blockedSeats = itemsList.filter((i) => i.status === "BLOCKED" || i.status === "RESERVED").length;
      header.maintenanceSeats = itemsList.filter((i) => i.status === "MAINTENANCE").length;
      header.updatedAt = now;
    }

    return updatedItems;
  }

  public getMappingByShow(showId: string, theatreId: string): InventoryMappingRecord | undefined {
    const mapping = this.mappings.get(showId);
    if (!mapping) return undefined;
    if (mapping.theatreId !== theatreId) {
      throw new TenantAccessError(`Inventory mapping for show '${showId}' does not belong to theatre '${theatreId}'.`);
    }
    return mapping;
  }

  public getTicketSeatReference(
    showId: string,
    internalSeatId: string,
    theatreId: string
  ): TicketSeatInventoryReference {
    const header = this.getInventoryByShow(showId, theatreId);
    if (!header) {
      throw new NotFoundError(`No seat inventory found for show '${showId}'.`);
    }
    const itemsList = this.getInventoryItems(header.id, theatreId);
    const item = itemsList.find((i) => i.internalSeatId === internalSeatId);
    if (!item) {
      throw new NotFoundError(`Seat '${internalSeatId}' not found in show '${showId}'.`);
    }
    if (!item.ticketId || !item.bookingId) {
      throw new NotFoundError(
        `Seat '${item.displaySeatNumber}' does not have an issued ticket or confirmed booking reference.`
      );
    }

    return {
      ticketId: item.ticketId,
      showId: header.showId,
      theatreId: header.theatreId,
      inventoryId: header.id,
      seatInventoryItemId: item.id,
      internalSeatId: item.internalSeatId,
      seatDisplayName: item.displaySeatNumber,
      layoutVersionId: header.layoutVersionId,
      layoutVersionNumber: header.layoutVersionNumber,
      bookingId: item.bookingId,
      issuedAt: item.updatedAt,
    };
  }

  // ----------------------------------------------------------------------------
  // 2. Snapshots Registry
  // ----------------------------------------------------------------------------

  public recordSnapshot(snapshot: InventorySnapshotRecord): void {
    const list = this.snapshots.get(snapshot.showId) || [];
    list.unshift(snapshot);
    this.snapshots.set(snapshot.showId, list);
  }

  public getSnapshots(showId: string, theatreId: string): InventorySnapshotRecord[] {
    const list = this.snapshots.get(showId) || [];
    return list.filter((s) => s.theatreId === theatreId);
  }

  public listSnapshotsByTheatre(theatreId: string): InventorySnapshotRecord[] {
    const all: InventorySnapshotRecord[] = [];
    for (const list of this.snapshots.values()) {
      for (const snap of list) {
        if (snap.theatreId === theatreId) {
          all.push(snap);
        }
      }
    }
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  // ----------------------------------------------------------------------------
  // 3. Configurations
  // ----------------------------------------------------------------------------

  public getConfiguration(theatreId: string): InventoryConfiguration {
    const existing = this.configurations.get(theatreId);
    if (!existing) {
      const standard: InventoryConfiguration = {
        theatreId,
        generationMode: "AUTOMATIC",
        maintenanceSeatsEnabled: true,
        validationMode: "STRICT",
        premiumSeatMetadataEnabled: true,
        defaultLockDurationSeconds: 600,
        allowRegenerationWithZeroBookings: true,
        updatedAt: new Date().toISOString(),
      };
      this.configurations.set(theatreId, standard);
      return standard;
    }
    return existing;
  }

  public updateConfiguration(
    theatreId: string,
    updates: Partial<InventoryConfiguration>
  ): InventoryConfiguration {
    const current = this.getConfiguration(theatreId);
    const updated: InventoryConfiguration = {
      ...current,
      ...updates,
      theatreId,
      updatedAt: new Date().toISOString(),
    };
    this.configurations.set(theatreId, updated);
    return updated;
  }

  // ----------------------------------------------------------------------------
  // Seed Data
  // ----------------------------------------------------------------------------

  private seedInitialData(): void {
    // 1. Pune Galaxy (th-pun-001) - Automatic, Maintenance ON, Strict
    this.configurations.set("th-pun-001", {
      theatreId: "th-pun-001",
      generationMode: "AUTOMATIC",
      maintenanceSeatsEnabled: true,
      validationMode: "STRICT",
      premiumSeatMetadataEnabled: true,
      defaultLockDurationSeconds: 600,
      allowRegenerationWithZeroBookings: true,
      updatedAt: "2026-11-16T00:00:00Z",
    });

    // 2. Mumbai IMAX (th-mum-002) - Manual Approval, Maintenance OFF
    this.configurations.set("th-mum-002", {
      theatreId: "th-mum-002",
      generationMode: "MANUAL_APPROVAL",
      maintenanceSeatsEnabled: false,
      validationMode: "STANDARD",
      premiumSeatMetadataEnabled: true,
      defaultLockDurationSeconds: 480,
      allowRegenerationWithZeroBookings: false,
      updatedAt: "2026-11-16T00:00:00Z",
    });

    // 3. Dubai Royale (th-dxb-003) - Automatic, Custom Validation, Premium Metadata
    this.configurations.set("th-dxb-003", {
      theatreId: "th-dxb-003",
      generationMode: "AUTOMATIC",
      maintenanceSeatsEnabled: true,
      validationMode: "STRICT",
      premiumSeatMetadataEnabled: true,
      defaultLockDurationSeconds: 900,
      allowRegenerationWithZeroBookings: true,
      updatedAt: "2026-11-16T00:00:00Z",
    });
  }
}

export const seatInventoryIntegrationRepository = SeatInventoryIntegrationRepository.getInstance();
