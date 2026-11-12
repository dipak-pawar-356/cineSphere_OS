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
  theatreProfileStatusEnum,
  theatreCategoryTypeEnum,
  theatreOwnershipModelEnum,
  theatreSocialPlatformEnum,
} from "./enums";
import { theatres } from "./theatres";
import { users } from "./users";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Profile Management Schema (Phase 3 – Part 3)
 * ==============================================================================
 * Normalized public & business profile entities decoupled from core `theatres`:
 * Platform -> Theatre -> TheatreProfile ->
 *   TheatreLanguage / TheatreSocialLink / TheatreProfileVersion
 * ==============================================================================
 */

export interface TheatreLocalizedTextFields {
  theatreName?: string;
  displayName?: string;
  shortDescription?: string;
  fullDescription?: string;
  aboutTheatre?: string;
  tagline?: string;
}

export interface ProfileCompletionChecklist {
  hasBasicIdentity: boolean;
  hasDescriptions: boolean;
  hasLogoUploaded: boolean;
  hasBannerUploaded: boolean;
  hasWebsiteConfigured: boolean;
  hasSocialLinks: boolean;
  hasLanguagesConfigured: boolean;
  hasCapacitySpecs: boolean;
}

export const theatreProfiles = pgTable(
  "theatre_profiles",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .unique()
      .references(() => theatres.id, { onDelete: "cascade" }),
    publicSlug: varchar("public_slug", { length: 160 }).notNull().unique(),

    // Basic Identity & Multi-Locale Ready Copy
    theatreName: varchar("theatre_name", { length: 150 }).notNull(),
    legalName: varchar("legal_name", { length: 200 }).notNull(),
    displayName: varchar("display_name", { length: 150 }).notNull(),
    shortDescription: varchar("short_description", { length: 400 }),
    fullDescription: text("full_description"),
    aboutTheatre: text("about_theatre"),
    tagline: varchar("tagline", { length: 255 }),
    defaultLocale: varchar("default_locale", { length: 16 }).notNull().default("en"),
    localizedFields: jsonb("localized_fields")
      .$type<Record<string, TheatreLocalizedTextFields>>()
      .default({}),

    // Classification
    establishedYear: integer("established_year"),
    theatreType: theatreCategoryTypeEnum("theatre_type").notNull().default("MULTIPLEX"),
    customTheatreType: varchar("custom_theatre_type", { length: 100 }),
    ownershipModel: theatreOwnershipModelEnum("ownership_model").notNull().default("CHAIN"),
    chainName: varchar("chain_name", { length: 120 }),

    // Business Information
    screensCount: integer("screens_count").notNull().default(1),
    totalSeatingCapacity: integer("total_seating_capacity").notNull().default(100),
    averageCapacityPerScreen: integer("average_capacity_per_screen").notNull().default(100),
    primaryLanguageCode: varchar("primary_language_code", { length: 16 }).notNull().default("en"),
    website: varchar("website", { length: 500 }),
    businessEmailPlaceholder: varchar("business_email_placeholder", { length: 255 }),
    businessPhonePlaceholder: varchar("business_phone_placeholder", { length: 40 }),

    // Profile Governance, Completion & Versioning
    status: theatreProfileStatusEnum("status").notNull().default("DRAFT"),
    version: integer("version").notNull().default(1),
    completionScore: integer("completion_score").notNull().default(0),
    completionBreakdown: jsonb("completion_breakdown").$type<ProfileCompletionChecklist>(),

    publishedAt: timestamp("published_at", { withTimezone: true }),
    publishedBy: varchar("published_by", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    archivedBy: varchar("archived_by", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),
    createdBy: varchar("created_by", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),
    updatedBy: varchar("updated_by", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatre_profiles_theatre_id_idx").on(table.theatreId),
    uniqueIndex("theatre_profiles_public_slug_idx").on(table.publicSlug),
    index("theatre_profiles_status_idx").on(table.status),
    index("theatre_profiles_type_idx").on(table.theatreType),
    index("theatre_profiles_ownership_idx").on(table.ownershipModel),
    index("theatre_profiles_year_idx").on(table.establishedYear),
  ]
);

export const theatreLanguages = pgTable(
  "theatre_languages",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    profileId: varchar("profile_id", { length: 36 })
      .notNull()
      .references(() => theatreProfiles.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    languageCode: varchar("language_code", { length: 16 }).notNull(),
    displayName: varchar("display_name", { length: 80 }).notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatre_languages_profile_code_idx").on(table.profileId, table.languageCode),
    index("theatre_languages_theatre_id_idx").on(table.theatreId),
    index("theatre_languages_primary_idx").on(table.profileId, table.isPrimary),
  ]
);

export const theatreSocialLinks = pgTable(
  "theatre_social_links",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    profileId: varchar("profile_id", { length: 36 })
      .notNull()
      .references(() => theatreProfiles.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    platform: theatreSocialPlatformEnum("platform").notNull(),
    customPlatformName: varchar("custom_platform_name", { length: 80 }),
    label: varchar("label", { length: 120 }),
    url: text("url").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    displayOrder: integer("display_order").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_social_links_profile_id_idx").on(table.profileId),
    index("theatre_social_links_theatre_id_idx").on(table.theatreId),
    index("theatre_social_links_platform_idx").on(table.platform),
  ]
);

export const theatreProfileVersions = pgTable(
  "theatre_profile_versions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    profileId: varchar("profile_id", { length: 36 })
      .notNull()
      .references(() => theatreProfiles.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    previousValues: jsonb("previous_values").$type<Record<string, unknown>>().notNull(),
    nextValues: jsonb("next_values").$type<Record<string, unknown>>().notNull(),
    updatedFields: jsonb("updated_fields").$type<string[]>().notNull(),
    changeSummary: text("change_summary"),
    updatedBy: varchar("updated_by", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),
    updatedByRole: varchar("updated_by_role", { length: 40 }).notNull().default("THEATRE_ADMIN"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatre_profile_versions_unique_idx").on(table.profileId, table.versionNumber),
    index("theatre_profile_versions_profile_id_idx").on(table.profileId),
    index("theatre_profile_versions_theatre_id_idx").on(table.theatreId),
  ]
);

