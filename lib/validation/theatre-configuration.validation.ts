import { z } from "zod";
import { isValidIanaTimezone } from "./theatre-operating-hours.validation";

/**
 * ==============================================================================
 * CineSphere OS — Dynamic Theatre Configuration Validation (Phase 3 – Part 9)
 * ==============================================================================
 * Zod validation schemas enforcing strict localization, booking boundaries,
 * cancellation fee limits, refund constraints, age restrictions, and feature flags.
 * ==============================================================================
 */

export const CURRENCY_REGEX = /^[A-Z]{3}$/;
export const LANGUAGE_CODE_REGEX = /^[a-z]{2,3}(-[A-Z]{2})?$/;

export const currencySchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(CURRENCY_REGEX, "Currency must be a valid 3-letter ISO code (e.g. 'INR', 'USD', 'AED', 'EUR')");

export const languageCodeSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(LANGUAGE_CODE_REGEX, "Language must be a valid ISO language code (e.g. 'en', 'hi', 'ar', 'es')");

export const timezoneConfigSchema = z
  .string()
  .trim()
  .min(3)
  .max(60)
  .refine(isValidIanaTimezone, {
    message: "Invalid IANA timezone identifier (e.g. 'Asia/Kolkata', 'America/New_York')",
  });

export const TheatreConfigStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const ConfigTimeFormatEnum = z.enum(["12H", "24H"]);
export const ConfigNumberFormatEnum = z.enum(["INDIAN", "INTERNATIONAL"]);
export const ConfigMeasurementUnitsEnum = z.enum(["METRIC", "IMPERIAL"]);
export const ConfigRefundMethodEnum = z.enum(["ORIGINAL_PAYMENT", "WALLET", "STORE_CREDIT"]);

// ------------------------------------------------------------------------------
// Sub-Domain Validation Schemas
// ------------------------------------------------------------------------------

export const LocalizationConfigInputSchema = z.object({
  currency: currencySchema.default("INR"),
  timezone: timezoneConfigSchema.default("Asia/Kolkata"),
  primaryLanguage: languageCodeSchema.default("en"),
  supportedLanguages: z.array(languageCodeSchema).min(1).default(["en"]),
  dateFormat: z.string().trim().min(5).max(30).default("DD/MM/YYYY"),
  timeFormat: ConfigTimeFormatEnum.default("12H"),
  numberFormat: ConfigNumberFormatEnum.default("INDIAN"),
  measurementUnits: ConfigMeasurementUnitsEnum.default("METRIC"),
});

export const BookingConfigInputSchema = z
  .object({
    maxSeatsPerBooking: z.number().int().min(1).max(50).default(10),
    minSeatsPerBooking: z.number().int().min(1).max(10).default(1),
    advanceBookingDays: z.number().int().min(1).max(180).default(30),
    bookingCutoffMinutes: z.number().int().min(0).max(180).default(15),
    maxConcurrentBookingsPerUser: z.number().int().min(1).max(10).default(3),
    seatHoldDurationSeconds: z.number().int().min(60).max(1800).default(600),
  })
  .refine(
    (b) => b.minSeatsPerBooking <= b.maxSeatsPerBooking,
    {
      message: "minSeatsPerBooking cannot exceed maxSeatsPerBooking",
      path: ["minSeatsPerBooking"],
    }
  );

export const CancellationConfigInputSchema = z.object({
  cancellationAllowed: z.boolean().default(true),
  cancellationDeadlineMinutes: z.number().int().min(0).max(1440).default(120),
  cancellationFeePercent: z
    .string()
    .trim()
    .refine((v) => {
      const n = parseFloat(v);
      return !isNaN(n) && n >= 0 && n <= 100;
    }, "Cancellation fee percent must be between 0.00 and 100.00")
    .default("10.00"),
  autoCancellationEnabled: z.boolean().default(false),
  autoCancellationTimeoutMinutes: z.number().int().min(1).max(60).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
});

