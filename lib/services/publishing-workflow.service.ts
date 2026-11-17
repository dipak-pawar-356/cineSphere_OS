/**
 * ==============================================================================
 * CineSphere OS — Publishing Workflow Service (Phase 4 – Part 12)
 * ==============================================================================
 * Enterprise domain service for the atomic layout publishing pipeline, preflight
 * audit gates, version locking, and the Show Compatibility Layer.
 * ==============================================================================
 */

import { SecurityActorContext } from "@/types/security-hardening.types";
import {
  PublishVersionPayload,
  PublishResult,
  PublishingConfiguration,
  PublishingHistoryEntry,
  PublishingStatusRecord,
  ShowLayoutAssignment,
  ShowMigrationRequest,
  ShowMigrationResult,
} from "@/types/publishing-workflow.types";
import { LayoutVersion, LayoutDefinition } from "@/types/hall-designer.types";
import { PublishingWorkflowRepository } from "@/lib/repositories/publishing-workflow.repository";
import { HallDesignerRepository } from "@/lib/repositories/hall-designer.repository";
import { structuralObjectRepository } from "@/lib/repositories/structural-object.repository";
import { LayoutVersioningRepository } from "@/lib/repositories/layout-versioning.repository";
import { HallValidationService } from "@/lib/services/hall-validation.service";
import { PublishingPipelineEngine } from "@/lib/engine/publishing-pipeline-engine";
import { securityAuditService } from "@/lib/services/security-audit.service";
import {
  TenantAccessError,
  NotFoundError,
  ValidationError,
  AuthorizationError,
} from "@/lib/errors/app-error";

export class PublishingWorkflowService {
  private static instance: PublishingWorkflowService | null = null;
  private publishingRepo = PublishingWorkflowRepository.getInstance();
  private designerRepo = HallDesignerRepository.getInstance();
  private structuralRepo = structuralObjectRepository;
  private versioningRepo = LayoutVersioningRepository.getInstance();
  private validationService = HallValidationService.getInstance();
  private auditService = securityAuditService;

  private constructor() {}

  public static getInstance(): PublishingWorkflowService {
    if (!PublishingWorkflowService.instance) {
      PublishingWorkflowService.instance = new PublishingWorkflowService();
    }
    return PublishingWorkflowService.instance;
  }

  // ----------------------------------------------------------------------------
  // 1. Atomic Publishing Pipeline
  // ----------------------------------------------------------------------------

