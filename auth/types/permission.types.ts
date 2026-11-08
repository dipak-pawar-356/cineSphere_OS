/**
 * CineSphere OS - Granular Application Permissions
 * Enterprise RBAC System supporting platform-wide, tenant-isolated, and patron scopes.
 */

export type AppPermission =
  // Super Admin Platform Operations
  | "platform:manage"
  | "platform:settings"
  | "theatres:create"
  | "theatres:manage_all"
  | "theatres:delete"
  | "admins:manage"
  | "audit_logs:view"
  | "analytics:view_all"
  | "reports:view_all"

  // Theatre Admin Operations (Tenant-Scoped)
  | "theatre:read_own"
  | "theatre:update_own"
  | "theatre:settings_own"
  | "theatre:upi_configure"
  | "theatre:financials_view"
  | "halls:create"
  | "halls:update"
  | "halls:delete"
  | "halls:design_layout"
  | "movies:schedule"
  | "shows:create"
  | "shows:price_sections"
  | "shows:cancel"
  | "staff:invite"
  | "staff:manage_roles"
  | "bookings:view_own"
  | "bookings:refund"
  | "reports:view_own"

  // Hall Manager Operations (Auditorium & Hardware Calibration)
  | "halls:view_assigned"
  | "halls:calibrate_hardware"
  | "shows:view_assigned"
  | "seats:view_occupancy"
  | "seats:block_maintenance"

  // Staff Operations (Box Office & Gate)
  | "tickets:scan"
  | "tickets:validate"
  | "concessions:pos_access"
  | "hall:operational_check"

  // Customer Operations (Patron Scope)
  | "profile:view_own"
  | "profile:update_own"
  | "bookings:create"
  | "bookings:view_own"
  | "bookings:cancel_eligible"
  | "tickets:download_qr"
  | "wishlist:manage";

export type PermissionModule =
  | "PLATFORM"
  | "THEATRE"
  | "AUDITORIUM"
  | "PROGRAMMING"
  | "OPERATIONS"
  | "FINANCE"
  | "STAFF"
  | "PATRON";

export interface PermissionDefinition {
  permission: AppPermission;
  module: PermissionModule;
  label: string;
  description: string;
  isSuperAdminOnly?: boolean;
  requiresTenantContext?: boolean;
}

