/**
 * ==============================================================================
 * CineSphere OS — Theatre Amenities & Facilities Types (Phase 3 – Part 5)
 * ==============================================================================
 * Production domain models, catalog specifications, theatre assignments,
 * facility metadata, and audit records.
 * ==============================================================================
 */

export type AmenityStatus = "ACTIVE" | "INACTIVE" | "DRAFT" | "ARCHIVED";

export type AmenityAvailabilityMode =
  | "AVAILABLE"
  | "TEMPORARILY_UNAVAILABLE"
  | "SEASONAL"
  | "UNDER_MAINTENANCE";

export type AmenityVisibility = "PUBLIC" | "HIDDEN" | "INTERNAL";

export type AmenityPriority =
  | "CRITICAL"
  | "FEATURED"
  | "HIGH"
  | "MEDIUM"
  | "STANDARD"
  | "LOW";

export type AmenityEntityType = "THEATRE" | "HALL" | "LOUNGE" | "PREMIUM_SCREEN";

// ------------------------------------------------------------------------------
// Category Record
// ------------------------------------------------------------------------------
export interface AmenityCategoryRecord {
  id: string;
  code: string;
  name: string;
  displayName: string;
  description: string | null;
  defaultIcon: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// Catalog Item Record (Super Admin Master)
// ------------------------------------------------------------------------------
export interface AmenityCatalogRecord {
  id: string;
  code: string;
  name: string;
  displayName: string;
  description: string | null;
  categoryId: string;
  categoryCode: string;
  defaultIcon: string;
  customIconUrl: string | null;
  svgPlaceholder: string | null;
  iconLibraryPlaceholder: string | null;
  priority: AmenityPriority;
  isFeatured: boolean;
  displayOrder: number;
  status: AmenityStatus;
  localizedNames: Record<string, string>;
  localizedDescriptions: Record<string, string>;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// Theatre Assignment Record (Tenant Level)
// ------------------------------------------------------------------------------
export interface TheatreAmenityRecord {
  id: string;
  theatreId: string;
  amenityId: string;
  availability: AmenityAvailabilityMode;
  notes: string | null;
  displayOrder: number;
  visibility: AmenityVisibility;
  status: AmenityStatus;
  isFeatured: boolean;
  entityType: AmenityEntityType;
  entityId: string;
  assignedBy: string | null;
  updatedBy: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// Facility Metadata Record (Specific Counts & Details)
// ------------------------------------------------------------------------------
export interface AmenityMetadataRecord {
  id: string;
  theatreAmenityId: string;
  theatreId: string;
  parkingCapacity: number | null;
  evChargerCount: number | null;
  wifiSsid: string | null;
  wifiAvailability: string | null;
  accessibilityNotes: string | null;
  foodCourtInfo: string | null;
  waitingAreaDetails: string | null;
  customAttributes: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// Amenity Version Record
// ------------------------------------------------------------------------------
export interface AmenityVersionRecord {
  id: string;
  amenityId: string | null;
  theatreAmenityId: string | null;
  theatreId: string | null;
  versionNumber: number;
  changeType: string;
  changeSummary: string | null;
  snapshot: Record<string, unknown>;
  changedBy: string | null;
  changedRole: string | null;
  createdAt: string;
}

// ------------------------------------------------------------------------------
// Composite / Enriched DTOs
// ------------------------------------------------------------------------------
export interface TheatreAmenityWithCatalog extends TheatreAmenityRecord {
  amenity: AmenityCatalogRecord;
  category?: AmenityCategoryRecord | null;
  metadata?: AmenityMetadataRecord | null;
}

export interface PublicTheatreAmenityDTO {
  id: string;
  assignmentId: string;
  code: string;
  name: string;
  displayName: string;
  description: string | null;
  category: string;
  categoryCode: string;
  icon: string;
  priority: AmenityPriority;
  isFeatured: boolean;
  availability: AmenityAvailabilityMode;
  notes: string | null;
  displayOrder: number;
  metadata?: {
    parkingCapacity?: number | null;
    evChargerCount?: number | null;
    wifiSsid?: string | null;
    accessibilityNotes?: string | null;
    foodCourtInfo?: string | null;
    waitingAreaDetails?: string | null;
  } | null;
}

export interface TheatreAmenityBundle {
  theatreId: string;
  totalAssigned: number;
  activeCount: number;
  availableCount: number;
  underMaintenanceCount: number;
  categories: AmenityCategoryRecord[];
  assignments: TheatreAmenityWithCatalog[];
}

// ------------------------------------------------------------------------------
// Input Schemas / Action Payloads
// ------------------------------------------------------------------------------
export interface CreateAmenityCatalogInput {
  code: string;
  name: string;
  displayName?: string;
  description?: string | null;
  categoryId: string;
  categoryCode?: string;
  defaultIcon?: string;
  customIconUrl?: string | null;
  priority?: AmenityPriority;
  isFeatured?: boolean;
  displayOrder?: number;
  status?: AmenityStatus;
  localizedNames?: Record<string, string>;
  localizedDescriptions?: Record<string, string>;
}

export interface UpdateAmenityCatalogInput {
  id: string;
  expectedVersion?: number;
  code?: string;
  name?: string;
  displayName?: string;
  description?: string | null;
  categoryId?: string;
  categoryCode?: string;
  defaultIcon?: string;
  customIconUrl?: string | null;
  priority?: AmenityPriority;
  isFeatured?: boolean;
  displayOrder?: number;
  status?: AmenityStatus;
  localizedNames?: Record<string, string>;
  localizedDescriptions?: Record<string, string>;
}

export interface CreateAmenityCategoryInput {
  code: string;
  name: string;
  displayName?: string;
  description?: string | null;
  defaultIcon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface AssignAmenityToTheatreInput {
  theatreId: string;
  amenityId: string;
  availability?: AmenityAvailabilityMode;
  notes?: string | null;
  displayOrder?: number;
  visibility?: AmenityVisibility;
  status?: AmenityStatus;
  isFeatured?: boolean;
  entityType?: AmenityEntityType;
  entityId?: string;
  metadata?: Partial<Omit<AmenityMetadataRecord, "id" | "theatreAmenityId" | "theatreId" | "createdAt" | "updatedAt">>;
}

export interface UpdateTheatreAmenityInput {
  assignmentId: string;
  theatreId: string;
  expectedVersion?: number;
  availability?: AmenityAvailabilityMode;
  notes?: string | null;
  displayOrder?: number;
  visibility?: AmenityVisibility;
  status?: AmenityStatus;
  isFeatured?: boolean;
  metadata?: Partial<Omit<AmenityMetadataRecord, "id" | "theatreAmenityId" | "theatreId" | "createdAt" | "updatedAt">>;
}

export interface ReorderTheatreAmenitiesInput {
  theatreId: string;
  orderedAssignmentIds: string[];
}

export interface AmenityCatalogFilterParams {
  query?: string;
  categoryId?: string;
  categoryCode?: string;
  status?: AmenityStatus;
  priority?: AmenityPriority;
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
}

export interface TheatreAmenityFilterParams {
  theatreId?: string;
  scopedTenantId?: string;
  query?: string;
  categoryCode?: string;
  status?: AmenityStatus;
  availability?: AmenityAvailabilityMode;
  visibility?: AmenityVisibility;
  isFeatured?: boolean;
  assignedOnly?: boolean;
  page?: number;
  pageSize?: number;
}
