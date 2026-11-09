import {
  BookingSession,
  BookingSessionStatus,
  BookingEngineRules,
  SelectedSeatItem,
  BookingAuditLog,
  BookingAuditAction,
  SeatLockDTO,
  DoubleBookingValidationResult,
  BookingReviewDTO,
  BookingSessionFilterParams,
} from "@/types/booking-engine.types";
import { getUnifiedCustomerShowDetails } from "./customer-discovery-engine";

/**
 * ==============================================================================
 * CineSphere OS — Booking Engine & Seat Reservation Architecture (Phase 2 – Part 11)
 * ==============================================================================
 * Architectural Invariant:
 * 1. Seat Template (Permanent Hall Layout)
 * 2. Show Seat Inventory (One Inventory per Show)
 * 3. Booking Session (Temporary Customer Session with Temporary Seat Locks)
 * 4. Confirmed Booking (Created only upon payment confirmation)
 * 5. Payment (Gateway settlement)
 * 6. Issued Ticket (Access verification QR)
 *
 * Prevents double booking via atomic temporary locks with countdown expirations.
 * ==============================================================================
 */

export const DEFAULT_BOOKING_RULES: BookingEngineRules = {
  maxSeatsPerBooking: 10,
  minSeatsPerBooking: 1,
  sessionDurationMinutes: 10,
  warningThresholdSeconds: 120, // 2 minutes
  convenienceFeePerSeat: 35,
  gstPercent: 18,
  allowWheelchairUnaccompanied: false,
};

// ------------------------------------------------------------------------------
// In-Memory Distributed State Store (Isolated & Multi-Tenant Aware)
// ------------------------------------------------------------------------------
const sessionRegistry = new Map<string, BookingSession>();
const seatLocksRegistry = new Map<string, SeatLockDTO>(); // Key: `${showId}:${seatNumber}`
const auditLogsStore: BookingAuditLog[] = [];

// Pre-seed sample active locks to demonstrate real concurrency collision protection
(function seedInitialSimulationLocks() {
  const sampleShowId = "show-pun-001";
  const seedLockedSeats = ["B4", "C6"];
  const expiresAt = new Date(Date.now() + 8 * 60 * 1000).toISOString();

  for (const sNum of seedLockedSeats) {
    seatLocksRegistry.set(`${sampleShowId}:${sNum}`, {
      seatNumber: sNum,
      showId: sampleShowId,
      theatreId: "th-pun-001",
      lockedBySessionId: "sess-sim-other-user",
      lockedAt: new Date().toISOString(),
      expiresAt,
      isExpired: false,
    });
  }
})();

// Helper to log tamper-evident audit trail
function logAudit(
  sessionId: string,
  showId: string,
  theatreId: string,
  action: BookingAuditAction,
  details: Record<string, unknown>,
  performedBy: string = "customer",
  role: string = "CUSTOMER"
): void {
  const log: BookingAuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    sessionId,
    showId,
    theatreId,
    action,
    performedBy,
    role,
    details,
    timestamp: new Date().toISOString(),
  };
  auditLogsStore.unshift(log);
}

// ------------------------------------------------------------------------------
// 1. Session Lifecycle Management
// ------------------------------------------------------------------------------

/**
 * Creates a new temporary Booking Session when a customer enters the seat selection flow.
 */
export function createBookingSession(params: {
  showId: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}): BookingSession {
  const showDetails = getUnifiedCustomerShowDetails(params.showId);
  const now = Date.now();
  const durationMs = DEFAULT_BOOKING_RULES.sessionDurationMinutes * 60 * 1000;
  const expiresAt = new Date(now + durationMs).toISOString();

  const sessionId = `sess_${params.showId}_${Math.random().toString(36).substring(2, 9)}`;
  const sessionCode = `SES-${Date.now().toString().slice(-6)}`;

  const session: BookingSession = {
    id: sessionId,
    sessionCode,
    customerId: params.customerId || `cust-guest-${Math.random().toString(36).substring(2, 7)}`,
    customerName: params.customerName || "Valued Cinephile",
    customerEmail: params.customerEmail,
    customerPhone: params.customerPhone,
    showId: params.showId,
    theatreId: showDetails.theatre.id,
    hallId: showDetails.hall.id,
    selectedSeats: [],
    seatCount: 0,
    subtotal: 0,
    convenienceFee: 0,
    tax: 0,
    discount: 0,
    grandTotal: 0,
    status: "Active",
    createdAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
    expiresAt,
    timeRemainingSeconds: DEFAULT_BOOKING_RULES.sessionDurationMinutes * 60,
    isLocked: false,
  };

  sessionRegistry.set(sessionId, session);

  logAudit(sessionId, session.showId, session.theatreId, "SESSION_CREATED", {
    showCode: showDetails.show.showCode,
    movieTitle: showDetails.movie.title,
    durationMinutes: DEFAULT_BOOKING_RULES.sessionDurationMinutes,
  });

  return session;
}

