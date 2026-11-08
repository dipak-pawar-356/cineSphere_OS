import { UserRole } from "../types/role.types";
import { AppPermission } from "../types/permission.types";

/**
 * Enterprise RBAC Permission Matrix
 * Maps every user role to its granted set of capabilities.
 */
export const RBAC_MATRIX: Record<UserRole, AppPermission[]> = {
  SUPER_ADMIN: [
    // Platform-wide unrestricted permissions
    "platform:manage",
    "platform:settings",
    "theatres:create",
    "theatres:manage_all",
    "theatres:delete",
    "admins:manage",
    "audit_logs:view",
    "analytics:view_all",
    "reports:view_all",

    // Can inspect any tenant resource
    "theatre:read_own",
    "theatre:update_own",
    "theatre:settings_own",
    "theatre:upi_configure",
    "theatre:financials_view",
    "halls:create",
    "halls:update",
    "halls:delete",
    "halls:design_layout",
    "movies:schedule",
    "shows:create",
    "shows:price_sections",
    "shows:cancel",
    "staff:invite",
    "staff:manage_roles",
    "bookings:view_own",
    "bookings:refund",
    "reports:view_own",
    "halls:view_assigned",
    "halls:calibrate_hardware",
    "shows:view_assigned",
    "seats:view_occupancy",
    "seats:block_maintenance",
    "tickets:scan",
    "tickets:validate",
    "concessions:pos_access",
    "hall:operational_check",
    "profile:view_own",
    "profile:update_own",
    "bookings:create",
    "bookings:cancel_eligible",
    "tickets:download_qr",
    "wishlist:manage",
  ],

  THEATRE_ADMIN: [
    // Strictly scoped to own theatreId
    "theatre:read_own",
    "theatre:update_own",
    "theatre:settings_own",
    "theatre:upi_configure",
    "theatre:financials_view",
    "halls:create",
    "halls:update",
    "halls:delete",
    "halls:design_layout",
    "movies:schedule",
    "shows:create",
    "shows:price_sections",
    "shows:cancel",
    "staff:invite",
    "staff:manage_roles",
    "bookings:view_own",
    "bookings:refund",
    "reports:view_own",
    "halls:view_assigned",
    "halls:calibrate_hardware",
    "shows:view_assigned",
    "seats:view_occupancy",
    "seats:block_maintenance",
    "tickets:scan",
    "tickets:validate",
    "concessions:pos_access",
    "hall:operational_check",
    "profile:view_own",
    "profile:update_own",
  ],

  HALL_MANAGER: [
    // Hardware, physical halls, and operational checks only
    "theatre:read_own",
    "halls:view_assigned",
    "halls:calibrate_hardware",
    "shows:view_assigned",
    "seats:view_occupancy",
    "seats:block_maintenance",
    "tickets:scan",
    "tickets:validate",
    "hall:operational_check",
    "profile:view_own",
    "profile:update_own",
  ],

  STAFF: [
    // Box office, scanners, and concessions
    "tickets:scan",
    "tickets:validate",
    "concessions:pos_access",
    "hall:operational_check",
    "profile:view_own",
    "profile:update_own",
  ],

  CUSTOMER: [
    // Patron self-service only
    "profile:view_own",
    "profile:update_own",
    "bookings:create",
    "bookings:view_own",
    "bookings:cancel_eligible",
    "tickets:download_qr",
    "wishlist:manage",
  ],
};

/**
 * Checks if a specific role possesses a permission.
 */
export function checkRolePermission(role: UserRole, permission: AppPermission): boolean {
  const granted = RBAC_MATRIX[role] || [];
  return granted.includes(permission);
}

/**
 * Retrieves all permissions granted to a given role.
 */
export function getRolePermissions(role: UserRole): AppPermission[] {
  return RBAC_MATRIX[role] || [];
}