export const RefundConfigInputSchema = z.object({
  refundWindowHours: z.number().int().min(0).max(720).default(24),
  refundPercentage: z
    .string()
    .trim()
    .refine((v) => {
      const n = parseFloat(v);
      return !isNaN(n) && n >= 0 && n <= 100;
    }, "Refund percentage must be between 0.00 and 100.00")
    .default("90.00"),
  refundMethod: ConfigRefundMethodEnum.default("ORIGINAL_PAYMENT"),
  processingTimeDays: z.number().int().min(1).max(30).default(5),
  gatewayAutoRefund: z.boolean().default(true),
});

export const AgeRestrictionConfigInputSchema = z
  .object({
    minAgeU: z.number().int().min(0).max(18).default(0),
    minAgeUA: z.number().int().min(0).max(18).default(12),
    minAgeA: z.number().int().min(0).max(21).default(18),
    minAgeS: z.number().int().min(0).max(21).default(18),
    customAgeRules: z.string().trim().max(1000).nullable().optional(),
    guardianRequiredUnderAge: z.number().int().min(0).max(18).nullable().optional(),
    requireAgeVerificationAtGate: z.boolean().default(true),
  })
  .refine(
    (a) => a.minAgeU <= a.minAgeUA && a.minAgeUA <= a.minAgeA,
    {
      message: "Age restrictions must follow logical hierarchy: U <= UA <= A",
      path: ["minAgeA"],
    }
  );

export const FeatureFlagConfigInputSchema = z.object({
  enableLoyalty: z.boolean().default(true),
  enableCoupons: z.boolean().default(true),
  enableGiftCards: z.boolean().default(true),
  enableMemberships: z.boolean().default(true),
  enableDynamicPricing: z.boolean().default(true),
  enableAiRecommendations: z.boolean().default(false),
  enableWaitlist: z.boolean().default(false),
  customFlags: z.record(z.boolean()).default({}),
});

export const ConfigurationTermsInputSchema = z.object({
  bookingTerms: z.string().trim().min(10, "Booking terms must be at least 10 characters"),
  refundTerms: z.string().trim().min(10, "Refund terms must be at least 10 characters"),
  privacyNotice: z.string().trim().max(5000).nullable().optional(),
  customerAgreement: z.string().trim().min(10, "Customer agreement must be at least 10 characters"),
});

// ------------------------------------------------------------------------------
// Top-Level Mutation Schemas
// ------------------------------------------------------------------------------

export const CreateTheatreConfigurationSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  status: TheatreConfigStatusEnum.default("DRAFT"),
  localization: LocalizationConfigInputSchema.optional(),
  booking: BookingConfigInputSchema.optional(),
  cancellation: CancellationConfigInputSchema.optional(),
  refund: RefundConfigInputSchema.optional(),
  ageRestriction: AgeRestrictionConfigInputSchema.optional(),
  featureFlags: FeatureFlagConfigInputSchema.optional(),
  terms: ConfigurationTermsInputSchema.optional(),
});

export const UpdateLocalizationConfigSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  currency: currencySchema.optional(),
  timezone: timezoneConfigSchema.optional(),
  primaryLanguage: languageCodeSchema.optional(),
  supportedLanguages: z.array(languageCodeSchema).optional(),
  dateFormat: z.string().trim().min(5).max(30).optional(),
  timeFormat: ConfigTimeFormatEnum.optional(),
  numberFormat: ConfigNumberFormatEnum.optional(),
  measurementUnits: ConfigMeasurementUnitsEnum.optional(),
});

