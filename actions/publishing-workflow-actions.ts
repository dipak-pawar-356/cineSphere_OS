"use server";

import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { publishingWorkflowService } from "@/lib/services/publishing-workflow.service";
import {
  publishVersionActionSchema,
  unpublishVersionActionSchema,
  loadPublishStatusSchema,
  loadPublishHistorySchema,
  loadPublishingConfigSchema,
  savePublishingConfigSchema,
  assignLayoutToShowSchema,
  getLayoutForShowSchema,
  migrateShowLayoutSchema,
  saveDraftActionSchema,
  archivePublishVersionSchema,
  restorePublishVersionSchema,
} from "@/lib/validation/publishing-workflow.validation";
import {
  PublishResult,
  PublishingStatusRecord,
  PublishingHistoryEntry,
  PublishingConfiguration,
  ShowLayoutAssignment,
  ShowMigrationResult,
} from "@/types/publishing-workflow.types";
import { LayoutVersion } from "@/types/hall-designer.types";

/**
 * ==============================================================================
 * CineSphere OS — Publishing Workflow Server Actions (Phase 4 – Part 12)
 * ==============================================================================
 * Protected server actions for the atomic publishing pipeline, status inspection,
 * theatre publishing policies, and the Show Compatibility Layer.
 * ==============================================================================
 */

export const publishVersionWorkflowAction = createProtectedAction<
  z.input<typeof publishVersionActionSchema>,
  PublishResult
>(
  {
    actionName: "publishVersionWorkflowAction",
    schema: publishVersionActionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "PUBLISHING_WORKFLOW",
    auditAction: "PUBLISH_VERSION",
  },
  async (input, context) => {
    return publishingWorkflowService.publishVersion(context.actor, input);
  }
);

export const unpublishVersionWorkflowAction = createProtectedAction<
  z.input<typeof unpublishVersionActionSchema>,
  PublishingStatusRecord
>(
  {
    actionName: "unpublishVersionWorkflowAction",
    schema: unpublishVersionActionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "PUBLISHING_WORKFLOW",
    auditAction: "UNPUBLISH_VERSION",
  },
  async (input, context) => {
    return publishingWorkflowService.unpublishVersion(
      context.actor,
      input.layoutDefinitionId,
      input.theatreId,
      input.notes
    );
  }
);

export const loadPublishStatusAction = createProtectedAction<
  z.input<typeof loadPublishStatusSchema>,
  PublishingStatusRecord | undefined
>(
  {
    actionName: "loadPublishStatusAction",
    schema: loadPublishStatusSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "PUBLISHING_WORKFLOW",
    auditAction: "LOAD_STATUS",
  },
  async (input, context) => {
    return publishingWorkflowService.getPublishingStatus(
      context.actor,
      input.layoutDefinitionId,
      input.theatreId
    );
  }
);

export const loadPublishHistoryAction = createProtectedAction<
  z.input<typeof loadPublishHistorySchema>,
  PublishingHistoryEntry[]
>(
  {
    actionName: "loadPublishHistoryAction",
    schema: loadPublishHistorySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "PUBLISHING_WORKFLOW",
    auditAction: "LOAD_HISTORY",
  },
  async (input, context) => {
    return publishingWorkflowService.getPublishHistory(
      context.actor,
      input.layoutDefinitionId,
      input.theatreId
    );
  }
);

export const loadPublishingConfigAction = createProtectedAction<
  z.input<typeof loadPublishingConfigSchema>,
  PublishingConfiguration
>(
  {
    actionName: "loadPublishingConfigAction",
    schema: loadPublishingConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "PUBLISHING_WORKFLOW",
    auditAction: "LOAD_CONFIG",
  },
  async (input, context) => {
    return publishingWorkflowService.getPublishingConfig(context.actor, input.theatreId);
  }
);

export const savePublishingConfigAction = createProtectedAction<
  z.input<typeof savePublishingConfigSchema>,
  PublishingConfiguration
>(
  {
    actionName: "savePublishingConfigAction",
    schema: savePublishingConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "PUBLISHING_WORKFLOW",
    auditAction: "SAVE_CONFIG",
  },
  async (input, context) => {
    return publishingWorkflowService.savePublishingConfig(context.actor, input.theatreId, input);
  }
);

export const assignLayoutToShowAction = createProtectedAction<
  z.input<typeof assignLayoutToShowSchema>,
  ShowLayoutAssignment
>(
  {
    actionName: "assignLayoutToShowAction",
    schema: assignLayoutToShowSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SHOW_COMPATIBILITY",
    auditAction: "ASSIGN_LAYOUT",
  },
  async (input, context) => {
    return publishingWorkflowService.assignLayoutToShow(
      context.actor,
      input.showId,
      input.hallId,
      input.theatreId
    );
  }
);

export const getLayoutForShowAction = createProtectedAction<
  z.input<typeof getLayoutForShowSchema>,
  LayoutVersion
>(
  {
    actionName: "getLayoutForShowAction",
    schema: getLayoutForShowSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SHOW_COMPATIBILITY",
    auditAction: "GET_LAYOUT_FOR_SHOW",
  },
  async (input, context) => {
    return publishingWorkflowService.getLayoutForShow(
      context.actor,
      input.showId,
      input.theatreId
    );
  }
);

export const migrateShowLayoutAction = createProtectedAction<
  z.input<typeof migrateShowLayoutSchema>,
  ShowMigrationResult
>(
  {
    actionName: "migrateShowLayoutAction",
    schema: migrateShowLayoutSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SHOW_COMPATIBILITY",
    auditAction: "MIGRATE_SHOW_LAYOUT",
  },
  async (input, context) => {
    return publishingWorkflowService.migrateShowLayout(
      context.actor,
      {
        showId: input.showId,
        theatreId: input.theatreId,
        targetLayoutVersionId: input.targetLayoutVersionId,
        migrationReason: input.migrationReason,
      },
      input.bookedSeatsCount
    );
  }
);

export const publishVersionAction = publishVersionWorkflowAction;
export const unpublishVersionAction = unpublishVersionWorkflowAction;

export const saveDraftAction = createProtectedAction<
  z.input<typeof saveDraftActionSchema>,
  LayoutVersion
>(
  {
    actionName: "saveDraftAction",
    schema: saveDraftActionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "PUBLISHING_WORKFLOW",
    auditAction: "SAVE_DRAFT",
  },
  async (input, context) => {
    return publishingWorkflowService.saveDraft(
      context.actor,
      input.layoutDefinitionId,
      input.theatreId,
      input.notes
    );
  }
);

export const archiveVersionWorkflowAction = createProtectedAction<
  z.input<typeof archivePublishVersionSchema>,
  PublishingStatusRecord
>(
  {
    actionName: "archiveVersionWorkflowAction",
    schema: archivePublishVersionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "PUBLISHING_WORKFLOW",
    auditAction: "ARCHIVE_VERSION",
  },
  async (input, context) => {
    return publishingWorkflowService.archivePublishVersion(
      context.actor,
      input.layoutDefinitionId,
      input.theatreId,
      input.notes
    );
  }
);

export const restoreVersionWorkflowAction = createProtectedAction<
  z.input<typeof restorePublishVersionSchema>,
  PublishResult
>(
  {
    actionName: "restoreVersionWorkflowAction",
    schema: restorePublishVersionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "PUBLISHING_WORKFLOW",
    auditAction: "RESTORE_VERSION",
  },
  async (input, context) => {
    return publishingWorkflowService.restorePublishVersion(
      context.actor,
      input.layoutDefinitionId,
      input.targetVersionId,
      input.theatreId,
      input.notes
    );
  }
);
