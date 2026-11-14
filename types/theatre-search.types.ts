/**
 * ==============================================================================
 * CineSphere OS — Theatre Search & Filters Contracts (Phase 3 – Part 12)
 * ==============================================================================
 * Generic search architecture contracts and dedicated Theatre Search Index models.
 * Decouples the UI from direct multi-table SQL LIKE queries and prepares the
 * platform for future search engines (Elasticsearch, Meilisearch, Algolia).
 * ==============================================================================
 */

import { TheatreLifecycleState, TheatreApprovalState } from "./theatre-lifecycle.types";

// ------------------------------------------------------------------------------
// 1. Generic Search Framework Interfaces
// ------------------------------------------------------------------------------

export interface GenericPaginationInput {
  page?: number;
  pageSize?: number;
}

export interface GenericPaginationResult {
  page: number;
  pageSize: number;
  totalResults: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GenericSearchQuery<TFilters, TSort extends string = string> {
  query?: string;
  filters?: TFilters;
  sortBy?: TSort;
  sortDirection?: "asc" | "desc";
  pagination?: GenericPaginationInput;
}

export interface GenericSearchResults<TItem> {
  items: TItem[];
  pagination: GenericPaginationResult;
  tookMs: number;
  facets?: Record<string, FacetBucket[]>;
}

export interface FacetBucket {
  value: string;
  label: string;
  count: number;
}

// ------------------------------------------------------------------------------
// 2. Theatre Search Index Document Model
// ------------------------------------------------------------------------------

/**
 * Denormalized search index document representing a single cinema complex.
 * Aggregates Theatre Root, Profile, Location, Business, Amenities, Configuration, and Staff.
 */
export interface TheatreSearchDocument {
  theatreId: string;
  slug: string;
  code: string;
  name: string;
  legalName: string;
  status: TheatreLifecycleState;
  approvalStatus: TheatreApprovalState;
  isVerified: boolean;
  theatreType: "PREMIUM" | "STANDARD";
  chainType: "CHAIN" | "INDEPENDENT";
  chainName: string | null;
  businessCategory: string; // "MULTIPLEX" | "PRIVATE_LIMITED" | "SINGLE_SCREEN" | etc.
  gstNumber: string;
  cinNumber?: string;
  panNumber?: string;

  // Location Dimension
  location: {
    city: string;
    state: string;
    country: string;
    area: string;
    postalCode: string;
    addressLine1: string;
    latitude?: number;
    longitude?: number;
    geohash?: string;
  };

  // Facility & Screen Dimension
  screensCount: number;
  totalCapacity: number;
  screenTypes: string[]; // ["IMAX Laser", "Dolby Atmos", "4DX", etc.]
  amenityCodes: string[];
  amenityNames: string[];

  // Primary Staff Admin
  primaryAdmin: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    designation?: string;
  };

  // Theatre Configuration & Localization
  configuration: {
    currency: string;
    currencySymbol: string;
    timezone: string;
    primaryLanguage: string;
    supportedLanguages: string[];
    numberFormat: "INDIAN" | "INTERNATIONAL";
    timeFormat: "12H" | "24H";
  };

  // Branding
  branding: {
    logoUrl: string | null;
    bannerUrl: string | null;
    primaryColor: string;
  };

  // Operational Metrics Snapshot
  metricsSnapshot: {
    rating: number;
    reviewsCount: number;
    liveOccupancyPercent?: number;
    todayRevenue?: number;
  };

