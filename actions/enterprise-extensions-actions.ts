"use server";

import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { enterpriseExtensionsService } from "@/lib/services/enterprise-extensions.service";
import {
  ResolveFeatureFlagInputSchema,
  SetFeatureFlagOverrideInputSchema,
  ToggleExtensionModuleInputSchema,
  EvaluateDynamicPricingInputSchema,
  DispatchDomainEventInputSchema,
  RegisterDeviceInputSchema,
} from "@/lib/validation/enterprise-extensions.validation";
import {
  EnterpriseOverviewSummary,
} from "@/lib/services/enterprise-extensions.service";
import {
  EnterpriseFeatureFlag,
  ResolvedFeatureFlag,
  DeviceRegistry,
  DomainEventPayload,
} from "@/types/enterprise-extension-framework.types";

/**
 * ==============================================================================
 * CineSphere OS — Enterprise Extensions Server Actions (Phase 3 – Part 16)
 * ==============================================================================
 * Protected server actions for administering the Enterprise Extension Framework,
 * 4-tier feature flag resolution, extension module lifecycle toggling, dynamic
 * pricing simulation, device registry inspection, and domain event telemetry.
 * ==============================================================================
 */

// 1. Get Enterprise Framework Overview
export const getEnterpriseOverviewAction = createProtectedAction<
  void,
  EnterpriseOverviewSummary
>(
  {
    actionName: "getEnterpriseOverviewAction",
    schema: z.void(),
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: false,
    auditModule: "ENTERPRISE_FRAMEWORK",
    auditAction: "VIEW_OVERVIEW",
  },
  async (_, context) => {
    return enterpriseExtensionsService.getEnterpriseOverview(context.actor);
  }
);

// 2. Get Organization & Branch Hierarchy
export const getOrganizationHierarchyAction = createProtectedAction<
  { organizationId?: string },
  unknown
>(
  {
    actionName: "getOrganizationHierarchyAction",
    schema: z.object({ organizationId: z.string().optional() }),
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: false,
    auditModule: "ORGANIZATION_PLATFORM",
    auditAction: "VIEW_HIERARCHY",
  },
  async (input, context) => {
    return enterpriseExtensionsService.getOrganizationHierarchy(context.actor, input.organizationId);
  }
);

// 3. List Registered Extension Modules
export const listEnterpriseModulesAction = createProtectedAction<
  { platformKey?: string },
  unknown
>(
  {
    actionName: "listEnterpriseModulesAction",
    schema: z.object({ platformKey: z.string().optional() }),
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: false,
    auditModule: "EXTENSION_SDK",
    auditAction: "LIST_MODULES",
  },
  async (input, context) => {
    return enterpriseExtensionsService.listExtensions(
      context.actor,
      input.platformKey as any
    );
  }
);

// 4. Toggle Extension Module State (Enable / Disable)
export const toggleExtensionModuleAction = createProtectedAction<
  z.input<typeof ToggleExtensionModuleInputSchema>,
  { success: boolean; state: string; error?: string }
>(
  {
    actionName: "toggleExtensionModuleAction",
    schema: ToggleExtensionModuleInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    enforceTenantIsolation: false,
    auditModule: "EXTENSION_SDK",
    auditAction: "TOGGLE_MODULE",
  },
  async (input, context) => {
    return enterpriseExtensionsService.toggleExtensionModule(
      context.actor,
      input.moduleId,
      input.enable
    );
  }
);

// 5. List Feature Flags
export const listEnterpriseFeatureFlagsAction = createProtectedAction<
  void,
  EnterpriseFeatureFlag[]
>(
  {
    actionName: "listEnterpriseFeatureFlagsAction",
    schema: z.void(),
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: false,
    auditModule: "FEATURE_FLAGS",
    auditAction: "LIST_FLAGS",
  },
  async (_, context) => {
    return enterpriseExtensionsService.listFeatureFlags(context.actor);
  }
);

// 6. Resolve 4-Tier Feature Flag
export const resolveFeatureFlagAction = createProtectedAction<
  z.input<typeof ResolveFeatureFlagInputSchema>,
  ResolvedFeatureFlag
