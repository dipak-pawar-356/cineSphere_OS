"use server";

import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { hallValidationService } from "@/lib/services/hall-validation.service";
import {
  RunValidationSchema,
  ValidateLayoutSchema,
  LoadValidationRulesSchema,
  SaveValidationConfigSchema,
  ValidateBeforePublishSchema,
} from "@/lib/validation/hall-validation.validation";
import {
  ValidationReport,
  ValidationRule,
  ValidationConfiguration,
} from "@/types/hall-validation.types";

/**
 * ==============================================================================
 * CineSphere OS — Hall Validation Server Actions (Phase 4 – Part 10)
 * ==============================================================================
 * Protected server actions for pluggable preflight validation, theatre policies,
 * rule inspection, and pre-publish enforcement gates.
 * ==============================================================================
 */

export const runValidationAction = createProtectedAction<
  z.input<typeof RunValidationSchema>,
  ValidationReport
>(
  {
    actionName: "runValidationAction",
    schema: RunValidationSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_VALIDATION",
    auditAction: "RUN_VALIDATION",
  },
  async (input, context) => {
    return hallValidationService.runValidation(
      context.actor,
      input.layoutVersionId,
      input.theatreId
    );
  }
);

export const validateHallLayoutAction = createProtectedAction<
  z.input<typeof ValidateLayoutSchema>,
  ValidationReport
>(
  {
    actionName: "validateHallLayoutAction",
    schema: ValidateLayoutSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_VALIDATION",
    auditAction: "VALIDATE_HALL_LAYOUT",
  },
  async (input, context) => {
    return hallValidationService.runValidation(
      context.actor,
      input.layoutVersionId,
      input.theatreId
    );
  }
);

export const loadValidationRulesAction = createProtectedAction<
  z.input<typeof LoadValidationRulesSchema>,
  ValidationRule[]
>(
  {
    actionName: "loadValidationRulesAction",
    schema: LoadValidationRulesSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_VALIDATION",
    auditAction: "LOAD_RULES",
  },
  async (input, context) => {
    return hallValidationService.loadValidationRules(
      context.actor,
      input.theatreId
    );
  }
);

export const saveValidationConfigAction = createProtectedAction<
  z.input<typeof SaveValidationConfigSchema>,
  ValidationConfiguration
>(
  {
    actionName: "saveValidationConfigAction",
    schema: SaveValidationConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_VALIDATION",
    auditAction: "SAVE_CONFIG",
  },
  async (input, context) => {
    const { theatreId, ...config } = input;
    return hallValidationService.saveValidationConfiguration(
      context.actor,
      config,
      theatreId
    );
  }
);

export const validateBeforePublishAction = createProtectedAction<
  z.input<typeof ValidateBeforePublishSchema>,
  ValidationReport
>(
  {
    actionName: "validateBeforePublishAction",
    schema: ValidateBeforePublishSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_VALIDATION",
    auditAction: "VALIDATE_BEFORE_PUBLISH",
  },
  async (input, context) => {
    return hallValidationService.validateBeforePublish(
      context.actor,
      input.layoutVersionId,
      input.theatreId
    );
  }
);