  // Pre-normalized text for rapid multi-token keyword searching
  searchableText: string;

  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// 3. Search & Filter Input Models
// ------------------------------------------------------------------------------

export type TheatreSearchSortOption =
  | "NEWEST"
  | "OLDEST"
  | "NAME_ASC"
  | "NAME_DESC"
  | "RECENTLY_UPDATED"
  | "MOST_SCREENS"
  | "LARGEST_CAPACITY"
  | "DISTANCE_ASC";

export interface TheatreSearchFilters {
  query?: string;
  statuses?: TheatreLifecycleState[];
  isVerified?: boolean;
  theatreType?: "PREMIUM" | "STANDARD" | "ALL";
  chainType?: "CHAIN" | "INDEPENDENT" | "ALL";
  chainName?: string;
  businessCategories?: string[];
  countries?: string[];
  states?: string[];
  cities?: string[];
  timezones?: string[];
  currencies?: string[];
  languages?: string[];
  amenities?: string[];
  screensMin?: number;
  screensMax?: number;
  capacityMin?: number;
  capacityMax?: number;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;

  // Future Geo Search Placeholders
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

export interface TheatreSearchQueryInput {
  query?: string;
  filters?: TheatreSearchFilters;
  sortBy?: TheatreSearchSortOption;
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

// ------------------------------------------------------------------------------
// 4. Search Result DTOs for UI Rendering
// ------------------------------------------------------------------------------

export interface TheatreSearchResultItem {
  theatreId: string;
  theatreName: string;
  theatreSlug: string;
  theatreCode: string;
  legalName: string;
  status: TheatreLifecycleState;
  approvalStatus: TheatreApprovalState;
  isVerified: boolean;
  theatreType: "PREMIUM" | "STANDARD";
  chainType: "CHAIN" | "INDEPENDENT";
  chainName: string | null;
  businessCategory: string;

  // Geographical tags
  city: string;
  state: string;
  country: string;
  area: string;
  postalCode: string;

  // Capacities
  screensCount: number;
  totalCapacity: number;
  screenTypes: string[];
  amenitiesSummary: string[];

  // Primary Staff Admin
  primaryAdmin: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };

  // Localized Presentation
  configuration: {
    currency: string;
    currencySymbol: string;
    timezone: string;
    primaryLanguage: string;
    numberFormat: "INDIAN" | "INTERNATIONAL";
    timeFormat: "12H" | "24H";
  };

  // Media
  logoUrl: string | null;
  bannerUrl: string | null;

  // Operational metrics
  rating: number;
  reviewsCount: number;
  todayRevenue?: number;
  occupancyPercent?: number;

  createdDate: string;
  updatedDate: string;

  // Search contextual relevance
  matchHighlights?: string[];
  distanceKm?: number;
}

export interface TheatreSearchResultsPayload {
  items: TheatreSearchResultItem[];
  pagination: GenericPaginationResult;
  facets: {
    cities: FacetBucket[];
    states: FacetBucket[];
    countries: FacetBucket[];
    statuses: FacetBucket[];
    businessCategories: FacetBucket[];
    theatreTypes: FacetBucket[];
    amenities: FacetBucket[];
    currencies: FacetBucket[];
  };
  tookMs: number;
  appliedFilters: TheatreSearchFilters;
  sortBy: TheatreSearchSortOption;
}

// ------------------------------------------------------------------------------
// 5. Saved Search Presets (Enterprise Addition)
// ------------------------------------------------------------------------------

export interface SavedSearchPreset {
  id: string;
  userId: string;
  name: string;
  description?: string;
  filters: TheatreSearchFilters;
  sortBy: TheatreSearchSortOption;
  sortDirection: "asc" | "desc";
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavedSearchPresetInput {
  name: string;
  description?: string;
  filters: TheatreSearchFilters;
  sortBy?: TheatreSearchSortOption;
  sortDirection?: "asc" | "desc";
  isDefault?: boolean;
}

// ------------------------------------------------------------------------------
// 6. Search Autocomplete Suggestions
// ------------------------------------------------------------------------------

export interface TheatreSearchSuggestion {
  id: string;
  theatreId: string;
  slug: string;
  title: string;
  subtitle: string;
  type: "THEATRE" | "CITY" | "AMENITY" | "CHAIN";
  highlightText?: string;
}
