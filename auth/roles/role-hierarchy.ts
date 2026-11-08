import { UserRole } from "../types/role.types";
import { ROLE_DEFINITIONS } from "./role-definitions";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  THEATRE_ADMIN: 80,
  HALL_MANAGER: 60,
  STAFF: 40,
  CUSTOMER: 10,
};

/**
 * Checks if a user's role meets or exceeds a target threshold in the hierarchy.
 */
export function isRoleAtLeast(userRole: UserRole, targetRole: UserRole): boolean {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[targetRole] || 0);
}

/**
 * Checks if a user possesses exact role membership.
 */
export function isExactRole(userRole: UserRole, targetRole: UserRole): boolean {
  return userRole === targetRole;
}

/**
 * Returns role metadata for display and navigation routing.
 */
export function getRoleMetadata(role: UserRole) {
  return ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.CUSTOMER;
}

