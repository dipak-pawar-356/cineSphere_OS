"use server";

import { revalidatePath } from "next/cache";
import {
  DigitalTicket,
  GenerateTicketsInput,
  GenerateTicketsResult,
  QRPayload,
  TicketAuditLog,
  TicketFilterParams,
  TicketListResponse,
} from "@/types/ticket.types";
import {
  generateTicketsForBooking,
  getTicketBySecureId,
  getTicketById,
  getCustomerTickets,
  getTheatreTickets,
  searchTickets,
  cancelTicket,
  getTicketAuditLogs,
  generateQRCodeUrl,
  isValidSecureId,
} from "@/lib/engine/ticket-engine";
import { runHardenedOperation } from "@/lib/security/action-guard";
import { BusinessRuleError, NotFoundError } from "@/lib/errors/app-error";

export interface TicketActionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Server Action: Generates digital tickets for a confirmed and paid booking.
 * Strictly respects the flow:
 * Booking Session → Payment → Payment Verification → Booking Confirmation → Ticket Generation
 */
export async function generateTicketsAction(
  input: GenerateTicketsInput
): Promise<TicketActionResponse<DigitalTicket[]>> {
  return runHardenedOperation(
    {
      actionName: "generateTicketsAction",
      rawInput: input,
      rateLimitCategory: "BOOKING_REQUEST",
      rateLimitKey: input.bookingId || "ticket-gen",
      successMessage: "Digital ticket(s) generated successfully.",
    },
    (sanitizedInput) => {
      const result: GenerateTicketsResult = generateTicketsForBooking(sanitizedInput);
      if (!result.success) {
        throw new BusinessRuleError(result.error || "Failed to generate tickets for booking.");
      }

      revalidatePath("/profile/tickets");
      revalidatePath("/theatre/bookings");
      return result.tickets;
    }
  );
}

/**
 * Server Action: Retrieves ticket by unguessable secure ID.
 * Strict URL security: rejects sequential IDs like "123".
 */
export async function retrieveTicketBySecureIdAction(
  secureId: string
): Promise<TicketActionResponse<DigitalTicket>> {
  return runHardenedOperation(
    {
      actionName: "retrieveTicketBySecureIdAction",
      rawInput: { secureId },
      rateLimitCategory: "PUBLIC_DEFAULT",
      rateLimitKey: secureId || "ticket-lookup",
    },
    (sanitized) => {
      if (!sanitized.secureId || !isValidSecureId(sanitized.secureId)) {
        throw new BusinessRuleError(
          "Invalid or unauthorized ticket security token. Sequential IDs are strictly prohibited."
        );
      }

      const ticket = getTicketBySecureId(sanitized.secureId, {
        role: "GUEST_OR_PATRON",
      });

      if (!ticket) {
        throw new NotFoundError("DigitalTicket", sanitized.secureId);
      }
      return ticket;
    }
  );
}

/**
 * Server Action: Retrieves customer tickets with strict customer isolation.
 */
export async function retrieveCustomerTicketsAction(
  customerId: string,
  filters: TicketFilterParams = {}
): Promise<TicketActionResponse<TicketListResponse>> {
  try {
    if (!customerId) {
      return {
        success: false,
        error: "Customer identity required for ticket retrieval.",
        timestamp: new Date().toISOString(),
      };
    }

    const list = getCustomerTickets(customerId, filters);
    return {
      success: true,
      data: list,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error retrieving patron tickets.";
    return {
      success: false,
      error: errorMsg,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Retrieves theatre tickets with strict tenant isolation.
 * Strictly read-only for theatre admins.
 */
export async function retrieveTheatreTicketsAction(
  theatreId: string,
  filters: TicketFilterParams = {}
): Promise<TicketActionResponse<TicketListResponse>> {
  try {
    if (!theatreId) {
      return {
        success: false,
        error: "Theatre ID is required.",
        timestamp: new Date().toISOString(),
      };
    }

    const list = getTheatreTickets(theatreId, filters);
    return {
      success: true,
      data: list,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error retrieving theatre tickets.";
    return {
      success: false,
      error: errorMsg,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Platform-wide ticket search (Super Admin).
 */
export async function searchTicketsAction(
  filters: TicketFilterParams = {}
): Promise<TicketActionResponse<TicketListResponse>> {
  try {
    const list = searchTickets(filters);
    return {
      success: true,
      data: list,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error searching tickets.";
    return {
      success: false,
      error: errorMsg,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Cancels an issued ticket.
 */
export async function cancelTicketAction(
  ticketIdOrSecureId: string,
  reason: string = "Customer cancellation"
): Promise<TicketActionResponse<DigitalTicket>> {
  try {
    const result = cancelTicket(ticketIdOrSecureId, reason, {
      userId: "admin-actor",
      role: "THEATRE_ADMIN",
    });

    if (!result.success || !result.ticket) {
      return {
        success: false,
        error: result.error || "Failed to cancel ticket.",
        timestamp: new Date().toISOString(),
      };
    }

    revalidatePath("/profile/tickets");
    revalidatePath("/theatre/bookings");

    return {
      success: true,
      message: "Ticket successfully cancelled.",
      data: result.ticket,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error cancelling ticket.";
    return {
      success: false,
      error: errorMsg,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Retrieves ticket audit logs.
 */
export async function getTicketAuditLogsAction(
  ticketIdOrSecureId?: string
): Promise<TicketActionResponse<TicketAuditLog[]>> {
  try {
    const logs = getTicketAuditLogs(ticketIdOrSecureId);
    return {
      success: true,
      data: logs,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error retrieving audit logs.";
    return {
      success: false,
      error: errorMsg,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Dynamically generates QR code image URL from structured payload.
 */
export async function deriveTicketQrAction(
  payload: QRPayload
): Promise<TicketActionResponse<string>> {
  try {
    const qrUrl = generateQRCodeUrl(payload);
    return {
      success: true,
      data: qrUrl,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error generating QR code.";
    return {
      success: false,
      error: errorMsg,
      timestamp: new Date().toISOString(),
    };
  }
}

