import {
  pgTable,
  varchar,
  integer,
  timestamp,
  text,
  jsonb,
  index,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";
import { theatres } from "./theatres";
import { layoutVersions } from "./hall-designer";
import type {
  StructuralObjectMetadata,
  StructuralObjectGeometry,
} from "@/types/structural-objects.types";

/**
 * ==============================================================================
 * CineSphere OS — Structural Objects Database Schema (Phase 4 – Part 7)
 * ==============================================================================
 * 1. Structural Objects: First-class layout entities representing physical infrastructure
 *    (Stage, Screen, Entrance, Exit, Emergency Exit, Walls, Stairs, Aisles, Pillars, etc.)
 * 2. Structural Object Types: Extensible registry for circuit-defined structural elements.
 * 3. Structural Object Metadata & Geometry: Relational specifications and collision bounds.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Structural Object Types Registry
// ------------------------------------------------------------------------------

export const structuralObjectTypes = pgTable(
  "structural_object_types",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 50 }),
    defaultWidth: integer("default_width").notNull().default(120),
    defaultHeight: integer("default_height").notNull().default(40),
    defaultColor: varchar("default_color", { length: 30 }).notNull().default("#64748B"),
    isCollisionObstacle: boolean("is_collision_obstacle").default(false).notNull(),
    isSystem: boolean("is_system").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("struct_obj_type_theatre_code_idx").on(table.theatreId, table.code),
    index("struct_obj_type_theatre_idx").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 2. Primary Structural Objects Table
// ------------------------------------------------------------------------------

export const structuralObjects = pgTable(
  "structural_objects",
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
    objectName: varchar("object_name", { length: 100 }).notNull(),
    displayName: varchar("display_name", { length: 150 }).notNull(),
    objectType: varchar("object_type", { length: 50 }).notNull(),
    internalCode: varchar("internal_code", { length: 50 }).notNull(),
    posX: integer("pos_x").notNull().default(0),
    posY: integer("pos_y").notNull().default(0),
    posZ: integer("pos_z").default(0),
    width: integer("width").notNull().default(100),
    height: integer("height").notNull().default(100),
    rotation: integer("rotation").notNull().default(0),
    layer: integer("layer").notNull().default(1),
    zIndex: integer("z_index").notNull().default(10),
    visibility: varchar("visibility", { length: 20 }).notNull().default("VISIBLE"),
    color: varchar("color", { length: 30 }).notNull().default("#64748B"),
    isLocked: boolean("is_locked").notNull().default(false),
    metadata: jsonb("metadata").$type<StructuralObjectMetadata>().default({
      isStatic: true,
      isCollisionObstacle: false,
      isReservedArea: false,
    }).notNull(),
    geometry: jsonb("geometry").$type<StructuralObjectGeometry>().default({
      shape: "RECTANGLE",
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("struct_obj_layout_version_idx").on(table.layoutVersionId),
    index("struct_obj_theatre_idx").on(table.theatreId),
    index("struct_obj_type_idx").on(table.objectType),
    uniqueIndex("struct_obj_version_code_idx").on(table.layoutVersionId, table.internalCode),
  ]
);

// ------------------------------------------------------------------------------
// 3. Structural Object Relational Metadata & Geometry (Auxiliary Tables)
// ------------------------------------------------------------------------------

export const structuralObjectMetadata = pgTable(
  "structural_object_metadata",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    structuralObjectId: varchar("structural_object_id", { length: 36 })
      .notNull()
      .references(() => structuralObjects.id, { onDelete: "cascade" }),
    isStatic: boolean("is_static").default(true).notNull(),
    isCollisionObstacle: boolean("is_collision_obstacle").default(false).notNull(),
    isReservedArea: boolean("is_reserved_area").default(false).notNull(),
    accessibilityJson: jsonb("accessibility_json"),
    safetyJson: jsonb("safety_json"),
    emergencyRouteJson: jsonb("emergency_route_json"),
    customAttributes: jsonb("custom_attributes"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("struct_obj_meta_obj_idx").on(table.structuralObjectId),
  ]
);

export const structuralObjectGeometry = pgTable(
  "structural_object_geometry",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    structuralObjectId: varchar("structural_object_id", { length: 36 })
      .notNull()
      .references(() => structuralObjects.id, { onDelete: "cascade" }),
    shape: varchar("shape", { length: 50 }).notNull().default("RECTANGLE"),
    pointsJson: jsonb("points_json"),
    strokeColor: varchar("stroke_color", { length: 30 }),
    fillColor: varchar("fill_color", { length: 30 }),
    strokeWidth: integer("stroke_width").default(2),
    cornerRadius: integer("corner_radius").default(0),
    arcPropertiesJson: jsonb("arc_properties_json"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("struct_obj_geom_obj_idx").on(table.structuralObjectId),
  ]
);

export type StructuralObjectEntity = typeof structuralObjects.$inferSelect;
export type InsertStructuralObjectEntity = typeof structuralObjects.$inferInsert;
