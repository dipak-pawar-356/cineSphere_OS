/**
 * ==============================================================================
 * CineSphere OS — Audit, Security & Structured Log Repository (Phase 2 – Part 16)
 * ==============================================================================
 * Persistence and retrieval interface for compliance audits, security alerts,
 * and structured logs.
 * ==============================================================================
 */

import { BaseRepository } from "./base.repository";
import {
  SecurityEventRecord,
  StructuredLogEntry,
} from "@/types/security-hardening.types";
import { recordSecurityEvent, getSecurityEvents } from "@/lib/security/security-events";
import { getRecentStructuredLogs } from "@/lib/observability/structured-logger";

export interface AuditLogRecord {
  id: string;
  userId?: string;
  theatreId?: string;
  action: string;
  module: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

const auditLogStore: AuditLogRecord[] = [];
const MAX_AUDIT_LOGS = 1000;

export class AuditRepository extends BaseRepository<AuditLogRecord> {
  protected entityName = "AuditLog";

  async findById(id: string): Promise<AuditLogRecord | null> {
    return auditLogStore.find((a) => a.id === id) || null;
  }

  async findAll(filter?: Record<string, unknown>): Promise<AuditLogRecord[]> {
    let list = [...auditLogStore];
    if (filter?.theatreId) {
      list = list.filter((a) => a.theatreId === filter.theatreId || !a.theatreId);
    }
    if (filter?.module) {
      list = list.filter((a) => a.module === filter.module);
    }
    if (filter?.userId) {
      list = list.filter((a) => a.userId === filter.userId);
    }
    return list.slice(-100).reverse();
  }

  async create(data: Partial<AuditLogRecord>): Promise<AuditLogRecord> {
    const id = data.id || `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: AuditLogRecord = {
      id,
      userId: data.userId,
      theatreId: data.theatreId,
      action: data.action || "UPDATE",
      module: data.module || "SYSTEM",
      description: data.description || "System operation executed",
      metadata: data.metadata || {},
      ipAddress: data.ipAddress || "127.0.0.1",
      userAgent: data.userAgent || "CineSphere/1.0",
      createdAt: data.createdAt || new Date().toISOString(),
    };

    if (auditLogStore.length >= MAX_AUDIT_LOGS) {
      auditLogStore.shift();
    }
    auditLogStore.push(newRecord);
    return newRecord;
  }

  async update(_id: string, _data: Partial<AuditLogRecord>): Promise<AuditLogRecord | null> {
    // Audit logs are tamper-evident and immutable
    return null;
  }

  async delete(_id: string): Promise<boolean> {
    // Audit logs cannot be deleted
    return false;
  }

  // ----------------------------------------------------------------------------
  // Security Events Delegations
  // ----------------------------------------------------------------------------

  async recordSecurityEvent(params: Parameters<typeof recordSecurityEvent>[0]): Promise<SecurityEventRecord> {
    return recordSecurityEvent(params);
  }

  async findSecurityEvents(filter?: Parameters<typeof getSecurityEvents>[0]): Promise<SecurityEventRecord[]> {
    return getSecurityEvents(filter);
  }

  // ----------------------------------------------------------------------------
  // Structured Logs Delegations
  // ----------------------------------------------------------------------------

  async findStructuredLogs(filter?: Parameters<typeof getRecentStructuredLogs>[0]): Promise<StructuredLogEntry[]> {
    return getRecentStructuredLogs(filter);
  }
}

export const auditRepository = new AuditRepository();

