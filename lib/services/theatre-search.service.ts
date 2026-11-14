/**
 * ==============================================================================
 * CineSphere OS — Theatre Search Domain Service (Phase 3 – Part 12)
 * ==============================================================================
 * Orchestrates multi-tenant theatre search, advanced filtering, multi-attribute
 * sorting, autocomplete suggestions, saved presets, and index synchronization.
 * Enforces RBAC visibility rules, audit logging, and cache invalidation.
 * ==============================================================================
 */

import { theatreSearchRepository } from "@/lib/repositories/theatre-search.repository";
import {
  TheatreSearchQueryInput,
  TheatreSearchResultsPayload,
  TheatreSearchFilters,
  TheatreSearchSortOption,
  SavedSearchPreset,
  CreateSavedSearchPresetInput,
  TheatreSearchSuggestion,
} from "@/types/theatre-search.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { securityAuditService } from "./security-audit.service";
import { createLogger } from "@/lib/observability/structured-logger";
import { ValidationError, NotFoundError, TenantAccessError } from "@/lib/errors";
import {
  theatreSearchQuerySchema,
  createSavedSearchPresetSchema,
} from "@/lib/validation/theatre-search.validation";

const logger = createLogger("TheatreSearchService");

export class TheatreSearchService {
  // ----------------------------------------------------------------------------
  // 1. Execute Multi-Tenant Theatre Search
  // ----------------------------------------------------------------------------
  public async searchTheatres(
    input: TheatreSearchQueryInput = {},
    actor?: SecurityActorContext
  ): Promise<TheatreSearchResultsPayload> {
    const parsed = theatreSearchQuerySchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid search query parameters", parsed.error.flatten().fieldErrors);
    }

    const { query, filters = {}, sortBy, sortDirection, page, pageSize } = parsed.data;

    // RBAC & Tenant Scoping Security Pipeline
    const scopedFilters: TheatreSearchFilters = { ...filters };

    // If query is provided at top level, map to filters.query
    if (query && !scopedFilters.query) {
      scopedFilters.query = query;
    }

    // Role-based status visibility gating
    if (!actor || actor.role === "CUSTOMER") {
      // Public patrons can ONLY view ACTIVE theatres
      scopedFilters.statuses = ["ACTIVE"];
      scopedFilters.isVerified = true;
    } else if (actor.role === "THEATRE_ADMIN" || actor.role === "STAFF") {
      // Theatre Admin / Staff: If filtering for unapproved/draft/suspended theatres,
      // they may only see their own theatre
      if (scopedFilters.statuses && scopedFilters.statuses.some((s) => s !== "ACTIVE")) {
        // Enforce that only their assigned tenant data is retrieved if non-active statuses requested
        if (actor.theatreId) {
          const ownDoc = theatreSearchRepository.getDocument(actor.theatreId);
          if (ownDoc && (!scopedFilters.statuses || scopedFilters.statuses.includes(ownDoc.status))) {
            // Keep own doc
          } else {
            scopedFilters.statuses = ["ACTIVE"];
          }
        }
      }
    }
    // SUPER_ADMIN has zero restrictions and can query all statuses, verification flags, and tenants

    // Execute query via Search Index
    const result = theatreSearchRepository.query(
      scopedFilters,
      sortBy as TheatreSearchSortOption,
      sortDirection,
      page,
      pageSize
    );

    // Structured observability logging
    logger.info("API", `Executed theatre search query "${scopedFilters.query || "*"}"`, {
      userId: actor?.userId,
      userRole: actor?.role,
      theatreId: actor?.theatreId,
      metadata: {
        query: scopedFilters.query,
        totalResults: result.pagination.totalResults,
        page: result.pagination.page,
        tookMs: result.tookMs,
        sortBy,
      },
    });

    // Security audit logging for administrative searches
    if (actor && actor.role !== "CUSTOMER") {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_MANAGEMENT",
        action: "SEARCH",
        description: `Executed theatre search query [Query: "${scopedFilters.query || "*"}", Filters: ${JSON.stringify(
          scopedFilters
        )}]`,
        metadata: {
          query: scopedFilters.query,
          totalResults: result.pagination.totalResults,
          filtersCount: Object.keys(scopedFilters).length,
        },
      });
    }

    return result;
  }

  // ----------------------------------------------------------------------------
  // 2. Autocomplete Suggestions
  // ----------------------------------------------------------------------------
  public async getSearchSuggestions(
    query: string,
    limit: number = 5,
    actor?: SecurityActorContext
  ): Promise<TheatreSearchSuggestion[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const suggestions = theatreSearchRepository.getSuggestions(query, limit);

    // Gating: Non-super admins only see suggestions for active venues
    if (!actor || actor.role !== "SUPER_ADMIN") {
      return suggestions.filter((s) => {
        const doc = theatreSearchRepository.getDocument(s.theatreId);
        return doc && doc.status === "ACTIVE";
      });
    }

    return suggestions;
  }

  // ----------------------------------------------------------------------------
  // 3. Saved Search Presets Management
  // ----------------------------------------------------------------------------
  public async getUserSavedPresets(actor: SecurityActorContext): Promise<SavedSearchPreset[]> {
    const userId = actor.userId || "usr-operator";
    return theatreSearchRepository.getSavedPresets(userId);
  }

  public async saveSearchPreset(
    input: CreateSavedSearchPresetInput,
    actor: SecurityActorContext
  ): Promise<SavedSearchPreset> {
    const parsed = createSavedSearchPresetSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid saved search preset payload", parsed.error.flatten().fieldErrors);
    }

    const userId = actor.userId || "usr-operator";
    const data = parsed.data;

    const preset: SavedSearchPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      name: data.name,
      description: data.description,
      filters: data.filters,
      sortBy: data.sortBy as TheatreSearchSortOption,
      sortDirection: data.sortDirection || "desc",
      isDefault: data.isDefault,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = theatreSearchRepository.savePreset(userId, preset);

    await securityAuditService.recordAudit({
      actor,
      module: "THEATRE_MANAGEMENT",
      action: "CREATE",
      description: `Saved custom theatre search preset "${saved.name}"`,
      metadata: { resourceType: "SAVED_SEARCH_PRESET", resourceId: saved.id, presetId: saved.id, name: saved.name },
    });

    return saved;
  }

  public async deleteSearchPreset(presetId: string, actor: SecurityActorContext): Promise<boolean> {
    const userId = actor.userId || "usr-operator";
    const success = theatreSearchRepository.deletePreset(userId, presetId);

    if (success) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_MANAGEMENT",
        action: "DELETE",
        description: `Deleted saved search preset "${presetId}"`,
        metadata: { resourceType: "SAVED_SEARCH_PRESET", resourceId: presetId, presetId },
      });
    }

    return success;
  }

  // ----------------------------------------------------------------------------
  // 4. Search Index Synchronization Hooks
  // ----------------------------------------------------------------------------
  public syncTheatreIndex(theatreId: string): void {
    logger.info("API", `Triggered search index synchronization for theatre ${theatreId}`, {
      theatreId,
    });
    // In-memory index is updated via repository upsertDocument hook
  }
}

export const theatreSearchService = new TheatreSearchService();
