/**
 * ==============================================================================
 * CineSphere OS — SQL Injection Defense & Query Guard (Phase 2 – Part 16)
 * ==============================================================================
 * Complements Drizzle ORM parameterized queries & prepared statements with
 * strict dynamic identifier whitelisting, limit clamping, and payload inspection.
 * Raw SQL string interpolation from user input is strictly prohibited.
 * ==============================================================================
 */

import { ValidationError } from "@/lib/errors/app-error";

const SAFE_SQL_IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/;
const SUSPICIOUS_SQLI_PATTERNS = [
  /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|EXEC)\b\s+(ALL|FROM|INTO|TABLE|DATABASE))/i,
  /(--|\/\*|\*\/|;\s*DROP|;\s*DELETE)/i,
  /(\bOR\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?)/i,
];

/**
 * Validates that a dynamic SQL column or alias conforms strictly to ASCII
 * alphanumeric/underscore identifiers (prevents column/ORDER BY injection).
 */
export function validateSqlIdentifier(identifier: string): string {
  if (!identifier || !SAFE_SQL_IDENTIFIER_REGEX.test(identifier)) {
    throw new ValidationError(`Invalid database identifier supplied: '${identifier}'`);
  }
  return identifier;
}

/**
 * Enforces an explicit allowlist on dynamic sort columns before passing to Drizzle `orderBy`.
 */
export function whitelistSortColumn<T extends string>(
  requestedColumn: string | undefined,
  allowedColumns: readonly T[],
  fallbackColumn: T
): T {
  if (!requestedColumn) return fallbackColumn;
  const matched = allowedColumns.find((col) => col === requestedColumn);
  return matched ?? fallbackColumn;
}

/**
 * Detects blatant SQL injection signatures in text search payloads for audit alerts.
 */
export function detectSqlInjectionPattern(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  return SUSPICIOUS_SQLI_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Safely bounds SQL pagination limit & offset integers.
 */
export function buildSafePaginationBounds(page = 1, pageSize = 20, maxLimit = 100) {
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  const safeLimit = Number.isFinite(pageSize)
    ? Math.min(maxLimit, Math.max(1, Math.floor(pageSize)))
    : 20;
  return {
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
  };
}

