import { ID } from "./common.types";
import { SeatCategoryTier, SeatStatus, SeatType } from "./hall.types";

/**
 * ==============================================================================
 * CineSphere OS — Automatic Seat Generation Engine Types
 * ==============================================================================
 * Architectural Law:
 * 1. Seat Templates NEVER permanently store seat prices.
 * 2. Immutable Seat IDs are separated from displayed Seat Labels.
 * 3. Shows combine Seat Templates + Show Pricing to produce Show Seat Inventories.
 * ==============================================================================
 */

export interface SeatSpatialCoordinates {
  x: number; // Lateral offset in meters from center aisle
  y: number; // Tier elevation height in meters from stage floor
  z: number; // Distance in meters from projection screen
}

export interface SeatSpatialRotation {
  x: number; // Pitch angle in degrees towards screen
  y: number; // Yaw angle in degrees towards center focal point
  z: number; // Roll angle in degrees (default 0)
}

export interface SeatCameraAnchor {
  eyePosition: [number, number, number]; // [x, y, z] spectator eye level
  lookAt: [number, number, number];      // [x, y, z] focal target on screen
  fov: number;                           // Recommended camera field-of-view (degrees)
}

/**
 * Deterministically Generated Seat Template
 * Belongs strictly to a Reusable Hall Layout.
 * Contains immutable internal ID and dynamic presentation label.
 */
export interface GeneratedSeatTemplate {
  /** Immutable internal UUID for booking references */
  id: string;

  /** Internal seat identifier (e.g. "A1", "B20") */
  seatNumber: string;

  /** Display label presented to customers (e.g. "A1", "VIP-12") */
  seatLabel: string;

  /** Row lettering (e.g. "A", "B", "AA") */
  row: string;

  /** 1-based column index in row */
  column: number;

  /** Associated Hall Section identifier */
  sectionId: ID;

  /** Associated Hall Section name */
  sectionName: string;

  /** Category Tier (Silver, Gold, Platinum, VIP, Recliner, Wheelchair, etc.) */
  seatCategory: SeatCategoryTier;

  /** Sequence number in auditorium for sorting (1..Capacity) */
  displayOrder: number;

  /** Physical hardware seat type */
  seatType: SeatType;

  /** Base operating status */
  status: SeatStatus;

  /** Associated Hall identifier */
  hallId: ID;

  /** Associated Hall Layout identifier */
  hallLayoutId: ID;

  /** Reusable Template identifier */
  templateId: ID;

  // Feature & Accessibility Flags
  accessibilityFlag: boolean;
  reclinerFlag: boolean;
  vipFlag: boolean;
  wheelchairFlag: boolean;
  companionSeatFlag: boolean;

  // Spatial & Future 3D Engine Metadata
  coordinates: SeatSpatialCoordinates;
  rotation: SeatSpatialRotation;
  cameraAnchor: SeatCameraAnchor;

  // Direct Future 3D Engine Aliases
  futureXCoordinate?: number;
  futureYCoordinate?: number;
  futureZCoordinate?: number;
  futureRotation?: SeatSpatialRotation;
  futureCameraAnchor?: SeatCameraAnchor;
  futureMetadata?: Record<string, any>;

  // Extensibility metadata (zero pricing)
  metadata: Record<string, any>;
}

export interface SectionGenerationSummary {
  sectionId: string;
  sectionName: string;
  category: SeatCategoryTier;
  seatCount: number;
  seatsPerRow: number;
  rowCount: number;
  firstSeatLabel: string;
  lastSeatLabel: string;
  rowLabels: string[];
}

export interface SeatTemplateContainer {
  id: string;
  hallId: string;
  theatreId: string;
  name: string;
  capacity: number;
  totalGeneratedSeats: number;
  seats: GeneratedSeatTemplate[];
  sectionsSummary: SectionGenerationSummary[];
  generatedAt: string;
  checksum: string;
}

export interface GenerateSeatsInput {
  hallId: string;
  theatreId: string;
  layoutId?: string;
  name?: string;
  capacity: number;
  sections: {
    id: string;
    name: string;
    displayName?: string;
    seatCount: number;
    category?: SeatCategoryTier;
    displayOrder?: number;
    sortOrder?: number;
    rows?: string[];
    seatsPerRow?: number;
    visibility?: boolean;
    status?: "Active" | "Maintenance" | "Disabled";
  }[];
}

/**
 * Architectural Handoff Contract for Show Inventories:
 * Copies the template without modifying it, attaching Show Pricing.
 */
export interface ShowInventoryContract {
  showId: string;
  hallId: string;
  theatreId: string;
  showPricing: {
    sectionPricing: Record<string, number>; // sectionId -> price
    defaultPrice: number;
  };
  generatedAt: string;
}

