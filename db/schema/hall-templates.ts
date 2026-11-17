import {
  pgTable,
  varchar,
  boolean,
  integer,
  timestamp,
  text,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { theatres } from "./theatres";
import {
  HallTemplateCategory,
  TemplateVisibility,
  TemplateStatus,
  TemplateType,
} from "@/types/hall-templates.types";

/**
 * ==============================================================================
 * CineSphere OS — Hall Templates Database Schema (Phase 4 – Part 14)
 * ==============================================================================
 * Reusable Hall Template Engine: Templates are blueprints that generate new
 * independent Layout Definitions. Built-in templates are platform-wide;
 * custom templates are isolated to their owning theatre tenant.
 * ==============================================================================
 */

// 1. Hall Templates (Reusable Blueprints)
export const hallTemplates = pgTable(
  "hall_templates",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "cascade" }), // null = platform-wide
    name: varchar("name", { length: 150 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    category: varchar("category", { length: 50 })
      .$type<HallTemplateCategory>()
      .notNull()
      .default("MULTIPLEX"),
    description: text("description").notNull(),
    isBuiltIn: boolean("is_built_in").notNull().default(false),
    parentTemplateId: varchar("parent_template_id", { length: 36 }), // Inheritance
    versionNumber: integer("version_number").notNull().default(1),
    canvasSettingsPayload: jsonb("canvas_settings_payload").$type<Record<string, unknown>>().notNull(),
    gridConfigPayload: jsonb("grid_config_payload").$type<Record<string, unknown>>().notNull(),
    sectionsPayload: jsonb("sections_payload").$type<unknown[]>().notNull().default([]),
    seatsPayload: jsonb("seats_payload").$type<unknown[]>().notNull().default([]),
    structuralObjectsPayload: jsonb("structural_objects_payload").$type<unknown[]>().notNull().default([]),
    validationRulesPayload: jsonb("validation_rules_payload").$type<Record<string, unknown>>(),
    defaultConfigurationPayload: jsonb("default_config_payload").$type<Record<string, unknown>>(),
    status: varchar("status", { length: 30 })
      .$type<TemplateStatus>()
      .notNull()
      .default("ACTIVE"),
    visibility: varchar("visibility", { length: 30 })
      .$type<TemplateVisibility>()
      .notNull()
      .default("PLATFORM"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("hall_templates_code_theatre_idx").on(table.code, table.theatreId),
    index("hall_templates_category_idx").on(table.category),
    index("hall_templates_theatre_idx").on(table.theatreId),
    index("hall_templates_is_builtin_idx").on(table.isBuiltIn),
  ]
);

// 2. Template Registry (Central Master Catalog & Traceability)
export const templateRegistry = pgTable(
  "template_registry",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    templateId: varchar("template_id", { length: 36 })
      .notNull()
      .unique()
      .references(() => hallTemplates.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 150 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    templateType: varchar("template_type", { length: 30 })
      .$type<TemplateType>()
      .notNull()
      .default("BUILT_IN"),
    category: varchar("category", { length: 50 })
      .$type<HallTemplateCategory>()
      .notNull(),
    versionNumber: integer("version_number").notNull().default(1),
    visibility: varchar("visibility", { length: 30 })
      .$type<TemplateVisibility>()
      .notNull()
      .default("PLATFORM"),
    status: varchar("status", { length: 30 })
      .$type<TemplateStatus>()
      .notNull()
      .default("ACTIVE"),
    totalSeats: integer("total_seats").notNull().default(0),
    totalSections: integer("total_sections").notNull().default(0),
    totalStructuralObjects: integer("total_structural_objects").notNull().default(0),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    createdBy: varchar("created_by", { length: 100 }).notNull(),
    updatedBy: varchar("updated_by", { length: 100 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("template_registry_template_idx").on(table.templateId),
    index("template_registry_category_idx").on(table.category),
    index("template_registry_theatre_idx").on(table.theatreId),
    index("template_registry_status_idx").on(table.status),
  ]
);

// 3. Template Metadata (Architectural, Acoustic & Accessibility Specifications)
export const templateMetadata = pgTable(
  "template_metadata",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    templateId: varchar("template_id", { length: 36 })
      .notNull()
      .unique()
      .references(() => hallTemplates.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "cascade" }),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    recommendedAuditoriumTypes: jsonb("recommended_auditorium_types")
      .$type<string[]>()
      .notNull()
      .default([]),
    aspectRatio: varchar("aspect_ratio", { length: 20 }).notNull().default("2.39:1"),
    screenCurvatureSupported: boolean("screen_curvature_supported").notNull().default(false),
    accessibilityTier: varchar("accessibility_tier", { length: 30 })
      .$type<"STANDARD" | "ENHANCED" | "PREMIUM">()
      .notNull()
      .default("STANDARD"),
    acousticRating: varchar("acoustic_rating", { length: 30 })
      .$type<"THX_CERTIFIED" | "DOLBY_ATMOS_TUNED" | "STANDARD">()
      .notNull()
      .default("STANDARD"),
    authorNotes: text("author_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("template_metadata_template_idx").on(table.templateId),
    index("template_metadata_theatre_idx").on(table.theatreId),
  ]
);

// 4. Template Configurations (Per-Theatre Governance)
export const templateConfigurations = pgTable(
  "template_configurations",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .unique()
      .references(() => theatres.id, { onDelete: "cascade" }),
    allowCustomTemplates: boolean("allow_custom_templates").notNull().default(true),
    maxCustomTemplates: integer("max_custom_templates").notNull().default(20),
    defaultBaseTemplateId: varchar("default_base_template_id", { length: 36 }),
    autoInheritPlatformUpdates: boolean("auto_inherit_platform_updates").notNull().default(false),
    restrictedCategories: jsonb("restricted_categories")
      .$type<HallTemplateCategory[]>()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("template_configurations_theatre_idx").on(table.theatreId),
  ]
);
