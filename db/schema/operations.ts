import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  auditActionEnum,
  notificationTypeEnum,
  notificationSeverityEnum,
  notificationAudienceEnum,
  notificationPriorityEnum,
  notificationStatusEnum,
  notificationChannelEnum,
  reportCategoryEnum,
  reportStatusEnum,
  securityEventTypeEnum,
  securitySeverityEnum,
  logSeverityEnum,
  systemHealthStatusEnum,
} from "./enums";
import { users } from "./users";
import { theatres } from "./theatres";

/**
 * ==============================================================================
 * CineSphere OS - Operations, Notifications, Reporting & Security Audit Schema
 * Comprehensive audit trail, multi-tier notification feeds, and reporting marts
 * ==============================================================================
 */

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 36 })
      .references(() => users.id, { onDelete: "set null" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "set null" }),
    action: auditActionEnum("action").notNull().default("UPDATE"),
    module: varchar("module", { length: 50 }).notNull(), // "auth", "theatres", "shows", "bookings", "finance", "settings"
    description: text("description").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    ipAddress: varchar("ip_address", { length: 50 }),  // IP address placeholder
    userAgent: text("user_agent"),                     // Device & client user agent placeholder
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_theatre_id_idx").on(table.theatreId),
    index("audit_logs_user_id_idx").on(table.userId),
    index("audit_logs_module_idx").on(table.module),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ]
);

export const notifications = pgTable(
  "notifications",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 36 })
      .references(() => users.id, { onDelete: "cascade" }), // Nullable for broadcast / system-wide
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "cascade" }), // Nullable for platform notifications
    type: notificationTypeEnum("type").notNull().default("SYSTEM"),
    severity: notificationSeverityEnum("severity").notNull().default("INFO"),
    priority: notificationPriorityEnum("priority").notNull().default("NORMAL"),
    status: notificationStatusEnum("status").notNull().default("UNREAD"),
    audience: notificationAudienceEnum("audience").notNull().default("CUSTOMER"), // CUSTOMER, ADMIN, SYSTEM, ALL
    title: varchar("title", { length: 200 }).notNull(),
    message: text("message").notNull(),
    sourceModule: varchar("source_module", { length: 50 }).notNull().default("SYSTEM"),
    referenceEntity: jsonb("reference_entity").$type<{ type: string; id: string; link?: string }>(),
    channelDispatches: jsonb("channel_dispatches").$type<Record<string, string>>().default({ inApp: "DELIVERED" }),
    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_unread_idx").on(table.userId, table.isRead),
    index("notifications_user_status_idx").on(table.userId, table.status),
    index("notifications_theatre_id_idx").on(table.theatreId),
    index("notifications_audience_idx").on(table.audience),
    index("notifications_priority_idx").on(table.priority),
    index("notifications_created_at_idx").on(table.createdAt),
  ]
);

export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    channels: jsonb("channels")
      .$type<{ inApp: boolean; email: boolean; sms: boolean; push: boolean; whatsapp: boolean }>()
      .notNull()
      .default({ inApp: true, email: true, sms: true, push: true, whatsapp: false }),
    categories: jsonb("categories")
      .$type<Record<string, boolean>>()
      .notNull()
      .default({
        bookingUpdates: true,
        paymentReceipts: true,
        ticketPasses: true,
        showReminders: true,
        promotionalOffers: false,
        securityAlerts: true,
      }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("notif_prefs_user_id_idx").on(table.userId),
  ]
);

export const reports = pgTable(
  "reports",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "cascade" }), // Null for Super Admin cross-theatre aggregations
    category: reportCategoryEnum("category").notNull().default("DAILY_BOX_OFFICE"),
    title: varchar("title", { length: 200 }).notNull(),
    period: varchar("period", { length: 50 }).notNull(), // Daily, Weekly, Monthly, Q1-2026, etc.
    status: reportStatusEnum("status").notNull().default("READY"),
    fileSize: varchar("file_size", { length: 30 }).default("1.2 MB"),
    metrics: jsonb("metrics").$type<{
      totalRevenue?: number;
      totalBookings?: number;
      occupancyPercent?: number;
      topMovies?: { movieId: string; title: string; gross: number }[];
      theatreSummary?: { theatreId: string; name: string; revenue: number }[];
      rawReportData?: Record<string, unknown>;
    }>().default({}),
    downloadUrl: text("download_url"),
    generatedBy: varchar("generated_by", { length: 36 })
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("reports_theatre_id_idx").on(table.theatreId),
    index("reports_category_idx").on(table.category),
    index("reports_period_idx").on(table.period),
    index("reports_created_at_idx").on(table.createdAt),
  ]
);

/**
 * Pre-aggregated Analytics Summary Entity
 * Decouples reporting dashboards from raw transactional queries.
 * Supports Daily, Monthly, Yearly and Dimensional Aggregations.
 */
