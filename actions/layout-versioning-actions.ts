"use server";

import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { layoutVersioningService } from "@/lib/services/layout-versioning.service";
import {
  loadVersionHistorySchema,
  createDraftVersionSchema,
  compareVersionsSchema,
  rollbackVersionSchema,
  saveVersionPolicySchema,
  getVersionPolicySchema,
  getChangeEventsSchema,
} from "@/lib/validation/layout-versioning.validation";
import {
  VersionHistoryItem,
  VersionComparisonDiff,
  VersionPolicy,
  RollbackResult,
  VersionChangeEvent,
} from "@/types/layout-versioning.types";
import { LayoutVersion } from "@/types/hall-designer.types";

/**
 * ==============================================================================
 * CineSphere OS — Layout Versioning Server Actions (Phase 4 – Part 11)
 * ==============================================================================
 * Protected server actions for immutable version history, branching, comparison,
 * rollback, and theatre-specific versioning policies.
 * ==============================================================================
 */

export const loadVersionHistoryAction = createProtectedAction<
  z.input<typeof loadVersionHistorySchema>,
  VersionHistoryItem[]
>(
  {
    actionName: "loadVersionHistoryAction",
    schema: loadVersionHistorySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "LAYOUT_VERSIONING",
    auditAction: "LOAD_HISTORY",
  },
  async (input, context) => {
    return layoutVersioningService.getVersionHistory(
      context.actor,
      input.layoutDefinitionId,
      input.theatreId
    );
  }
);

export const createLayoutDraftVersionAction = createProtectedAction<
  z.input<typeof createDraftVersionSchema>,
  LayoutVersion
>(
  {
    actionName: "createLayoutDraftVersionAction",
    schema: createDraftVersionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "LAYOUT_VERSIONING",
    auditAction: "CREATE_DRAFT",
  },
  async (input, context) => {
    return layoutVersioningService.createDraftVersion(
      context.actor,
      input.layoutDefinitionId,
      input.theatreId,
      input.notes || "",
      input.sourceVersionId
    );
  }
);

export const compareVersionsAction = createProtectedAction<
  z.input<typeof compareVersionsSchema>,
  VersionComparisonDiff
>(
  {
    actionName: "compareVersionsAction",
    schema: compareVersionsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "LAYOUT_VERSIONING",
    auditAction: "COMPARE_VERSIONS",
  },
  async (input, context) => {
    return layoutVersioningService.compareVersions(
      context.actor,
      input.sourceVersionId,
      input.targetVersionId,
      input.theatreId
    );
  }
);

export const rollbackVersionAction = createProtectedAction<
  z.input<typeof rollbackVersionSchema>,
  RollbackResult
>(
  {
    actionName: "rollbackVersionAction",
    schema: rollbackVersionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "LAYOUT_VERSIONING",
    auditAction: "ROLLBACK",
  },
  async (input, context) => {
    return layoutVersioningService.rollbackVersion(
      context.actor,
      input.layoutDefinitionId,
      input.targetVersionId,
      input.theatreId,
      input.notes || ""
    );
  }
);

export const loadVersionPolicyAction = createProtectedAction<
  z.input<typeof getVersionPolicySchema>,
  VersionPolicy
>(
  {
    actionName: "loadVersionPolicyAction",
    schema: getVersionPolicySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "LAYOUT_VERSIONING",
    auditAction: "LOAD_POLICY",
  },
  async (input, context) => {
    return layoutVersioningService.getVersionPolicy(context.actor, input.theatreId);
  }
);

export const saveVersionPolicyAction = createProtectedAction<
  z.input<typeof saveVersionPolicySchema>,
  VersionPolicy
>(
  {
    actionName: "saveVersionPolicyAction",
    schema: saveVersionPolicySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "LAYOUT_VERSIONING",
    auditAction: "SAVE_POLICY",
  },
  async (input, context) => {
    return layoutVersioningService.saveVersionPolicy(context.actor, input.theatreId, input);
  }
);

export const loadChangeEventsAction = createProtectedAction<
  z.input<typeof getChangeEventsSchema>,
  VersionChangeEvent[]
>(
  {
    actionName: "loadChangeEventsAction",
    schema: getChangeEventsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "LAYOUT_VERSIONING",
    auditAction: "LOAD_CHANGE_EVENTS",
  },
  async (input, context) => {
    return layoutVersioningService.getChangeEvents(
      context.actor,
      input.versionId,
      input.theatreId
    );
  }
);
