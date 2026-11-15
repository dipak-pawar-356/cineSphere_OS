/**
 * ==============================================================================
 * CineSphere OS — Hall Designer Foundation & Canvas Types (Phase 4 – Parts 1 & 2)
 * ==============================================================================
 * 1. Part 1: Layout Definition Layer & Version Control Architecture
 *    The immutable source of truth for hall layouts. The live layout is always
 *    a published version derived from a layout definition, guaranteeing that
 *    in-flight shows and bookings remain isolated from draft edits.
 * 2. Part 2: Visual Hall Canvas & Grid System Engine
 *    Infinite pan/zoom canvas, multi-density snapping grid, smart guides,
 *    alignment tools, and theatre-specific canvas preferences.
 * ==============================================================================
 */

import { SeatType } from "./hall.types";

// ------------------------------------------------------------------------------
// 1. Layout Status & Versioning Lifecycles (Part 1)
// ------------------------------------------------------------------------------

export type LayoutStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED"
  | "INACTIVE"
  | "DEPRECATED";

export interface SeatCoordinate {
  x: number;
  y: number;
  z?: number;
}

export interface SeatDefinition {
  id: string;
  seatNumber: string; // e.g. "A1", "B12", "VIP-1"
  row: string;        // e.g. "A", "B", "VIP"
  column: number;     // e.g. 1, 2, 12
  sectionId: string;
  seatType: SeatType;
  coordinates: SeatCoordinate;
  isActive: boolean;
  isAccessible?: boolean;
  companionSeatId?: string;
}

export interface HallSectionDefinition {
  id: string;
  name: string; // e.g. "Section A", "VIP Recliner", "Executive Gold"
  displayOrder: number;
  seatCount: number;
  seatType: SeatType;
  displayColor: string;
  categoryIcon?: string;
  rowLabels: string[];
  seatsPerRow: number;
}

export interface LayoutWalkway {
  id: string;
  afterRow?: string;
  afterColumn?: number;
  widthUnits: number;
  label?: string;
}

export interface LayoutEmergencyExit {
  id: string;
  position: "TOP_LEFT" | "TOP_RIGHT" | "BOTTOM_LEFT" | "BOTTOM_RIGHT" | "SIDE_LEFT" | "SIDE_RIGHT";
  label?: string;
  widthUnits: number;
}

export interface LayoutMetadata {
  createdBy: string;
  updatedBy: string;
  publishedBy?: string;
  versionNotes?: string;
  seatCountSummary: {
    standard: number;
    vip: number;
    recliner: number;
    sofa: number;
    wheelchair: number;
    total: number;
  };
}

export interface LayoutVersion {
  id: string;
  layoutDefinitionId: string;
  theatreId: string;
  versionNumber: number;
  name: string;
  status: LayoutStatus;
  versionNotes?: string;
  sections: HallSectionDefinition[];
  seats: SeatDefinition[];
  walkways: LayoutWalkway[];
  vipZones: string[];
  wheelchairAreas: string[];
  emergencyExits: LayoutEmergencyExit[];
  gridConfig: {
    rows: number;
    columns: number;
    totalCapacity: number;
  };
  metadata: LayoutMetadata;
  publishedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LayoutDefinition {
  id: string;
  theatreId: string;
  hallId: string;
  name: string;
  description?: string;
  currentPublishedVersionId?: string;
  activeDraftVersionId?: string;
  status: LayoutStatus;
  totalVersionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LayoutValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalSections: number;
    totalSeats: number;
    duplicateSeatNumbers: string[];
    outOfBoundsSeats: string[];
    emptySections: string[];
    hasScreenDirection: boolean;
    hasEmergencyExits: boolean;
  };
}

// ------------------------------------------------------------------------------
// 2. Canvas & Grid System Engine (Part 2)
// ------------------------------------------------------------------------------

export type MeasurementUnit = "PX" | "CM" | "FT" | "M";

export type GridDensity = "SMALL" | "MEDIUM" | "LARGE";

export type AlignmentOperation =
  | "ALIGN_LEFT"
  | "ALIGN_RIGHT"
  | "ALIGN_TOP"
  | "ALIGN_BOTTOM"
  | "CENTER_HORIZONTAL"
  | "CENTER_VERTICAL"
  | "DISTRIBUTE_HORIZONTALLY"
  | "DISTRIBUTE_VERTICALLY";

export interface CanvasPreferences {
  theatreId: string;
  gridSize: number; // e.g. 10 (small), 20 (medium), 40 (large)
  gridDensity: GridDensity;
  gridVisible: boolean;
  gridColor: string;
  gridOpacity: number;
  snapEnabled: boolean;
  snapStrength: number; // in pixels
  defaultZoom: number;  // 100% = 1.0
  measurementUnit: MeasurementUnit;
  canvasWidth: number;  // e.g. 2400
  canvasHeight: number; // e.g. 1800
  backgroundColor: string;
  showMiniMap: boolean;
  showSmartGuides: boolean;
  updatedAt: string;
}

export interface CanvasTransform {
  zoom: number; // e.g. 0.5 to 3.0
  panX: number;
  panY: number;
}

export interface SmartGuide {
  type: "HORIZONTAL" | "VERTICAL";
  coordinate: number;
  label?: string;
}
