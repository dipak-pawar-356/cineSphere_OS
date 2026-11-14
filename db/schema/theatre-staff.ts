import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { theatres } from "./theatres";
import {
  staffEmploymentStatusEnum,
  staffDepartmentTypeEnum,
  theatreRoleStatusEnum,
  staffRoleChangeTypeEnum,
} from "./enums";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Staff & Dynamic RBAC Schema (Phase 3 – Part 10)
 * ==============================================================================
 * Multi-tenant staff management and dynamic role-based access control.
 * Decouples platform role templates from tenant-owned role instances,
 * supporting independent custom roles, fine-grained permission assignments,
 * department structures, and future shift placeholders.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. ROLE TEMPLATES (Platform Catalog Templates)
// ------------------------------------------------------------------------------
export const roleTemplates = pgTable(
  "role_templates",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    templateCode: varchar("template_code", { length: 64 }).notNull().unique(),
    name: varchar("name", { length: 128 }).notNull(),
    category: varchar("category", { length: 64 }).notNull(), // OPERATIONS, MANAGEMENT, BOX_OFFICE, etc.
    description: text("description").notNull(),
    defaultPermissions: jsonb("default_permissions").$type<string[]>().notNull(),
    suggestedDepartment: varchar("suggested_department", { length: 64 }).notNull(),
    hierarchyLevel: integer("hierarchy_level").default(1).notNull(), // 1=Entry, 2=Senior, 3=Supervisor, 4=Manager, 5=Executive
    isPlatformStandard: boolean("is_platform_standard").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_role_templates_code").on(table.templateCode),
    index("idx_role_templates_category").on(table.category),
  ]
);

