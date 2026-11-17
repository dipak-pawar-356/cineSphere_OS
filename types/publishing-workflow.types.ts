/**
 * ==============================================================================
 * CineSphere OS — Publishing Workflow Types (Phase 4 – Part 12)
 * ==============================================================================
 * Production-ready publishing pipeline for hall layouts. Activates a validated
 * layout version for future shows while preserving historical versions for
 * existing bookings via the Show Compatibility Layer.
 * ==============================================================================
 */

import { ValidationReport } from "./hall-validation.types";

// ------------------------------------------------------------------------------
// 1. Publishing Lifecycle States & Live Status
// ------------------------------------------------------------------------------

export type PublishLifecycleState =
  | "DRAFT"
  | "READY_TO_PUBLISH"
  | "PUBLISHED"
  | "ARCHIVED"
  | "INACTIVE"
  | "SCHEDULED";

export type LayoutLiveStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "ARCHIVED"
  | "SCHEDULED"
  | "DEPRECATED";

export type PublishWindowType =
  | "ANYTIME"
  | "BUSINESS_HOURS"
  | "MAINTENANCE_WINDOW"
  | "OFF_PEAK";

// ------------------------------------------------------------------------------
// 2. Publishing Pipeline & Preflight Checklist
// ------------------------------------------------------------------------------

export interface PublishingPreflightChecklist {
  hasPassedValidation: boolean;
  hasScreenDefined: boolean;
  hasEmergencyExits: boolean;
  hasZeroObstacleCollisions: boolean;
  hasZeroDuplicateSeatCodes: boolean;
  hasConsistentSectionCapacity: boolean;
  hasOwnershipVerified: boolean;
  hasNoPublishConflicts: boolean;
  isVersionDraft: boolean;
  canPublish: boolean;
  blockingReasons: string[];
}

export interface PublishVersionPayload {
  theatreId: string;
  layoutDefinitionId: string;
  versionId: string;
  publishNotes?: string;
  schedulePublishAt?: string; // ISO string for scheduled publish placeholder
}

export interface PublishResult {
  success: boolean;
  layoutDefinitionId: string;
  publishedVersionId: string;
  publishedVersionNumber: number;
  archivedVersionId?: string;
  archivedVersionNumber?: number;
  publishedAt: string;
  publishedBy: string;
  liveStatus: LayoutLiveStatus;
  message: string;
}

// ------------------------------------------------------------------------------
// 3. Publishing History & Status
// ------------------------------------------------------------------------------

export interface PublishingHistoryEntry {
  id: string;
  theatreId: string;
  layoutDefinitionId: string;
  versionId: string;
  versionNumber: number;
  previousVersionId?: string;
  previousVersionNumber?: number;
  publishedBy: string;
  publishedAt: string;
  publishNotes?: string;
  validationSummary?: {
    errorsCount: number;
    warningsCount: number;
    canPublish: boolean;
  };
  policyApplied: string;
  isScheduled: boolean;
}

export interface PublishingStatusRecord {
  layoutDefinitionId: string;
  theatreId: string;
  hallId: string;
  currentPublishedVersionId?: string;
  currentPublishedVersionNumber?: number;
  liveStatus: LayoutLiveStatus;
  publishedAt?: string;
  publishedBy?: string;
  totalActiveShowsUsingThisLayout: number;
  lastPublishNotes?: string;
  isVersionLocked: boolean;
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// 4. Show Compatibility Layer Models
// ------------------------------------------------------------------------------

export interface ShowLayoutAssignment {
  id: string;
  showId: string;
  theatreId: string;
  hallId: string;
  layoutDefinitionId: string;
  layoutVersionId: string;
  layoutVersionNumber: number;
  assignedAt: string;
  assignedBy: string;
  isMigrated: boolean;
  migratedAt?: string;
  migratedBy?: string;
  migrationNotes?: string;
}

export interface ShowLayoutCompatibilityResolution {
  showId: string;
  theatreId: string;
  hallId: string;
  layoutVersionId: string;
  layoutVersionNumber: number;
  status: "LOCKED_TO_SHOW" | "ACTIVE_LIVE" | "LEGACY_SHOW";
  isHistoricalPreserved: boolean;
}

export interface ShowMigrationRequest {
  showId: string;
  theatreId: string;
  targetLayoutVersionId: string;
  migrationReason: string;
}

export interface ShowMigrationResult {
  success: boolean;
  showId: string;
  previousVersionId: string;
  newVersionId: string;
  migratedAt: string;
  message: string;
}

// ------------------------------------------------------------------------------
// 5. Multi-Tenant Publishing Configuration
// ------------------------------------------------------------------------------

export interface PublishingConfiguration {
  theatreId: string;
  instantPublishEnabled: boolean;
  approvalRequired: boolean;
  scheduledPublishEnabled: boolean;
  rollbackEnabled: boolean;
  publishWindow: PublishWindowType;
  allowedRolesToPublish: string[];
  requirePublishNotes: boolean;
  notifyOnPublish: boolean;
  updatedAt: string;
}
