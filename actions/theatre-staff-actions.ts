"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { theatreStaffService } from "@/lib/services/theatre-staff.service";
import {
  createStaffSchema,
  inviteStaffSchema,
  updateStaffSchema,
  archiveStaffSchema,
  suspendStaffSchema,
  assignRoleSchema,
  removeRoleSchema,
  updateRolePermissionsSchema,
  createTheatreRoleSchema,
  updateTheatreRoleSchema,
  instantiateRoleFromTemplateSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  staffSearchFiltersSchema,
} from "@/lib/validation/theatre-staff.validation";
import type {
  StaffMemberWithRoles,
  TheatreStaffOrganizationBundle,
  TheatreRoleRecord,
  TheatrePermissionRecord,
  StaffDepartmentRecord,
} from "@/types/theatre-staff.types";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Staff & Dynamic RBAC Server Actions (Phase 3 – Part 10)
 * ==============================================================================
 * Protected server actions enforcing:
 * Auth -> RBAC -> Multi-Tenant Isolation -> Zod Validation -> Security Audit Log
 * ==============================================================================
 */

function revalidateStaffPaths() {
  revalidatePath("/theatre/staff");
  revalidatePath("/theatre/staff/managers");
  revalidatePath("/theatre/dashboard");
  revalidatePath("/dashboard/staff");
  revalidatePath("/dashboard/theatres");
}

const GetTheatreStaffInputSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
});

const GetStaffByIdInputSchema = z.object({
  staffId: z.string().trim().min(1, "staffId is required"),
  theatreId: z.string().trim().min(1, "theatreId is required"),
});

// ------------------------------------------------------------------------------
// 1. Retrieve Organization Bundle Action
// ------------------------------------------------------------------------------
export const getTheatreStaffBundleAction = createProtectedAction<
  z.input<typeof GetTheatreStaffInputSchema>,
  TheatreStaffOrganizationBundle
>(
  {
    actionName: "getTheatreStaffBundleAction",
    schema: GetTheatreStaffInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_STAFF",
    auditAction: "READ",
  },
  async (input, context) => {
    return await theatreStaffService.getOrganizationBundle(input.theatreId, context.actor);
  }
);

// ------------------------------------------------------------------------------
// 2. Retrieve Single Staff Action
// ------------------------------------------------------------------------------
export const retrieveStaffAction = createProtectedAction<
  z.input<typeof GetStaffByIdInputSchema>,
  StaffMemberWithRoles | null
>(
  {
    actionName: "retrieveStaffAction",
    schema: GetStaffByIdInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_STAFF",
    auditAction: "READ",
  },
  async (input, context) => {
    return await theatreStaffService.getStaffById(input.staffId, context.actor);
  }
);

