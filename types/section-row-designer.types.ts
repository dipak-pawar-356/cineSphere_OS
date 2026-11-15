/**
 * ==============================================================================
 * CineSphere OS — Section & Row Designer Types (Phase 4 – Parts 3 & 4)
 * ==============================================================================
 * 1. Part 3: Section Designer
 *    Acts as the structural layer between Hall Layout Definitions and Rows.
 *    Hierarchy: Layout Definition ──► Section ──► Row ──► Seat.
 * 2. Part 4: Row Designer
 *    Rows belong strictly to Sections, never directly to the Hall.
 *    Supports straight/curved/angled geometry, customizable numbering
 *    (alphabetical, numeric, roman, reverse), accessibility, and independent
 *    theatre conventions.
 * ==============================================================================
 */

import { SeatType } from "./hall.types";
import { SeatDefinition } from "./hall-designer.types";

// ------------------------------------------------------------------------------
// 1. Section Designer Types (Part 3)
// ------------------------------------------------------------------------------

export type SectionGeometryType =
  | "RECTANGLE"
  | "CURVED"
  | "ARC"
  | "POLYGON"
  | "IRREGULAR";

export type SectionLabelPosition =
  | "TOP"
  | "BOTTOM"
  | "LEFT"
  | "RIGHT"
  | "CENTER"
  | "HIDDEN";

export type SectionVisibility = "VISIBLE" | "HIDDEN";

export type SectionCategory = SeatType;

export type SectionOrderingDirection = "UP" | "DOWN" | "TOP" | "BOTTOM" | "AUTO_SORT";

export interface SectionMetadata {
  notes?: string;
  soundZone?: string;
  acousticProfile?: string;
  tags?: string[];
  customAttributes?: Record<string, unknown>;
}

export interface SectionGeometry {
  shapeType: SectionGeometryType;
  curvatureRadius?: number; // e.g. 600px radius for curved/arc
  arcAngle?: number;        // in degrees (e.g. 30, 45, 60)
  polygonPoints?: Array<{ x: number; y: number }>;
  isMirrored?: boolean;
  offsetX?: number;
  offsetY?: number;
}

export interface DesignerSection {
  id: string;
  layoutVersionId: string;
  theatreId: string;
  name: string;           // e.g. "Section A", "VIP Prime", "Balcony East"
  displayName: string;    // e.g. "VIP Recliner Suite"
  internalCode: string;   // e.g. "SEC-VIP-A"
  color: string;          // e.g. "#EF4444" (Red)
  seatCategory: SeatType; // "Standard" | "Recliner" | "VIP" | "Couple" | "Wheelchair" | "Sofa"
  capacity: number;       // total seats in this section
  priority: number;       // priority ranking (1 is highest tier)
  displayOrder: number;   // ordering index for rendering & tickets
  rotation: number;       // in degrees (0 - 360)
  position: { x: number; y: number };
  visibility: SectionVisibility;
  geometry: SectionGeometry;
  labelPosition: SectionLabelPosition;
  notes?: string;
  metadata?: SectionMetadata;
  rows: HallRow[];        // Hierarchical DDD containment: Section -> Rows -> Seats
  createdAt: string;
  updatedAt: string;
}

export type HallSection = DesignerSection;

// ------------------------------------------------------------------------------
// 2. Row Designer Types (Part 4)
// ------------------------------------------------------------------------------

export type RowGeometryType = "STRAIGHT" | "CURVED" | "ARC" | "ANGLED";

export type RowNumberingStrategy =
  | "ALPHABETICAL" // A, B, C... or AA, AB...
  | "NUMERIC"      // 1, 2, 3...
  | "ROMAN"        // I, II, III...
  | "CUSTOM";      // user-provided pattern

export type RowAccessibilityType =
  | "STANDARD"
  | "WHEELCHAIR"
  | "COMPANION"
  | "RESERVED"
  | "EMERGENCY_CLEARANCE"
  | "HIDDEN";

export interface RowGeometry {
  geometryType: RowGeometryType;
  curveRadius?: number;   // in pixels (e.g. 500)
  angle?: number;         // in degrees (e.g. 15, -15)
  offsetX?: number;
  offsetY?: number;
  isMirrored?: boolean;
}

export interface RowConfiguration {
  numberingStrategy: RowNumberingStrategy;
  isReversed: boolean;    // e.g. true for 10 -> 1 instead of 1 -> 10
  startIndex: number;     // e.g. 1
  endIndex: number;       // e.g. 10
  prefix?: string;        // e.g. "VIP-" -> VIP-A1
  suffix?: string;
}

export interface RowMetadata {
  notes?: string;
  sightlineScore?: number;
  legroomRating?: string;
  soundDelayMs?: number;
  customAttributes?: Record<string, unknown>;
}

export interface HallRow {
  id: string;
  sectionId: string;
  theatreId: string;
  rowName: string;        // e.g. "A", "B", "1", "VIP-1"
  displayName: string;    // e.g. "Row A - Premium Recliners"
  sequence: number;       // 1, 2, 3... order from front to back
  seatCount: number;      // seats in this row
  spacing: number;        // distance to next row (in px or meters)
  rotation: number;       // rotation angle in degrees
  visibility: "VISIBLE" | "HIDDEN";
  accessibility: RowAccessibilityType;
  geometry: RowGeometry;
  configuration: RowConfiguration;
  categoryOverride?: SeatType; // optional row-level category override (e.g. Wheelchair row in Standard section)
  metadata?: RowMetadata;
  seats: SeatDefinition[];     // Contained seats
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// 3. Section & Row Validation Types
// ------------------------------------------------------------------------------

export interface SectionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalSections: number;
    totalRows: number;
    totalSeats: number;
    duplicateSectionNames: string[];
    duplicateSectionCodes: string[];
    capacityDiscrepancies: string[];
  };
}

export interface RowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    sectionId: string;
    totalRows: number;
    duplicateRowNames: string[];
    invalidSequences: number[];
  };
}
