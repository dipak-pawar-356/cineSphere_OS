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
  contactChannelTypeEnum,
  contactRoleEnum,
  contactAvailabilityModeEnum,
  contactVerificationStatusEnum,
  contactVisibilityEnum,
  contactStatusEnum,
  contactEntityTypeEnum,
  theatreSocialPlatformEnum,
} from "./enums";
import { theatres } from "./theatres";
import { users } from "./users";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Contact Management Schema (Phase 3 – Part 6)
 * ==============================================================================
 * Multi-channel directory & role-based communication entities:
 * Platform -> Theatre -> Theatre Contact Directory ->
 *   - TheatrePhone
 *   - TheatreEmail
 *   - TheatreWebsite
 *   - TheatreContactSocialLink
 *   - TheatreEmergencyContact
 *   - TheatreManagerContact
 *   - TheatreContactVersion
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Root Directory Entity: Theatre Contact
// ------------------------------------------------------------------------------
export const theatreContacts = pgTable(
  "theatre_contacts",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => `cnt-${crypto.randomUUID()}`),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),

    channelType: contactChannelTypeEnum("channel_type").notNull(),
    contactRole: contactRoleEnum("contact_role").notNull(),

    title: varchar("title", { length: 150 }).notNull(),
    description: text("description"),

    isPrimary: boolean("is_primary").notNull().default(false),
    visibility: contactVisibilityEnum("visibility").notNull().default("PUBLIC"),
    availabilityMode: contactAvailabilityModeEnum("availability_mode")
      .notNull()
      .default("STANDARD_BUSINESS_HOURS"),
    businessHours: varchar("business_hours", { length: 255 }),

    verificationStatus: contactVerificationStatusEnum("verification_status")
      .notNull()
      .default("UNVERIFIED"),
    status: contactStatusEnum("status").notNull().default("ACTIVE"),
    displayOrder: integer("display_order").notNull().default(1),

    // Reusable Contact Model: Generic entity mapping
    entityType: contactEntityTypeEnum("entity_type").notNull().default("THEATRE"),
    entityId: varchar("entity_id", { length: 36 }),

    version: integer("version").notNull().default(1),

    createdBy: varchar("created_by", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),
    updatedBy: varchar("updated_by", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),
    verifiedBy: varchar("verified_by", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_contacts_theatre_id_idx").on(table.theatreId),
    index("theatre_contacts_channel_type_idx").on(table.theatreId, table.channelType),
    index("theatre_contacts_role_idx").on(table.theatreId, table.contactRole),
    index("theatre_contacts_primary_idx").on(table.theatreId, table.isPrimary),
    index("theatre_contacts_status_idx").on(table.theatreId, table.status),
    index("theatre_contacts_visibility_idx").on(table.theatreId, table.visibility),
  ]
);

// ------------------------------------------------------------------------------
// 2. Child Entity: Phone Numbers
// ------------------------------------------------------------------------------
export const theatrePhones = pgTable(
  "theatre_phones",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => `phn-${crypto.randomUUID()}`),
    contactId: varchar("contact_id", { length: 36 })
      .notNull()
      .references(() => theatreContacts.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),

    countryCode: varchar("country_code", { length: 10 }).notNull().default("+91"),
    phoneNumber: varchar("phone_number", { length: 30 }).notNull(),
    extension: varchar("extension", { length: 20 }),
    phoneType: varchar("phone_type", { length: 50 }).notNull().default("MOBILE"),

    isPrimary: boolean("is_primary").notNull().default(false),
    isSmsEnabled: boolean("is_sms_enabled").notNull().default(false),
    isWhatsappEnabled: boolean("is_whatsapp_enabled").notNull().default(false),
    isVerified: boolean("is_verified").notNull().default(false),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_phones_contact_id_idx").on(table.contactId),
    index("theatre_phones_theatre_id_idx").on(table.theatreId),
    index("theatre_phones_primary_idx").on(table.theatreId, table.isPrimary),
  ]
);

// ------------------------------------------------------------------------------
// 3. Child Entity: Email Addresses
// ------------------------------------------------------------------------------
export const theatreEmails = pgTable(
  "theatre_emails",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => `eml-${crypto.randomUUID()}`),
    contactId: varchar("contact_id", { length: 36 })
      .notNull()
      .references(() => theatreContacts.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),

    email: varchar("email", { length: 255 }).notNull(),
    emailType: varchar("email_type", { length: 50 }).notNull().default("SUPPORT"),
    department: varchar("department", { length: 100 }),

    isPrimary: boolean("is_primary").notNull().default(false),
    isVerified: boolean("is_verified").notNull().default(false),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_emails_contact_id_idx").on(table.contactId),
    index("theatre_emails_theatre_id_idx").on(table.theatreId),
    index("theatre_emails_primary_idx").on(table.theatreId, table.isPrimary),
  ]
);

