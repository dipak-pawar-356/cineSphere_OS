/**
 * ==============================================================================
 * CineSphere OS — Security, Observability & Hardening Types (Phase 2 – Part 16)
 * ==============================================================================
 * Production-ready typed contracts for layered security, domain services,
 * optimistic locking, rate limiting, structured logging, and health monitoring.
 * ==============================================================================
 */

import { UserRole } from "@/auth/types/role.types";

// ------------------------------------------------------------------------------
// 1. Security Context & Identity
// ------------------------------------------------------------------------------

export interface SecurityActorContext {
  userId: string;
  email?: string;
  name?: string;
  role: UserRole;
  theatreId?: string; // Assigned complex (null for Super Admin)
  permissions: string[];
  ipAddress?: string;
  userAgent?: string;
  correlationId: string;
}

// ------------------------------------------------------------------------------
// 2. Rate Limiting Subsystem
// ------------------------------------------------------------------------------

export type RateLimitCategory =
  | "LOGIN"
  | "REGISTRATION"
  | "FORGOT_PASSWORD"
  | "SEARCH"
  | "BOOKING_REQUEST"
  | "PAYMENT_REQUEST"
  | "NOTIFICATION_REQUEST"
  | "ADMIN_API"
  | "PUBLIC_DEFAULT";

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  total: number;
  resetTimeMs: number;
  retryAfterSec: number;
}

// ------------------------------------------------------------------------------
// 3. Structured Logging & Observability
// ------------------------------------------------------------------------------

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

export type LogCategory =
  | "AUTH"
  | "SECURITY"
  | "BOOKING"
  | "PAYMENT"
  | "SYSTEM"
  | "DATABASE"
  | "AUDIT"
  | "API";

export interface StructuredLogEntry {
  logId: string;
  requestId: string;
  correlationId: string;
  traceId?: string;
  userId?: string;
  userRole?: string;
  theatreId?: string;
  severity: LogLevel;
  category: LogCategory;
  module: string;
  message: string;
  timestamp: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    code?: string;
    stack?: string;
  };
}

// ------------------------------------------------------------------------------
// 4. Security Events & Intrusion Logging
// ------------------------------------------------------------------------------

export type SecurityEventType =
  | "FAILED_LOGIN"
  | "MULTIPLE_LOGIN_ATTEMPTS"
  | "PERMISSION_VIOLATION"
  | "TENANT_VIOLATION"
  | "RATE_LIMIT_TRIGGERED"
  | "BOOKING_CONFLICT"
  | "PAYMENT_FAILURE"
  | "CONFIGURATION_CHANGE"
  | "SUSPICIOUS_PAYLOAD"
  | "CSRF_VIOLATION";

export type SecuritySeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface SecurityEventRecord {
  id: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  actorId?: string;
  actorRole?: string;
  theatreId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestPath?: string;
  details: string;
  metadata: Record<string, unknown>;
  isResolved: boolean;
  resolvedAt?: string;
  createdAt: string;
}

// ------------------------------------------------------------------------------
// 5. Optimistic Locking & Concurrency
// ------------------------------------------------------------------------------

export interface VersionedEntity {
  id: string;
  version: number;
  updatedAt: string | Date;
}

export interface OptimisticLockResult<T> {
  success: boolean;
  data?: T;
  conflict?: boolean;
  currentVersion?: number;
  expectedVersion?: number;
  error?: string;
}

// ------------------------------------------------------------------------------
// 6. System Health & Probes
// ------------------------------------------------------------------------------

export type SystemHealthStatus = "HEALTHY" | "DEGRADED" | "DOWN";

export interface SubsystemHealth {
  status: SystemHealthStatus;
  latencyMs: number;
  details?: string;
  lastChecked: string;
}

export interface HealthCheckResponse {
  status: SystemHealthStatus;
  timestamp: string;
  uptimeSec: number;
  version: string;
  environment: string;
  checks: {
    database: SubsystemHealth;
    memory: SubsystemHealth & { heapUsedMb: number; heapTotalMb: number };
    rateLimiter: SubsystemHealth & { activeKeys: number };
    domainServices: SubsystemHealth;
  };
}

// ------------------------------------------------------------------------------
// 7. Protected Server Action Protocols
// ------------------------------------------------------------------------------

export interface ActionSecurityContext {
  actor: SecurityActorContext;
  correlationId: string;
  sanitized: boolean;
}

export interface ServerActionResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
    correlationId?: string;
  };
  correlationId?: string;
  timestamp: string;
}

