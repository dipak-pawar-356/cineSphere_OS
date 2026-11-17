/**
 * ==============================================================================
 * CineSphere OS — Layout Versioning Service (Phase 4 – Part 11)
 * ==============================================================================
 * Enterprise domain service for immutable version registries, branching, deep
 * comparison diffs, safe rollbacks, and multi-tenant versioning policies.
 * ==============================================================================
 */

import { SecurityActorContext } from "@/types/security-hardening.types";
import {
  VersionHistoryItem,
  VersionComparisonDiff,
  VersionPolicy,
  RollbackResult,
  VersionChangeEvent,
} from "@/types/layout-versioning.types";
import { LayoutVersion } from "@/types/hall-designer.types";
import { LayoutVersioningRepository } from "@/lib/repositories/layout-versioning.repository";
import { HallDesignerRepository } from "@/lib/repositories/hall-designer.repository";
import { structuralObjectRepository } from "@/lib/repositories/structural-object.repository";
import { VersionComparisonEngine } from "@/lib/engine/version-comparison-engine";
import { securityAuditService } from "@/lib/services/security-audit.service";
import {
  TenantAccessError,
  NotFoundError,
  ConflictError,
  AuthorizationError,
} from "@/lib/errors/app-error";

export class LayoutVersioningService {
  private static instance: LayoutVersioningService | null = null;
  private versioningRepo = LayoutVersioningRepository.getInstance();
  private designerRepo = HallDesignerRepository.getInstance();
  private structuralRepo = structuralObjectRepository;
  private auditService = securityAuditService;

  private constructor() {}

  public static getInstance(): LayoutVersioningService {
    if (!LayoutVersioningService.instance) {
      LayoutVersioningService.instance = new LayoutVersioningService();
    }
    return LayoutVersioningService.instance;
  }

  // ----------------------------------------------------------------------------
  // 1. Version History
  // ----------------------------------------------------------------------------

  public async getVersionHistory(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    theatreId: string
  ): Promise<VersionHistoryItem[]> {
    this.assertTenantAccess(actor, theatreId);

    // Sync from designer repo if any new versions were created
    const def = this.designerRepo.getLayoutDefinitionById(layoutDefinitionId, theatreId);
    if (!def) {
      throw new NotFoundError(`Layout definition '${layoutDefinitionId}' not found.`);
    }

    const allDesignerVersions = this.designerRepo.listVersionsByDefinition(
      layoutDefinitionId,
      theatreId
    );

    for (const v of allDesignerVersions) {
      const existing = this.versioningRepo.getVersionHistoryItem(v.id, theatreId);
      if (!existing) {
        const structObjs = await this.structuralRepo.listByLayoutVersion(theatreId, v.id);
        const historyItem: VersionHistoryItem = {
          id: v.id,
          layoutDefinitionId: v.layoutDefinitionId,
          theatreId: v.theatreId,
          versionNumber: v.versionNumber,
          name: v.name,
          status: v.status as any,
          versionNotes: v.versionNotes,
          totalSeats: v.seats.length,
          totalSections: v.sections.length,
          totalStructuralObjects: structObjs.length,
          isLocked: v.status !== "DRAFT",
          createdBy: v.metadata.createdBy || actor.userId,
          updatedBy: v.metadata.updatedBy || actor.userId,
          publishedBy: v.metadata.publishedBy,
          publishedAt: v.publishedAt,
          archivedAt: v.archivedAt,
          createdAt: v.createdAt,
          updatedAt: v.updatedAt,
          labels: v.status === "PUBLISHED" ? ["LIVE", "STABLE"] : ["DRAFT"],
          tags: [],
        };
        this.versioningRepo.recordVersionHistory(historyItem);
      }
    }

    return this.versioningRepo.getVersionHistory(layoutDefinitionId, theatreId);
  }

  // ----------------------------------------------------------------------------
  // 2. Create / Branch Draft Version
  // ----------------------------------------------------------------------------

