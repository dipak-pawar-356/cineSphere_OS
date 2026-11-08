import { ID } from "./common.types";

export type ScreenType =
  | "IMAX Laser"
  | "Dolby Cinema"
  | "4DX Dynamic"
  | "Prime Club"
  | "Royal Suite"
  | "Standard"
  | "ScreenX"
  | string;

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
  | "VIP Recliner"
  | "Royal Suite Lounger"
  | string;

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
 * Section Configuration inside a Hall
 * Admin defines: Section Name, Seat Count, Rows, Seats Per Row, Seat Type, Default Color.
 * The system automatically generates all seats.
 */
export interface HallSection {
  id: ID;
  name: string;
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
  name: string;
  hallNumber: number;
  screenNumber?: number;
  capacity?: number;
  totalSeats?: number;
  screenType: ScreenType;
  projectionType?: string;
  soundSystem?: string;
  aspectRatio?: string;
  projectorModel?: string;
  audioSpec?: string;
  hallLayout?: HallLayout;
  seatCategories?: SeatCategory[];
  sections?: HallSection[];
  currentMovie?: string;
  currentShow?: string;
  occupancyPercent?: number;
  status?: "Active" | "Maintenance" | "Cleaning" | "Show Running" | string;
  image?: string;
}
