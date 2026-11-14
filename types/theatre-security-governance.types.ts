/**
 * ==============================================================================
 * CineSphere OS — Theatre Security & Governance Types (Phase 3 – Part 14)
 * ==============================================================================
 * Unified platform security and governance layer types providing:
 * 1. Policy-Based Authorization (canManageTheatre, canPublishTheatre, etc.)
 * 2. Multi-Tenant Boundary Isolation & Ownership Validation
 * 3. 9-Stage Validation Pipeline Contracts
 * 4. Domain Event Auditing & Structured Event Ledger
 * 5. Chronological Activity History
 * 6. Optimistic Concurrency Control (OCC) & Resource Versioning
 * 7. Reusable Soft Delete & Restoration Engine
 * 8. Media Validation with Dynamic Theatre Limits
 * 9. Theatre-Specific Security Configuration Matrix
 * ==============================================================================
 */

import { SecurityActorContext } from "@/types/security-hardening.types";
import { UserRole } from "@/auth/types/role.types";
import { AppError } from "@/lib/errors/app-error";

// ------------------------------------------------------------------------------
// 1. Policy-Based Authorization Types
// ------------------------------------------------------------------------------

export type TheatreSecurityPolicyKey =
  | "canManageTheatre"
  | "canPublishTheatre"
  | "canSuspendTheatre"
  | "canArchiveTheatre"
  | "canDeleteTheatre"
  | "canEditBranding"
  | "canUploadMedia"
  | "canEditProfile"
  | "canEditLocation"
  | "canManageAmenities"
  | "canManageContacts"
  | "canManageBusinessInfo"
  | "canManageOperatingHours"
  | "canEditConfiguration"
  | "canManageStaff"
  | "canViewDashboard"
  | "canSearchResources"
  | "canSoftDeleteResource"
  | "canRestoreResource"
  | "canPurgeResource";

export interface PolicyEvaluationContext {
  targetTenantId?: string;
  resourceId?: string;
  resourceType?: string;
  resourceOwnerTenantId?: string;
  currentStatus?: string;
  theatreConfig?: TheatreSecurityConfiguration;
  metadata?: Record<string, unknown>;
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  policyKey: TheatreSecurityPolicyKey;
  reason?: string;
  missingPermissions?: string[];
  requiredRole?: UserRole | UserRole[];
  evaluatedAt: string;
}

// ------------------------------------------------------------------------------
// 2. Domain Event Auditing Contracts
// ------------------------------------------------------------------------------

export type DomainSecurityEventType =
  | "THEATRE_CREATED"
  | "THEATRE_UPDATED"
  | "THEATRE_STATUS_CHANGED"
  | "THEATRE_PUBLISHED"
  | "THEATRE_SUSPENDED"
  | "THEATRE_ARCHIVED"
  | "THEATRE_SOFT_DELETED"
  | "THEATRE_RESTORED"
  | "THEATRE_PURGED"
  | "MEDIA_UPLOADED"
  | "MEDIA_DELETED"
  | "PROFILE_UPDATED"
  | "LOCATION_UPDATED"
  | "AMENITY_UPDATED"
  | "CONTACT_UPDATED"
  | "BUSINESS_INFO_UPDATED"
  | "OPERATING_HOURS_UPDATED"
  | "CONFIGURATION_UPDATED"
  | "STAFF_ASSIGNED"
  | "STAFF_REVOKED"
  | "PERMISSION_CHANGED"
  | "SECURITY_POLICY_EVALUATED"
  | "CONCURRENCY_CONFLICT_DETECTED"
  | "RATE_LIMIT_TRIGGERED"
  | "TENANT_VIOLATION_BLOCKED"
  | "OWNERSHIP_VIOLATION_BLOCKED";

