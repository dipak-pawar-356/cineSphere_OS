"use server";

import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { enterpriseHallDesignerService } from "@/lib/services/enterprise-hall-designer.service";
import {
  registerHallExtensionSchema,
  loadExtensionConfigSchema,
  toggleEnterpriseFeatureSchema,
  loadEnterpriseSettingsSchema,
  compileLayoutSceneGraphSchema,
  saveThreeDConfigSchema,
  saveCollaborationConfigSchema,
  planCadImportSchema,
  getAiSuggestionsSchema,
  loadDomainEventsLogSchema,
} from "@/lib/validation/enterprise-hall-designer.validation";
import {
  ExtensionManifest,
  EnterpriseFeatureDefinition,
  EnterpriseHallConfiguration,
  ThreeDConfigurationRecord,
  CollaborationConfigurationRecord,
  LayoutSceneGraph,
  CadImportPlanPlaceholder,
  AiLayoutSuggestion,
  HallDesignerDomainEvent,
  IoTDeviceDescriptor,
} from "@/types/enterprise-hall-designer.types";

/**
 * ==============================================================================
 * CineSphere OS — Enterprise Hall Designer Server Actions (Phase 4 – Part 16)
 * ==============================================================================
 * Protected server actions for the Plugin Extension Registry, Per-Theatre
 * Enterprise Feature Toggles, Platform-Agnostic Scene Graph compilation,
 * 3D / Collaboration configuration, CAD/BIM & AI placeholders, and Event Logs.
 * ==============================================================================
 */

export const registerHallExtensionAction = createProtectedAction<
  z.input<typeof registerHallExtensionSchema>,
  ExtensionManifest
>(
  {
    actionName: "registerHallExtensionAction",
    schema: registerHallExtensionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    enforceTenantIsolation: false,
    auditModule: "ENTERPRISE_HALL_DESIGNER",
    auditAction: "REGISTER_EXTENSION",
  },
  async (input, context) => {
    return enterpriseHallDesignerService.registerExtension(context.actor, {
      ...input,
      requiredFeatureKeys: input.requiredFeatureKeys || [],
      supportedCapabilities: input.supportedCapabilities || [],
    });
  }
);

export const loadExtensionConfigurationAction = createProtectedAction<
  z.input<typeof loadExtensionConfigSchema>,
  {
    theatreId: string;
    extensions: Array<ExtensionManifest & { isEnabledForTheatre: boolean }>;
    featuresCatalog: EnterpriseFeatureDefinition[];
    iotDevices: IoTDeviceDescriptor[];
  }
>(
  {
    actionName: "loadExtensionConfigurationAction",
    schema: loadExtensionConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ENTERPRISE_HALL_DESIGNER",
    auditAction: "LOAD_EXTENSION_CONFIG",
  },
  async (input, context) => {
    return enterpriseHallDesignerService.loadExtensionConfiguration(
      context.actor,
      input.theatreId,
      input.category
    );
  }
);

export const enableEnterpriseFeatureAction = createProtectedAction<
  z.input<typeof toggleEnterpriseFeatureSchema>,
  EnterpriseHallConfiguration
>(
  {
    actionName: "enableEnterpriseFeatureAction",
    schema: toggleEnterpriseFeatureSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ENTERPRISE_HALL_DESIGNER",
    auditAction: "ENABLE_FEATURE",
  },
  async (input, context) => {
    return enterpriseHallDesignerService.enableFeature(
      context.actor,
      input.theatreId,
      input.featureKey
    );
  }
);

export const disableEnterpriseFeatureAction = createProtectedAction<
  z.input<typeof toggleEnterpriseFeatureSchema>,
  EnterpriseHallConfiguration
