import {
  pgTable,
  varchar,
  boolean,
  integer,
  text,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { theatres } from "./theatres";
import {
  HallDesignerExtensionCategory,
  EnterpriseFeatureKey,
  LodPlaceholderConfig,
} from "@/types/enterprise-hall-designer.types";

/**
 * ==============================================================================
 * CineSphere OS — Enterprise Hall Designer Schema (Phase 4 – Part 16)
 * ==============================================================================
 * Database persistence models for Enterprise Features, Extension Registry,
 * Per-Theatre Enterprise Configuration, 3D WebGL/Three.js Settings, and
 * Real-Time Collaborative Editing Configuration.
 * ==============================================================================
 */

// 1. Enterprise Features Catalog (Platform-Wide Feature Definitions)
export const enterpriseFeatures = pgTable(
  "enterprise_features",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    featureKey: varchar("feature_key", { length: 64 })
      .$type<EnterpriseFeatureKey>()
      .notNull()
      .unique(),
    displayName: varchar("display_name", { length: 150 }).notNull(),
    category: varchar("category", { length: 48 })
      .$type<HallDesignerExtensionCategory>()
      .notNull(),
    description: text("description").notNull(),
    maturityStage: varchar("maturity_stage", { length: 32 })
      .$type<"FOUNDATION_READY" | "BETA_PLACEHOLDER" | "FUTURE_ROADMAP">()
      .notNull()
      .default("FOUNDATION_READY"),
    requiresGpuAcceleration: boolean("requires_gpu_acceleration").notNull().default(false),
    defaultEnabled: boolean("default_enabled").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("enterprise_features_key_uq").on(table.featureKey),
    index("enterprise_features_category_idx").on(table.category),
  ]
);

// 2. Extension Registry (Plugin-Based Extension Manifests)
export const extensionRegistry = pgTable(
  "extension_registry",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    key: varchar("key", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 150 }).notNull(),
    version: varchar("version", { length: 32 }).notNull().default("1.0.0"),
    category: varchar("category", { length: 48 })
      .$type<HallDesignerExtensionCategory>()
      .notNull(),
    description: text("description").notNull(),
    provider: varchar("provider", { length: 120 }).notNull().default("CineSphere Core"),
    requiredFeatureKeys: jsonb("required_feature_keys")
      .$type<EnterpriseFeatureKey[]>()
      .notNull()
      .default([]),
    supportedCapabilities: jsonb("supported_capabilities")
      .$type<string[]>()
      .notNull()
      .default([]),
    status: varchar("status", { length: 24 })
      .$type<"REGISTERED" | "ACTIVE" | "DISABLED" | "DEPRECATED">()
      .notNull()
      .default("REGISTERED"),
    isBuiltInPlaceholder: boolean("is_built_in_placeholder").notNull().default(true),
    configSchemaVersion: varchar("config_schema_version", { length: 16 }).notNull().default("1.0"),
    registeredBy: varchar("registered_by", { length: 100 }).notNull(),
    registeredAt: timestamp("registered_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("extension_registry_key_uq").on(table.key),
    index("extension_registry_category_idx").on(table.category),
    index("extension_registry_status_idx").on(table.status),
  ]
);

// 3. Enterprise Configuration (Per-Theatre Enterprise Capability Toggles)
export const enterpriseConfigurations = pgTable(
  "enterprise_configurations",
  {
    theatreId: varchar("theatre_id", { length: 36 })
      .primaryKey()
      .references(() => theatres.id, { onDelete: "cascade" }),
    enabledFeatures: jsonb("enabled_features")
      .$type<Record<EnterpriseFeatureKey, boolean>>()
      .notNull(),
    multiLevelConfig: jsonb("multi_level_config")
      .$type<{
        enabled: boolean;
        maxSupportedFloors: number;
        balconyDesignEnabled: boolean;
        skyBoxDesignEnabled: boolean;
        vipLoungeDesignEnabled: boolean;
      }>()
      .notNull(),
    performanceConfig: jsonb("performance_config")
      .$type<{
        gpuRenderingReady: boolean;
        backgroundWorkerPoolPlaceholder: boolean;
        streamingAssetsEnabled: boolean;
        incrementalLoadingEnabled: boolean;
        sceneGraphCacheTtlSeconds: number;
      }>()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// 4. ThreeD Configuration (Per-Theatre 3D / WebGL / Three.js Engine Settings)
export const threeDConfigurations = pgTable(
  "three_d_configurations",
  {
    theatreId: varchar("theatre_id", { length: 36 })
      .primaryKey()
      .references(() => theatres.id, { onDelete: "cascade" }),
    renderingBackend: varchar("rendering_backend", { length: 32 })
      .$type<"WEBGL2" | "WEBGPU_PLACEHOLDER" | "CANVAS_2D_FALLBACK">()
      .notNull()
      .default("WEBGL2"),
    defaultCameraPreset: varchar("default_camera_preset", { length: 32 })
      .notNull()
      .default("ORBIT_OVERVIEW"),
    shadowsEnabled: boolean("shadows_enabled").notNull().default(true),
    antiAliasingEnabled: boolean("anti_aliasing_enabled").notNull().default(true),
    maxTargetFps: integer("max_target_fps").notNull().default(60),
    lodConfig: jsonb("lod_config").$type<LodPlaceholderConfig>().notNull(),
    streamingAssetsEnabled: boolean("streaming_assets_enabled").notNull().default(true),
    assetCdnBaseUrlPlaceholder: varchar("asset_cdn_base_url_placeholder", { length: 255 }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// 5. Collaboration Configuration (Per-Theatre Real-Time Presence & Merge Settings)
export const collaborationConfigurations = pgTable(
  "collaboration_configurations",
  {
    theatreId: varchar("theatre_id", { length: 36 })
      .primaryKey()
      .references(() => theatres.id, { onDelete: "cascade" }),
    enabled: boolean("enabled").notNull().default(false),
    livePresenceEnabled: boolean("live_presence_enabled").notNull().default(true),
    cursorSharingEnabled: boolean("cursor_sharing_enabled").notNull().default(true),
    maxConcurrentEditors: integer("max_concurrent_editors").notNull().default(8),
    conflictStrategy: varchar("conflict_strategy", { length: 40 })
      .$type<"CRDT_MERGE_PLACEHOLDER" | "OPTIMISTIC_LOCK" | "SECTION_LOCKING">()
      .notNull()
      .default("CRDT_MERGE_PLACEHOLDER"),
    presenceTransportPlaceholder: varchar("presence_transport_placeholder", { length: 40 })
      .$type<"WEBSOCKET_CLUSTER" | "WEBRTC_MESH">()
      .notNull()
      .default("WEBSOCKET_CLUSTER"),
    autoVersionMergePlaceholder: boolean("auto_version_merge_placeholder").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  }
);
