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
  theatreStatusEnum,
  theatreApprovalStatusEnum,
  pricingTierEnum,
  loyaltyTierEnum,
  staffShiftEnum,
  staffStatusEnum,
} from "./enums";
import { users } from "./users";
import { countries, states, cities } from "./geo";

/**
 * ==============================================================================
 * CineSphere OS - Multi-Tenant Theatres & Staffing Hierarchy
 * Isolated Tenant entity root and specialized operational actor profiles
 * ==============================================================================
 */

export const theatres = pgTable(
  "theatres",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: varchar("slug", { length: 150 }).notNull().unique(),
    name: varchar("name", { length: 150 }).notNull(),
    chain: varchar("chain", { length: 100 }),
    code: varchar("code", { length: 30 }).unique(),
    tagline: varchar("tagline", { length: 255 }),
    description: text("description"),
    logo: text("logo").notNull(),
    banner: text("banner").notNull(),
    address: text("address").notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    cityId: varchar("city_id", { length: 36 }).references(() => cities.id, { onDelete: "set null" }),
    state: varchar("state", { length: 100 }).notNull(),
    stateId: varchar("state_id", { length: 36 }).references(() => states.id, { onDelete: "set null" }),
    pinCode: varchar("pin_code", { length: 20 }),
    country: varchar("country", { length: 100 }).notNull().default("India"),
    countryId: varchar("country_id", { length: 36 }).references(() => countries.id, { onDelete: "set null" }),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    contactNumber: varchar("contact_number", { length: 30 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    gstNumber: varchar("gst_number", { length: 30 }),
    amenities: jsonb("amenities").$type<string[]>().default([]),
    facilities: jsonb("facilities").$type<string[]>().default([]),
    pricingTier: pricingTierEnum("pricing_tier").notNull().default("STANDARD"),
    status: theatreStatusEnum("status").notNull().default("ACTIVE"),
    timezone: varchar("timezone", { length: 50 }).notNull().default("Asia/Kolkata"),
    currency: varchar("currency", { length: 10 }).notNull().default("INR"),
    openingTime: varchar("opening_time", { length: 20 }).default("08:00 AM"),
    closingTime: varchar("closing_time", { length: 20 }).default("01:30 AM"),
    isFeatured: boolean("is_featured").notNull().default(false),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("4.50"),
    reviewsCount: integer("reviews_count").default(0),
    hallCount: integer("hall_count").notNull().default(0),
    brandColors: jsonb("brand_colors").$type<{
      primary: string;
      secondary: string;
      accent: string;
    }>(),
    bookingTerms: jsonb("booking_terms").$type<string[]>().default([]),
    cancellationRules: jsonb("cancellation_rules").$type<string[]>().default([]),
    refundRules: jsonb("refund_rules").$type<string[]>().default([]),
    publicId: varchar("public_id", { length: 32 }).unique(),
    approvalStatus: theatreApprovalStatusEnum("approval_status").notNull().default("APPROVED"),
    version: integer("version").notNull().default(1),
    createdBy: varchar("created_by", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
    suspendedAt: timestamp("suspended_at", { withTimezone: true }),
    suspendedBy: varchar("suspended_by", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
    suspensionReason: text("suspension_reason"),
    suspensionEndTime: timestamp("suspension_end_time", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    archivedBy: varchar("archived_by", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    deletedBy: varchar("deleted_by", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
    deleteReason: text("delete_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatres_slug_idx").on(table.slug),
    uniqueIndex("theatres_public_id_idx").on(table.publicId),
    index("theatres_city_idx").on(table.city),
    index("theatres_state_idx").on(table.state),
    index("theatres_status_idx").on(table.status),
    index("theatres_approval_status_idx").on(table.approvalStatus),
    index("theatres_pricing_tier_idx").on(table.pricingTier),
    index("theatres_is_deleted_idx").on(table.isDeleted),
  ]
);

export const amenities = pgTable(
  "amenities",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 150 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(), // Projection, Audio, Seating, Food & Concessions, Convenience
    icon: varchar("icon", { length: 50 }),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("amenities_slug_idx").on(table.slug),
    index("amenities_category_idx").on(table.category),
  ]
);

export const theatreAmenities = pgTable(
  "theatre_amenities",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    amenityId: varchar("amenity_id", { length: 36 })
      .notNull()
      .references(() => amenities.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatre_amenities_th_amenity_idx").on(table.theatreId, table.amenityId),
    index("theatre_amenities_theatre_id_idx").on(table.theatreId),
    index("theatre_amenities_amenity_id_idx").on(table.amenityId),
  ]
);

export const theatreAdmins = pgTable(
  "theatre_admins",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    designation: varchar("designation", { length: 100 }).default("General Manager"),
    permissionsOverride: jsonb("permissions_override").$type<string[]>().default([]),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatre_admins_theatre_user_idx").on(table.theatreId, table.userId),
    index("theatre_admins_theatre_id_idx").on(table.theatreId),
    index("theatre_admins_user_id_idx").on(table.userId),
  ]
);

export const hallManagers = pgTable(
  "hall_managers",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    shift: staffShiftEnum("shift").notNull().default("MORNING"),
    assignedHalls: jsonb("assigned_halls").$type<string[]>().default([]),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("hall_managers_theatre_user_idx").on(table.theatreId, table.userId),
    index("hall_managers_theatre_id_idx").on(table.theatreId),
    index("hall_managers_user_id_idx").on(table.userId),
  ]
);

export const staff = pgTable(
  "staff",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    employeeCode: varchar("employee_code", { length: 50 }).notNull(),
    designation: varchar("designation", { length: 100 }).notNull(),
    role: varchar("role", { length: 50 }).notNull().default("Ticket Counter Staff"),
    assignedHall: varchar("assigned_hall", { length: 100 }),
    shift: staffShiftEnum("shift").notNull().default("MORNING"),
    status: staffStatusEnum("status").notNull().default("ON_DUTY"),
    joiningDate: timestamp("joining_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("staff_theatre_employee_code_idx").on(table.theatreId, table.employeeCode),
    index("staff_theatre_id_idx").on(table.theatreId),
    index("staff_user_id_idx").on(table.userId),
    index("staff_status_idx").on(table.status),
  ]
);

export const customers = pgTable(
  "customers",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    loyaltyTier: loyaltyTierEnum("loyalty_tier").notNull().default("STANDARD"),
    totalBookings: integer("total_bookings").notNull().default(0),
    totalSpent: decimal("total_spent", { precision: 12, scale: 2 }).notNull().default("0.00"),
    lastBookingDate: timestamp("last_booking_date", { withTimezone: true }),
    preferredGenre: varchar("preferred_genre", { length: 50 }),
    preferredLanguage: varchar("preferred_language", { length: 50 }),
    preferredCity: varchar("preferred_city", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("customers_user_id_idx").on(table.userId),
    index("customers_loyalty_tier_idx").on(table.loyaltyTier),
  ]
);

/**
 * ==============================================================================
 * Theatre Lifecycle Governance Entities (Phase 3 - Part 1)
 * Supports State Machine enforcement, Approval Workflows, Status History & Slugs
 * ==============================================================================
 */

export const theatreLifecycle = pgTable(
  "theatre_lifecycle",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .unique()
      .references(() => theatres.id, { onDelete: "cascade" }),
    currentState: theatreStatusEnum("current_state").notNull().default("DRAFT"),
    previousState: theatreStatusEnum("previous_state"),
    approvalState: theatreApprovalStatusEnum("approval_state").notNull().default("PENDING"),
    allowBookings: boolean("allow_bookings").notNull().default(false),
    allowShows: boolean("allow_shows").notNull().default(false),
    allowPayments: boolean("allow_payments").notNull().default(false),
    isReadOnly: boolean("is_read_only").notNull().default(false),
    defaultConfiguration: jsonb("default_configuration").$type<Record<string, unknown>>().default({}),
    lastTransitionAt: timestamp("last_transition_at", { withTimezone: true }).defaultNow().notNull(),
    lastTransitionBy: varchar("last_transition_by", { length: 36 })
      .references(() => users.id, { onDelete: "set null" }),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatre_lifecycle_theatre_idx").on(table.theatreId),
    index("theatre_lifecycle_state_idx").on(table.currentState),
    index("theatre_lifecycle_approval_idx").on(table.approvalState),
  ]
);

export const theatreStatusHistory = pgTable(
  "theatre_status_history",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    fromStatus: theatreStatusEnum("from_status"),
    toStatus: theatreStatusEnum("to_status").notNull(),
    reason: text("reason"),
    changedBy: varchar("changed_by", { length: 36 })
      .references(() => users.id, { onDelete: "set null" }),
    changedByRole: varchar("changed_by_role", { length: 50 }).notNull().default("SUPER_ADMIN"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_status_history_theatre_idx").on(table.theatreId),
    index("theatre_status_history_to_status_idx").on(table.toStatus),
    index("theatre_status_history_created_at_idx").on(table.createdAt),
  ]
);

export const theatreApprovals = pgTable(
  "theatre_approvals",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    status: theatreApprovalStatusEnum("status").notNull().default("PENDING"),
    approverId: varchar("approver_id", { length: 36 })
      .references(() => users.id, { onDelete: "set null" }),
    approverName: varchar("approver_name", { length: 150 }),
    comments: text("comments"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_approvals_theatre_idx").on(table.theatreId),
    index("theatre_approvals_status_idx").on(table.status),
    index("theatre_approvals_created_at_idx").on(table.createdAt),
  ]
);

export const theatreSlugHistory = pgTable(
  "theatre_slug_history",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    oldSlug: varchar("old_slug", { length: 150 }).notNull(),
    newSlug: varchar("new_slug", { length: 150 }).notNull(),
    changedBy: varchar("changed_by", { length: 36 })
      .references(() => users.id, { onDelete: "set null" }),
    redirectEnabled: boolean("redirect_enabled").notNull().default(true), // Future SEO 301 redirect placeholder
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_slug_history_theatre_idx").on(table.theatreId),
    index("theatre_slug_history_old_slug_idx").on(table.oldSlug),
  ]
);


