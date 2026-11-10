/**
 * ==============================================================================
 * CineSphere OS — Server-Side Validation Schemas (Phase 2 – Part 16)
 * ==============================================================================
 * Comprehensive Zod schemas for all business operations. Client input is never
 * trusted; all mutations must satisfy these contracts.
 * ==============================================================================
 */

import { z } from "zod";
import { ValidationError } from "@/lib/errors/app-error";

// ------------------------------------------------------------------------------
// Helper: Validate Server Input
// ------------------------------------------------------------------------------

export function validateServerInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
  correlationId?: string
): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".") || "root";
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    }
    throw new ValidationError("Input validation failed", fieldErrors, correlationId);
  }
  return result.data;
}

// ------------------------------------------------------------------------------
// 1. Booking & Seat Selection Validation
// ------------------------------------------------------------------------------

export const BookingSessionRequestSchema = z.object({
  showId: z.string().min(1, "Show ID is required"),
  customerId: z.string().optional(),
  customerName: z.string().min(2, "Customer name must be at least 2 characters").max(100).optional(),
  customerEmail: z.string().email("Valid email is required").optional(),
  customerPhone: z.string().min(10, "Phone number must be at least 10 digits").max(15).optional(),
});

export const SeatSelectionRequestSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  seatId: z.string().min(1, "Seat ID is required"),
});

export const BookingConfirmationRequestSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  paymentMethod: z.enum(["UPI", "CARD", "NET_BANKING", "WALLET", "CASH"]).default("UPI"),
  paymentConfigId: z.string().optional(),
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().min(10, "Phone number is required"),
});

// ------------------------------------------------------------------------------
// 2. Payment Configuration Validation
// ------------------------------------------------------------------------------

export const PaymentConfigRequestSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  businessName: z.string().min(2, "Business name is required").max(150),
  merchantName: z.string().min(2, "Merchant name is required").max(150),
  merchantDisplayName: z.string().max(150).optional(),
  provider: z.enum(["UPI", "RAZORPAY", "PHONEPE", "PAYTM", "STRIPE"]).default("UPI"),
  upiId: z.string().min(3, "UPI ID is required").regex(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, "Invalid UPI VPA format"),
  merchantCode: z.string().min(3).max(10).default("7832"),
  bankName: z.string().min(2).max(100).default("HDFC Bank"),
  accountNumberMasked: z.string().max(50).optional(),
  ifscCode: z.string().max(20).optional(),
  settlementPeriod: z.enum(["T_PLUS_0_INSTANT", "T_PLUS_1_DAILY", "WEEKLY"]).default("T_PLUS_1_DAILY"),
  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true),
  description: z.string().max(500).optional(),
});

// ------------------------------------------------------------------------------
// 3. Movie Catalog Validation
// ------------------------------------------------------------------------------

export const MovieDataSchema = z.object({
  title: z.string().min(1, "Movie title is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200),
  synopsis: z.string().min(10, "Synopsis must be at least 10 characters"),
  durationMinutes: z.number().int().positive().min(15).max(360),
  certification: z.enum(["U", "UA", "UA_7_PLUS", "UA_13_PLUS", "UA_16_PLUS", "A", "S"]),
  posterUrl: z.string().url("Valid poster URL is required"),
  backdropUrl: z.string().url().optional(),
  trailerUrl: z.string().url().optional(),
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  originalLanguage: z.string().min(2).max(50),
});

// ------------------------------------------------------------------------------
// 4. Show Scheduling Validation
// ------------------------------------------------------------------------------

export const ShowDataSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  hallId: z.string().min(1, "Hall ID is required"),
  movieId: z.string().min(1, "Movie ID is required"),
  showDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format must be HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format must be HH:MM"),
  pricingProfileId: z.string().min(1, "Pricing profile ID is required"),
  experienceType: z.enum(["STANDARD_2D", "STANDARD_3D", "IMAX_2D", "IMAX_3D", "DOLBY_ATMOS", "FOUR_DX"]).default("STANDARD_2D"),
  language: z.string().min(2).max(50).default("Hindi"),
});

// ------------------------------------------------------------------------------
// 5. Hall Configuration Validation
// ------------------------------------------------------------------------------

export const HallDataSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  name: z.string().min(1, "Hall name is required").max(100),
  screenType: z.enum(["STANDARD", "IMAX", "FOUR_DX", "SCREEN_X", "DOLBY_CINEMA", "VIP_LOUNGE"]).default("STANDARD"),
  soundSystem: z.enum(["DOLBY_7_1", "DOLBY_ATMOS", "IMAX_12_CHANNEL", "DTS_X", "BARCO_AURO"]).default("DOLBY_ATMOS"),
  totalCapacity: z.number().int().positive().min(10).max(1000),
  sections: z.array(
    z.object({
      name: z.string().min(1),
      category: z.string().min(1),
      seatCount: z.number().int().positive(),
      basePrice: z.number().nonnegative(),
    })
  ).min(1, "At least one section is required"),
});

// ------------------------------------------------------------------------------
// 6. Report Request Validation
// ------------------------------------------------------------------------------

export const ReportRequestSchema = z.object({
  theatreId: z.string().optional(),
  reportType: z.enum(["REVENUE", "OCCUPANCY", "MOVIE_PERFORMANCE", "HALL_YIELD", "PAYMENT_RECONCILIATION", "CUSTOM"]),
  datePreset: z.enum(["today", "yesterday", "last7days", "last30days", "thisMonth", "lastMonth", "quarter", "year", "custom"]).default("last30days"),
  customFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  customTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dimension: z.string().optional(),
});

// ------------------------------------------------------------------------------
// 7. Notification Request Validation
// ------------------------------------------------------------------------------

export const NotificationRequestSchema = z.object({
  recipientUserId: z.string().optional(),
  theatreId: z.string().optional(),
  type: z.enum(["BOOKING", "PAYMENT", "TICKET", "THEATRE", "MOVIE", "SHOW", "STAFF", "ALERT", "APPROVAL", "SYSTEM", "SECURITY", "MARKETING"]).default("SYSTEM"),
  severity: z.enum(["INFO", "SUCCESS", "WARNING", "DANGER"]).default("INFO"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "CRITICAL"]).default("NORMAL"),
  title: z.string().min(1, "Title is required").max(200),
  message: z.string().min(1, "Message is required"),
  channels: z.array(z.enum(["IN_APP", "EMAIL", "SMS", "PUSH", "WHATSAPP"])).default(["IN_APP"]),
});

