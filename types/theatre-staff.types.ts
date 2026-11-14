/**
 * ==============================================================================
 * CineSphere OS — Theatre Staff & Dynamic RBAC Types (Phase 3 – Part 10)
 * ==============================================================================
 * Enterprise multi-tenant type definitions for staff organization, custom roles,
 * platform role templates, permission catalogs, and role assignment history.
 * ==============================================================================
 */

export type StaffEmploymentStatus =
  | "INVITED"
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "RESIGNED"
  | "ARCHIVED";

export type StaffDepartmentType =
  | "OPERATIONS"
  | "PROJECTION"
  | "CUSTOMER_SUPPORT"
  | "SECURITY"
  | "MAINTENANCE"
  | "FOOD_COURT"
  | "ADMINISTRATION"
  | "FINANCE"
  | "MARKETING"
  | "CUSTOM";

export type TheatreRoleStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type StaffRoleChangeType =
  | "ASSIGNED"
  | "PROMOTED"
  | "DEMOTED"
  | "TRANSFERRED"
  | "REVOKED";

export type StaffPermissionModule =
  | "DASHBOARD"
  | "BOOKINGS"
  | "PAYMENTS"
  | "MOVIES"
  | "SHOWS"
  | "REPORTS"
  | "HALLS"
  | "TICKETS"
  | "SETTINGS"
  | "MEDIA"
  | "BUSINESS"
  | "STAFF"
  | "CUSTOM";

// ------------------------------------------------------------------------------
// Standardized Permission Catalog Item
// ------------------------------------------------------------------------------
export interface PermissionCatalogItem {
  key: string;
  module: StaffPermissionModule;
  label: string;
  description: string;
  isSuperAdminOnly?: boolean;
}

// ------------------------------------------------------------------------------
// Database Record Entities
// ------------------------------------------------------------------------------

export interface RoleTemplateRecord {
  id: string;
  templateCode: string;
  name: string;
  category: string;
  description: string;
  defaultPermissions: string[];
  suggestedDepartment: string;
  hierarchyLevel: number;
  isPlatformStandard: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TheatreRoleRecord {
  id: string;
  theatreId: string;
  templateId: string | null;
  roleCode: string;
  name: string;
  description: string | null;
  isCustom: boolean;
  isSystemDefault: boolean;
  hierarchyLevel: number;
  status: TheatreRoleStatus;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TheatrePermissionRecord {
  id: string;
  theatreId: string;
  roleId: string;
  permissionKey: string;
  module: string;
  isGranted: boolean;
  grantedBy: string | null;
  grantedAt: Date;
}

export interface StaffDepartmentRecord {
  id: string;
  theatreId: string;
  code: string;
  name: string;
  departmentType: StaffDepartmentType;
  description: string | null;
  departmentHeadId: string | null;
  isCustom: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TheatreStaffRecord {
  id: string;
  theatreId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  designation: string;
  departmentId: string | null;
  employmentStatus: StaffEmploymentStatus;
  joiningDate: Date | null;
  resignationDate: Date | null;
  reportingManagerId: string | null;
  emergencyContact: {
    name?: string;
    relationship?: string;
    phone?: string;
  } | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffRoleAssignmentRecord {
  id: string;
  theatreId: string;
  staffId: string;
  roleId: string;
  isPrimary: boolean;
  assignedBy: string | null;
  assignedAt: Date;
  expiresAt: Date | null;
}

export interface StaffRoleHistoryRecord {
  id: string;
  theatreId: string;
  staffId: string;
  previousRoleId: string | null;
  newRoleId: string;
  changeType: StaffRoleChangeType;
  reason: string | null;
  changedBy: string;
  changedRole: string | null;
  createdAt: Date;
}

export interface FutureShiftPlaceholderRecord {
  id: string;
  theatreId: string;
  staffId: string;
  shiftType: string;
  scheduleData: Record<string, unknown> | null;
  attendanceConfig: Record<string, unknown> | null;
  leavePolicyConfig: Record<string, unknown> | null;
  biometricMapping: Record<string, unknown> | null;
  payrollTier: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ------------------------------------------------------------------------------
// Composite Aggregates
// ------------------------------------------------------------------------------

export interface StaffMemberWithRoles extends TheatreStaffRecord {
  primaryRole?: TheatreRoleRecord | null;
  roles: TheatreRoleRecord[];
  department?: StaffDepartmentRecord | null;
  permissions: string[];
}

export interface TheatreRoleWithPermissions extends TheatreRoleRecord {
  permissions: TheatrePermissionRecord[];
  activeStaffCount?: number;
}

export interface TheatreStaffOrganizationBundle {
  theatreId: string;
  staff: StaffMemberWithRoles[];
  roles: TheatreRoleWithPermissions[];
  departments: StaffDepartmentRecord[];
  templates: RoleTemplateRecord[];
  totalStaffCount: number;
  activeStaffCount: number;
  suspendedStaffCount: number;
}

// ------------------------------------------------------------------------------
// DTOs & Action Inputs
// ------------------------------------------------------------------------------

export interface CreateStaffInput {
  theatreId: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  designation: string;
  departmentId?: string;
  roleId?: string; // Initial role assignment
  employmentStatus?: StaffEmploymentStatus;
  joiningDate?: string;
  reportingManagerId?: string;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  notes?: string;
}

export interface InviteStaffInput {
  theatreId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  designation: string;
  departmentId?: string;
  roleId: string;
  notes?: string;
}

export interface UpdateStaffInput {
  id: string;
  theatreId: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  designation?: string;
  departmentId?: string;
  employmentStatus?: StaffEmploymentStatus;
  resignationDate?: string;
  reportingManagerId?: string;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  notes?: string;
}

export interface ArchiveStaffInput {
  id: string;
  theatreId: string;
  reason?: string;
}

export interface SuspendStaffInput {
  id: string;
  theatreId: string;
  reason: string;
}

export interface AssignRoleInput {
  theatreId: string;
  staffId: string;
  roleId: string;
  isPrimary?: boolean;
  expiresAt?: string;
  reason?: string;
}

export interface RemoveRoleInput {
  theatreId: string;
  staffId: string;
  roleId: string;
  reason?: string;
}

export interface UpdateRolePermissionsInput {
  theatreId: string;
  roleId: string;
  permissions: {
    permissionKey: string;
    module: string;
    isGranted: boolean;
  }[];
}

export interface CreateTheatreRoleInput {
  theatreId: string;
  roleCode: string;
  name: string;
  description?: string;
  hierarchyLevel?: number;
  templateId?: string;
  permissions?: string[];
}

export interface UpdateTheatreRoleInput {
  id: string;
  theatreId: string;
  name?: string;
  description?: string;
  hierarchyLevel?: number;
  status?: TheatreRoleStatus;
}

export interface InstantiateRoleFromTemplateInput {
  theatreId: string;
  templateId: string;
  customName?: string;
  customDescription?: string;
  customHierarchyLevel?: number;
  overriddenPermissions?: string[];
}

export interface CreateDepartmentInput {
  theatreId: string;
  code: string;
  name: string;
  departmentType?: StaffDepartmentType;
  description?: string;
  departmentHeadId?: string;
}

export interface UpdateDepartmentInput {
  id: string;
  theatreId: string;
  name?: string;
  description?: string;
  departmentHeadId?: string;
  status?: string;
}

export interface StaffSearchFilters {
  theatreId?: string;
  query?: string;
  departmentId?: string;
  roleId?: string;
  employmentStatus?: StaffEmploymentStatus | "ALL";
  page?: number;
  limit?: number;
}
