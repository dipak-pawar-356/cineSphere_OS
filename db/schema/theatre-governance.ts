import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { theatres } from "./theatres";

/**
 * ==============================================================================
 * CineSphere OS — Platform Security & Governance Layer Schema (Phase 3 – Part 14)
 * ==============================================================================
 * Reusable enterprise security and governance persistence definitions:
 * 1. TheatreSecurityConfiguration (Dynamic per-venue quotas & parameters)
 * 2. ResourceVersion (Optimistic Concurrency Control & ETag records)
 * 3. SoftDeleteMetadata (Non-destructive soft delete, retention & restore)
 * 4. AuditEvent (Domain security events & compliance audit log)
 * 5. ActivityHistory (Chronological operator activity history)
 * 6. SecurityPolicy (Declarative policy registry placeholders)
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. THEATRE SECURITY CONFIGURATIONS
// ------------------------------------------------------------------------------
export const theatreSecurityConfigurations = pgTable(
  "theatre_security_configurations",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    mediaUploadLimitMb: integer("media_upload_limit_mb").notNull().default(20),
    maxStaffCount: integer("max_staff_count").notNull().default(100),
    configurationVersion: integer("configuration_version").notNull().default(1),
    allowedMimeTypes: jsonb("allowed_mime_types")
      .$type<string[]>()
      .notNull()
      .default(["image/jpeg", "image/png", "image/webp"]),
    requireMfaForSensitiveActions: boolean("require_mfa_for_sensitive_actions")
      .notNull()
      .default(false),
    maxActiveSessions: integer("max_active_sessions").notNull().default(5),
    softDeleteRetentionDays: integer("soft_delete_retention_days").notNull().default(30),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_theatre_security_config_theatre").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 2. RESOURCE VERSION CONTROL (Optimistic Concurrency Control)
// ------------------------------------------------------------------------------
export const theatreResourceVersions = pgTable(
  "theatre_resource_versions",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    resourceType: varchar("resource_type", { length: 64 }).notNull(),
    resourceId: varchar("resource_id", { length: 128 }).notNull(),
    version: integer("version").notNull().default(1),
    eTagPlaceholder: varchar("etag_placeholder", { length: 128 }).notNull(),
    updatedBy: varchar("updated_by", { length: 128 }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_theatre_resource_versions_lookup").on(
      table.theatreId,
      table.resourceType,
      table.resourceId
    ),
  ]
);

// ------------------------------------------------------------------------------
// 3. SOFT DELETE METADATA REGISTRY
// ------------------------------------------------------------------------------
export const theatreSoftDeleteRecords = pgTable(
  "theatre_soft_delete_records",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    resourceType: varchar("resource_type", { length: 64 }).notNull(),
    resourceId: varchar("resource_id", { length: 128 }).notNull(),
    isDeleted: boolean("is_deleted").notNull().default(true),
    deletedAt: timestamp("deleted_at", { withTimezone: true }).defaultNow().notNull(),
    deletedBy: varchar("deleted_by", { length: 128 }).notNull(),
    deleteReasonPlaceholder: text("delete_reason_placeholder"),
    restoredAt: timestamp("restored_at", { withTimezone: true }),
    restoredBy: varchar("restored_by", { length: 128 }),
    permanentDeleteEligibleAt: timestamp("permanent_delete_eligible_at", { withTimezone: true }),
    version: integer("version").notNull().default(1),
    entitySnapshot: jsonb("entity_snapshot"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_theatre_soft_delete_lookup").on(
      table.theatreId,
      table.resourceType,
      table.isDeleted
    ),
  ]
);

// ------------------------------------------------------------------------------
// 4. DOMAIN SECURITY AUDIT EVENTS
// ------------------------------------------------------------------------------
export const theatreAuditEvents = pgTable(
  "theatre_security_audit_events",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 40 }).notNull(), // Can be 'circuit-wide' or UUID
    eventType: varchar("event_type", { length: 64 }).notNull(),
    resourceType: varchar("resource_type", { length: 64 }).notNull(),
    resourceId: varchar("resource_id", { length: 128 }).notNull(),
    userId: varchar("user_id", { length: 128 }).notNull(),
    userRole: varchar("user_role", { length: 64 }).notNull(),
    action: varchar("action", { length: 128 }).notNull(),
    module: varchar("module", { length: 64 }).notNull(),
    previousVersion: integer("previous_version"),
    currentVersion: integer("current_version"),
    diff: jsonb("diff"),
    ipPlaceholder: varchar("ip_placeholder", { length: 64 }),
    userAgentPlaceholder: text("user_agent_placeholder"),
    correlationId: varchar("correlation_id", { length: 128 }),
    metadata: jsonb("metadata"),
    timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_theatre_audit_events_theatre").on(table.theatreId, table.timestamp),
    index("idx_theatre_audit_events_type").on(table.eventType),
  ]
);

// ------------------------------------------------------------------------------
// 5. CHRONOLOGICAL ACTIVITY HISTORY
// ------------------------------------------------------------------------------
export const theatreActivityHistory = pgTable(
  "theatre_activity_history",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 40 }).notNull(),
    resourceType: varchar("resource_type", { length: 64 }).notNull(),
    resourceId: varchar("resource_id", { length: 128 }).notNull(),
    userId: varchar("user_id", { length: 128 }).notNull(),
    userName: varchar("user_name", { length: 128 }).notNull(),
    userRole: varchar("user_role", { length: 64 }).notNull(),
    action: varchar("action", { length: 128 }).notNull(),
    module: varchar("module", { length: 64 }).notNull(),
    previousVersionPlaceholder: integer("previous_version_placeholder"),
    currentVersionPlaceholder: integer("current_version_placeholder"),
    details: text("details").notNull(),
    metadata: jsonb("metadata"),
    timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_theatre_activity_history_theatre").on(table.theatreId, table.timestamp),
    index("idx_theatre_activity_history_module").on(table.module),
  ]
);

// ------------------------------------------------------------------------------
// 6. SECURITY POLICIES PLACEHOLDER REGISTRY
// ------------------------------------------------------------------------------
export const theatreSecurityPolicies = pgTable(
  "theatre_security_policies",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 40 }), // Nullable for platform global policies
    policyKey: varchar("policy_key", { length: 64 }).notNull(),
    description: text("description").notNull(),
    requiredRole: varchar("required_role", { length: 64 }).notNull(),
    customRuleDefinition: jsonb("custom_rule_definition"),
    isEnabled: boolean("is_enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_theatre_security_policies_key").on(table.policyKey),
  ]
);

// ------------------------------------------------------------------------------
// DRIZZLE RELATIONS
// ------------------------------------------------------------------------------
export const theatreSecurityConfigurationsRelations = relations(
  theatreSecurityConfigurations,
  ({ one }) => ({
    theatre: one(theatres, {
      fields: [theatreSecurityConfigurations.theatreId],
      references: [theatres.id],
    }),
  })
);

export const theatreResourceVersionsRelations = relations(
  theatreResourceVersions,
  ({ one }) => ({
    theatre: one(theatres, {
      fields: [theatreResourceVersions.theatreId],
      references: [theatres.id],
    }),
  })
);

export const theatreSoftDeleteRecordsRelations = relations(
  theatreSoftDeleteRecords,
  ({ one }) => ({
    theatre: one(theatres, {
      fields: [theatreSoftDeleteRecords.theatreId],
      references: [theatres.id],
    }),
  })
);
