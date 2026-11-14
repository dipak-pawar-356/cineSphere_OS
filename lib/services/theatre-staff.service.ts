import { createLogger } from "@/lib/observability/structured-logger";
import { securityAuditService } from "@/lib/services/security-audit.service";
import { tenantService } from "@/lib/services/tenant.service";
import { theatreStaffRepository } from "@/lib/repositories/theatre-staff.repository";
import { invalidateCacheByTag, CACHE_TAGS } from "@/lib/performance/cache-strategy";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  AuthorizationError,
} from "@/lib/errors/app-error";
import { sanitizeString } from "@/lib/security/input-sanitizer";
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
  TheatreStaffRecord,
  RoleTemplateRecord,
  TheatreRoleRecord,
  TheatrePermissionRecord,
  StaffDepartmentRecord,
  StaffRoleHistoryRecord,
  StaffMemberWithRoles,
  TheatreStaffOrganizationBundle,
  CreateStaffInput,
  InviteStaffInput,
  UpdateStaffInput,
  ArchiveStaffInput,
  SuspendStaffInput,
  AssignRoleInput,
  RemoveRoleInput,
  UpdateRolePermissionsInput,
  CreateTheatreRoleInput,
  UpdateTheatreRoleInput,
  InstantiateRoleFromTemplateInput,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  StaffSearchFilters,
} from "@/types/theatre-staff.types";
import type { SecurityActorContext } from "@/types/security-hardening.types";
import type { ZodIssue } from "zod";

const logger = createLogger("TheatreStaffService");

function formatZodIssues(issues: ZodIssue[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const issue of issues) {
    const path = issue.path.join(".") || "root";
    if (!result[path]) result[path] = [];
    result[path].push(issue.message);
  }
  return result;
}

export class TheatreStaffService {
  private invalidateStaffCache(theatreId: string): void {
    invalidateCacheByTag(CACHE_TAGS.THEATRE_STAFF(theatreId));
    invalidateCacheByTag(CACHE_TAGS.PUBLIC_THEATRE_STAFF(theatreId));
  }

  // ----------------------------------------------------------------------------
  // Query Organization Bundle
  // ----------------------------------------------------------------------------
  public async getOrganizationBundle(
    theatreId: string,
    actor?: SecurityActorContext
  ): Promise<TheatreStaffOrganizationBundle> {
    if (actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }

    logger.info("API", "Fetching theatre staff organization bundle", {
      correlationId: actor?.correlationId || `corr-staff-bundle-${Date.now()}`,
      theatreId,
    });

    return theatreStaffRepository.getStaffBundle(theatreId);
  }

  // ----------------------------------------------------------------------------
  // Search & Filter Staff
  // ----------------------------------------------------------------------------
  public async searchStaff(
    filters: StaffSearchFilters,
    actor?: SecurityActorContext
  ): Promise<{
    items: StaffMemberWithRoles[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const parsed = staffSearchFiltersSchema.safeParse(filters);
    if (!parsed.success) {
      throw new ValidationError("Invalid staff search filters", formatZodIssues(parsed.error.issues));
    }

    const theatreId = parsed.data.theatreId;
    if (theatreId && actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }

    return theatreStaffRepository.searchStaff(parsed.data);
  }

  // ----------------------------------------------------------------------------
  // Retrieve Single Staff Member
  // ----------------------------------------------------------------------------
  public async getStaffById(
    staffId: string,
    actor?: SecurityActorContext
  ): Promise<StaffMemberWithRoles | null> {
    const staff = await theatreStaffRepository.getStaffWithRoles(staffId);
    if (!staff) return null;

    if (actor) {
      await tenantService.assertTenantAccess(actor, staff.theatreId);
    }

    return staff;
  }

  // ----------------------------------------------------------------------------
  // Create / Onboard Staff Member
  // ----------------------------------------------------------------------------
  public async createStaff(
    input: CreateStaffInput,
    actor?: SecurityActorContext
  ): Promise<StaffMemberWithRoles> {
    const parsed = createStaffSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid staff onboarding data", formatZodIssues(parsed.error.issues));
    }

    const data = parsed.data;
    if (actor) {
      await tenantService.assertTenantAccess(actor, data.theatreId);
    }

    // Check email uniqueness
    const existingEmail = await theatreStaffRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError(`A staff member with email '${data.email}' already exists in the system.`);
    }