/**
 * Retrieves a booking session by ID with automatic expiration check.
 */
export function getBookingSession(sessionId: string): BookingSession | null {
  const session = sessionRegistry.get(sessionId);
  if (!session) return null;

  // Auto-expire check
  if (session.status === "Active" && new Date(session.expiresAt).getTime() <= Date.now()) {
    return expireBookingSession(sessionId);
  }

  // Update real-time remaining seconds
  const remainingSecs = Math.max(
    0,
    Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000)
  );

  return {
    ...session,
    timeRemainingSeconds: remainingSecs,
  };
}

/**
 * Adds a seat to the booking session and locks it immediately against concurrency collisions.
 */
export function addSeatToSession(
  sessionId: string,
  seatNumber: string
): { success: boolean; session?: BookingSession; error?: string } {
  const session = getBookingSession(sessionId);
  if (!session) {
    return { success: false, error: "Booking session not found or invalid." };
  }

  if (session.status !== "Active") {
    return {
      success: false,
      error: `Booking session is ${session.status.toLowerCase()}. Please start a fresh reservation.`,
    };
  }

  // Max seats rule check
  if (session.selectedSeats.length >= DEFAULT_BOOKING_RULES.maxSeatsPerBooking) {
    return {
      success: false,
      error: `Maximum limit of ${DEFAULT_BOOKING_RULES.maxSeatsPerBooking} seats reached per booking session.`,
    };
  }

  // Already selected in this session?
  if (session.selectedSeats.some((s) => s.seatNumber === seatNumber)) {
    return { success: true, session };
  }

  const showDetails = getUnifiedCustomerShowDetails(session.showId);
  const seatObj = showDetails.seatInventory.find((s) => s.seatNumber === seatNumber);

  if (!seatObj) {
    return { success: false, error: `Seat '${seatNumber}' does not exist in this auditorium.` };
  }

  // Permanent Status Check
  if (["Booked", "Reserved", "Blocked", "Maintenance"].includes(seatObj.status)) {
    return {
      success: false,
      error: `Seat '${seatNumber}' is currently ${seatObj.status.toLowerCase()} and cannot be selected.`,
    };
  }

  // Temporary Concurrency Lock Check (Double-Booking Prevention)
  const lockKey = `${session.showId}:${seatNumber}`;
  const existingLock = seatLocksRegistry.get(lockKey);
  const now = Date.now();

  if (
    existingLock &&
    existingLock.lockedBySessionId !== sessionId &&
    new Date(existingLock.expiresAt).getTime() > now
  ) {
    logAudit(sessionId, session.showId, session.theatreId, "CONFLICT_REJECTED", {
      seatNumber,
      conflictWithSession: existingLock.lockedBySessionId,
    });

    return {
      success: false,
      error: `Seat '${seatNumber}' is temporarily reserved by another guest. Please pick an alternative.`,
    };
  }

  // Lock the seat
  seatLocksRegistry.set(lockKey, {
    seatNumber,
    showId: session.showId,
    theatreId: session.theatreId,
    lockedBySessionId: sessionId,
    lockedAt: new Date(now).toISOString(),
    expiresAt: session.expiresAt,
    isExpired: false,
  });

  const seatItem: SelectedSeatItem = {
    seatId: seatObj.id,
    seatInventoryId: seatObj.id,
    seatNumber: seatObj.seatNumber,
    row: seatObj.row,
    column: seatObj.column,
    sectionId: seatObj.sectionId,
    sectionName: seatObj.sectionName,
    categoryTier: seatObj.categoryTier,
    seatType: seatObj.seatType,
    unitPrice: seatObj.price,
    isWheelchair: seatObj.isWheelchair,
    isRecliner: seatObj.isRecliner,
    lockedAt: new Date(now).toISOString(),
    lockedUntil: session.expiresAt,
  };

  session.selectedSeats.push(seatItem);
  session.seatCount = session.selectedSeats.length;
  session.isLocked = session.seatCount > 0;
  session.updatedAt = new Date(now).toISOString();

  // Recalculate Totals
  recalculateSessionTotals(session);

  logAudit(sessionId, session.showId, session.theatreId, "SEAT_ADDED", {
    seatNumber,
    section: seatObj.sectionName,
    price: seatObj.price,
    totalSeatsSelected: session.seatCount,
  });

  return { success: true, session };
}

/**
 * Removes a seat from the session and releases its concurrency lock immediately.
 */