  public async createDraftVersion(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    theatreId: string,
    notes: string,
    sourceVersionId?: string
  ): Promise<LayoutVersion> {
    this.assertTenantAccess(actor, theatreId);

    const policy = this.versioningRepo.getVersionPolicy(theatreId);
    const existingHistory = this.versioningRepo.getVersionHistory(layoutDefinitionId, theatreId);

    if (policy.maxVersionsAllowed > 0 && existingHistory.length >= policy.maxVersionsAllowed) {
      throw new ConflictError(
        `Version Limit Exceeded: Theatre policy restricts maximum layout versions to ${policy.maxVersionsAllowed}. Archive or prune older drafts.`
      );
    }

    if (policy.versionNotesRequired && (!notes || notes.trim() === "")) {
      throw new ConflictError("Theatre version policy mandates descriptive version release notes.");
    }

    const newDraft = this.designerRepo.createDraftVersion(
      layoutDefinitionId,
      theatreId,
      notes || `Draft derived by ${actor.userId}`,
      actor
    );

    let totalStructuralObjects = 0;
    // If a specific source version was requested, copy its seats, sections & structural objects
    const effectiveSourceId =
      sourceVersionId ||
      this.designerRepo.getLayoutDefinitionById(layoutDefinitionId, theatreId)?.currentPublishedVersionId;

    if (effectiveSourceId) {
      const source = this.designerRepo.getLayoutVersionById(effectiveSourceId, theatreId);
      if (source && sourceVersionId) {
        newDraft.sections = JSON.parse(JSON.stringify(source.sections));
        newDraft.seats = JSON.parse(JSON.stringify(source.seats));
        newDraft.walkways = JSON.parse(JSON.stringify(source.walkways));
        newDraft.emergencyExits = JSON.parse(JSON.stringify(source.emergencyExits));
        newDraft.gridConfig = { ...source.gridConfig };
      }
      const copiedObjs = await this.structuralRepo.copyObjectsToVersion(
        theatreId,
        effectiveSourceId,
        newDraft.id
      );
      totalStructuralObjects = copiedObjs.length;
    }

    const historyItem: VersionHistoryItem = {
      id: newDraft.id,
      layoutDefinitionId: newDraft.layoutDefinitionId,
      theatreId: newDraft.theatreId,
      versionNumber: newDraft.versionNumber,
      name: newDraft.name,
      status: "DRAFT",
      versionNotes: notes,
      sourceVersionId,
      totalSeats: newDraft.seats.length,
      totalSections: newDraft.sections.length,
      totalStructuralObjects,
      isLocked: false,
      createdBy: actor.userId,
      updatedBy: actor.userId,
      createdAt: newDraft.createdAt,
      updatedAt: newDraft.updatedAt,
      labels: ["DRAFT"],
      tags: [],
    };
    this.versioningRepo.recordVersionHistory(historyItem);

    await this.auditService.recordAudit({
      actor,
      module: "LAYOUT_VERSIONING",
      action: "CREATE_DRAFT",
      description: `Draft layout version v${newDraft.versionNumber} created`,
      metadata: {
        versionId: newDraft.id,
        layoutDefinitionId,
      },
    });

    return newDraft;
  }

  // ----------------------------------------------------------------------------
  // 3. Deep Version Comparison
  // ----------------------------------------------------------------------------

