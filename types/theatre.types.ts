import { ID, ContactInformation, MediaAsset } from "./common.types";
import { MovieFormat } from "./movie.types";
import { UPIConfiguration } from "./payment.types";

export type TheatreStatus = "Active" | "Maintenance" | "Renovating" | "Pending Approval";

export type PricingTier = "Luxury" | "Premium" | "Standard" | "Budget";

export type TheatreAmenity =
  | "Barco 4K Laser Projection"
  | "Dolby Atmos 64-Channel Spatial Audio"
  | "IMAX with Laser"
  | "4DX Dynamic Motion & Environmental FX"
  | "Zero-Gravity Ultra Recliners"
  | "Gourmet In-Seat Butler Dining"
  | "Fast Electric Vehicle (EV) Charging Stations"
  | "Dedicated Valet Drop-off & Retrieval"
  | "Accessible Ramps & Companion Wheelchair Seating"
  | "High-Speed Wi-Fi & Lounge Bar"
  | "Dolby Cinema"
  | "ScreenX 270-Degree Panorama";

export type TheatreFacility =
  | "Multi-Cuisine Gourmet Concessions Lounge"
  | "Kids Play Zone & Arcade Alcove"
  | "Executive Boardroom for Corporate Screenings"
  | "Baby Care Station & Private Feeding Suite"
  | "Luggage Cloakroom & Powerbank Dispenser"
  | "Automated QR Ticket Gates with Facial Check-In"
  | "ATM & Cash Dispenser"
  | "Prayer Room";

/**
 * Multi-Tenant Independent Theatre Model
 * Each Theatre operates independently inside CineSphere OS.
 * No theatre can affect or access another theatre's data.
 */
export interface Theatre {
  id: ID;
  slug: string;
  name: string;
  chain: string;
  code?: string;
  tagline?: string;
  description?: string;
  logo: string;
  banner: string;
  address: string;
  city: string;
  state: string;
  pinCode?: string;
  country: string;
  distanceKm?: number;
  rating: number;
  reviewsCount?: number;
  hallCount: number;
  totalScreens?: number;
  totalSeats?: number;
  screenTypes: MovieFormat[];
  amenities?: (TheatreAmenity | string)[];
  facilities: string[];
  pricingTier: PricingTier;
  status?: TheatreStatus;
  contact?: ContactInformation;
  openingTime?: string;
  closingTime?: string;
  isFeatured?: boolean;
  gallery?: MediaAsset[];

  // Multi-Tenant Governance & Operational Settings
  admins?: string[];
  upiDetails?: UPIConfiguration;
  gstNumber?: string;
  currency?: string;
  timezone?: string;
  bookingTerms?: string[];
  cancellationRules?: string[];
  refundRules?: string[];
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}
