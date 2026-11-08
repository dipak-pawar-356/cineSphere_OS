import { eq, and, sql, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

/**
 * ==============================================================================
 * CineSphere OS - Multi-Tenant Security & Isolation Engine
 * Strict tenant boundary assertion and scoped query helpers
 * ==============================================================================
 */

export class TenantIsolationViolationError extends Error {
  constructor(message: string, public readonly attemptedTenantId?: string, public readonly activeTenantId?: string) {
    super(`[Security Breach / Tenant Isolation Violation]: ${message}`);
    this.name = "TenantIsolationViolationError";
  }
}

/**
 * Validates cross-tenant boundaries.
 * Super Admin has platform-wide bypass access.
 * Non-Super-Admins can NEVER access resources belonging to a different theatre.
 */
export function validateTenantAccess(
  entityTheatreId: string | null | undefined,
  activeTenantId: string | null | undefined,
  isSuperAdmin = false
): boolean {
  // Super Admin has unrestricted access across all tenants
  if (isSuperAdmin) return true;

  // Platform-wide public entities (null theatreId) can be read by anyone
  if (!entityTheatreId) return true;

  // If user has no active tenant context or mismatch occurs, reject access immediately
  if (!activeTenantId || activeTenantId !== entityTheatreId) {
    return false;
  }

  return true;
}

/**
 * Asserts tenant isolation and throws a hard error if boundaries are violated.
 */
export function assertTenantIsolation(
  entityTheatreId: string | null | undefined,
  activeTenantId: string | null | undefined,
  isSuperAdmin = false,
  resourceName = "Resource"
): void {
  if (!validateTenantAccess(entityTheatreId, activeTenantId, isSuperAdmin)) {
    throw new TenantIsolationViolationError(
      `Access denied to ${resourceName}. Tenant '${activeTenantId}' cannot operate on entity owned by '${entityTheatreId}'.`,
      entityTheatreId || undefined,
      activeTenantId || undefined
    );
  }
}

/**
 * Creates a Drizzle SQL equality filter scoping any query by theatre ID.
 * Returns null condition if Super Admin requests without tenant scope.
 */
export function withTenant(theatreColumn: PgColumn, theatreId: string | null | undefined) {
  if (!theatreId) {
    return sql`TRUE`;
  }
  return eq(theatreColumn, theatreId);
}
