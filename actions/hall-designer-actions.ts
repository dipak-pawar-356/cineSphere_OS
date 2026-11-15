"use server";

import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { hallDesignerService } from "@/lib/services/hall-designer.service";
import {
  CreateLayoutDefinitionSchema,
  GetLayoutDefinitionSchema,
  ListLayoutDefinitionsSchema,
  GetLayoutVersionSchema,
  ListLayoutVersionsSchema,
  CreateDraftVersionSchema,
  UpdateDraftLayoutSchema,
  ValidateLayoutVersionSchema,
  PublishLayoutVersionSchema,
  ArchiveLayoutSchema,
  RestoreLayoutSchema,
  DuplicateLayoutSchema,
  GetPublishedLayoutForHallSchema,
  LoadCanvasPreferencesSchema,
  SaveCanvasPreferencesSchema,
  ResetCanvasPreferencesSchema,
} from "@/lib/validation/hall-designer.validation";
import {
  LayoutDefinition,
  LayoutVersion,
  LayoutValidationResult,
  CanvasPreferences,
} from "@/types/hall-designer.types";

/**
 * ==============================================================================
 * CineSphere OS — Hall Designer Server Actions (Phase 4 – Parts 1 & 2)
 * ==============================================================================
 * Protected server actions enforcing multi-tenant isolation, role-based access
 * control, rate limiting, and audit trail for Layout Definitions, Layout Versions,
 * validation triggers, publishing transitions, and visual Canvas Preferences.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Layout Definitions
// ------------------------------------------------------------------------------

export const createLayoutDefinitionAction = createProtectedAction<
  z.input<typeof CreateLayoutDefinitionSchema>,
  { definition: LayoutDefinition; initialDraft: LayoutVersion }
>(
  {
    actionName: "createLayoutDefinitionAction",
    schema: CreateLayoutDefinitionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_DESIGNER",
    auditAction: "CREATE_LAYOUT_DEFINITION",
  },
  async (input, context) => {
    return hallDesignerService.createLayoutDefinition(context.actor, input);
  }
);

export const getLayoutDefinitionAction = createProtectedAction<
  z.input<typeof GetLayoutDefinitionSchema>,
  {
    definition: LayoutDefinition;
    versions: LayoutVersion[];
    currentPublishedVersion?: LayoutVersion;
    activeDraftVersion?: LayoutVersion;
  }
>(
  {
    actionName: "getLayoutDefinitionAction",
    schema: GetLayoutDefinitionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_DESIGNER",
    auditAction: "GET_LAYOUT_DEFINITION",
  },
  async (input, context) => {
    return hallDesignerService.getLayoutDefinition(
      context.actor,
      input.layoutDefinitionId,
      input.theatreId
    );
  }
);

export const listLayoutDefinitionsAction = createProtectedAction<
  z.input<typeof ListLayoutDefinitionsSchema>,
  LayoutDefinition[]
>(
  {
    actionName: "listLayoutDefinitionsAction",
    schema: ListLayoutDefinitionsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_DESIGNER",
    auditAction: "LIST_LAYOUT_DEFINITIONS",
  },
  async (input, context) => {
    return hallDesignerService.listLayoutDefinitions(
      context.actor,
      input.hallId,
      input.theatreId
    );
  }
);

// ------------------------------------------------------------------------------
// 2. Layout Versions Lifecycle
// ------------------------------------------------------------------------------

export const getLayoutVersionAction = createProtectedAction<
  z.input<typeof GetLayoutVersionSchema>,
  LayoutVersion
>(
  {
    actionName: "getLayoutVersionAction",
    schema: GetLayoutVersionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_DESIGNER",
    auditAction: "GET_LAYOUT_VERSION",
  },
  async (input, context) => {
    return hallDesignerService.getLayoutVersion(
      context.actor,
      input.versionId,
      input.theatreId
    );
  }
);

export const listLayoutVersionsAction = createProtectedAction<
  z.input<typeof ListLayoutVersionsSchema>,
  LayoutVersion[]
>(
  {
    actionName: "listLayoutVersionsAction",
    schema: ListLayoutVersionsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_DESIGNER",
    auditAction: "LIST_LAYOUT_VERSIONS",
  },
  async (input, context) => {
    return hallDesignerService.listLayoutVersions(
      context.actor,
      input.layoutDefinitionId,
      input.theatreId
    );
  }
);

export const createDraftVersionAction = createProtectedAction<
  z.input<typeof CreateDraftVersionSchema>,
  LayoutVersion
>(
  {
    actionName: "createDraftVersionAction",
    schema: CreateDraftVersionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_DESIGNER",
    auditAction: "CREATE_DRAFT_VERSION",
  },
  async (input, context) => {
    return hallDesignerService.createDraftVersion(
      context.actor,
      input.layoutDefinitionId,
      input.notes || "New draft version",
      input.theatreId
    );
  }
);

export const updateDraftLayoutAction = createProtectedAction<
  z.input<typeof UpdateDraftLayoutSchema>,
  LayoutVersion
>(
  {
    actionName: "updateDraftLayoutAction",
    schema: UpdateDraftLayoutSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_DESIGNER",
    auditAction: "UPDATE_DRAFT_LAYOUT",
  },
  async (input, context) => {
    return hallDesignerService.updateDraftLayout(
      context.actor,
      input.versionId,
      input.payload,
      input.theatreId
    );
  }
);

export const validateLayoutVersionAction = createProtectedAction<
  z.input<typeof ValidateLayoutVersionSchema>,
  LayoutValidationResult
>(
  {
    actionName: "validateLayoutVersionAction",
    schema: ValidateLayoutVersionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_DESIGNER",
    auditAction: "VALIDATE_LAYOUT_VERSION",
  },
  async (input, context) => {
    return hallDesignerService.validateLayoutVersion(
      context.actor,
      input.versionId,
      input.theatreId
    );
  }
);

export const publishLayoutVersionAction = createProtectedAction<
  z.input<typeof PublishLayoutVersionSchema>,
  { definition: LayoutDefinition; publishedVersion: LayoutVersion }
>(
  {
    actionName: "publishLayoutVersionAction",
    schema: PublishLayoutVersionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_DESIGNER",
    auditAction: "PUBLISH_LAYOUT_VERSION",
  },
  async (input, context) => {
    return hallDesignerService.publishLayoutVersion(
      context.actor,
      input.layoutDefinitionId,
      input.versionId,
      input.theatreId
    );
  }
);

export const archiveLayoutAction = createProtectedAction<
  z.input<typeof ArchiveLayoutSchema>,
  LayoutDefinition
>(
  {
    actionName: "archiveLayoutAction",
    schema: ArchiveLayoutSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_DESIGNER",
    auditAction: "ARCHIVE_LAYOUT",
  },
  async (input, context) => {
    return hallDesignerService.archiveLayout(
      context.actor,
      input.layoutDefinitionId,
      input.theatreId
    );
  }
);

export const restoreLayoutAction = createProtectedAction<
  z.input<typeof RestoreLayoutSchema>,
  LayoutVersion
>(
  {
    actionName: "restoreLayoutAction",
    schema: RestoreLayoutSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_DESIGNER",
    auditAction: "RESTORE_LAYOUT",
  },
  async (input, context) => {
    return hallDesignerService.restoreLayout(
      context.actor,
      input.layoutDefinitionId,
      input.versionId,
      input.theatreId
    );
  }
);

export const duplicateLayoutAction = createProtectedAction<
  z.input<typeof DuplicateLayoutSchema>,
  { definition: LayoutDefinition; initialVersion: LayoutVersion }
>(
  {
    actionName: "duplicateLayoutAction",
    schema: DuplicateLayoutSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_DESIGNER",
    auditAction: "DUPLICATE_LAYOUT",
  },
  async (input, context) => {
    return hallDesignerService.duplicateLayout(
      context.actor,
      input.layoutDefinitionId,
      input.newName,
      input.theatreId
    );
  }
);

export const getPublishedLayoutForHallAction = createProtectedAction<
  z.input<typeof GetPublishedLayoutForHallSchema>,
  LayoutVersion | undefined
>(
  {
    actionName: "getPublishedLayoutForHallAction",
    schema: GetPublishedLayoutForHallSchema,
    rateLimitCategory: "PUBLIC_DEFAULT",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_DESIGNER",
    auditAction: "GET_PUBLISHED_LAYOUT",
  },
  async (input, context) => {
    return hallDesignerService.getPublishedLayoutForHall(
      context.actor,
      input.hallId,
      input.theatreId
    );
  }
);

// ------------------------------------------------------------------------------
// 3. Canvas Preferences (Part 2)
// ------------------------------------------------------------------------------

export const loadCanvasPreferencesAction = createProtectedAction<
  z.input<typeof LoadCanvasPreferencesSchema>,
  CanvasPreferences
>(
  {
    actionName: "loadCanvasPreferencesAction",
    schema: LoadCanvasPreferencesSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_DESIGNER",
    auditAction: "LOAD_CANVAS_PREFERENCES",
  },
  async (input, context) => {
    return hallDesignerService.getCanvasPreferences(context.actor, input.theatreId);
  }
);

export const saveCanvasPreferencesAction = createProtectedAction<
  z.input<typeof SaveCanvasPreferencesSchema>,
  CanvasPreferences
>(
  {
    actionName: "saveCanvasPreferencesAction",
    schema: SaveCanvasPreferencesSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_DESIGNER",
    auditAction: "SAVE_CANVAS_PREFERENCES",
  },
  async (input, context) => {
    return hallDesignerService.saveCanvasPreferences(
      context.actor,
      input.preferences,
      input.theatreId
    );
  }
);

export const resetCanvasPreferencesAction = createProtectedAction<
  z.input<typeof ResetCanvasPreferencesSchema>,
  CanvasPreferences
>(
  {
    actionName: "resetCanvasPreferencesAction",
    schema: ResetCanvasPreferencesSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_DESIGNER",
    auditAction: "RESET_CANVAS_PREFERENCES",
  },
  async (input, context) => {
    return hallDesignerService.resetCanvasPreferences(context.actor, input.theatreId);
  }
);