export interface DomainSecurityEvent {
  eventId: string;
  eventType: DomainSecurityEventType;
  theatreId: string;
  resourceType: string;
  resourceId: string;
  actor: SecurityActorContext;
  action: string;
  module: string;
  previousVersion?: number;
  currentVersion?: number;
  diff?: Record<string, { before: unknown; after: unknown }>;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// ------------------------------------------------------------------------------
// 3. Central Validation Pipeline Contracts
// ------------------------------------------------------------------------------

export type PipelineStage =
  | "1_AUTHENTICATION"
  | "2_POLICY_AUTHORIZATION"
  | "3_TENANT_ISOLATION"
  | "4_OWNERSHIP_VALIDATION"
  | "5_INPUT_VALIDATION"
  | "6_THEATRE_RULES"
  | "7_CONCURRENCY_CHECK"
  | "8_EXECUTION"
  | "9_DOMAIN_AUDIT";

export interface PipelineStageResult {
  stage: PipelineStage;
  passed: boolean;
  durationMs: number;
  error?: string;
}

export interface PipelineContext {
  actor: SecurityActorContext;
  correlationId: string;
  targetTenantId: string;
  theatreConfig: TheatreSecurityConfiguration;
  resourceId?: string;
  resourceType: string;
  currentVersion?: number;
  expectedVersion?: number;
}

export interface ValidationPipelineInput<TInput> {
  operationName: string;
  module: string;
  action: string;
  policyKey: TheatreSecurityPolicyKey;
  targetTenantId: string;
  resourceType: string;
  resourceId?: string;
  schema?: any; // Zod Schema
  rawInput: TInput;
  expectedVersion?: number;
  actor: SecurityActorContext;
  theatreConfig?: TheatreSecurityConfiguration;
  customBusinessRules?: Array<
    (input: TInput, ctx: PipelineContext) => Promise<void> | void
  >;
}

export interface ValidationPipelineResult<TOutput> {
  success: boolean;
  data?: TOutput;
  error?: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
    stage?: PipelineStage;
  };
  stageResults: PipelineStageResult[];
  totalDurationMs: number;
  correlationId: string;
  timestamp: string;
}

// ------------------------------------------------------------------------------
// 4. Soft Delete Contracts
// ------------------------------------------------------------------------------

export interface SoftDeleteMetadata {
  isDeleted: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deleteReasonPlaceholder?: string | null;
  restoredAt?: string | null;
  restoredBy?: string | null;
  permanentDeleteEligibleAt?: string | null;
}

