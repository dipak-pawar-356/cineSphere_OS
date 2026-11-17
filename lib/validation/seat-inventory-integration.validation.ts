import { z } from "zod";

/**
 * ==============================================================================
 * CineSphere OS — Seat Inventory Integration Zod Schemas (Phase 4 – Part 13)
 * ==============================================================================
 */

export const generateInventorySchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  showId: z.string().min(1, "Show ID is required"),
  hallId: z.string().min(1, "Hall ID is required"),
  layoutVersionId: z.string().optional(),
  customNotes: z.string().optional(),
});

export const regenerateInventorySchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  showId: z.string().min(1, "Show ID is required"),
  reason: z.string().min(1, "Regeneration reason is required"),
  forceOverrideWithZeroBookings: z.boolean().default(false),
});

export const syncInventorySchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  targetShowIds: z.array(z.string()).optional(),
});

export const loadInventorySchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  showId: z.string().min(1, "Show ID is required"),
});

export const validateInventorySchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  showId: z.string().min(1, "Show ID is required"),
});

export const mapInventoryToShowSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  showId: z.string().min(1, "Show ID is required"),
  hallId: z.string().min(1, "Hall ID is required"),
  layoutVersionId: z.string().min(1, "Layout Version ID is required"),
});

export const updateSeatStatusSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  showId: z.string().min(1, "Show ID is required"),
  internalSeatId: z.string().min(1, "Internal Seat ID is required"),
  status: z.enum([
    "AVAILABLE",
    "RESERVED",
    "BOOKED",
    "BLOCKED",
    "MAINTENANCE",
    "DISABLED",
  ]),
  lockedBy: z.string().optional(),
  lockedUntil: z.string().optional(),
  bookingId: z.string().optional(),
  ticketId: z.string().optional(),
});

export const loadInventoryConfigSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
});

export const saveInventoryConfigSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  generationMode: z.enum(["AUTOMATIC", "MANUAL_APPROVAL"]).optional(),
  maintenanceSeatsEnabled: z.boolean().optional(),
  validationMode: z.enum(["STRICT", "STANDARD"]).optional(),
  premiumSeatMetadataEnabled: z.boolean().optional(),
  defaultLockDurationSeconds: z.number().int().min(60).max(3600).optional(),
  allowRegenerationWithZeroBookings: z.boolean().optional(),
});
