"use server";

import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { hallPreviewService } from "@/lib/services/hall-preview.service";
import {
  LoadPreviewSchema,
  RefreshPreviewSchema,
  LoadPreviewConfigSchema,
  SavePreviewPreferencesSchema,
  RunBookingSimulationSchema,
} from "@/lib/validation/hall-preview.validation";
import {
  HallPreviewBundle,
  PreviewPreferences,
  BookingSimulationState,
} from "@/types/hall-preview.types";

/**
 * ==============================================================================
 * CineSphere OS — Hall Preview Server Actions (Phase 4 – Part 9)
 * ==============================================================================
 * Protected server actions for multi-mode preview loading, responsive viewports,
 * customer booking simulation, and theatre preview preferences.
 * ==============================================================================
 */

export const loadPreviewAction = createProtectedAction<
  z.input<typeof LoadPreviewSchema>,
  HallPreviewBundle
>(
  {
    actionName: "loadPreviewAction",
    schema: LoadPreviewSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_PREVIEW",
    auditAction: "LOAD_PREVIEW",
  },
  async (input, context) => {
    return hallPreviewService.loadPreview(
      context.actor,
      input.layoutVersionId,
      input.theatreId,
      input.mode,
      input.viewport
    );
  }
);

export const refreshPreviewAction = createProtectedAction<
  z.input<typeof RefreshPreviewSchema>,
  HallPreviewBundle
>(
  {
    actionName: "refreshPreviewAction",
    schema: RefreshPreviewSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_PREVIEW",
    auditAction: "REFRESH_PREVIEW",
  },
  async (input, context) => {
    return hallPreviewService.refreshPreview(
      context.actor,
      input.layoutVersionId,
      input.theatreId
    );
  }
);

export const loadPreviewConfigAction = createProtectedAction<
  z.input<typeof LoadPreviewConfigSchema>,
  PreviewPreferences
>(
  {
    actionName: "loadPreviewConfigAction",
    schema: LoadPreviewConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_PREVIEW",
    auditAction: "LOAD_CONFIG",
  },
  async (input, context) => {
    return hallPreviewService.loadPreviewConfiguration(
      context.actor,
      input.theatreId
    );
  }
);

export const savePreviewPreferencesAction = createProtectedAction<
  z.input<typeof SavePreviewPreferencesSchema>,
  PreviewPreferences
>(
  {
    actionName: "savePreviewPreferencesAction",
    schema: SavePreviewPreferencesSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_PREVIEW",
    auditAction: "SAVE_PREFERENCES",
  },
  async (input, context) => {
    const { theatreId, ...preferences } = input;
    return hallPreviewService.savePreviewPreferences(
      context.actor,
      preferences,
      theatreId
    );
  }
);

export const runBookingSimulationAction = createProtectedAction<
  z.input<typeof RunBookingSimulationSchema>,
  BookingSimulationState
>(
  {
    actionName: "runBookingSimulationAction",
    schema: RunBookingSimulationSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "HALL_PREVIEW",
    auditAction: "RUN_SIMULATION",
  },
  async (input, context) => {
    return hallPreviewService.runBookingSimulation(
      context.actor,
      input.layoutVersionId,
      input.seatIdsToToggle || [],
      input.theatreId
    );
  }
);
