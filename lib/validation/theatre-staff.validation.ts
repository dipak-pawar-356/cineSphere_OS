import { z } from "zod";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Staff & Dynamic RBAC Validation Schemas (Phase 3 – Part 10)
 * ==============================================================================
 * Multi-tenant input validation guards for staff onboarding, invitations,
 * role assignments, permission sets, department creation, and lifecycle status.
 * ==============================================================================
 */

const phoneRegex = /^\+?[0-9\s\-()]{7,25}$/;
const employeeCodeRegex = /^[A-Z0-9_\-]+$/i;

export const staffEmploymentStatusSchema = z.enum([
  "INVITED",
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "RESIGNED",
  "ARCHIVED",
]);

export const staffDepartmentTypeSchema = z.enum([
  "OPERATIONS",
  "PROJECTION",
  "CUSTOMER_SUPPORT",
  "SECURITY",
  "MAINTENANCE",
  "FOOD_COURT",
  "ADMINISTRATION",
  "FINANCE",
  "MARKETING",
  "CUSTOM",
]);

export const theatreRoleStatusSchema = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);

export const staffRoleChangeTypeSchema = z.enum([
  "ASSIGNED",
  "PROMOTED",
  "DEMOTED",
  "TRANSFERRED",
  "REVOKED",
]);

// ------------------------------------------------------------------------------
// Staff Onboarding & Invitation Validation
// ------------------------------------------------------------------------------

export const createStaffSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  employeeCode: z
    .string()
    .trim()
    .min(2, "Employee code must be at least 2 characters")
    .max(64, "Employee code cannot exceed 64 characters")
    .regex(employeeCodeRegex, "Employee code can only contain alphanumeric characters, hyphens, and underscores")
    .optional(),
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(128, "First name cannot exceed 128 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(128, "Last name cannot exceed 128 characters"),
  displayName: z
    .string()
    .trim()
    .max(256, "Display name cannot exceed 256 characters")
    .optional(),
  email: z
    .string()
    .trim()
    .email("A valid email address is required")
    .max(256, "Email cannot exceed 256 characters"),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "A valid phone number (7-25 characters) is required"),
  avatarUrl: z.string().url("Invalid avatar URL format").optional().or(z.literal("")),
  designation: z
    .string()
    .trim()
    .min(1, "Designation is required")
    .max(128, "Designation cannot exceed 128 characters"),
  departmentId: z.string().trim().optional(),
  roleId: z.string().trim().optional(),
  employmentStatus: staffEmploymentStatusSchema.default("ACTIVE"),
  joiningDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  reportingManagerId: z.string().trim().optional(),
  emergencyContact: z
    .object({
      name: z.string().trim().max(128).optional(),
      relationship: z.string().trim().max(64).optional(),
      phone: z.string().trim().regex(phoneRegex, "Invalid emergency phone").optional().or(z.literal("")),
    })
    .optional(),
  notes: z.string().trim().max(2000, "Notes cannot exceed 2000 characters").optional(),
});

export const inviteStaffSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(128, "First name cannot exceed 128 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(128, "Last name cannot exceed 128 characters"),
  email: z
    .string()
    .trim()
    .email("Valid email required for invitation")
    .max(256, "Email cannot exceed 256 characters"),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Valid phone number required")
    .optional()
    .or(z.literal("")),
  designation: z
    .string()
    .trim()
    .min(1, "Designation is required")
    .max(128, "Designation cannot exceed 128 characters"),
  departmentId: z.string().trim().optional(),
  roleId: z.string().min(1, "A role must be assigned to the invitation"),
  notes: z.string().trim().max(1000).optional(),
});

