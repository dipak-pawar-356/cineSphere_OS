import { pgEnum } from "drizzle-orm/pg-core";

/**
 * ==============================================================================
 * CineSphere OS - PostgreSQL Global Enums
 * Production-ready normalized database enums supporting strict typing & migrations
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// Authentication, Identity & Access Control Enums
// ------------------------------------------------------------------------------
export const userRoleEnum = pgEnum("user_role", [
  "SUPER_ADMIN",
  "THEATRE_ADMIN",
  "HALL_MANAGER",
  "STAFF",
  "CUSTOMER",
]);

export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "PENDING_VERIFICATION",
  "SUSPENDED",
  "INVITED",
]);

export const loyaltyTierEnum = pgEnum("loyalty_tier", [
  "STANDARD",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "CINESPHERE_VIP",
]);

export const staffShiftEnum = pgEnum("staff_shift", [
  "MORNING",
  "EVENING",
  "NIGHT",
  "ROTATIONAL",
]);

export const staffStatusEnum = pgEnum("staff_status", [
  "ON_DUTY",
  "OFF_DUTY",
  "ON_LEAVE",
  "TERMINATED",
]);

// ------------------------------------------------------------------------------
// Multi-Tenant & Theatre Enums
// ------------------------------------------------------------------------------
export const theatreStatusEnum = pgEnum("theatre_status", [
  "ACTIVE",
  "MAINTENANCE",
  "RENOVATING",
  "PENDING_APPROVAL",
  "SUSPENDED",
]);

export const pricingTierEnum = pgEnum("pricing_tier", [
  "LUXURY",
  "PREMIUM",
  "STANDARD",
  "BUDGET",
]);

export const settlementPeriodEnum = pgEnum("settlement_period", [
  "T_PLUS_0_INSTANT",
  "T_PLUS_1_DAILY",
  "WEEKLY",
]);

export const cityTierEnum = pgEnum("city_tier", [
  "TIER_1",
  "TIER_2",
  "TIER_3",
]);

// ------------------------------------------------------------------------------
// Hall & Seating Architecture Enums
// ------------------------------------------------------------------------------
export const hallStatusEnum = pgEnum("hall_status", [
  "ACTIVE",
  "MAINTENANCE",
  "CLEANING",
  "SHOW_RUNNING",
  "INACTIVE",
]);

export const seatTypeEnum = pgEnum("seat_type", [
  "STANDARD",
  "RECLINER",
  "VIP",
  "COUPLE",
  "WHEELCHAIR",
  "SOFA",
]);

export const seatStatusEnum = pgEnum("seat_status", [
  "AVAILABLE",
  "SELECTED",
  "BOOKED",
  "RESERVED",
  "BLOCKED",
  "MAINTENANCE",
]);

// ------------------------------------------------------------------------------
// Movie & Catalog Enums
// ------------------------------------------------------------------------------
export const movieStatusEnum = pgEnum("movie_status", [
  "NOW_SHOWING",
  "UPCOMING",
  "SPECIAL_SCREENING",
  "ARCHIVED",
  "COMING_SOON",
]);

export const movieFormatEnum = pgEnum("movie_format", [
  "FORMAT_2D",
  "FORMAT_3D",
  "IMAX",
  "IMAX_3D",
  "FOUR_DX",
  "DOLBY_ATMOS",
  "DOLBY_CINEMA",
  "SCREEN_X",
  "STANDARD",
]);

export const movieCertificateEnum = pgEnum("movie_certificate", [
  "U",
  "UA",
  "UA_13_PLUS",
  "UA_16_PLUS",
  "A",
  "S",
  "PG_13",
  "R",
  "PG",
]);

// ------------------------------------------------------------------------------
// Show Scheduling & Inventory Enums
// ------------------------------------------------------------------------------
export const showStatusEnum = pgEnum("show_status", [
  "UPCOMING",
  "RUNNING",
  "HOUSEFULL",
  "COMPLETED",
  "CANCELLED",
]);

// ------------------------------------------------------------------------------
// Booking, Payment & Ticket Enums
// ------------------------------------------------------------------------------
export const bookingStatusEnum = pgEnum("booking_status", [
  "CONFIRMED",
  "CHECKED_IN",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PAID",
  "PENDING",
  "REFUNDED",
  "FAILED",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "UPI",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "NET_BANKING",
  "CASH",
  "WALLET",
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "VALID",
  "USED",
  "CANCELLED",
]);

// ------------------------------------------------------------------------------
// Operations, Reporting & Security Audit Enums
// ------------------------------------------------------------------------------
export const notificationTypeEnum = pgEnum("notification_type", [
  "BOOKING",
  "PAYMENT",
  "THEATRE",
  "MOVIE",
  "SHOW",
  "STAFF",
  "ALERT",
  "APPROVAL",
  "SYSTEM",
]);

export const notificationSeverityEnum = pgEnum("notification_severity", [
  "INFO",
  "SUCCESS",
  "WARNING",
  "DANGER",
]);

export const notificationAudienceEnum = pgEnum("notification_audience", [
  "CUSTOMER",
  "ADMIN",
  "SYSTEM",
  "ALL",
]);

export const reportCategoryEnum = pgEnum("report_category", [
  "DAILY_BOX_OFFICE",
  "OCCUPANCY",
  "CONCESSIONS",
  "DISTRIBUTOR_SPLIT",
  "TAX_COMPLIANCE",
  "AUDITORIUM_PERFORMANCE",
  "TURNSTILE_SECURITY",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "READY",
  "PROCESSING",
  "ARCHIVED",
  "FAILED",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "LOCK",
  "UNLOCK",
  "OVERRIDE",
  "EXPORT",
]);
