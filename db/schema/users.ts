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
import { userRoleEnum, userStatusEnum } from "./enums";

/**
 * ==============================================================================
 * CineSphere OS - Core Users & RBAC Schema
 * Strongly typed identity and permission model mapped to Clerk and PostgreSQL
 * ==============================================================================
 */

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clerkId: varchar("clerk_id", { length: 128 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    phone: varchar("phone", { length: 20 }),
    phoneVerified: boolean("phone_verified").notNull().default(false),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    displayName: varchar("display_name", { length: 200 }),
    avatarUrl: text("avatar_url"),
    role: userRoleEnum("role").notNull().default("CUSTOMER"),
    theatreId: varchar("theatre_id", { length: 36 }), // Isolated Tenant ID (Null for Super Admin & Global Customers)
    status: userStatusEnum("status").notNull().default("ACTIVE"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_clerk_id_idx").on(table.clerkId),
    uniqueIndex("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
    index("users_theatre_id_idx").on(table.theatreId),
    index("users_status_idx").on(table.status),
    index("users_is_deleted_idx").on(table.isDeleted),
  ]
);

export const roles = pgTable(
  "roles",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    hierarchyLevel: integer("hierarchy_level").notNull().default(10), // 100: SuperAdmin, 80: TheatreAdmin, 60: HallManager, 40: Staff, 10: Customer
    isSystem: boolean("is_system").notNull().default(false),
    theatreId: varchar("theatre_id", { length: 36 }), // Null for system roles, populated for tenant-defined custom roles
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("roles_slug_idx").on(table.slug),
    index("roles_hierarchy_level_idx").on(table.hierarchyLevel),
    index("roles_theatre_id_idx").on(table.theatreId),
  ]
);

export const permissions = pgTable(
  "permissions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    code: varchar("code", { length: 100 }).notNull().unique(), // e.g. "movies.create", "shows.publish", "theatres.settings"
    name: varchar("name", { length: 150 }).notNull(),
    module: varchar("module", { length: 50 }).notNull(), // e.g. "movies", "theatres", "shows", "bookings", "finance", "audit"
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("permissions_code_idx").on(table.code),
    index("permissions_module_idx").on(table.module),
  ]
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    roleId: varchar("role_id", { length: 36 })
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: varchar("permission_id", { length: 36 })
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("role_permissions_role_perm_idx").on(table.roleId, table.permissionId),
    index("role_permissions_role_id_idx").on(table.roleId),
    index("role_permissions_permission_id_idx").on(table.permissionId),
  ]
);

export const userRoles = pgTable(
  "user_roles",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: varchar("role_id", { length: 36 })
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 }), // Tenant boundary (Null if system-wide)
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
    assignedBy: varchar("assigned_by", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
  },
  (table) => [
    uniqueIndex("user_roles_user_role_theatre_idx").on(table.userId, table.roleId, table.theatreId),
    index("user_roles_user_id_idx").on(table.userId),
    index("user_roles_role_id_idx").on(table.roleId),
    index("user_roles_theatre_id_idx").on(table.theatreId),
  ]
);

