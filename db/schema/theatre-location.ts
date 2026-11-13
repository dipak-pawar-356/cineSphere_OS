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
  theatreLocationStatusEnum,
  theatreLocationVerificationStatusEnum,
  theatreCoordinateSourceEnum,
} from "./enums";
import { theatres } from "./theatres";
import { users } from "./users";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Address & Location Management Schema (Phase 3 – Part 4)
 * ==============================================================================
 * Normalized location, geographic hierarchy, coordinates, navigation, and
 * geospatial readiness entities decoupled from core `theatres`:
 * Platform -> Theatre -> TheatreLocation (1:N for multi-location / multi-branch)
 *   ├── TheatreCoordinates (1:1)
 *   ├── TheatreGeoMetadata (1:1)
 *   └── TheatreLocationVersion (1:N immutable historical audit ledger)
 * ==============================================================================
 */

export interface GeoFencePolygonPoint {
  lat: number;
  lng: number;
}

export const theatreLocations = pgTable(
  "theatre_locations",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    locationName: varchar("location_name", { length: 150 })
      .notNull()
      .default("Main Complex"),
    isPrimary: boolean("is_primary").notNull().default(true),

    // Status & Versioning
    status: theatreLocationStatusEnum("status").notNull().default("DRAFT"),
    version: integer("version").notNull().default(1),

    // Structured Address Fields
    addressLine1: varchar("address_line1", { length: 255 }).notNull(),
    addressLine2: varchar("address_line2", { length: 255 }),
    area: varchar("area", { length: 120 }),
    city: varchar("city", { length: 100 }).notNull(),
    district: varchar("district", { length: 100 }),
    state: varchar("state", { length: 100 }).notNull(),
    country: varchar("country", { length: 100 }).notNull().default("India"),
    postalCode: varchar("postal_code", { length: 20 }).notNull(),
    landmark: varchar("landmark", { length: 200 }),
    locality: varchar("locality", { length: 120 }),
    neighbourhood: varchar("neighbourhood", { length: 120 }),

    // Denormalized Pre-Formatted Address Views
    displayAddress: varchar("display_address", { length: 350 }),
    formattedAddress: text("formatted_address"),

    // Google Maps & Navigation Links
    googleMapsUrl: text("google_maps_url"),
    placeId: varchar("place_id", { length: 120 }),
    mapEmbedUrl: text("map_embed_url"),
    mapShareLink: text("map_share_link"),
    navigationLink: text("navigation_link"),
    drivingDirectionsUrl: text("driving_directions_url"),
    walkingDirectionsUrl: text("walking_directions_url"),
    transitDirectionsUrl: text("transit_directions_url"),
    rideBookingUrl: text("ride_booking_url"),

    // Verification Governance (Scalability Enhancement 1)
    verificationStatus: theatreLocationVerificationStatusEnum("verification_status")
      .notNull()
      .default("UNVERIFIED"),
    verifiedBy: varchar("verified_by", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    verificationNotes: text("verification_notes"),
    rejectedReason: text("rejected_reason"),

    // Publication & Archival Governance
    publishedBy: varchar("published_by", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    archivedBy: varchar("archived_by", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    archivedReason: text("archived_reason"),

    // Audit Metadata
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
    index("theatre_locations_theatre_id_idx").on(table.theatreId),
    index("theatre_locations_status_idx").on(table.status),
    index("theatre_locations_verification_idx").on(table.verificationStatus),
    index("theatre_locations_city_idx").on(table.city),
    index("theatre_locations_state_idx").on(table.state),
    index("theatre_locations_postal_code_idx").on(table.postalCode),
    index("theatre_locations_primary_idx").on(table.theatreId, table.isPrimary),
  ]
);

export const theatreCoordinates = pgTable(
  "theatre_coordinates",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    locationId: varchar("location_id", { length: 36 })
      .notNull()
      .unique()
      .references(() => theatreLocations.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
    longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
    coordinateSource: theatreCoordinateSourceEnum("coordinate_source")
      .notNull()
      .default("MANUAL"),
    accuracyMeters: decimal("accuracy_meters", { precision: 8, scale: 2 }),
    geohash: varchar("geohash", { length: 16 }),
    spatialIndexPlaceholder: varchar("spatial_index_placeholder", { length: 100 }),
    elevationMeters: decimal("elevation_meters", { precision: 6, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatre_coordinates_location_id_idx").on(table.locationId),
    index("theatre_coordinates_theatre_id_idx").on(table.theatreId),
    index("theatre_coordinates_lat_lng_idx").on(table.latitude, table.longitude),
    index("theatre_coordinates_geohash_idx").on(table.geohash),
  ]
);

export const theatreGeoMetadata = pgTable(
  "theatre_geo_metadata",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    locationId: varchar("location_id", { length: 36 })
      .notNull()
      .unique()
      .references(() => theatreLocations.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    countryCode: varchar("country_code", { length: 3 }).notNull().default("IND"),
    stateCode: varchar("state_code", { length: 10 }).notNull().default("MH"),
    citySlug: varchar("city_slug", { length: 120 }),
    districtCode: varchar("district_code", { length: 30 }),
    timezone: varchar("timezone", { length: 50 }).notNull().default("Asia/Kolkata"),
    serviceRadiusKm: decimal("service_radius_km", { precision: 6, scale: 2 })
      .notNull()
      .default("15.00"),
    servedPostalCodes: jsonb("served_postal_codes")
      .$type<string[]>()
      .default([]),
    nearestLandmarkDistanceMeters: integer("nearest_landmark_distance_meters"),
    geoSearchKeywords: jsonb("geo_search_keywords")
      .$type<string[]>()
      .default([]),
    geoFencePolygonPlaceholder: jsonb("geo_fence_polygon_placeholder")
      .$type<GeoFencePolygonPoint[]>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatre_geo_metadata_location_id_idx").on(table.locationId),
    index("theatre_geo_metadata_theatre_id_idx").on(table.theatreId),
    index("theatre_geo_metadata_city_slug_idx").on(table.citySlug),
    index("theatre_geo_metadata_state_code_idx").on(table.stateCode),
  ]
);

export const theatreLocationVersions = pgTable(
  "theatre_location_versions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    locationId: varchar("location_id", { length: 36 })
      .notNull()
      .references(() => theatreLocations.id, { onDelete: "cascade" }),
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
    uniqueIndex("theatre_location_versions_unique_idx").on(
      table.locationId,
      table.versionNumber
    ),
    index("theatre_location_versions_location_id_idx").on(table.locationId),
    index("theatre_location_versions_theatre_id_idx").on(table.theatreId),
  ]
);
