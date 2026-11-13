import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { theatres } from "./theatres";
import {
  amenityStatusEnum,
  amenityAvailabilityModeEnum,
  amenityVisibilityEnum,
  amenityPriorityEnum,
  amenityEntityTypeEnum,
} from "./enums";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Amenities & Facilities Schema (Phase 3 – Part 5)
 * ==============================================================================
 * Centralized Amenity Catalog, Dynamic Categories, Reusable Theatre Assignments,
 * Facility Metadata & Version History.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Amenity Categories (Dynamic Categories Managed Globally)
// ------------------------------------------------------------------------------
export const amenityCategories = pgTable(
  "amenity_categories",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    code: varchar("code", { length: 60 }).notNull().unique(), // e.g. "accessibility", "comfort", "technology"
    name: varchar("name", { length: 120 }).notNull(),
    displayName: varchar("display_name", { length: 150 }).notNull(),
    description: text("description"),
    defaultIcon: varchar("default_icon", { length: 60 }).notNull().default("Sparkles"),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("amenity_categories_code_idx").on(table.code),
    index("amenity_categories_order_idx").on(table.displayOrder),
    index("amenity_categories_active_idx").on(table.isActive),
  ]
);

// ------------------------------------------------------------------------------
// 2. Reusable Centralized Amenity Catalog (Super Admin Managed)
// ------------------------------------------------------------------------------
export const amenityCatalog = pgTable(
  "amenity_catalog",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    code: varchar("code", { length: 80 }).notNull().unique(), // e.g. "dolby-atmos", "wheelchair-access"
    name: varchar("name", { length: 150 }).notNull(),
    displayName: varchar("display_name", { length: 180 }).notNull(),
    description: text("description"),
    categoryId: varchar("category_id", { length: 36 })
      .notNull()
      .references(() => amenityCategories.id, { onDelete: "restrict" }),
    categoryCode: varchar("category_code", { length: 60 }).notNull(),
    defaultIcon: varchar("default_icon", { length: 60 }).notNull().default("Sparkles"),
    customIconUrl: text("custom_icon_url"),
    svgPlaceholder: text("svg_placeholder"),
    iconLibraryPlaceholder: text("icon_library_placeholder"),
    priority: amenityPriorityEnum("priority").notNull().default("STANDARD"),
    isFeatured: boolean("is_featured").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    status: amenityStatusEnum("status").notNull().default("ACTIVE"),
    localizedNames: jsonb("localized_names").$type<Record<string, string>>().default({}),
    localizedDescriptions: jsonb("localized_descriptions").$type<Record<string, string>>().default({}),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("amenity_catalog_code_idx").on(table.code),
    index("amenity_catalog_category_idx").on(table.categoryId),
    index("amenity_catalog_category_code_idx").on(table.categoryCode),
    index("amenity_catalog_status_idx").on(table.status),
    index("amenity_catalog_priority_idx").on(table.priority),
    index("amenity_catalog_order_idx").on(table.displayOrder),
  ]
);

// ------------------------------------------------------------------------------
// 3. Theatre Amenity Assignments (Theatre-Level Customizations)
// ------------------------------------------------------------------------------
export const theatreAmenityAssignments = pgTable(
  "theatre_amenity_assignments",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    amenityId: varchar("amenity_id", { length: 36 })
      .notNull()
      .references(() => amenityCatalog.id, { onDelete: "cascade" }),
    availability: amenityAvailabilityModeEnum("availability").notNull().default("AVAILABLE"),
    notes: text("notes"),
    displayOrder: integer("display_order").notNull().default(0),
    visibility: amenityVisibilityEnum("visibility").notNull().default("PUBLIC"),
    status: amenityStatusEnum("status").notNull().default("ACTIVE"),
    isFeatured: boolean("is_featured").notNull().default(false),
    entityType: amenityEntityTypeEnum("entity_type").notNull().default("THEATRE"),
    entityId: varchar("entity_id", { length: 36 }).notNull(),
    assignedBy: varchar("assigned_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatre_amenity_unique_assignment_idx").on(
      table.theatreId,
      table.amenityId,
      table.entityType,
      table.entityId
    ),
    index("theatre_amenity_theatre_idx").on(table.theatreId),
    index("theatre_amenity_amenity_idx").on(table.amenityId),
    index("theatre_amenity_status_idx").on(table.status),
    index("theatre_amenity_visibility_idx").on(table.visibility),
    index("theatre_amenity_availability_idx").on(table.availability),
    index("theatre_amenity_order_idx").on(table.theatreId, table.displayOrder),
  ]
);

// ------------------------------------------------------------------------------
// 4. Facility Metadata (Specific Capacities, SSIDs, Access Details)
// ------------------------------------------------------------------------------
export const amenityMetadata = pgTable(
  "amenity_metadata",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreAmenityId: varchar("theatre_amenity_id", { length: 36 })
      .notNull()
      .references(() => theatreAmenityAssignments.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    parkingCapacity: integer("parking_capacity"),
    evChargerCount: integer("ev_charger_count"),
    wifiSsid: varchar("wifi_ssid", { length: 100 }),
    wifiAvailability: text("wifi_availability"),
    accessibilityNotes: text("accessibility_notes"),
    foodCourtInfo: text("food_court_info"),
    waitingAreaDetails: text("waiting_area_details"),
    customAttributes: jsonb("custom_attributes").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("amenity_metadata_assignment_idx").on(table.theatreAmenityId),
    index("amenity_metadata_theatre_idx").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 5. Amenity Version History (Point-in-Time Audit & Rollback Ledger)
// ------------------------------------------------------------------------------
export const amenityVersions = pgTable(
  "amenity_versions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    amenityId: varchar("amenity_id", { length: 36 }),
    theatreAmenityId: varchar("theatre_amenity_id", { length: 36 }),
    theatreId: varchar("theatre_id", { length: 36 }),
    versionNumber: integer("version_number").notNull(),
    changeType: varchar("change_type", { length: 60 }).notNull(),
    changeSummary: text("change_summary"),
    snapshot: jsonb("snapshot").notNull(),
    changedBy: varchar("changed_by", { length: 36 }),
    changedRole: varchar("changed_role", { length: 40 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("amenity_versions_catalog_idx").on(table.amenityId),
    index("amenity_versions_theatre_assignment_idx").on(table.theatreAmenityId),
    index("amenity_versions_theatre_idx").on(table.theatreId),
    index("amenity_versions_number_idx").on(table.versionNumber),
  ]
);
