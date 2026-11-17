/**
 * ==============================================================================
 * CineSphere OS — Seat Inventory Integration Domain Types (Phase 4 – Part 13)
 * ==============================================================================
 * Scalable cinema seat inventory architecture: Seat Inventory is an immutable
 * snapshot generated from an active published layout version, decoupling
 * operational show inventory from CAD layout authoring.
 * ==============================================================================
 */

import { SeatCategory } from "./seat-generator.types";

// ------------------------------------------------------------------------------
// 1. Inventory Item Lifecycle States
// ------------------------------------------------------------------------------

export type InventoryItemStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "BOOKED"
  | "BLOCKED"
  | "MAINTENANCE"
  | "DISABLED";

export type InventoryGenerationMode = "AUTOMATIC" | "MANUAL_APPROVAL";

export type InventoryValidationMode = "STRICT" | "STANDARD";

// ------------------------------------------------------------------------------
// 2. Seat Inventory Entity Models
// ------------------------------------------------------------------------------

export interface SeatInventoryHeader {
  id: string;
  showId: string;
  theatreId: string;
  hallId: string;
  layoutDefinitionId: string;
  layoutVersionId: string;
  layoutVersionNumber: number;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  blockedSeats: number;
  maintenanceSeats: number;
  status: "ACTIVE" | "SYNCHRONIZED" | "LOCKED" | "ARCHIVED";
  generatedAt: string;
  generatedBy: string;
  updatedAt: string;
}

export interface SeatInventoryItem {
  id: string;
  inventoryId: string;
  showId: string;
  theatreId: string;
  hallId: string;
  internalSeatId: string;        // Deterministic globally unique seat ID
  displaySeatNumber: string;     // e.g. "A12"
  seatCategoryId: string;        // e.g. "cat-standard", "cat-vip"
  seatCategoryName: string;      // e.g. "VIP Recliner"
  sectionId: string;             // e.g. "sec-stalls"
  sectionName: string;           // e.g. "Gold Balcony"
  rowCode: string;               // e.g. "A"
  columnIndex: number;           // e.g. 12
  x: number;                     // Canvas X coordinate
  y: number;                     // Canvas Y coordinate
  status: InventoryItemStatus;
  isWheelchair: boolean;
  isCompanion: boolean;
  isRecliner: boolean;
  basePrice: number;             // Dynamically resolved from pricing rules (never hardcoded)
  calculatedPrice: number;       // Base price + dynamic multiplier + convenience fee
  convenienceFee: number;
  gstPercent: number;
  currency: string;
  metadata?: Record<string, unknown>;
  lockedBy?: string;             // Customer session ID currently holding lock
  lockedUntil?: string;          // ISO expiration timestamp
  bookingId?: string;            // Bound once booked
  ticketId?: string;             // Bound once ticket issued
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// 3. Inventory Mappings & Snapshots
// ------------------------------------------------------------------------------

export interface InventoryMappingRecord {
  id: string;
  theatreId: string;
  showId: string;
  hallId: string;
  layoutDefinitionId: string;
  layoutVersionId: string;
  layoutVersionNumber: number;
  inventoryId: string;
  mappingStatus: "BOUND" | "UNBOUND" | "SUPERSEDED";
  isLocked: boolean;
  createdAt: string;
}

export interface InventorySnapshotRecord {
  id: string;
  inventoryId: string;
  showId: string;
  theatreId: string;
  hallId: string;
  layoutVersionId: string;
  layoutVersionNumber: number;
  totalSeats: number;
  grossValue: number;
  snapshotPayload: {
    header: SeatInventoryHeader;
    items: SeatInventoryItem[];
    pricingRulesApplied: Record<string, unknown>;
  };
  createdAt: string;
  createdBy: string;
}

// ------------------------------------------------------------------------------
// 4. Per-Theatre Inventory Governance Configurations
// ------------------------------------------------------------------------------

export interface InventoryConfiguration {
  theatreId: string;
  generationMode: InventoryGenerationMode;
  maintenanceSeatsEnabled: boolean;
  validationMode: InventoryValidationMode;
  premiumSeatMetadataEnabled: boolean;
  defaultLockDurationSeconds: number; // e.g. 600 (10 minutes)
  allowRegenerationWithZeroBookings: boolean;
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// 5. Service Action Payloads & Results
// ------------------------------------------------------------------------------

export interface GenerateInventoryPayload {
  theatreId: string;
  showId: string;
  hallId: string;
  layoutVersionId?: string;       // Optional override; defaults to active published version
  customNotes?: string;
}

export interface RegenerateInventoryPayload {
  theatreId: string;
  showId: string;
  reason: string;
  forceOverrideWithZeroBookings?: boolean;
}

export interface SyncInventoryPayload {
  theatreId: string;
  targetShowIds?: string[];       // Sync specific shows or all upcoming un-generated shows
}

export interface ValidateInventoryResult {
  isValid: boolean;
  showId: string;
  inventoryId?: string;
  totalSeats: number;
  availableSeats: number;
  errors: string[];
  warnings: string[];
}

export interface SeatPricingContext {
  theatreId: string;
  hallId: string;
  showId: string;
  showTimeSlot?: string;          // e.g. "MATINEE", "EVENING"
  dayType?: string;               // e.g. "WEEKDAY", "WEEKEND"
  sectionId: string;
  seatCategoryId: string;
}
