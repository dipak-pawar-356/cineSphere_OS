"use server";

import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { structuralObjectService } from "@/lib/services/structural-object.service";
import {
  CreateStructuralObjectSchema,
  UpdateStructuralObjectSchema,
  DuplicateStructuralObjectSchema,
  DeleteStructuralObjectSchema,
  ReorderStructuralObjectsSchema,
  LoadStructuralObjectsSchema,
  ToggleLockStructuralObjectSchema,
  ToggleVisibilityStructuralObjectSchema,
  ValidateStructuralObjectsSchema,
} from "@/lib/validation/structural-object.validation";
import {
  StructuralObject,
  StructuralObjectValidationResult,
} from "@/types/structural-objects.types";

/**
 * ==============================================================================
 * CineSphere OS — Structural Object Server Actions (Phase 4 – Part 7)
 * ==============================================================================
 * Protected actions enforcing multi-tenant isolation, RBAC, and audit logging
 * for cinema hall physical infrastructure.
 * ==============================================================================
 */

export const createStructuralObjectAction = createProtectedAction<
  z.input<typeof CreateStructuralObjectSchema>,
  StructuralObject
>(
  {
    actionName: "createStructuralObjectAction",
    schema: CreateStructuralObjectSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "STRUCTURAL_OBJECTS",
    auditAction: "CREATE_OBJECT",
  },
  async (input, context) => {
    return structuralObjectService.createObject(
      context.actor,
      input as unknown as Parameters<typeof structuralObjectService.createObject>[1]
    );
  }
);

export const updateStructuralObjectAction = createProtectedAction<
  z.input<typeof UpdateStructuralObjectSchema>,
  StructuralObject
>(
  {
    actionName: "updateStructuralObjectAction",
    schema: UpdateStructuralObjectSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "STRUCTURAL_OBJECTS",
    auditAction: "UPDATE_OBJECT",
  },
  async (input, context) => {
    const { id, ...data } = input;
    return structuralObjectService.updateObject(
      context.actor,
      id,
      data as unknown as Parameters<typeof structuralObjectService.updateObject>[2]
    );
  }
);

export const duplicateStructuralObjectAction = createProtectedAction<
  z.input<typeof DuplicateStructuralObjectSchema>,
  StructuralObject
>(
  {
    actionName: "duplicateStructuralObjectAction",
    schema: DuplicateStructuralObjectSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "STRUCTURAL_OBJECTS",
    auditAction: "DUPLICATE_OBJECT",
  },
  async (input, context) => {
    return structuralObjectService.duplicateObject(context.actor, input.id, input.theatreId);
  }
);

export const deleteStructuralObjectAction = createProtectedAction<
  z.input<typeof DeleteStructuralObjectSchema>,
  { success: boolean }
>(
  {
    actionName: "deleteStructuralObjectAction",
    schema: DeleteStructuralObjectSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "STRUCTURAL_OBJECTS",
    auditAction: "DELETE_OBJECT",
  },
  async (input, context) => {
    const success = await structuralObjectService.deleteObject(context.actor, input.id, input.theatreId);
    return { success };
  }
);

export const reorderStructuralObjectsAction = createProtectedAction<
  z.input<typeof ReorderStructuralObjectsSchema>,
  StructuralObject[]
>(
  {
    actionName: "reorderStructuralObjectsAction",
    schema: ReorderStructuralObjectsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "STRUCTURAL_OBJECTS",
    auditAction: "REORDER_OBJECTS",
  },
  async (input, context) => {
    return structuralObjectService.reorderObjects(
      context.actor,
      input.layoutVersionId,
      input.orderedIds,
      input.theatreId
    );
  }
);

export const loadStructuralObjectsAction = createProtectedAction<
  z.input<typeof LoadStructuralObjectsSchema>,
  StructuralObject[]
>(
  {
    actionName: "loadStructuralObjectsAction",
    schema: LoadStructuralObjectsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "STRUCTURAL_OBJECTS",
    auditAction: "LOAD_OBJECTS",
  },
  async (input, context) => {
    return structuralObjectService.listObjects(context.actor, input.layoutVersionId, input.theatreId);
  }
);

export const toggleLockStructuralObjectAction = createProtectedAction<
  z.input<typeof ToggleLockStructuralObjectSchema>,
  StructuralObject
>(
  {
    actionName: "toggleLockStructuralObjectAction",
    schema: ToggleLockStructuralObjectSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "STRUCTURAL_OBJECTS",
    auditAction: "TOGGLE_LOCK",
  },
  async (input, context) => {
    return structuralObjectService.toggleLock(context.actor, input.id, input.theatreId);
  }
);

export const toggleVisibilityStructuralObjectAction = createProtectedAction<
  z.input<typeof ToggleVisibilityStructuralObjectSchema>,
  StructuralObject
>(
  {
    actionName: "toggleVisibilityStructuralObjectAction",
    schema: ToggleVisibilityStructuralObjectSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "STRUCTURAL_OBJECTS",
    auditAction: "TOGGLE_VISIBILITY",
  },
  async (input, context) => {
    return structuralObjectService.toggleVisibility(context.actor, input.id, input.theatreId);
  }
);

export const validateStructuralObjectsAction = createProtectedAction<
  z.input<typeof ValidateStructuralObjectsSchema>,
  StructuralObjectValidationResult
>(
  {
    actionName: "validateStructuralObjectsAction",
    schema: ValidateStructuralObjectsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "STRUCTURAL_OBJECTS",
    auditAction: "VALIDATE_OBJECTS",
  },
  async (input, context) => {
    return structuralObjectService.validateObjects(context.actor, input.layoutVersionId, input.theatreId);
  }
);
