"use server";

import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { geometryLayoutService } from "@/lib/services/geometry-layout.service";
import {
  ApplyTransformSchema,
  MirrorLayoutSchema,
  DuplicateSelectionSchema,
  SaveGeometrySettingsSchema,
  LoadGeometrySettingsSchema,
  ValidateLayoutBeforePublishSchema,
} from "@/lib/validation/geometry-layout.validation";
import {
  GeometrySettings,
  GeometryTransformCommand,
  LayoutPublishPreflightResult,
  BaseLayoutObject,
} from "@/types/geometry-layout.types";

/**
 * ==============================================================================
 * CineSphere OS — Geometry & Advanced Layout Server Actions (Phase 4 – Part 8)
 * ==============================================================================
 * Protected actions for layout transformation pipeline, symmetry mirroring,
 * theatre geometry preferences, and publication pre-flight validation.
 * ==============================================================================
 */

export const applyTransformAction = createProtectedAction<
  z.input<typeof ApplyTransformSchema>,
  GeometryTransformCommand
>(
  {
    actionName: "applyTransformAction",
    schema: ApplyTransformSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "GEOMETRY_LAYOUT",
    auditAction: "APPLY_TRANSFORM",
  },
  async (input, context) => {
    return geometryLayoutService.applyTransform(
      context.actor,
      input as unknown as Parameters<typeof geometryLayoutService.applyTransform>[1]
    );
  }
);

export const mirrorLayoutAction = createProtectedAction<
  z.input<typeof MirrorLayoutSchema>,
  { mirroredObjectsCount: number }
>(
  {
    actionName: "mirrorLayoutAction",
    schema: MirrorLayoutSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "GEOMETRY_LAYOUT",
    auditAction: "MIRROR_LAYOUT",
  },
  async (input, context) => {
    return geometryLayoutService.mirrorLayout(context.actor, {
      ...input,
      axis: input.axis || "HORIZONTAL",
    });
  }
);

export const duplicateSelectionAction = createProtectedAction<
  z.input<typeof DuplicateSelectionSchema>,
  BaseLayoutObject[]
>(
  {
    actionName: "duplicateSelectionAction",
    schema: DuplicateSelectionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "GEOMETRY_LAYOUT",
    auditAction: "DUPLICATE_SELECTION",
  },
  async (input, context) => {
    return geometryLayoutService.duplicateSelection(context.actor, input);
  }
);

export const saveGeometrySettingsAction = createProtectedAction<
  z.input<typeof SaveGeometrySettingsSchema>,
  GeometrySettings
>(
  {
    actionName: "saveGeometrySettingsAction",
    schema: SaveGeometrySettingsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "GEOMETRY_LAYOUT",
    auditAction: "SAVE_SETTINGS",
  },
  async (input, context) => {
    const { theatreId, ...settings } = input;
    return geometryLayoutService.saveGeometrySettings(context.actor, settings, theatreId);
  }
);

export const loadGeometrySettingsAction = createProtectedAction<
  z.input<typeof LoadGeometrySettingsSchema>,
  GeometrySettings
>(
  {
    actionName: "loadGeometrySettingsAction",
    schema: LoadGeometrySettingsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "GEOMETRY_LAYOUT",
    auditAction: "LOAD_SETTINGS",
  },
  async (input, context) => {
    return geometryLayoutService.getGeometrySettings(context.actor, input.theatreId);
  }
);

export const validateLayoutBeforePublishAction = createProtectedAction<
  z.input<typeof ValidateLayoutBeforePublishSchema>,
  LayoutPublishPreflightResult
>(
  {
    actionName: "validateLayoutBeforePublishAction",
    schema: ValidateLayoutBeforePublishSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "GEOMETRY_LAYOUT",
    auditAction: "VALIDATE_BEFORE_PUBLISH",
  },
  async (input, context) => {
    return geometryLayoutService.validateLayoutBeforePublish(
      context.actor,
      input.layoutVersionId,
      input.theatreId
    );
  }
);
