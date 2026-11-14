import {
  pgTable,
  varchar,
  text,
  timestamp,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { theatres } from "./theatres";
import {
  dashboardPeriodTypeEnum,
  dashboardActivityTypeEnum,
} from "./enums";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Dashboard & Analytics Layer Schema (Phase 3 – Part 11)
 * ==============================================================================
 * Dedicated analytics & materialized metrics persistence layer for operational
 * dashboards. The UI consumes pre-aggregated metrics rather than issuing heavy
 * direct SQL queries across transactional tables (Bookings, Payments, Shows, Halls).
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. MATERIALIZED METRICS SNAPSHOTS (Pre-aggregated Operational Metrics)
// ------------------------------------------------------------------------------
export const theatreDashboardMetrics = pgTable(
  "theatre_dashboard_materialized_metrics",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    periodType: dashboardPeriodTypeEnum("period_type").notNull().default("TODAY"),
    periodKey: varchar("period_key", { length: 64 }).notNull(), // e.g. "2026-11-15", "W46", "2026-11"
    currency: varchar("currency", { length: 10 }).notNull().default("INR"),
    timezone: varchar("timezone", { length: 64 }).notNull().default("Asia/Kolkata"),
    revenueMetrics: jsonb("revenue_metrics").notNull(),
    bookingMetrics: jsonb("booking_metrics").notNull(),
    showMetrics: jsonb("show_metrics").notNull(),
    hallMetrics: jsonb("hall_metrics").notNull(),
    occupancyMetrics: jsonb("occupancy_metrics").notNull(),
    paymentMetrics: jsonb("payment_metrics").notNull(),
    operationalAlerts: jsonb("operational_alerts").notNull(),
    lastCalculatedAt: timestamp("last_calculated_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_theatre_dashboard_metrics_theatre").on(table.theatreId),
    index("idx_theatre_dashboard_metrics_lookup").on(table.theatreId, table.periodType, table.periodKey),
  ]
);

// ------------------------------------------------------------------------------
// 2. USER DASHBOARD PREFERENCES (Decoupled Personalization)
// ------------------------------------------------------------------------------
export const userDashboardPreferences = pgTable(
  "user_dashboard_preferences",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    userId: varchar("user_id", { length: 40 }).notNull(),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    visibleWidgetIds: jsonb("visible_widget_ids").notNull(), // array of widget IDs
    widgetOrder: jsonb("widget_order").notNull(), // array of widget IDs in custom order
    collapsedWidgetIds: jsonb("collapsed_widget_ids").notNull(), // array of collapsed widget IDs
    favoriteWidgetIds: jsonb("favorite_widget_ids").notNull(), // array of pinned widget IDs
    defaultDatePreset: dashboardPeriodTypeEnum("default_date_preset").notNull().default("TODAY"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_user_dashboard_prefs_user_theatre").on(table.userId, table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 3. DASHBOARD ACTIVITY FEED (Real-time Tenant Event Feed)
// ------------------------------------------------------------------------------
export const dashboardActivityFeed = pgTable(
  "dashboard_activity_feed",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    activityType: dashboardActivityTypeEnum("activity_type").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    severity: varchar("severity", { length: 32 }).notNull().default("INFO"), // INFO, SUCCESS, WARNING, CRITICAL
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_dashboard_activity_theatre_date").on(table.theatreId, table.createdAt),
  ]
);

// ------------------------------------------------------------------------------
// Relational Mappings
// ------------------------------------------------------------------------------
export const theatreDashboardMetricsRelations = relations(theatreDashboardMetrics, ({ one }) => ({
  theatre: one(theatres, {
    fields: [theatreDashboardMetrics.theatreId],
    references: [theatres.id],
  }),
}));

export const userDashboardPreferencesRelations = relations(userDashboardPreferences, ({ one }) => ({
  theatre: one(theatres, {
    fields: [userDashboardPreferences.theatreId],
    references: [theatres.id],
  }),
}));

export const dashboardActivityFeedRelations = relations(dashboardActivityFeed, ({ one }) => ({
  theatre: one(theatres, {
    fields: [dashboardActivityFeed.theatreId],
    references: [theatres.id],
  }),
}));
