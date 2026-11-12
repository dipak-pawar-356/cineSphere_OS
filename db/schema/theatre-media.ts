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
import {
  theatreMediaTypeEnum,
  theatreMediaStatusEnum,
  theatreFutureVideoSubtypeEnum,
} from "./enums";
import { theatres } from "./theatres";
import { users } from "./users";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Branding & Media Management Schema (Phase 3 – Part 2)
 * ==============================================================================
 * Normalized Digital Asset Management (DAM) extension:
 * Platform -> Theatre -> TheatreMediaCollection -> TheatreMedia
 * With immutable MediaVersion history, rich MediaMetadata, and reusable
 * MediaReferences (no direct hardcoded asset URLs locked inside Theatre).
 * ==============================================================================
 */

export const theatreMediaCollections = pgTable(
  "theatre_media_collections",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .unique()
      .references(() => theatres.id, { onDelete: "cascade" }),
    collectionCode: varchar("collection_code", { length: 64 }).notNull().unique(),
    activeLogoMediaId: varchar("active_logo_media_id", { length: 36 }),
    activeBannerMediaId: varchar("active_banner_media_id", { length: 36 }),
    activeCoverMediaId: varchar("active_cover_media_id", { length: 36 }),
    activeHeroMediaId: varchar("active_hero_media_id", { length: 36 }),
    activeThumbnailMediaId: varchar("active_thumbnail_media_id", { length: 36 }),
    storageDriver: varchar("storage_driver", { length: 40 }).notNull().default("LOCAL_VIRTUAL_VAULT"),
    cdnBaseUrlPlaceholder: text("cdn_base_url_placeholder"),
    storageQuotaBytes: integer("storage_quota_bytes").notNull().default(524288000), // 500 MB default tier
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatre_media_collections_theatre_idx").on(table.theatreId),
    uniqueIndex("theatre_media_collections_code_idx").on(table.collectionCode),
  ]
);

export const theatreMedia = pgTable(
  "theatre_media",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    collectionId: varchar("collection_id", { length: 36 })
      .notNull()
      .references(() => theatreMediaCollections.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    mediaType: theatreMediaTypeEnum("media_type").notNull(),
    futureVideoSubtype: theatreFutureVideoSubtypeEnum("future_video_subtype"),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    url: text("url").notNull(),
    status: theatreMediaStatusEnum("status").notNull().default("ACTIVE"),
    displayOrder: integer("display_order").notNull().default(1),
    displayPriority: integer("display_priority").notNull().default(100),
    currentVersion: integer("current_version").notNull().default(1),
    isPrimary: boolean("is_primary").notNull().default(false),
    uploadedBy: varchar("uploaded_by", { length: 36 })
      .references(() => users.id, { onDelete: "set null" }),
    deletedBy: varchar("deleted_by", { length: 36 })
      .references(() => users.id, { onDelete: "set null" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_media_collection_idx").on(table.collectionId),
    index("theatre_media_theatre_id_idx").on(table.theatreId),
    index("theatre_media_type_idx").on(table.mediaType),
    index("theatre_media_status_idx").on(table.status),
    index("theatre_media_order_idx").on(table.theatreId, table.mediaType, table.displayOrder),
  ]
);

export const theatreMediaMetadata = pgTable(
  "theatre_media_metadata",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    mediaId: varchar("media_id", { length: 36 })
      .notNull()
      .unique()
      .references(() => theatreMedia.id, { onDelete: "cascade" }),
    altText: varchar("alt_text", { length: 300 }).notNull(),
    caption: text("caption"),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    fileSizeBytes: integer("file_size_bytes").notNull().default(0),
    width: integer("width").notNull().default(0),
    height: integer("height").notNull().default(0),
    aspectRatio: varchar("aspect_ratio", { length: 20 }).notNull().default("16:9"),
    checksum: varchar("checksum", { length: 128 }).notNull(),
    uploadSource: varchar("upload_source", { length: 50 }).notNull().default("URL_REFERENCE"),
    dominantColor: varchar("dominant_color", { length: 20 }).notNull().default("#070B12"),
    cropPlaceholder: jsonb("crop_placeholder").$type<{
      x: number;
      y: number;
      width: number;
      height: number;
      unit: "px" | "%";
      aspectLock?: string;
    }>(),
    compressionPlaceholder: jsonb("compression_placeholder").$type<{
      compressionReady: boolean;
      targetFormats: ("webp" | "avif" | "jpeg")[];
      responsiveWidths: number[];
      thumbnailSpec: { width: number; height: number };
      cdnUrlPatternPlaceholder?: string;
    }>(),
    corruptedCheckStatus: varchar("corrupted_check_status", { length: 30 }).notNull().default("PASSED"),
    duplicateCheckHash: varchar("duplicate_check_hash", { length: 128 }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatre_media_metadata_media_idx").on(table.mediaId),
    index("theatre_media_metadata_checksum_idx").on(table.checksum),
  ]
);

export const theatreMediaVersions = pgTable(
  "theatre_media_versions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    mediaId: varchar("media_id", { length: 36 })
      .notNull()
      .references(() => theatreMedia.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    url: text("url").notNull(),
    checksum: varchar("checksum", { length: 128 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    fileSizeBytes: integer("file_size_bytes").notNull().default(0),
    width: integer("width").notNull().default(0),
    height: integer("height").notNull().default(0),
    dominantColor: varchar("dominant_color", { length: 20 }).notNull().default("#070B12"),
    altText: varchar("alt_text", { length: 300 }).notNull(),
    caption: text("caption"),
    changeReason: text("change_reason"),
    replacedBy: varchar("replaced_by", { length: 36 })
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatre_media_versions_media_ver_idx").on(table.mediaId, table.versionNumber),
    index("theatre_media_versions_media_idx").on(table.mediaId),
  ]
);

export const theatreMediaReferences = pgTable(
  "theatre_media_references",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    mediaId: varchar("media_id", { length: 36 })
      .notNull()
      .references(() => theatreMedia.id, { onDelete: "cascade" }),
    targetEntityType: varchar("target_entity_type", { length: 40 }).notNull().default("THEATRE"),
    targetEntityId: varchar("target_entity_id", { length: 64 }).notNull(),
    slotKey: varchar("slot_key", { length: 64 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_media_refs_theatre_idx").on(table.theatreId),
    index("theatre_media_refs_media_idx").on(table.mediaId),
    index("theatre_media_refs_target_idx").on(table.targetEntityType, table.targetEntityId, table.slotKey),
  ]
);