// ------------------------------------------------------------------------------
// 4. Child Entity: Websites & Web Portals
// ------------------------------------------------------------------------------
export const theatreWebsites = pgTable(
  "theatre_websites",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => `web-${crypto.randomUUID()}`),
    contactId: varchar("contact_id", { length: 36 })
      .notNull()
      .references(() => theatreContacts.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),

    url: text("url").notNull(),
    websiteType: varchar("website_type", { length: 50 }).notNull().default("OFFICIAL"),
    title: varchar("title", { length: 150 }),

    isPrimary: boolean("is_primary").notNull().default(false),
    isVerified: boolean("is_verified").notNull().default(false),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_websites_contact_id_idx").on(table.contactId),
    index("theatre_websites_theatre_id_idx").on(table.theatreId),
    index("theatre_websites_primary_idx").on(table.theatreId, table.isPrimary),
  ]
);

// ------------------------------------------------------------------------------
// 5. Child Entity: Social Media Presence Links
// ------------------------------------------------------------------------------
export const theatreContactSocialLinks = pgTable(
  "theatre_contact_social_links",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => `soc-${crypto.randomUUID()}`),
    contactId: varchar("contact_id", { length: 36 })
      .notNull()
      .references(() => theatreContacts.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),

    platform: theatreSocialPlatformEnum("platform").notNull(),
    customPlatform: varchar("custom_platform", { length: 80 }),
    url: text("url").notNull(),
    handle: varchar("handle", { length: 100 }),

    displayOrder: integer("display_order").notNull().default(1),
    status: contactStatusEnum("status").notNull().default("ACTIVE"),
    isVerified: boolean("is_verified").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_contact_social_contact_id_idx").on(table.contactId),
    index("theatre_contact_social_theatre_id_idx").on(table.theatreId),
    index("theatre_contact_social_platform_idx").on(table.platform),
  ]
);

// ------------------------------------------------------------------------------
// 6. Child Entity: Emergency Contacts
// ------------------------------------------------------------------------------
export const theatreEmergencyContacts = pgTable(
  "theatre_emergency_contacts",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => `emg-${crypto.randomUUID()}`),
    contactId: varchar("contact_id", { length: 36 })
      .notNull()
      .references(() => theatreContacts.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),

    contactPersonName: varchar("contact_person_name", { length: 150 }).notNull(),
    roleOrDesignation: varchar("role_or_designation", { length: 120 }).notNull(),
    primaryPhone: varchar("primary_phone", { length: 40 }).notNull(),
    alternatePhone: varchar("alternate_phone", { length: 40 }),
    availabilityHours: varchar("availability_hours", { length: 120 })
      .notNull()
      .default("24/7 Priority Emergency Line"),
    emergencyType: varchar("emergency_type", { length: 80 })
      .notNull()
      .default("MEDICAL_FIRE_SAFETY"),
    operatingProcedures: text("operating_procedures"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_emergency_contact_id_idx").on(table.contactId),
    index("theatre_emergency_theatre_id_idx").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 7. Child Entity: Duty & General Managers
// ------------------------------------------------------------------------------
export const theatreManagerContacts = pgTable(
  "theatre_manager_contacts",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => `mgr-${crypto.randomUUID()}`),
    contactId: varchar("contact_id", { length: 36 })
      .notNull()
      .references(() => theatreContacts.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),

    managerName: varchar("manager_name", { length: 150 }).notNull(),
    designation: varchar("designation", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    department: varchar("department", { length: 100 }).notNull().default("Operations"),
    shiftHours: varchar("shift_hours", { length: 100 }),
    escalationTier: integer("escalation_tier").notNull().default(1),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_manager_contact_id_idx").on(table.contactId),
    index("theatre_manager_theatre_id_idx").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 8. Immutable Version Snapshot Ledger
// ------------------------------------------------------------------------------
export const theatreContactVersions = pgTable(
  "theatre_contact_versions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => `cnt-ver-${crypto.randomUUID()}`),
    contactId: varchar("contact_id", { length: 36 }),
    theatreId: varchar("theatre_id", { length: 36 }),
    versionNumber: integer("version_number").notNull(),
    changeType: varchar("change_type", { length: 50 }).notNull(),
    changeSummary: text("change_summary"),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
    changedBy: varchar("changed_by", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),
    changedRole: varchar("changed_role", { length: 40 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_contact_versions_contact_id_idx").on(table.contactId),
    index("theatre_contact_versions_theatre_id_idx").on(table.theatreId),
  ]
);
