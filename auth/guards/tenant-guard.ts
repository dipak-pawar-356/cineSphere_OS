import { AuthUser } from "../types/user.types";
import { UserRole } from "../types/role.types";

export interface TenantAccessEvaluation {
  allowed: boolean;
  reason?: string;
  userTheatreId?: string | null;
  targetTheatreId?: string | null;
}

/**
 * Tenant Isolation Guard
 * Enforces strict multi-tenant isolation across all cinema operations.
 *
 * Rules:
 * 1. Super Admin is platform-wide and can access any theatre.
 * 2. Customers are tenant-agnostic patrons and can book at any theatre.
 * 3. Theatre Admins, Hall Managers, and Staff can ONLY access resources
 *    belonging to their explicitly assigned theatreId.
 */
export function validateTenantAccess(
  user: AuthUser | null,
  targetTheatreId: string | null | undefined
): TenantAccessEvaluation {
  if (!user) {
    return {
      allowed: false,
      reason: "User session is not authenticated.",
    };
  }

  // 1. Super Admin possesses platform-wide bypass
  if (user.role === "SUPER_ADMIN") {
    return {
      allowed: true,
      userTheatreId: user.theatreId,
      targetTheatreId: targetTheatreId || null,
    };
  }

  // 2. Customers can access public and booking resources across theatres
  if (user.role === "CUSTOMER") {
    return {
      allowed: true,
      userTheatreId: null,
      targetTheatreId: targetTheatreId || null,
    };
  }

  // 3. If target resource does not require a specific tenant, allow
  if (!targetTheatreId) {
    return {
      allowed: true,
      userTheatreId: user.theatreId,
      targetTheatreId: null,
    };
  }

  // 4. Multi-Tenant Cross-Tenant Access Enforcement
  if (!user.theatreId) {
    return {
      allowed: false,
      reason: "Tenant-scoped role missing assigned theatre association.",
      userTheatreId: null,
      targetTheatreId,
    };
  }

  if (user.theatreId !== targetTheatreId) {
    return {
      allowed: false,
      reason: `Tenant Isolation Violation: User belonging to theatre [${user.theatreId}] attempted to access restricted resource of theatre [${targetTheatreId}].`,
      userTheatreId: user.theatreId,
      targetTheatreId,
    };
  }

  return {
    allowed: true,
    userTheatreId: user.theatreId,
    targetTheatreId,
  };
}

