/**
 * ==============================================================================
 * CineSphere OS — Theatre Governance & Security Domain Service (Phase 3 – Part 14)
 * ==============================================================================
 * Central domain service unifying security, authorization, ownership, validation,
 * soft deletion, optimistic versioning, and compliance audit logging across all
 * CineSphere OS theatre modules.
 * ==============================================================================
 */

import {
  TheatreSecurityPolicyKey,
  PolicyEvaluationResult,
  ValidationPipelineInput,
  ValidationPipelineResult,
  ActivityHistoryRecord,
  ActivityHistoryFilter,
  DomainSecurityEvent,
  MediaValidationOptions,
  MediaValidationResult,
  TheatreSecurityConfiguration,
  SoftDeletableEntity,
  OwnershipValidationResult,
} from "@/types/theatre-security-governance.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { theatreGovernanceRepository } from "@/lib/repositories/theatre-governance.repository";
import { evaluateSecurityPolicy, assertSecurityPolicy } from "@/lib/security/policies/theatre-security-policies";
import { OwnershipValidator } from "@/lib/security/ownership-validator";
import { MediaValidator } from "@/lib/security/media-validator";
import { ValidationPipeline } from "@/lib/security/validation-pipeline";
import { createLogger } from "@/lib/observability/structured-logger";

const logger = createLogger("TheatreGovernanceService");

export class TheatreGovernanceService {
  /**
   * Executes any theatre domain mutation through the standardized 9-stage validation pipeline.
   */
  public async executePipeline<TInput, TOutput>(
    input: ValidationPipelineInput<TInput>,
    handler: (validatedInput: TInput, ctx: any) => Promise<TOutput>
  ): Promise<ValidationPipelineResult<TOutput>> {
    return ValidationPipeline.execute(input, handler);
  }

  /**
   * Evaluates a security policy for a user actor.
   */
  public evaluatePolicy(
    policyKey: TheatreSecurityPolicyKey,
    actor: SecurityActorContext,
    targetTenantId?: string,
    metadata?: Record<string, unknown>
  ): PolicyEvaluationResult {
    return evaluateSecurityPolicy(policyKey, actor, {
      targetTenantId,
      metadata,
    });
  }

  /**
   * Validates resource ownership and multi-tenant scoping.
   */
  public validateOwnership(
    targetTenantId: string,
    resourceType: string,
    resourceId: string,
    actor: SecurityActorContext
  ): OwnershipValidationResult {
    return OwnershipValidator.validateResourceOwnership(
      targetTenantId,
      resourceType,
      resourceId,
      actor
    );
  }

  /**
   * Validates a media upload against platform and theatre-specific upload quotas.
   */
  public validateMediaUpload(options: MediaValidationOptions): MediaValidationResult {
    return MediaValidator.validateMediaUpload(options);
  }

  /**
   * Soft deletes a resource.
   */
  public softDeleteResource(
    theatreId: string,
    resourceType: string,
    resourceId: string,
    actor: SecurityActorContext,
    reason?: string
  ): SoftDeletableEntity {
    assertSecurityPolicy("canSoftDeleteResource", actor, {
      targetTenantId: theatreId,
      resourceType,
      resourceId,
    });

    const deleted = theatreGovernanceRepository.softDelete(
      theatreId,
      resourceType,
      resourceId,
      actor,
      reason
    );

    // Record domain security event
    theatreGovernanceRepository.recordDomainEvent({
      eventId: `evt-del-${Date.now()}`,
      eventType: "THEATRE_SOFT_DELETED",
      theatreId,
      resourceType,
      resourceId,
      actor,
      action: "SOFT_DELETE",
      module: "GOVERNANCE",
      currentVersion: deleted.version,
      metadata: { reason, isDeleted: true },
      timestamp: new Date().toISOString(),
    });

    // Record activity history
    theatreGovernanceRepository.recordActivity({
      id: `act-del-${Date.now()}`,
      theatreId,
      resourceType,
      resourceId,
      action: "SOFT_DELETE",
      module: "GOVERNANCE",
      userId: actor.userId,
      userName: actor.name || "Operator",
      userRole: actor.role,
      timestamp: new Date().toISOString(),
      currentVersionPlaceholder: deleted.version,
      details: `Soft-deleted '${resourceType}' '${resourceId}' (${reason || "No reason specified"})`,
    });

    logger.info("AUDIT", `Soft-deleted ${resourceType} ${resourceId} for theatre ${theatreId}`, {
      theatreId,
      userId: actor.userId,
    });

    return deleted;
  }

