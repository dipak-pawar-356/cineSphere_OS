/**
 * ==============================================================================
 * CineSphere OS — Caching Architecture & Performance Engine (Phase 2 – Part 16)
 * ==============================================================================
 * Multi-layer caching strategy: In-memory query memoization, cache tag registry,
 * deterministic pagination helpers, and invalidation tag dispatchers.
 * ==============================================================================
 */

// Cache Invalidation Tags
export const CACHE_TAGS = {
  THEATRE: (theatreId: string) => `theatre:${theatreId}`,
  PAYMENT_CONFIGS: (theatreId: string) => `payment-configs:${theatreId}`,
  SHOW: (showId: string) => `show:${showId}`,
  SHOWS_DAILY: (theatreId: string, date: string) => `shows:${theatreId}:${date}`,
  HALL_LAYOUT: (hallId: string) => `hall:${hallId}:layout`,
  PRICING_PROFILE: (profileId: string) => `pricing:${profileId}`,
  ANALYTICS: (theatreId: string) => `analytics:${theatreId}`,
  PLATFORM_METRICS: "platform:metrics",
} as const;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  tags: string[];
}

// In-Memory Fast Query Cache
const queryCache = new Map<string, CacheEntry<unknown>>();

/**
 * Executes a function with in-memory memoized caching for read-heavy operations.
 */
export async function withQueryCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: {
    ttlSeconds?: number;
    tags?: string[];
  }
): Promise<T> {
  const now = Date.now();
  const cached = queryCache.get(key) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const data = await fetchFn();
  const ttlMs = (options?.ttlSeconds || 60) * 1000;

  queryCache.set(key, {
    data,
    expiresAt: now + ttlMs,
    tags: options?.tags || [],
  });

  return data;
}

/**
 * Invalidates cache entries matching specific cache tags.
 */
export function invalidateCacheByTag(tag: string): number {
  let invalidatedCount = 0;
  for (const [key, entry] of queryCache.entries()) {
    if (entry.tags.includes(tag)) {
      queryCache.delete(key);
      invalidatedCount++;
    }
  }
  return invalidatedCount;
}

/**
 * Flushes all cached queries (e.g. on global settings reload).
 */
export function clearAllQueryCache(): void {
  queryCache.clear();
}

/**
 * Reusable, mathematically bounded pagination helper.
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function paginateArray<T>(
  items: T[],
  params?: PaginationParams,
  defaultPageSize = 20,
  maxPageSize = 100
): PaginatedResult<T> {
  const page = Math.max(1, params?.page || 1);
  const pageSize = Math.min(maxPageSize, Math.max(1, params?.pageSize || defaultPageSize));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const startIndex = (page - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  return {
    items: paginatedItems,
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

