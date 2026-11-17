import { z } from "zod";

/**
 * ==============================================================================
 * CineSphere OS — Enterprise Hall Designer Validation Schemas (Phase 4 – Part 16)
 * ==============================================================================
 */

export const extensionCategorySchema = z.enum([
  "3D_ENGINE",
  "WEBGL_RENDERER",
  "THREEJS_ADAPTER",
  "VR_ENGINE",
  "AR_ENGINE",
  "AI_ENGINE",
  "COLLABORATION_ENGINE",
  "DIGITAL_TWIN",
  "CAD_IMPORT",
  "BIM_ADAPTER",
  "IOT_INTEGRATION",
  "ENTERPRISE_TEMPLATES",
]);

export const enterpriseFeatureKeySchema = z.enum([
  "THREE_D_PREVIEW",
  "WEBGL_HARDWARE_ACCELERATION",
  "THREEJS_SCENE_EXPORT",
  "VR_PREVIEW",
  "AR_PREVIEW",
  "AI_LAYOUT_SUGGESTIONS",
  "COLLABORATIVE_EDITING",
  "REALTIME_PRESENCE",
  "MULTI_FLOOR_SUPPORT",
  "DIGITAL_TWIN_SYNC",
  "CAD_DXF_IMPORT",
  "BIM_IFC_PLACEHOLDER",
  "IOT_SEAT_SENSORS",
  "ENTERPRISE_TEMPLATE_MARKETPLACE",
]);

export const domainEventTypeSchema = z.enum([
  "LayoutPublished",
  "SeatInventoryGenerated",
  "TemplateCreated",
  "ValidationPassed",
  "LayoutArchived",
  "AnalyticsProjectionRefreshed",
  "EnterpriseFeatureToggled",
]);

export const registerHallExtensionSchema = z.object({
  key: z.string().min(3, "Extension key is required"),
  name: z.string().min(2, "Extension name is required"),
  version: z.string().min(1, "Version is required"),
  category: extensionCategorySchema,
  description: z.string().min(5, "Description is required"),
  provider: z.string().min(2, "Provider is required"),
  requiredFeatureKeys: z.array(enterpriseFeatureKeySchema).default([]),
  supportedCapabilities: z.array(z.string()).default([]),
});

export const loadExtensionConfigSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  category: extensionCategorySchema.optional(),
});

export const toggleEnterpriseFeatureSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  featureKey: enterpriseFeatureKeySchema,
});

export const loadEnterpriseSettingsSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
});

export const compileLayoutSceneGraphSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  hallId: z.string().min(1, "Hall ID is required"),
  layoutVersionId: z.string().optional(),
});

export const saveThreeDConfigSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  renderingBackend: z.enum(["WEBGL2", "WEBGPU_PLACEHOLDER", "CANVAS_2D_FALLBACK"]).optional(),
  defaultCameraPreset: z
    .enum(["ORBIT_OVERVIEW", "SEAT_POV", "DIRECTOR_STAGE", "TOP_DOWN_2D", "VR_STEREO"])
    .optional(),
  shadowsEnabled: z.boolean().optional(),
  antiAliasingEnabled: z.boolean().optional(),
  maxTargetFps: z.number().int().min(24).max(240).optional(),
  streamingAssetsEnabled: z.boolean().optional(),
  assetCdnBaseUrlPlaceholder: z.string().optional(),
});

export const saveCollaborationConfigSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  enabled: z.boolean().optional(),
  livePresenceEnabled: z.boolean().optional(),
  cursorSharingEnabled: z.boolean().optional(),
  maxConcurrentEditors: z.number().int().min(1).max(64).optional(),
  conflictStrategy: z
    .enum(["CRDT_MERGE_PLACEHOLDER", "OPTIMISTIC_LOCK", "SECTION_LOCKING"])
    .optional(),
  presenceTransportPlaceholder: z.enum(["WEBSOCKET_CLUSTER", "WEBRTC_MESH"]).optional(),
  autoVersionMergePlaceholder: z.boolean().optional(),
});

export const planCadImportSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  sourceFormat: z.enum(["DXF", "DWG_PLACEHOLDER", "SVG", "BIM_IFC_PLACEHOLDER"]),
  sourceUnit: z.enum(["MM", "CM", "FT", "M", "PX"]),
  detectedLayers: z.array(z.string()).optional(),
});

export const getAiSuggestionsSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  hallId: z.string().min(1, "Hall ID is required"),
  layoutVersionId: z.string().optional(),
});

export const loadDomainEventsLogSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  eventType: domainEventTypeSchema.optional(),
  limit: z.number().int().min(1).max(200).optional(),
});
