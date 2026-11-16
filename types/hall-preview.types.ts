/**
 * ==============================================================================
 * CineSphere OS — Hall Preview Engine Types
 * Phase 4 – Part 9: Production-Ready Multi-Mode Hall Preview
 * ==============================================================================
 */

import { LayoutDefinition, LayoutVersion } from "./hall-designer.types";
import { HallSection } from "./section-row-designer.types";
import { HallRow } from "./section-row-designer.types";
import { SeatTemplate } from "./seat-generator.types";
import { StructuralObject } from "./structural-objects.types";

/**
 * Preview display modes supported by the Preview Engine
 */
export type PreviewMode =
  | "CUSTOMER"
  | "THEATRE"
  | "ADMIN"
  | "ACCESSIBILITY"
  | "BOOKING_SIMULATION";

/**
 * Viewport device breakpoints for responsive simulation
 */
export type PreviewViewport = "DESKTOP" | "LAPTOP" | "TABLET" | "MOBILE";

/**
 * Visual background theme for canvas rendering
 */
export type PreviewThemeName = "DARK" | "LIGHT" | "HIGH_CONTRAST" | "OLED";

/**
 * Seat color rendering mode
 */
export type SeatColorMode = "CATEGORY" | "SECTION" | "STATUS" | "MONOCHROME";

/**
 * Theatre-level Preview Configuration
 */
export interface PreviewConfiguration {
  id?: string;
  theatreId: string;
  layoutVersionId?: string;
  defaultMode: PreviewMode;
  showLabels: boolean;
  showGrid: boolean;
  seatColorMode: SeatColorMode;
  backgroundTheme: PreviewThemeName;
  isFullscreen: boolean;
  zoom: number;
  pan: { x: number; y: number };
  accessibilityOverlay: boolean;
  enableBookingSimulation: boolean;
  highContrastMode: boolean;
  fullscreenDefault: boolean;
}

/**
 * Theatre preview preferences preset
 */
export interface PreviewPreferences {
  theatreId: string;
  defaultMode: PreviewMode;
  seatLabelsVisible: boolean;
  sectionColorsEnabled: boolean;
  accessibilityOverlayEnabled: boolean;
  darkThemeEnabled: boolean;
  bookingSimulationEnabled: boolean;
  categoryLabelsVisible: boolean;
  highContrastMode: boolean;
  fullscreenDefault: boolean;
  defaultZoom: number;
}

/**
 * Theme styling attributes
 */
export interface PreviewTheme {
  id: string;
  theatreId?: string;
  name: string;
  themeName: PreviewThemeName;
  backgroundColor: string;
  gridColor: string;
  screenColor: string;
  screenCurvatureGlow: string;
  textColor: string;
  accentColor: string;
  isDefault: boolean;
}

/**
 * Booking simulation active state
 */
export interface SimulatedSelectedSeat {
  id: string;
  seatNumber: string;
  rowName: string;
  sectionName: string;
  categoryCode: string;
  categoryName: string;
  categoryColor: string;
  pricePlaceholder: number;
  isWheelchair: boolean;
}

export interface BookingSimulationState {
  selectedSeatIds: string[];
  selectedSeats: SimulatedSelectedSeat[];
  totalPrice: number;
  categoryBreakdown: Record<string, { count: number; subtotal: number }>;
  maxSeatsAllowed: number;
  simulatedHoldExpiresAt?: string;
  activeStep: "SELECTING" | "SUMMARY" | "CONFIRMED";
}

/**
 * Aggregated statistics for Admin / Theatre Preview
 */
export interface PreviewStatistics {
  totalSeats: number;
  totalCapacity: number;
  activeSeatsCount: number;
  wheelchairSeatsCount: number;
  companionSeatsCount: number;
  categoryDistribution: Record<string, { name: string; count: number; color: string; percentage: number }>;
  sectionsCount: number;
  rowsCount: number;
  structuralObjectsCount: number;
  screenCount: number;
  emergencyExitCount: number;
  accessiblePathCount: number;
  estimatedFullGross: number;
}

/**
 * Full consolidated preview bundle returned by server actions
 */
export interface HallPreviewBundle {
  layoutDefinition: LayoutDefinition;
  layoutVersion: LayoutVersion;
  sections: HallSection[];
  rows: HallRow[];
  seats: SeatTemplate[];
  structuralObjects: StructuralObject[];
  preferences: PreviewPreferences;
  statistics: PreviewStatistics;
  viewportConfig: {
    targetViewport: PreviewViewport;
    canvasDimensions: { width: number; height: number };
    scaleFactor: number;
    fitZoom: number;
  };
}
