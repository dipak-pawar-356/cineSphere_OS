import { ID } from "./common.types";
import { SeatCategoryTier, SeatType } from "./hall.types";

/**
 * ==============================================================================
 * CineSphere OS — Booking Engine & Seat Reservation Architecture Types (Phase 2 – Part 11)
 * ==============================================================================
 * Architectural Invariant:
 * 1. Seat Template (Permanent Hall Layout)
 * 2. Show Seat Inventory (One Inventory per Show)
 * 3. Booking Session (Temporary Customer Session)
 * 4. Confirmed Booking (Created only upon payment confirmation)
 * 5. Payment (Gateway settlement)
 * 6. Issued Ticket (Access verification QR)
 *
 * Two Identifiers:
 * - Booking Session ID: created immediately when selecting seats. Temporary & expires.
 * - Booking ID: created strictly after payment confirmation.
 * ==============================================================================
 */

export type BookingSessionStatus =
  | "Active"
  | "Expired"
  | "Cancelled"
  | "Completed"
  | "Abandoned";

export type SeatLockState =
  | "Available"
  | "Selected"
  | "Locked"
  | "Booked"
  | "Reserved"
  | "Blocked"
  | "Maintenance"
  | "Disabled";

export interface SelectedSeatItem {
  seatId: string;
  seatInventoryId: string;
  seatNumber: string; // e.g. "A5"
  row: string;
  column: number;
  sectionId: string;
  sectionName: string;
  categoryTier: SeatCategoryTier | string;
  seatType: SeatType | string;
  unitPrice: number;
  isWheelchair?: boolean;
  isRecliner?: boolean;
  lockedAt: string;
  lockedUntil: string;
}

export interface BookingSession {
  id: string; // e.g. "sess_pun_001_8492"
  sessionCode: string; // e.g. "SES-202611-9281"
  customerId: string; // User ID or anonymous guest ID
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  ipAddress?: string;
  showId: string;
  theatreId: string;
  hallId: string;
  selectedSeats: SelectedSeatItem[];
  seatCount: number;
  subtotal: number;
  convenienceFee: number;
  tax: number;
  discount: number;
  grandTotal: number;
  status: BookingSessionStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  timeRemainingSeconds?: number;
  bookingId?: string; // Populated only when successfully confirmed in Phase 2 Part 12
  isLocked: boolean;
}

export interface BookingEngineRules {
  maxSeatsPerBooking: number; // default: 10
  minSeatsPerBooking: number; // default: 1
  sessionDurationMinutes: number; // default: 10
  warningThresholdSeconds: number; // default: 120 (2 mins)
  convenienceFeePerSeat: number; // default: 35
  gstPercent: number; // default: 18
  allowWheelchairUnaccompanied?: boolean;
}

export type BookingAuditAction =
  | "SESSION_CREATED"
  | "SEAT_ADDED"
  | "SEAT_REMOVED"
  | "LOCK_RENEWED"
  | "SESSION_EXPIRED"
  | "SESSION_CANCELLED"
  | "SESSION_COMPLETED"
  | "CONFLICT_REJECTED";

export interface BookingAuditLog {
  id: string;
  sessionId: string;
  showId: string;
  theatreId: string;
  action: BookingAuditAction;
  performedBy: string;
  role: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface SeatLockDTO {
  seatNumber: string;
  showId: string;
  theatreId: string;
  lockedBySessionId: string;
  lockedAt: string;
  expiresAt: string;
  isExpired: boolean;
}

export interface DoubleBookingValidationResult {
  isValid: boolean;
  conflictReason?: string;
  conflictingSeats: string[];
  availableSeats: string[];
}

export interface BookingReviewDTO {
  session: BookingSession;
  movieTitle: string;
  moviePoster: string;
  movieCertificate: string;
  theatreName: string;
  theatreAddress: string;
  theatreCity: string;
  hallName: string;
  screenType: string;
  showDate: string;
  showTime: string;
  language: string;
  format: string;
  timeRemainingSeconds: number;
  timerFormatted: string; // e.g. "09:42"
  isLowTimerWarning: boolean;
}

export interface BookingSessionFilterParams {
  theatreId?: string;
  showId?: string;
  customerId?: string;
  status?: BookingSessionStatus | "All";
  searchQuery?: string;
  date?: string;
}
