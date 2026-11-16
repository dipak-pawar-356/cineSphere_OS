import { z } from "zod";

/**
 * ==============================================================================
 * CineSphere OS — Structural Object Zod Validation Schemas (Phase 4 – Part 7)
 * ==============================================================================
 * Strict runtime sanitization and type assertions for structural infrastructure.
 * ==============================================================================
 */

export const StructuralObjectTypeSchema = z.enum([
  "STAGE",
  "SCREEN",
  "ENTRANCE",
  "EXIT",
  "EMERGENCY_EXIT",
  "WALL",
  "DIVIDER",
  "BALCONY",
  "STAIRS",
  "AISLE",
  "ACCESSIBLE_PATH",
  "PILLAR",
  "CONTROL_ROOM",
  "CUSTOM",
]);

export const StructuralShapeTypeSchema = z.enum([
  "RECTANGLE",
  "CURVED",
  "ARC",
  "POLYGON",
  "CIRCLE",
  "CUSTOM",
]);

export const StructuralObjectPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number().optional().default(0),
});

export const StructuralObjectAccessibilityMetadataSchema = z.object({
  hasRamp: z.boolean().optional(),
  rampInclineDegrees: z.number().min(0).max(45).optional(),
  tactilePaving: z.boolean().optional(),
  clearanceWidthMm: z.number().min(0).optional(),
  wheelchairTurningRadiusMm: z.number().min(0).optional(),
}).optional();

export const StructuralObjectSafetyMetadataSchema = z.object({
  fireRatingHours: z.number().min(0).optional(),
  extinguisherNearby: z.boolean().optional(),
  maxOccupancy: z.number().int().min(0).optional(),
  sprinklerCoverage: z.boolean().optional(),
  emergencyLightingPresent: z.boolean().optional(),
}).optional();

export const StructuralObjectEmergencyRouteMetadataSchema = z.object({
  egressWidthMm: z.number().min(0).optional(),
  directionalArrow: z.enum(["LEFT", "RIGHT", "STRAIGHT", "UP", "DOWN"]).optional(),
  leadsDirectlyToExit: z.boolean().optional(),
  exitCapacityPeoplePerMin: z.number().int().min(0).optional(),
}).optional();

export const StructuralObjectMetadataSchema = z.object({
  notes: z.string().max(500).optional(),
  tags: z.array(z.string().max(50)).optional(),
  isStatic: z.boolean().default(true),
  isCollisionObstacle: z.boolean().default(false),
  isReservedArea: z.boolean().default(false),
  accessibility: StructuralObjectAccessibilityMetadataSchema,
  safety: StructuralObjectSafetyMetadataSchema,
  emergencyRoute: StructuralObjectEmergencyRouteMetadataSchema,
  customProperties: z.record(z.unknown()).optional(),
}).default({
  isStatic: true,
  isCollisionObstacle: false,
  isReservedArea: false,
});

export const StructuralObjectGeometrySchema = z.object({
  shape: StructuralShapeTypeSchema.default("RECTANGLE"),
  points: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
  strokeColor: z.string().max(30).optional(),
  fillColor: z.string().max(30).optional(),
  strokeWidth: z.number().min(0).max(20).optional().default(2),
  cornerRadius: z.number().min(0).max(50).optional().default(0),
  dashPattern: z.array(z.number()).optional(),
  arcProperties: z.object({
    radius: z.number(),
    startAngle: z.number(),
    endAngle: z.number(),
    sagitta: z.number().optional(),
  }).optional(),
}).default({
  shape: "RECTANGLE",
});

// ------------------------------------------------------------------------------
// Server Action Input Schemas
// ------------------------------------------------------------------------------

export const CreateStructuralObjectSchema = z.object({
  layoutVersionId: z.string().min(1, "Layout version ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  objectName: z.string().min(1, "Object name is required").max(100),
  displayName: z.string().min(1, "Display name is required").max(150),
  objectType: StructuralObjectTypeSchema,
  internalCode: z.string().min(1, "Internal code is required").max(50),
  position: StructuralObjectPositionSchema,
  width: z.number().positive("Width must be positive"),
  height: z.number().positive("Height must be positive"),
  rotation: z.number().min(0).max(360).default(0),
  layer: z.number().int().min(1).max(10).default(1),
  zIndex: z.number().int().min(1).max(100).default(10),
  visibility: z.enum(["VISIBLE", "HIDDEN"]).default("VISIBLE"),
  color: z.string().max(30).default("#64748B"),
  isLocked: z.boolean().default(false),
  metadata: StructuralObjectMetadataSchema.optional(),
  geometry: StructuralObjectGeometrySchema.optional(),
});

export const UpdateStructuralObjectSchema = z.object({
  id: z.string().min(1, "Object ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  objectName: z.string().max(100).optional(),
  displayName: z.string().max(150).optional(),
  objectType: StructuralObjectTypeSchema.optional(),
  internalCode: z.string().max(50).optional(),
  position: StructuralObjectPositionSchema.optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  rotation: z.number().min(0).max(360).optional(),
  layer: z.number().int().min(1).max(10).optional(),
  zIndex: z.number().int().min(1).max(100).optional(),
  visibility: z.enum(["VISIBLE", "HIDDEN"]).optional(),
  color: z.string().max(30).optional(),
  isLocked: z.boolean().optional(),
  metadata: StructuralObjectMetadataSchema.optional(),
  geometry: StructuralObjectGeometrySchema.optional(),
});

export const DuplicateStructuralObjectSchema = z.object({
  id: z.string().min(1, "Object ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
});

export const DeleteStructuralObjectSchema = z.object({
  id: z.string().min(1, "Object ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
});

export const ReorderStructuralObjectsSchema = z.object({
  layoutVersionId: z.string().min(1, "Layout version ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  orderedIds: z.array(z.string()).min(1, "At least one ID required"),
});

export const LoadStructuralObjectsSchema = z.object({
  layoutVersionId: z.string().min(1, "Layout version ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
});

export const ToggleLockStructuralObjectSchema = z.object({
  id: z.string().min(1, "Object ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
});

export const ToggleVisibilityStructuralObjectSchema = z.object({
  id: z.string().min(1, "Object ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
});

export const ValidateStructuralObjectsSchema = z.object({
  layoutVersionId: z.string().min(1, "Layout version ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
});
