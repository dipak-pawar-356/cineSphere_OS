"use server";

import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { theatreGovernanceService } from "@/lib/services/theatre-governance.service";
import {
  ValidateOwnershipSchema,
  SoftDeleteResourceSchema,
  RestoreResourceSchema,
  MediaValidationInputSchema,
  ActivityHistoryQuerySchema,
  EvaluatePolicySchema,
  UpdateSecurityConfigSchema,
} from "@/lib/validation/theatre-governance.validation";
import {
  OwnershipValidationResult,
  SoftDeletableEntity,
  MediaValidationResult,
  ActivityHistoryRecord,
  PolicyEvaluationResult,
  TheatreSecurityConfiguration,
  TheatreSecurityPolicyKey,
} from "@/types/theatre-security-governance.types";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Governance & Security Server Actions (Phase 3 – Part 14)
 * ==============================================================================
 * Reusable server actions for the Platform Security & Governance Layer.
 * Gated by authentication, RBAC, tenant isolation, and audit logging.
 * ==============================================================================
 */

// 1. Validate Resource Ownership
export const validateResourceOwnershipAction = createProtectedAction<
  z.input<typeof ValidateOwnershipSchema>,
  OwnershipValidationResult
>(
  {
    actionName: "validateResourceOwnershipAction",
    schema: ValidateOwnershipSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "HALL_MANAGER", "SUPER_ADMIN"],
  },
  async (input, context) => {
    return theatreGovernanceService.validateOwnership(
      input.theatreId,
      input.resourceType,
      input.resourceId,
      context.actor
    );
  }
);

// 2. Soft Delete Resource
export const softDeleteResourceAction = createProtectedAction<
  z.input<typeof SoftDeleteResourceSchema>,
  SoftDeletableEntity
>(
  {
    actionName: "softDeleteResourceAction",
    schema: SoftDeleteResourceSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "GOVERNANCE",
    auditAction: "SOFT_DELETE",
  },
  async (input, context) => {
    return theatreGovernanceService.softDeleteResource(
      input.theatreId,
      input.resourceType,
      input.resourceId,
      context.actor,
      input.reason
    );
  }
);

// 3. Restore Soft-Deleted Resource
export const restoreResourceAction = createProtectedAction<
  z.input<typeof RestoreResourceSchema>,
  SoftDeletableEntity
>(
  {
    actionName: "restoreResourceAction",
    schema: RestoreResourceSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "GOVERNANCE",
    auditAction: "RESTORE",
  },
  async (input, context) => {
    return theatreGovernanceService.restoreResource(
      input.theatreId,
      input.resourceType,
      input.resourceId,
      context.actor
    );
  }
);

// 4. Validate Media Upload Quota
export const validateMediaUploadAction = createProtectedAction<
  z.input<typeof MediaValidationInputSchema>,
  MediaValidationResult
>(
  {
    actionName: "validateMediaUploadAction",
    schema: MediaValidationInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
  },
  async (input) => {
    return theatreGovernanceService.validateMediaUpload({
      theatreId: input.theatreId,
      fileName: input.fileName,
      fileSizeBytes: input.fileSizeBytes,
      mimeType: input.mimeType,
      width: input.width,
      height: input.height,
      sha256Checksum: input.sha256Checksum,
    });
  }
);

// 5. Query Activity History
export const getActivityHistoryAction = createProtectedAction<
  z.input<typeof ActivityHistoryQuerySchema>,
  ActivityHistoryRecord[]
>(
  {
    actionName: "getActivityHistoryAction",
    schema: ActivityHistoryQuerySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
  },
  async (input) => {
    return theatreGovernanceService.getActivityHistory(input);
  }
);

// 6. Evaluate Security Policy
export const evaluatePolicyAction = createProtectedAction<
  z.input<typeof EvaluatePolicySchema>,
  PolicyEvaluationResult
>(
  {
    actionName: "evaluatePolicyAction",
    schema: EvaluatePolicySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
  },
  async (input, context) => {
    return theatreGovernanceService.evaluatePolicy(
      input.policyKey as TheatreSecurityPolicyKey,
      context.actor,
      input.targetTenantId
    );
  }
);

// 7. Update Theatre Security Configuration
export const updateSecurityConfigAction = createProtectedAction<
  z.input<typeof UpdateSecurityConfigSchema>,
  TheatreSecurityConfiguration
>(
  {
    actionName: "updateSecurityConfigAction",
    schema: UpdateSecurityConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "GOVERNANCE",
    auditAction: "UPDATE_CONFIG",
  },
  async (input, context) => {
    const { theatreId, ...updates } = input;
    return theatreGovernanceService.updateSecurityConfiguration(
      theatreId,
      updates,
      context.actor
    );
  }
);
