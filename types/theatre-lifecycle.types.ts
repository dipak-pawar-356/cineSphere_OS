/**
 * ==============================================================================
 * CineSphere OS — Theatre Lifecycle Management Types (Phase 3 – Part 1)
 * ==============================================================================
 * Strongly typed contracts for multi-tenant theatre onboarding, state machine
 * progression, approvals, suspension/archival/soft-delete workflows, and slugs.
 * ==============================================================================
 */

export type TheatreLifecycleState =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "ARCHIVED"
  | "SOFT_DELETED";

export type TheatreApprovalState =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "REVISION_REQUESTED";

export interface TheatreLifecycleCapabilities {
  allowBookings: boolean;
  allowShows: boolean;
  allowPayments: boolean;
  isReadOnly: boolean;
}

export interface TheatreSuspensionDetails {
  reason: string;
  startTime: string;
  endTimePlaceholder?: string;
  suspendedBy: string;
  suspendedAt: string;
}

export interface TheatreArchiveDetails {
  archivedAt: string;
  archivedBy: string;
  reason?: string;
  previousState?: TheatreLifecycleState;
}

export interface TheatreSoftDeleteDetails {
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deleteReason?: string;
}

export interface TheatreBrandingConfig {
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface TheatreDefaultConfiguration {
  timezone: string;
  currency: string;
  openingTime: string;
  closingTime: string;
  convenienceFeeDefault: number;
  allowSelfCheckIn: boolean;
  maxSeatsPerBooking: number;
}

export interface ManagedTheatreEntity {
  id: string;
  publicId: string; // e.g. "TH-PUB-8K92X1"
  slug: string;
  name: string;
  chain: string;
  code: string;
  tagline?: string;
  description?: string;

  // Business Info
  gstNumber?: string;
  pricingTier: "LUXURY" | "PREMIUM" | "STANDARD" | "BUDGET";
  subscriptionPlan: "Free" | "Starter" | "Professional" | "Enterprise";
  contactEmail: string;
  contactNumber: string;

  // Admin Info
  adminName: string;
  adminEmail: string;
  adminUserId?: string;

  // Location
  address: string;
  city: string;
  state: string;
  pinCode?: string;
  country: string;

  // Branding & Default Configuration
  branding: TheatreBrandingConfig;
  defaultConfig: TheatreDefaultConfiguration;

  // Telemetry Counters (Read-Only from operational tables)
  hallCount: number;
  screenTypes: string[];
  rating: number;
  grossRevenueMonthly: number;
  totalBookings: number;

  // Lifecycle & Governance State
  status: TheatreLifecycleState;
  approvalStatus: TheatreApprovalState;
  capabilities: TheatreLifecycleCapabilities;
  version: number; // Optimistic locking version

  // Conditional State Metadata
  suspension?: TheatreSuspensionDetails;
  archival?: TheatreArchiveDetails;
  softDelete: TheatreSoftDeleteDetails;

  // Audit Timestamps
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTheatreInput {
  name: string;
  chain?: string;
  slug?: string; // Optional manual override
  tagline?: string;
  description?: string;
  gstNumber?: string;
  pricingTier?: "LUXURY" | "PREMIUM" | "STANDARD" | "BUDGET";
  subscriptionPlan?: "Free" | "Starter" | "Professional" | "Enterprise";
  contactEmail: string;
  contactNumber: string;
  adminName: string;
  adminEmail: string;
  address: string;
  city: string;
  state: string;
  pinCode?: string;
  country?: string;
  branding?: Partial<TheatreBrandingConfig>;
  defaultConfig?: Partial<TheatreDefaultConfiguration>;
  submitImmediately?: boolean; // Optional: creates directly into PENDING_APPROVAL
}

export interface UpdateTheatreInput {
  expectedVersion: number; // Optimistic locking version check
  name?: string;
  chain?: string;
  slug?: string;
  tagline?: string;
  description?: string;
  gstNumber?: string;
  pricingTier?: "LUXURY" | "PREMIUM" | "STANDARD" | "BUDGET";
  subscriptionPlan?: "Free" | "Starter" | "Professional" | "Enterprise";
  contactEmail?: string;
  contactNumber?: string;
  adminName?: string;
  adminEmail?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  country?: string;
  branding?: Partial<TheatreBrandingConfig>;
  defaultConfig?: Partial<TheatreDefaultConfiguration>;
}

export interface TheatreStatusTransitionRecord {
  id: string;
  theatreId: string;
  fromStatus: TheatreLifecycleState | null;
  toStatus: TheatreLifecycleState;
  reason?: string;
  changedBy: string;
  changedByRole: string;
  timestamp: string;
}

export interface TheatreApprovalRecord {
  id: string;
  theatreId: string;
  status: TheatreApprovalState;
  approverId?: string;
  approverName?: string;
  comments?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface TheatreSlugHistoryRecord {
  id: string;
  theatreId: string;
  oldSlug: string;
  newSlug: string;
  changedBy: string;
  redirectEnabled: boolean;
  createdAt: string;
}

export interface TheatreLifecycleAuditRecord {
  id: string;
  theatreId: string;
  action:
    | "THEATRE_CREATED"
    | "THEATRE_UPDATED"
    | "THEATRE_SUBMITTED"
    | "THEATRE_APPROVED"
    | "THEATRE_REJECTED"
    | "THEATRE_REVISION_REQUESTED"
    | "THEATRE_ACTIVATED"
    | "THEATRE_DEACTIVATED"
    | "THEATRE_SUSPENDED"
    | "THEATRE_RESUMED"
    | "THEATRE_ARCHIVED"
    | "THEATRE_RESTORED"
    | "THEATRE_SOFT_DELETED"
    | "SLUG_CHANGED";
  actorId: string;
  actorRole: string;
  reason?: string;
  previousState?: string;
  newState?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface TheatreSearchFilters {
  query?: string; // Searches name, slug, city, chain, adminName
  status?: TheatreLifecycleState | "ALL";
  approvalStatus?: TheatreApprovalState | "ALL";
  onlySuspended?: boolean;
  onlyArchived?: boolean;
  includeDeleted?: boolean;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  sortBy?: "name" | "city" | "createdAt" | "updatedAt" | "status" | "hallCount";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface PaginatedTheatresResult {
  items: ManagedTheatreEntity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  summaryMetrics: {
    totalActiveFleets: number;
    draftCount: number;
    pendingApprovalCount: number;
    approvedCount: number;
    activeCount: number;
    suspendedCount: number;
    archivedCount: number;
    softDeletedCount: number;
  };
}

export interface TheatreLifecycleDetailBundle {
  theatre: ManagedTheatreEntity;
  statusHistory: TheatreStatusTransitionRecord[];
  approvals: TheatreApprovalRecord[];
  slugHistory: TheatreSlugHistoryRecord[];
  auditLogs: TheatreLifecycleAuditRecord[];
  allowedTransitions: TheatreLifecycleState[];
}

