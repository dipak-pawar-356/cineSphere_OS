import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { theatres } from "./theatres";

/**
 * ==============================================================================
 * CineSphere OS - Media Library & System Settings Schema
 * Centralized asset repository and multi-tenant configuration key-value storage
 * ==============================================================================
 */

export const mediaLibrary = pgTable(
  "media_library",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "cascade" }), // Nullable for Platform Super Admin global assets
    uploadedBy: varchar("uploaded_by", { length: 36 })
      .references(() => users.id, { onDelete: "set null" }),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: varchar("file_type", { length: 50 }).notNull().default("image"), // "image", "video", "document"
    mimeType: varchar("mime_type", { length: 100 }).notNull().default("image/webp"),
    sizeBytes: integer("size_bytes").notNull().default(0),
    dimensions: jsonb("dimensions").$type<{ width: number; height: number }>(),
    altText: varchar("alt_text", { length: 255 }),
    folder: varchar("folder", { length: 100 }).default("uploads"),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("media_library_theatre_id_idx").on(table.theatreId),
    index("media_library_file_type_idx").on(table.fileType),
    index("media_library_created_at_idx").on(table.createdAt),
    index("media_library_is_deleted_idx").on(table.isDeleted),
  ]
);

export const systemSettings = pgTable(
  "system_settings",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "cascade" }), // Nullable for Platform-wide global configuration
    key: varchar("key", { length: 100 }).notNull(),           // e.g. "TAX_GST_SLAB", "BOOKING_MAX_SEATS_PER_TX", "MAINTENANCE_MODE"
    value: jsonb("value").$type<unknown>().notNull(),
    category: varchar("category", { length: 50 }).notNull().default("general"), // "general", "finance", "security", "operations"
    description: text("description"),
    isPublic: boolean("is_public").notNull().default(false),   // Exposed to frontend client if true
    updatedBy: varchar("updated_by", { length: 36 })
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("system_settings_theatre_key_idx").on(table.theatreId, table.key),
    index("system_settings_theatre_id_idx").on(table.theatreId),
    index("system_settings_category_idx").on(table.category),
    index("system_settings_is_public_idx").on(table.isPublic),
  ]
);