export const UpdateBookingConfigSchema = z
  .object({
    theatreId: z.string().trim().min(1, "theatreId is required"),
    maxSeatsPerBooking: z.number().int().min(1).max(50).optional(),
    minSeatsPerBooking: z.number().int().min(1).max(10).optional(),
    advanceBookingDays: z.number().int().min(1).max(180).optional(),
    bookingCutoffMinutes: z.number().int().min(0).max(180).optional(),
    maxConcurrentBookingsPerUser: z.number().int().min(1).max(10).optional(),
    seatHoldDurationSeconds: z.number().int().min(60).max(1800).optional(),
  })
  .refine(
    (b) => {
      if (b.minSeatsPerBooking !== undefined && b.maxSeatsPerBooking !== undefined) {
        return b.minSeatsPerBooking <= b.maxSeatsPerBooking;
      }
      return true;
    },
    {
      message: "minSeatsPerBooking cannot exceed maxSeatsPerBooking",
      path: ["minSeatsPerBooking"],
    }
  );

export const UpdateCancellationConfigSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  cancellationAllowed: z.boolean().optional(),
  cancellationDeadlineMinutes: z.number().int().min(0).max(1440).optional(),
  cancellationFeePercent: z
    .string()
    .trim()
    .refine((v) => {
      const n = parseFloat(v);
      return !isNaN(n) && n >= 0 && n <= 100;
    }, "Cancellation fee percent must be between 0.00 and 100.00")
    .optional(),
  autoCancellationEnabled: z.boolean().optional(),
  autoCancellationTimeoutMinutes: z.number().int().min(1).max(60).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
});

export const UpdateRefundConfigSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  refundWindowHours: z.number().int().min(0).max(720).optional(),
  refundPercentage: z
    .string()
    .trim()
    .refine((v) => {
      const n = parseFloat(v);
      return !isNaN(n) && n >= 0 && n <= 100;
    }, "Refund percentage must be between 0.00 and 100.00")
    .optional(),
  refundMethod: ConfigRefundMethodEnum.optional(),
  processingTimeDays: z.number().int().min(1).max(30).optional(),
  gatewayAutoRefund: z.boolean().optional(),
});

export const UpdateAgeRestrictionConfigSchema = z
  .object({
    theatreId: z.string().trim().min(1, "theatreId is required"),
    minAgeU: z.number().int().min(0).max(18).optional(),
    minAgeUA: z.number().int().min(0).max(18).optional(),
    minAgeA: z.number().int().min(0).max(21).optional(),
    minAgeS: z.number().int().min(0).max(21).optional(),
    customAgeRules: z.string().trim().max(1000).nullable().optional(),
    guardianRequiredUnderAge: z.number().int().min(0).max(18).nullable().optional(),
    requireAgeVerificationAtGate: z.boolean().optional(),
  })
  .refine(
    (a) => {
      if (a.minAgeU !== undefined && a.minAgeUA !== undefined && a.minAgeU > a.minAgeUA) {
        return false;
      }
      if (a.minAgeUA !== undefined && a.minAgeA !== undefined && a.minAgeUA > a.minAgeA) {
        return false;
      }
      return true;
    },
    {
      message: "Age restrictions must follow logical hierarchy: U <= UA <= A",
      path: ["minAgeA"],
    }
  );

export const UpdateFeatureFlagsSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  enableLoyalty: z.boolean().optional(),
  enableCoupons: z.boolean().optional(),
  enableGiftCards: z.boolean().optional(),
  enableMemberships: z.boolean().optional(),
  enableDynamicPricing: z.boolean().optional(),
  enableAiRecommendations: z.boolean().optional(),
  enableWaitlist: z.boolean().optional(),
  customFlags: z.record(z.boolean()).optional(),
});

export const UpdateConfigurationTermsSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  bookingTerms: z.string().trim().min(10).optional(),
  refundTerms: z.string().trim().min(10).optional(),
  privacyNotice: z.string().trim().max(5000).nullable().optional(),
  customerAgreement: z.string().trim().min(10).optional(),
});

export const PublishTheatreConfigurationSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  expectedVersion: z.number().int().min(1).optional(),
  summary: z.string().trim().max(500).optional(),
});

export const RestoreConfigurationVersionSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  versionNumber: z.number().int().min(1),
});
