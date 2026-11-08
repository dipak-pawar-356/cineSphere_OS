import { UserRole } from "../types/role.types";
import { PROTECTED_ROUTE_PREFIXES, PUBLIC_ROUTES } from "../constants/auth-routes";
import { isRoleAtLeast } from "../roles/role-hierarchy";

/**
 * Checks whether a pathname is an unauthenticated public route.
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route.includes("(.*)")) {
      const base = route.replace("/(.*)", "");
      return pathname === base || pathname.startsWith(`${base}/`);
    }
    return pathname === route;
  });
}

/**
 * Returns whether a route requires authentication.
 */
export function isProtectedRoute(pathname: string): boolean {
  if (isPublicRoute(pathname)) {
    return false;
  }

  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/theatre") ||
    pathname.startsWith("/hall") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/profile")
  );
}

/**
 * Determines the required role for a given route path.
 */
export function getRequiredRoleForPath(pathname: string): UserRole | null {
  if (pathname.startsWith("/dashboard")) return "SUPER_ADMIN";
  if (pathname.startsWith("/theatre")) return "THEATRE_ADMIN";
  if (pathname.startsWith("/hall")) return "HALL_MANAGER";
  if (pathname.startsWith("/staff")) return "STAFF";
  if (pathname.startsWith("/profile")) return "CUSTOMER";
  return null;
}

/**
 * Evaluates whether a user's role has permission to access the target pathname.
 */
export function canRoleAccessPath(userRole: UserRole, pathname: string): boolean {
  // 1. Super Admin has unrestricted platform access
  if (userRole === "SUPER_ADMIN") {
    return true;
  }

  // 2. Exact or hierarchical route checks
  if (pathname.startsWith("/dashboard")) {
    return false;
  }

  if (pathname.startsWith("/theatre")) {
    // Hall Manager can access /theatre/halls specifically
    if (pathname.startsWith("/theatre/halls") && userRole === "HALL_MANAGER") {
      return true;
    }
    return isRoleAtLeast(userRole, "THEATRE_ADMIN");
  }

  if (pathname.startsWith("/hall")) {
    return isRoleAtLeast(userRole, "HALL_MANAGER");
  }

  if (pathname.startsWith("/staff")) {
    return isRoleAtLeast(userRole, "STAFF");
  }

  if (pathname.startsWith("/profile")) {
    // Any authenticated user can access personal profile
    return true;
  }

  return true;
}

