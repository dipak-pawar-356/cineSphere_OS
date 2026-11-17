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
import { layoutDefinitions, layoutVersions } from "./hall-designer";
import {
  VersionLifecycleStatus,
  VersionChangeType,
  VersionComparisonDiff,
  VersionPolicy,
} from "@/types/layout-versioning.types";

/**
 * ==============================================================================
 * CineSphere OS — Layout Version Management Schema (Phase 4 – Part 11)
 * ==============================================================================
 * Production-grade immutable version registry, comparison engine, rollback
 * audit history, and multi-tenant versioning policies.
 * ==============================================================================
 */

// 1. Version History Store
export const versionHistory = pgTable(
  "version_history",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    layoutDefinitionId: varchar("layout_definition_id", { length: 36 })
      .notNull()
      .references(() => layoutDefinitions.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    versionId: varchar("version_id", { length: 36 })
      .notNull()
      .references(() => layoutVersions.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    name: varchar("name", { length: 150 }).notNull(),
    status: varchar("status", { length: 30 }).$type<VersionLifecycleStatus>().notNull().default("DRAFT"),
    versionNotes: text("version_notes"),
    sourceVersionId: varchar("source_version_id", { length: 36 }),
    sourceVersionNumber: integer("source_version_number"),
    totalSeats: integer("total_seats").notNull().default(0),
    totalSections: integer("total_sections").notNull().default(0),
    totalStructuralObjects: integer("total_structural_objects").notNull().default(0),
    isLocked: boolean("is_locked").notNull().default(false),
    createdBy: varchar("created_by", { length: 100 }).notNull(),
    updatedBy: varchar("updated_by", { length: 100 }).notNull(),
    publishedBy: varchar("published_by", { length: 100 }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    labels: jsonb("labels").$type<string[]>().notNull().default([]),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
  },
  (table) => [
    uniqueIndex("version_history_def_num_idx").on(
      table.layoutDefinitionId,
      table.versionNumber
    ),
    index("version_history_theatre_id_idx").on(table.theatreId),
    index("version_history_status_idx").on(table.status),
    index("version_history_version_id_idx").on(table.versionId),
  ]
);

// 2. Version Comparison Cache
export const versionComparisons = pgTable(
  "version_comparisons",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    sourceVersionId: varchar("source_version_id", { length: 36 }).notNull(),
    targetVersionId: varchar("target_version_id", { length: 36 }).notNull(),
    diffPayload: jsonb("diff_payload").$type<VersionComparisonDiff>().notNull(),
    calculatedAt: timestamp("calculated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("version_comparisons_pair_idx").on(
      table.theatreId,
      table.sourceVersionId,
      table.targetVersionId
    ),
    index("version_comparisons_theatre_idx").on(table.theatreId),
  ]
);

// 3. Version Granular Change History Log
export const versionChangeEvents = pgTable(
  "version_change_events",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    versionId: varchar("version_id", { length: 36 })
      .notNull()
      .references(() => layoutVersions.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    changeType: varchar("change_type", { length: 30 }).$type<VersionChangeType>().notNull(),
    entityType: varchar("entity_type", { length: 30 }).notNull(),
    entityId: varchar("entity_id", { length: 50 }),
    description: text("description").notNull(),
    actorId: varchar("actor_id", { length: 100 }).notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
    beforeSnapshot: jsonb("before_snapshot").$type<Record<string, unknown>>(),
    afterSnapshot: jsonb("after_snapshot").$type<Record<string, unknown>>(),
  },
  (table) => [
    index("version_change_events_version_id_idx").on(table.versionId),
    index("version_change_events_theatre_id_idx").on(table.theatreId),
    index("version_change_events_timestamp_idx").on(table.timestamp),
  ]
);

// 4. Version Policies (Per-Theatre Governance)
export const versionPolicies = pgTable(
  "version_policies",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .unique()
      .references(() => theatres.id, { onDelete: "cascade" }),
    maxVersionsAllowed: integer("max_versions_allowed").notNull().default(50),
    rollbackEnabled: boolean("rollback_enabled").notNull().default(true),
    compareEnabled: boolean("compare_enabled").notNull().default(true),
    versionNotesRequired: boolean("version_notes_required").notNull().default(false),
    autoPruneArchivedDrafts: boolean("auto_prune_archived_drafts").notNull().default(false),
    approvalRequired: boolean("approval_required").notNull().default(false),
    allowedLabels: jsonb("allowed_labels").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("version_policies_theatre_idx").on(table.theatreId),
  ]
);

// 5. Version Metadata Store
export const versionMetadata = pgTable(
  "version_metadata",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    versionId: varchar("version_id", { length: 36 })
      .notNull()
      .references(() => layoutVersions.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    labels: jsonb("labels").$type<string[]>().notNull().default([]),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    authorNotes: text("author_notes"),
    approvalStatus: varchar("approval_status", { length: 30 })
      .$type<"PENDING" | "APPROVED" | "REJECTED">()
      .default("PENDING"),
    approvedBy: varchar("approved_by", { length: 100 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    reviewRequestedAt: timestamp("review_requested_at", { withTimezone: true }),
    reviewNotes: text("review_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("version_metadata_version_idx").on(table.versionId),
    index("version_metadata_theatre_idx").on(table.theatreId),
  ]
);
