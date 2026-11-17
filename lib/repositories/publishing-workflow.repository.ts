/**
 * ==============================================================================
 * CineSphere OS — Publishing Workflow Repository (Phase 4 – Part 12)
 * ==============================================================================
 * Multi-tenant repository managing layout publishing configurations, immutable
 * publish audit history logs, live status pointers, and the Show Compatibility Layer.
 * ==============================================================================
 */

import {
  PublishingConfiguration,
  PublishingHistoryEntry,
  PublishingStatusRecord,
  ShowLayoutAssignment,
  ShowMigrationResult,
} from "@/types/publishing-workflow.types";
import { TenantAccessError, NotFoundError } from "@/lib/errors/app-error";

export class PublishingWorkflowRepository {
  private static instance: PublishingWorkflowRepository | null = null;

  // In-memory multi-tenant storage
  private configs: Map<string, PublishingConfiguration> = new Map();
  private publishHistory: Map<string, PublishingHistoryEntry[]> = new Map();
  private statuses: Map<string, PublishingStatusRecord> = new Map();
  private showAssignments: Map<string, ShowLayoutAssignment> = new Map();

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): PublishingWorkflowRepository {
    if (!PublishingWorkflowRepository.instance) {
      PublishingWorkflowRepository.instance = new PublishingWorkflowRepository();
    }
    return PublishingWorkflowRepository.instance;
  }

  // ----------------------------------------------------------------------------
  // 1. Publishing Configurations
  // ----------------------------------------------------------------------------

  public getPublishingConfig(theatreId: string): PublishingConfiguration {
    const config = this.configs.get(theatreId);
    if (!config) {
      const standard: PublishingConfiguration = {
        theatreId,
        instantPublishEnabled: true,
        approvalRequired: false,
        scheduledPublishEnabled: false,
        rollbackEnabled: true,
        publishWindow: "ANYTIME",
        allowedRolesToPublish: ["SUPER_ADMIN", "THEATRE_ADMIN"],
        requirePublishNotes: false,
        notifyOnPublish: true,
        updatedAt: new Date().toISOString(),
      };
      this.configs.set(theatreId, standard);
      return standard;
    }
    return config;
  }

  public updatePublishingConfig(
    theatreId: string,
    updates: Partial<PublishingConfiguration>
  ): PublishingConfiguration {
    const current = this.getPublishingConfig(theatreId);
    const updated: PublishingConfiguration = {
      ...current,
      ...updates,
      theatreId,
      updatedAt: new Date().toISOString(),
    };
    this.configs.set(theatreId, updated);
    return updated;
  }

  // ----------------------------------------------------------------------------
  // 2. Publishing History Log
  // ----------------------------------------------------------------------------

  public recordPublishHistory(entry: PublishingHistoryEntry): void {
    const existing = this.publishHistory.get(entry.layoutDefinitionId) || [];
    existing.unshift(entry);
    this.publishHistory.set(entry.layoutDefinitionId, existing);
  }

  public getPublishHistory(layoutDefinitionId: string, theatreId: string): PublishingHistoryEntry[] {
    const list = this.publishHistory.get(layoutDefinitionId) || [];
    return list.filter((h) => h.theatreId === theatreId);
  }

  // ----------------------------------------------------------------------------
  // 3. Publishing Live Status
  // ----------------------------------------------------------------------------

  public getPublishingStatus(layoutDefinitionId: string, theatreId: string): PublishingStatusRecord | undefined {
    const record = this.statuses.get(layoutDefinitionId);
    if (!record) return undefined;
    if (record.theatreId !== theatreId) {
      throw new TenantAccessError(`Layout '${layoutDefinitionId}' does not belong to theatre '${theatreId}'.`);
    }
    return record;
  }

  public updatePublishingStatus(record: PublishingStatusRecord): PublishingStatusRecord {
    this.statuses.set(record.layoutDefinitionId, record);
    return record;
  }

  // ----------------------------------------------------------------------------
  // 4. Show Compatibility Layer
  // ----------------------------------------------------------------------------

  public assignLayoutToShow(assignment: ShowLayoutAssignment): ShowLayoutAssignment {
    this.showAssignments.set(assignment.showId, assignment);
    return assignment;
  }

  public getLayoutAssignmentForShow(showId: string, theatreId: string): ShowLayoutAssignment | undefined {
    const assignment = this.showAssignments.get(showId);
    if (!assignment) return undefined;
    if (assignment.theatreId !== theatreId) {
      throw new TenantAccessError(`Show '${showId}' does not belong to theatre '${theatreId}'.`);
    }
    return assignment;
  }

  public listShowAssignmentsForVersion(versionId: string, theatreId: string): ShowLayoutAssignment[] {
    return Array.from(this.showAssignments.values()).filter(
      (a) => a.layoutVersionId === versionId && a.theatreId === theatreId
    );
  }

  public migrateShowLayout(params: {
    showId: string;
    theatreId: string;
    targetVersionId: string;
    targetVersionNumber: number;
    reason: string;
    actorId: string;
  }): ShowMigrationResult {
    const { showId, theatreId, targetVersionId, targetVersionNumber, reason, actorId } = params;
    const assignment = this.getLayoutAssignmentForShow(showId, theatreId);
    if (!assignment) {
      throw new NotFoundError(`No layout assignment found for show '${showId}'.`);
    }

    const previousVersionId = assignment.layoutVersionId;
    const now = new Date().toISOString();

    assignment.layoutVersionId = targetVersionId;
    assignment.layoutVersionNumber = targetVersionNumber;
    assignment.isMigrated = true;
    assignment.migratedAt = now;
    assignment.migratedBy = actorId;
    assignment.migrationNotes = reason;

    return {
      success: true,
      showId,
      previousVersionId,
      newVersionId: targetVersionId,
      migratedAt: now,
      message: `Show '${showId}' successfully migrated from v${previousVersionId} to v${targetVersionNumber}.`,
    };
  }

  // ----------------------------------------------------------------------------
  // Multi-Tenant Seed Data
  // ----------------------------------------------------------------------------

  private seedInitialData(): void {
    // 1. Pune Galaxy Multiplex (th-pun-001) - Instant Publish Enabled, Rollback Enabled
    this.configs.set("th-pun-001", {
      theatreId: "th-pun-001",
      instantPublishEnabled: true,
      approvalRequired: false,
      scheduledPublishEnabled: false,
      rollbackEnabled: true,
      publishWindow: "ANYTIME",
      allowedRolesToPublish: ["SUPER_ADMIN", "THEATRE_ADMIN"],
      requirePublishNotes: false,
      notifyOnPublish: true,
      updatedAt: "2026-11-16T00:00:00Z",
    });

    // 2. Mumbai IMAX (th-mum-002) - Approval Required, Business Hours Publish Window
    this.configs.set("th-mum-002", {
      theatreId: "th-mum-002",
      instantPublishEnabled: false,
      approvalRequired: true,
      scheduledPublishEnabled: false,
      rollbackEnabled: false,
      publishWindow: "BUSINESS_HOURS",
      allowedRolesToPublish: ["SUPER_ADMIN", "THEATRE_ADMIN"],
      requirePublishNotes: true,
      notifyOnPublish: true,
      updatedAt: "2026-11-16T00:00:00Z",
    });

    // 3. Dubai Grand Mall (th-dxb-003) - Scheduled Publish, Approval Required, Rollback Enabled
    this.configs.set("th-dxb-003", {
      theatreId: "th-dxb-003",
      instantPublishEnabled: false,
      approvalRequired: true,
      scheduledPublishEnabled: true,
      rollbackEnabled: true,
      publishWindow: "OFF_PEAK",
      allowedRolesToPublish: ["SUPER_ADMIN"],
      requirePublishNotes: true,
      notifyOnPublish: true,
      updatedAt: "2026-11-16T00:00:00Z",
    });

    // Seed Pune layout publishing status
    this.statuses.set("layout-pun-aud1-main", {
      layoutDefinitionId: "layout-pun-aud1-main",
      theatreId: "th-pun-001",
      hallId: "hall-pun-aud1",
      currentPublishedVersionId: "ver-layout-pun-aud1-main-v3",
      currentPublishedVersionNumber: 3,
      liveStatus: "ACTIVE",
      publishedAt: "2026-11-15T12:00:00Z",
      publishedBy: "usr-pune-admin",
      totalActiveShowsUsingThisLayout: 3,
      lastPublishNotes: "Added wheelchair bays and accessible routes",
      isVersionLocked: true,
      updatedAt: "2026-11-15T12:00:00Z",
    });

    // Seed publish history for Pune
    this.publishHistory.set("layout-pun-aud1-main", [
      {
        id: "pub-hist-1",
        theatreId: "th-pun-001",
        layoutDefinitionId: "layout-pun-aud1-main",
        versionId: "ver-layout-pun-aud1-main-v3",
        versionNumber: 3,
        previousVersionId: "ver-layout-pun-aud1-main-v2",
        previousVersionNumber: 2,
        publishedBy: "usr-pune-admin",
        publishedAt: "2026-11-15T12:00:00Z",
        publishNotes: "Added wheelchair bays and accessible routes",
        validationSummary: { errorsCount: 0, warningsCount: 0, canPublish: true },
        policyApplied: "STRICT",
        isScheduled: false,
      },
      {
        id: "pub-hist-2",
        theatreId: "th-pun-001",
        layoutDefinitionId: "layout-pun-aud1-main",
        versionId: "ver-layout-pun-aud1-main-v2",
        versionNumber: 2,
        previousVersionId: "ver-layout-pun-aud1-main-v1",
        previousVersionNumber: 1,
        publishedBy: "usr-pune-admin",
        publishedAt: "2026-10-01T08:00:00Z",
        publishNotes: "Initial production rollout",
        validationSummary: { errorsCount: 0, warningsCount: 0, canPublish: true },
        policyApplied: "STRICT",
        isScheduled: false,
      },
    ]);

    // Seed show layout assignments (Show Compatibility Layer)
    // Existing show 1 bound to v2
    this.showAssignments.set("show-pun-morning-legacy", {
      id: "sla-1",
      showId: "show-pun-morning-legacy",
      theatreId: "th-pun-001",
      hallId: "hall-pun-aud1",
      layoutDefinitionId: "layout-pun-aud1-main",
      layoutVersionId: "ver-layout-pun-aud1-main-v2",
      layoutVersionNumber: 2,
      assignedAt: "2026-10-10T10:00:00Z",
      assignedBy: "usr-pune-admin",
      isMigrated: false,
    });

    // Existing show 2 bound to v3
    this.showAssignments.set("show-pun-evening-current", {
      id: "sla-2",
      showId: "show-pun-evening-current",
      theatreId: "th-pun-001",
      hallId: "hall-pun-aud1",
      layoutDefinitionId: "layout-pun-aud1-main",
      layoutVersionId: "ver-layout-pun-aud1-main-v3",
      layoutVersionNumber: 3,
      assignedAt: "2026-11-16T09:00:00Z",
      assignedBy: "usr-pune-admin",
      isMigrated: false,
    });
  }
}
