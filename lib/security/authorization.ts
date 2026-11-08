import { Role, ROLE_HIERARCHY } from "./roles";
import { Permission, UserPermissionContext } from "./permissions";

export * from "@/auth/helpers";

/**
 * CineSphere OS - Legacy Authorization & RBAC Bridge
 */
export function hasRole(context: UserPermissionContext, requiredRole: Role): boolean {
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
