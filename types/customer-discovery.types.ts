import { ID } from "./common.types";
import { MovieFormat, MovieLanguage } from "./movie.types";
import { SeatCategoryTier, SeatStatus, SeatType } from "./hall.types";
import { ShowStatus } from "./show.types";

/**
 * ==============================================================================
 * CineSphere OS — Customer Discovery & Booking Flow Types (Phase 2 – Part 10)
 * ==============================================================================
 * Architectural Law:
 * Multiple discovery journeys (City-first, Movie-first, Theatre-first, Direct-show)
 * all converge to a single unified Show ID.
 * All downstream data (Movie, Theatre, Hall, Layout, Seat Inventory, Pricing, Legends)
 * is resolved from that central Show ID.
 * ==============================================================================
 */

export type DiscoveryJourneyType =
  | "CITY_FIRST"
  | "MOVIE_FIRST"
  | "THEATRE_FIRST"
  | "DIRECT_SHOW";

export interface CustomerCity {
  id: string;
  name: string;
  state: string;
  theatreCount: number;
  screenCount: number;
  isPopular?: boolean;
  slug: string;
}

export interface CustomerMovieDTO {
  id: string;
  slug: string;
  title: string;
  originalTitle?: string;
  poster: string;
  banner: string;
  synopsis: string;
  shortDescription?: string;
  genre: string[];
  languages: string[];
  durationMinutes: number;
  rating: number;
  certification: string;
  formats: string[];
  releaseDate: string;
  status: "Now Showing" | "Coming Soon";
  director?: string;
  cast?: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  startingPrice?: number;
  availableTheatresCount?: number;
  availableShowsCount?: number;
}

export interface CustomerTheatreDTO {
  id: string;
  slug: string;
  name: string;
  chain: string;
  city: string;
  state: string;
  address: string;
  distanceKm?: number;
  distancePlaceholder?: string;
  rating: number;
  reviewsCount?: number;
  screenTypes: string[];
  amenities: string[];
  facilities?: string[];
  hallCount: number;
  banner: string;
  logo: string;
  startingPrice?: number;
  availableShowsCount?: number;
}

export interface CustomerHallDTO {
  id: string;
  theatreId: string;
  name: string;
  hallNumber: number;
  screenType: string;
  capacity: number;
  soundSystem?: string;
  projectionType?: string;
}

export interface CustomerHallLayoutDTO {
  id: string;
  hallId: string;
  name: string;
  capacity: number;
  screenDirection: "TOP" | "BOTTOM";
  screenCurvature: number;
  sections: {
    id: string;
    name: string;
    tier: SeatCategoryTier | string;
    rows: string[];
    seatsPerRow: number;
    color: string;
    price: number;
  }[];
}

export interface CustomerShowDTO {
  id: string;
  showCode: string;
  movieId: string;
  movieTitle: string;
  moviePosterUrl: string;
  movieBannerUrl: string;
  movieDurationMinutes: number;
  movieCertificate: string;
  theatreId: string;
  theatreName: string;
  theatreCity: string;
  theatreAddress: string;
  hallId: string;
  hallName: string;
  screenType: string;
  date: string;
  startTime: string;
  endTime: string;
  language: MovieLanguage | string;
  format: MovieFormat | string;
  ticketPrice: number;
  totalSeats: number;
  availableSeats: number;
  seatsBooked: number;
  status: ShowStatus;
  pricingProfileId?: string;
  pricingProfileName?: string;
  sectionPricing: Record<string, number>;
}

export interface CustomerSeatDTO {
  id: string;
  showId: string;
  seatNumber: string; // e.g. "A1", "C4", "VIP-1"
  row: string;
  column: number;
  sectionId: string;
  sectionName: string;
  categoryTier: SeatCategoryTier | string;
  seatType: SeatType | string;
  status: SeatStatus;
  price: number; // Inherited from Show's Section Pricing
  isWheelchair?: boolean;
  isRecliner?: boolean;
  isCoupleSeat?: boolean;
  coordinates?: {
    x: number;
    y: number;
  };
}

export interface CustomerSectionLegendDTO {
  sectionId: string;
  sectionName: string;
  categoryTier: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  occupiedSeats: number;
}

export interface CustomerCapacityMetricsDTO {
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  blockedSeats: number;
  occupancyPercent: number;
}

export interface CustomerShowPricingProfileDTO {
  id: string;
  name: string;
  code: string;
  convenienceFee: number;
  gstPercent: number;
  currency: string;
}

/**
 * Unified Snapshot returned when resolving a single Show ID.
 * Replaces independent multi-hop client queries with a single unified payload.
 */
export interface CustomerShowDetailsResponse {
  show: CustomerShowDTO;
  movie: CustomerMovieDTO;
  theatre: CustomerTheatreDTO;
  hall: CustomerHallDTO;
  layout: CustomerHallLayoutDTO;
  seatInventory: CustomerSeatDTO[];
  pricingProfile: CustomerShowPricingProfileDTO;
  sectionLegends: CustomerSectionLegendDTO[];
  capacityMetrics: CustomerCapacityMetricsDTO;
}

export interface CustomerSelectedSeatLineItem {
  seatId: string;
  seatNumber: string;
  row: string;
  column: number;
  sectionName: string;
  categoryTier: string;
  unitPrice: number;
}

export interface CustomerPriceSummaryDTO {
  currency: string;
  selectedSeats: CustomerSelectedSeatLineItem[];
  seatCount: number;
  seatSubtotal: number;
  convenienceFeePerSeat: number;
  convenienceFeeTotal: number;
  gstPercent: number;
  gstTaxTotal: number;
  discountTotal: number;
  grandTotal: number;
}

export interface CustomerDiscoveryFilters {
  city?: string;
  query?: string;
  genre?: string;
  language?: string;
  format?: string;
  certificate?: string;
  theatreId?: string;
  movieId?: string;
  date?: string;
  status?: "Now Showing" | "Coming Soon" | "All";
  priceMin?: number;
  priceMax?: number;
}