export function removeSeatFromSession(
  sessionId: string,
  seatNumber: string
): { success: boolean; session?: BookingSession; error?: string } {
  const session = getBookingSession(sessionId);
  if (!session) {
    return { success: false, error: "Booking session not found." };
  }

  const initialCount = session.selectedSeats.length;
  session.selectedSeats = session.selectedSeats.filter((s) => s.seatNumber !== seatNumber);

  if (session.selectedSeats.length === initialCount) {
    return { success: true, session };
  }

  // Release lock
  const lockKey = `${session.showId}:${seatNumber}`;
  seatLocksRegistry.delete(lockKey);

  session.seatCount = session.selectedSeats.length;
  session.isLocked = session.seatCount > 0;
  session.updatedAt = new Date().toISOString();

  // Recalculate Totals
  recalculateSessionTotals(session);

  logAudit(sessionId, session.showId, session.theatreId, "SEAT_REMOVED", {
    seatNumber,
    remainingSeatsCount: session.seatCount,
  });

  return { success: true, session };
}

/**
 * Renews / Extends the countdown lock for an active session.
 */
export function renewSessionLock(
  sessionId: string,
  extensionMinutes: number = 5
): { success: boolean; session?: BookingSession; error?: string } {
  const session = getBookingSession(sessionId);
  if (!session) {
    return { success: false, error: "Booking session not found." };
  }

  if (session.status !== "Active") {
    return { success: false, error: "Cannot renew an inactive session." };
  }

  const currentExpiry = new Date(session.expiresAt).getTime();
  const newExpiryTime = Math.max(Date.now(), currentExpiry) + extensionMinutes * 60 * 1000;
  const newExpiresAt = new Date(newExpiryTime).toISOString();

  session.expiresAt = newExpiresAt;
  session.updatedAt = new Date().toISOString();
  session.timeRemainingSeconds = Math.floor((newExpiryTime - Date.now()) / 1000);

  // Extend locks on all held seats
  for (const s of session.selectedSeats) {
    s.lockedUntil = newExpiresAt;
    const lockKey = `${session.showId}:${s.seatNumber}`;
    const lock = seatLocksRegistry.get(lockKey);
    if (lock) {
      lock.expiresAt = newExpiresAt;
    }
  }

  logAudit(sessionId, session.showId, session.theatreId, "LOCK_RENEWED", {
    extensionMinutes,
    newExpiresAt,
    seatsHeldCount: session.seatCount,
  });

  return { success: true, session };
}

/**
 * Expires a booking session and releases all held seats back into the available pool.
 */
