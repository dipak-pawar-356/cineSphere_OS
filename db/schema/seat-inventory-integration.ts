import {
  pgTable,
  varchar,
  boolean,
  integer,
  decimal,
  timestamp,
  text,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { theatres } from "./theatres";
import { halls } from "./halls";
import { shows } from "./shows";
import { layoutDefinitions, layoutVersions } from "./hall-designer";
import {
  InventoryItemStatus,
  InventoryGenerationMode,
  InventoryValidationMode,
} from "@/types/seat-inventory-integration.types";

/**
 * ==============================================================================
 * CineSphere OS — Seat Inventory Integration Schema (Phase 4 – Part 13)
 * ==============================================================================
 * Decouples show operational seat inventory from physical CAD hall layouts.
 * Every show receives an immutable seat inventory snapshot generated from the
 * active published layout version.
 * ==============================================================================
 */

// 1. Seat Inventory Headers (Blueprint Anchor per Show)
export const seatInventories = pgTable(
  "seat_inventories",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    showId: varchar("show_id", { length: 36 })
      .notNull()
      .unique()
      .references(() => shows.id, { onDelete: "cascade" }),
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
    totalSeats: integer("total_seats").notNull().default(0),
    availableSeats: integer("available_seats").notNull().default(0),
    bookedSeats: integer("booked_seats").notNull().default(0),
    blockedSeats: integer("blocked_seats").notNull().default(0),
    maintenanceSeats: integer("maintenance_seats").notNull().default(0),
    status: varchar("status", { length: 30 })
      .$type<"ACTIVE" | "SYNCHRONIZED" | "LOCKED" | "ARCHIVED">()
      .notNull()
      .default("ACTIVE"),
    generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
    generatedBy: varchar("generated_by", { length: 100 }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("seat_inventories_show_idx").on(table.showId),
    index("seat_inventories_theatre_idx").on(table.theatreId),
    index("seat_inventories_hall_idx").on(table.hallId),
    index("seat_inventories_version_idx").on(table.layoutVersionId),
  ]
);

// 2. Seat Inventory Items (Individual Seat Operations & Booking Snapshot)
export const seatInventoryItems = pgTable(
  "seat_inventory_items",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    inventoryId: varchar("inventory_id", { length: 36 })
      .notNull()
      .references(() => seatInventories.id, { onDelete: "cascade" }),
    showId: varchar("show_id", { length: 36 })
      .notNull()
      .references(() => shows.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    hallId: varchar("hall_id", { length: 36 })
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    internalSeatId: varchar("internal_seat_id", { length: 64 }).notNull(), // Deterministic hash
    displaySeatNumber: varchar("display_seat_number", { length: 20 }).notNull(), // e.g. "A12"
    seatCategoryId: varchar("seat_category_id", { length: 36 }).notNull(),
    seatCategoryName: varchar("seat_category_name", { length: 50 }).notNull(),
    sectionId: varchar("section_id", { length: 36 }).notNull(),
    sectionName: varchar("section_name", { length: 100 }).notNull(),
    rowCode: varchar("row_code", { length: 10 }).notNull(),
    columnIndex: integer("column_index").notNull(),
    x: integer("x").notNull(),
    y: integer("y").notNull(),
    status: varchar("status", { length: 30 })
      .$type<InventoryItemStatus>()
      .notNull()
      .default("AVAILABLE"),
    isWheelchair: boolean("is_wheelchair").notNull().default(false),
    isCompanion: boolean("is_companion").notNull().default(false),
    isRecliner: boolean("is_recliner").notNull().default(false),
    basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull().default("200.00"),
    calculatedPrice: decimal("calculated_price", { precision: 10, scale: 2 }).notNull().default("200.00"),
    convenienceFee: decimal("convenience_fee", { precision: 10, scale: 2 }).notNull().default("35.00"),
    gstPercent: decimal("gst_percent", { precision: 5, scale: 2 }).notNull().default("18.00"),
    currency: varchar("currency", { length: 10 }).notNull().default("INR"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    lockedBy: varchar("locked_by", { length: 100 }),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    bookingId: varchar("booking_id", { length: 36 }),
    ticketId: varchar("ticket_id", { length: 36 }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("seat_inv_items_show_seat_idx").on(table.showId, table.displaySeatNumber),
    uniqueIndex("seat_inv_items_show_internal_idx").on(table.showId, table.internalSeatId),
    index("seat_inv_items_inventory_idx").on(table.inventoryId),
    index("seat_inv_items_theatre_idx").on(table.theatreId),
    index("seat_inv_items_status_idx").on(table.status),
    index("seat_inv_items_section_idx").on(table.sectionId),
    index("seat_inv_items_lock_idx").on(table.lockedUntil),
  ]
);

// 3. Inventory Mappings (Traceability between Show, Hall & Layout Version)
export const inventoryMappings = pgTable(
  "inventory_mappings",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    showId: varchar("show_id", { length: 36 })
      .notNull()
      .references(() => shows.id, { onDelete: "cascade" }),
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
    inventoryId: varchar("inventory_id", { length: 36 })
      .notNull()
      .references(() => seatInventories.id, { onDelete: "cascade" }),
    mappingStatus: varchar("mapping_status", { length: 30 }).notNull().default("BOUND"),
    isLocked: boolean("is_locked").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("inventory_mappings_show_idx").on(table.showId),
    index("inventory_mappings_theatre_idx").on(table.theatreId),
    index("inventory_mappings_version_idx").on(table.layoutVersionId),
  ]
);

// 4. Inventory Snapshots (Immutable Serialized State for Historical Auditing)
export const inventorySnapshots = pgTable(
  "inventory_snapshots",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    inventoryId: varchar("inventory_id", { length: 36 })
      .notNull()
      .references(() => seatInventories.id, { onDelete: "cascade" }),
    showId: varchar("show_id", { length: 36 })
      .notNull()
      .references(() => shows.id, { onDelete: "cascade" }),
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
    totalSeats: integer("total_seats").notNull(),
    grossValue: decimal("gross_value", { precision: 12, scale: 2 }).notNull().default("0.00"),
    snapshotPayload: jsonb("snapshot_payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    createdBy: varchar("created_by", { length: 100 }).notNull(),
  },
  (table) => [
    index("inventory_snapshots_show_idx").on(table.showId),
    index("inventory_snapshots_theatre_idx").on(table.theatreId),
    index("inventory_snapshots_inventory_idx").on(table.inventoryId),
  ]
);

// 5. Inventory Configurations (Per-Theatre Governance)
export const inventoryConfigurations = pgTable(
  "inventory_configurations",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .unique()
      .references(() => theatres.id, { onDelete: "cascade" }),
    generationMode: varchar("generation_mode", { length: 30 })
      .$type<InventoryGenerationMode>()
      .notNull()
      .default("AUTOMATIC"),
    maintenanceSeatsEnabled: boolean("maintenance_seats_enabled").notNull().default(true),
    validationMode: varchar("validation_mode", { length: 30 })
      .$type<InventoryValidationMode>()
      .notNull()
      .default("STRICT"),
    premiumSeatMetadataEnabled: boolean("premium_seat_metadata_enabled").notNull().default(true),
    defaultLockDurationSeconds: integer("default_lock_duration_seconds").notNull().default(600),
    allowRegenerationWithZeroBookings: boolean("allow_regeneration_with_zero_bookings").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("inventory_config_theatre_idx").on(table.theatreId),
  ]
);
