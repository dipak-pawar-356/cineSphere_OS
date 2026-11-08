import { ID } from "./common.types";
import { MovieFormat, MovieLanguage } from "./movie.types";
import { SeatStatus, SeatType } from "./hall.types";

export type ShowStatus = "Upcoming" | "Running" | "Housefull" | "Completed" | "Cancelled";

/**
 * Show Pricing by Section
 * Crucial Rule: Pricing belongs to the Show, NEVER stored permanently in Hall Layout!
 * E.g. Morning show Section A = ₹200, Night show Section A = ₹250.
 */
export interface ShowPricing {
  sectionPricing: Record<string, number>; // sectionId or sectionName -> price
  defaultPrice?: number;
  currency?: string;
  slotType?: "Morning" | "Matinee" | "Evening" | "Night";
  dayType?: "Weekday" | "Weekend" | "Holiday";
  convenienceFeePerSeat?: number;
  gstPercent?: number;
}

/**
 * Show Seat Inventory
 * Automatically generated for this specific Show by combining HallLayout + ShowPricing.
 * Represents real-time availability for that specific date & time.
 */
export interface ShowSeat {
  id: string;
  showId: ID;
  seatNumber: string; // e.g. "A1", "B12"
  row: string;
  column: number;
  sectionId: ID;
  sectionName: string;
  seatType: SeatType;
  price: number; // Inherited dynamically from ShowPricing by section
  status: SeatStatus;
  isWheelchair?: boolean;
  isRecliner?: boolean;
  dynamicPricingMultiplier?: number;
}

/**
 * Temporary Seat Lock (Concurrency Architecture Placeholder)
 * Prevents double-booking when multiple customers select the same seat concurrently.
 */
export interface SeatLock {
  lockId: ID;
  showId: ID;
  seatNumber: string;
  lockedBy: string; // session ID or customer token
  lockedAt: string;
  expiresAt: string;
  timeoutSeconds: number;
  status: "Active" | "Expired" | "Released" | "Purchased";
}

/**
 * The Show is the central entity in CineSphere OS.
 * It connects:
 * 1. A Movie
 * 2. A specific Hall in a specific Theatre
 * 3. A Date & Time slot
 * 4. Section-based Pricing
 * 5. Generated Seat Inventory
 * 6. Bookings, Payments, and Tickets
 */
export interface Show {
  id: ID;
  movieId: ID;
  movieTitle: string;
  theatreId: ID;
  theatreName?: string;
  hallId: ID;
  hallName: string;
  showDate: string;
  startTime: string;
  endTime: string;
  language: MovieLanguage;
  format: MovieFormat;
  pricing: ShowPricing;
  seatInventory?: ShowSeat[];
  ticketPrice: number; // Starting from / base price
  seatsBooked: number;
  totalSeats: number;
  status: ShowStatus;
}
