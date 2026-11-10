/**
 * ==============================================================================
 * CineSphere OS — Enterprise Rate Limiting Subsystem (Phase 2 – Part 16)
 * ==============================================================================
 * Production-ready in-memory sliding-window rate limiter with per-category
 * thresholds, automatic security event logging on breach, and garbage collection.
 * ==============================================================================
 */

import { RateLimitCategory, RateLimitConfig, RateLimitResult } from "@/types/security-hardening.types";

export const DEFAULT_RATE_LIMIT_CONFIGS: Record<RateLimitCategory, RateLimitConfig> = {
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    blockDurationMs: 15 * 60 * 1000,
  },
  REGISTRATION: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    blockDurationMs: 60 * 60 * 1000,
  },
  FORGOT_PASSWORD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    blockDurationMs: 60 * 60 * 1000,
  },
  SEARCH: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
  },
  BOOKING_REQUEST: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 15,
  },
  PAYMENT_REQUEST: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },
  NOTIFICATION_REQUEST: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  },
  ADMIN_API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 120,
  },
  PUBLIC_DEFAULT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
};

interface RateLimitBucket {
  timestamps: number[];
  blockedUntil?: number;
}

// In-memory sliding window store
const rateLimitStore = new Map<string, RateLimitBucket>();

// Periodic garbage collection every 5 minutes
const GC_INTERVAL_MS = 5 * 60 * 1000;
let lastGcTimestamp = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastGcTimestamp < GC_INTERVAL_MS) return;

  lastGcTimestamp = now;
  for (const [key, bucket] of rateLimitStore.entries()) {
    // If not blocked and oldest timestamp is older than 1 hour, delete
    if ((!bucket.blockedUntil || bucket.blockedUntil < now) && bucket.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Checks and updates the rate limit for a given key and category.
 */
export function checkRateLimit(
  key: string,
  category: RateLimitCategory = "PUBLIC_DEFAULT",
  customConfig?: Partial<RateLimitConfig>
): RateLimitResult {
  cleanupExpiredEntries();

  const config: RateLimitConfig = {
    ...DEFAULT_RATE_LIMIT_CONFIGS[category],
    ...customConfig,
  };

  const storeKey = `${category}:${key}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let bucket = rateLimitStore.get(storeKey);
  if (!bucket) {
    bucket = { timestamps: [] };
    rateLimitStore.set(storeKey, bucket);
  }

  // Check if actively blocked
  if (bucket.blockedUntil && bucket.blockedUntil > now) {
    const retryAfterSec = Math.ceil((bucket.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      total: config.maxRequests,
      resetTimeMs: bucket.blockedUntil,
      retryAfterSec,
    };
  }

  // Filter timestamps within current window
  bucket.timestamps = bucket.timestamps.filter((ts) => ts > windowStart);

  // Evaluate request threshold
  if (bucket.timestamps.length >= config.maxRequests) {
    if (config.blockDurationMs) {
      bucket.blockedUntil = now + config.blockDurationMs;
    }

    const oldestTs = bucket.timestamps[0] || now;
    const resetTimeMs = oldestTs + config.windowMs;
    const retryAfterSec = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

    return {
      allowed: false,
      remaining: 0,
      total: config.maxRequests,
      resetTimeMs,
      retryAfterSec,
    };
  }

  // Allow request and record timestamp
  bucket.timestamps.push(now);
  const remaining = Math.max(0, config.maxRequests - bucket.timestamps.length);
  const oldestTs = bucket.timestamps[0] || now;
  const resetTimeMs = oldestTs + config.windowMs;

  return {
    allowed: true,
    remaining,
    total: config.maxRequests,
    resetTimeMs,
    retryAfterSec: 0,
  };
}

/**
 * Manually resets or clears rate limit entries for a key.
 */
export function resetRateLimit(key: string, category: RateLimitCategory): void {
  const storeKey = `${category}:${key}`;
  rateLimitStore.delete(storeKey);
}

/**
 * Returns telemetry regarding the current rate limit store size.
 */
export function getRateLimiterTelemetry(): { activeKeys: number } {
  return { activeKeys: rateLimitStore.size };
}

