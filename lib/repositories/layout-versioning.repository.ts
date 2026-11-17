/**
 * ==============================================================================
 * CineSphere OS — Layout Versioning Repository (Phase 4 – Part 11)
 * ==============================================================================
 * Dedicated multi-tenant repository managing immutable layout version registries,
 * change history logs, deep comparison diff caches, and per-theatre version policies.
 * ==============================================================================
 */

import {
  VersionHistoryItem,
  VersionChangeEvent,
  VersionComparisonDiff,
  VersionPolicy,
  VersionLifecycleStatus,
  VersionMetadataItem,
} from "@/types/layout-versioning.types";
import { TenantAccessError, NotFoundError } from "@/lib/errors/app-error";

export class LayoutVersioningRepository {
  private static instance: LayoutVersioningRepository | null = null;

  // In-memory multi-tenant storage
  private historyItems: Map<string, VersionHistoryItem> = new Map();
  private comparisons: Map<string, VersionComparisonDiff> = new Map();
  private changeEvents: Map<string, VersionChangeEvent[]> = new Map();
  private policies: Map<string, VersionPolicy> = new Map();
  private metadataItems: Map<string, VersionMetadataItem> = new Map();

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): LayoutVersioningRepository {
    if (!LayoutVersioningRepository.instance) {
      LayoutVersioningRepository.instance = new LayoutVersioningRepository();
    }
    return LayoutVersioningRepository.instance;
  }

  // ----------------------------------------------------------------------------
  // 1. Version History Items
  // ----------------------------------------------------------------------------

  public getVersionHistory(layoutDefinitionId: string, theatreId: string): VersionHistoryItem[] {
    return Array.from(this.historyItems.values())
      .filter((h) => h.layoutDefinitionId === layoutDefinitionId && h.theatreId === theatreId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  }

  public getVersionHistoryItem(versionId: string, theatreId: string): VersionHistoryItem | undefined {
    const item = this.historyItems.get(versionId);
    if (!item) return undefined;
    if (item.theatreId !== theatreId) {
      throw new TenantAccessError(`Version '${versionId}' does not belong to theatre '${theatreId}'.`);
    }
    return item;
  }

  public recordVersionHistory(item: VersionHistoryItem): void {
    this.historyItems.set(item.id, item);
  }

  public updateVersionStatus(
    versionId: string,
    status: VersionLifecycleStatus,
    theatreId: string,
    actorId: string
  ): VersionHistoryItem {
    const item = this.getVersionHistoryItem(versionId, theatreId);
    if (!item) {
      throw new NotFoundError(`Version '${versionId}' not found in registry.`);
    }

    const now = new Date().toISOString();
    item.status = status;
    item.updatedBy = actorId;
    item.updatedAt = now;

    if (status === "PUBLISHED") {
      item.publishedAt = now;
      item.publishedBy = actorId;
      item.isLocked = true;
    } else if (status === "ARCHIVED") {
      item.archivedAt = now;
      item.isLocked = true;
    }

    return item;
  }

  // ----------------------------------------------------------------------------
  // 2. Change History Log
  // ----------------------------------------------------------------------------

  public recordChangeEvent(event: VersionChangeEvent): void {
    const existing = this.changeEvents.get(event.versionId) || [];
    existing.unshift(event);
    this.changeEvents.set(event.versionId, existing);
  }

  public getChangeEvents(versionId: string, theatreId: string): VersionChangeEvent[] {
    const events = this.changeEvents.get(versionId) || [];
    return events.filter((e) => e.theatreId === theatreId);
  }

  // ----------------------------------------------------------------------------
  // 3. Comparison Diff Cache
  // ----------------------------------------------------------------------------

  public saveComparisonDiff(diff: VersionComparisonDiff): void {
    const key = `${diff.theatreId}:${diff.sourceVersionId}:${diff.targetVersionId}`;
    this.comparisons.set(key, diff);
  }

  public getComparisonDiff(
    sourceVersionId: string,
    targetVersionId: string,
    theatreId: string
  ): VersionComparisonDiff | undefined {
    const key = `${theatreId}:${sourceVersionId}:${targetVersionId}`;
    return this.comparisons.get(key);
  }

  // ----------------------------------------------------------------------------
  // 4. Per-Theatre Version Policies
  // ----------------------------------------------------------------------------

  public getVersionPolicy(theatreId: string): VersionPolicy {
    const policy = this.policies.get(theatreId);
    if (!policy) {
      // Default standard policy
      const standard: VersionPolicy = {
        theatreId,
        maxVersionsAllowed: 50,
        rollbackEnabled: true,
        compareEnabled: true,
        versionNotesRequired: false,
        autoPruneArchivedDrafts: false,
        approvalRequired: false,
        allowedLabels: ["STABLE", "RC", "DRAFT", "ARCHIVED"],
        updatedAt: new Date().toISOString(),
      };
      this.policies.set(theatreId, standard);
      return standard;
    }
    return policy;
  }

  public updateVersionPolicy(theatreId: string, updates: Partial<VersionPolicy>): VersionPolicy {
    const current = this.getVersionPolicy(theatreId);
    const updated: VersionPolicy = {
      ...current,
      ...updates,
      theatreId,
      updatedAt: new Date().toISOString(),
    };
    this.policies.set(theatreId, updated);
    return updated;
  }

  // ----------------------------------------------------------------------------
  // 5. Version Metadata Store
  // ----------------------------------------------------------------------------

  public getVersionMetadata(versionId: string, theatreId: string): VersionMetadataItem | undefined {
    const item = this.metadataItems.get(versionId);
    if (!item) return undefined;
    if (item.theatreId !== theatreId) {
      throw new TenantAccessError(`Version metadata '${versionId}' does not belong to theatre '${theatreId}'.`);
    }
    return item;
  }

  public saveVersionMetadata(metadata: VersionMetadataItem): VersionMetadataItem {
    this.metadataItems.set(metadata.versionId, metadata);
    return metadata;
  }

  // ----------------------------------------------------------------------------
  // Multi-Tenant Initial Seed Data
  // ----------------------------------------------------------------------------

  private seedInitialData(): void {
    // 1. Pune Galaxy Multiplex (th-pun-001) - Strict Policy (50 Max, Rollback ON, Compare ON)
    this.policies.set("th-pun-001", {
      theatreId: "th-pun-001",
      maxVersionsAllowed: 50,
      rollbackEnabled: true,
      compareEnabled: true,
      versionNotesRequired: false,
      autoPruneArchivedDrafts: false,
      approvalRequired: false,
      allowedLabels: ["STABLE", "HOTFIX", "DRAFT", "IMAX"],
      updatedAt: "2026-11-16T00:00:00Z",
    });

    // 2. Mumbai IMAX (th-mum-002) - Standard Policy (20 Max, Rollback OFF, Notes Required)
    this.policies.set("th-mum-002", {
      theatreId: "th-mum-002",
      maxVersionsAllowed: 20,
      rollbackEnabled: false,
      compareEnabled: true,
      versionNotesRequired: true,
      autoPruneArchivedDrafts: true,
      approvalRequired: false,
      allowedLabels: ["STANDARD", "PRODUCTION", "REVIEW"],
      updatedAt: "2026-11-16T00:00:00Z",
    });

    // 3. Dubai Grand Mall (th-dxb-003) - Luxury Policy (Unlimited, Approval Required)
    this.policies.set("th-dxb-003", {
      theatreId: "th-dxb-003",
      maxVersionsAllowed: 0, // unlimited
      rollbackEnabled: true,
      compareEnabled: true,
      versionNotesRequired: true,
      autoPruneArchivedDrafts: false,
      approvalRequired: true,
      allowedLabels: ["LUXURY", "VIP_GOLD", "CIVIL_DEFENSE_APPROVED"],
      updatedAt: "2026-11-16T00:00:00Z",
    });

    // Seed existing v3 and v2 for Pune
    this.historyItems.set("ver-layout-pun-aud1-main-v3", {
      id: "ver-layout-pun-aud1-main-v3",
      layoutDefinitionId: "layout-pun-aud1-main",
      theatreId: "th-pun-001",
      versionNumber: 3,
      name: "Pune Hall 1 Main Layout (v3 Live)",
      status: "PUBLISHED",
      versionNotes: "Added wheelchair bays and accessible routes",
      sourceVersionId: "ver-layout-pun-aud1-main-v2",
      sourceVersionNumber: 2,
      totalSeats: 100,
      totalSections: 2,
      totalStructuralObjects: 4,
      isLocked: true,
      createdBy: "usr-pune-admin",
      updatedBy: "usr-pune-admin",
      publishedBy: "usr-pune-admin",
      publishedAt: "2026-11-15T12:00:00Z",
      createdAt: "2026-11-15T10:00:00Z",
      updatedAt: "2026-11-15T12:00:00Z",
      labels: ["STABLE", "LIVE"],
      tags: ["4K", "DolbyAtmos"],
    });

    this.historyItems.set("ver-layout-pun-aud1-main-v2", {
      id: "ver-layout-pun-aud1-main-v2",
      layoutDefinitionId: "layout-pun-aud1-main",
      theatreId: "th-pun-001",
      versionNumber: 2,
      name: "Pune Hall 1 Main Layout (v2 Archive)",
      status: "ARCHIVED",
      versionNotes: "Previous production layout prior to accessibility enhancements",
      sourceVersionId: "ver-layout-pun-aud1-main-v1",
      sourceVersionNumber: 1,
      totalSeats: 100,
      totalSections: 2,
      totalStructuralObjects: 2,
      isLocked: true,
      createdBy: "usr-pune-admin",
      updatedBy: "usr-pune-admin",
      publishedBy: "usr-pune-admin",
      publishedAt: "2026-10-01T08:00:00Z",
      archivedAt: "2026-11-15T12:00:00Z",
      createdAt: "2026-10-01T06:00:00Z",
      updatedAt: "2026-11-15T12:00:00Z",
      labels: ["ARCHIVED"],
      tags: ["Legacy"],
    });
  }
}