>(
  {
    actionName: "resolveFeatureFlagAction",
    schema: ResolveFeatureFlagInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "STAFF", "HALL_MANAGER", "CUSTOMER"],
    enforceTenantIsolation: false,
    auditModule: "FEATURE_FLAGS",
    auditAction: "RESOLVE_FLAG",
  },
  async (input, context) => {
    return enterpriseExtensionsService.resolveFeatureFlag(
      context.actor,
      input.flagKey,
      input.scope
    );
  }
);

// 7. Set Feature Flag Override
export const setFeatureFlagOverrideAction = createProtectedAction<
  z.input<typeof SetFeatureFlagOverrideInputSchema>,
  boolean
>(
  {
    actionName: "setFeatureFlagOverrideAction",
    schema: SetFeatureFlagOverrideInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: false,
    auditModule: "FEATURE_FLAGS",
    auditAction: "SET_OVERRIDE",
  },
  async (input, context) => {
    return enterpriseExtensionsService.setFeatureFlagOverride(
      context.actor,
      input.flagKey,
      input.level,
      input.targetId,
      input.value
    );
  }
);

// 8. Evaluate Dynamic Pricing
export const evaluateDynamicPricingAction = createProtectedAction<
  z.input<typeof EvaluateDynamicPricingInputSchema>,
  unknown
>(
  {
    actionName: "evaluateDynamicPricingAction",
    schema: EvaluateDynamicPricingInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "STAFF"],
    enforceTenantIsolation: false,
    auditModule: "PRICING_PLATFORM",
    auditAction: "EVALUATE_PRICING",
  },
  async (input, context) => {
    return enterpriseExtensionsService.evaluateDynamicPricing(context.actor, {
      ...input,
      format: input.format || "2D",
    });
  }
);

// 9. List Connected IoT Devices
export const listEnterpriseDevicesAction = createProtectedAction<
  { theatreId?: string },
  DeviceRegistry[]
>(
  {
    actionName: "listEnterpriseDevicesAction",
    schema: z.object({ theatreId: z.string().optional() }),
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: false,
    auditModule: "DEVICE_PLATFORM",
    auditAction: "LIST_DEVICES",
  },
  async (input, context) => {
    return enterpriseExtensionsService.listDevices(context.actor, input.theatreId);
  }
);

// 10. Register Device
export const registerEnterpriseDeviceAction = createProtectedAction<
  z.input<typeof RegisterDeviceInputSchema>,
  DeviceRegistry
>(
  {
    actionName: "registerEnterpriseDeviceAction",
    schema: RegisterDeviceInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: false,
    auditModule: "DEVICE_PLATFORM",
    auditAction: "REGISTER_DEVICE",
  },
  async (input, context) => {
    return enterpriseExtensionsService.registerDevice(context.actor, input as DeviceRegistry);
  }
);

// 11. Dispatch Domain Event
export const dispatchDomainEventAction = createProtectedAction<
  z.input<typeof DispatchDomainEventInputSchema>,
  unknown
>(
  {
    actionName: "dispatchDomainEventAction",
    schema: DispatchDomainEventInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: false,
    auditModule: "EVENT_BUS",
    auditAction: "DISPATCH_EVENT",
  },
  async (input, context) => {
    return enterpriseExtensionsService.dispatchDomainEvent(context.actor, {
      ...input,
      data: input.data || {},
    });
  }
);

// 12. Get Event Bus History
export const getEventBusHistoryAction = createProtectedAction<
  { limit?: number; eventType?: string },
  DomainEventPayload[]
>(
  {
    actionName: "getEventBusHistoryAction",
    schema: z.object({ limit: z.number().optional(), eventType: z.string().optional() }),
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: false,
    auditModule: "EVENT_BUS",
    auditAction: "VIEW_HISTORY",
  },
  async (input, context) => {
    return enterpriseExtensionsService.getEventBusHistory(context.actor, {
      limit: input.limit,
      eventType: input.eventType as any,
    });
  }
);