// ------------------------------------------------------------------------------
// 3. Search Staff Action
// ------------------------------------------------------------------------------
export const searchStaffAction = createProtectedAction<
  z.input<typeof staffSearchFiltersSchema>,
  {
    items: StaffMemberWithRoles[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
>(
  {
    actionName: "searchStaffAction",
    schema: staffSearchFiltersSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: false, // theatreId is optional in global search
    auditModule: "THEATRE_STAFF",
    auditAction: "READ",
  },
  async (input, context) => {
    return await theatreStaffService.searchStaff(input, context.actor);
  }
);

// ------------------------------------------------------------------------------
// 4. Create / Onboard Staff Action
// ------------------------------------------------------------------------------
export const createStaffAction = createProtectedAction<
  z.input<typeof createStaffSchema>,
  StaffMemberWithRoles
>(
  {
    actionName: "createStaffAction",
    schema: createStaffSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_STAFF",
    auditAction: "CREATE",
  },
  async (input, context) => {
    const created = await theatreStaffService.createStaff(input, context.actor);
    revalidateStaffPaths();
    return created;
  }
);

// ------------------------------------------------------------------------------
// 5. Invite Staff Action
// ------------------------------------------------------------------------------
export const inviteStaffAction = createProtectedAction<
  z.input<typeof inviteStaffSchema>,
  StaffMemberWithRoles
>(
  {
    actionName: "inviteStaffAction",
    schema: inviteStaffSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_STAFF",
    auditAction: "CREATE",
  },
  async (input, context) => {
    const invited = await theatreStaffService.inviteStaff(input, context.actor);
    revalidateStaffPaths();
    return invited;
  }
);

// ------------------------------------------------------------------------------
// 6. Update Staff Action
// ------------------------------------------------------------------------------
export const updateStaffAction = createProtectedAction<
  z.input<typeof updateStaffSchema>,
  StaffMemberWithRoles
>(
  {
    actionName: "updateStaffAction",
    schema: updateStaffSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_STAFF",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const updated = await theatreStaffService.updateStaff(input, context.actor);
    revalidateStaffPaths();
    return updated;
  }
);

// ------------------------------------------------------------------------------
// 7. Suspend Staff Action
// ------------------------------------------------------------------------------
export const suspendStaffAction = createProtectedAction<
  z.input<typeof suspendStaffSchema>,
  StaffMemberWithRoles
>(
  {
    actionName: "suspendStaffAction",
    schema: suspendStaffSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_STAFF",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const suspended = await theatreStaffService.suspendStaff(input, context.actor);
    revalidateStaffPaths();
    return suspended;
  }
);

// ------------------------------------------------------------------------------
// 8. Archive Staff Action
// ------------------------------------------------------------------------------
export const archiveStaffAction = createProtectedAction<
  z.input<typeof archiveStaffSchema>,
  StaffMemberWithRoles
>(
  {
    actionName: "archiveStaffAction",
    schema: archiveStaffSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_STAFF",
    auditAction: "DELETE",
  },
  async (input, context) => {
    const archived = await theatreStaffService.archiveStaff(input, context.actor);
    revalidateStaffPaths();
    return archived;
  }
);

// ------------------------------------------------------------------------------
// 9. Assign Role Action
// ------------------------------------------------------------------------------
export const assignRoleAction = createProtectedAction<
  z.input<typeof assignRoleSchema>,
  StaffMemberWithRoles
>(
  {
    actionName: "assignRoleAction",
    schema: assignRoleSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_STAFF",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const result = await theatreStaffService.assignRole(input, context.actor);
    revalidateStaffPaths();
    return result;
  }
);

// ------------------------------------------------------------------------------
// 10. Remove Role Action
// ------------------------------------------------------------------------------
export const removeRoleAction = createProtectedAction<
  z.input<typeof removeRoleSchema>,
  StaffMemberWithRoles
>(
  {
    actionName: "removeRoleAction",
    schema: removeRoleSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_STAFF",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const result = await theatreStaffService.removeRole(input, context.actor);
    revalidateStaffPaths();
    return result;
  }
);

// ------------------------------------------------------------------------------
// 11. Update Role Permissions Action
// ------------------------------------------------------------------------------
export const updateRolePermissionsAction = createProtectedAction<
  z.input<typeof updateRolePermissionsSchema>,
  TheatrePermissionRecord[]
>(
  {
    actionName: "updateRolePermissionsAction",
    schema: updateRolePermissionsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_STAFF",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const perms = await theatreStaffService.updateRolePermissions(input, context.actor);
    revalidateStaffPaths();
    return perms;
  }
);

// ------------------------------------------------------------------------------
// 12. Create Custom Theatre Role Action
// ------------------------------------------------------------------------------
export const createTheatreRoleAction = createProtectedAction<
  z.input<typeof createTheatreRoleSchema>,
  TheatreRoleRecord
>(
  {
    actionName: "createTheatreRoleAction",
    schema: createTheatreRoleSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_STAFF",
    auditAction: "CREATE",
  },
  async (input, context) => {
    const role = await theatreStaffService.createTheatreRole(input, context.actor);
    revalidateStaffPaths();
    return role;
  }
);

// ------------------------------------------------------------------------------
// 13. Update Theatre Role Action
// ------------------------------------------------------------------------------
export const updateTheatreRoleAction = createProtectedAction<
  z.input<typeof updateTheatreRoleSchema>,
  TheatreRoleRecord
>(
  {
    actionName: "updateTheatreRoleAction",
    schema: updateTheatreRoleSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_STAFF",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const role = await theatreStaffService.updateTheatreRole(input, context.actor);
    revalidateStaffPaths();
    return role;
  }
);

// ------------------------------------------------------------------------------
// 14. Instantiate Role from Platform Template Action
// ------------------------------------------------------------------------------
export const instantiateRoleFromTemplateAction = createProtectedAction<
  z.input<typeof instantiateRoleFromTemplateSchema>,
  TheatreRoleRecord
>(
  {
    actionName: "instantiateRoleFromTemplateAction",
    schema: instantiateRoleFromTemplateSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_STAFF",
    auditAction: "CREATE",
  },
  async (input, context) => {
    const role = await theatreStaffService.instantiateRoleFromTemplate(input, context.actor);
    revalidateStaffPaths();
    return role;
  }
);

// ------------------------------------------------------------------------------
// 15. Create Department Action
// ------------------------------------------------------------------------------
export const createDepartmentAction = createProtectedAction<
  z.input<typeof createDepartmentSchema>,
  StaffDepartmentRecord
>(
  {
    actionName: "createDepartmentAction",
    schema: createDepartmentSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_STAFF",
    auditAction: "CREATE",
  },
  async (input, context) => {
    const dept = await theatreStaffService.createDepartment(input, context.actor);
    revalidateStaffPaths();
    return dept;
  }
);

// ------------------------------------------------------------------------------
// 16. Update Department Action
// ------------------------------------------------------------------------------
export const updateDepartmentAction = createProtectedAction<
  z.input<typeof updateDepartmentSchema>,
  StaffDepartmentRecord
>(
  {
    actionName: "updateDepartmentAction",
    schema: updateDepartmentSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_STAFF",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const dept = await theatreStaffService.updateDepartment(input, context.actor);
    revalidateStaffPaths();
    return dept;
  }
);