  public async publishVersion(
    actor: SecurityActorContext,
    payload: PublishVersionPayload
  ): Promise<PublishResult> {
    const { theatreId, layoutDefinitionId, versionId, publishNotes } = payload;
    this.assertTenantAccess(actor, theatreId);

    const config = this.publishingRepo.getPublishingConfig(theatreId);
    if (!config.allowedRolesToPublish.includes(actor.role)) {
      throw new AuthorizationError(
        `Role '${actor.role}' is not authorized to publish layouts for theatre '${theatreId}'.`
      );
    }

    if (config.requirePublishNotes && (!publishNotes || publishNotes.trim() === "")) {
      throw new ValidationError("Theatre publishing configuration requires mandatory release notes.");
    }

    const layoutDef = this.designerRepo.getLayoutDefinitionById(layoutDefinitionId, theatreId);
    if (!layoutDef) {
      throw new NotFoundError(`Layout definition '${layoutDefinitionId}' not found.`);
    }

    const version = this.designerRepo.getLayoutVersionById(versionId, theatreId);
    if (!version || version.layoutDefinitionId !== layoutDefinitionId) {
      throw new NotFoundError(
        `Layout version '${versionId}' does not belong to definition '${layoutDefinitionId}'.`
      );
    }

    const structuralObjects = await this.structuralRepo.listByLayoutVersion(theatreId, versionId);

    // 1. Execute Validation Engine Preflight Gate
    const validationReport = await this.validationService.runValidation(
      actor,
      versionId,
      theatreId
    );

    // 2. Evaluate Pipeline Checklist
    const preflight = PublishingPipelineEngine.evaluatePreflightChecklist({
      layoutDef,
      version,
      structuralObjects,
      validationReport,
      config,
    });

    if (!preflight.canPublish) {
      throw new ValidationError(
        `Publishing Rejected: Preflight checklist failed with ${preflight.blockingReasons.length} issue(s): ${preflight.blockingReasons.join("; ")}`
      );
    }

    const previousVersionId = layoutDef.currentPublishedVersionId;
    let previousVersionNumber: number | undefined;
    if (previousVersionId) {
      const prev = this.designerRepo.getLayoutVersionById(previousVersionId, theatreId);
      if (prev) previousVersionNumber = prev.versionNumber;
    }

    // 3. Execute Atomic Publish Transaction
    const { definition: updatedDef, publishedVersion } = this.designerRepo.publishLayoutVersion(
      layoutDefinitionId,
      versionId,
      theatreId,
      actor
    );

    // 4. Update Versioning Registry Status
    this.versioningRepo.updateVersionStatus(versionId, "PUBLISHED", theatreId, actor.userId);
    if (previousVersionId && previousVersionId !== versionId) {
      this.versioningRepo.updateVersionStatus(previousVersionId, "ARCHIVED", theatreId, actor.userId);
    }

    // 5. Record Publishing History Entry
    const now = new Date().toISOString();
    const historyEntry: PublishingHistoryEntry = {
      id: `pub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      theatreId,
      layoutDefinitionId,
      versionId,
      versionNumber: publishedVersion.versionNumber,
      previousVersionId,
      previousVersionNumber,
      publishedBy: actor.userId,
      publishedAt: now,
      publishNotes,
      validationSummary: {
        errorsCount: validationReport.summary.errorsCount,
        warningsCount: validationReport.summary.warningsCount,
        canPublish: validationReport.canPublish,
      },
      policyApplied: validationReport.policyApplied.level,
      isScheduled: false,
    };
    this.publishingRepo.recordPublishHistory(historyEntry);

    // 6. Update Publishing Live Status Record
    const statusRecord: PublishingStatusRecord = {
      layoutDefinitionId,
      theatreId,
      hallId: layoutDef.hallId,
      currentPublishedVersionId: versionId,
      currentPublishedVersionNumber: publishedVersion.versionNumber,
      liveStatus: "ACTIVE",
      publishedAt: now,
      publishedBy: actor.userId,
      totalActiveShowsUsingThisLayout: 0,
      lastPublishNotes: publishNotes,
      isVersionLocked: true,
      updatedAt: now,
    };
    this.publishingRepo.updatePublishingStatus(statusRecord);

    // 7. Security Audit Logging
    await this.auditService.recordAudit({
      actor,
      module: "PUBLISHING_WORKFLOW",
      action: "PUBLISH_VERSION",
      description: `Layout version v${publishedVersion.versionNumber} published atomically`,
      metadata: {
        layoutDefinitionId,
        publishedVersionId: versionId,
        previousVersionId,
      },
    });

    return {
      success: true,
      layoutDefinitionId,
      publishedVersionId: versionId,
      publishedVersionNumber: publishedVersion.versionNumber,
      archivedVersionId: previousVersionId,
      archivedVersionNumber: previousVersionNumber,
      publishedAt: now,
      publishedBy: actor.userId,
      liveStatus: "ACTIVE",
      message: `Layout v${publishedVersion.versionNumber} successfully published. Active for all future shows.`,
    };
  }

  // ----------------------------------------------------------------------------
  // 2. Unpublish / Inactivate Version
  // ----------------------------------------------------------------------------

  public async unpublishVersion(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    theatreId: string,
    notes?: string
  ): Promise<PublishingStatusRecord> {
    this.assertTenantAccess(actor, theatreId);

    const statusRecord = this.publishingRepo.getPublishingStatus(layoutDefinitionId, theatreId);
    if (!statusRecord || !statusRecord.currentPublishedVersionId) {
      throw new NotFoundError(`No active published layout found for definition '${layoutDefinitionId}'.`);
    }

    const now = new Date().toISOString();
    statusRecord.liveStatus = "INACTIVE";
    statusRecord.lastPublishNotes = notes || "Unpublished from live status";
    statusRecord.updatedAt = now;

    this.publishingRepo.updatePublishingStatus(statusRecord);

    await this.auditService.recordAudit({
      actor,
      module: "PUBLISHING_WORKFLOW",
      action: "UNPUBLISH_VERSION",
      description: `Layout '${layoutDefinitionId}' unpublished and set to INACTIVE`,
      metadata: { layoutDefinitionId },
    });

    return statusRecord;
  }

  public async saveDraft(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    theatreId: string,
    notes?: string
  ): Promise<LayoutVersion> {
    this.assertTenantAccess(actor, theatreId);
    return this.designerRepo.createDraftVersion(
      layoutDefinitionId,
      theatreId,
      notes || "Draft saved",
      actor
    );
  }

  public async archivePublishVersion(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    theatreId: string,
    notes?: string
  ): Promise<PublishingStatusRecord> {
    return this.unpublishVersion(
      actor,
      layoutDefinitionId,
      theatreId,
      notes || "Archived from publishing pipeline"
    );
  }

  public async restorePublishVersion(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    targetVersionId: string,
    theatreId: string,
    notes?: string
  ): Promise<PublishResult> {
    return this.publishVersion(actor, {
      layoutDefinitionId,
      versionId: targetVersionId,
      theatreId,
      publishNotes: notes || `Restored and published version ${targetVersionId}`,
    });
  }

  // ----------------------------------------------------------------------------
  // 3. Show Compatibility Layer Operations
  // ----------------------------------------------------------------------------

  /**
   * Automatically bind a newly scheduled show to the currently active published layout.
   */
  public async assignLayoutToShow(
    actor: SecurityActorContext,
    showId: string,
    hallId: string,
    theatreId: string
  ): Promise<ShowLayoutAssignment> {
    this.assertTenantAccess(actor, theatreId);

    // Check if show already has an immutable assignment
    const existing = this.publishingRepo.getLayoutAssignmentForShow(showId, theatreId);
    if (existing) {
      return existing;
    }

    const publishedVer = this.designerRepo.getPublishedLayoutForHall(hallId, theatreId);
    if (!publishedVer) {
      throw new ValidationError(
        `Cannot assign show: No active PUBLISHED layout version exists for auditorium '${hallId}'.`
      );
    }

    const assignment: ShowLayoutAssignment = {
      id: `sla-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      showId,
      theatreId,
      hallId,
      layoutDefinitionId: publishedVer.layoutDefinitionId,
      layoutVersionId: publishedVer.id,
      layoutVersionNumber: publishedVer.versionNumber,
      assignedAt: new Date().toISOString(),
      assignedBy: actor.userId,
      isMigrated: false,
    };

    this.publishingRepo.assignLayoutToShow(assignment);

    await this.auditService.recordAudit({
      actor,
      module: "SHOW_COMPATIBILITY",
      action: "ASSIGN_LAYOUT",
      description: `Show '${showId}' bound to layout version v${publishedVer.versionNumber}`,
      metadata: {
        showId,
        versionId: publishedVer.id,
      },
    });

    return assignment;
  }