  public async compareVersions(
    actor: SecurityActorContext,
    sourceVersionId: string,
    targetVersionId: string,
    theatreId: string
  ): Promise<VersionComparisonDiff> {
    this.assertTenantAccess(actor, theatreId);

    const policy = this.versioningRepo.getVersionPolicy(theatreId);
    if (!policy.compareEnabled) {
      throw new ConflictError("Version comparison is disabled by theatre version policy.");
    }

    // Check cache first
    const cached = this.versioningRepo.getComparisonDiff(sourceVersionId, targetVersionId, theatreId);
    if (cached) return cached;

    const sourceVer = this.designerRepo.getLayoutVersionById(sourceVersionId, theatreId);
    if (!sourceVer) {
      throw new NotFoundError(`Source version '${sourceVersionId}' not found.`);
    }

    const targetVer = this.designerRepo.getLayoutVersionById(targetVersionId, theatreId);
    if (!targetVer) {
      throw new NotFoundError(`Target version '${targetVersionId}' not found.`);
    }

    const sourceStructural = await this.structuralRepo.listByLayoutVersion(theatreId, sourceVersionId);
    const targetStructural = await this.structuralRepo.listByLayoutVersion(theatreId, targetVersionId);

    const diff = VersionComparisonEngine.compareVersions(
      sourceVer,
      targetVer,
      sourceStructural,
      targetStructural
    );

    this.versioningRepo.saveComparisonDiff(diff);
    return diff;
  }

  // ----------------------------------------------------------------------------
  // 4. Safe Rollback
  // ----------------------------------------------------------------------------

  public async rollbackVersion(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    targetVersionId: string,
    theatreId: string,
    notes: string
  ): Promise<RollbackResult> {
    this.assertTenantAccess(actor, theatreId);

    const policy = this.versioningRepo.getVersionPolicy(theatreId);
    if (!policy.rollbackEnabled) {
      throw new ConflictError("Layout rollback is disabled by theatre version policy.");
    }

    const targetVer = this.designerRepo.getLayoutVersionById(targetVersionId, theatreId);
    if (!targetVer) {
      throw new NotFoundError(`Target rollback version '${targetVersionId}' not found.`);
    }

    // Creating a new draft branch preserves full immutability!
    const newDraft = await this.createDraftVersion(
      actor,
      layoutDefinitionId,
      theatreId,
      notes || `Rollback derived from v${targetVer.versionNumber}`,
      targetVersionId
    );

    await this.auditService.recordAudit({
      actor,
      module: "LAYOUT_VERSIONING",
      action: "ROLLBACK",
      description: `Layout rolled back: created v${newDraft.versionNumber} from v${targetVer.versionNumber}`,
      metadata: {
        layoutDefinitionId,
        derivedFromVersionId: targetVersionId,
        newDraftVersionId: newDraft.id,
      },
    });

    return {
      success: true,
      newDraftVersionId: newDraft.id,
      newVersionNumber: newDraft.versionNumber,
      derivedFromVersionNumber: targetVer.versionNumber,
      timestamp: new Date().toISOString(),
      message: `Successfully rolled back to v${targetVer.versionNumber}. Created active draft v${newDraft.versionNumber}.`,
    };
  }

  public async duplicateVersion(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    sourceVersionId: string,
    theatreId: string,
    notes?: string
  ): Promise<LayoutVersion> {
    return this.createDraftVersion(
      actor,
      layoutDefinitionId,
      theatreId,
      notes || `Duplicate of version ${sourceVersionId}`,
      sourceVersionId
    );
  }

  public async archiveVersion(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    versionId: string,
    theatreId: string,
    notes?: string
  ): Promise<VersionHistoryItem> {
    this.assertTenantAccess(actor, theatreId);
    const ver = this.designerRepo.getLayoutVersionById(versionId, theatreId);
    if (!ver) {
      throw new NotFoundError(`Version '${versionId}' not found.`);
    }
    const now = new Date().toISOString();
    ver.status = "ARCHIVED";
    ver.archivedAt = now;
    ver.updatedAt = now;
    if (notes) ver.versionNotes = notes;

    const historyItem = this.versioningRepo.getVersionHistoryItem(versionId, theatreId);
    if (historyItem) {
      historyItem.status = "ARCHIVED";
      historyItem.archivedAt = now;
      historyItem.updatedAt = now;
      historyItem.isLocked = true;
      this.versioningRepo.recordVersionHistory(historyItem);
    }

    await this.auditService.recordAudit({
      actor,
      module: "LAYOUT_VERSIONING",
      action: "ARCHIVE_VERSION",
      description: `Layout version v${ver.versionNumber} archived`,
      metadata: { layoutDefinitionId, versionId },
    });

    const refreshed = await this.getVersionHistory(actor, layoutDefinitionId, theatreId);
    return refreshed.find((h) => h.id === versionId) || historyItem!;
  }

