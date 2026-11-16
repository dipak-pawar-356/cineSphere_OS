import { z } from "zod";

/**
 * ==============================================================================
 * CineSphere OS — Hall Preview Zod Validation Schemas
 * Phase 4 – Part 9: Multi-Mode Production-Ready Hall Preview
 * ==============================================================================
 */

export const PreviewModeSchema = z.enum([
  "CUSTOMER",
  "THEATRE",
  "ADMIN",
  "ACCESSIBILITY",
  "BOOKING_SIMULATION",
]);

export const PreviewViewportSchema = z.enum(["DESKTOP", "LAPTOP", "TABLET", "MOBILE"]);

export const LoadPreviewSchema = z.object({
  layoutVersionId: z.string().min(1, "Layout version ID is required"),
  theatreId: z.string().optional(),
  mode: PreviewModeSchema.default("CUSTOMER"),
  viewport: PreviewViewportSchema.default("DESKTOP"),
});

export const RefreshPreviewSchema = z.object({
  layoutVersionId: z.string().min(1, "Layout version ID is required"),
  theatreId: z.string().optional(),
});

export const LoadPreviewConfigSchema = z.object({
  theatreId: z.string().optional(),
});

export const SavePreviewPreferencesSchema = z.object({
  theatreId: z.string().optional(),
  defaultMode: PreviewModeSchema.optional(),
  seatLabelsVisible: z.boolean().optional(),
  sectionColorsEnabled: z.boolean().optional(),
  accessibilityOverlayEnabled: z.boolean().optional(),
  darkThemeEnabled: z.boolean().optional(),
  bookingSimulationEnabled: z.boolean().optional(),
  categoryLabelsVisible: z.boolean().optional(),
  highContrastMode: z.boolean().optional(),
  fullscreenDefault: z.boolean().optional(),
  defaultZoom: z.number().min(20).max(300).optional(),
});

export const RunBookingSimulationSchema = z.object({
  layoutVersionId: z.string().min(1, "Layout version ID is required"),
  seatIdsToToggle: z.array(z.string()).default([]),
  theatreId: z.string().optional(),
});
