import {
  pgTable,
  varchar,
  boolean,
  integer,
  decimal,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { theatres } from "./theatres";
import { halls } from "./halls";
import { shows } from "./shows";
import { layoutDefinitions, layoutVersions } from "./hall-designer";
import { seatInventories } from "./seat-inventory-integration";
import {
  CapacityAnalytics,
  SectionAnalyticsItem,
  SeatDistributionAnalytics,
  AccessibilityAnalytics,
  OccupancySimulationResult,
  RevenueSimulationResult,
  LayoutHealthScore,
  HistoricalTrendPointPlaceholder,
  HallAnalyticsReport,
} from "@/types/hall-analytics.types";

/**
 * ==============================================================================
 * CineSphere OS — Hall Analytics PostgreSQL Schema (Phase 4 – Part 15)
 * ==============================================================================
 * Analytics Projection Layer schema consuming immutable published layout
 * versions and seat inventory snapshots for historically accurate BI reporting.
 * ==============================================================================
 */

// 1. Analytics Projections (Immutable Projection Anchors)
export const analyticsProjections = pgTable(
  "analytics_projections",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    hallId: varchar("hall_id", { length: 36 })
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    layoutDefinitionId: varchar("layout_definition_id", { length: 36 })
      .notNull()
      .references(() => layoutDefinitions.id, { onDelete: "cascade" }),
    layoutVersionId: varchar("layout_version_id", { length: 36 })
      .notNull()
      .references(() => layoutVersions.id, { onDelete: "cascade" }),
    layoutVersionNumber: integer("layout_version_number").notNull(),
    sourceStatus: varchar("source_status", { length: 24 })
      .$type<"PUBLISHED" | "ARCHIVED">()
      .notNull()
      .default("PUBLISHED"),
    inventorySnapshotId: varchar("inventory_snapshot_id", { length: 64 }),
    inventoryId: varchar("inventory_id", { length: 36 }).references(() => seatInventories.id, {
      onDelete: "set null",
    }),
    showId: varchar("show_id", { length: 36 }).references(() => shows.id, {
      onDelete: "set null",
    }),
    seatCount: integer("seat_count").notNull().default(0),
    sectionCount: integer("section_count").notNull().default(0),
    structuralObjectCount: integer("structural_object_count").notNull().default(0),
    checksum: varchar("checksum", { length: 128 }).notNull(),
    projectedBy: varchar("projected_by", { length: 100 }).notNull(),
    projectedAt: timestamp("projected_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("analytics_projections_theatre_idx").on(table.theatreId),
    index("analytics_projections_hall_idx").on(table.hallId),
    index("analytics_projections_version_idx").on(table.layoutVersionId),
  ]
);

// 2. Hall Analytics (Precomputed Materialized Analytics Reports)
export const hallAnalytics = pgTable(
  "hall_analytics",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    projectionId: varchar("projection_id", { length: 64 })
      .notNull()
      .references(() => analyticsProjections.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    hallId: varchar("hall_id", { length: 36 })
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    layoutDefinitionId: varchar("layout_definition_id", { length: 36 })
      .notNull()
      .references(() => layoutDefinitions.id, { onDelete: "cascade" }),
    layoutVersionId: varchar("layout_version_id", { length: 36 })
      .notNull()
      .references(() => layoutVersions.id, { onDelete: "cascade" }),
    layoutVersionNumber: integer("layout_version_number").notNull(),
    inventorySnapshotId: varchar("inventory_snapshot_id", { length: 64 }),
    capacity: jsonb("capacity").$type<CapacityAnalytics>().notNull(),
    sections: jsonb("sections").$type<SectionAnalyticsItem[]>().notNull(),
    seatDistribution: jsonb("seat_distribution").$type<SeatDistributionAnalytics>().notNull(),
    accessibility: jsonb("accessibility").$type<AccessibilityAnalytics>().notNull(),
    occupancySimulation: jsonb("occupancy_simulation").$type<OccupancySimulationResult>().notNull(),
    revenueSimulation: jsonb("revenue_simulation").$type<RevenueSimulationResult>().notNull(),
    layoutHealth: jsonb("layout_health").$type<LayoutHealthScore>().notNull(),
    historicalTrendPlaceholder: jsonb("historical_trend_placeholder")
      .$type<HistoricalTrendPointPlaceholder[]>()
      .notNull()
      .default([]),
    isPrecomputed: boolean("is_precomputed").notNull().default(true),
    generatedBy: varchar("generated_by", { length: 100 }).notNull(),
    generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
    refreshedAt: timestamp("refreshed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("hall_analytics_theatre_idx").on(table.theatreId),
    index("hall_analytics_hall_idx").on(table.hallId),
    uniqueIndex("hall_analytics_version_uq").on(table.theatreId, table.layoutVersionId),
  ]
);

// 3. Analytics Snapshots (Append-Only Point-in-Time Historical Ledger)
export const analyticsSnapshots = pgTable(
  "analytics_snapshots",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    analyticsId: varchar("analytics_id", { length: 64 })
      .notNull()
      .references(() => hallAnalytics.id, { onDelete: "cascade" }),
    projectionId: varchar("projection_id", { length: 64 })
      .notNull()
      .references(() => analyticsProjections.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    hallId: varchar("hall_id", { length: 36 })
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    layoutVersionId: varchar("layout_version_id", { length: 36 })
      .notNull()
      .references(() => layoutVersions.id, { onDelete: "cascade" }),
    layoutVersionNumber: integer("layout_version_number").notNull(),
    totalSeats: integer("total_seats").notNull().default(0),
    overallDesignHealth: integer("overall_design_health").notNull().default(0),
    maxPotentialRevenue: decimal("max_potential_revenue", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    snapshotPayload: jsonb("snapshot_payload").$type<HallAnalyticsReport>().notNull(),
    createdBy: varchar("created_by", { length: 100 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("analytics_snapshots_theatre_idx").on(table.theatreId),
    index("analytics_snapshots_hall_idx").on(table.hallId),
    index("analytics_snapshots_version_idx").on(table.layoutVersionId),
  ]
);

// 4. Analytics Configurations (Independent Per-Theatre Analytics Governance)
export const analyticsConfigurations = pgTable(
  "analytics_configurations",
  {
    theatreId: varchar("theatre_id", { length: 36 })
      .primaryKey()
      .references(() => theatres.id, { onDelete: "cascade" }),
    revenueSimulationEnabled: boolean("revenue_simulation_enabled").notNull().default(true),
    accessibilityReportsEnabled: boolean("accessibility_reports_enabled").notNull().default(true),
    vipAnalyticsEnabled: boolean("vip_analytics_enabled").notNull().default(true),
    premiumLayoutMetricsEnabled: boolean("premium_layout_metrics_enabled").notNull().default(true),
    occupancySimulationEnabled: boolean("occupancy_simulation_enabled").notNull().default(true),
    customKpiDashboardEnabled: boolean("custom_kpi_dashboard_enabled").notNull().default(false),
    advancedCapacityAnalysisEnabled: boolean("advanced_capacity_analysis_enabled").notNull().default(false),
    autoRefreshOnPublish: boolean("auto_refresh_on_publish").notNull().default(true),
    cacheTtlSeconds: integer("cache_ttl_seconds").notNull().default(300),
    defaultCurrency: varchar("default_currency", { length: 10 }).notNull().default("INR"),
    defaultBaseShowPrice: decimal("default_base_show_price", { precision: 10, scale: 2 })
      .notNull()
      .default("250.00"),
    backgroundJobSchedulePlaceholder: varchar("background_job_schedule_placeholder", { length: 64 })
      .notNull()
      .default("0 */6 * * *"),
    customKpiKeys: jsonb("custom_kpi_keys").$type<string[]>().notNull().default([]),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  }
);
