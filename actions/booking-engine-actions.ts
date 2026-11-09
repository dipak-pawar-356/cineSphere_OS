"use server";

import {
  BookingSession,
  BookingReviewDTO,
  DoubleBookingValidationResult,
  BookingAuditLog,
  BookingSessionFilterParams,
  SeatLockDTO,
} from "@/types/booking-engine.types";
import {
  createBookingSession,
  getBookingSession,
  addSeatToSession,
  removeSeatFromSession,
  renewSessionLock,
  expireBookingSession,
  cancelBookingSession,
  validateSeatsAvailability,
  getBookingReview,
  searchBookingSessions,
  getAllBookingAuditLogs,
  getAuditLogsForSession,
  getActiveSeatLocksForShow,
} from "@/lib/engine/booking-engine";

/**
 * ==============================================================================
 * CineSphere OS — Booking Engine Server Actions (Phase 2 – Part 11)
 * ==============================================================================
 * Production-ready server actions governing the temporary seat reservation
 * lifecycle, anti-double-booking locks, and timer synchronization.
 * ==============================================================================
 */

export interface BookingActionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Server Action: Initialize a new Booking Session
 */
export async function createBookingSessionAction(params: {
  showId: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}): Promise<BookingActionResponse<BookingSession>> {
  try {
    if (!params.showId) {
      return {
        success: false,
        error: "showId is required to start a booking session",
        timestamp: new Date().toISOString(),
      };
    }

    const session = createBookingSession(params);
    return {
      success: true,
      data: session,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create booking session";
    return {
      success: false,
      error: msg,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Fetch an existing Booking Session
 */
export async function getBookingSessionAction(
  sessionId: string
): Promise<BookingActionResponse<BookingSession>> {
  try {
    const session = getBookingSession(sessionId);
    if (!session) {
      return {
        success: false,
        error: "Booking session not found or has expired.",
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: session,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to retrieve booking session";
    return {
      success: false,
      error: msg,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Add a seat to an active Booking Session (locks the seat)
 */
export async function addSeatToSessionAction(
  sessionId: string,
  seatNumber: string
): Promise<BookingActionResponse<BookingSession>> {
  try {
    const result = addSeatToSession(sessionId, seatNumber);
    if (!result.success || !result.session) {
      return {
        success: false,
        error: result.error || "Failed to add seat to session",
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: result.session,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to add seat";
    return {
      success: false,
      error: msg,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Remove a seat from an active Booking Session (releases the lock)
 */
export async function removeSeatFromSessionAction(
  sessionId: string,
  seatNumber: string
): Promise<BookingActionResponse<BookingSession>> {
  try {
    const result = removeSeatFromSession(sessionId, seatNumber);
    if (!result.success || !result.session) {
      return {
        success: false,
        error: result.error || "Failed to remove seat from session",
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: result.session,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to remove seat";
    return {
      success: false,
      error: msg,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Renew / Extend temporary lock timer
 */
export async function renewSessionLockAction(
  sessionId: string,
  extensionMinutes: number = 5
): Promise<BookingActionResponse<BookingSession>> {
  try {
    const result = renewSessionLock(sessionId, extensionMinutes);
    if (!result.success || !result.session) {
      return {
        success: false,
        error: result.error || "Failed to renew session lock",
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: result.session,
      message: `Lock extended by ${extensionMinutes} minutes`,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to renew session lock";
    return {
      success: false,
      error: msg,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Expire Booking Session and release all locks
 */
export async function expireBookingSessionAction(
  sessionId: string
): Promise<BookingActionResponse<BookingSession>> {
  try {
    const session = expireBookingSession(sessionId);
    return {
      success: true,
      data: session,
      message: "Booking session expired and locks released",
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to expire booking session";
    return {
      success: false,
      error: msg,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Cancel Booking Session
 */
export async function cancelBookingSessionAction(
  sessionId: string
): Promise<BookingActionResponse<BookingSession>> {
  try {
    const session = cancelBookingSession(sessionId);
    return {
      success: true,
      data: session,
      message: "Booking session cancelled and locks released",
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to cancel session";
    return {
      success: false,
      error: msg,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Validate Seats Availability & Double-Booking Prevention
 */
export async function validateSeatsAvailabilityAction(
  showId: string,
  seatNumbers: string[],
  currentSessionId?: string
): Promise<BookingActionResponse<DoubleBookingValidationResult>> {
  try {
    const result = validateSeatsAvailability(showId, seatNumbers, currentSessionId);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to validate seats";
    return {
      success: false,
      error: msg,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Fetch Active Seat Locks for a Show
 */
export async function getActiveSeatLocksAction(
  showId: string
): Promise<BookingActionResponse<SeatLockDTO[]>> {
  try {
    const locks = getActiveSeatLocksForShow(showId);
    return {
      success: true,
      data: locks,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch active seat locks";
    return {
      success: false,
      error: msg,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Get Pre-Payment Booking Review DTO
 */
export async function getBookingReviewAction(
  sessionId: string
): Promise<BookingActionResponse<BookingReviewDTO>> {
  try {
    const review = getBookingReview(sessionId);
    if (!review) {
      return {
        success: false,
        error: "Booking review unavailable. The session may have expired.",
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: review,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to generate booking review";
    return {
      success: false,
      error: msg,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Search and Inspect Booking Sessions (Multi-Tenant Scoped)
 */
export async function searchBookingSessionsAction(
  filters: BookingSessionFilterParams = {}
): Promise<BookingActionResponse<BookingSession[]>> {
  try {
    const list = searchBookingSessions(filters);
    return {
      success: true,
      data: list,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to search booking sessions";
    return {
      success: false,
      error: msg,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Fetch Audit Logs
 */
export async function getBookingAuditLogsAction(
  sessionId?: string
): Promise<BookingActionResponse<BookingAuditLog[]>> {
  try {
    const logs = sessionId ? getAuditLogsForSession(sessionId) : getAllBookingAuditLogs();
    return {
      success: true,
      data: logs,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch audit logs";
    return {
      success: false,
      error: msg,
      timestamp: new Date().toISOString(),
    };
  }
}

// Aliases matching prompt requirements verbatim
export const calculateTotalAction = getBookingSessionAction;
export const calculateSessionTotalAction = getBookingSessionAction;
export const updateBookingSessionAction = renewSessionLockAction;
