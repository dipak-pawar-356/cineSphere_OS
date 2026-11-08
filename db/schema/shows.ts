import {
  pgTable,
  varchar,
  boolean,
  integer,
  decimal,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  showStatusEnum,
  movieFormatEnum,
  seatTypeEnum,
  seatStatusEnum,
} from "./enums";
import { movies } from "./movies";
import { theatres } from "./theatres";
import { halls, hallSections, seatTemplates } from "./halls";

/**
 * ==============================================================================
 * CineSphere OS - Show Scheduling & Seat Inventory Engine Schema
 * The Show is the core business entity linking Movie, Theatre, Hall, Pricing & Seats
 * ==============================================================================
 */

export const shows = pgTable(
  "shows",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    movieId: varchar("movie_id", { length: 36 })
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    hallId: varchar("hall_id", { length: 36 })
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    showDate: varchar("show_date", { length: 20 }).notNull(), // ISO YYYY-MM-DD
    startTime: varchar("start_time", { length: 20 }).notNull(), // e.g. "10:30 AM" or "10:30"
    endTime: varchar("end_time", { length: 20 }).notNull(),     // e.g. "01:30 PM" or "13:30"
    language: varchar("language", { length: 50 }).notNull().default("Hindi"),
    format: movieFormatEnum("format").notNull().default("STANDARD"),
    status: showStatusEnum("status").notNull().default("UPCOMING"),
    basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull().default("200.00"),
    totalSeats: integer("total_seats").notNull().default(0),
    seatsBooked: integer("seats_booked").notNull().default(0),
    convenienceFeePerSeat: decimal("convenience_fee_per_seat", { precision: 10, scale: 2 })
      .notNull()
      .default("35.00"),
    gstPercent: decimal("gst_percent", { precision: 5, scale: 2 })
      .notNull()
      .default("18.00"),
    slotType: varchar("slot_type", { length: 50 }).default("Morning"), // Morning, Matinee, Evening, Night
    dayType: varchar("day_type", { length: 50 }).default("Weekday"),   // Weekday, Weekend, Holiday
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("shows_theatre_date_idx").on(table.theatreId, table.showDate),
    index("shows_movie_id_idx").on(table.movieId),
    index("shows_hall_id_idx").on(table.hallId),
    index("shows_status_idx").on(table.status),
    index("shows_show_date_idx").on(table.showDate),
  ]
);

export const showPricing = pgTable(
  "show_pricing",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    showId: varchar("show_id", { length: 36 })
      .notNull()
      .references(() => shows.id, { onDelete: "cascade" }),
    sectionId: varchar("section_id", { length: 36 })
      .notNull()
      .references(() => hallSections.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Section price for this show (e.g. 250.00)
    convenienceFee: decimal("convenience_fee", { precision: 10, scale: 2 }).notNull().default("35.00"),
    gstPercent: decimal("gst_percent", { precision: 5, scale: 2 }).notNull().default("18.00"),
    currency: varchar("currency", { length: 10 }).notNull().default("INR"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("show_pricing_show_section_idx").on(table.showId, table.sectionId),
    index("show_pricing_show_id_idx").on(table.showId),
    index("show_pricing_section_id_idx").on(table.sectionId),
    index("show_pricing_theatre_id_idx").on(table.theatreId),
  ]
);

export const seatInventory = pgTable(
  "seat_inventory",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    showId: varchar("show_id", { length: 36 })
      .notNull()
      .references(() => shows.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    seatTemplateId: varchar("seat_template_id", { length: 36 })
      .notNull()
      .references(() => seatTemplates.id, { onDelete: "cascade" }),
    sectionId: varchar("section_id", { length: 36 })
      .notNull()
      .references(() => hallSections.id, { onDelete: "cascade" }),
    seatNumber: varchar("seat_number", { length: 20 }).notNull(), // e.g. "A1", "A20", "VIP-1"
    row: varchar("row", { length: 10 }).notNull(),
    column: integer("column").notNull(),
    seatType: seatTypeEnum("seat_type").notNull().default("STANDARD"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    status: seatStatusEnum("status").notNull().default("AVAILABLE"),
    isWheelchair: boolean("is_wheelchair").notNull().default(false),
    isRecliner: boolean("is_recliner").notNull().default(false),
    isCoupleSeat: boolean("is_couple_seat").notNull().default(false),
    dynamicPricingMultiplier: decimal("dynamic_pricing_multiplier", { precision: 4, scale: 2 })
      .notNull()
      .default("1.00"),
    lockedBy: varchar("locked_by", { length: 128 }), // Customer session / token holding concurrent lock
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("seat_inventory_show_seat_idx").on(table.showId, table.seatNumber),
    index("seat_inventory_show_id_idx").on(table.showId),
    index("seat_inventory_theatre_id_idx").on(table.theatreId),
    index("seat_inventory_status_idx").on(table.status),
    index("seat_inventory_section_id_idx").on(table.sectionId),
    index("seat_inventory_locked_until_idx").on(table.lockedUntil),
  ]
);