    // Generate or check employee code
    let employeeCode = data.employeeCode?.trim().toUpperCase();
    if (!employeeCode) {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const theatreCode = data.theatreId.replace(/[^a-zA-Z0-9]/g, "").slice(-3).toUpperCase() || "TH";
      employeeCode = `EMP-${theatreCode}-${randomSuffix}`;
    }

    const existingCode = await theatreStaffRepository.findByEmployeeCode(data.theatreId, employeeCode);
    if (existingCode) {
      throw new ConflictError(
        `Employee code '${employeeCode}' is already assigned to another crew member in this theatre.`
      );
    }

    const staffId = `st-${data.theatreId}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const displayName = data.displayName || `${data.firstName} ${data.lastName}`.trim();

    const newStaffRecord: TheatreStaffRecord = {
      id: staffId,
      theatreId: data.theatreId,
      employeeCode,
      firstName: sanitizeString(data.firstName),
      lastName: sanitizeString(data.lastName),
      displayName: sanitizeString(displayName),
      email: data.email.toLowerCase().trim(),
      phone: sanitizeString(data.phone),
      avatarUrl: data.avatarUrl || null,
      designation: sanitizeString(data.designation),
      departmentId: data.departmentId || null,
      employmentStatus: data.employmentStatus || "ACTIVE",
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
      resignationDate: null,
      reportingManagerId: data.reportingManagerId || null,
      emergencyContact: data.emergencyContact || null,
      notes: data.notes ? sanitizeString(data.notes) : null,
      metadata: {},
      createdBy: actor?.userId || "usr-system",
      updatedBy: actor?.userId || "usr-system",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await theatreStaffRepository.create(newStaffRecord);

    // Initial role assignment if provided
    if (data.roleId) {
      await theatreStaffRepository.assignRole(
        {
          theatreId: data.theatreId,
          staffId,
          roleId: data.roleId,
          isPrimary: true,
          reason: "Assigned upon staff onboarding",
        },
        actor?.userId || "usr-system",
        actor?.role || "THEATRE_ADMIN"
      );
    }

    this.invalidateStaffCache(data.theatreId);

    const auditActor: SecurityActorContext = actor || {
      userId: "usr-system",
      role: "SUPER_ADMIN",
      permissions: ["*"],
      correlationId: `corr-staff-${Date.now()}`,
    };

    await securityAuditService.recordAudit({
      actor: auditActor,
      module: "THEATRE_STAFF",
      action: "CREATE",
      description: `Onboarded crew member '${displayName}' (${employeeCode})`,
      metadata: {
        theatreId: data.theatreId,
        staffId,
        employeeCode,
        email: data.email,
        designation: data.designation,
      },
    });

    const populated = await theatreStaffRepository.getStaffWithRoles(staffId);
    return populated!;
  }

  // ----------------------------------------------------------------------------
  // Invite Staff Member
  // ----------------------------------------------------------------------------
  public async inviteStaff(
    input: InviteStaffInput,
    actor?: SecurityActorContext
  ): Promise<StaffMemberWithRoles> {
    const parsed = inviteStaffSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid staff invitation payload", formatZodIssues(parsed.error.issues));
    }

    const data = parsed.data;
    if (actor) {
      await tenantService.assertTenantAccess(actor, data.theatreId);
    }

    const existingEmail = await theatreStaffRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError(`A staff member with email '${data.email}' already exists.`);
    }

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const theatreCode = data.theatreId.replace(/[^a-zA-Z0-9]/g, "").slice(-3).toUpperCase() || "TH";
    const employeeCode = `INV-${theatreCode}-${randomSuffix}`;
    const staffId = `st-inv-${Date.now().toString(36)}`;
    const displayName = `${data.firstName} ${data.lastName}`.trim();

    const invitedRecord: TheatreStaffRecord = {
      id: staffId,
      theatreId: data.theatreId,
      employeeCode,
      firstName: sanitizeString(data.firstName),
      lastName: sanitizeString(data.lastName),
      displayName: sanitizeString(displayName),
      email: data.email.toLowerCase().trim(),
      phone: data.phone ? sanitizeString(data.phone) : "+00 00000 00000",
      avatarUrl: null,
      designation: sanitizeString(data.designation),
      departmentId: data.departmentId || null,
      employmentStatus: "INVITED",
      joiningDate: null,
      resignationDate: null,
      reportingManagerId: null,
      emergencyContact: null,
      notes: data.notes ? sanitizeString(data.notes) : null,
      metadata: { invitedAt: new Date().toISOString() },
      createdBy: actor?.userId || "usr-system",
      updatedBy: actor?.userId || "usr-system",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await theatreStaffRepository.create(invitedRecord);

    await theatreStaffRepository.assignRole(
      {
        theatreId: data.theatreId,
        staffId,
        roleId: data.roleId,
        isPrimary: true,
        reason: "Assigned in onboarding invitation",
      },
      actor?.userId || "usr-system",
      actor?.role || "THEATRE_ADMIN"
    );

    this.invalidateStaffCache(data.theatreId);

    const auditActor: SecurityActorContext = actor || {
      userId: "usr-system",
      role: "SUPER_ADMIN",
      permissions: ["*"],
      correlationId: `corr-staff-${Date.now()}`,
    };

    await securityAuditService.recordAudit({
      actor: auditActor,
      module: "THEATRE_STAFF",
      action: "INVITE",
      description: `Sent onboard invitation to '${data.email}' as ${data.designation}`,
      metadata: {
        theatreId: data.theatreId,
        staffId,
        email: data.email,
        roleId: data.roleId,
      },
    });

    const populated = await theatreStaffRepository.getStaffWithRoles(staffId);
    return populated!;
  }

  // ----------------------------------------------------------------------------
  // Update Staff Details
  // ----------------------------------------------------------------------------
  public async updateStaff(
    input: UpdateStaffInput,
    actor?: SecurityActorContext
  ): Promise<StaffMemberWithRoles> {
    const parsed = updateStaffSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid staff update payload", formatZodIssues(parsed.error.issues));
    }

    const data = parsed.data;
    if (actor) {
      await tenantService.assertTenantAccess(actor, data.theatreId);
    }

    const existing = await theatreStaffRepository.findById(data.id);
    if (!existing || existing.theatreId !== data.theatreId) {
      throw new NotFoundError("Staff member not found in this theatre tenant.");
    }

    const updates: Partial<TheatreStaffRecord> = {
      updatedBy: actor?.userId || "usr-system",
    };

    if (data.firstName !== undefined) updates.firstName = sanitizeString(data.firstName);
    if (data.lastName !== undefined) updates.lastName = sanitizeString(data.lastName);
    if (data.displayName !== undefined) updates.displayName = sanitizeString(data.displayName);
    if (data.phone !== undefined) updates.phone = sanitizeString(data.phone);
    if (data.avatarUrl !== undefined) updates.avatarUrl = data.avatarUrl || null;
    if (data.designation !== undefined) updates.designation = sanitizeString(data.designation);
    if (data.departmentId !== undefined) updates.departmentId = data.departmentId || null;
    if (data.employmentStatus !== undefined) updates.employmentStatus = data.employmentStatus;
    if (data.resignationDate !== undefined) updates.resignationDate = data.resignationDate ? new Date(data.resignationDate) : null;
    if (data.reportingManagerId !== undefined) updates.reportingManagerId = data.reportingManagerId || null;
    if (data.emergencyContact !== undefined) updates.emergencyContact = data.emergencyContact;
    if (data.notes !== undefined) updates.notes = data.notes ? sanitizeString(data.notes) : null;

    await theatreStaffRepository.update(data.id, updates);
    this.invalidateStaffCache(data.theatreId);

    const auditActor: SecurityActorContext = actor || {
      userId: "usr-system",
      role: "SUPER_ADMIN",
      permissions: ["*"],
      correlationId: `corr-staff-${Date.now()}`,
    };

    await securityAuditService.recordAudit({
      actor: auditActor,
      module: "THEATRE_STAFF",
      action: "UPDATE",
      description: `Updated profile for crew member '${existing.displayName}'`,
      metadata: { theatreId: data.theatreId, staffId: data.id, fields: Object.keys(updates) },
    });

    const populated = await theatreStaffRepository.getStaffWithRoles(data.id);
    return populated!;
  }

  // ----------------------------------------------------------------------------
  // Suspend Staff Member
  // ----------------------------------------------------------------------------
  public async suspendStaff(
    input: SuspendStaffInput,
    actor?: SecurityActorContext
  ): Promise<StaffMemberWithRoles> {
    const parsed = suspendStaffSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid staff suspension request", formatZodIssues(parsed.error.issues));
    }

    const data = parsed.data;
    if (actor) {
      await tenantService.assertTenantAccess(actor, data.theatreId);
    }

    const existing = await theatreStaffRepository.findById(data.id);
    if (!existing || existing.theatreId !== data.theatreId) {
      throw new NotFoundError("Staff member not found in this theatre tenant.");
    }

    await theatreStaffRepository.update(data.id, {
      employmentStatus: "SUSPENDED",
      notes: existing.notes ? `${existing.notes}\n[Suspension: ${data.reason}]` : `[Suspension: ${data.reason}]`,
      updatedBy: actor?.userId || "usr-system",
    });

    this.invalidateStaffCache(data.theatreId);

    const auditActor: SecurityActorContext = actor || {
      userId: "usr-system",
      role: "SUPER_ADMIN",
      permissions: ["*"],
      correlationId: `corr-staff-${Date.now()}`,
    };

    await securityAuditService.recordAudit({
      actor: auditActor,
      module: "THEATRE_STAFF",
      action: "SUSPEND",
      description: `Suspended crew member '${existing.displayName}' (${existing.employeeCode})`,
      metadata: { theatreId: data.theatreId, staffId: data.id, reason: data.reason },
    });

    const populated = await theatreStaffRepository.getStaffWithRoles(data.id);
    return populated!;
  }

  // ----------------------------------------------------------------------------
  // Archive Staff Member
  // ----------------------------------------------------------------------------
  public async archiveStaff(
    input: ArchiveStaffInput,
    actor?: SecurityActorContext
  ): Promise<StaffMemberWithRoles> {
    const parsed = archiveStaffSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid staff archive request", formatZodIssues(parsed.error.issues));
    }

    const data = parsed.data;
    if (actor) {
      await tenantService.assertTenantAccess(actor, data.theatreId);
    }

    const existing = await theatreStaffRepository.findById(data.id);
    if (!existing || existing.theatreId !== data.theatreId) {
      throw new NotFoundError("Staff member not found in this theatre tenant.");
    }

    await theatreStaffRepository.update(data.id, {
      employmentStatus: "ARCHIVED",
      resignationDate: new Date(),
      updatedBy: actor?.userId || "usr-system",
    });

    this.invalidateStaffCache(data.theatreId);

    const auditActor: SecurityActorContext = actor || {
      userId: "usr-system",
      role: "SUPER_ADMIN",
      permissions: ["*"],
      correlationId: `corr-staff-${Date.now()}`,
    };

    await securityAuditService.recordAudit({
      actor: auditActor,
      module: "THEATRE_STAFF",
      action: "ARCHIVE",
      description: `Archived crew member '${existing.displayName}' (${existing.employeeCode})`,
      metadata: { theatreId: data.theatreId, staffId: data.id, reason: data.reason },
    });

    const populated = await theatreStaffRepository.getStaffWithRoles(data.id);
    return populated!;
  }

  // ----------------------------------------------------------------------------
  // Role Assignment & Revocation
  // ----------------------------------------------------------------------------
  public async assignRole(
    input: AssignRoleInput,
    actor?: SecurityActorContext
  ): Promise<StaffMemberWithRoles> {
    const parsed = assignRoleSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid role assignment payload", formatZodIssues(parsed.error.issues));
    }

    const data = parsed.data;
    if (actor) {
      await tenantService.assertTenantAccess(actor, data.theatreId);
    }

    const staff = await theatreStaffRepository.findById(data.staffId);
    if (!staff || staff.theatreId !== data.theatreId) {
      throw new NotFoundError("Staff member not found in this theatre.");
    }

    const role = await theatreStaffRepository.getRoleById(data.roleId);
    if (!role || role.theatreId !== data.theatreId) {
      throw new NotFoundError("Role not found in this theatre.");
    }

    await theatreStaffRepository.assignRole(
      data,
      actor?.userId || "usr-system",
      actor?.role || "THEATRE_ADMIN"
    );

    this.invalidateStaffCache(data.theatreId);

    const auditActor: SecurityActorContext = actor || {
      userId: "usr-system",
      role: "SUPER_ADMIN",
      permissions: ["*"],
      correlationId: `corr-staff-${Date.now()}`,
    };

    await securityAuditService.recordAudit({
      actor: auditActor,
      module: "THEATRE_STAFF",
      action: "ROLE_ASSIGNED",
      description: `Granted role '${role.name}' to '${staff.displayName}'`,
      metadata: { theatreId: data.theatreId, staffId: data.staffId, roleId: data.roleId },
    });

    const populated = await theatreStaffRepository.getStaffWithRoles(data.staffId);
    return populated!;
  }

  public async removeRole(
    input: RemoveRoleInput,
    actor?: SecurityActorContext
  ): Promise<StaffMemberWithRoles> {
    const parsed = removeRoleSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid role removal payload", formatZodIssues(parsed.error.issues));
    }

    const data = parsed.data;
    if (actor) {
      await tenantService.assertTenantAccess(actor, data.theatreId);
    }

    await theatreStaffRepository.removeRole(
      data,
      actor?.userId || "usr-system",
      actor?.role || "THEATRE_ADMIN"
    );

    this.invalidateStaffCache(data.theatreId);

    const auditActor: SecurityActorContext = actor || {
      userId: "usr-system",
      role: "SUPER_ADMIN",
      permissions: ["*"],
      correlationId: `corr-staff-${Date.now()}`,
    };

    await securityAuditService.recordAudit({
      actor: auditActor,
      module: "THEATRE_STAFF",
      action: "ROLE_REMOVED",
      description: `Revoked role '${data.roleId}' from staff '${data.staffId}'`,
      metadata: { theatreId: data.theatreId, staffId: data.staffId, roleId: data.roleId },
    });

    const populated = await theatreStaffRepository.getStaffWithRoles(data.staffId);
    return populated!;
  }

  // ----------------------------------------------------------------------------
  // Role Permissions
  // ----------------------------------------------------------------------------
  public async updateRolePermissions(
    input: UpdateRolePermissionsInput,
    actor?: SecurityActorContext
  ): Promise<TheatrePermissionRecord[]> {
    const parsed = updateRolePermissionsSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid role permissions payload", formatZodIssues(parsed.error.issues));
    }

    const data = parsed.data;
    if (actor) {
      await tenantService.assertTenantAccess(actor, data.theatreId);
    }

    const role = await theatreStaffRepository.getRoleById(data.roleId);
    if (!role || role.theatreId !== data.theatreId) {
      throw new NotFoundError("Role not found in this theatre.");
    }

    const updatedPerms = await theatreStaffRepository.updateRolePermissions(
      data,
      actor?.userId || "usr-system"
    );

    this.invalidateStaffCache(data.theatreId);

    const auditActor: SecurityActorContext = actor || {
      userId: "usr-system",
      role: "SUPER_ADMIN",
      permissions: ["*"],
      correlationId: `corr-staff-${Date.now()}`,
    };

    await securityAuditService.recordAudit({
      actor: auditActor,
      module: "THEATRE_STAFF",
      action: "PERMISSIONS_UPDATED",
      description: `Updated permissions for role '${role.name}' (${updatedPerms.length} rules)`,
      metadata: { theatreId: data.theatreId, roleId: data.roleId, count: updatedPerms.length },
    });

    return updatedPerms;
  }

  // ----------------------------------------------------------------------------
  // Custom Theatre Roles
  // ----------------------------------------------------------------------------
  public async createTheatreRole(
    input: CreateTheatreRoleInput,
    actor?: SecurityActorContext
  ): Promise<TheatreRoleRecord> {
    const parsed = createTheatreRoleSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid role creation payload", formatZodIssues(parsed.error.issues));
    }

    const data = parsed.data;
    if (actor) {
      await tenantService.assertTenantAccess(actor, data.theatreId);
    }

    const existingRoles = await theatreStaffRepository.getRolesByTheatre(data.theatreId);
    if (existingRoles.some((r) => r.roleCode.toUpperCase() === data.roleCode.toUpperCase())) {
      throw new ConflictError(`A role with code '${data.roleCode}' already exists in this theatre.`);
    }

    const created = await theatreStaffRepository.createRole(data, actor?.userId || "usr-system");
    this.invalidateStaffCache(data.theatreId);

    const auditActor: SecurityActorContext = actor || {
      userId: "usr-system",
      role: "SUPER_ADMIN",
      permissions: ["*"],
      correlationId: `corr-staff-${Date.now()}`,
    };

    await securityAuditService.recordAudit({
      actor: auditActor,
      module: "THEATRE_STAFF",
      action: "ROLE_CREATED",
      description: `Created custom role '${created.name}' (${created.roleCode})`,
      metadata: { theatreId: data.theatreId, roleId: created.id, code: created.roleCode },
    });

    return created;
  }

  public async updateTheatreRole(
    input: UpdateTheatreRoleInput,
    actor?: SecurityActorContext
  ): Promise<TheatreRoleRecord> {
    const parsed = updateTheatreRoleSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid role update payload", formatZodIssues(parsed.error.issues));
    }

    const data = parsed.data;
    if (actor) {
      await tenantService.assertTenantAccess(actor, data.theatreId);
    }

    const updated = await theatreStaffRepository.updateRole(data.id, data);
    if (!updated) {
      throw new NotFoundError("Role not found in this theatre.");
    }

    this.invalidateStaffCache(data.theatreId);
    return updated;
  }

  // ----------------------------------------------------------------------------
  // Template-to-Theatre Role Instantiation
  // ----------------------------------------------------------------------------
  public async instantiateRoleFromTemplate(
    input: InstantiateRoleFromTemplateInput,
    actor?: SecurityActorContext
  ): Promise<TheatreRoleRecord> {
    const parsed = instantiateRoleFromTemplateSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid role instantiation payload", formatZodIssues(parsed.error.issues));
    }

    const data = parsed.data;
    if (actor) {
      await tenantService.assertTenantAccess(actor, data.theatreId);
    }

    const role = await theatreStaffRepository.instantiateRoleFromTemplate(data, actor?.userId || "usr-system");
    this.invalidateStaffCache(data.theatreId);

    const auditActor: SecurityActorContext = actor || {
      userId: "usr-system",
      role: "SUPER_ADMIN",
      permissions: ["*"],
      correlationId: `corr-staff-${Date.now()}`,
    };

    await securityAuditService.recordAudit({
      actor: auditActor,
      module: "THEATRE_STAFF",
      action: "ROLE_INSTANTIATED",
      description: `Instantiated role '${role.name}' from platform template '${data.templateId}'`,
      metadata: { theatreId: data.theatreId, templateId: data.templateId, roleId: role.id },
    });

    return role;
  }

  public async getRoleTemplates(actor?: SecurityActorContext): Promise<RoleTemplateRecord[]> {
    return theatreStaffRepository.getTemplates();
  }

  // ----------------------------------------------------------------------------
  // Departments
  // ----------------------------------------------------------------------------
  public async createDepartment(
    input: CreateDepartmentInput,
    actor?: SecurityActorContext
  ): Promise<StaffDepartmentRecord> {
    const parsed = createDepartmentSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid department payload", formatZodIssues(parsed.error.issues));
    }

    const data = parsed.data;
    if (actor) {
      await tenantService.assertTenantAccess(actor, data.theatreId);
    }

    const depts = await theatreStaffRepository.getDepartmentsByTheatre(data.theatreId);
    if (depts.some((d) => d.code.toUpperCase() === data.code.toUpperCase())) {
      throw new ConflictError(`Department code '${data.code}' already exists in this theatre.`);
    }

    const dept = await theatreStaffRepository.createDepartment(data);
    this.invalidateStaffCache(data.theatreId);

    const auditActor: SecurityActorContext = actor || {
      userId: "usr-system",
      role: "SUPER_ADMIN",
      permissions: ["*"],
      correlationId: `corr-staff-${Date.now()}`,
    };

    await securityAuditService.recordAudit({
      actor: auditActor,
      module: "THEATRE_STAFF",
      action: "DEPARTMENT_CREATED",
      description: `Created department '${dept.name}' (${dept.code})`,
      metadata: { theatreId: data.theatreId, deptId: dept.id, code: dept.code },
    });

    return dept;
  }

  public async updateDepartment(
    input: UpdateDepartmentInput,
    actor?: SecurityActorContext
  ): Promise<StaffDepartmentRecord> {
    const parsed = updateDepartmentSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid department update payload", formatZodIssues(parsed.error.issues));
    }

    const data = parsed.data;
    if (actor) {
      await tenantService.assertTenantAccess(actor, data.theatreId);
    }

    const updated = await theatreStaffRepository.updateDepartment(data.id, data);
    if (!updated) {
      throw new NotFoundError("Department not found in this theatre.");
    }

    this.invalidateStaffCache(data.theatreId);
    return updated;
  }

  // ----------------------------------------------------------------------------
  // Permission-Based Authorization Check
  // ----------------------------------------------------------------------------
  public async hasPermission(staffId: string, permissionKey: string): Promise<boolean> {
    const staff = await theatreStaffRepository.getStaffWithRoles(staffId);
    if (!staff) return false;
    if (staff.employmentStatus !== "ACTIVE") return false;
    return staff.permissions.includes(permissionKey);
  }

  // ----------------------------------------------------------------------------
  // Role History Audit
  // ----------------------------------------------------------------------------
  public async getRoleHistory(
    theatreId: string,
    staffId: string,
    actor?: SecurityActorContext
  ): Promise<StaffRoleHistoryRecord[]> {
    if (actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }
    return theatreStaffRepository.getRoleHistory(theatreId, staffId);
  }
}

export const theatreStaffService = new TheatreStaffService();
