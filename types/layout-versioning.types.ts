/**
 * ==============================================================================
 * CineSphere OS — Layout Version Management Types (Phase 4 – Part 11)
 * ==============================================================================
 * Production-grade immutable version registry, comparison engine, rollback
 * pipeline, change history tracking, and multi-tenant versioning policies.
 * ==============================================================================
 */

import {
  HallSectionDefinition,
  SeatDefinition,
  LayoutWalkway,
  LayoutEmergencyExit,
} from "./hall-designer.types";
import { StructuralObject } from "./structural-objects.types";
import { SeatCategory } from "./seat-generator.types";
import { ValidationReport } from "./hall-validation.types";

// ------------------------------------------------------------------------------
// 1. Extended Version Lifecycle States
// ------------------------------------------------------------------------------

export type VersionLifecycleStatus =
  | "DRAFT"
  | "REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "ARCHIVED"
  | "DEPRECATED";

export type VersionChangeType =
  | "CREATED"
  | "UPDATED"
  | "DELETED"
  | "MOVED"
  | "GEOMETRY_CHANGED"
  | "SEAT_CHANGED"
  | "SECTION_CHANGED"
  | "STRUCTURAL_CHANGED"
  | "METADATA_CHANGED";

// ------------------------------------------------------------------------------
// 2. Version Entity & Change History
// ------------------------------------------------------------------------------

export interface VersionChangeEvent {
  id: string;
  versionId: string;
  theatreId: string;
  changeType: VersionChangeType;
  entityType: "LAYOUT" | "SECTION" | "ROW" | "SEAT" | "STRUCTURAL_OBJECT" | "GEOMETRY";
  entityId?: string;
  description: string;
  actorId: string;
  timestamp: string;
  beforeSnapshot?: Record<string, unknown>;
  afterSnapshot?: Record<string, unknown>;
}

export interface VersionMetadataItem {
  id: string;
  versionId: string;
  theatreId: string;
  labels: string[];
  tags: string[];
  authorNotes?: string;
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy?: string;
  approvedAt?: string;
  reviewRequestedAt?: string;
  reviewNotes?: string;
}

export interface VersionHistoryItem {
  id: string;
  layoutDefinitionId: string;
  theatreId: string;
  versionNumber: number;
  name: string;
  status: VersionLifecycleStatus;
  versionNotes?: string;
  sourceVersionId?: string;
  sourceVersionNumber?: number;
  totalSeats: number;
  totalSections: number;
  totalStructuralObjects: number;
  isLocked: boolean;
  createdBy: string;
  updatedBy: string;
  publishedBy?: string;
  publishedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
  labels: string[];
  tags: string[];
}

// ------------------------------------------------------------------------------
// 3. Deep Version Comparison Diff Models
// ------------------------------------------------------------------------------

export interface SectionDiffItem {
  sectionId: string;
  name: string;
  diffType: "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED";
  changes: {
    name?: { before: string; after: string };
    seatCount?: { before: number; after: number };
    color?: { before: string; after: string };
  };
}

export interface SeatDiffItem {
  seatId: string;
  seatNumber: string;
  diffType: "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED";
  changes: {
    category?: { before: string; after: string };
    type?: { before: string; after: string };
    coordinates?: { before: { x: number; y: number }; after: { x: number; y: number } };
    accessibility?: { before: boolean; after: boolean };
  };
}

export interface StructuralObjectDiffItem {
  objectId: string;
  displayName: string;
  objectType: string;
  diffType: "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED";
  changes: {
    displayName?: { before: string; after: string };
    position?: { before: { x: number; y: number }; after: { x: number; y: number } };
    dimensions?: { before: { width: number; height: number }; after: { width: number; height: number } };
    rotation?: { before: number; after: number };
  };
}

export interface VersionComparisonDiff {
  sourceVersionId: string;
  sourceVersionNumber: number;
  targetVersionId: string;
  targetVersionNumber: number;
  theatreId: string;
  calculatedAt: string;
  summary: {
    sectionsAdded: number;
    sectionsRemoved: number;
    sectionsModified: number;
    seatsAdded: number;
    seatsRemoved: number;
    seatsModified: number;
    structuralAdded: number;
    structuralRemoved: number;
    structuralModified: number;
    capacityDelta: number;
    hasBreakingChanges: boolean;
  };
  sectionDiffs: SectionDiffItem[];
  seatDiffs: SeatDiffItem[];
  structuralDiffs: StructuralObjectDiffItem[];
  geometrySummary: {
    sourceGrid: { rows: number; columns: number; totalCapacity: number };
    targetGrid: { rows: number; columns: number; totalCapacity: number };
  };
  metadataDiff: {
    sourceNotes?: string;
    targetNotes?: string;
    sourceStatus: VersionLifecycleStatus;
    targetStatus: VersionLifecycleStatus;
  };
  validationSummary?: {
    sourceReport?: Partial<ValidationReport>;
    targetReport?: Partial<ValidationReport>;
  };
}

// ------------------------------------------------------------------------------
// 4. Rollback Models
// ------------------------------------------------------------------------------

export interface RollbackRequest {
  theatreId: string;
  layoutDefinitionId: string;
  targetVersionId: string;
  rollbackNotes: string;
  preserveDraftBranch?: boolean;
}

export interface RollbackResult {
  success: boolean;
  newDraftVersionId: string;
  newVersionNumber: number;
  derivedFromVersionNumber: number;
  timestamp: string;
  message: string;
}

// ------------------------------------------------------------------------------
// 5. Multi-Tenant Version Policies
// ------------------------------------------------------------------------------

export interface VersionPolicy {
  theatreId: string;
  maxVersionsAllowed: number; // e.g. 50 (Pune), 20 (Mumbai), 0 (unlimited for Dubai)
  rollbackEnabled: boolean;
  compareEnabled: boolean;
  versionNotesRequired: boolean;
  autoPruneArchivedDrafts: boolean;
  approvalRequired: boolean;
  allowedLabels: string[];
  updatedAt: string;
}
