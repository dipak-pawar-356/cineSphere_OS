import { z } from "zod";

/**
 * ==============================================================================
 * CineSphere OS — Geometry & Advanced Layout Zod Schemas (Phase 4 – Part 8)
 * ==============================================================================
 * Strict validation schemas for transformation pipeline commands, alignment,
 * symmetry mirroring, and preflight publication audits.
 * ==============================================================================
 */

export const TransformOperationTypeSchema = z.enum([
  "MOVE",
  "ROTATE",
  "SCALE",
  "MIRROR",
  "OFFSET",
  "ALIGN",
  "DISTRIBUTE",
  "TRANSFORM_MATRIX",
]);

export const SymmetryAxisSchema = z.enum(["HORIZONTAL", "VERTICAL", "RADIAL"]);

export const AlignTypeSchema = z.enum([
  "LEFT",
  "RIGHT",
  "TOP",
  "BOTTOM",
  "CENTER_X",
  "CENTER_Y",
]);

export const DistributeTypeSchema = z.enum(["HORIZONTAL", "VERTICAL"]);

export const GeometryTransformParamsSchema = z.object({
  dx: z.number().optional(),
  dy: z.number().optional(),
  rotationAngleDeg: z.number().optional(),
  pivotPoint: z.object({ x: z.number(), y: z.number() }).optional(),
  scaleX: z.number().positive().optional(),
  scaleY: z.number().positive().optional(),
  scaleAnchor: z.object({ x: z.number(), y: z.number() }).optional(),
  mirrorAxis: SymmetryAxisSchema.optional(),
  mirrorAxisCoord: z.number().optional(),
  offsetDistance: z.number().optional(),
  offsetDirection: z.enum(["INWARD", "OUTWARD", "PARALLEL"]).optional(),
  align: AlignTypeSchema.optional(),
  distribute: DistributeTypeSchema.optional(),
  matrix: z.tuple([
    z.number(),
    z.number(),
    z.number(),
    z.number(),
    z.number(),
    z.number(),
  ]).optional(),
});

export const ApplyTransformSchema = z.object({
  layoutVersionId: z.string().min(1, "Layout version ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  type: TransformOperationTypeSchema,
  targetObjectIds: z.array(z.string()).min(1, "At least one target object required"),
  params: GeometryTransformParamsSchema,
});

export const MirrorLayoutSchema = z.object({
  layoutVersionId: z.string().min(1, "Layout version ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  axis: SymmetryAxisSchema.default("HORIZONTAL"),
  axisCoord: z.number().optional(),
});

export const DuplicateSelectionSchema = z.object({
  layoutVersionId: z.string().min(1, "Layout version ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  objectIds: z.array(z.string()).min(1, "At least one object ID required"),
  offsetDx: z.number().default(30),
  offsetDy: z.number().default(30),
});

export const SaveGeometrySettingsSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  allowCurvedVIP: z.boolean().optional(),
  allowArcRows: z.boolean().optional(),
  allowPolygonSections: z.boolean().optional(),
  enableOffset: z.boolean().optional(),
  enableSymmetry: z.boolean().optional(),
  defaultCurveRadius: z.number().positive().optional(),
  defaultArcAngle: z.number().min(1).max(180).optional(),
  gridSnapTolerance: z.number().min(1).max(50).optional(),
  angleSnapDegrees: z.number().min(1).max(90).optional(),
});

export const LoadGeometrySettingsSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
});

export const ValidateLayoutBeforePublishSchema = z.object({
  layoutVersionId: z.string().min(1, "Layout version ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
});
