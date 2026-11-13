import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { theatres } from "./theatres";
import {
  theatreConfigStatusEnum,
  configTimeFormatEnum,
  configNumberFormatEnum,
  configMeasurementUnitsEnum,
  configRefundMethodEnum,
} from "./enums";

/**
 * ==============================================================================
 * CineSphere OS — Dynamic Theatre Configuration Schema (Phase 3 – Part 9)
 * ==============================================================================
 * Enterprise multi-tenant configuration domain. Modeled as normalized, strongly
 * typed independent entities (Localization, Booking Rules, Cancellation, Refund,
 * Age Restrictions, Feature Flags, and Terms) rather than a single JSON blob.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. THEATRE CONFIGURATION (Root Configuration Profile Entity)
// ------------------------------------------------------------------------------
export const theatreConfigurations = pgTable(
  "theatre_configurations",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" })
      .unique(),
    status: theatreConfigStatusEnum("status").notNull().default("DRAFT"),
    version: integer("version").notNull().default(1),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 40 }),
    updatedBy: varchar("updated_by", { length: 40 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_configurations_theatre_id_idx").on(table.theatreId),
    index("theatre_configurations_status_idx").on(table.status),
  ]
);

// ------------------------------------------------------------------------------
// 2. LOCALIZATION CONFIGURATION
// ------------------------------------------------------------------------------
export const theatreLocalizationConfigurations = pgTable(
  "theatre_localization_configurations",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    configurationId: varchar("configuration_id", { length: 40 })
      .notNull()
      .references(() => theatreConfigurations.id, { onDelete: "cascade" })
      .unique(),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    currency: varchar("currency", { length: 10 }).notNull().default("INR"),
    timezone: varchar("timezone", { length: 60 }).notNull().default("Asia/Kolkata"),
    primaryLanguage: varchar("primary_language", { length: 10 }).notNull().default("en"),
    supportedLanguages: jsonb("supported_languages").notNull().default(["en"]),
    dateFormat: varchar("date_format", { length: 30 }).notNull().default("DD/MM/YYYY"),
    timeFormat: configTimeFormatEnum("time_format").notNull().default("12H"),
    numberFormat: configNumberFormatEnum("number_format").notNull().default("INDIAN"),
    measurementUnits: configMeasurementUnitsEnum("measurement_units").notNull().default("METRIC"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_localization_configs_config_id_idx").on(table.configurationId),
    index("theatre_localization_configs_theatre_id_idx").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 3. BOOKING CONFIGURATION
// ------------------------------------------------------------------------------
export const theatreBookingConfigurations = pgTable(
  "theatre_booking_configurations",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    configurationId: varchar("configuration_id", { length: 40 })
      .notNull()
      .references(() => theatreConfigurations.id, { onDelete: "cascade" })
      .unique(),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    maxSeatsPerBooking: integer("max_seats_per_booking").notNull().default(10),
    minSeatsPerBooking: integer("min_seats_per_booking").notNull().default(1),
    advanceBookingDays: integer("advance_booking_days").notNull().default(30),
    bookingCutoffMinutes: integer("booking_cutoff_minutes").notNull().default(15),
    maxConcurrentBookingsPerUser: integer("max_concurrent_bookings_per_user").notNull().default(3),
    seatHoldDurationSeconds: integer("seat_hold_duration_seconds").notNull().default(600),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_booking_configs_config_id_idx").on(table.configurationId),
    index("theatre_booking_configs_theatre_id_idx").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 4. CANCELLATION CONFIGURATION
// ------------------------------------------------------------------------------
export const theatreCancellationConfigurations = pgTable(
  "theatre_cancellation_configurations",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    configurationId: varchar("configuration_id", { length: 40 })
      .notNull()
      .references(() => theatreConfigurations.id, { onDelete: "cascade" })
      .unique(),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    cancellationAllowed: boolean("cancellation_allowed").notNull().default(true),
    cancellationDeadlineMinutes: integer("cancellation_deadline_minutes").notNull().default(120),
    cancellationFeePercent: decimal("cancellation_fee_percent", { precision: 5, scale: 2 })
      .notNull()
      .default("10.00"),
    autoCancellationEnabled: boolean("auto_cancellation_enabled").notNull().default(false),
    autoCancellationTimeoutMinutes: integer("auto_cancellation_timeout_minutes").default(15),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_cancellation_configs_config_id_idx").on(table.configurationId),
    index("theatre_cancellation_configs_theatre_id_idx").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 5. REFUND CONFIGURATION
// ------------------------------------------------------------------------------
export const theatreRefundConfigurations = pgTable(
  "theatre_refund_configurations",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    configurationId: varchar("configuration_id", { length: 40 })
      .notNull()
      .references(() => theatreConfigurations.id, { onDelete: "cascade" })
      .unique(),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    refundWindowHours: integer("refund_window_hours").notNull().default(24),
    refundPercentage: decimal("refund_percentage", { precision: 5, scale: 2 })
      .notNull()
      .default("90.00"),
    refundMethod: configRefundMethodEnum("refund_method").notNull().default("ORIGINAL_PAYMENT"),
    processingTimeDays: integer("processing_time_days").notNull().default(5),
    gatewayAutoRefund: boolean("gateway_auto_refund").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_refund_configs_config_id_idx").on(table.configurationId),
    index("theatre_refund_configs_theatre_id_idx").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 6. AGE RESTRICTION CONFIGURATION
// ------------------------------------------------------------------------------
export const theatreAgeRestrictionConfigurations = pgTable(
  "theatre_age_restriction_configurations",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    configurationId: varchar("configuration_id", { length: 40 })
      .notNull()
      .references(() => theatreConfigurations.id, { onDelete: "cascade" })
      .unique(),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    minAgeU: integer("min_age_u").notNull().default(0),
    minAgeUA: integer("min_age_ua").notNull().default(12),
    minAgeA: integer("min_age_a").notNull().default(18),
    minAgeS: integer("min_age_s").notNull().default(18),
    customAgeRules: text("custom_age_rules"),
    guardianRequiredUnderAge: integer("guardian_required_under_age").default(12),
    requireAgeVerificationAtGate: boolean("require_age_verification_at_gate").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_age_restriction_configs_config_id_idx").on(table.configurationId),
    index("theatre_age_restriction_configs_theatre_id_idx").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 7. FEATURE FLAG CONFIGURATION
// ------------------------------------------------------------------------------
export const theatreFeatureFlagConfigurations = pgTable(
  "theatre_feature_flag_configurations",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    configurationId: varchar("configuration_id", { length: 40 })
      .notNull()
      .references(() => theatreConfigurations.id, { onDelete: "cascade" })
      .unique(),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    enableLoyalty: boolean("enable_loyalty").notNull().default(true),
    enableCoupons: boolean("enable_coupons").notNull().default(true),
    enableGiftCards: boolean("enable_gift_cards").notNull().default(true),
    enableMemberships: boolean("enable_memberships").notNull().default(true),
    enableDynamicPricing: boolean("enable_dynamic_pricing").notNull().default(true),
    enableAiRecommendations: boolean("enable_ai_recommendations").notNull().default(false),
    enableWaitlist: boolean("enable_waitlist").notNull().default(false),
    customFlags: jsonb("custom_flags").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_feature_flag_configs_config_id_idx").on(table.configurationId),
    index("theatre_feature_flag_configs_theatre_id_idx").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 8. CONFIGURATION TERMS & CONDITIONS
// ------------------------------------------------------------------------------
export const theatreConfigurationTerms = pgTable(
  "theatre_configuration_terms",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    configurationId: varchar("configuration_id", { length: 40 })
      .notNull()
      .references(() => theatreConfigurations.id, { onDelete: "cascade" })
      .unique(),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    bookingTerms: text("booking_terms").notNull(),
    refundTerms: text("refund_terms").notNull(),
    privacyNotice: text("privacy_notice"),
    customerAgreement: text("customer_agreement").notNull(),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_config_terms_config_id_idx").on(table.configurationId),
    index("theatre_config_terms_theatre_id_idx").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 9. CONFIGURATION VERSION SNAPSHOTS (Immutable Audit Ledger)
// ------------------------------------------------------------------------------
export const theatreConfigurationVersions = pgTable(
  "theatre_configuration_versions",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    configurationId: varchar("configuration_id", { length: 40 })
      .notNull()
      .references(() => theatreConfigurations.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 40 }),
    versionNumber: integer("version_number").notNull(),
    snapshot: jsonb("snapshot").notNull(),
    changeSummary: text("change_summary"),
    changedBy: varchar("changed_by", { length: 40 }),
    changedRole: varchar("changed_role", { length: 40 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_configuration_versions_config_id_idx").on(table.configurationId),
    index("theatre_configuration_versions_theatre_id_idx").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// Semantic Aliases matching Architecture Specification
// ------------------------------------------------------------------------------
export const TheatreConfiguration = theatreConfigurations;
export const LocalizationConfiguration = theatreLocalizationConfigurations;
export const BookingConfiguration = theatreBookingConfigurations;
export const CancellationConfiguration = theatreCancellationConfigurations;
export const RefundConfiguration = theatreRefundConfigurations;
export const AgeRestrictionConfiguration = theatreAgeRestrictionConfigurations;
export const FeatureFlagConfiguration = theatreFeatureFlagConfigurations;
export const ConfigurationTerms = theatreConfigurationTerms;
export const ConfigurationVersion = theatreConfigurationVersions;
