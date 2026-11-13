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
  THEATRE_MEDIA: (theatreId: string) => `theatre-media:${theatreId}`,
  PUBLIC_THEATRE_MEDIA: (slugOrId: string) => `public-theatre-media:${slugOrId}`,
  THEATRE_PROFILE: (theatreId: string) => `theatre-profile:${theatreId}`,
  PUBLIC_THEATRE_PROFILE: (slugOrId: string) => `public-theatre-profile:${slugOrId}`,
  THEATRE_LOCATION: (theatreId: string) => `theatre-location:${theatreId}`,
  PUBLIC_THEATRE_LOCATION: (slugOrId: string) => `public-theatre-location:${slugOrId}`,
  AMENITY_CATALOG: "amenity-catalog:global",
  THEATRE_AMENITIES: (theatreId: string) => `theatre-amenities:${theatreId}`,
  PUBLIC_THEATRE_AMENITIES: (slugOrId: string) => `public-theatre-amenities:${slugOrId}`,
  THEATRE_CONTACTS: (theatreId: string) => `theatre-contacts:${theatreId}`,
  PUBLIC_THEATRE_CONTACTS: (slugOrId: string) => `public-theatre-contacts:${slugOrId}`,
  THEATRE_BUSINESS: (theatreId: string) => `theatre-business:${theatreId}`,
  PUBLIC_THEATRE_BUSINESS: (slugOrId: string) => `public-theatre-business:${slugOrId}`,
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

// ------------------------------------------------------------------------------
// Cache Policy Presets (Request Cache, Route Cache, Data Cache, CDN, Image)
// ------------------------------------------------------------------------------

export type CacheLayerPolicy =
  | "NO_STORE"        // Financial / transactional / personalized auth routes
  | "REQUEST_MEMO"    // React per-request deduplication
  | "DATA_SHORT"      // 60s revalidate for dynamic show availability
  | "ROUTE_ISR"       // 300s ISR for movie directory & theatre pages
  | "CDN_EDGE_CACHE"  // Stale-while-revalidate edge CDN caching
  | "IMMUTABLE_ASSET"; // Static JS/CSS/images (1 year immutable)

export function buildCacheControlHeader(policy: CacheLayerPolicy): string {
  switch (policy) {
    case "NO_STORE":
      return "no-store, no-cache, must-revalidate, private";
    case "REQUEST_MEMO":
      return "private, max-age=0, must-revalidate";
    case "DATA_SHORT":
      return "public, s-maxage=60, stale-while-revalidate=30";
    case "ROUTE_ISR":
      return "public, s-maxage=300, stale-while-revalidate=600";
    case "CDN_EDGE_CACHE":
      return "public, s-maxage=3600, stale-while-revalidate=86400";
    case "IMMUTABLE_ASSET":
      return "public, max-age=31536000, immutable";
  }
}

/**
 * Future Distributed Cache Adapter Interface (Phase 3 Redis / Upstash Placeholder)
 */
export interface DistributedCacheAdapterPlaceholder {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number, tags?: string[]): Promise<void>;
  invalidateTag(tag: string): Promise<number>;
}

export const futureRedisCacheAdapter: DistributedCacheAdapterPlaceholder = {
  async get<T>(key: string): Promise<T | null> {
    const now = Date.now();
    const hit = queryCache.get(key) as CacheEntry<T> | undefined;
    return hit && hit.expiresAt > now ? hit.data : null;
  },
  async set<T>(key: string, value: T, ttlSeconds: number, tags: string[] = []): Promise<void> {
    queryCache.set(key, {
      data: value,
      expiresAt: Date.now() + ttlSeconds * 1000,
      tags,
    });
  },
  async invalidateTag(tag: string): Promise<number> {
    return invalidateCacheByTag(tag);
  },
};

/**
 * Virtualization Placeholder Helper for rendering large datasets (e.g. 5,000+ tickets or logs)
 */
export interface VirtualWindowSlice<T> {
  visibleItems: T[];
  startIndex: number;
  endIndex: number;
  offsetTopPx: number;
  totalHeightPx: number;
}

export function computeVirtualSlice<T>(
  items: T[],
  scrollTopPx: number,
  viewportHeightPx: number,
  rowHeightPx: number,
  overscanCount = 5
): VirtualWindowSlice<T> {
  const safeRowHeight = Math.max(1, rowHeightPx);
  const startIndex = Math.max(0, Math.floor(scrollTopPx / safeRowHeight) - overscanCount);
  const visibleCount = Math.ceil(viewportHeightPx / safeRowHeight) + overscanCount * 2;
  const endIndex = Math.min(items.length, startIndex + visibleCount);

  return {
    visibleItems: items.slice(startIndex, endIndex),
    startIndex,
    endIndex,
    offsetTopPx: startIndex * safeRowHeight,
    totalHeightPx: items.length * safeRowHeight,
  };
}


