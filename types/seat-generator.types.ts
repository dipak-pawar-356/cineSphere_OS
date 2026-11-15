import { ID } from "./common.types";

/**
 * ==============================================================================
 * CineSphere OS — Automatic Seat Generator & Category Registry Types
 * Phase 4 – Part 5 (Seat Generator) & Part 6 (Seat Categories)
 * ==============================================================================
 * Core Principles:
 * 1. Immutable Seat Identity: Every generated seat receives a permanent internal UUID.
 * 2. Category Registry: Dynamic registry instead of hardcoded enums.
 * 3. Decoupled Pricing: Categories define classification only. Pricing is
 *    strictly resolved per show via Show Pricing Engine (Phase 2 Part 9).
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Enums & Literal Unions
// ------------------------------------------------------------------------------

export type SeatNumberingStyle =
  | "NUMERIC"
  | "ALPHABETIC"
  | "ALPHANUMERIC"
  | "ROMAN"
  | "CUSTOM";

export type SeatAccessibilityType =
  | "STANDARD"
  | "WHEELCHAIR"
  | "COMPANION"
  | "ACCESSIBLE_ROUTE"
  | "RESERVED_ACCESSIBILITY"
  | "RESERVED"
  | "HIDDEN";

export type SeatTemplateStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "MAINTENANCE"
  | "RESERVED"
  | "HIDDEN";

export type SeatCategoryStatus = "ACTIVE" | "ARCHIVED";

export type SeatGeometryCalculationType =
  | "STRAIGHT"
  | "CURVED"
  | "ARC"
  | "ANGLED";

// ------------------------------------------------------------------------------
// 2. Part 5: Seat Template & Sub-Entity Models
// ------------------------------------------------------------------------------

export interface SeatCoordinates {
  id: string;
  seatTemplateId: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  spacing: number;
  offsetX?: number;
  offsetY?: number;
  curvedPosition?: {
    radius: number;
    angle: number;
    sagitta: number;
  };
  isMirrored?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SeatMetadata {
  id: string;
  seatTemplateId: string;
  seatName: string;
  displayName: string;
  seatCode: string;
  rowId: string;
  rowName: string;
  sectionId: string;
  sectionName: string;
  categoryCode: string;
  status: SeatTemplateStatus;
  sightlineQuality?: "EXCELLENT" | "GOOD" | "STANDARD" | "RESTRICTED";
  legroomRating?: string;
  soundZone?: string;
  customAttributes?: Record<string, unknown>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SeatAccessibility {
  id: string;
  seatTemplateId: string;
  accessibilityType: SeatAccessibilityType;
  isWheelchairAccessible: boolean;
  hasCompanionSeat: boolean;
  companionSeatTemplateId?: string;
  hasAccessibleRoute: boolean;
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Core Seat Template
 * Belongs strictly to a Hall Row within a Section and Layout Version.
 * Immutable permanent UUID assigned upon generation.
 */
export interface SeatTemplate {
  id: string; // Permanent immutable internal UUID
  theatreId: string;
  layoutVersionId: string;
  sectionId: string;
  rowId: string;
  seatNumber: string; // Dynamic presentation label (e.g. "A12", "VIP-001")
  columnNumber: number; // 1-based index in row
  categoryCode: string; // Foreign key referencing SeatCategory registry
  categoryName: string;
  categoryColor: string;
  coordinates: SeatCoordinates;
  metadata: SeatMetadata;
  accessibility: SeatAccessibility;
  status: SeatTemplateStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ------------------------------------------------------------------------------
// 3. Part 6: Seat Category Registry Models
// ------------------------------------------------------------------------------

export interface SeatCategoryMetadata {
  id: string;
  categoryId: string;
  tags: string[];
  amenities: string[];
  notes?: string;
  customAttributes: Record<string, unknown>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SeatCategoryRule {
  id: string;
  categoryId: string;
  displayOrder: number;
  allowLoyaltyDiscount: boolean;
  maxPerBooking: number;
  requiresCompanion: boolean;
  minBookingPartySize?: number;
  customRules?: Record<string, unknown>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SeatCategoryRegistryItem {
  id: string;
  theatreId: string;
  code: string; // Unique within theatre, e.g. "VIP", "RECLINER", "LUXURY"
  name: string;
  displayName: string;
  description?: string;
  color: string; // Hex color code
  icon?: string;
  priority: number; // 1 = highest luxury tier
  visibility: "VISIBLE" | "HIDDEN";
  accessibility: SeatAccessibilityType;
  isPremium: boolean;
  isDefault: boolean;
  status: SeatCategoryStatus;
  metadata?: SeatCategoryMetadata;
  rules?: SeatCategoryRule;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Literal alias conforming to prompt
export type SeatCategory = SeatCategoryRegistryItem;

// ------------------------------------------------------------------------------
// 4. Engine Configuration & Numbering Options
// ------------------------------------------------------------------------------

export interface SeatNumberingConfig {
  style: SeatNumberingStyle;
  prefix?: string;
  suffix?: string;
  startNumber?: number;
  endNumber?: number;
  isReversed?: boolean;
  skipNumbers?: number[]; // e.g. [13, 14]
  customNames?: string[]; // for CUSTOM naming style
}

export interface SeatGenerationConfig {
  rowId: string;
  sectionId: string;
  theatreId: string;
  layoutVersionId: string;
  seatCount: number;
  seatWidth: number; // in pixels (default 40px)
  seatHeight: number; // in pixels (default 40px)
  spacing: number; // horizontal spacing in pixels (e.g. 10px)
  verticalSpacing?: number;
  rotation?: number; // degrees
  startX: number;
  startY: number;
  numbering: SeatNumberingConfig;
  categoryCode: string;
  accessibility?: {
    wheelchairSeatIndices?: number[];
    companionSeatIndices?: number[];
    reservedSeatIndices?: number[];
    hiddenSeatIndices?: number[];
    accessibleRouteIndices?: number[];
  };
  geometry?: {
    type: SeatGeometryCalculationType;
    radius?: number;
    arcAngle?: number;
    angle?: number;
    isMirrored?: boolean;
    offsetX?: number;
    offsetY?: number;
  };
}

// ------------------------------------------------------------------------------
// 5. Validation Results
// ------------------------------------------------------------------------------

export interface SeatCollisionPair {
  seatAId: string;
  seatANumber: string;
  seatBId: string;
  seatBNumber: string;
  distance: number;
}

export interface SeatValidationResult {
  isValid: boolean;
  totalSeats: number;
  errors: string[];
  warnings: string[];
  collisionPairs: SeatCollisionPair[];
  duplicateCodes: string[];
}

export interface CategoryValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ------------------------------------------------------------------------------
// 6. Bulk Operations
// ------------------------------------------------------------------------------

export interface BulkSeatGenerationResult {
  rowId: string;
  generatedCount: number;
  seats: SeatTemplate[];
  validation: SeatValidationResult;
}
