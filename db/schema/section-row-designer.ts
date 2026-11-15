import {
  pgTable,
  varchar,
  integer,
  timestamp,
  text,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { theatres } from "./theatres";
import { layoutVersions } from "./hall-designer";
import {
  SectionGeometry,
  RowGeometry,
  RowConfiguration,
} from "@/types/section-row-designer.types";
import { SeatDefinition } from "@/types/hall-designer.types";

/**
 * ==============================================================================
 * CineSphere OS — Section & Row Designer Database Schema (Phase 4 – Parts 3 & 4)
 * ==============================================================================
 * 1. hallSections: Independent structural section layers within a Layout Version.
 *    Supports color, capacity, geometry (Rectangle, Curved, Arc, Irregular),
 *    display ordering, and visibility.
 * 2. hallRows: Reusable rows belonging strictly to Sections (never directly to Hall).
 *    Supports customizable numbering (Alphabetical, Numeric, Roman, Reverse),
 *    spacing, geometry (Straight, Curved, Angled), and accessibility presets.
 * ==============================================================================
 */

// 1. Hall Sections Table (Part 3)
export const designerHallSections = pgTable(
  "designer_hall_sections",
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
    displayName: varchar("display_name", { length: 150 }).notNull(),
    internalCode: varchar("internal_code", { length: 50 }).notNull(),
    color: varchar("color", { length: 30 }).notNull().default("#38BDF8"),
    seatCategory: varchar("seat_category", { length: 50 }).notNull().default("Standard"),
    capacity: integer("capacity").notNull().default(0),
    priority: integer("priority").notNull().default(1),
    displayOrder: integer("display_order").notNull().default(1),
    rotation: integer("rotation").notNull().default(0),
    positionX: integer("position_x").notNull().default(0),
    positionY: integer("position_y").notNull().default(0),
    visibility: varchar("visibility", { length: 20 }).notNull().default("VISIBLE"),
    geometry: jsonb("geometry").$type<SectionGeometry>().notNull(),
    labelPosition: varchar("label_position", { length: 20 }).notNull().default("TOP"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("designer_hall_sections_version_code_idx").on(
      table.layoutVersionId,
      table.internalCode
    ),
    index("designer_hall_sections_version_idx").on(table.layoutVersionId),
    index("designer_hall_sections_theatre_idx").on(table.theatreId),
    index("designer_hall_sections_display_order_idx").on(table.layoutVersionId, table.displayOrder),
  ]
);

// 2. Hall Rows Table (Part 4)
export const hallRows = pgTable(
  "hall_rows",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sectionId: varchar("section_id", { length: 36 })
      .notNull()
      .references(() => designerHallSections.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    rowName: varchar("row_name", { length: 30 }).notNull(),
    displayName: varchar("display_name", { length: 100 }).notNull(),
    sequence: integer("sequence").notNull().default(1),
    seatCount: integer("seat_count").notNull().default(0),
    spacing: integer("spacing").notNull().default(40),
    rotation: integer("rotation").notNull().default(0),
    visibility: varchar("visibility", { length: 20 }).notNull().default("VISIBLE"),
    accessibility: varchar("accessibility", { length: 30 }).notNull().default("STANDARD"),
    geometry: jsonb("geometry").$type<RowGeometry>().notNull(),
    configuration: jsonb("configuration").$type<RowConfiguration>().notNull(),
    categoryOverride: varchar("category_override", { length: 50 }),
    seats: jsonb("seats").$type<SeatDefinition[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("hall_rows_section_row_name_idx").on(table.sectionId, table.rowName),
    index("hall_rows_section_idx").on(table.sectionId),
    index("hall_rows_theatre_idx").on(table.theatreId),
    index("hall_rows_sequence_idx").on(table.sectionId, table.sequence),
  ]
);

export const designerHallRows = hallRows;

