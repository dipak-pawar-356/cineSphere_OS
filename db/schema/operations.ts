import {
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import {
  auditActionEnum,
  notificationTypeEnum,
  notificationSeverityEnum,
  notificationAudienceEnum,
  reportCategoryEnum,
  reportStatusEnum,
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
    audience: notificationAudienceEnum("audience").notNull().default("CUSTOMER"), // CUSTOMER, ADMIN, SYSTEM, ALL
    title: varchar("title", { length: 200 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_unread_idx").on(table.userId, table.isRead),
    index("notifications_theatre_id_idx").on(table.theatreId),
    index("notifications_audience_idx").on(table.audience),
    index("notifications_created_at_idx").on(table.createdAt),
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
