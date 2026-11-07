import { Role, ROLE_HIERARCHY } from "./roles";
import { Permission, UserPermissionContext } from "./permissions";

/**
 * CineSphere OS - Authorization & RBAC Placeholder
 */
export function hasRole(context: UserPermissionContext, requiredRole: Role): boolean {
  // Placeholder checking role hierarchy
  return context.roles.some(
    (role) => (ROLE_HIERARCHY[role as Role] || 0) >= ROLE_HIERARCHY[requiredRole]
  );
}

export function hasPermission(
  context: UserPermissionContext,
  permission: Permission
): boolean {
  return context.permissions.includes(permission);
}

