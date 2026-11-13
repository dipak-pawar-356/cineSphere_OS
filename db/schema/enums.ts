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
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "ARCHIVED",
  "SOFT_DELETED",
  "MAINTENANCE",
  "RENOVATING",
]);

export const theatreApprovalStatusEnum = pgEnum("theatre_approval_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REVISION_REQUESTED",
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
export const bookingSessionStatusEnum = pgEnum("booking_session_status", [
  "ACTIVE",
  "EXPIRED",
  "CANCELLED",
  "COMPLETED",
  "ABANDONED",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "CONFIRMED",
  "CHECKED_IN",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
]);

export const paymentProviderEnum = pgEnum("payment_provider", [
  "UPI",
  "RAZORPAY",
  "PHONEPE",
  "PAYTM",
  "STRIPE",
  "CASH_COUNTER",
  "CORPORATE_BILLING",
  "GIFT_CARD",
  "FUTURE_PROVIDER",
]);

export const paymentProviderStatusEnum = pgEnum("payment_provider_status", [
  "DRAFT",
  "ACTIVE",
  "INACTIVE",
  "DISABLED",
  "ARCHIVED",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "AUTHORIZED",
  "CAPTURED",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
  "EXPIRED",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "UPI",
  "CARDS",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "NET_BANKING",
  "WALLET",
  "EMI",
  "CASH_COUNTER",
  "CASH",
  "CORPORATE_BILLING",
  "GIFT_VOUCHER",
  "MEMBERSHIP_WALLET",
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "ISSUED",
  "ACTIVE",
  "VALID",
  "USED",
  "CANCELLED",
  "EXPIRED",
  "REFUNDED",
  "VOIDED",
]);

export const ticketStrategyEnum = pgEnum("ticket_strategy", [
  "PER_BOOKING",
  "PER_SEAT",
]);

// ------------------------------------------------------------------------------
// Operations, Reporting & Security Audit Enums
// ------------------------------------------------------------------------------
export const notificationTypeEnum = pgEnum("notification_type", [
  "BOOKING",
  "PAYMENT",
  "TICKET",
  "THEATRE",
  "MOVIE",
  "SHOW",
  "STAFF",
  "ALERT",
  "APPROVAL",
  "SYSTEM",
  "SECURITY",
  "MARKETING",
]);

export const notificationPriorityEnum = pgEnum("notification_priority", [
  "LOW",
  "NORMAL",
  "HIGH",
  "CRITICAL",
]);

export const notificationStatusEnum = pgEnum("notification_status", [
  "UNREAD",
  "READ",
  "ARCHIVED",
  "DELETED",
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "IN_APP",
  "EMAIL",
  "SMS",
  "PUSH",
  "WHATSAPP",
  "TELEGRAM",
  "WEBHOOK",
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

// ------------------------------------------------------------------------------
// Security Events & Hardening Enums (Phase 2 - Part 16)
// ------------------------------------------------------------------------------
export const securityEventTypeEnum = pgEnum("security_event_type", [
  "FAILED_LOGIN",
  "MULTIPLE_LOGIN_ATTEMPTS",
  "PERMISSION_VIOLATION",
  "TENANT_VIOLATION",
  "RATE_LIMIT_TRIGGERED",
  "BOOKING_CONFLICT",
  "PAYMENT_FAILURE",
  "CONFIGURATION_CHANGE",
  "SUSPICIOUS_PAYLOAD",
  "CSRF_VIOLATION",
]);

export const securitySeverityEnum = pgEnum("security_severity", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const logSeverityEnum = pgEnum("log_severity", [
  "DEBUG",
  "INFO",
  "WARN",
  "ERROR",
  "FATAL",
]);

export const systemHealthStatusEnum = pgEnum("system_health_status", [
  "HEALTHY",
  "DEGRADED",
  "DOWN",
]);

// ------------------------------------------------------------------------------
// Theatre Branding & Digital Media Management Enums (Phase 3 - Part 2)
// ------------------------------------------------------------------------------
export const theatreMediaTypeEnum = pgEnum("theatre_media_type", [
  "LOGO",
  "BANNER",
  "COVER_IMAGE",
  "HERO_IMAGE",
  "THUMBNAIL",
  "GALLERY_IMAGE",
  "FUTURE_VIDEO_PLACEHOLDER",
  "FUTURE_PANORAMA_PLACEHOLDER",
]);

export const theatreMediaStatusEnum = pgEnum("theatre_media_status", [
  "DRAFT",
  "ACTIVE",
  "HIDDEN",
  "ARCHIVED",
  "DELETED",
]);

export const theatreFutureVideoSubtypeEnum = pgEnum("theatre_future_video_subtype", [
  "PROMOTIONAL_VIDEO",
  "THEATRE_WALKTHROUGH",
  "HALL_PREVIEW",
  "VIDEO_360",
  "VIRTUAL_TOUR",
]);

// ------------------------------------------------------------------------------
// Theatre Profile Management Enums (Phase 3 - Part 3)
// ------------------------------------------------------------------------------
export const theatreProfileStatusEnum = pgEnum("theatre_profile_status", [
  "DRAFT",
  "PUBLISHED",
  "HIDDEN",
  "ARCHIVED",
]);

export const theatreCategoryTypeEnum = pgEnum("theatre_category_type", [
  "MULTIPLEX",
  "SINGLE_SCREEN",
  "LUXURY_CINEMA",
  "DRIVE_IN_CINEMA",
  "MINI_THEATRE",
  "INDEPENDENT_THEATRE",
  "CHAIN_THEATRE",
  "CUSTOM",
]);

export const theatreOwnershipModelEnum = pgEnum("theatre_ownership_model", [
  "CHAIN",
  "INDEPENDENT",
]);

export const theatreSocialPlatformEnum = pgEnum("theatre_social_platform", [
  "WEBSITE",
  "FACEBOOK",
  "INSTAGRAM",
  "X_TWITTER",
  "YOUTUBE",
  "LINKEDIN",
  "THREADS",
  "CUSTOM",
]);

// ------------------------------------------------------------------------------
// Theatre Location & Address Management Enums (Phase 3 - Part 4)
// ------------------------------------------------------------------------------
export const theatreLocationStatusEnum = pgEnum("theatre_location_status", [
  "DRAFT",
  "VERIFIED",
  "PUBLISHED",
  "ARCHIVED",
]);

export const theatreLocationVerificationStatusEnum = pgEnum(
  "theatre_location_verification_status",
  [
    "UNVERIFIED",
    "PENDING_REVIEW",
    "VERIFIED",
    "REJECTED",
  ]
);

export const theatreCoordinateSourceEnum = pgEnum("theatre_coordinate_source", [
  "MANUAL",
  "GEOCODED",
  "GPS",
  "SYSTEM",
  "MAP_PIN",
]);

// ------------------------------------------------------------------------------
// Theatre Amenities & Facilities Management Enums (Phase 3 - Part 5)
// ------------------------------------------------------------------------------
export const amenityStatusEnum = pgEnum("amenity_status", [
  "ACTIVE",
  "INACTIVE",
  "DRAFT",
  "ARCHIVED",
]);

export const amenityAvailabilityModeEnum = pgEnum("amenity_availability_mode", [
  "AVAILABLE",
  "TEMPORARILY_UNAVAILABLE",
  "SEASONAL",
  "UNDER_MAINTENANCE",
]);

export const amenityVisibilityEnum = pgEnum("amenity_visibility", [
  "PUBLIC",
  "HIDDEN",
  "INTERNAL",
]);

export const amenityPriorityEnum = pgEnum("amenity_priority", [
  "CRITICAL",
  "FEATURED",
  "HIGH",
  "MEDIUM",
  "STANDARD",
  "LOW",
]);

export const amenityEntityTypeEnum = pgEnum("amenity_entity_type", [
  "THEATRE",
  "HALL",
  "LOUNGE",
  "PREMIUM_SCREEN",
]);

// ------------------------------------------------------------------------------
// Theatre Contact Management Enums (Phase 3 - Part 6)
// ------------------------------------------------------------------------------
export const contactChannelTypeEnum = pgEnum("contact_channel_type", [
  "PHONE",
  "EMAIL",
  "WEBSITE",
  "SOCIAL_LINK",
  "EMERGENCY",
  "MANAGER",
  "WHATSAPP",
  "TELEGRAM",
  "LIVE_CHAT",
  "CALL_CENTER",
]);

export const contactRoleEnum = pgEnum("contact_role", [
  "CUSTOMER_SUPPORT",
  "GENERAL_ENQUIRY",
  "EMERGENCY_DESK",
  "DUTY_MANAGER",
  "BUSINESS_DEVELOPMENT",
  "CORPORATE_OFFICE",
  "BOOKING_BOX_OFFICE",
  "TECHNICAL_OPERATIONS",
  "LOST_AND_FOUND",
]);

export const contactAvailabilityModeEnum = pgEnum("contact_availability_mode", [
  "STANDARD_BUSINESS_HOURS",
  "TWENTY_FOUR_SEVEN",
  "EMERGENCY_ONLY",
  "SHOWTIME_ONLY",
  "TEMPORARILY_INACTIVE",
]);

export const contactVerificationStatusEnum = pgEnum("contact_verification_status", [
  "UNVERIFIED",
  "PENDING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
]);

export const contactVisibilityEnum = pgEnum("contact_visibility", [
  "PUBLIC",
  "HIDDEN",
  "INTERNAL_ONLY",
]);

export const contactStatusEnum = pgEnum("contact_status", [
  "ACTIVE",
  "INACTIVE",
  "DRAFT",
  "ARCHIVED",
]);

export const contactEntityTypeEnum = pgEnum("contact_entity_type", [
  "THEATRE",
  "CHAIN",
  "CORPORATE",
  "VENDOR",
  "SUPPORT_CENTER",
]);

// ------------------------------------------------------------------------------
// Theatre Business Information Management Enums (Phase 3 - Part 7)
// ------------------------------------------------------------------------------
export const businessCategoryEnum = pgEnum("business_category", [
  "MULTIPLEX",
  "SINGLE_SCREEN",
  "ENTERTAINMENT_COMPANY",
  "CINEMA_CHAIN",
  "PRIVATE_LIMITED",
  "LLP",
  "PARTNERSHIP",
  "PROPRIETORSHIP",
  "TRUST",
  "GOVERNMENT",
  "CUSTOM",
]);

export const businessOwnershipTypeEnum = pgEnum("business_ownership_type", [
  "DIRECT_OWNERSHIP",
  "LEASED",
  "FRANCHISE",
  "JOINT_VENTURE",
  "MANAGED_OPERATOR",
]);

export const businessComplianceStatusEnum = pgEnum("business_compliance_status", [
  "DRAFT",
  "PENDING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
  "ARCHIVED",
]);

export const taxSystemTypeEnum = pgEnum("tax_system_type", [
  "GST",
  "VAT",
  "SALES_TAX",
  "CUSTOM",
]);

export const pricingTaxModelEnum = pgEnum("pricing_tax_model", [
  "TAX_INCLUSIVE",
  "TAX_EXCLUSIVE",
]);

export const taxStatusEnum = pgEnum("tax_status", [
  "ACTIVE",
  "INACTIVE",
  "PENDING_REVIEW",
  "EXEMPT",
]);

export const businessDocumentTypeEnum = pgEnum("business_document_type", [
  "GST_CERTIFICATE",
  "PAN_CARD",
  "CIN_CERTIFICATE",
  "TRADE_LICENSE",
  "INCORPORATION_CERTIFICATE",
  "AUTHORIZATION_LETTER",
  "BOARD_RESOLUTION",
  "OTHER",
]);

export const businessDocumentVerificationStatusEnum = pgEnum("business_document_verification_status", [
  "PENDING",
  "VERIFIED",
  "REJECTED",
]);

// ------------------------------------------------------------------------------
// Theatre Operating Hours Management Enums (Phase 3 - Part 8)
// ------------------------------------------------------------------------------
export const operatingDayOfWeekEnum = pgEnum("operating_day_of_week", [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

export const operatingProfileStatusEnum = pgEnum("operating_profile_status", [
  "ACTIVE",
  "INACTIVE",
  "DRAFT",
  "SUSPENDED",
]);

export const specialOperatingEventTypeEnum = pgEnum("special_operating_event_type", [
  "FESTIVAL",
  "MOVIE_PREMIERE",
  "PRIVATE_SHOW",
  "CORPORATE_BOOKING",
  "CUSTOM",
]);

export const maintenanceWindowStatusEnum = pgEnum("maintenance_window_status", [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

// ------------------------------------------------------------------------------
// Dynamic Theatre Configuration Management Enums (Phase 3 - Part 9)
// ------------------------------------------------------------------------------
export const theatreConfigStatusEnum = pgEnum("theatre_config_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const configTimeFormatEnum = pgEnum("config_time_format", [
  "12H",
  "24H",
]);

export const configNumberFormatEnum = pgEnum("config_number_format", [
  "INDIAN",
  "INTERNATIONAL",
]);

export const configMeasurementUnitsEnum = pgEnum("config_measurement_units", [
  "METRIC",
  "IMPERIAL",
]);

export const configRefundMethodEnum = pgEnum("config_refund_method", [
  "ORIGINAL_PAYMENT",
  "WALLET",
  "STORE_CREDIT",
]);

export const configCensorRatingEnum = pgEnum("config_censor_rating", [
  "U",
  "UA",
  "A",
  "S",
]);





