import {
  pgTable,
  varchar,
  text,
  boolean,
  decimal,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { cityTierEnum } from "./enums";

/**
 * ==============================================================================
 * CineSphere OS - Geographic Hierarchy Schema
 * Normalized Countries, States, and Cities supporting multi-tenant location routing
 * ==============================================================================
 */

export const countries = pgTable(
  "countries",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    code: varchar("code", { length: 3 }).notNull().unique(), // ISO-3166-1 alpha-3 (e.g. IND, USA)
    name: varchar("name", { length: 100 }).notNull(),
    phoneCode: varchar("phone_code", { length: 10 }).notNull().default("+91"),
    currencyCode: varchar("currency_code", { length: 10 }).notNull().default("INR"),
    currencySymbol: varchar("currency_symbol", { length: 10 }).notNull().default("₹"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("countries_code_idx").on(table.code),
    index("countries_name_idx").on(table.name),
  ]
);

export const states = pgTable(
  "states",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    countryId: varchar("country_id", { length: 36 })
      .notNull()
      .references(() => countries.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    code: varchar("code", { length: 10 }).notNull(), // State ISO Code (e.g. MH, KA)
    gstStateCode: varchar("gst_state_code", { length: 4 }), // Indian GST State Code (e.g. 27 for Maharashtra)
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("states_country_id_idx").on(table.countryId),
    uniqueIndex("states_country_code_idx").on(table.countryId, table.code),
    index("states_name_idx").on(table.name),
  ]
);

export const cities = pgTable(
  "cities",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    stateId: varchar("state_id", { length: 36 })
      .notNull()
      .references(() => states.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    tier: cityTierEnum("tier").notNull().default("TIER_1"),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("cities_state_id_idx").on(table.stateId),
    uniqueIndex("cities_state_slug_idx").on(table.stateId, table.slug),
    index("cities_name_idx").on(table.name),
    index("cities_tier_idx").on(table.tier),
  ]
);

