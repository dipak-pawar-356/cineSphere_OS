import {
  pgTable,
  varchar,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { hallStatusEnum, seatTypeEnum } from "./enums";
import { theatres } from "./theatres";

/**
 * ==============================================================================
 * CineSphere OS - Halls & Reusable CAD Seating Engine Schema
 * Reusable Hall Layouts, Dynamic Sections, and Generated Seat Templates
 * ==============================================================================
 */

export const halls = pgTable(
  "halls",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    screenNumber: integer("screen_number").notNull(),
    capacity: integer("capacity").notNull().default(0),
    projection: varchar("projection", { length: 100 }).notNull().default("Barco 4K Laser"),
    sound: varchar("sound", { length: 100 }).notNull().default("Dolby Atmos 64-Channel"),
    screenType: varchar("screen_type", { length: 50 }).notNull().default("IMAX Laser"),
    aspectRatio: varchar("aspect_ratio", { length: 20 }).default("1.90:1"),
    status: hallStatusEnum("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("halls_theatre_screen_num_idx").on(table.theatreId, table.screenNumber),
    index("halls_theatre_id_idx").on(table.theatreId),
    index("halls_status_idx").on(table.status),
  ]
);

export const hallLayouts = pgTable(
  "hall_layouts",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    hallId: varchar("hall_id", { length: 36 })
      .notNull()
      .unique()
      .references(() => halls.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull().default("Default Reusable Layout"),
    rows: integer("rows").notNull(),
    columns: integer("columns").notNull(),
    walkways: jsonb("walkways").$type<{
      afterRow?: string;
      afterColumn?: number;
      label?: string;
    }[]>().default([]),
    vipZones: jsonb("vip_zones").$type<string[]>().default([]),
    wheelchairAreas: jsonb("wheelchair_areas").$type<string[]>().default([]),
    emergencyExits: jsonb("emergency_exits").$type<{
      position: string;
      label?: string;
    }[]>().default([]),
    future3dConfig: jsonb("future_3d_config").$type<{
      cameraFov: number;
      screenCurvature: number;
      screenTiltDegrees: number;
      eyeLevelOffsetMeters: number;
      cameraPosition?: { x: number; y: number; z: number };
    }>().default({
      cameraFov: 60,
      screenCurvature: 0.15,
      screenTiltDegrees: 5,
      eyeLevelOffsetMeters: 1.2,
    }),
    isDefault: boolean("is_default").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("hall_layouts_hall_id_idx").on(table.hallId),
    index("hall_layouts_theatre_id_idx").on(table.theatreId),
  ]
);

export const hallSections = pgTable(
  "hall_sections",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    layoutId: varchar("layout_id", { length: 36 })
      .notNull()
      .references(() => hallLayouts.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(), // e.g. "Section A", "VIP Recliner", "Executive Gold"
    displayOrder: integer("display_order").notNull().default(0),
    seatCount: integer("seat_count").notNull(),
    seatType: seatTypeEnum("seat_type").notNull().default("STANDARD"),
    displayColor: varchar("display_color", { length: 30 }).notNull().default("#3B82F6"),
    categoryIcon: varchar("category_icon", { length: 50 }).default("Sparkles"),
    rowLabels: jsonb("row_labels").$type<string[]>().default([]),
    seatsPerRow: integer("seats_per_row").notNull().default(10),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("hall_sections_layout_name_idx").on(table.layoutId, table.name),
    index("hall_sections_layout_id_idx").on(table.layoutId),
    index("hall_sections_theatre_id_idx").on(table.theatreId),
    index("hall_sections_display_order_idx").on(table.displayOrder),
  ]
);

export const seatTemplates = pgTable(
  "seat_templates",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    layoutId: varchar("layout_id", { length: 36 })
      .notNull()
      .references(() => hallLayouts.id, { onDelete: "cascade" }),
    sectionId: varchar("section_id", { length: 36 })
      .notNull()
      .references(() => hallSections.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    seatNumber: varchar("seat_number", { length: 20 }).notNull(), // e.g. "A1", "A20", "VIP-1"
    row: varchar("row", { length: 10 }).notNull(),               // e.g. "A", "B"
    column: integer("column").notNull(),                         // e.g. 1, 20
    seatType: seatTypeEnum("seat_type").notNull().default("STANDARD"),
    coordinates: jsonb("coordinates").$type<{
      x: number;
      y: number;
      z?: number;
    }>(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("seat_templates_layout_seat_num_idx").on(table.layoutId, table.seatNumber),
    index("seat_templates_layout_id_idx").on(table.layoutId),
    index("seat_templates_section_id_idx").on(table.sectionId),
    index("seat_templates_theatre_id_idx").on(table.theatreId),
    index("seat_templates_row_idx").on(table.row),
  ]
);

