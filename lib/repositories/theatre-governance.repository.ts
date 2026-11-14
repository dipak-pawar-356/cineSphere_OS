/**
 * ==============================================================================
 * CineSphere OS — Theatre Security & Governance Repository (Phase 3 – Part 14)
 * ==============================================================================
 * Central in-memory repository providing platform-wide persistence for:
 * 1. Theatre-Specific Security Configurations (Upload limits, Staff quotas, OCC versions)
 * 2. Cross-Module Resource Ownership Mapping & Validation
 * 3. Optimistic Concurrency Control (OCC) & ETag Version Registry
 * 4. Enterprise Soft Delete & Non-Destructive Restoration Registry
 * 5. Chronological Activity History Ledger
 * 6. Domain Security Events & Compliance Audit Storage
 * ==============================================================================
 */

import {
  TheatreSecurityConfiguration,
  ResourceOwnershipRecord,
  ResourceVersionRecord,
  SoftDeletableEntity,
  ActivityHistoryRecord,
  ActivityHistoryFilter,
  DomainSecurityEvent,
} from "@/types/theatre-security-governance.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { ConflictError, NotFoundError, OwnershipError } from "@/lib/errors/app-error";
import { securityMonitoringHooks } from "@/lib/security/monitoring-hooks";

// ------------------------------------------------------------------------------
// Seeded Theatre-Specific Security Configurations
// ------------------------------------------------------------------------------
const DEFAULT_THEATRE_SECURITY_CONFIGS: Record<string, TheatreSecurityConfiguration> = {
  // Theatre A: Pune Flagship
  "th-pun-001": {
    theatreId: "th-pun-001",
    mediaUploadLimitMb: 20,
    maxStaffCount: 100,
    configurationVersion: 12,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "video/mp4"],
    requireMfaForSensitiveActions: true,
    maxActiveSessions: 10,
    softDeleteRetentionDays: 30,
  },
  // Theatre B: Mumbai Luxury
  "th-mum-001": {
    theatreId: "th-mum-001",
    mediaUploadLimitMb: 50,
    maxStaffCount: 300,
    configurationVersion: 35,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "video/mp4"],
    requireMfaForSensitiveActions: true,
    maxActiveSessions: 25,
    softDeleteRetentionDays: 90,
  },
  // Theatre C: Dubai Palms
  "th-dxb-001": {
    theatreId: "th-dxb-001",
    mediaUploadLimitMb: 10,
    maxStaffCount: 50,
    configurationVersion: 8,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    requireMfaForSensitiveActions: true,
    maxActiveSessions: 5,
    softDeleteRetentionDays: 15,
  },
};

export class TheatreGovernanceRepository {
  private configs: Map<string, TheatreSecurityConfiguration> = new Map();
  private ownerships: Map<string, ResourceOwnershipRecord> = new Map();
  private versions: Map<string, ResourceVersionRecord> = new Map();
  private softDeletes: Map<string, SoftDeletableEntity> = new Map();
  private activityHistory: ActivityHistoryRecord[] = [];
  private domainEvents: DomainSecurityEvent[] = [];

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData(): void {
    // 1. Seed Configurations
    for (const [id, config] of Object.entries(DEFAULT_THEATRE_SECURITY_CONFIGS)) {
      this.configs.set(id, { ...config });
    }

    // 2. Seed Initial Ownership & Versions
    const theatres = ["th-pun-001", "th-mum-001", "th-dxb-001", "th-del-001", "th-blr-001", "th-hyd-001", "th-kol-001", "th-goa-001"];
    const resourceTypes = [
      "THEATRE",
      "MEDIA",
      "CONTACT",
      "AMENITY",
      "BUSINESS_INFO",
      "OPERATING_HOURS",
      "CONFIGURATION",
      "STAFF",
      "HALL",
      "SHOW",
    ];

    theatres.forEach((thId) => {
      resourceTypes.forEach((resType) => {
        const resId = `${resType.toLowerCase()}-${thId}-primary`;
        const key = this.buildKey(thId, resType, resId);
        const config = this.configs.get(thId);
        const baseVersion = config?.configurationVersion || 1;

        // Register ownership
        this.ownerships.set(key, {
          resourceId: resId,
          resourceType: resType,
          ownerTenantId: thId,
          isDeleted: false,
          version: baseVersion,
        });

        // Register version
        this.versions.set(key, {
          resourceId: resId,
          resourceType: resType,
          theatreId: thId,
          version: baseVersion,
          eTagPlaceholder: `W/"v${baseVersion}-${thId}"`,
          updatedAt: new Date().toISOString(),
          updatedBy: "system-seed",
        });
      });
    });
  }