export interface SoftDeletableEntity {
  id: string;
  theatreId: string;
  resourceType: string;
  version: number;
  softDelete: SoftDeleteMetadata;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// 5. Optimistic Concurrency Control (OCC) & Resource Versioning
// ------------------------------------------------------------------------------

export interface ResourceVersionRecord {
  resourceId: string;
  resourceType: string;
  theatreId: string;
  version: number;
  eTagPlaceholder: string;
  updatedAt: string;
  updatedBy: string;
}

export interface VersionCheckResult {
  conflict: boolean;
  currentVersion: number;
  expectedVersion: number;
  eTagMatches?: boolean;
}

// ------------------------------------------------------------------------------
// 6. Chronological Activity History Contracts
// ------------------------------------------------------------------------------

export interface ActivityHistoryRecord {
  id: string;
  theatreId: string;
  resourceType: string;
  resourceId: string;
  action: string;
  module: string;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  previousVersionPlaceholder?: number | null;
  currentVersionPlaceholder?: number | null;
  details: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityHistoryFilter {
  theatreId?: string;
  resourceType?: string;
  resourceId?: string;
  userId?: string;
  action?: string;
  module?: string;
  fromTimestamp?: string;
  toTimestamp?: string;
  limit?: number;
  offset?: number;
}

// ------------------------------------------------------------------------------
// 7. Media Validation Contracts
// ------------------------------------------------------------------------------

export interface MediaValidationOptions {
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  width?: number;
  height?: number;
  theatreId: string;
  allowedMimeTypes?: string[];
  maxSizeBytes?: number;
  sha256Checksum?: string;
}

export interface MediaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  detectedType: string;
  effectiveUploadLimitBytes: number;
  virusScanStatus: "CLEAN" | "INFECTED" | "SKIPPED_PLACEHOLDER";
  cdnValidationStatus: "PENDING_CDN_INGEST_PLACEHOLDER" | "VALID";
  duplicateCheck: {
    isDuplicate: boolean;
    existingAssetId?: string;
  };
}

// ------------------------------------------------------------------------------
// 8. Theatre-Specific Security Configuration Matrix
// ------------------------------------------------------------------------------

export interface TheatreSecurityConfiguration {
  theatreId: string;
  mediaUploadLimitMb: number; // e.g. Pune 20MB, Mumbai 50MB, Dubai 10MB
  maxStaffCount: number; // e.g. Pune 100, Mumbai 300, Dubai 50
  configurationVersion: number; // e.g. Pune 12, Mumbai 35, Dubai 8
  allowedMimeTypes: string[];
  requireMfaForSensitiveActions: boolean;
  maxActiveSessions: number;
  softDeleteRetentionDays: number;
}

// ------------------------------------------------------------------------------
// 9. Ownership Validation Contracts
// ------------------------------------------------------------------------------

export interface ResourceOwnershipRecord {
  resourceId: string;
  resourceType: string;
  ownerTenantId: string;
  isDeleted: boolean;
  version: number;
}

export interface OwnershipValidationResult {
  isOwner: boolean;
  resourceExists: boolean;
  ownerTenantId?: string;
  actorTenantId?: string;
  error?: string;
}

// ------------------------------------------------------------------------------
// 10. Core Governance Resource Types (11 Protected Module Resources)
// ------------------------------------------------------------------------------

export type TheatreGovernanceResourceType =
  | "THEATRE"
  | "MEDIA"
  | "CONTACT"
  | "AMENITY"
  | "BUSINESS_INFO"
  | "OPERATING_HOURS"
  | "CONFIGURATION"
  | "STAFF"
  | "DASHBOARD"
  | "SEARCH"
  | "PUBLIC_CONTENT";

// ------------------------------------------------------------------------------
// 11. Endpoint-Specific Rate Limiting Contracts
// ------------------------------------------------------------------------------

export type TheatreRateLimitEndpoint =
  | "AUTH_REQUESTS"
  | "MEDIA_UPLOADS"
  | "SEARCH_REQUESTS"
  | "CONFIGURATION_UPDATES"
  | "DASHBOARD_REFRESH"
  | "PUBLIC_PAGE_REQUESTS";

export interface TheatreEndpointRateLimitConfig {
  endpoint: TheatreRateLimitEndpoint;
  windowMs: number;
  maxRequests: number;
  blockDurationMs?: number;
}

export interface TheatreRateLimitResult {
  allowed: boolean;
  endpoint: TheatreRateLimitEndpoint;
  key: string;
  remaining: number;
  total: number;
  resetTimeMs: number;
  retryAfterSec: number;
}

// ------------------------------------------------------------------------------
// 12. Security Monitoring Hooks Contracts
// ------------------------------------------------------------------------------

export interface SecurityMonitoringHooks {
  onDomainSecurityEvent?: (event: DomainSecurityEvent) => void | Promise<void>;
  onPolicyEvaluated?: (result: PolicyEvaluationResult, actor: SecurityActorContext) => void | Promise<void>;
  onPolicyDenied?: (policyKey: TheatreSecurityPolicyKey, actor: SecurityActorContext, reason?: string) => void | Promise<void>;
  onTenantViolation?: (actorTenantId?: string, targetTenantId?: string, resourceType?: string) => void | Promise<void>;
  onOwnershipViolation?: (actorTenantId?: string, targetTenantId?: string, resourceType?: string, resourceId?: string) => void | Promise<void>;
  onRateLimitExceeded?: (endpoint: TheatreRateLimitEndpoint, key: string, retryAfterSec: number) => void | Promise<void>;
  onConcurrencyConflict?: (resourceId: string, expectedVersion: number, currentVersion: number) => void | Promise<void>;
}