export const analyticsSummaries = pgTable(
  "analytics_summaries",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "cascade" }), // Nullable for Platform Super Admin
    aggregatePeriod: varchar("aggregate_period", { length: 20 }).notNull(), // DAILY, MONTHLY, YEARLY
    periodKey: varchar("period_key", { length: 50 }).notNull(), // e.g. "2026-11-10", "2026-11", "2026"
    dimensionType: varchar("dimension_type", { length: 50 }).notNull(), // PLATFORM, THEATRE, MOVIE, HALL, SECTION, CUSTOMER
    dimensionId: varchar("dimension_id", { length: 36 }), // e.g. movieId, hallId, customerId
    metrics: jsonb("metrics").$type<{
      revenue: number;
      bookingsCount: number;
      ticketsIssued: number;
      occupancyPercent: number;
      atp: number; // Average Ticket Price
      abv: number; // Average Booking Value
      revpas: number; // Revenue Per Available Seat
      cancellationRate: number;
      conversionRate: number;
      extraMetrics?: Record<string, unknown>;
    }>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("analytics_summaries_theatre_period_idx").on(table.theatreId, table.aggregatePeriod, table.periodKey),
    index("analytics_summaries_dimension_idx").on(table.dimensionType, table.dimensionId),
    index("analytics_summaries_period_key_idx").on(table.periodKey),
  ]
);

/**
 * Report Snapshot Entity
 * Stores point-in-time analytical runs and customizable BI snapshots.
 */
export const reportSnapshots = pgTable(
  "report_snapshots",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "cascade" }), // Nullable for Platform Super Admin
    reportName: varchar("report_name", { length: 255 }).notNull(),
    reportType: varchar("report_type", { length: 100 }).notNull(), // REVENUE, OCCUPANCY, MOVIE, HALL, PAYMENT, CUSTOM
    dateRange: jsonb("date_range").$type<{ from: string; to: string; preset: string }>().notNull(),
    filters: jsonb("filters").$type<Record<string, unknown>>().default({}),
    metrics: jsonb("metrics").$type<Record<string, unknown>>().notNull(),
    breakdown: jsonb("breakdown").$type<Array<Record<string, unknown>>>().default([]),
    generatedBy: varchar("generated_by", { length: 36 })
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("report_snapshots_theatre_idx").on(table.theatreId),
    index("report_snapshots_type_idx").on(table.reportType),
    index("report_snapshots_created_at_idx").on(table.createdAt),
  ]
);

/**
 * ==============================================================================
 * CineSphere OS - Security Events, Structured Logs & Health Telemetry
 * Production-ready observability, intrusion logging and platform hardening
 * ==============================================================================
 */

export const securityEvents = pgTable(
  "security_events",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    eventType: securityEventTypeEnum("event_type").notNull(),
    severity: securitySeverityEnum("severity").notNull().default("MEDIUM"),
    actorId: varchar("actor_id", { length: 36 })
      .references(() => users.id, { onDelete: "set null" }),
    actorRole: varchar("actor_role", { length: 50 }),
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "cascade" }),
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
    requestPath: varchar("request_path", { length: 255 }),
    details: text("details").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    isResolved: boolean("is_resolved").notNull().default(false),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("security_events_type_idx").on(table.eventType),
    index("security_events_severity_idx").on(table.severity),
    index("security_events_theatre_idx").on(table.theatreId),
    index("security_events_created_at_idx").on(table.createdAt),
    index("security_events_is_resolved_idx").on(table.isResolved),
  ]
);

export const structuredLogs = pgTable(
  "structured_logs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    requestId: varchar("request_id", { length: 64 }).notNull(),
    correlationId: varchar("correlation_id", { length: 64 }).notNull(),
    traceId: varchar("trace_id", { length: 64 }),
    userId: varchar("user_id", { length: 36 })
      .references(() => users.id, { onDelete: "set null" }),
    userRole: varchar("user_role", { length: 50 }),
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "set null" }),
    severity: logSeverityEnum("severity").notNull().default("INFO"),
    category: varchar("category", { length: 50 }).notNull().default("SYSTEM"),
    module: varchar("module", { length: 50 }).notNull(),
    message: text("message").notNull(),
    durationMs: integer("duration_ms"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    errorData: jsonb("error_data").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("structured_logs_correlation_id_idx").on(table.correlationId),
    index("structured_logs_request_id_idx").on(table.requestId),
    index("structured_logs_severity_idx").on(table.severity),
    index("structured_logs_category_idx").on(table.category),
    index("structured_logs_theatre_idx").on(table.theatreId),
    index("structured_logs_created_at_idx").on(table.createdAt),
  ]
);

export const systemHealthMetrics = pgTable(
  "system_health_metrics",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    nodeEnv: varchar("node_env", { length: 50 }).notNull().default("production"),
    status: systemHealthStatusEnum("status").notNull().default("HEALTHY"),
    dbLatencyMs: integer("db_latency_ms").notNull().default(0),
    activeSessions: integer("active_sessions").notNull().default(0),
    memoryHeapUsedMb: integer("memory_heap_used_mb").notNull().default(0),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("system_health_metrics_status_idx").on(table.status),
    index("system_health_metrics_created_at_idx").on(table.createdAt),
  ]
);