  private buildKey(theatreId: string, resourceType: string, resourceId: string): string {
    return `${theatreId}:${resourceType.toUpperCase()}:${resourceId}`;
  }

  // ----------------------------------------------------------------------------
  // 1. Theatre-Specific Security Configuration
  // ----------------------------------------------------------------------------

  public getSecurityConfiguration(theatreId: string): TheatreSecurityConfiguration {
    const existing = this.configs.get(theatreId);
    if (existing) {
      return { ...existing };
    }

    // Dynamic fallback for any newly created or custom theatre
    const dynamicConfig: TheatreSecurityConfiguration = {
      theatreId,
      mediaUploadLimitMb: 25,
      maxStaffCount: 150,
      configurationVersion: 1,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "video/mp4"],
      requireMfaForSensitiveActions: false,
      maxActiveSessions: 10,
      softDeleteRetentionDays: 30,
    };
    this.configs.set(theatreId, dynamicConfig);
    return { ...dynamicConfig };
  }

  public updateSecurityConfiguration(
    theatreId: string,
    updates: Partial<Omit<TheatreSecurityConfiguration, "theatreId">>
  ): TheatreSecurityConfiguration {
    const current = this.getSecurityConfiguration(theatreId);
    const updated: TheatreSecurityConfiguration = {
      ...current,
      ...updates,
      theatreId,
      configurationVersion: current.configurationVersion + 1,
    };
    this.configs.set(theatreId, updated);
    return { ...updated };
  }

  // ----------------------------------------------------------------------------
  // 2. Resource Ownership Management
  // ----------------------------------------------------------------------------

  public registerResourceOwnership(
    theatreId: string,
    resourceType: string,
    resourceId: string,
    initialVersion = 1
  ): ResourceOwnershipRecord {
    const key = this.buildKey(theatreId, resourceType, resourceId);
    const record: ResourceOwnershipRecord = {
      resourceId,
      resourceType: resourceType.toUpperCase(),
      ownerTenantId: theatreId,
      isDeleted: false,
      version: initialVersion,
    };
    this.ownerships.set(key, record);

    // Also initialize version tracking
    this.versions.set(key, {
      resourceId,
      resourceType: resourceType.toUpperCase(),
      theatreId,
      version: initialVersion,
      eTagPlaceholder: `W/"v${initialVersion}-${theatreId}"`,
      updatedAt: new Date().toISOString(),
      updatedBy: "system-register",
    });

    return { ...record };
  }

  public getResourceOwnership(
    theatreId: string,
    resourceType: string,
    resourceId: string
  ): ResourceOwnershipRecord | null {
    const key = this.buildKey(theatreId, resourceType, resourceId);
    const found = this.ownerships.get(key);
    if (found) return { ...found };

    // Also look up by searching all ownerships matching resourceId across tenants
    for (const record of this.ownerships.values()) {
      if (
        record.resourceId === resourceId &&
        record.resourceType === resourceType.toUpperCase()
      ) {
        return { ...record };
      }
    }

    return null;
  }

  public assertOwnership(
    targetTenantId: string,
    resourceType: string,
    resourceId: string,
    actor: SecurityActorContext
  ): void {
    // Super Admin bypasses ownership scoping
    if (actor.role === "SUPER_ADMIN") {
      return;
    }

    const ownership = this.getResourceOwnership(targetTenantId, resourceType, resourceId);
    if (!ownership) {
      // If resource not pre-indexed, ensure target matches actor
      if (actor.theatreId && actor.theatreId !== targetTenantId) {
        throw new OwnershipError(
          `Resource ownership violation: User from tenant '${actor.theatreId}' attempted to access '${resourceType}' '${resourceId}' owned by '${targetTenantId}'`,
          {
            resourceType,
            resourceId,
            ownerTenantId: targetTenantId,
            actorTenantId: actor.theatreId,
            correlationId: actor.correlationId,
          }
        );
      }
      return;
    }

    if (ownership.ownerTenantId !== targetTenantId || (actor.theatreId && actor.theatreId !== ownership.ownerTenantId)) {
      throw new OwnershipError(
        `Ownership validation failed: '${resourceType}' '${resourceId}' belongs to theatre '${ownership.ownerTenantId}', not '${targetTenantId}'`,
        {
          resourceType,
          resourceId,
          ownerTenantId: ownership.ownerTenantId,
          actorTenantId: actor.theatreId,
          correlationId: actor.correlationId,
        }
      );
    }
  }

  // ----------------------------------------------------------------------------
  // 3. Optimistic Concurrency Control (OCC) & Version Checks
  // ----------------------------------------------------------------------------

  public getResourceVersion(
    theatreId: string,
    resourceType: string,
    resourceId: string
  ): ResourceVersionRecord | null {
    const key = this.buildKey(theatreId, resourceType, resourceId);
    const found = this.versions.get(key);
    if (found) return { ...found };

    // Search across tenants by resourceId
    for (const v of this.versions.values()) {
      if (v.resourceId === resourceId && v.resourceType === resourceType.toUpperCase()) {
        return { ...v };
      }
    }
    return null;
  }

  public checkAndIncrementVersion(
    theatreId: string,
    resourceType: string,
    resourceId: string,
    expectedVersion?: number,
    actor?: SecurityActorContext
  ): ResourceVersionRecord {
    const key = this.buildKey(theatreId, resourceType, resourceId);
    let record = this.versions.get(key);

    if (!record) {
      // Auto-initialize if not tracked
      const initialVer = expectedVersion || 1;
      record = {
        resourceId,
        resourceType: resourceType.toUpperCase(),
        theatreId,
        version: initialVer,
        eTagPlaceholder: `W/"v${initialVer}-${theatreId}"`,
        updatedAt: new Date().toISOString(),
        updatedBy: actor?.userId || "system",
      };
      this.versions.set(key, record);
    }

    // Verify version match if expectedVersion is supplied
    if (expectedVersion !== undefined && record.version !== expectedVersion) {
      throw new ConflictError(
        `Optimistic concurrency conflict on '${resourceType}' '${resourceId}'. Expected version ${expectedVersion}, but current version is ${record.version}.`,
        {
          entity: resourceType,
          currentVersion: record.version,
          expectedVersion,
          correlationId: actor?.correlationId,
        }
      );
    }

    // Increment version
    const newVersion = record.version + 1;
    const updatedRecord: ResourceVersionRecord = {
      ...record,
      version: newVersion,
      eTagPlaceholder: `W/"v${newVersion}-${Date.now()}"`,
      updatedAt: new Date().toISOString(),
      updatedBy: actor?.userId || "system",
    };
    this.versions.set(key, updatedRecord);

    // Update ownership version as well
    const ownership = this.ownerships.get(key);
    if (ownership) {
      this.ownerships.set(key, { ...ownership, version: newVersion });
    }

    return { ...updatedRecord };
  }

  // ----------------------------------------------------------------------------
  // 4. Soft Delete & Restoration Engine
  // ----------------------------------------------------------------------------

  public softDelete(
    theatreId: string,
    resourceType: string,
    resourceId: string,
    actor: SecurityActorContext,
    reasonPlaceholder = "Operator soft-deleted resource via governance layer"
  ): SoftDeletableEntity {
    this.assertOwnership(theatreId, resourceType, resourceId, actor);

    const key = this.buildKey(theatreId, resourceType, resourceId);
    const existing = this.softDeletes.get(key);
    const versionRecord = this.checkAndIncrementVersion(theatreId, resourceType, resourceId, undefined, actor);

    const now = new Date().toISOString();
    const config = this.getSecurityConfiguration(theatreId);
    const eligiblePurgeDate = new Date(Date.now() + config.softDeleteRetentionDays * 86400000).toISOString();

    const entity: SoftDeletableEntity = {
      id: resourceId,
      theatreId,
      resourceType: resourceType.toUpperCase(),
      version: versionRecord.version,
      softDelete: {
        isDeleted: true,
        deletedAt: now,
        deletedBy: actor.userId,
        deleteReasonPlaceholder: reasonPlaceholder,
        permanentDeleteEligibleAt: eligiblePurgeDate,
      },
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    this.softDeletes.set(key, entity);

    // Update ownership record flag
    const ownership = this.ownerships.get(key);
    if (ownership) {
      this.ownerships.set(key, { ...ownership, isDeleted: true, version: versionRecord.version });
    }

    return { ...entity };
  }

  public restore(
    theatreId: string,
    resourceType: string,
    resourceId: string,
    actor: SecurityActorContext
  ): SoftDeletableEntity {
    this.assertOwnership(theatreId, resourceType, resourceId, actor);

    const key = this.buildKey(theatreId, resourceType, resourceId);
    const existing = this.softDeletes.get(key);
    if (!existing || !existing.softDelete.isDeleted) {
      throw new NotFoundError(`Soft-deleted resource '${resourceType}' with ID '${resourceId}'`);
    }

    const versionRecord = this.checkAndIncrementVersion(theatreId, resourceType, resourceId, undefined, actor);
    const now = new Date().toISOString();

    const restored: SoftDeletableEntity = {
      ...existing,
      version: versionRecord.version,
      softDelete: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        deleteReasonPlaceholder: null,
        restoredAt: now,
        restoredBy: actor.userId,
        permanentDeleteEligibleAt: null,
      },
      updatedAt: now,
    };

    this.softDeletes.set(key, restored);

    // Update ownership flag
    const ownership = this.ownerships.get(key);
    if (ownership) {
      this.ownerships.set(key, { ...ownership, isDeleted: false, version: versionRecord.version });
    }

    return { ...restored };
  }

  public purge(
    theatreId: string,
    resourceType: string,
    resourceId: string,
    actor: SecurityActorContext
  ): boolean {
    if (actor.role !== "SUPER_ADMIN") {
      throw new OwnershipError("Permanent purge requires SUPER_ADMIN authority.", {
        resourceType,
        resourceId,
        actorTenantId: actor.theatreId,
        correlationId: actor.correlationId,
      });
    }

    const key = this.buildKey(theatreId, resourceType, resourceId);
    this.softDeletes.delete(key);
    this.ownerships.delete(key);
    this.versions.delete(key);
    return true;
  }

  public listSoftDeleted(
    theatreId: string,
    resourceType?: string
  ): SoftDeletableEntity[] {
    const list: SoftDeletableEntity[] = [];
    for (const item of this.softDeletes.values()) {
      if (item.theatreId === theatreId && item.softDelete.isDeleted) {
        if (!resourceType || item.resourceType === resourceType.toUpperCase()) {
          list.push({ ...item });
        }
      }
    }
    return list;
  }

  // ----------------------------------------------------------------------------
  // 5. Activity History Ledger
  // ----------------------------------------------------------------------------

  public recordActivity(record: ActivityHistoryRecord): void {
    this.activityHistory.unshift({ ...record });
    if (this.activityHistory.length > 5000) {
      this.activityHistory.pop();
    }
  }

  public queryActivityHistory(filter: ActivityHistoryFilter): ActivityHistoryRecord[] {
    let result = [...this.activityHistory];

    if (filter.theatreId) {
      result = result.filter((a) => a.theatreId === filter.theatreId);
    }
    if (filter.resourceType) {
      result = result.filter((a) => a.resourceType === filter.resourceType!.toUpperCase());
    }
    if (filter.resourceId) {
      result = result.filter((a) => a.resourceId === filter.resourceId);
    }
    if (filter.userId) {
      result = result.filter((a) => a.userId === filter.userId);
    }
    if (filter.action) {
      result = result.filter((a) => a.action === filter.action);
    }
    if (filter.module) {
      result = result.filter((a) => a.module === filter.module);
    }
    if (filter.fromTimestamp) {
      result = result.filter((a) => a.timestamp >= filter.fromTimestamp!);
    }
    if (filter.toTimestamp) {
      result = result.filter((a) => a.timestamp <= filter.toTimestamp!);
    }

    const offset = filter.offset || 0;
    const limit = filter.limit || 50;
    return result.slice(offset, offset + limit);
  }

  // ----------------------------------------------------------------------------
  // 6. Domain Security Events
  // ----------------------------------------------------------------------------

  public recordDomainEvent(event: DomainSecurityEvent): void {
    this.domainEvents.unshift({ ...event });
    if (this.domainEvents.length > 5000) {
      this.domainEvents.pop();
    }
    // Asynchronously dispatch to platform security monitoring hooks
    securityMonitoringHooks.dispatch("onDomainSecurityEvent", event);
  }

  public queryDomainEvents(filters?: {
    theatreId?: string;
    eventType?: string;
    resourceType?: string;
    resourceId?: string;
    limit?: number;
  }): DomainSecurityEvent[] {
    let result = [...this.domainEvents];

    if (filters?.theatreId) {
      result = result.filter((e) => e.theatreId === filters.theatreId);
    }
    if (filters?.eventType) {
      result = result.filter((e) => e.eventType === filters.eventType);
    }
    if (filters?.resourceType) {
      result = result.filter((e) => e.resourceType === filters.resourceType!.toUpperCase());
    }
    if (filters?.resourceId) {
      result = result.filter((e) => e.resourceId === filters.resourceId);
    }

    return result.slice(0, filters?.limit || 50);
  }
}

export const theatreGovernanceRepository = new TheatreGovernanceRepository();
