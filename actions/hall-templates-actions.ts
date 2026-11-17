"use server";

import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { hallTemplatesService } from "@/lib/services/hall-templates.service";
import {
  loadTemplatesSchema,
  getTemplateDetailsSchema,
  createTemplateSchema,
  updateTemplateSchema,
  duplicateTemplateSchema,
  archiveTemplateSchema,
  generateLayoutFromTemplateSchema,
  loadTemplateConfigSchema,
  saveTemplateConfigSchema,
  restoreTemplateSchema,
  previewTemplateSchema,
  exportTemplateSchema,
  importTemplateSchema,
  syncInheritedTemplateSchema,
  loadTemplateRegistrySchema,
} from "@/lib/validation/hall-templates.validation";
import {
  HallTemplateDefinition,
  GenerateLayoutFromTemplateResult,
  TemplateConfiguration,
  TemplatePreviewResult,
  TemplateExportEnvelope,
  SyncInheritedTemplateResult,
  TemplateRegistryItem,
} from "@/types/hall-templates.types";

/**
 * ==============================================================================
 * CineSphere OS — Hall Templates Server Actions (Phase 4 – Part 14)
 * ==============================================================================
 * Protected server actions for the reusable Hall Template Engine.
 * Supports built-in and theatre-specific templates, duplication, inheritance,
 * and blueprint-based Layout Definition generation.
 * ==============================================================================
 */

export const loadTemplatesAction = createProtectedAction<
  z.input<typeof loadTemplatesSchema>,
  HallTemplateDefinition[]
>(
  {
    actionName: "loadTemplatesAction",
    schema: loadTemplatesSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_TEMPLATES",
    auditAction: "LOAD_TEMPLATES",
  },
  async (input, context) => {
    return hallTemplatesService.getTemplates(context.actor, input.theatreId, input.category);
  }
);

export const getTemplateDetailsAction = createProtectedAction<
  z.input<typeof getTemplateDetailsSchema>,
  HallTemplateDefinition
>(
  {
    actionName: "getTemplateDetailsAction",
    schema: getTemplateDetailsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_TEMPLATES",
    auditAction: "GET_TEMPLATE",
  },
  async (input, context) => {
    return hallTemplatesService.getTemplateById(context.actor, input.templateId, input.theatreId);
  }
);

export const createTemplateAction = createProtectedAction<
  z.input<typeof createTemplateSchema>,
  HallTemplateDefinition
>(
  {
    actionName: "createTemplateAction",
    schema: createTemplateSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId || "platform",
    auditModule: "HALL_TEMPLATES",
    auditAction: "CREATE_TEMPLATE",
  },
  async (input, context) => {
    return hallTemplatesService.createTemplate(context.actor, input);
  }
);

export const updateTemplateAction = createProtectedAction<
  z.input<typeof updateTemplateSchema>,
  HallTemplateDefinition
>(
  {
    actionName: "updateTemplateAction",
    schema: updateTemplateSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId || "platform",
    auditModule: "HALL_TEMPLATES",
    auditAction: "UPDATE_TEMPLATE",
  },
  async (input, context) => {
    return hallTemplatesService.updateTemplate(context.actor, input);
  }
);

export const duplicateTemplateAction = createProtectedAction<
  z.input<typeof duplicateTemplateSchema>,
  HallTemplateDefinition
>(
  {
    actionName: "duplicateTemplateAction",
    schema: duplicateTemplateSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_TEMPLATES",
    auditAction: "DUPLICATE_TEMPLATE",
  },
  async (input, context) => {
    return hallTemplatesService.duplicateTemplate(context.actor, input);
  }
);

export const archiveTemplateAction = createProtectedAction<
  z.input<typeof archiveTemplateSchema>,
  HallTemplateDefinition
>(
  {
    actionName: "archiveTemplateAction",
    schema: archiveTemplateSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_TEMPLATES",
    auditAction: "ARCHIVE_TEMPLATE",
  },
  async (input, context) => {
    return hallTemplatesService.archiveTemplate(
      context.actor,
      input.templateId,
      input.theatreId
    );
  }
);

