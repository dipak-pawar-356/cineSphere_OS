/**
 * ==============================================================================
 * CineSphere OS — Security Events & Threat Monitoring (Phase 2 – Part 16)
 * ==============================================================================
 * Central intrusion and security anomaly tracker. Records suspicious behavior,
 * authentication failures, cross-tenant breaches, and rate-limit hits.
 * ==============================================================================
 */

import {
  SecurityEventType,
  SecuritySeverity,
  SecurityEventRecord,
} from "@/types/security-hardening.types";
import { createLogger } from "@/lib/observability/structured-logger";

const logger = createLogger("SecurityEvents");
const securityEventStore: SecurityEventRecord[] = [];
const MAX_SECURITY_EVENTS = 500;

export function recordSecurityEvent(params: {
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  actorId?: string;
  actorRole?: string;
  theatreId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestPath?: string;
  details: string;
  metadata?: Record<string, unknown>;
}): SecurityEventRecord {
  const id = `sec-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const createdAt = new Date().toISOString();

  const record: SecurityEventRecord = {
    id,
    eventType: params.eventType,
    severity: params.severity,
    actorId: params.actorId,
    actorRole: params.actorRole,
    theatreId: params.theatreId,
    ipAddress: params.ipAddress || "127.0.0.1",
    userAgent: params.userAgent || "Internal/Agent",
    requestPath: params.requestPath,
    details: params.details,
    metadata: params.metadata || {},
    isResolved: false,
    createdAt,
  };

  if (securityEventStore.length >= MAX_SECURITY_EVENTS) {
    securityEventStore.shift();
  }
  securityEventStore.push(record);

  // Structured logger dispatch
  logger.warn("SECURITY", `[${params.severity}] ${params.eventType}: ${params.details}`, {
    userId: params.actorId,
    userRole: params.actorRole,
    theatreId: params.theatreId,
    metadata: {
      securityEventId: id,
      eventType: params.eventType,
      severity: params.severity,
      requestPath: params.requestPath,
      ...params.metadata,
    },
  });

  return record;
}

export function getSecurityEvents(filter?: {
  theatreId?: string;
  eventType?: SecurityEventType;
  severity?: SecuritySeverity;
  isResolved?: boolean;
  limit?: number;
}): SecurityEventRecord[] {
  let list = [...securityEventStore];

  if (filter?.theatreId) {
    list = list.filter((e) => e.theatreId === filter.theatreId || !e.theatreId);
  }
  if (filter?.eventType) {
    list = list.filter((e) => e.eventType === filter.eventType);
  }
  if (filter?.severity) {
    list = list.filter((e) => e.severity === filter.severity);
  }
  if (filter?.isResolved !== undefined) {
    list = list.filter((e) => e.isResolved === filter.isResolved);
  }

  const limit = filter?.limit || 50;
  return list.slice(-limit).reverse();
}

export function resolveSecurityEvent(id: string): boolean {
  const event = securityEventStore.find((e) => e.id === id);
  if (event) {
    event.isResolved = true;
    event.resolvedAt = new Date().toISOString();
    return true;
  }
  return false;
}

