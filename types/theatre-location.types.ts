/**
 * ==============================================================================
 * CineSphere OS — Theatre Address & Location Management Contracts (Phase 3 – Part 4)
 * ==============================================================================
 * Multi-tenant domain contracts for physical cinema addresses, geographic hierarchy,
 * coordinates, navigation routing, verification state, and future geospatial indexing.
 * ==============================================================================
 */

import { PaginatedResult } from "@/lib/performance/cache-strategy";

export type TheatreLocationStatus = "DRAFT" | "VERIFIED" | "PUBLISHED" | "ARCHIVED";

export type TheatreLocationVerificationStatus =
  | "UNVERIFIED"
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "REJECTED";

export type TheatreCoordinateSource =
  | "MANUAL"
  | "GEOCODED"
  | "GPS"
  | "SYSTEM"
  | "MAP_PIN";

export interface GeoFencePoint {
  lat: number;
  lng: number;
}

export interface TheatreLocationRecord {
  id: string;
  theatreId: string;
  locationName: string;
  isPrimary: boolean;
  status: TheatreLocationStatus;
  version: number;

  // Address Details
  addressLine1: string;
  addressLine2?: string | null;
  area?: string | null;
  city: string;
  district?: string | null;
  state: string;
  country: string;
  postalCode: string;
  landmark?: string | null;
  locality?: string | null;
  neighbourhood?: string | null;

  // Pre-formatted denormalized strings
  displayAddress?: string | null;
  formattedAddress?: string | null;

  // Navigation & Google Maps
  googleMapsUrl?: string | null;
  placeId?: string | null;
  mapEmbedUrl?: string | null;
  mapShareLink?: string | null;
  navigationLink?: string | null;
  drivingDirectionsUrl?: string | null;
  walkingDirectionsUrl?: string | null;
  transitDirectionsUrl?: string | null;
  rideBookingUrl?: string | null;

  // Verification Metadata
  verificationStatus: TheatreLocationVerificationStatus;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  verificationNotes?: string | null;
  rejectedReason?: string | null;

  // Publication & Archival
  publishedBy?: string | null;
  publishedAt?: string | null;
  archivedBy?: string | null;
  archivedAt?: string | null;
  archivedReason?: string | null;

  // Audit
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TheatreCoordinatesRecord {
  id: string;
  locationId: string;
  theatreId: string;
  latitude: number;
  longitude: number;
  coordinateSource: TheatreCoordinateSource;
  accuracyMeters?: number | null;
  geohash?: string | null;
  spatialIndexPlaceholder?: string | null;
  elevationMeters?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TheatreGeoMetadataRecord {
  id: string;
  locationId: string;
  theatreId: string;
  countryCode: string;
  stateCode: string;
  citySlug?: string | null;
  districtCode?: string | null;
  timezone: string;
  serviceRadiusKm: number;
  servedPostalCodes: string[];
  nearestLandmarkDistanceMeters?: number | null;
  geoSearchKeywords: string[];
  geoFencePolygonPlaceholder?: GeoFencePoint[];
  createdAt: string;
  updatedAt: string;
}

export interface TheatreLocationVersionRecord {
  id: string;
  locationId: string;
  theatreId: string;
  versionNumber: number;
  previousValues: Record<string, unknown>;
  nextValues: Record<string, unknown>;
  updatedFields: string[];
  changeSummary?: string | null;
  updatedBy?: string | null;
  updatedByRole: string;
  updatedAt: string;
}

export interface TheatreLocationBundle {
  location: TheatreLocationRecord;
  coordinates?: TheatreCoordinatesRecord | null;
  geoMetadata?: TheatreGeoMetadataRecord | null;
  theatreName: string;
  theatreSlug: string;
}

export interface PublicTheatreLocationView {
  theatreId: string;
  theatreName: string;
  theatreSlug: string;
  locationId: string;
  locationName: string;
  isPrimary: boolean;
  completeAddress: string;
  displayAddress: string;
  formattedAddress: string;
  landmark?: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
  googleMapsUrl?: string | null;
  navigationLink?: string | null;
}

export interface SearchTheatreLocationFilters {
  theatreId?: string;
  query?: string;
  country?: string;
  state?: string;
  city?: string;
  area?: string;
  postalCode?: string;
  landmark?: string;
  status?: TheatreLocationStatus;
  verificationStatus?: TheatreLocationVerificationStatus;
  scopedTenantId?: string;
  page?: number;
  pageSize?: number;
}

export type PaginatedTheatreLocationResult = PaginatedResult<TheatreLocationBundle>;

export interface TheatreLocationAuditRecord {
  id: string;
  locationId: string;
  theatreId: string;
  action:
    | "LOCATION_CREATED"
    | "LOCATION_UPDATED"
    | "COORDINATES_UPDATED"
    | "LOCATION_VERIFIED"
    | "LOCATION_PUBLISHED"
    | "LOCATION_ARCHIVED";
  actorUserId?: string | null;
  actorRole: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Input DTOs
export interface CreateTheatreLocationInput {
  theatreId: string;
  locationName?: string;
  isPrimary?: boolean;
  addressLine1: string;
  addressLine2?: string;
  area?: string;
  city: string;
  district?: string;
  state: string;
  country?: string;
  postalCode: string;
  landmark?: string;
  locality?: string;
  neighbourhood?: string;
  googleMapsUrl?: string;
  placeId?: string;
  navigationLink?: string;
  latitude?: number;
  longitude?: number;
  coordinateSource?: TheatreCoordinateSource;
}

export interface UpdateTheatreLocationInput {
  locationId: string;
  theatreId: string;
  expectedVersion?: number;
  locationName?: string;
  isPrimary?: boolean;
  addressLine1?: string;
  addressLine2?: string;
  area?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  landmark?: string;
  locality?: string;
  neighbourhood?: string;
  googleMapsUrl?: string;
  placeId?: string;
  mapEmbedUrl?: string;
  mapShareLink?: string;
  navigationLink?: string;
  drivingDirectionsUrl?: string;
  walkingDirectionsUrl?: string;
  transitDirectionsUrl?: string;
  rideBookingUrl?: string;
  serviceRadiusKm?: number;
  servedPostalCodes?: string[];
}

export interface UpdateCoordinatesInput {
  locationId: string;
  theatreId: string;
  latitude: number;
  longitude: number;
  coordinateSource?: TheatreCoordinateSource;
  accuracyMeters?: number;
  elevationMeters?: number;
}

export interface VerifyLocationInput {
  locationId: string;
  theatreId: string;
  decision: "VERIFY" | "REJECT";
  notes?: string;
  reason?: string;
}

export interface LocationStatusTransitionInput {
  locationId: string;
  theatreId: string;
  targetStatus: TheatreLocationStatus;
  reason?: string;
}

export interface ValidateAddressInput {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country?: string;
  postalCode: string;
}

export interface AddressValidationResult {
  isValid: boolean;
  normalizedAddress: string;
  formattedDisplay: string;
  fieldErrors?: Record<string, string[]>;
  warnings?: string[];
}
