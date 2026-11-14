/**
 * ==============================================================================
 * CineSphere OS — Generic Search Query Builder Engine (Phase 3 – Part 12)
 * ==============================================================================
 * Reusable, high-performance in-memory search and filtering engine.
 * Decouples domain search requests from underlying datastores.
 * Designed to power Theatres now, and Movies, Shows, Halls, Staff, and Bookings later.
 * ==============================================================================
 */

import {
  GenericPaginationResult,
  FacetBucket,
} from "@/types/theatre-search.types";

export interface MatchScoreResult<T> {
  item: T;
  score: number;
  matchedTokens: string[];
}

/**
 * Tokenizes and normalizes raw search strings for safe token comparison.
 */
export function tokenizeSearchQuery(rawQuery: string): string[] {
  if (!rawQuery) return [];
  return rawQuery
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((token) => token.length > 0);
}

/**
 * Computes search score based on token occurrences across weighted fields.
 */
export function calculateMatchScore(
  tokens: string[],
  fields: { text: string; weight: number }[]
): { score: number; matchedTokens: string[] } {
  if (tokens.length === 0) return { score: 1, matchedTokens: [] };

  let totalScore = 0;
  const matchedTokens = new Set<string>();

  for (const token of tokens) {
    let tokenMatched = false;
    for (const field of fields) {
      const fieldText = field.text.toLowerCase();
      if (fieldText.includes(token)) {
        tokenMatched = true;
        matchedTokens.add(token);
        // Exact token match vs substring match weighting
        if (fieldText === token) {
          totalScore += field.weight * 3;
        } else if (fieldText.startsWith(token)) {
          totalScore += field.weight * 2;
        } else {
          totalScore += field.weight;
        }
      }
    }
    // If a required token didn't match any field, penalize score
    if (!tokenMatched) {
      return { score: 0, matchedTokens: [] };
    }
  }

  return { score: totalScore, matchedTokens: Array.from(matchedTokens) };
}

/**
 * Helper to compute facet distributions over an array of items.
 */
export function buildFacetDistribution<T>(
  items: T[],
  keyExtractor: (item: T) => string | string[] | null | undefined
): FacetBucket[] {
  const counts = new Map<string, number>();

  for (const item of items) {
    const rawVal = keyExtractor(item);
    if (!rawVal) continue;

    if (Array.isArray(rawVal)) {
      for (const val of rawVal) {
        if (!val) continue;
        const normalized = val.trim();
        counts.set(normalized, (counts.get(normalized) || 0) + 1);
      }
    } else {
      const normalized = rawVal.trim();
      counts.set(normalized, (counts.get(normalized) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({
      value,
      label: value,
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/**
 * Paginates an array and returns pagination metadata.
 */
export function applyPagination<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 12
): { paginatedItems: T[]; pagination: GenericPaginationResult } {
  const validPage = Math.max(1, page);
  const validPageSize = Math.max(1, Math.min(100, pageSize));
  const totalResults = items.length;
  const totalPages = Math.ceil(totalResults / validPageSize) || 1;

  const startIndex = (validPage - 1) * validPageSize;
  const paginatedItems = items.slice(startIndex, startIndex + validPageSize);

  return {
    paginatedItems,
    pagination: {
      page: validPage,
      pageSize: validPageSize,
      totalResults,
      totalPages,
      hasNextPage: validPage < totalPages,
      hasPrevPage: validPage > 1,
    },
  };
}
