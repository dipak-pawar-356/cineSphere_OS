"use server";

import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { hallAnalyticsService } from "@/lib/services/hall-analytics.service";
import {
  generateHallAnalyticsSchema,
  refreshHallAnalyticsSchema,
  runHallSimulationsSchema,
  loadHallAnalyticsDashboardSchema,
  exportHallAnalyticsSchema,
  loadHallAnalyticsConfigSchema,
  saveHallAnalyticsConfigSchema,
} from "@/lib/validation/hall-analytics.validation";
import {
  HallAnalyticsReport,
  HallAnalyticsDashboardData,
  HallAnalyticsExportEnvelope,
  HallAnalyticsConfiguration,
  OccupancySimulationResult,
  RevenueSimulationResult,
} from "@/types/hall-analytics.types";

/**
 * ==============================================================================
 * CineSphere OS — Hall Analytics Server Actions (Phase 4 – Part 15)
 * ==============================================================================
 * Protected server actions for immutable Analytics Projections, Capacity/Health
 * metrics, Read-Only Occupancy & Revenue Simulations, Dashboard loading, and
 * Export placeholders.
 * ==============================================================================
 */

export const generateHallAnalyticsAction = createProtectedAction<
  z.input<typeof generateHallAnalyticsSchema>,
  HallAnalyticsReport
>(
  {
    actionName: "generateHallAnalyticsAction",
    schema: generateHallAnalyticsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_ANALYTICS",
    auditAction: "GENERATE_ANALYTICS",
  },
  async (input, context) => {
    return hallAnalyticsService.generateAnalytics(context.actor, input);
  }
);

export const refreshHallAnalyticsAction = createProtectedAction<
  z.input<typeof refreshHallAnalyticsSchema>,
  HallAnalyticsReport
>(
  {
    actionName: "refreshHallAnalyticsAction",
    schema: refreshHallAnalyticsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_ANALYTICS",
    auditAction: "REFRESH_ANALYTICS",
  },
  async (input, context) => {
    return hallAnalyticsService.refreshAnalytics(context.actor, input);
  }
);

export const runHallSimulationsAction = createProtectedAction<
  z.input<typeof runHallSimulationsSchema>,
  { occupancy: OccupancySimulationResult | null; revenue: RevenueSimulationResult | null }
>(
  {
    actionName: "runHallSimulationsAction",
    schema: runHallSimulationsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_ANALYTICS",
    auditAction: "RUN_SIMULATIONS",
  },
  async (input, context) => {
    return hallAnalyticsService.runSimulations(context.actor, input);
  }
);

export const loadHallAnalyticsDashboardAction = createProtectedAction<
  z.input<typeof loadHallAnalyticsDashboardSchema>,
  HallAnalyticsDashboardData
>(
  {
    actionName: "loadHallAnalyticsDashboardAction",
    schema: loadHallAnalyticsDashboardSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_ANALYTICS",
    auditAction: "LOAD_DASHBOARD",
  },
  async (input, context) => {
    return hallAnalyticsService.loadDashboard(context.actor, input.theatreId, input.hallId);
  }
);

export const exportHallAnalyticsAction = createProtectedAction<
  z.input<typeof exportHallAnalyticsSchema>,
  HallAnalyticsExportEnvelope
>(
  {
    actionName: "exportHallAnalyticsAction",
    schema: exportHallAnalyticsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_ANALYTICS",
    auditAction: "EXPORT_ANALYTICS",
  },
  async (input, context) => {
    return hallAnalyticsService.exportAnalyticsPlaceholder(
      context.actor,
      input.theatreId,
      input.format || "JSON",
      input.hallId
    );
  }
);

export const loadHallAnalyticsConfigAction = createProtectedAction<
  z.input<typeof loadHallAnalyticsConfigSchema>,
  HallAnalyticsConfiguration
>(
  {
    actionName: "loadHallAnalyticsConfigAction",
    schema: loadHallAnalyticsConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_ANALYTICS",
    auditAction: "LOAD_CONFIG",
  },
  async (input, context) => {
    return hallAnalyticsService.getConfiguration(context.actor, input.theatreId);
  }
);

export const saveHallAnalyticsConfigAction = createProtectedAction<
  z.input<typeof saveHallAnalyticsConfigSchema>,
  HallAnalyticsConfiguration
>(
  {
    actionName: "saveHallAnalyticsConfigAction",
    schema: saveHallAnalyticsConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_ANALYTICS",
    auditAction: "SAVE_CONFIG",
  },
  async (input, context) => {
    return hallAnalyticsService.updateConfiguration(context.actor, input.theatreId, input);
  }
);
