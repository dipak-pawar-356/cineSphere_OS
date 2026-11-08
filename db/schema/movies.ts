import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  movieStatusEnum,
  movieFormatEnum,
  movieCertificateEnum,
} from "./enums";

/**
 * ==============================================================================
 * CineSphere OS - Normalized Movies & Media Assets Schema
 * Movies store ONLY creative & catalog metadata. Never pricing. Never seats.
 * ==============================================================================
 */

export const movies = pgTable(
  "movies",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: varchar("slug", { length: 150 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    tagline: varchar("tagline", { length: 255 }),
    synopsis: text("synopsis"),
    description: text("description"),
    poster: text("poster").notNull(),
    banner: text("banner").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    rating: decimal("rating", { precision: 3, scale: 1 }).default("8.5"),
    certificate: movieCertificateEnum("certificate").notNull().default("UA"),
    releaseDate: varchar("release_date", { length: 20 }).notNull(), // ISO YYYY-MM-DD
    status: movieStatusEnum("status").notNull().default("NOW_SHOWING"),
    director: varchar("director", { length: 150 }),
    cast: jsonb("cast").$type<string[]>().default([]),
    castDetailed: jsonb("cast_detailed").$type<{
      id: string;
      name: string;
      role: string;
      avatar?: string;
    }[]>().default([]),
    crewDetailed: jsonb("crew_detailed").$type<{
      id: string;
      name: string;
      role: string;
    }[]>().default([]),
    isFeatured: boolean("is_featured").notNull().default(false),
    isTrending: boolean("is_trending").notNull().default(false),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("movies_slug_idx").on(table.slug),
    index("movies_title_idx").on(table.title),
    index("movies_status_idx").on(table.status),
    index("movies_release_date_idx").on(table.releaseDate),
    index("movies_certificate_idx").on(table.certificate),
    index("movies_is_deleted_idx").on(table.isDeleted),
  ]
);

export const movieLanguages = pgTable(
  "movie_languages",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    movieId: varchar("movie_id", { length: 36 })
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    language: varchar("language", { length: 50 }).notNull(), // e.g. "Hindi", "English", "Telugu", "Tamil"
    isPrimary: boolean("is_primary").notNull().default(false),
    audioTrackType: varchar("audio_track_type", { length: 50 }).default("Original"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("movie_languages_movie_lang_idx").on(table.movieId, table.language),
    index("movie_languages_movie_id_idx").on(table.movieId),
    index("movie_languages_language_idx").on(table.language),
  ]
);

export const movieFormats = pgTable(
  "movie_formats",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    movieId: varchar("movie_id", { length: 36 })
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    format: movieFormatEnum("format").notNull().default("STANDARD"),
    isAvailable: boolean("is_available").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("movie_formats_movie_format_idx").on(table.movieId, table.format),
    index("movie_formats_movie_id_idx").on(table.movieId),
    index("movie_formats_format_idx").on(table.format),
  ]
);

export const movieGenres = pgTable(
  "movie_genres",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    movieId: varchar("movie_id", { length: 36 })
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    genre: varchar("genre", { length: 50 }).notNull(), // e.g. "Action", "Sci-Fi", "Drama", "Thriller"
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("movie_genres_movie_genre_idx").on(table.movieId, table.genre),
    index("movie_genres_movie_id_idx").on(table.movieId),
    index("movie_genres_genre_idx").on(table.genre),
  ]
);

export const movieImages = pgTable(
  "movie_images",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    movieId: varchar("movie_id", { length: 36 })
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    imageType: varchar("image_type", { length: 50 }).notNull().default("gallery"), // "poster", "banner", "backdrop", "gallery"
    displayOrder: integer("display_order").notNull().default(0),
    altText: varchar("alt_text", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("movie_images_movie_id_idx").on(table.movieId),
    index("movie_images_type_idx").on(table.imageType),
  ]
);

export const movieTrailers = pgTable(
  "movie_trailers",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    movieId: varchar("movie_id", { length: 36 })
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 150 }).notNull(),
    videoUrl: text("video_url").notNull(),
    thumbnailUrl: text("thumbnail_url").notNull(),
    duration: varchar("duration", { length: 20 }).default("2:45"),
    isMain: boolean("is_main").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("movie_trailers_movie_id_idx").on(table.movieId),
  ]
);
