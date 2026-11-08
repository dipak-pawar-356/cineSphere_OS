import type { NewAuditLog } from "../types";
import { auditActionEnum } from "../schema/enums";

/**
 * ==============================================================================
 * CineSphere OS - Audit Trail Logging Helper
 * Formats structured security audit log entries for sensitive system operations
 * ==============================================================================
 */

export interface CreateAuditLogParams {
  userId?: string | null;
  theatreId?: string | null;
  action: (typeof auditActionEnum.enumValues)[number];
  module: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export function formatAuditEntry(params: CreateAuditLogParams): NewAuditLog {
  return {
    userId: params.userId || null,
    theatreId: params.theatreId || null,
    action: params.action,
    module: params.module,
    description: params.description,
    metadata: params.metadata || {},
    ipAddress: params.ipAddress || null,
    userAgent: params.userAgent || null,
  };
}

