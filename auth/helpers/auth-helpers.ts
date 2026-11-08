import { AuthUser } from "../types/user.types";
import { UserRole } from "../types/role.types";
import { AppPermission } from "../types/permission.types";
import { TenantContext } from "../types/session.types";
import { isRoleAtLeast } from "../roles/role-hierarchy";
import { checkRolePermission } from "../permissions/rbac-matrix";
import { SessionService } from "../services/session-service";
import { ROLE_LANDING_ROUTES } from "../constants/auth-routes";
import { validateTenantAccess, TenantAccessEvaluation } from "../guards/tenant-guard";

/**
 * Returns the currently authenticated user from session storage.
 */
export function getCurrentUser(): AuthUser | null {
  return SessionService.getStoredUser();
}

/**
 * Checks whether the current session is authenticated.
 */
export function isAuthenticated(user?: AuthUser | null): boolean {
  const activeUser = user !== undefined ? user : getCurrentUser();
  return Boolean(activeUser && activeUser.id);
}

/**
 * Returns the active user's role.
 */
export function getCurrentRole(user?: AuthUser | null): UserRole | null {
  const activeUser = user !== undefined ? user : getCurrentUser();
  return activeUser?.role || null;
}

/**
 * Returns the active tenant context for the current user.
 */
export function getCurrentTheatre(user?: AuthUser | null): TenantContext {
  const activeUser = user !== undefined ? user : getCurrentUser();
  return SessionService.getTenantContext(activeUser);
}

/**
 * Checks if the user holds a specific role or higher in the hierarchy.
 */
export function hasRole(requiredRole: UserRole, user?: AuthUser | null): boolean {
  const activeUser = user !== undefined ? user : getCurrentUser();
  if (!activeUser) return false;
  return isRoleAtLeast(activeUser.role, requiredRole);
}

/**
 * Checks if the user holds an exact role.
 */
export function hasExactRole(targetRole: UserRole, user?: AuthUser | null): boolean {
  const activeUser = user !== undefined ? user : getCurrentUser();
  return activeUser?.role === targetRole;
}

/**
 * Checks if the user possesses a granular application permission.
 */
export function hasPermission(permission: AppPermission, user?: AuthUser | null): boolean {
  const activeUser = user !== undefined ? user : getCurrentUser();
  if (!activeUser) return false;
  return checkRolePermission(activeUser.role, permission);
}

/**
 * Convenience Role Guards
 */
export function isSuperAdmin(user?: AuthUser | null): boolean {
  return hasExactRole("SUPER_ADMIN", user);
}

export function isTheatreAdmin(user?: AuthUser | null): boolean {
  return hasExactRole("THEATRE_ADMIN", user);
}

export function isHallManager(user?: AuthUser | null): boolean {
  return hasExactRole("HALL_MANAGER", user);
}

export function isStaff(user?: AuthUser | null): boolean {
  return hasExactRole("STAFF", user);
}

export function isCustomer(user?: AuthUser | null): boolean {
  return hasExactRole("CUSTOMER", user);
}

/**
 * Resolves the designated dashboard landing route for a given role.
 */
export function getLandingRouteForRole(role: UserRole): string {
  return ROLE_LANDING_ROUTES[role] || ROLE_LANDING_ROUTES.CUSTOMER;
}

/**
 * Verifies tenant access against target cinema complex.
 */
export function checkTenantAccess(
  targetTheatreId: string | null | undefined,
  user?: AuthUser | null
): TenantAccessEvaluation {
  const activeUser = user !== undefined ? user : getCurrentUser();
  return validateTenantAccess(activeUser, targetTheatreId);
}