export const updateStaffSchema = z.object({
  id: z.string().min(1, "Staff ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  firstName: z.string().trim().min(1).max(128).optional(),
  lastName: z.string().trim().min(1).max(128).optional(),
  displayName: z.string().trim().max(256).optional(),
  phone: z.string().trim().regex(phoneRegex, "Invalid phone number format").optional(),
  avatarUrl: z.string().url("Invalid avatar URL format").optional().or(z.literal("")),
  designation: z.string().trim().min(1).max(128).optional(),
  departmentId: z.string().trim().optional(),
  employmentStatus: staffEmploymentStatusSchema.optional(),
  resignationDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  reportingManagerId: z.string().trim().optional(),
  emergencyContact: z
    .object({
      name: z.string().trim().max(128).optional(),
      relationship: z.string().trim().max(64).optional(),
      phone: z.string().trim().regex(phoneRegex, "Invalid emergency phone").optional().or(z.literal("")),
    })
    .optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const archiveStaffSchema = z.object({
  id: z.string().min(1, "Staff ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  reason: z.string().trim().max(500).optional(),
});

export const suspendStaffSchema = z.object({
  id: z.string().min(1, "Staff ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  reason: z
    .string()
    .trim()
    .min(3, "A valid reason of at least 3 characters is mandatory for suspension")
    .max(500, "Reason cannot exceed 500 characters"),
});

// ------------------------------------------------------------------------------
// Role & Permission Assignment Validation
// ------------------------------------------------------------------------------

export const assignRoleSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  staffId: z.string().min(1, "Staff ID is required"),
  roleId: z.string().min(1, "Role ID is required"),
  isPrimary: z.boolean().default(true),
  expiresAt: z.string().datetime({ offset: true }).optional(),
  reason: z.string().trim().max(500).optional(),
});

export const removeRoleSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  staffId: z.string().min(1, "Staff ID is required"),
  roleId: z.string().min(1, "Role ID is required"),
  reason: z.string().trim().max(500).optional(),
});

export const updateRolePermissionsSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  roleId: z.string().min(1, "Role ID is required"),
  permissions: z.array(
    z.object({
      permissionKey: z.string().min(1, "Permission key cannot be empty"),
      module: z.string().min(1, "Module name cannot be empty"),
      isGranted: z.boolean(),
    })
  ).min(1, "At least one permission must be provided"),
});

// ------------------------------------------------------------------------------
// Theatre Role Creation & Template Instantiation Validation
// ------------------------------------------------------------------------------

export const createTheatreRoleSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  roleCode: z
    .string()
    .trim()
    .min(2, "Role code must be at least 2 characters")
    .max(64, "Role code cannot exceed 64 characters")
    .regex(/^[A-Z0-9_]+$/i, "Role code can only contain letters, numbers, and underscores"),
  name: z
    .string()
    .trim()
    .min(2, "Role name must be at least 2 characters")
    .max(128, "Role name cannot exceed 128 characters"),
  description: z.string().trim().max(1000).optional(),
  hierarchyLevel: z.number().int().min(1).max(10).default(1),
  templateId: z.string().trim().optional(),
  permissions: z.array(z.string().min(1)).default([]),
});

export const updateTheatreRoleSchema = z.object({
  id: z.string().min(1, "Role ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  name: z.string().trim().min(2).max(128).optional(),
  description: z.string().trim().max(1000).optional(),
  hierarchyLevel: z.number().int().min(1).max(10).optional(),
  status: theatreRoleStatusSchema.optional(),
});

export const instantiateRoleFromTemplateSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  templateId: z.string().min(1, "Template ID is required"),
  customName: z.string().trim().min(2).max(128).optional(),
  customDescription: z.string().trim().max(1000).optional(),
  customHierarchyLevel: z.number().int().min(1).max(10).optional(),
  overriddenPermissions: z.array(z.string().min(1)).optional(),
});

// ------------------------------------------------------------------------------
// Department Validation
// ------------------------------------------------------------------------------

export const createDepartmentSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  code: z
    .string()
    .trim()
    .min(2, "Department code must be at least 2 characters")
    .max(64, "Department code cannot exceed 64 characters")
    .regex(/^[A-Z0-9_\-]+$/i, "Department code can only contain alphanumeric and hyphens/underscores"),
  name: z
    .string()
    .trim()
    .min(2, "Department name must be at least 2 characters")
    .max(128, "Department name cannot exceed 128 characters"),
  departmentType: staffDepartmentTypeSchema.default("OPERATIONS"),
  description: z.string().trim().max(1000).optional(),
  departmentHeadId: z.string().trim().optional(),
});

export const updateDepartmentSchema = z.object({
  id: z.string().min(1, "Department ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  name: z.string().trim().min(2).max(128).optional(),
  description: z.string().trim().max(1000).optional(),
  departmentHeadId: z.string().trim().optional(),
  status: z.string().trim().optional(),
});

export const staffSearchFiltersSchema = z.object({
  theatreId: z.string().optional(),
  query: z.string().trim().optional(),
  departmentId: z.string().trim().optional(),
  roleId: z.string().trim().optional(),
  employmentStatus: z
    .enum(["INVITED", "ACTIVE", "INACTIVE", "SUSPENDED", "RESIGNED", "ARCHIVED", "ALL"])
    .optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
