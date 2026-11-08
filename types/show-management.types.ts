import { ID } from "./common.types";
import { MovieFormat, MovieLanguage } from "./movie.types";
import { SeatCategoryTier, SeatStatus, SeatType } from "./hall.types";
import { ShowSeat, ShowStatus } from "./show.types";

/**
 * ==============================================================================
 * CineSphere OS — Show Management & Scheduling Types (Phase 2 – Part 8)
 * ==============================================================================
 * Core Architectural Principle:
 * A Show is NOT simply Movie + Hall + Date + Time.
 * A Show represents a COMPLETE SCREENING EVENT:
 *   Movie + Theatre + Hall + Date + Start Time + End Time + Language + Format
 *   + Pricing Profile + Seat Inventory + Booking Status + Sales Status = SHOW
 *
 * The Show is the central business entity of the platform.
 * Every booking, payment, QR ticket, seat availability, occupancy, analytics,
 * and report will reference the Show, not the Movie or Hall directly.
 * ==============================================================================
 */

export type { ShowStatus };

export type BookingAvailabilityStatus =
  | "Booking Open"
  | "Booking Closed"
  | "Sold Out"
  | "Cancelled"
  | "Hidden"
  | "Waitlist";

export type ShowSalesStatus =
  | "On Sale"
  | "Off Sale"
  | "Fast Selling"
  | "Sold Out"
  | "Not Started";

export type TimeSlotType = "Morning" | "Matinee" | "Evening" | "Night";
export type DayClassification = "Weekday" | "Weekend" | "Holiday" | "All";

/**
 * Reusable Pricing Profile Subsystem
 * Instead of storing prices directly on a Show, a Show references a Pricing Profile.
 * e.g. "Morning Weekday Economy" (Silver ₹180, Gold ₹240, Platinum ₹320, VIP ₹450, Recliner ₹550)
 */
export interface PricingProfile {
  id: string; // e.g. "pp-morning-weekday"
  theatreId: string; // e.g. "th-pun-001"
  name: string; // e.g. "Morning Weekday Economy"
  description: string;
  dayType: DayClassification;
  slotType: TimeSlotType | "All";
  tierPricing: Record<string, number>; // Tier name (Silver, Gold, Platinum, VIP, Recliner) -> price in INR
  convenienceFee: number; // default ₹35.00
  gstPercent: number; // default 18.00%
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Enriched Complete Show Entity
 * Central business entity connecting Movie, Theatre, Hall, Timetable, Pricing, and Seat Inventory.
 */
export interface EnrichedShow {
  id: string;
  showCode: string; // Human-readable e.g. "SH-PUN-01-DUNE2-1915"
  slug: string; // e.g. "pune-phoenix-imax-dune-2-1915"

  // Movie Linkage
  movieId: string;
  movieTitle: string;
  moviePosterUrl?: string;
  movieBannerUrl?: string;
  movieDurationMinutes: number;
  movieCertificate?: string;

  // Multi-Tenant Cinema & Auditorium Linkage
  theatreId: string;
  theatreName: string;
  hallId: string;
  hallName: string;
  hallCode?: string;
  screenType: string;

  // Screening Timetable & Turnaround Math
  date: string; // ISO YYYY-MM-DD
  startTime: string; // "19:15" (or "07:15 PM")
  endTime: string; // "22:15" (or "10:15 PM")
  durationMinutes: number; // Feature movie runtime
  intermissionMinutes: number; // e.g. 15 mins
  cleaningBufferMinutes: number; // e.g. 20 mins turnaround window
  totalOccupiedMinutes: number; // duration + intermission + cleaning buffer

  // Exhibition Specs
  language: string; // e.g. "Hindi (Dolby Atmos)"
  format: string; // e.g. "IMAX 3D", "4DX", "Dolby Cinema"

  // Lifecycle & Operational Status
  status: ShowStatus;
  bookingStatus: BookingAvailabilityStatus;
  salesStatus: ShowSalesStatus;

  // Dynamic Pricing Profile Association
  pricingProfileId: string;
  pricingProfileName: string;
  sectionPricing: Record<string, number>;
  ticketPrice: number; // Starting/Base price (e.g. ₹250)

  // Real-Time Seat Inventory & Capacity Metrics
  totalSeats: number;
  seatsBooked: number;
  seatsAvailable: number;
  seatsBlocked: number;
  occupancyPercent: number;
  revenueEstimated: number;

  // Optional Full Seat Inventory (hydrated on demand)
  seatInventory?: ShowSeat[];

  // Scheduling Diagnostics
  isConflict?: boolean;
  conflictReason?: string;

  createdAt: string;
  updatedAt: string;
}

/**
 * Input DTO for Creating a Show
 */
export interface CreateShowInput {
  movieId: string;
  theatreId: string;
  hallId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "19:15" or "07:15 PM"
  language: string;
  format: string;
  pricingProfileId: string;
  intermissionMinutes?: number;
  cleaningBufferMinutes?: number;
  status?: ShowStatus;
  bookingStatus?: BookingAvailabilityStatus;
  salesStatus?: ShowSalesStatus;
  ticketPrice?: number;
}

/**
 * Input DTO for Updating a Show
 */
export type UpdateShowInput = Partial<CreateShowInput>;

/**
 * Scheduling Conflict Result from Scheduling Engine
 */
export interface ScheduleConflictResult {
  hasConflict: boolean;
  conflictType: "NONE" | "HALL_OVERLAP" | "CLEANING_VIOLATION" | "INVALID_TIMELINE";
  message: string;
  conflictingShowId?: string;
  conflictingShowTitle?: string;
  conflictingTimeWindow?: string;
  suggestedStartTime?: string;
}

/**
 * Multi-Faceted Filter Options for Shows
 */
export interface ShowFilterOptions {
  query?: string;
  date?: string;
  movieId?: string;
  hallId?: string;
  language?: string;
  format?: string;
  status?: string;
  bookingStatus?: string;
  timeSlot?: TimeSlotType | "All";
}

/**
 * Calendar Timeline Grid Types
 */
export interface ShowCalendarSlot {
  id: string;
  showId: string;
  hallId: string;
  hallName: string;
  movieTitle: string;
  moviePoster?: string;
  format: string;
  language: string;
  startMinutes: number; // Minutes from midnight (e.g. 19*60 + 15 = 1155)
  endMinutes: number;
  cleaningEndMinutes: number;
  startTimeFormatted: string;
  endTimeFormatted: string;
  status: ShowStatus;
  bookingStatus: BookingAvailabilityStatus;
  occupancyPercent: number;
  isConflict?: boolean;
}

/**
 * Audit Log Record for Show Mutations
 */
export interface ShowAuditLogRecord {
  id: string;
  action: "CREATED" | "UPDATED" | "CANCELLED" | "ARCHIVED" | "DUPLICATED" | "SEAT_INVENTORY_GENERATED";
  showId: string;
  showCode: string;
  movieTitle: string;
  hallName: string;
  theatreId: string;
  user: string;
  timestamp: string;
  details: string;
  status: "SUCCESS" | "FAILED";
}
