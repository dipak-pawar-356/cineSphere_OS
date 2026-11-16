import { ID } from "./common.types";

/**
 * ==============================================================================
 * CineSphere OS — Structural Objects Domain Types (Phase 4 – Part 7)
 * ==============================================================================
 * Structural objects model the physical architectural infrastructure of a hall
 * (Stage, Screen, Entrances, Exits, Walls, Stairs, Aisles, Pillars, etc.)
 * as first-class reusable layout objects, independent from sections, rows, and seats.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Structural Object Types & Lifecycles
// ------------------------------------------------------------------------------

export type StructuralObjectType =
  | "STAGE"
  | "SCREEN"
  | "ENTRANCE"
  | "EXIT"
  | "EMERGENCY_EXIT"
  | "WALL"
  | "DIVIDER"
  | "BALCONY"
  | "STAIRS"
  | "AISLE"
  | "ACCESSIBLE_PATH"
  | "PILLAR"
  | "CONTROL_ROOM"
  | "CUSTOM";

export type StructuralObjectVisibility = "VISIBLE" | "HIDDEN";

export type StructuralShapeType =
  | "RECTANGLE"
  | "CURVED"
  | "ARC"
  | "POLYGON"
  | "CIRCLE"
  | "CUSTOM";

// ------------------------------------------------------------------------------
// 2. Structural Object Sub-Entities
// ------------------------------------------------------------------------------

export interface StructuralObjectPosition {
  x: number;
  y: number;
  z?: number; // Elevation / height offset
}

export interface StructuralObjectDimension {
  width: number;
  height: number;
  depth?: number;
}

export interface StructuralObjectAccessibilityMetadata {
  hasRamp?: boolean;
  rampInclineDegrees?: number;
  tactilePaving?: boolean;
  clearanceWidthMm?: number;
  wheelchairTurningRadiusMm?: number;
}

export interface StructuralObjectSafetyMetadata {
  fireRatingHours?: number;
  extinguisherNearby?: boolean;
  maxOccupancy?: number;
  sprinklerCoverage?: boolean;
  emergencyLightingPresent?: boolean;
}

export interface StructuralObjectEmergencyRouteMetadata {
  egressWidthMm?: number;
  directionalArrow?: "LEFT" | "RIGHT" | "STRAIGHT" | "UP" | "DOWN";
  leadsDirectlyToExit?: boolean;
  exitCapacityPeoplePerMin?: number;
}

export interface StructuralObjectMetadata {
  notes?: string;
  tags?: string[];
  isStatic: boolean;            // Fixed physical barrier (walls, stage, pillars)
  isCollisionObstacle: boolean; // Forbids seat placement inside its bounds
  isReservedArea: boolean;      // Reserved for sound/AV or access clearance
  accessibility?: StructuralObjectAccessibilityMetadata;
  safety?: StructuralObjectSafetyMetadata;
  emergencyRoute?: StructuralObjectEmergencyRouteMetadata;
  customProperties?: Record<string, unknown>;
}

export interface StructuralObjectGeometry {
  shape: StructuralShapeType;
  points?: Array<{ x: number; y: number }>;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  dashPattern?: number[];
  arcProperties?: {
    radius: number;
    startAngle: number;
    endAngle: number;
    sagitta?: number;
  };
}

// ------------------------------------------------------------------------------
// 3. Structural Object Primary Entity
// ------------------------------------------------------------------------------

export interface StructuralObject {
  id: ID;
  layoutVersionId: ID;
  theatreId: ID;
  objectName: string;         // Internal unique identifier e.g. "Screen Main IMAX"
  displayName: string;        // Human-readable title e.g. "Main IMAX Screen"
  objectType: StructuralObjectType;
  internalCode: string;       // Circuit code e.g. "STR-SCR-01"
  position: StructuralObjectPosition;
  width: number;
  height: number;
  rotation: number;           // Degrees (0-360)
  layer: number;              // Architectural floor/layer
  zIndex: number;             // Rendering stack depth
  visibility: StructuralObjectVisibility;
  color: string;              // Aesthetic render color
  isLocked: boolean;          // Prevents accidental drag/movement in designer
  metadata: StructuralObjectMetadata;
  geometry: StructuralObjectGeometry;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// ------------------------------------------------------------------------------
// 4. Filters, Queries & Validation Results
// ------------------------------------------------------------------------------

export interface StructuralObjectFilter {
  layoutVersionId?: string;
  theatreId?: string;
  objectType?: StructuralObjectType;
  visibility?: StructuralObjectVisibility;
  isLocked?: boolean;
  isCollisionObstacle?: boolean;
}

export interface StructuralCollision {
  objectId: string;
  objectName: string;
  collidingTargetId: string;
  collidingTargetType: "SEAT" | "ROW" | "SECTION" | "STRUCTURAL";
  description: string;
  coordinates: { x: number; y: number };
}

export interface StructuralObjectValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalObjects: number;
    screenCount: number;
    emergencyExitCount: number;
    entranceCount: number;
    accessiblePathCount: number;
    collisions: StructuralCollision[];
    hasScreen: boolean;
    hasEmergencyExit: boolean;
    hasEntrance: boolean;
    hasAccessibleRoute: boolean;
  };
}