export function expireBookingSession(sessionId: string): BookingSession {
  const session = sessionRegistry.get(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  session.status = "Expired";
  session.timeRemainingSeconds = 0;
  session.updatedAt = new Date().toISOString();

  // Release all locks
  for (const s of session.selectedSeats) {
    const lockKey = `${session.showId}:${s.seatNumber}`;
    seatLocksRegistry.delete(lockKey);
  }

  session.isLocked = false;

  logAudit(sessionId, session.showId, session.theatreId, "SESSION_EXPIRED", {
    seatsReleasedCount: session.selectedSeats.length,
    releasedSeats: session.selectedSeats.map((s) => s.seatNumber),
  });

  return session;
}

/**
 * Explicitly cancels an active booking session (e.g. user navigation away or back to movie).
 */
export function cancelBookingSession(sessionId: string): BookingSession {
  const session = sessionRegistry.get(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  session.status = "Cancelled";
  session.timeRemainingSeconds = 0;
  session.updatedAt = new Date().toISOString();

  // Release all locks
  for (const s of session.selectedSeats) {
    const lockKey = `${session.showId}:${s.seatNumber}`;
    seatLocksRegistry.delete(lockKey);
  }

  session.isLocked = false;

  logAudit(sessionId, session.showId, session.theatreId, "SESSION_CANCELLED", {
    seatsReleased: session.selectedSeats.map((s) => s.seatNumber),
  });

  return session;
}

// ------------------------------------------------------------------------------
// 2. Double-Booking Validation & Concurrency Checks
// ------------------------------------------------------------------------------

/**
 * Comprehensive server-side validation to reject stale booking sessions
 * and verify no double-booking collision exists.
 */
export function validateSeatsAvailability(
  showId: string,
  seatNumbers: string[],
  currentSessionId?: string
): DoubleBookingValidationResult {
  const showDetails = getUnifiedCustomerShowDetails(showId);
  const now = Date.now();
  const conflictingSeats: string[] = [];
  const availableSeats: string[] = [];

  for (const seatNumber of seatNumbers) {
    const inventorySeat = showDetails.seatInventory.find((s) => s.seatNumber === seatNumber);

    if (!inventorySeat || ["Booked", "Reserved", "Blocked", "Maintenance"].includes(inventorySeat.status)) {
      conflictingSeats.push(seatNumber);
      continue;
    }

    const lockKey = `${showId}:${seatNumber}`;
    const existingLock = seatLocksRegistry.get(lockKey);

    if (
      existingLock &&
      existingLock.lockedBySessionId !== currentSessionId &&
      new Date(existingLock.expiresAt).getTime() > now
    ) {
      conflictingSeats.push(seatNumber);
    } else {
      availableSeats.push(seatNumber);
    }
  }

  return {
    isValid: conflictingSeats.length === 0,
    conflictReason:
      conflictingSeats.length > 0
        ? `Seats [${conflictingSeats.join(", ")}] are either booked or currently locked by another reservation.`
        : undefined,
    conflictingSeats,
    availableSeats,
  };
}

/**
 * Returns all active temporary seat locks for a given show.
 */
export function getActiveSeatLocksForShow(showId: string): SeatLockDTO[] {
  const now = Date.now();
  const locks: SeatLockDTO[] = [];

  for (const [key, lock] of seatLocksRegistry.entries()) {
    if (lock.showId === showId) {
      if (new Date(lock.expiresAt).getTime() > now) {
        locks.push(lock);
      } else {
        // Purge expired locks on the fly
        seatLocksRegistry.delete(key);
      }
    }
  }

  return locks;
}

// ------------------------------------------------------------------------------
// 3. Price Calculation Pipeline
// ------------------------------------------------------------------------------

function recalculateSessionTotals(session: BookingSession): void {
  const subtotal = session.selectedSeats.reduce((acc, s) => acc + s.unitPrice, 0);
  const count = session.selectedSeats.length;
  const convenienceFee = count * DEFAULT_BOOKING_RULES.convenienceFeePerSeat;
  const tax = Math.round((convenienceFee * DEFAULT_BOOKING_RULES.gstPercent) / 100);
  const discount = 0; // Architecture hook for future promotions/coupons
  const grandTotal = Math.max(0, subtotal + convenienceFee + tax - discount);

  session.subtotal = subtotal;
  session.convenienceFee = convenienceFee;
  session.tax = tax;
  session.discount = discount;
  session.grandTotal = grandTotal;
}

// ------------------------------------------------------------------------------
// 4. Booking Review DTO Assembler
// ------------------------------------------------------------------------------

/**
 * Builds the complete Booking Review snapshot for pre-payment review.
 */
export function getBookingReview(sessionId: string): BookingReviewDTO | null {
  const session = getBookingSession(sessionId);
  if (!session) return null;

  const showDetails = getUnifiedCustomerShowDetails(session.showId);
  const remaining = session.timeRemainingSeconds ?? 0;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timerFormatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  const isLowTimerWarning = remaining <= DEFAULT_BOOKING_RULES.warningThresholdSeconds;

  return {
    session,
    movieTitle: showDetails.movie.title,
    moviePoster: showDetails.movie.poster,
    movieCertificate: showDetails.movie.certification,
    theatreName: showDetails.theatre.name,
    theatreAddress: showDetails.theatre.address,
    theatreCity: showDetails.theatre.city,
    hallName: showDetails.hall.name,
    screenType: showDetails.hall.screenType,
    showDate: showDetails.show.date,
    showTime: showDetails.show.startTime,
    language: String(showDetails.show.language),
    format: String(showDetails.show.format),
    timeRemainingSeconds: remaining,
    timerFormatted,
    isLowTimerWarning,
  };
}

// ------------------------------------------------------------------------------
// 5. Multi-Tenant Search & Audit Queries
// ------------------------------------------------------------------------------

/**
 * Multi-tenant search query engine for Customer, Theatre Admin, and Super Admin inspection.
 */
export function searchBookingSessions(filters: BookingSessionFilterParams = {}): BookingSession[] {
  let list = Array.from(sessionRegistry.values());

  if (filters.theatreId && filters.theatreId !== "all") {
    list = list.filter((s) => s.theatreId === filters.theatreId);
  }

  if (filters.showId) {
    list = list.filter((s) => s.showId === filters.showId);
  }

  if (filters.customerId) {
    list = list.filter((s) => s.customerId === filters.customerId);
  }

  if (filters.status && filters.status !== "All") {
    list = list.filter((s) => s.status === filters.status);
  }

  if (filters.searchQuery?.trim()) {
    const q = filters.searchQuery.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.sessionCode.toLowerCase().includes(q) ||
        s.customerName?.toLowerCase().includes(q) ||
        s.selectedSeats.some((st) => st.seatNumber.toLowerCase().includes(q))
    );
  }

  return list;
}

export function getAllBookingAuditLogs(): BookingAuditLog[] {
  return auditLogsStore;
}

export function getAuditLogsForSession(sessionId: string): BookingAuditLog[] {
  return auditLogsStore.filter((l) => l.sessionId === sessionId);
}
