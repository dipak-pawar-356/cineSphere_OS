import { ID } from "./common.types";

/**
 * ==============================================================================
 * CineSphere OS — Geometry & Advanced Layout Domain Types (Phase 4 – Part 8)
 * ==============================================================================
 * Advanced computational geometry engine powering curved layouts, arc rows,
 * polygon sections, symmetric layout mirroring, affine transformations, and
 * unified preflight validation before publication.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Unified Layout Object Model (Invariant 1)
// ------------------------------------------------------------------------------

export type LayoutObjectType =
  | "SECTION"
  | "ROW"
  | "SEAT"
  | "STRUCTURAL"
  | "ANNOTATION"
  | "GEOMETRY";

export interface BaseLayoutObject {
  id: ID;
  layoutVersionId: ID;
  theatreId: ID;
  objectType: LayoutObjectType;
  name: string;
  displayName: string;
  position: { x: number; y: number; z?: number };
  width: number;
  height: number;
  rotation: number; // Degrees 0-360
  layer: number;
  zIndex: number;
  isVisible: boolean;
  isLocked: boolean;
  metadata: Record<string, unknown>;
  permissions?: string[];
}

// ------------------------------------------------------------------------------
// 2. Geometry Shapes & Spatial Primitives
// ------------------------------------------------------------------------------

export type GeometryShapeType =
  | "RECTANGLE"
  | "CIRCLE"
  | "ARC"
  | "CURVE"
  | "POLYGON"
  | "BEZIER"
  | "FREEFORM"
  | "CUSTOM_SHAPE";

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface CurveControls {
  radius: number;           // Radius of curvature in pixels/units
  startAngle: number;       // Start angle in degrees (-180 to 180)
  endAngle: number;         // End angle in degrees (-180 to 180)
  arcDirection: "CLOCKWISE" | "COUNTER_CLOCKWISE";
  curveStrength: number;    // 0.0 (flat) to 1.0 (deep arc)
  spacingAdjustment: number;// Additional lateral seat/row spacing factor
  focalPoint?: Point2D;     // Focal center of the cinema screen
}

export type SymmetryAxis = "HORIZONTAL" | "VERTICAL" | "RADIAL";

export type AlignType =
  | "LEFT"
  | "RIGHT"
  | "TOP"
  | "BOTTOM"
  | "CENTER_X"
  | "CENTER_Y";

export type DistributeType = "HORIZONTAL" | "VERTICAL";

// ------------------------------------------------------------------------------
// 3. Geometry Transformation Pipeline (Invariant 2)
// ------------------------------------------------------------------------------

export type TransformOperationType =
  | "MOVE"
  | "ROTATE"
  | "SCALE"
  | "MIRROR"
  | "OFFSET"
  | "ALIGN"
  | "DISTRIBUTE"
  | "TRANSFORM_MATRIX";

export interface GeometryTransformParams {
  dx?: number;
  dy?: number;
  rotationAngleDeg?: number;
  pivotPoint?: Point2D;
  scaleX?: number;
  scaleY?: number;
  scaleAnchor?: Point2D;
  mirrorAxis?: SymmetryAxis;
  mirrorAxisCoord?: number; // e.g. center X coordinate for horizontal mirror
  offsetDistance?: number;
  offsetDirection?: "INWARD" | "OUTWARD" | "PARALLEL";
  align?: AlignType;
  distribute?: DistributeType;
  matrix?: [number, number, number, number, number, number]; // Affine 2D [a, b, c, d, tx, ty]
}

export interface GeometryTransformCommand {
  id: ID;
  layoutVersionId: ID;
  theatreId: ID;
  type: TransformOperationType;
  targetObjectIds: string[];
  params: GeometryTransformParams;
  timestamp: string;
  appliedBy: string;
}

// ------------------------------------------------------------------------------
// 4. Theatre-Specific Geometry Settings
// ------------------------------------------------------------------------------

export interface GeometrySettings {
  id: ID;
  theatreId: ID;
  allowCurvedVIP: boolean;
  allowArcRows: boolean;
  allowPolygonSections: boolean;
  enableOffset: boolean;
  enableSymmetry: boolean;
  defaultCurveRadius: number;
  defaultArcAngle: number;
  gridSnapTolerance: number;
  angleSnapDegrees: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// ------------------------------------------------------------------------------
// 5. Preflight Layout Validation Before Publish (Invariant 3)
// ------------------------------------------------------------------------------

export interface LayoutPublishPreflightResult {
  canPublish: boolean;
  blockingErrors: string[];
  complianceWarnings: string[];
  checklist: {
    hasScreen: boolean;
    hasEmergencyExit: boolean;
    hasEntrance: boolean;
    hasAccessiblePath: boolean;
    hasNoStructuralCollisions: boolean;
    hasNoOutOfBounds: boolean;
    hasValidGeometry: boolean;
    sectionRowParity: boolean;
  };
  metrics: {
    totalSections: number;
    totalRows: number;
    totalSeats: number;
    totalStructuralObjects: number;
    wheelchairCapacity: number;
    companionCapacity: number;
  };
  validatedAt: string;
}
