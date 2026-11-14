/**
 * ==============================================================================
 * CineSphere OS — Public Theatre Read Model Contracts (Phase 3 – Part 13)
 * ==============================================================================
 * Dedicated Read Model (PublicTheatreView) that aggregates only the public-facing
 * data for the Public Theatre Website.
 * Strictly separates the public experience from internal management data
 * (no GST, PAN, Staff, Payments, Bookings, or internal configuration).
 * ==============================================================================
 */

export interface PublicGalleryImage {
  id: string;
  url: string;
  title: string;
  caption?: string;
  displayOrder: number;
}

export interface PublicBrandingView {
  logoUrl?: string;
  bannerUrl?: string;
  heroImageUrl?: string;
  coverImageUrl?: string;
  thumbnailUrl?: string;
  gallery: PublicGalleryImage[];
}

export interface PublicTheatreLanguage {
  id: string;
  name: string;
  isPrimary: boolean;
}

export interface PublicTheatreProfileView {
  theatreId: string;
  slug: string;
  displayName: string;
  legalName?: string;
  establishedYear?: number;
  theatreType: string;
  ownershipModel: string;
  chainType: "CHAIN" | "INDEPENDENT";
  chainName?: string;
  tagline?: string;
  aboutTheatre: string;
  description: string;
  languages: PublicTheatreLanguage[];
  screensCount: number;
  totalSeatingCapacity: number;
  businessCategory: string;
}

export interface PublicLocationView {
  completeAddress: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  area?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  googleMapsUrl?: string;
  navigationUrl?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface PublicSocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
}

export interface PublicContactView {
  primaryPhone?: {
    number: string;
    formatted: string;
    label: string;
  };
  supportEmail?: {
    email: string;
    label: string;
    department?: string;
  };
  emergencyDesk?: {
    phone: string;
    officer?: string;
    label: string;
  };
  dutyManager?: {
    name?: string;
    phone?: string;
    designation?: string;
    department?: string;
  };
  website?: string;
  socialLinks: PublicSocialLink[];
}

export interface PublicAmenityItem {
  id: string;
  name: string;
  category: "TECHNOLOGY" | "COMFORT" | "ACCESSIBILITY" | "HOSPITALITY" | "OTHER";
  icon: string;
  description?: string;
  notes?: string;
  isFeatured: boolean;
  metadata?: {
    parkingCapacity?: number;
    evChargerCount?: number;
    wifiSsid?: string;
  };
}

export interface PublicMovieSummary {
  id: string;
  slug: string;
  title: string;
  posterUrl: string;
  bannerUrl?: string;
  synopsis?: string;
  durationMinutes: number;
  certification: string;
  genres: string[];
  languages: string[];
  formats: string[];
  rating?: number;
  showCount: number;
  status: "NOW_SHOWING" | "COMING_SOON";
  releaseDate: string;
}

export interface PublicShowItem {
  id: string;
  showCode: string;
  movieId: string;
  movieTitle: string;
  moviePosterUrl: string;
  hallId: string;
  hallName: string;
  screenType: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  format: string;
  language: string;
  ticketPrice: number;
  formattedPrice: string;
  availableSeats: number;
  totalSeats: number;
  status: "SCHEDULED" | "FILLING_FAST" | "SOLD_OUT";
  bookingStatusPlaceholder: "AVAILABLE" | "FILLING_FAST" | "SOLD_OUT";
}

export interface PublicHallSummary {
  id: string;
  name: string;
  screenType: string;
  capacity: number;
  soundSystem: string;
  projectionType: string;
  premiumFeatures: string[];
  status: "Operational" | "Maintenance";
}

export interface PublicDailyOperatingHours {
  dayOfWeek: string; // "MONDAY".."SUNDAY"
  dayLabel: string; // "Mon", "Tue", etc.
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  isOvernight: boolean;
  formattedHours: string;
}

export interface PublicOperatingHoursView {
  todayHours: string;
  isOpenNow: boolean;
  weeklySchedule: PublicDailyOperatingHours[];
  holidayNoticePlaceholder?: string;
}

export interface PublicReviewPlaceholderItem {
  id: string;
  authorName: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPatron: boolean;
}

export interface PublicReviewsSummaryPlaceholder {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  customerPhotos: Array<{
    id: string;
    url: string;
    caption?: string;
  }>;
  reviewListPlaceholder: PublicReviewPlaceholderItem[];
}

export interface PublicTheatreConfigurationView {
  currency: string;
  currencySymbol: string;
  timezone: string;
  primaryLanguage: string;
  numberFormat: "INDIAN" | "INTERNATIONAL";
  timeFormat: "12H" | "24H";
}

export interface PublicTheatreSEO {
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTags: {
    title: string;
    description: string;
    image: string;
    url: string;
    type: "website";
  };
  twitterCard: {
    card: "summary_large_image";
    title: string;
    description: string;
    image: string;
  };
  friendlySlug: string;
  jsonLdSchema: Record<string, unknown>;
}

/**
 * The Master Aggregated Public Read Model
 */
export interface PublicTheatreView {
  theatreId: string;
  slug: string;
  branding: PublicBrandingView;
  profile: PublicTheatreProfileView;
  location: PublicLocationView;
  contact: PublicContactView;
  amenities: PublicAmenityItem[];
  runningMovies: PublicMovieSummary[];
  upcomingMovies: PublicMovieSummary[];
  shows: PublicShowItem[];
  halls: PublicHallSummary[];
  operatingHours: PublicOperatingHoursView;
  reviewsSummary: PublicReviewsSummaryPlaceholder;
  configuration: PublicTheatreConfigurationView;
  seo: PublicTheatreSEO;
  generatedAt: string;
}

export interface LoadPublicTheatreInput {
  slugOrId: string;
  previewMode?: boolean;
}

export interface LoadPublicShowsInput {
  theatreIdOrSlug: string;
  date?: string; // YYYY-MM-DD or "Today"
  format?: string;
  movieId?: string;
}

export interface LoadPublicMoviesInput {
  theatreIdOrSlug: string;
  status?: "NOW_SHOWING" | "COMING_SOON" | "ALL";
}
