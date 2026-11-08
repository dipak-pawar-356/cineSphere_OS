import { ID } from "./common.types";
import type { SeatTemplateContainer } from "./seat-generation.types";

export type ScreenType =
  | "IMAX Laser"
  | "Dolby Cinema"
  | "4DX Dynamic"
  | "Prime Club"
  | "Royal Suite"
  | "Standard"
  | "ScreenX"
  | "3D"
  | string;

export type ProjectionType =
  | "2K"
  | "4K"
  | "Laser"
  | "Laser 4K"
  | "Barco 4K Laser"
  | "Christie RGB Laser"
  | "IMAX Dual Laser"
  | string;

export type SoundSystemType =
  | "Dolby Atmos"
  | "Dolby Atmos 64-Channel"
  | "Dolby Digital"
  | "DTS"
  | "DTS:X"
  | "IMAX Sound"
  | "Custom"
  | string;

export type HallStatus =
  | "Draft"
  | "Active"
  | "Inactive"
  | "Archived"
  | "Maintenance"
  | "Cleaning"
  | "Show Running";

export type SeatType =
  | "Standard"
  | "Recliner"
  | "VIP"
  | "Couple"
  | "Wheelchair"
  | "Sofa";

export type SeatStatus =
  | "Available"
  | "Selected"
  | "Booked"
  | "Reserved"
  | "Blocked"
  | "Maintenance"
  | "Wheelchair"
  | "Couple Seat"
  | "Recliner"
  | "Premium";

export type SeatCategoryTier =
  | "Silver"
  | "Gold"
  | "Platinum"
  | "VIP"
  | "VIP Recliner"
  | "Recliner"
  | "Wheelchair"
  | "Royal Suite"
  | "Royal Suite Lounger"
  | string;

export interface SectionCategoryDesignToken {
  category: SeatCategoryTier;
  label: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  badgeClass: string;
  defaultSeatsPerRow: number;
  icon: string;
}

export interface SeatCategory {
  id: ID;
  name: SeatCategoryTier;
  seatType?: SeatType;
  defaultColor?: string;
  basePrice?: number;
  perks: string[];
  totalSeats?: number;
}

/**
 * Seat Definition generated automatically by Hall Design Engine.
 * Theatre Admin NEVER manually creates individual seats.
 */
export interface Seat {
  id: string;
  seatNumber: string; // e.g. "A1", "B12"
  row: string;        // e.g. "A"
  column: number;     // e.g. 1
  sectionId: ID;
  sectionName: string;
  seatType: SeatType;
  status: SeatStatus;
  coordinates?: {
    x: number;
    y: number;
    z?: number;
  };
}

/**
 * Dynamic Section Configuration inside a Hall
 * Admin defines: Name, Display Name, Seat Count, Category, Sort Order, Seats Per Row.
 * Colors are automatically derived from the centralized design system.
 */
export interface DynamicHallSectionConfig {
  id: string;
  name: string;
  displayName: string;
  seatCount: number;
  category: SeatCategoryTier;
  displayColor?: string;
  legendColor?: string;
  sortOrder: number;
  description?: string;
  visibility: boolean;
  status: "Active" | "Maintenance" | "Disabled";
  rows: string[];
  seatsPerRow: number;
}

/**
 * Legacy compatible HallSection definition.
 */
export interface HallSection {
  id: ID;
  name: string;
  displayName?: string;
  category?: SeatCategoryTier;
  seatCount: number;
  seatType: SeatType;
  defaultColor?: string;
  color?: string;
  displayOrder: number;
  rows: string[];
  seatsPerRow: number;
  rowCount?: number;
  rowLabels?: string[];
  priority?: number;
  isVIP?: boolean;
  hasRecliners?: boolean;
  hasWheelchairSpaces?: boolean;
  generatedSeats?: Seat[];
  visibility?: boolean;
  status?: "Active" | "Maintenance" | "Disabled";
  description?: string;
}

export interface WalkwayConfig {
  afterRow?: string;
  afterColumn?: number;
  label?: string;
}

export interface EmergencyExitConfig {
  position: "front-left" | "front-right" | "rear-left" | "rear-right" | "side-left" | "side-right";
  label?: string;
}

/**
 * Future 3D Hall & Camera Preset Architecture
 * Fully typed preparation for Three.js and React Three Fiber
 */
export interface Future3DCameraPreset {
  id: string;
  name: string;
  position: [number, number, number]; // [x, y, z] in 3D world space
  target: [number, number, number];   // lookAt target [x, y, z]
  fov: number;                       // Field of View degrees
  description: string;
}

export interface Future3DHallConfig {
  cameraPresets: Future3DCameraPreset[];
  defaultCamera: string;
  screenCurvature: number;            // 0.0 to 0.5
  screenTiltDegrees: number;
  eyeLevelOffsetMeters: number;
  stageElevationMeters: number;
  rowTierElevationMeters: number;
  walkways: WalkwayConfig[];
  emergencyExits: EmergencyExitConfig[];
  accessibilitySlots: {
    sectionId: string;
    seatCount: number;
    rampAccess: boolean;
  }[];
  seatPitchMeters?: number;
  rowSpacingMeters?: number;
}

/**
 * Reusable Hall Layout
 * Designed once by Theatre Admin, reused across unlimited future Shows.
 * Never stores pricing directly (pricing belongs strictly to the Show).
 */
export interface HallLayout {
  id: ID;
  hallId: ID;
  theatreId: ID;
  name: string;
  capacity: number;
  sections: HallSection[];
  rows: number;
  maxColumns: number;
  walkways: WalkwayConfig[];
  vipAreas?: string[];
  wheelchairSpaces?: string[];
  emergencyExits: EmergencyExitConfig[];
  future3DConfig?: {
    cameraFov: number;
    screenCurvature: number;
    screenTiltDegrees: number;
    eyeLevelOffsetMeters: number;
    cameraPosition?: { x: number; y: number; z: number };
  };
  generatedSeats: Seat[];
}

/**
 * Physical Hall / Auditorium in a Theatre
 * Each theatre can create unlimited halls with distinct capacities and screen types.
 */
export interface Hall {
  id: ID;
  theatreId: ID;
  hallNumber: number;
  hallCode?: string;
  name: string;
  screenNumber?: number;
  capacity?: number;
  totalSeats?: number;
  screenType: ScreenType;
  projectionType?: ProjectionType;
  soundSystem?: SoundSystemType;
  aspectRatio?: string;
  projectorModel?: string;
  audioSpec?: string;
  floorNumber?: string;
  description?: string;
  status: HallStatus;
  occupancyPercent?: number;
  currentMovie?: string;
  currentShow?: string;
  sections?: DynamicHallSectionConfig[] | HallSection[];
  hallLayout?: HallLayout;
  seatTemplate?: SeatTemplateContainer;
  future3DConfig?: Future3DHallConfig;
  seatCategories?: SeatCategory[];
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}
