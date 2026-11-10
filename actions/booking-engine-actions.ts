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
  updateBookingSession,
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
import { getUnifiedCustomerShowDetails } from "@/lib/engine/customer-discovery-engine";
import { runHardenedOperation } from "@/lib/security/action-guard";
import { validateServerInput, BookingSessionRequestSchema, SeatSelectionRequestSchema } from "@/lib/security/validation-schemas";
import { BusinessRuleError } from "@/lib/errors/app-error";

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
 * Server Action: Initialize a new Booking Session (Hardened with Input Sanitization & Rate Limiting)
 */
export async function createBookingSessionAction(params: {
  showId: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}): Promise<BookingActionResponse<BookingSession>> {
  return runHardenedOperation(
    {
      actionName: "createBookingSessionAction",
      rawInput: params,
      rateLimitCategory: "BOOKING_REQUEST",
      rateLimitKey: params.customerId || params.showId || "guest-booking",
    },
    (sanitized) => {
      const validated = validateServerInput(BookingSessionRequestSchema, sanitized);
      return createBookingSession(validated);
    }
  );
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
  return runHardenedOperation(
    {
      actionName: "addSeatToSessionAction",
      rawInput: { sessionId, seatId: seatNumber },
      rateLimitCategory: "BOOKING_REQUEST",
      rateLimitKey: sessionId || "guest-seat",
    },
    (sanitized) => {
      const validated = validateServerInput(SeatSelectionRequestSchema, sanitized);
      const result = addSeatToSession(validated.sessionId, validated.seatId);
      if (!result.success || !result.session) {
        throw new BusinessRuleError(result.error || "Failed to add seat to session");
      }
      return result.session;
    }
  );
}

/**
 * Server Action: Remove a seat from an active Booking Session (releases the lock)
 */
export async function removeSeatFromSessionAction(
  sessionId: string,
  seatNumber: string
): Promise<BookingActionResponse<BookingSession>> {
  return runHardenedOperation(
    {
      actionName: "removeSeatFromSessionAction",
      rawInput: { sessionId, seatId: seatNumber },
      rateLimitCategory: "BOOKING_REQUEST",
      rateLimitKey: sessionId || "guest-seat",
    },
    (sanitized) => {
      const validated = validateServerInput(SeatSelectionRequestSchema, sanitized);
      const result = removeSeatFromSession(validated.sessionId, validated.seatId);
      if (!result.success || !result.session) {
        throw new BusinessRuleError(result.error || "Failed to remove seat from session");
      }
      return result.session;
    }
  );
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

/**
 * Server Action: Update Booking Session (Contact info, extension, metadata)
 */
export async function updateBookingSessionAction(
  sessionId: string,
  updates: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    extensionMinutes?: number;
  }
): Promise<BookingActionResponse<BookingSession>> {
  try {
    const res = updateBookingSession(sessionId, updates);
    if (!res.success || !res.session) {
      return {
        success: false,
        error: res.error || "Failed to update booking session",
        timestamp: new Date().toISOString(),
      };
    }
    return {
      success: true,
      data: res.session,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating session";
    return {
      success: false,
      error: msg,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Calculate Dynamic Total & Pricing Breakdown
 */
export async function calculateTotalAction(params: {
  showId: string;
  seatNumbers: string[];
}): Promise<
  BookingActionResponse<{
    seatCount: number;
    subtotal: number;
    convenienceFee: number;
    tax: number;
    discount: number;
    grandTotal: number;
    breakdown: Array<{ seatNumber: string; price: number; sectionName: string }>;
  }>
> {
  try {
    const showDetails = getUnifiedCustomerShowDetails(params.showId);
    const breakdown: Array<{ seatNumber: string; price: number; sectionName: string }> = [];
    let subtotal = 0;

    for (const seatNumber of params.seatNumbers) {
      const inv = showDetails.seatInventory.find((s) => s.seatNumber === seatNumber);
      const price = inv ? inv.price : 250;
      const sectionName = inv ? inv.sectionName : "Standard";
      breakdown.push({ seatNumber, price, sectionName });
      subtotal += price;
    }

    const count = params.seatNumbers.length;
    const convenienceFee = count * 35;
    const tax = Math.round((convenienceFee * 18) / 100);
    const discount = 0;
    const grandTotal = Math.max(0, subtotal + convenienceFee + tax - discount);

    return {
      success: true,
      data: {
        seatCount: count,
        subtotal,
        convenienceFee,
        tax,
        discount,
        grandTotal,
        breakdown,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error calculating total";
    return {
      success: false,
      error: msg,
      timestamp: new Date().toISOString(),
    };
  }
}

export const calculateSessionTotalAction = calculateTotalAction;