>(
  {
    actionName: "disableEnterpriseFeatureAction",
    schema: toggleEnterpriseFeatureSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ENTERPRISE_HALL_DESIGNER",
    auditAction: "DISABLE_FEATURE",
  },
  async (input, context) => {
    return enterpriseHallDesignerService.disableFeature(
      context.actor,
      input.theatreId,
      input.featureKey
    );
  }
);

export const loadEnterpriseSettingsAction = createProtectedAction<
  z.input<typeof loadEnterpriseSettingsSchema>,
  EnterpriseHallConfiguration
>(
  {
    actionName: "loadEnterpriseSettingsAction",
    schema: loadEnterpriseSettingsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ENTERPRISE_HALL_DESIGNER",
    auditAction: "LOAD_ENTERPRISE_SETTINGS",
  },
  async (input, context) => {
    return enterpriseHallDesignerService.loadEnterpriseSettings(context.actor, input.theatreId);
  }
);

export const compileLayoutSceneGraphAction = createProtectedAction<
  z.input<typeof compileLayoutSceneGraphSchema>,
  LayoutSceneGraph
>(
  {
    actionName: "compileLayoutSceneGraphAction",
    schema: compileLayoutSceneGraphSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ENTERPRISE_HALL_DESIGNER",
    auditAction: "COMPILE_SCENE_GRAPH",
  },
  async (input, context) => {
    return enterpriseHallDesignerService.compileSceneGraph(context.actor, input);
  }
);

export const saveThreeDConfigAction = createProtectedAction<
  z.input<typeof saveThreeDConfigSchema>,
  ThreeDConfigurationRecord
>(
  {
    actionName: "saveThreeDConfigAction",
    schema: saveThreeDConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ENTERPRISE_HALL_DESIGNER",
    auditAction: "SAVE_3D_CONFIG",
  },
  async (input, context) => {
    return enterpriseHallDesignerService.saveThreeDConfig(context.actor, input.theatreId, input);
  }
);

export const saveCollaborationConfigAction = createProtectedAction<
  z.input<typeof saveCollaborationConfigSchema>,
  CollaborationConfigurationRecord
>(
  {
    actionName: "saveCollaborationConfigAction",
    schema: saveCollaborationConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ENTERPRISE_HALL_DESIGNER",
    auditAction: "SAVE_COLLAB_CONFIG",
  },
  async (input, context) => {
    return enterpriseHallDesignerService.saveCollaborationConfig(
      context.actor,
      input.theatreId,
      input
    );
  }
);

export const planCadImportAction = createProtectedAction<
  z.input<typeof planCadImportSchema>,
  CadImportPlanPlaceholder
>(
  {
    actionName: "planCadImportAction",
    schema: planCadImportSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ENTERPRISE_HALL_DESIGNER",
    auditAction: "PLAN_CAD_IMPORT",
  },
  async (input, context) => {
    return enterpriseHallDesignerService.createCadImportPlan(context.actor, input);
  }
);

export const getAiLayoutSuggestionsAction = createProtectedAction<
  z.input<typeof getAiSuggestionsSchema>,
  AiLayoutSuggestion[]
>(
  {
    actionName: "getAiLayoutSuggestionsAction",
    schema: getAiSuggestionsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ENTERPRISE_HALL_DESIGNER",
    auditAction: "GET_AI_SUGGESTIONS",
  },
  async (input, context) => {
    return enterpriseHallDesignerService.getAiSuggestionsPlaceholder(context.actor, input);
  }
);

export const loadHallDomainEventsAction = createProtectedAction<
  z.input<typeof loadDomainEventsLogSchema>,
  HallDesignerDomainEvent[]
>(
  {
    actionName: "loadHallDomainEventsAction",
    schema: loadDomainEventsLogSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ENTERPRISE_HALL_DESIGNER",
    auditAction: "LOAD_DOMAIN_EVENTS",
  },
  async (input, context) => {
    return enterpriseHallDesignerService.getDomainEventLog(
      context.actor,
      input.theatreId,
      input.eventType,
      input.limit
    );
  }
);
