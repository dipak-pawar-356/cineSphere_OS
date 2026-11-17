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
import { halls } from "./halls";
import { layoutDefinitions, layoutVersions } from "./hall-designer";
import {
  LayoutLiveStatus,
  PublishWindowType,
} from "@/types/publishing-workflow.types";

/**
 * ==============================================================================
 * CineSphere OS — Publishing Workflow Database Schema (Phase 4 – Part 12)
 * ==============================================================================
 * Production-ready publishing pipeline for hall layouts. Activates a validated
 * layout version for future shows while preserving historical versions for
 * existing bookings via the Show Compatibility Layer.
 * ==============================================================================
 */

// 1. Publishing Configurations (Per-Theatre Publishing Governance)
export const publishingConfigurations = pgTable(
  "publishing_configurations",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .unique()
      .references(() => theatres.id, { onDelete: "cascade" }),
    instantPublishEnabled: boolean("instant_publish_enabled").notNull().default(true),
    approvalRequired: boolean("approval_required").notNull().default(false),
    scheduledPublishEnabled: boolean("scheduled_publish_enabled").notNull().default(false),
    rollbackEnabled: boolean("rollback_enabled").notNull().default(true),
    publishWindow: varchar("publish_window", { length: 30 })
      .$type<PublishWindowType>()
      .notNull()
      .default("ANYTIME"),
    allowedRolesToPublish: jsonb("allowed_roles_to_publish")
      .$type<string[]>()
      .notNull()
      .default(["SUPER_ADMIN", "THEATRE_ADMIN"]),
    requirePublishNotes: boolean("require_publish_notes").notNull().default(false),
    notifyOnPublish: boolean("notify_on_publish").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("publishing_configurations_theatre_idx").on(table.theatreId),
  ]
);

// 2. Publishing History Log (Immutable Audit Trail)
export const publishingHistory = pgTable(
  "publishing_history",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    layoutDefinitionId: varchar("layout_definition_id", { length: 36 })
      .notNull()
      .references(() => layoutDefinitions.id, { onDelete: "cascade" }),
    versionId: varchar("version_id", { length: 36 })
      .notNull()
      .references(() => layoutVersions.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    previousVersionId: varchar("previous_version_id", { length: 36 }),
    previousVersionNumber: integer("previous_version_number"),
    publishedBy: varchar("published_by", { length: 100 }).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
    publishNotes: text("publish_notes"),
    validationSummary: jsonb("validation_summary").$type<{
      errorsCount: number;
      warningsCount: number;
      canPublish: boolean;
    }>(),
    policyApplied: varchar("policy_applied", { length: 100 }).notNull().default("STANDARD"),
    isScheduled: boolean("is_scheduled").notNull().default(false),
  },
  (table) => [
    index("publishing_history_theatre_id_idx").on(table.theatreId),
    index("publishing_history_layout_def_idx").on(table.layoutDefinitionId),
    index("publishing_history_published_at_idx").on(table.publishedAt),
  ]
);

// 3. Publishing Live Status (Current Active Version Pointer)
export const publishingStatus = pgTable(
  "publishing_status",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    layoutDefinitionId: varchar("layout_definition_id", { length: 36 })
      .notNull()
      .unique()
      .references(() => layoutDefinitions.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    hallId: varchar("hall_id", { length: 36 })
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    currentPublishedVersionId: varchar("current_published_version_id", { length: 36 }),
    currentPublishedVersionNumber: integer("current_published_version_number"),
    liveStatus: varchar("live_status", { length: 30 })
      .$type<LayoutLiveStatus>()
      .notNull()
      .default("ACTIVE"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    publishedBy: varchar("published_by", { length: 100 }),
    totalActiveShowsUsingThisLayout: integer("total_active_shows_using_this_layout").notNull().default(0),
    lastPublishNotes: text("last_publish_notes"),
    isVersionLocked: boolean("is_version_locked").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("publishing_status_layout_def_idx").on(table.layoutDefinitionId),
    index("publishing_status_theatre_id_idx").on(table.theatreId),
    index("publishing_status_hall_id_idx").on(table.hallId),
  ]
);

// 4. Show Compatibility Layer (Guarantees Historical Shows & Bookings Remain Bound to Their Layout Version)
export const showLayoutAssignments = pgTable(
  "show_layout_assignments",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    showId: varchar("show_id", { length: 36 }).notNull(),
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
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
    assignedBy: varchar("assigned_by", { length: 100 }).notNull(),
    isMigrated: boolean("is_migrated").notNull().default(false),
    migratedAt: timestamp("migrated_at", { withTimezone: true }),
    migratedBy: varchar("migrated_by", { length: 100 }),
    migrationNotes: text("migration_notes"),
  },
  (table) => [
    uniqueIndex("show_layout_assignments_show_idx").on(table.showId),
    index("show_layout_assignments_theatre_idx").on(table.theatreId),
    index("show_layout_assignments_version_idx").on(table.layoutVersionId),
  ]
);
