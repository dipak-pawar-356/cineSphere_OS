"use server";

import {
  CustomerCity,
  CustomerDiscoveryFilters,
  CustomerMovieDTO,
  CustomerPriceSummaryDTO,
  CustomerSeatDTO,
  CustomerShowDetailsResponse,
  CustomerShowDTO,
  CustomerTheatreDTO,
} from "@/types/customer-discovery.types";
import {
  ALL_CUSTOMER_CITIES,
  calculateCustomerPriceSummary,
  getFilteredMovies,
  getFilteredShows,
  getFilteredTheatres,
  getUnifiedCustomerShowDetails,
} from "@/lib/engine/customer-discovery-engine";

/**
 * ==============================================================================
 * CineSphere OS — Customer Discovery Server Actions (Phase 2 – Part 10)
 * ==============================================================================
 * Reusable server-side data fetching actions providing strict tenant isolation,
 * safety parameter validation, and published data enforcement.
 * ==============================================================================
 */

export interface DiscoveryActionResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

/**
 * Server Action: Fetch All Available Cities
 */
export async function fetchAvailableCitiesAction(): Promise<
  DiscoveryActionResponse<CustomerCity[]>
> {
  return {
    success: true,
    data: ALL_CUSTOMER_CITIES,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Server Action: Fetch Published Movies with City & Facet Filtering
 */
export async function fetchPublishedMoviesAction(
  filters: CustomerDiscoveryFilters = {}
): Promise<DiscoveryActionResponse<CustomerMovieDTO[]>> {
  const movies = getFilteredMovies(filters);
  return {
    success: true,
    data: movies,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Server Action: Fetch Published Theatres with Screening Counts
 */
export async function fetchPublishedTheatresAction(
  filters: CustomerDiscoveryFilters = {}
): Promise<DiscoveryActionResponse<CustomerTheatreDTO[]>> {
  const theatres = getFilteredTheatres(filters);
  return {
    success: true,
    data: theatres,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Server Action: Fetch Published Shows Grouped by Date/Complex
 */
export async function fetchPublishedShowsAction(
  filters: CustomerDiscoveryFilters = {}
): Promise<DiscoveryActionResponse<CustomerShowDTO[]>> {
  const shows = getFilteredShows(filters);
  return {
    success: true,
    data: shows,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Central Server Action: Fetch Unified Show Details by Single Show ID
 * Resolves Movie, Theatre, Hall, Layout, Seat Inventory, Pricing, and Legends.
 */
export async function fetchCustomerShowDetailsAction(
  showId: string
): Promise<DiscoveryActionResponse<CustomerShowDetailsResponse>> {
  const safeShowId = showId?.trim() || "show-pun-001";
  const details = getUnifiedCustomerShowDetails(safeShowId);

  return {
    success: true,
    data: details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Server Action: Fetch Show Seat Inventory
 * Resolves the generated seats from the Show Seat Inventory.
 */
export async function fetchSeatInventoryAction(
  showId: string
): Promise<DiscoveryActionResponse<CustomerSeatDTO[]>> {
  const safeShowId = showId?.trim() || "show-pun-001";
  const details = getUnifiedCustomerShowDetails(safeShowId);

  return {
    success: true,
    data: details.seatInventory,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Server Action: Calculate Customer Price Summary (UI only, no payment)
 */
export async function fetchCustomerPriceSummaryAction(
  selectedSeatNumbers: string[],
  showId: string
): Promise<DiscoveryActionResponse<CustomerPriceSummaryDTO>> {
  const details = getUnifiedCustomerShowDetails(showId);
  const summary = calculateCustomerPriceSummary(selectedSeatNumbers, details);

  return {
    success: true,
    data: summary,
    timestamp: new Date().toISOString(),
  };
}

// ==============================================================================
// Verbatim Server Action Exports (Phase 2 Part 10 Specifications)
// ==============================================================================
export const fetchMoviesAction = fetchPublishedMoviesAction;
export const fetchTheatresAction = fetchPublishedTheatresAction;
export const fetchShowsAction = fetchPublishedShowsAction;
export const fetchPricingSummaryAction = fetchCustomerPriceSummaryAction;