  /**
   * Restores a soft-deleted resource.
   */
  public restoreResource(
    theatreId: string,
    resourceType: string,
    resourceId: string,
    actor: SecurityActorContext
  ): SoftDeletableEntity {
    assertSecurityPolicy("canRestoreResource", actor, {
      targetTenantId: theatreId,
      resourceType,
      resourceId,
    });

    const restored = theatreGovernanceRepository.restore(
      theatreId,
      resourceType,
      resourceId,
      actor
    );

    // Record domain security event
    theatreGovernanceRepository.recordDomainEvent({
      eventId: `evt-res-${Date.now()}`,
      eventType: "THEATRE_RESTORED",
      theatreId,
      resourceType,
      resourceId,
      actor,
      action: "RESTORE",
      module: "GOVERNANCE",
      currentVersion: restored.version,
      metadata: { isDeleted: false },
      timestamp: new Date().toISOString(),
    });

    // Record activity history
    theatreGovernanceRepository.recordActivity({
      id: `act-res-${Date.now()}`,
      theatreId,
      resourceType,
      resourceId,
      action: "RESTORE",
      module: "GOVERNANCE",
      userId: actor.userId,
      userName: actor.name || "Operator",
      userRole: actor.role,
      timestamp: new Date().toISOString(),
      currentVersionPlaceholder: restored.version,
      details: `Restored soft-deleted '${resourceType}' '${resourceId}'`,
    });

    logger.info("AUDIT", `Restored ${resourceType} ${resourceId} for theatre ${theatreId}`, {
      theatreId,
      userId: actor.userId,
    });

    return restored;
  }

  /**
   * Permanently purges a resource (requires SUPER_ADMIN).
   */
  public purgeResource(
    theatreId: string,
    resourceType: string,
    resourceId: string,
    actor: SecurityActorContext
  ): boolean {
    assertSecurityPolicy("canPurgeResource", actor, {
      targetTenantId: theatreId,
      resourceType,
      resourceId,
    });

    const purged = theatreGovernanceRepository.purge(theatreId, resourceType, resourceId, actor);

    theatreGovernanceRepository.recordDomainEvent({
      eventId: `evt-purge-${Date.now()}`,
      eventType: "THEATRE_PURGED",
      theatreId,
      resourceType,
      resourceId,
      actor,
      action: "PURGE",
      module: "GOVERNANCE",
      metadata: { permanent: true },
      timestamp: new Date().toISOString(),
    });

    logger.warn("SECURITY", `Permanently purged ${resourceType} ${resourceId} for theatre ${theatreId}`, {
      theatreId,
      userId: actor.userId,
    });

    return purged;
  }

  /**
   * Retrieves chronological activity history.
   */
  public getActivityHistory(filter: ActivityHistoryFilter): ActivityHistoryRecord[] {
    return theatreGovernanceRepository.queryActivityHistory(filter);
  }

  /**
   * Retrieves domain audit events.
   */
  public getAuditTrail(filters?: {
    theatreId?: string;
    eventType?: string;
    resourceType?: string;
    resourceId?: string;
    limit?: number;
  }): DomainSecurityEvent[] {
    return theatreGovernanceRepository.queryDomainEvents(filters);
  }

  /**
   * Retrieves soft-deleted resources for a cinema.
   */
  public getSoftDeletedResources(theatreId: string, resourceType?: string): SoftDeletableEntity[] {
    return theatreGovernanceRepository.listSoftDeleted(theatreId, resourceType);
  }

  /**
   * Retrieves theatre-specific security configuration.
   */
  public getSecurityConfiguration(theatreId: string): TheatreSecurityConfiguration {
    return theatreGovernanceRepository.getSecurityConfiguration(theatreId);
  }

  /**
   * Updates theatre-specific security configuration.
   */
  public updateSecurityConfiguration(
    theatreId: string,
    updates: Partial<Omit<TheatreSecurityConfiguration, "theatreId">>,
    actor: SecurityActorContext
  ): TheatreSecurityConfiguration {
    assertSecurityPolicy("canEditConfiguration", actor, { targetTenantId: theatreId });
    const updated = theatreGovernanceRepository.updateSecurityConfiguration(theatreId, updates);

    theatreGovernanceRepository.recordDomainEvent({
      eventId: `evt-cfg-${Date.now()}`,
      eventType: "CONFIGURATION_UPDATED",
      theatreId,
      resourceType: "CONFIGURATION",
      resourceId: "security-config",
      actor,
      action: "UPDATE_SECURITY_CONFIG",
      module: "GOVERNANCE",
      currentVersion: updated.configurationVersion,
      metadata: updates,
      timestamp: new Date().toISOString(),
    });

    return updated;
  }
}

export const theatreGovernanceService = new TheatreGovernanceService();
