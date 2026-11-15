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
import { designerHallSections, hallRows } from "./section-row-designer";

/**
 * ==============================================================================
 * CineSphere OS — Seat Generator & Category Database Schema
 * Phase 4 – Part 5 (Seat Generator) & Part 6 (Seat Categories)
 * ==============================================================================
 * 1. Seat Templates: Immutable individual seat specifications belonging to a row.
 * 2. Seat Coordinates: Physical spatial placement (x, y, rotation, width, height, curvature).
 * 3. Seat Metadata: Audit details, display labels, sightline quality, sound zone.
 * 4. Seat Accessibility: Wheelchair bays, companion pairings, accessible route tags.
 * 5. Seat Category Registry: Decoupled classification definitions (never stores pricing).
 * 6. Seat Category Rules & Metadata: Tier ordering, booking limits, amenity tags.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Part 6: Seat Category Registry Tables
// ------------------------------------------------------------------------------

export const seatCategoryRegistry = pgTable(
  "seat_category_registry",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    displayName: varchar("display_name", { length: 150 }).notNull(),
    description: text("description"),
    color: varchar("color", { length: 30 }).notNull().default("#38BDF8"),
    icon: varchar("icon", { length: 50 }),
    priority: integer("priority").notNull().default(1),
    visibility: varchar("visibility", { length: 20 }).notNull().default("VISIBLE"),
    accessibility: varchar("accessibility", { length: 30 }).notNull().default("STANDARD"),
    isPremium: boolean("is_premium").default(false).notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("seat_cat_reg_theatre_code_idx").on(table.theatreId, table.code),
    index("seat_cat_reg_theatre_idx").on(table.theatreId),
    index("seat_cat_reg_priority_idx").on(table.priority),
    index("seat_cat_reg_status_idx").on(table.status),
  ]
);

export const seatCategoryMetadata = pgTable(
  "seat_category_metadata",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    categoryId: varchar("category_id", { length: 36 })
      .notNull()
      .references(() => seatCategoryRegistry.id, { onDelete: "cascade" }),
    tags: jsonb("tags").$type<string[]>().default([]),
    amenities: jsonb("amenities").$type<string[]>().default([]),
    notes: text("notes"),
    customAttributes: jsonb("custom_attributes").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("seat_cat_meta_category_idx").on(table.categoryId),
  ]
);

export const seatCategoryRules = pgTable(
  "seat_category_rules",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    categoryId: varchar("category_id", { length: 36 })
      .notNull()
      .references(() => seatCategoryRegistry.id, { onDelete: "cascade" }),
    displayOrder: integer("display_order").notNull().default(1),
    allowLoyaltyDiscount: boolean("allow_loyalty_discount").default(true).notNull(),
    maxPerBooking: integer("max_per_booking").notNull().default(10),
    requiresCompanion: boolean("requires_companion").default(false).notNull(),
    minBookingPartySize: integer("min_booking_party_size").default(1),
    customRules: jsonb("custom_rules").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("seat_cat_rules_category_idx").on(table.categoryId),
  ]
);

// ------------------------------------------------------------------------------
// 2. Part 5: Seat Template & Sub-Entity Tables
// ------------------------------------------------------------------------------

export const designerSeatTemplates = pgTable(
  "designer_seat_templates",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    layoutVersionId: varchar("layout_version_id", { length: 36 })
      .notNull()
      .references(() => layoutVersions.id, { onDelete: "cascade" }),
    sectionId: varchar("section_id", { length: 36 })
      .notNull()
      .references(() => designerHallSections.id, { onDelete: "cascade" }),
    rowId: varchar("row_id", { length: 36 })
      .notNull()
      .references(() => hallRows.id, { onDelete: "cascade" }),
    seatNumber: varchar("seat_number", { length: 50 }).notNull(),
    columnNumber: integer("column_number").notNull(),
    categoryCode: varchar("category_code", { length: 50 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("seat_templates_row_number_idx").on(table.rowId, table.seatNumber),
    uniqueIndex("seat_templates_row_col_idx").on(table.rowId, table.columnNumber),
    index("seat_templates_theatre_idx").on(table.theatreId),
    index("seat_templates_version_idx").on(table.layoutVersionId),
    index("seat_templates_section_idx").on(table.sectionId),
    index("seat_templates_row_idx").on(table.rowId),
    index("seat_templates_category_idx").on(table.categoryCode),
  ]
);

export const seatCoordinates = pgTable(
  "seat_coordinates",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    seatTemplateId: varchar("seat_template_id", { length: 36 })
      .notNull()
      .references(() => designerSeatTemplates.id, { onDelete: "cascade" }),
    x: integer("x").notNull(),
    y: integer("y").notNull(),
    rotation: integer("rotation").notNull().default(0),
    width: integer("width").notNull().default(40),
    height: integer("height").notNull().default(40),
    spacing: integer("spacing").notNull().default(10),
    offsetX: integer("offset_x").default(0),
    offsetY: integer("offset_y").default(0),
    curvedPosition: jsonb("curved_position").$type<{
      radius: number;
      angle: number;
      sagitta: number;
    }>(),
    isMirrored: boolean("is_mirrored").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("seat_coord_template_idx").on(table.seatTemplateId),
    index("seat_coord_xy_idx").on(table.x, table.y),
  ]
);

export const seatMetadata = pgTable(
  "seat_metadata",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    seatTemplateId: varchar("seat_template_id", { length: 36 })
      .notNull()
      .references(() => designerSeatTemplates.id, { onDelete: "cascade" }),
    seatName: varchar("seat_name", { length: 50 }).notNull(),
    displayName: varchar("display_name", { length: 150 }).notNull(),
    seatCode: varchar("seat_code", { length: 100 }).notNull(),
    rowId: varchar("row_id", { length: 36 }).notNull(),
    rowName: varchar("row_name", { length: 50 }).notNull(),
    sectionId: varchar("section_id", { length: 36 }).notNull(),
    sectionName: varchar("section_name", { length: 100 }).notNull(),
    categoryCode: varchar("category_code", { length: 50 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("ACTIVE"),
    sightlineQuality: varchar("sightline_quality", { length: 30 }).default("EXCELLENT"),
    legroomRating: varchar("legroom_rating", { length: 50 }),
    soundZone: varchar("sound_zone", { length: 100 }),
    customAttributes: jsonb("custom_attributes").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("seat_meta_template_idx").on(table.seatTemplateId),
    index("seat_meta_code_idx").on(table.seatCode),
  ]
);

export const seatAccessibility = pgTable(
  "seat_accessibility",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    seatTemplateId: varchar("seat_template_id", { length: 36 })
      .notNull()
      .references(() => designerSeatTemplates.id, { onDelete: "cascade" }),
    accessibilityType: varchar("accessibility_type", { length: 30 }).notNull().default("STANDARD"),
    isWheelchairAccessible: boolean("is_wheelchair_accessible").default(false).notNull(),
    hasCompanionSeat: boolean("has_companion_seat").default(false).notNull(),
    companionSeatTemplateId: varchar("companion_seat_template_id", { length: 36 }),
    hasAccessibleRoute: boolean("has_accessible_route").default(false).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("seat_access_template_idx").on(table.seatTemplateId),
    index("seat_access_type_idx").on(table.accessibilityType),
  ]
);

// ------------------------------------------------------------------------------
// 3. Literal Entity Aliases Conforming to DDD Architecture Spec
// ------------------------------------------------------------------------------

export const SeatTemplate = designerSeatTemplates;
export const seatTemplateTable = designerSeatTemplates;
export const SeatCoordinates = seatCoordinates;
export const SeatMetadata = seatMetadata;
export const SeatAccessibility = seatAccessibility;

export const SeatCategory = seatCategoryRegistry;
export const SeatCategoryMetadata = seatCategoryMetadata;
export const SeatCategoryRules = seatCategoryRules;
