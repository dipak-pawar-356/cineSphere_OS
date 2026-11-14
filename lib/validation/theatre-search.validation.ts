/**
 * ==============================================================================
 * CineSphere OS — Theatre Search & Filters Validation (Phase 3 – Part 12)
 * ==============================================================================
 * Zod schemas for query inputs, multi-faceted filtering, sorting criteria,
 * and saved search presets management.
 * ==============================================================================
 */

import { z } from "zod";

const theatreStatusEnum = z.enum([
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "ARCHIVED",
  "SOFT_DELETED",
]);

const sortOptionEnum = z.enum([
  "NEWEST",
  "OLDEST",
  "NAME_ASC",
  "NAME_DESC",
  "RECENTLY_UPDATED",
  "MOST_SCREENS",
  "LARGEST_CAPACITY",
  "DISTANCE_ASC",
]);

export const theatreSearchFiltersSchema = z.object({
  query: z.string().trim().max(100).optional(),
  statuses: z.array(theatreStatusEnum).optional(),
  isVerified: z.boolean().optional(),
  theatreType: z.enum(["PREMIUM", "STANDARD", "ALL"]).optional().default("ALL"),
  chainType: z.enum(["CHAIN", "INDEPENDENT", "ALL"]).optional().default("ALL"),
  chainName: z.string().trim().max(100).optional(),
  businessCategories: z.array(z.string().trim().max(50)).optional(),
  countries: z.array(z.string().trim().max(50)).optional(),
  states: z.array(z.string().trim().max(50)).optional(),
  cities: z.array(z.string().trim().max(50)).optional(),
  timezones: z.array(z.string().trim().max(50)).optional(),
  currencies: z.array(z.string().trim().max(10)).optional(),
  languages: z.array(z.string().trim().max(20)).optional(),
  amenities: z.array(z.string().trim().max(50)).optional(),
  screensMin: z.number().int().min(0).max(100).optional(),
  screensMax: z.number().int().min(0).max(100).optional(),
  capacityMin: z.number().int().min(0).max(10000).optional(),
  capacityMax: z.number().int().min(0).max(10000).optional(),
  createdAfter: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
  createdBefore: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
  updatedAfter: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
  updatedBefore: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),

  // Future Geo Search Placeholders
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radiusKm: z.number().min(0.1).max(500).optional(),
});

export const theatreSearchQuerySchema = z.object({
  query: z.string().trim().max(100).optional(),
  filters: theatreSearchFiltersSchema.optional(),
  sortBy: sortOptionEnum.optional().default("NEWEST"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
});

export const createSavedSearchPresetSchema = z.object({
  name: z.string().trim().min(2, "Preset name must be at least 2 characters").max(60),
  description: z.string().trim().max(200).optional(),
  filters: theatreSearchFiltersSchema,
  sortBy: sortOptionEnum.optional().default("NEWEST"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  isDefault: z.boolean().optional().default(false),
});

export const deleteSavedSearchPresetSchema = z.object({
  presetId: z.string().trim().min(1, "presetId is required"),
});
