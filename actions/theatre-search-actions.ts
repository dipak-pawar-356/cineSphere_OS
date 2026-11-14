"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createProtectedAction } from "@/lib/security/action-guard";
import { theatreSearchService } from "@/lib/services/theatre-search.service";
import {
  theatreSearchQuerySchema,
  theatreSearchFiltersSchema,
  createSavedSearchPresetSchema,
  deleteSavedSearchPresetSchema,
} from "@/lib/validation/theatre-search.validation";
import type {
  TheatreSearchResultsPayload,
  SavedSearchPreset,
  TheatreSearchSuggestion,
  TheatreSearchFilters,
  TheatreSearchSortOption,
} from "@/types/theatre-search.types";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Search & Filters Server Actions (Phase 3 – Part 12)
 * ==============================================================================
 * Production server actions powering multi-tenant search, filtering, sorting,
 * saved presets, and autocomplete suggestions.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Search Theatres (Full Search + Filter + Sort + Pagination)
// ------------------------------------------------------------------------------
export const searchTheatresAction = createProtectedAction<
  z.input<typeof theatreSearchQuerySchema>,
  TheatreSearchResultsPayload
>(
  {
    actionName: "searchTheatresAction",
    schema: theatreSearchQuerySchema,
    rateLimitCategory: "SEARCH",
    auditModule: "THEATRE_SEARCH",
    auditAction: "SEARCH",
  },
  async (input, context) => {
    return await theatreSearchService.searchTheatres(input, context.actor);
  }
);

// ------------------------------------------------------------------------------
// 2. Filter Theatres (Dedicated Filter Runner)
// ------------------------------------------------------------------------------
const FilterInputSchema = z.object({
  filters: theatreSearchFiltersSchema,
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(12),
  sortBy: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const filterTheatresAction = createProtectedAction<
  z.input<typeof FilterInputSchema>,
  TheatreSearchResultsPayload
>(
  {
    actionName: "filterTheatresAction",
    schema: FilterInputSchema,
    rateLimitCategory: "SEARCH",
    auditModule: "THEATRE_SEARCH",
    auditAction: "FILTER",
  },
  async (input, context) => {
    return await theatreSearchService.searchTheatres(
      {
        filters: input.filters,
        sortBy: input.sortBy as TheatreSearchSortOption,
        sortDirection: input.sortDirection,
        page: input.page,
        pageSize: input.pageSize,
      },
      context.actor
    );
  }
);

// ------------------------------------------------------------------------------
// 3. Sort Results
// ------------------------------------------------------------------------------
const SortInputSchema = z.object({
  sortBy: z.enum([
    "NEWEST",
    "OLDEST",
    "NAME_ASC",
    "NAME_DESC",
    "RECENTLY_UPDATED",
    "MOST_SCREENS",
    "LARGEST_CAPACITY",
    "DISTANCE_ASC",
  ]),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  filters: theatreSearchFiltersSchema.optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(12),
});

export const sortTheatresAction = createProtectedAction<
  z.input<typeof SortInputSchema>,
  TheatreSearchResultsPayload
>(
  {
    actionName: "sortTheatresAction",
    schema: SortInputSchema,
    rateLimitCategory: "SEARCH",
    auditModule: "THEATRE_SEARCH",
    auditAction: "SORT",
  },
  async (input, context) => {
    return await theatreSearchService.searchTheatres(
      {
        filters: input.filters,
        sortBy: input.sortBy as TheatreSearchSortOption,
        sortDirection: input.sortDirection,
        page: input.page,
        pageSize: input.pageSize,
      },
      context.actor
    );
  }
);

// ------------------------------------------------------------------------------
// 4. Reset Filters Action
// ------------------------------------------------------------------------------
export async function resetFiltersAction(): Promise<TheatreSearchFilters> {
  return {
    theatreType: "ALL",
    chainType: "ALL",
  };
}

// ------------------------------------------------------------------------------
// 5. Load Search Suggestions (Autocomplete Placeholder)
// ------------------------------------------------------------------------------
const SuggestionInputSchema = z.object({
  query: z.string().trim().min(1).max(50),
  limit: z.number().int().min(1).max(20).default(5),
});

export const loadSearchSuggestionsAction = createProtectedAction<
  z.input<typeof SuggestionInputSchema>,
  TheatreSearchSuggestion[]
>(
  {
    actionName: "loadSearchSuggestionsAction",
    schema: SuggestionInputSchema,
    rateLimitCategory: "SEARCH",
  },
  async (input, context) => {
    return await theatreSearchService.getSearchSuggestions(input.query, input.limit, context.actor);
  }
);

// ------------------------------------------------------------------------------
// 6. Save Search Preset (Enterprise Saved Searches)
// ------------------------------------------------------------------------------
export const saveSearchPresetAction = createProtectedAction<
  z.input<typeof createSavedSearchPresetSchema>,
  SavedSearchPreset
>(
  {
    actionName: "saveSearchPresetAction",
    schema: createSavedSearchPresetSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    auditModule: "THEATRE_SEARCH",
    auditAction: "CREATE_PRESET",
  },
  async (input, context) => {
    const preset = await theatreSearchService.saveSearchPreset(input, context.actor);
    revalidatePath("/theatres");
    revalidatePath("/dashboard/theatres");
    return preset;
  }
);

// ------------------------------------------------------------------------------
// 7. Load Saved Search Presets
// ------------------------------------------------------------------------------
export const loadSavedSearchesAction = createProtectedAction<
  void,
  SavedSearchPreset[]
>(
  {
    actionName: "loadSavedSearchesAction",
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
  },
  async (_, context) => {
    return await theatreSearchService.getUserSavedPresets(context.actor);
  }
);

// ------------------------------------------------------------------------------
// 8. Delete Saved Search Preset
// ------------------------------------------------------------------------------
export const deleteSearchPresetAction = createProtectedAction<
  z.input<typeof deleteSavedSearchPresetSchema>,
  { success: boolean }
>(
  {
    actionName: "deleteSearchPresetAction",
    schema: deleteSavedSearchPresetSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    auditModule: "THEATRE_SEARCH",
    auditAction: "DELETE_PRESET",
  },
  async (input, context) => {
    const success = await theatreSearchService.deleteSearchPreset(input.presetId, context.actor);
    revalidatePath("/theatres");
    revalidatePath("/dashboard/theatres");
    return { success };
  }
);