export const generateLayoutFromTemplateAction = createProtectedAction<
  z.input<typeof generateLayoutFromTemplateSchema>,
  GenerateLayoutFromTemplateResult
>(
  {
    actionName: "generateLayoutFromTemplateAction",
    schema: generateLayoutFromTemplateSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_TEMPLATES",
    auditAction: "GENERATE_LAYOUT",
  },
  async (input, context) => {
    return hallTemplatesService.generateLayoutFromTemplate(context.actor, input);
  }
);

export const generateLayoutAction = generateLayoutFromTemplateAction;

export const loadTemplateConfigAction = createProtectedAction<
  z.input<typeof loadTemplateConfigSchema>,
  TemplateConfiguration
>(
  {
    actionName: "loadTemplateConfigAction",
    schema: loadTemplateConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_TEMPLATES",
    auditAction: "LOAD_CONFIG",
  },
  async (input, context) => {
    return hallTemplatesService.getConfiguration(context.actor, input.theatreId);
  }
);

export const saveTemplateConfigAction = createProtectedAction<
  z.input<typeof saveTemplateConfigSchema>,
  TemplateConfiguration
>(
  {
    actionName: "saveTemplateConfigAction",
    schema: saveTemplateConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_TEMPLATES",
    auditAction: "SAVE_CONFIG",
  },
  async (input, context) => {
    return hallTemplatesService.updateConfiguration(
      context.actor,
      input.theatreId,
      input
    );
  }
);

export const restoreTemplateAction = createProtectedAction<
  z.input<typeof restoreTemplateSchema>,
  HallTemplateDefinition
>(
  {
    actionName: "restoreTemplateAction",
    schema: restoreTemplateSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_TEMPLATES",
    auditAction: "RESTORE_TEMPLATE",
  },
  async (input, context) => {
    return hallTemplatesService.restoreTemplate(context.actor, input.templateId, input.theatreId);
  }
);

export const previewTemplateAction = createProtectedAction<
  z.input<typeof previewTemplateSchema>,
  TemplatePreviewResult
>(
  {
    actionName: "previewTemplateAction",
    schema: previewTemplateSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_TEMPLATES",
    auditAction: "PREVIEW_TEMPLATE",
  },
  async (input, context) => {
    return hallTemplatesService.previewTemplate(context.actor, input.templateId, input.theatreId);
  }
);

export const exportTemplateAction = createProtectedAction<
  z.input<typeof exportTemplateSchema>,
  TemplateExportEnvelope
>(
  {
    actionName: "exportTemplateAction",
    schema: exportTemplateSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_TEMPLATES",
    auditAction: "EXPORT_TEMPLATE",
  },
  async (input, context) => {
    return hallTemplatesService.exportTemplate(context.actor, input.templateId, input.theatreId);
  }
);

export const importTemplateAction = createProtectedAction<
  z.input<typeof importTemplateSchema>,
  HallTemplateDefinition
>(
  {
    actionName: "importTemplateAction",
    schema: importTemplateSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_TEMPLATES",
    auditAction: "IMPORT_TEMPLATE",
  },
  async (input, context) => {
    return hallTemplatesService.importTemplate(context.actor, input);
  }
);

export const syncInheritedTemplateAction = createProtectedAction<
  z.input<typeof syncInheritedTemplateSchema>,
  SyncInheritedTemplateResult
>(
  {
    actionName: "syncInheritedTemplateAction",
    schema: syncInheritedTemplateSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_TEMPLATES",
    auditAction: "SYNC_INHERITED_TEMPLATE",
  },
  async (input, context) => {
    return hallTemplatesService.syncInheritedTemplate(context.actor, input);
  }
);

export const loadTemplateRegistryAction = createProtectedAction<
  z.input<typeof loadTemplateRegistrySchema>,
  TemplateRegistryItem[]
>(
  {
    actionName: "loadTemplateRegistryAction",
    schema: loadTemplateRegistrySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_TEMPLATES",
    auditAction: "LOAD_TEMPLATE_REGISTRY",
  },
  async (input, context) => {
    return hallTemplatesService.getTemplateRegistry(
      context.actor,
      input.theatreId,
      input.includeArchived ?? false
    );
  }
);
