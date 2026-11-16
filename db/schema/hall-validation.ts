import {
  pgTable,
  varchar,
  integer,
  timestamp,
  text,
  jsonb,
  index,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";
import { theatres } from "./theatres";
import { layoutVersions } from "./hall-designer";
import type { ValidationSeverity, ValidationResultItem } from "@/types/hall-validation.types";

/**
 * ==============================================================================
 * CineSphere OS — Hall Validation Database Schema (Phase 4 – Part 10)
 * ==============================================================================
 * 1. Validation Rules: Pluggable central registry of auditorium validation rules.
 * 2. Validation Policies: Per-theatre policy levels & severity override matrices.
 * 3. Validation Results: Audit trail records of preflight evaluation runs.
 * 4. Validation Configurations: Theatre-specific validation strictness settings.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Validation Rules Registry Table
// ------------------------------------------------------------------------------

export const validationRules = pgTable(
  "validation_rules",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    ruleCode: varchar("rule_code", { length: 60 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 40 }).notNull(),
    defaultSeverity: varchar("default_severity", { length: 20 }).notNull().default("ERROR"),
    isSystemRule: boolean("is_system_rule").notNull().default(true),
    isActive: boolean("is_active").notNull().default(true),
    remediationGuidance: text("remediation_guidance"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_validation_rule_code").on(table.ruleCode),
    index("idx_validation_rule_category").on(table.category),
  ]
);

// ------------------------------------------------------------------------------
// 2. Validation Policies Table (Per-Theatre Strictness & Overrides)
// ------------------------------------------------------------------------------

export const validationPolicies = pgTable(
  "validation_policies",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    policyLevel: varchar("policy_level", { length: 30 }).notNull().default("STANDARD"),
    ruleSeverityOverrides: jsonb("rule_severity_overrides")
      .$type<Record<string, ValidationSeverity>>()
      .default({})
      .notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_validation_policy_theatre").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 3. Validation Results Table (Persisted Audit Reports)
// ------------------------------------------------------------------------------

export const validationResults = pgTable(
  "validation_results",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    layoutVersionId: varchar("layout_version_id", { length: 36 })
      .references(() => layoutVersions.id, { onDelete: "cascade" })
      .notNull(),
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "cascade" })
      .notNull(),
    policyAppliedId: varchar("policy_applied_id", { length: 36 }),
    canPublish: boolean("can_publish").notNull(),
    errorsCount: integer("errors_count").notNull().default(0),
    warningsCount: integer("warnings_count").notNull().default(0),
    infoCount: integer("info_count").notNull().default(0),
    suggestionsCount: integer("suggestions_count").notNull().default(0),
    fullReportJson: jsonb("full_report_json")
      .$type<{ results: ValidationResultItem[]; summary: Record<string, unknown> }>()
      .notNull(),
    evaluatedBy: varchar("evaluated_by", { length: 36 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_validation_results_version").on(table.layoutVersionId),
    index("idx_validation_results_theatre").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 4. Validation Configurations Table (Theatre-Specific Rules & Strictness)
// ------------------------------------------------------------------------------

export const validationConfigurations = pgTable(
  "validation_configurations",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .references(() => theatres.id, { onDelete: "cascade" })
      .notNull(),
    strictMode: boolean("strict_mode").notNull().default(false),
    requireAccessibility: boolean("require_accessibility").notNull().default(true),
    requireEmergencyExit: boolean("require_emergency_exit").notNull().default(true),
    requireScreen: boolean("require_screen").notNull().default(true),
    geometryStrictness: varchar("geometry_strictness", { length: 20 }).notNull().default("MEDIUM"),
    allowPublishWithWarnings: boolean("allow_publish_with_warnings").notNull().default(true),
    maxSeatCapacityLimit: integer("max_seat_capacity_limit"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_validation_config_theatre").on(table.theatreId),
  ]
);
