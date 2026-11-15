import {
  pgTable,
  varchar,
  boolean,
  integer,
  timestamp,
  text,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { theatres } from "./theatres";
import { halls } from "./halls";
import {
  HallSectionDefinition,
  SeatDefinition,
  LayoutWalkway,
  LayoutEmergencyExit,
  LayoutMetadata,
} from "@/types/hall-designer.types";

/**
 * ==============================================================================
 * CineSphere OS — Hall Designer Database Schema (Phase 4 – Parts 1 & 2)
 * ==============================================================================
 * 1. layoutDefinitions: Master source of truth for hall layouts. Decouples live
 *    in-flight shows from draft visual designer edits.
 * 2. layoutVersions: Immutable snapshots of hall layout versions (Draft, Published, Archived).
 * 3. canvasPreferences: Per-theatre customized canvas, grid, snapping, and unit preferences.
 * ==============================================================================
 */

// 1. Layout Definitions (Source of Truth)
export const layoutDefinitions = pgTable(
  "layout_definitions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    hallId: varchar("hall_id", { length: 36 })
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),
    currentPublishedVersionId: varchar("current_published_version_id", { length: 36 }),
    activeDraftVersionId: varchar("active_draft_version_id", { length: 36 }),
    status: varchar("status", { length: 30 }).notNull().default("DRAFT"), // "DRAFT" | "PUBLISHED" | "ARCHIVED" | "INACTIVE"
    totalVersionsCount: integer("total_versions_count").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("layout_definitions_theatre_hall_name_idx").on(
      table.theatreId,
      table.hallId,
      table.name
    ),
    index("layout_definitions_theatre_id_idx").on(table.theatreId),
    index("layout_definitions_hall_id_idx").on(table.hallId),
    index("layout_definitions_status_idx").on(table.status),
  ]
);

// 2. Layout Versions (Immutable Layout Snapshots)
export const layoutVersions = pgTable(
  "layout_versions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    layoutDefinitionId: varchar("layout_definition_id", { length: 36 })
      .notNull()
      .references(() => layoutDefinitions.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    name: varchar("name", { length: 150 }).notNull(),
    status: varchar("status", { length: 30 }).notNull().default("DRAFT"), // "DRAFT" | "PUBLISHED" | "ARCHIVED"
    versionNotes: text("version_notes"),
    sections: jsonb("sections").$type<HallSectionDefinition[]>().notNull().default([]),
    seats: jsonb("seats").$type<SeatDefinition[]>().notNull().default([]),
    walkways: jsonb("walkways").$type<LayoutWalkway[]>().notNull().default([]),
    vipZones: jsonb("vip_zones").$type<string[]>().notNull().default([]),
    wheelchairAreas: jsonb("wheelchair_areas").$type<string[]>().notNull().default([]),
    emergencyExits: jsonb("emergency_exits").$type<LayoutEmergencyExit[]>().notNull().default([]),
    gridConfig: jsonb("grid_config")
      .$type<{ rows: number; columns: number; totalCapacity: number }>()
      .notNull()
      .default({ rows: 10, columns: 12, totalCapacity: 120 }),
    metadata: jsonb("metadata")
      .$type<LayoutMetadata>()
      .notNull()
      .default({
        createdBy: "system",
        updatedBy: "system",
        seatCountSummary: { standard: 0, vip: 0, recliner: 0, sofa: 0, wheelchair: 0, total: 0 },
      }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("layout_versions_definition_num_idx").on(
      table.layoutDefinitionId,
      table.versionNumber
    ),
    index("layout_versions_theatre_id_idx").on(table.theatreId),
    index("layout_versions_definition_id_idx").on(table.layoutDefinitionId),
    index("layout_versions_status_idx").on(table.status),
  ]
);

// 3. Canvas Preferences (Per-Theatre Canvas Customization)
export const canvasPreferences = pgTable(
  "canvas_preferences",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .unique()
      .references(() => theatres.id, { onDelete: "cascade" }),
    gridSize: integer("grid_size").notNull().default(20),
    gridDensity: varchar("grid_density", { length: 20 }).notNull().default("MEDIUM"), // "SMALL" | "MEDIUM" | "LARGE"
    gridVisible: boolean("grid_visible").notNull().default(true),
    gridColor: varchar("grid_color", { length: 30 }).notNull().default("#2A3445"),
    gridOpacity: integer("grid_opacity").notNull().default(50),
    snapEnabled: boolean("snap_enabled").notNull().default(true),
    snapStrength: integer("snap_strength").notNull().default(8),
    defaultZoom: integer("default_zoom").notNull().default(100),
    measurementUnit: varchar("measurement_unit", { length: 10 }).notNull().default("PX"), // "PX" | "CM" | "FT" | "M"
    canvasWidth: integer("canvas_width").notNull().default(2400),
    canvasHeight: integer("canvas_height").notNull().default(1800),
    backgroundColor: varchar("background_color", { length: 30 }).notNull().default("#070B12"),
    showMiniMap: boolean("show_mini_map").notNull().default(true),
    showSmartGuides: boolean("show_smart_guides").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("canvas_preferences_theatre_id_idx").on(table.theatreId),
  ]
);
