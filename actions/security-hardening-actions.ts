"use server";

import { createProtectedAction } from "@/lib/security/action-guard";
import { z } from "zod";
import { bookingDomainService } from "@/lib/services/booking-domain.service";
import { paymentDomainService, ResolvedCustomerPaymentConfig } from "@/lib/services/payment-domain.service";
import { securityAuditService } from "@/lib/services/security-audit.service";
import { getSystemHealthReport } from "@/lib/observability/health-monitor";
import { getRecentStructuredLogs } from "@/lib/observability/structured-logger";
import { SecurityEventRecord, StructuredLogEntry, HealthCheckResponse } from "@/types/security-hardening.types";
import { ConfirmedBookingRecord } from "@/lib/repositories/booking.repository";

// ------------------------------------------------------------------------------
// 1. Booking Optimistic Locking Server Action
// ------------------------------------------------------------------------------

const UpdateBookingWithLockSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  expectedVersion: z.number().int().positive("Expected version must be positive"),
  newStatus: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED", "REFUNDED"]),
  theatreId: z.string().min(1, "Theatre ID is required"),
});

export const updateBookingWithLockAction = createProtectedAction<
  z.infer<typeof UpdateBookingWithLockSchema>,
  ConfirmedBookingRecord
>(
  {
    actionName: "updateBookingWithLockAction",
    schema: UpdateBookingWithLockSchema,
    rateLimitCategory: "BOOKING_REQUEST",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "BOOKING",
    auditAction: "UPDATE_STATUS_LOCK",
  },
  async (input, context) => {
    return bookingDomainService.updateBookingStatusWithLock(
      input.bookingId,
      input.expectedVersion,
      input.newStatus,
      context.actor
    );
  }
);

// ------------------------------------------------------------------------------
// 2. Resolve Theatre Payment Configuration Server Action
// ------------------------------------------------------------------------------

const ResolvePaymentConfigSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  amount: z.number().positive("Transaction amount must be positive"),
  bookingRef: z.string().optional(),
  customerName: z.string().optional(),
});

export const resolveCustomerPaymentConfigAction = createProtectedAction<
  z.infer<typeof ResolvePaymentConfigSchema>,
  ResolvedCustomerPaymentConfig
>(
  {
    actionName: "resolveCustomerPaymentConfigAction",
    schema: ResolvePaymentConfigSchema,
    rateLimitCategory: "PAYMENT_REQUEST",
    requiredRole: ["CUSTOMER", "STAFF", "THEATRE_ADMIN", "SUPER_ADMIN"],
    auditModule: "PAYMENT",
    auditAction: "RESOLVE_CONFIG",
  },
  async (input) => {
    return paymentDomainService.resolveActivePaymentConfig(input.theatreId, {
      amount: input.amount,
      bookingRef: input.bookingRef,
      customerName: input.customerName,
    });
  }
);

// ------------------------------------------------------------------------------
// 3. Security Events Monitoring Server Action
// ------------------------------------------------------------------------------

const FetchSecurityEventsSchema = z.object({
  theatreId: z.string().optional(),
  limit: z.number().int().min(1).max(200).optional(),
});

export const fetchSecurityEventsAction = createProtectedAction<
  z.infer<typeof FetchSecurityEventsSchema>,
  SecurityEventRecord[]
>(
  {
    actionName: "fetchSecurityEventsAction",
    schema: FetchSecurityEventsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
  },
  async (input, context) => {
    const effectiveTheatreId =
      context.actor.role === "SUPER_ADMIN" ? input.theatreId : context.actor.theatreId;

    return securityAuditService.getSecurityEvents({
      theatreId: effectiveTheatreId,
      limit: input.limit ?? 50,
    });
  }
);

// ------------------------------------------------------------------------------
// 4. Structured Logs Diagnostic Server Action
// ------------------------------------------------------------------------------

const FetchStructuredLogsSchema = z.object({
  theatreId: z.string().optional(),
  limit: z.number().int().min(1).max(200).optional(),
});

export const fetchStructuredLogsAction = createProtectedAction<
  z.infer<typeof FetchStructuredLogsSchema>,
  StructuredLogEntry[]
>(
  {
    actionName: "fetchStructuredLogsAction",
    schema: FetchStructuredLogsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
  },
  async (input) => {
    return getRecentStructuredLogs({
      theatreId: input.theatreId,
      limit: input.limit ?? 100,
    });
  }
);

// ------------------------------------------------------------------------------
// 5. System Health Telemetry Server Action
// ------------------------------------------------------------------------------

export const fetchSystemHealthAction = createProtectedAction<
  Record<string, never>,
  HealthCheckResponse
>(
  {
    actionName: "fetchSystemHealthAction",
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
  },
  async () => {
    return getSystemHealthReport();
  }
);