  /**
   * Retrieve the exact layout version a show was created with.
   * Guarantees historical shows and bookings preserve their seat map.
   */
  public async getLayoutForShow(
    actor: SecurityActorContext,
    showId: string,
    theatreId: string
  ): Promise<LayoutVersion> {
    this.assertTenantAccess(actor, theatreId);

    const assignment = this.publishingRepo.getLayoutAssignmentForShow(showId, theatreId);
    if (!assignment) {
      throw new NotFoundError(`No layout assignment found for show '${showId}'.`);
    }

    const version = this.designerRepo.getLayoutVersionById(assignment.layoutVersionId, theatreId);
    if (!version) {
      throw new NotFoundError(
        `Historical layout version '${assignment.layoutVersionId}' could not be located in registry.`
      );
    }

    return version;
  }

  /**
   * Explicitly migrate an existing show to a newer published layout version.
   */
  public async migrateShowLayout(
    actor: SecurityActorContext,
    request: ShowMigrationRequest,
    bookedSeatsCount = 0
  ): Promise<ShowMigrationResult> {
    const { showId, theatreId, targetLayoutVersionId, migrationReason } = request;
    this.assertTenantAccess(actor, theatreId);

    const currentAssignment = this.publishingRepo.getLayoutAssignmentForShow(showId, theatreId);
    if (!currentAssignment) {
      throw new NotFoundError(`Show '${showId}' does not have an active layout assignment.`);
    }

    const targetVer = this.designerRepo.getLayoutVersionById(targetLayoutVersionId, theatreId);
    if (!targetVer) {
      throw new NotFoundError(`Target layout version '${targetLayoutVersionId}' not found.`);
    }

    // Validate migration safety
    PublishingPipelineEngine.validateShowMigration({
      currentAssignment,
      targetVersion: targetVer,
      bookedSeatsCount,
    });

    const result = this.publishingRepo.migrateShowLayout({
      showId,
      theatreId,
      targetVersionId: targetVer.id,
      targetVersionNumber: targetVer.versionNumber,
      reason: migrationReason,
      actorId: actor.userId,
    });

    await this.auditService.recordAudit({
      actor,
      module: "SHOW_COMPATIBILITY",
      action: "MIGRATE_SHOW_LAYOUT",
      description: `Show '${showId}' migrated to layout v${targetVer.versionNumber}`,
      metadata: {
        showId,
        previousVersionId: result.previousVersionId,
        newVersionId: result.newVersionId,
      },
    });

    return result;
  }

