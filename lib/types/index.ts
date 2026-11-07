export type MovieFormat = "2D" | "3D" | "IMAX" | "4DX" | "Dolby Atmos" | "ScreenX" | "70mm Film";

export interface SystemStat {
  label: string;
  value: string;
  subtext?: string;
}

export interface Movie {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  poster: string;
  banner: string;
  genre: string[];
  languages: string[];
  durationMinutes: number;
  rating: number;
  releaseDate: string;
  certification: string;
  formats: MovieFormat[];
  isFeatured?: boolean;
  isComingSoon?: boolean;
  director: string;
  cast: string[];
}

export interface Theatre {
  id: string;
  name: string;
  slug: string;
  chain: string;
  logo: string;
  banner: string;
  address: string;
  city: string;
  state: string;
  distanceKm?: number;
  rating: number;
  reviewsCount: number;
  hallCount: number;
  screenTypes: MovieFormat[];
  facilities: string[];
  isFeatured?: boolean;
  pricingTier: "Luxury" | "Premium" | "Standard";
}

export type OfferCategory =
  | "Coupons"
  | "Cashback"
  | "Membership"
  | "Festival Offers"
  | "Food Offers"
  | "Combo Offers"
  | "Student Discount";

export interface Offer {
  id: string;
  code: string;
  title: string;
  tagline: string;
  discount: string;
  category: OfferCategory;
  validUntil: string;
  minSpend?: string;
  terms: string[];
  badgeText: string;
  accentColor: string;
}

export type EventCategory =
  | "Concerts"
  | "Sports"
  | "Stand-up"
  | "Theatre"
  | "Festival"
  | "Live Shows";

export interface LiveEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  city: string;
  banner: string;
  priceStart: string;
  rating: number;
  isComingSoon?: boolean;
  tags: string[];
}

export interface MetricCardData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  description: string;
  iconName: string;
}

export interface RecentBooking {
  id: string;
  bookingRef: string;
  movieTitle: string;
  theatreName: string;
  screens: string;
  seats: string;
  amount: string;
  timestamp: string;
  status: "Confirmed" | "Processing" | "Refunded";
}
