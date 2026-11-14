import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { theatres } from "./theatres";

/**
 * ==============================================================================
 * CineSphere OS — Reports & Analytics Layer Schema (Phase 3 – Part 15)
 * ==============================================================================
 * Dedicated persistence schema for historical business intelligence, aggregated
 * analytical read models, metric registries, and configurable report definitions.
 * Separated from real-time operational dashboard tables.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. REPORT DEFINITIONS (Configurable Report Templates Metadata)
// ------------------------------------------------------------------------------
export const theatreReportDefinitions = pgTable(
  "theatre_report_definitions",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    category: varchar("category", { length: 64 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    supportedDimensions: jsonb("supported_dimensions").$type<string[]>().notNull(),
    metrics: jsonb("metrics").$type<string[]>().notNull(),
    defaultDatePreset: varchar("default_date_preset", { length: 32 }).notNull().default("THIS_MONTH"),
    requiredRole: jsonb("required_role").$type<string[]>().notNull(),
    exportFormats: jsonb("export_formats").$type<string[]>().notNull(),
    displayOrder: integer("display_order").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_theatre_report_defs_category").on(table.category),
  ]
);

// ------------------------------------------------------------------------------
// 2. CENTRALIZED METRIC REGISTRY (Single Source of Truth for Formulas & KPIs)
// ------------------------------------------------------------------------------
export const theatreMetricRegistry = pgTable(
  "theatre_metric_registry",
  {
    key: varchar("key", { length: 64 }).primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 64 }).notNull(),
    format: varchar("format", { length: 32 }).notNull(),
    formulaDescription: text("formula_description").notNull(),
    isKpi: boolean("is_kpi").notNull().default(true),
    benchmarkGoal: integer("benchmark_goal"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_theatre_metric_reg_category").on(table.category),
  ]
);

// ------------------------------------------------------------------------------
// 3. ANALYTICS AGGREGATES READ MODEL (Decoupled from Transactional Tables)
// ------------------------------------------------------------------------------
export const theatreAnalyticsAggregates = pgTable(
  "theatre_analytics_aggregates",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    dimension: varchar("dimension", { length: 64 }).notNull(), // e.g. "DAILY", "MOVIE", "HALL", "PAYMENT"
    dimensionKey: varchar("dimension_key", { length: 128 }).notNull(),
    aggregatePeriod: varchar("aggregate_period", { length: 32 }).notNull(),
    metricsPayload: jsonb("metrics_payload").notNull(),
    lastAggregatedAt: timestamp("last_aggregated_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_theatre_analytics_agg_unique").on(
      table.theatreId,
      table.dimension,
      table.dimensionKey,
      table.aggregatePeriod
    ),
    index("idx_theatre_analytics_agg_lookup").on(table.theatreId, table.dimension),
  ]
);

// ------------------------------------------------------------------------------
// 4. HISTORICAL REPORT SNAPSHOTS
// ------------------------------------------------------------------------------
export const theatreHistoricalReportSnapshots = pgTable(
  "theatre_historical_report_snapshots",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    definitionId: varchar("definition_id", { length: 128 }).notNull(),
    reportTitle: varchar("report_title", { length: 255 }).notNull(),
    category: varchar("category", { length: 64 }).notNull(),
    filterState: jsonb("filter_state").notNull(),
    summaryCards: jsonb("summary_cards").notNull(),
    chartSeries: jsonb("chart_series").notNull(),
    detailedTableData: jsonb("detailed_table_data").notNull(),
    generatedByUserId: varchar("generated_by_user_id", { length: 128 }).notNull(),
    generatedByRole: varchar("generated_by_role", { length: 64 }).notNull(),
    generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_theatre_report_snapshots_lookup").on(
      table.theatreId,
      table.category,
      table.generatedAt
    ),
  ]
);

// ------------------------------------------------------------------------------
// RELATIONS
// ------------------------------------------------------------------------------
export const theatreAnalyticsAggregatesRelations = relations(
  theatreAnalyticsAggregates,
  ({ one }) => ({
    theatre: one(theatres, {
      fields: [theatreAnalyticsAggregates.theatreId],
      references: [theatres.id],
    }),
  })
);

export const theatreHistoricalReportSnapshotsRelations = relations(
  theatreHistoricalReportSnapshots,
  ({ one }) => ({
    theatre: one(theatres, {
      fields: [theatreHistoricalReportSnapshots.theatreId],
      references: [theatres.id],
    }),
  })
);
