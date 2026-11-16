import {
  pgTable,
  varchar,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";
import { theatres } from "./theatres";
import { layoutVersions } from "./hall-designer";

/**
 * ==============================================================================
 * CineSphere OS — Hall Preview Database Schema (Phase 4 – Part 9)
 * ==============================================================================
 * 1. Preview Configurations: Version-specific display states and settings.
 * 2. Preview Preferences: Per-theatre defaults for customer, theatre & admin modes.
 * 3. Preview Themes: Visual styling palettes (Dark, Light, High Contrast, OLED).
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Preview Configurations Table
// ------------------------------------------------------------------------------

export const previewConfigurations = pgTable(
  "preview_configurations",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "cascade" })
      .notNull(),
    layoutVersionId: varchar("layout_version_id", { length: 36 })
      .references(() => layoutVersions.id, { onDelete: "cascade" })
      .notNull(),
    defaultMode: varchar("default_mode", { length: 30 }).notNull().default("CUSTOMER"),
    showLabels: boolean("show_labels").notNull().default(true),
    showGrid: boolean("show_grid").notNull().default(true),
    seatColorMode: varchar("seat_color_mode", { length: 30 }).notNull().default("CATEGORY"),
    backgroundTheme: varchar("background_theme", { length: 30 }).notNull().default("DARK"),
    isFullscreen: boolean("is_fullscreen").notNull().default(false),
    zoom: integer("zoom").notNull().default(100),
    pan: jsonb("pan").$type<{ x: number; y: number }>().default({ x: 0, y: 0 }).notNull(),
    accessibilityOverlay: boolean("accessibility_overlay").notNull().default(false),
    enableBookingSimulation: boolean("enable_booking_simulation").notNull().default(true),
    highContrastMode: boolean("high_contrast_mode").notNull().default(false),
    fullscreenDefault: boolean("fullscreen_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_preview_config_theatre").on(table.theatreId),
    uniqueIndex("uq_preview_config_version").on(table.layoutVersionId),
  ]
);

// ------------------------------------------------------------------------------
// 2. Preview Preferences Table (Theatre-Level Defaults)
// ------------------------------------------------------------------------------

export const previewPreferences = pgTable(
  "preview_preferences",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "cascade" })
      .notNull(),
    defaultMode: varchar("default_mode", { length: 30 }).notNull().default("CUSTOMER"),
    seatLabelsVisible: boolean("seat_labels_visible").notNull().default(true),
    sectionColorsEnabled: boolean("section_colors_enabled").notNull().default(true),
    accessibilityOverlayEnabled: boolean("accessibility_overlay_enabled").notNull().default(true),
    darkThemeEnabled: boolean("dark_theme_enabled").notNull().default(true),
    bookingSimulationEnabled: boolean("booking_simulation_enabled").notNull().default(true),
    categoryLabelsVisible: boolean("category_labels_visible").notNull().default(true),
    highContrastMode: boolean("high_contrast_mode").notNull().default(false),
    fullscreenDefault: boolean("fullscreen_default").notNull().default(false),
    defaultZoom: integer("default_zoom").notNull().default(100),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_preview_prefs_theatre").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 3. Preview Themes Table (Visual Canvas Themes)
// ------------------------------------------------------------------------------

export const previewThemes = pgTable(
  "preview_themes",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    themeName: varchar("theme_name", { length: 50 }).notNull().default("DARK"),
    backgroundColor: varchar("background_color", { length: 30 }).notNull().default("#0B0F19"),
    gridColor: varchar("grid_color", { length: 30 }).notNull().default("rgba(255, 255, 255, 0.05)"),
    screenColor: varchar("screen_color", { length: 30 }).notNull().default("#38BDF8"),
    screenCurvatureGlow: varchar("screen_curvature_glow", { length: 50 }).notNull().default("rgba(56, 189, 248, 0.25)"),
    textColor: varchar("text_color", { length: 30 }).notNull().default("#F8FAFC"),
    accentColor: varchar("accent_color", { length: 30 }).notNull().default("#E11D48"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_preview_themes_theatre").on(table.theatreId),
  ]
);
