/**
 * ==============================================================================
 * CineSphere OS — Public Theatre Page Validation Schemas (Phase 3 – Part 13)
 * ==============================================================================
 */

import { z } from "zod";

export const loadPublicTheatreSchema = z.object({
  slugOrId: z
    .string()
    .trim()
    .min(1, "Theatre slug or ID is required")
    .max(100, "Identifier must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Identifier contains invalid characters"),
  previewMode: z.boolean().optional().default(false),
});

export const loadPublicShowsSchema = z.object({
  theatreIdOrSlug: z
    .string()
    .trim()
    .min(1, "Theatre slug or ID is required")
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/),
  date: z.string().trim().max(30).optional(),
  format: z.string().trim().max(50).optional(),
  movieId: z.string().trim().max(100).optional(),
});

export const loadPublicMoviesSchema = z.object({
  theatreIdOrSlug: z
    .string()
    .trim()
    .min(1, "Theatre slug or ID is required")
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/),
  status: z.enum(["NOW_SHOWING", "COMING_SOON", "ALL"]).optional().default("ALL"),
});
