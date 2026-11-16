import {
  pgTable,
  varchar,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";
import { theatres } from "./theatres";
import { layoutVersions } from "./hall-designer";
import type {
  GeometryTransformParams,
  CurveControls,
  BoundingBox,
} from "@/types/geometry-layout.types";

/**
 * ==============================================================================
 * CineSphere OS — Geometry & Advanced Layout Database Schema (Phase 4 – Part 8)
 * ==============================================================================
 * 1. Geometry Definitions: Parametric geometry formulas (curves, arcs, polygons).
 * 2. Geometry Transforms: Immutable transformation pipeline history (undo/redo/audit).
 * 3. Geometry Settings: Theatre-specific geometry defaults and capability toggles.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Parametric Geometry Definitions
// ------------------------------------------------------------------------------

export const geometryDefinitions = pgTable(
  "geometry_definitions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    layoutVersionId: varchar("layout_version_id", { length: 36 })
      .notNull()
      .references(() => layoutVersions.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    shapeType: varchar("shape_type", { length: 50 }).notNull(), // RECTANGLE, ARC, CURVE, POLYGON, CUSTOM
    curveControls: jsonb("curve_controls").$type<CurveControls>(),
    pointsJson: jsonb("points_json").$type<Array<{ x: number; y: number }>>(),
    boundsJson: jsonb("bounds_json").$type<BoundingBox>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("geom_def_layout_version_idx").on(table.layoutVersionId),
    index("geom_def_theatre_idx").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 2. Geometry Transformation Pipeline (Audit Log & Replay)
// ------------------------------------------------------------------------------

export const geometryTransforms = pgTable(
  "geometry_transforms",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    layoutVersionId: varchar("layout_version_id", { length: 36 })
      .notNull()
      .references(() => layoutVersions.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    operationType: varchar("operation_type", { length: 50 }).notNull(), // MOVE, ROTATE, SCALE, MIRROR, etc.
    targetObjectIds: jsonb("target_object_ids").$type<string[]>().notNull(),
    parameters: jsonb("parameters").$type<GeometryTransformParams>().notNull(),
    appliedBy: varchar("applied_by", { length: 36 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("geom_trans_version_idx").on(table.layoutVersionId),
    index("geom_trans_theatre_idx").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 3. Theatre-Specific Geometry Preferences & Defaults
// ------------------------------------------------------------------------------

export const geometrySettings = pgTable(
  "geometry_settings",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    allowCurvedVIP: boolean("allow_curved_vip").default(true).notNull(),
    allowArcRows: boolean("allow_arc_rows").default(true).notNull(),
    allowPolygonSections: boolean("allow_polygon_sections").default(true).notNull(),
    enableOffset: boolean("enable_offset").default(true).notNull(),
    enableSymmetry: boolean("enable_symmetry").default(true).notNull(),
    defaultCurveRadius: integer("default_curve_radius").default(600).notNull(),
    defaultArcAngle: integer("default_arc_angle").default(45).notNull(),
    gridSnapTolerance: integer("grid_snap_tolerance").default(10).notNull(),
    angleSnapDegrees: integer("angle_snap_degrees").default(15).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("geom_settings_theatre_uidx").on(table.theatreId),
    index("geom_settings_theatre_idx").on(table.theatreId),
  ]
);

export type GeometrySettingsEntity = typeof geometrySettings.$inferSelect;
export type InsertGeometrySettingsEntity = typeof geometrySettings.$inferInsert;
export type GeometryDefinitionEntity = typeof geometryDefinitions.$inferSelect;
export type GeometryTransformEntity = typeof geometryTransforms.$inferSelect;
