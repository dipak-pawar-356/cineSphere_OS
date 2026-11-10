/**
 * ==============================================================================
 * CineSphere OS — Security & Compliance Audit Service (Phase 2 – Part 16)
 * ==============================================================================
 * Central coordinator for tamper-evident business audit logging and threat detection.
 * ==============================================================================
 */

import { auditRepository, AuditLogRecord } from "@/lib/repositories/audit.repository";
import { SecurityActorContext, SecurityEventType, SecuritySeverity, SecurityEventRecord } from "@/types/security-hardening.types";
import { createLogger } from "@/lib/observability/structured-logger";

const logger = createLogger("SecurityAuditService");

export class SecurityAuditService {
  /**
   * Records a compliant business audit trail event.
   */
  async recordAudit(params: {
    actor: SecurityActorContext;
    action: string;
    module: string;
    description: string;
    metadata?: Record<string, unknown>;
  }): Promise<AuditLogRecord> {
    const record = await auditRepository.create({
      userId: params.actor.userId,
      theatreId: params.actor.theatreId,
      action: params.action,
      module: params.module,
      description: params.description,
      metadata: {
        ...params.metadata,
        actorRole: params.actor.role,
        correlationId: params.actor.correlationId,
      },
      ipAddress: params.actor.ipAddress || "127.0.0.1",
      userAgent: params.actor.userAgent || "CineSphere/1.0",
    });

    logger.info("AUDIT", `[${params.module}] ${params.action}: ${params.description}`, {
      userId: params.actor.userId,
      userRole: params.actor.role,
      theatreId: params.actor.theatreId,
      correlationId: params.actor.correlationId,
      metadata: params.metadata,
    });

    return record;
  }

  /**
   * Records a security violation or anomaly.
   */
  async recordSecurityViolation(params: {
    eventType: SecurityEventType;
    severity: SecuritySeverity;
    actor?: SecurityActorContext;
    details: string;
    requestPath?: string;
    metadata?: Record<string, unknown>;
  }): Promise<SecurityEventRecord> {
    return auditRepository.recordSecurityEvent({
      eventType: params.eventType,
      severity: params.severity,
      actorId: params.actor?.userId,
      actorRole: params.actor?.role,
      theatreId: params.actor?.theatreId,
      ipAddress: params.actor?.ipAddress,
      userAgent: params.actor?.userAgent,
      requestPath: params.requestPath,
      details: params.details,
      metadata: {
        ...params.metadata,
        correlationId: params.actor?.correlationId,
      },
    });
  }

  /**
   * Retrieves audit logs for compliance review.
   */
  async getAuditTrail(filter?: { theatreId?: string; module?: string; userId?: string }): Promise<AuditLogRecord[]> {
    return auditRepository.findAll(filter);
  }

  /**
   * Retrieves security events for security operations.
   */
  async getSecurityEvents(filter?: Parameters<typeof auditRepository.findSecurityEvents>[0]): Promise<SecurityEventRecord[]> {
    return auditRepository.findSecurityEvents(filter);
  }
}

export const securityAuditService = new SecurityAuditService();

