/**
 * ==============================================================================
 * CineSphere OS — Theatre Dashboard Validation Schemas (Phase 3 – Part 11)
 * ==============================================================================
 * Zod validation schemas for operational dashboard filters, date presets,
 * and user dashboard layout preferences.
 * ==============================================================================
 */

import { z } from "zod";

export const dashboardTimePresetSchema = z.enum([
  "TODAY",
  "YESTERDAY",
  "THIS_WEEK",
  "THIS_MONTH",
  "CUSTOM",
]);

export const dashboardFilterSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
  periodPreset: dashboardTimePresetSchema.default("TODAY"),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "From date must be in YYYY-MM-DD format")
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "To date must be in YYYY-MM-DD format")
    .optional(),
  hallId: z.string().trim().optional(),
  movieId: z.string().trim().optional(),
  showId: z.string().trim().optional(),
});

export const updateUserDashboardPreferencesSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
  userId: z.string().trim().optional(),
  visibleWidgetIds: z.array(z.string().trim()).optional(),
  widgetOrder: z.array(z.string().trim()).optional(),
  collapsedWidgetIds: z.array(z.string().trim()).optional(),
  favoriteWidgetIds: z.array(z.string().trim()).optional(),
  defaultDatePreset: dashboardTimePresetSchema.optional(),
});

export const refreshDashboardSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
  filter: dashboardFilterSchema.optional(),
});
