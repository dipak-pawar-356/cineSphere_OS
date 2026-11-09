import {
  pgTable,
  varchar,
  text,
  boolean,
  decimal,
  timestamp,
  jsonb,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  bookingSessionStatusEnum,
  bookingStatusEnum,
  paymentStatusEnum,
  ticketStatusEnum,
  seatTypeEnum,
} from "./enums";
import { users } from "./users";
import { theatres } from "./theatres";
import { halls } from "./halls";
import { shows, seatInventory } from "./shows";

/**
 * ==============================================================================
 * CineSphere OS - Bookings, Temporary Sessions & Issued Tickets Schema
 * Customer reservations, multi-seat breakdown, and verified entry tickets
 * ==============================================================================
 */

/**
 * Ephemeral customer booking session holding temporary seat reservation locks.
 * Strictly decoupled from permanent confirmed bookings.
 */
export const bookingSessions = pgTable(
  "booking_sessions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sessionCode: varchar("session_code", { length: 50 }).notNull().unique(), // e.g. "SES-202611-9281"
    customerId: varchar("customer_id", { length: 36 })
      .references(() => users.id, { onDelete: "set null" }),
    customerName: varchar("customer_name", { length: 150 }),
    customerEmail: varchar("customer_email", { length: 255 }),
    customerPhone: varchar("customer_phone", { length: 20 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    showId: varchar("show_id", { length: 36 })
      .notNull()
      .references(() => shows.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    hallId: varchar("hall_id", { length: 36 })
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    status: bookingSessionStatusEnum("status").notNull().default("ACTIVE"),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0.00"),
    convenienceFee: decimal("convenience_fee", { precision: 10, scale: 2 }).notNull().default("0.00"),
    tax: decimal("tax", { precision: 10, scale: 2 }).notNull().default("0.00"),
    discount: decimal("discount", { precision: 10, scale: 2 }).notNull().default("0.00"),
    grandTotal: decimal("grand_total", { precision: 10, scale: 2 }).notNull().default("0.00"),
    seatCount: integer("seat_count").notNull().default(0),
    selectedSeatsData: jsonb("selected_seats_data").$type<Array<Record<string, unknown>>>().default([]),
    isLocked: boolean("is_locked").notNull().default(false),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    bookingId: varchar("booking_id", { length: 36 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("booking_sessions_code_idx").on(table.sessionCode),
    index("booking_sessions_show_id_idx").on(table.showId),
    index("booking_sessions_theatre_id_idx").on(table.theatreId),
    index("booking_sessions_customer_id_idx").on(table.customerId),
    index("booking_sessions_status_idx").on(table.status),
    index("booking_sessions_expires_at_idx").on(table.expiresAt),
  ]
);

export const bookings = pgTable(
  "bookings",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    referenceCode: varchar("reference_code", { length: 50 }).notNull().unique(), // e.g. "CS-PUN-001-9281"
    customerId: varchar("customer_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    customerName: varchar("customer_name", { length: 150 }).notNull(),
    customerEmail: varchar("customer_email", { length: 255 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
    showId: varchar("show_id", { length: 36 })
      .notNull()
      .references(() => shows.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    hallId: varchar("hall_id", { length: 36 })
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    bookingStatus: bookingStatusEnum("booking_status").notNull().default("CONFIRMED"),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("PENDING"),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Subtotal without fees/taxes
    convenienceFee: decimal("convenience_fee", { precision: 10, scale: 2 }).notNull().default("0.00"),
    taxes: decimal("taxes", { precision: 10, scale: 2 }).notNull().default("0.00"),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    bookingTime: timestamp("booking_time", { withTimezone: true }).defaultNow().notNull(),
    qrCodeUrl: text("qr_code_url"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("bookings_ref_code_idx").on(table.referenceCode),
    index("bookings_theatre_id_idx").on(table.theatreId),
    index("bookings_customer_id_idx").on(table.customerId),
    index("bookings_show_id_idx").on(table.showId),
    index("bookings_booking_status_idx").on(table.bookingStatus),
    index("bookings_payment_status_idx").on(table.paymentStatus),
    index("bookings_created_at_idx").on(table.createdAt),
  ]
);

export const bookingSeats = pgTable(
  "booking_seats",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    bookingId: varchar("booking_id", { length: 36 })
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    seatInventoryId: varchar("seat_inventory_id", { length: 36 })
      .notNull()
      .references(() => seatInventory.id, { onDelete: "cascade" }),
    seatNumber: varchar("seat_number", { length: 20 }).notNull(),
    sectionName: varchar("section_name", { length: 100 }).notNull(),
    seatType: seatTypeEnum("seat_type").notNull().default("STANDARD"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("booking_seats_booking_seat_inv_idx").on(table.bookingId, table.seatInventoryId),
    index("booking_seats_booking_id_idx").on(table.bookingId),
    index("booking_seats_seat_inv_id_idx").on(table.seatInventoryId),
  ]
);

export const tickets = pgTable(
  "tickets",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    ticketNumber: varchar("ticket_number", { length: 60 }).notNull().unique(), // e.g. "TKT-CS-9281-A1"
    bookingId: varchar("booking_id", { length: 36 })
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    bookingSeatId: varchar("booking_seat_id", { length: 36 })
      .references(() => bookingSeats.id, { onDelete: "set null" }),
    seatNumber: varchar("seat_number", { length: 20 }).notNull(),
    qrPlaceholder: text("qr_placeholder").notNull(),
    status: ticketStatusEnum("status").notNull().default("VALID"),
    issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("tickets_ticket_number_idx").on(table.ticketNumber),
    index("tickets_booking_id_idx").on(table.bookingId),
    index("tickets_status_idx").on(table.status),
  ]
);