// ------------------------------------------------------------------------------
// 2. THEATRE ROLES (Tenant-Owned Role Instances & Custom Roles)
// ------------------------------------------------------------------------------
export const theatreRoles = pgTable(
  "theatre_roles",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 128 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    templateId: varchar("template_id", { length: 128 }).references(
      () => roleTemplates.id,
      { onDelete: "set null" }
    ),
    roleCode: varchar("role_code", { length: 64 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    description: text("description"),
    isCustom: boolean("is_custom").default(true).notNull(),
    isSystemDefault: boolean("is_system_default").default(false).notNull(),
    hierarchyLevel: integer("hierarchy_level").default(1).notNull(),
    status: theatreRoleStatusEnum("status").default("ACTIVE").notNull(),
    createdBy: varchar("created_by", { length: 128 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_theatre_roles_theatre").on(table.theatreId),
    index("idx_theatre_roles_code").on(table.theatreId, table.roleCode),
    index("idx_theatre_roles_status").on(table.theatreId, table.status),
  ]
);

// ------------------------------------------------------------------------------
// 3. THEATRE PERMISSIONS (Granular Role-Permission Mappings)
// ------------------------------------------------------------------------------
export const theatrePermissions = pgTable(
  "theatre_permissions",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 128 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    roleId: varchar("role_id", { length: 128 })
      .notNull()
      .references(() => theatreRoles.id, { onDelete: "cascade" }),
    permissionKey: varchar("permission_key", { length: 128 }).notNull(),
    module: varchar("module", { length: 64 }).notNull(),
    isGranted: boolean("is_granted").default(true).notNull(),
    grantedBy: varchar("granted_by", { length: 128 }),
    grantedAt: timestamp("granted_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_theatre_permissions_role").on(table.roleId),
    index("idx_theatre_permissions_theatre").on(table.theatreId),
    index("idx_theatre_permissions_lookup").on(
      table.theatreId,
      table.roleId,
      table.permissionKey
    ),
  ]
);

// ------------------------------------------------------------------------------
// 4. STAFF DEPARTMENTS (Tenant Organizational Units)
// ------------------------------------------------------------------------------
export const staffDepartments = pgTable(
  "staff_departments",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 128 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 64 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    departmentType: staffDepartmentTypeEnum("department_type")
      .default("OPERATIONS")
      .notNull(),
    description: text("description"),
    departmentHeadId: varchar("department_head_id", { length: 128 }),
    isCustom: boolean("is_custom").default(false).notNull(),
    status: varchar("status", { length: 32 }).default("ACTIVE").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_staff_departments_theatre").on(table.theatreId),
    index("idx_staff_departments_code").on(table.theatreId, table.code),
  ]
);

// ------------------------------------------------------------------------------
// 5. THEATRE STAFF (Staff Member Profile & Identity)
// ------------------------------------------------------------------------------
export const theatreStaff = pgTable(
  "theatre_staff",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 128 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    employeeCode: varchar("employee_code", { length: 64 }).notNull(),
    firstName: varchar("first_name", { length: 128 }).notNull(),
    lastName: varchar("last_name", { length: 128 }).notNull(),
    displayName: varchar("display_name", { length: 256 }).notNull(),
    email: varchar("email", { length: 256 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    avatarUrl: text("avatar_url"),
    designation: varchar("designation", { length: 128 }).notNull(),
    departmentId: varchar("department_id", { length: 128 }).references(
      () => staffDepartments.id,
      { onDelete: "set null" }
    ),
    employmentStatus: staffEmploymentStatusEnum("employment_status")
      .default("ACTIVE")
      .notNull(),
    joiningDate: timestamp("joining_date", { withTimezone: true }),
    resignationDate: timestamp("resignation_date", { withTimezone: true }),
    reportingManagerId: varchar("reporting_manager_id", { length: 128 }),
    emergencyContact: jsonb("emergency_contact").$type<{
      name?: string;
      relationship?: string;
      phone?: string;
    }>(),
    notes: text("notes"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdBy: varchar("created_by", { length: 128 }),
    updatedBy: varchar("updated_by", { length: 128 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_theatre_staff_theatre").on(table.theatreId),
    index("idx_theatre_staff_code").on(table.theatreId, table.employeeCode),
    index("idx_theatre_staff_email").on(table.email),
    index("idx_theatre_staff_status").on(table.theatreId, table.employmentStatus),
    index("idx_theatre_staff_dept").on(table.departmentId),
  ]
);

// ------------------------------------------------------------------------------
// 6. STAFF ROLE ASSIGNMENTS (Many-to-Many Staff Roles)
// ------------------------------------------------------------------------------
export const staffRoleAssignments = pgTable(
  "staff_role_assignments",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 128 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    staffId: varchar("staff_id", { length: 128 })
      .notNull()
      .references(() => theatreStaff.id, { onDelete: "cascade" }),
    roleId: varchar("role_id", { length: 128 })
      .notNull()
      .references(() => theatreRoles.id, { onDelete: "cascade" }),
    isPrimary: boolean("is_primary").default(true).notNull(),
    assignedBy: varchar("assigned_by", { length: 128 }),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }), // Temporary assignment placeholder
  },
  (table) => [
    index("idx_staff_role_assignments_staff").on(table.staffId),
    index("idx_staff_role_assignments_role").on(table.roleId),
    index("idx_staff_role_assignments_theatre").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 7. STAFF ROLE HISTORY (Audit Trail of Role Transitions)
// ------------------------------------------------------------------------------
export const staffRoleHistory = pgTable(
  "staff_role_history",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 128 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    staffId: varchar("staff_id", { length: 128 })
      .notNull()
      .references(() => theatreStaff.id, { onDelete: "cascade" }),
    previousRoleId: varchar("previous_role_id", { length: 128 }),
    newRoleId: varchar("new_role_id", { length: 128 }).notNull(),
    changeType: staffRoleChangeTypeEnum("change_type")
      .default("ASSIGNED")
      .notNull(),
    reason: text("reason"),
    changedBy: varchar("changed_by", { length: 128 }).notNull(),
    changedRole: varchar("changed_role", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_staff_role_history_staff").on(table.staffId),
    index("idx_staff_role_history_theatre").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 8. FUTURE SHIFT & SCHEDULING PLACEHOLDERS
// ------------------------------------------------------------------------------
export const futureShiftPlaceholders = pgTable(
  "future_shift_placeholders",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 128 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    staffId: varchar("staff_id", { length: 128 })
      .notNull()
      .references(() => theatreStaff.id, { onDelete: "cascade" }),
    shiftType: varchar("shift_type", { length: 64 }).notNull(),
    scheduleData: jsonb("schedule_data").$type<Record<string, unknown>>(),
    attendanceConfig: jsonb("attendance_config").$type<Record<string, unknown>>(),
    leavePolicyConfig: jsonb("leave_policy_config").$type<Record<string, unknown>>(),
    biometricMapping: jsonb("biometric_mapping").$type<Record<string, unknown>>(),
    payrollTier: varchar("payroll_tier", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_future_shifts_staff").on(table.staffId),
    index("idx_future_shifts_theatre").on(table.theatreId),
  ]
);

// ==============================================================================
// RELATIONS
// ==============================================================================

export const roleTemplatesRelations = relations(roleTemplates, ({ many }) => ({
  theatreRoles: many(theatreRoles),
}));

export const theatreRolesRelations = relations(theatreRoles, ({ one, many }) => ({
  theatre: one(theatres, {
    fields: [theatreRoles.theatreId],
    references: [theatres.id],
  }),
  template: one(roleTemplates, {
    fields: [theatreRoles.templateId],
    references: [roleTemplates.id],
  }),
  permissions: many(theatrePermissions),
  assignments: many(staffRoleAssignments),
}));

export const theatrePermissionsRelations = relations(theatrePermissions, ({ one }) => ({
  theatre: one(theatres, {
    fields: [theatrePermissions.theatreId],
    references: [theatres.id],
  }),
  role: one(theatreRoles, {
    fields: [theatrePermissions.roleId],
    references: [theatreRoles.id],
  }),
}));

export const staffDepartmentsRelations = relations(staffDepartments, ({ one, many }) => ({
  theatre: one(theatres, {
    fields: [staffDepartments.theatreId],
    references: [theatres.id],
  }),
  staffMembers: many(theatreStaff),
}));

export const theatreStaffRelations = relations(theatreStaff, ({ one, many }) => ({
  theatre: one(theatres, {
    fields: [theatreStaff.theatreId],
    references: [theatres.id],
  }),
  department: one(staffDepartments, {
    fields: [theatreStaff.departmentId],
    references: [staffDepartments.id],
  }),
  roleAssignments: many(staffRoleAssignments),
  roleHistory: many(staffRoleHistory),
  futureShifts: many(futureShiftPlaceholders),
}));

export const staffRoleAssignmentsRelations = relations(staffRoleAssignments, ({ one }) => ({
  theatre: one(theatres, {
    fields: [staffRoleAssignments.theatreId],
    references: [theatres.id],
  }),
  staff: one(theatreStaff, {
    fields: [staffRoleAssignments.staffId],
    references: [theatreStaff.id],
  }),
  role: one(theatreRoles, {
    fields: [staffRoleAssignments.roleId],
    references: [theatreRoles.id],
  }),
}));

export const staffRoleHistoryRelations = relations(staffRoleHistory, ({ one }) => ({
  theatre: one(theatres, {
    fields: [staffRoleHistory.theatreId],
    references: [theatres.id],
  }),
  staff: one(theatreStaff, {
    fields: [staffRoleHistory.staffId],
    references: [theatreStaff.id],
  }),
}));

export const futureShiftPlaceholdersRelations = relations(futureShiftPlaceholders, ({ one }) => ({
  theatre: one(theatres, {
    fields: [futureShiftPlaceholders.theatreId],
    references: [theatres.id],
  }),
  staff: one(theatreStaff, {
    fields: [futureShiftPlaceholders.staffId],
    references: [theatreStaff.id],
  }),
}));