  // ----------------------------------------------------------------------------
  // 4. Publishing Queries & Configurations
  // ----------------------------------------------------------------------------

  public async getPublishingStatus(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    theatreId: string
  ): Promise<PublishingStatusRecord | undefined> {
    this.assertTenantAccess(actor, theatreId);
    return this.publishingRepo.getPublishingStatus(layoutDefinitionId, theatreId);
  }

  public async getPublishHistory(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    theatreId: string
  ): Promise<PublishingHistoryEntry[]> {
    this.assertTenantAccess(actor, theatreId);
    return this.publishingRepo.getPublishHistory(layoutDefinitionId, theatreId);
  }

  public async getPublishingConfig(
    actor: SecurityActorContext,
    theatreId: string
  ): Promise<PublishingConfiguration> {
    this.assertTenantAccess(actor, theatreId);
    return this.publishingRepo.getPublishingConfig(theatreId);
  }

  public async savePublishingConfig(
    actor: SecurityActorContext,
    theatreId: string,
    updates: Partial<PublishingConfiguration>
  ): Promise<PublishingConfiguration> {
    this.assertTenantAccess(actor, theatreId);
    if (actor.role !== "SUPER_ADMIN" && actor.role !== "THEATRE_ADMIN") {
      throw new AuthorizationError("Only administrators can update publishing configurations.");
    }

    const updated = this.publishingRepo.updatePublishingConfig(theatreId, updates);

    await this.auditService.recordAudit({
      actor,
      module: "PUBLISHING_WORKFLOW",
      action: "SAVE_CONFIG",
      description: `Publishing configuration updated for theatre '${theatreId}'`,
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
        `Security Violation: User '${actor.userId}' cannot perform publishing operations for theatre '${theatreId}'.`
      );
    }
  }
}

export const publishingWorkflowService = PublishingWorkflowService.getInstance();