  public async restoreVersion(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    versionId: string,
    theatreId: string,
    notes?: string
  ): Promise<LayoutVersion> {
    this.assertTenantAccess(actor, theatreId);
    return this.createDraftVersion(
      actor,
      layoutDefinitionId,
      theatreId,
      notes || `Restored from version ${versionId}`,
      versionId
    );
  }

  // ----------------------------------------------------------------------------
  // 5. Change History Logging
  // ----------------------------------------------------------------------------

  public async recordChangeEvent(
    actor: SecurityActorContext,
    versionId: string,
    theatreId: string,
    params: {
      changeType: VersionChangeEvent["changeType"];
      entityType: VersionChangeEvent["entityType"];
      entityId?: string;
      description: string;
      beforeSnapshot?: Record<string, unknown>;
      afterSnapshot?: Record<string, unknown>;
    }
  ): Promise<VersionChangeEvent> {
    this.assertTenantAccess(actor, theatreId);

    const event: VersionChangeEvent = {
      id: `chg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      versionId,
      theatreId,
      changeType: params.changeType,
      entityType: params.entityType,
      entityId: params.entityId,
      description: params.description,
      actorId: actor.userId,
      timestamp: new Date().toISOString(),
      beforeSnapshot: params.beforeSnapshot,
      afterSnapshot: params.afterSnapshot,
    };

    this.versioningRepo.recordChangeEvent(event);
    return event;
  }

  public async getChangeEvents(
    actor: SecurityActorContext,
    versionId: string,
    theatreId: string
  ): Promise<VersionChangeEvent[]> {
    this.assertTenantAccess(actor, theatreId);
    return this.versioningRepo.getChangeEvents(versionId, theatreId);
  }

  // ----------------------------------------------------------------------------
  // 6. Multi-Tenant Version Policies
  // ----------------------------------------------------------------------------

  public async getVersionPolicy(
    actor: SecurityActorContext,
    theatreId: string
  ): Promise<VersionPolicy> {
    this.assertTenantAccess(actor, theatreId);
    return this.versioningRepo.getVersionPolicy(theatreId);
  }

  public async saveVersionPolicy(
    actor: SecurityActorContext,
    theatreId: string,
    updates: Partial<VersionPolicy>
  ): Promise<VersionPolicy> {
    this.assertTenantAccess(actor, theatreId);
    this.assertAdminRole(actor);

    const policy = this.versioningRepo.updateVersionPolicy(theatreId, updates);

    await this.auditService.recordAudit({
      actor,
      module: "LAYOUT_VERSIONING",
      action: "SAVE_POLICY",
      description: `Version policy updated for theatre '${theatreId}'`,
      metadata: { theatreId },
    });

    return policy;
  }

  // ----------------------------------------------------------------------------
  // Security Checks
  // ----------------------------------------------------------------------------

  private assertTenantAccess(actor: SecurityActorContext, theatreId: string): void {
    if (actor.role === "SUPER_ADMIN") return;
    if (actor.theatreId !== theatreId) {
      throw new TenantAccessError(
        `Security Violation: User '${actor.userId}' cannot access layout versions for theatre '${theatreId}'.`
      );
    }
  }

  private assertAdminRole(actor: SecurityActorContext): void {
    if (actor.role !== "SUPER_ADMIN" && actor.role !== "THEATRE_ADMIN") {
      throw new AuthorizationError(
        `Action forbidden: Only administrators can modify layout versioning governance policies.`
      );
    }
  }
}

export const layoutVersioningService = LayoutVersioningService.getInstance();
