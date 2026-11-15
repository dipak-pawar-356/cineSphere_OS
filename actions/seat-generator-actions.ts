"use server";

import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { seatGeneratorService } from "@/lib/services/seat-generator.service";
import {
  GenerateSeatsSchema,
  RegenerateSeatsSchema,
  DeleteGeneratedSeatsSchema,
  LoadSeatsSchema,
  LoadSeatsByVersionSchema,
  UpdateSeatMetadataSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  ArchiveCategorySchema,
  RestoreCategorySchema,
  DuplicateCategorySchema,
  LoadCategoriesSchema,
  GetCategorySchema,
} from "@/lib/validation/seat-generator.validation";
import {
  SeatTemplate,
  SeatCategoryRegistryItem,
  BulkSeatGenerationResult,
} from "@/types/seat-generator.types";

/**
 * ==============================================================================
 * CineSphere OS — Seat Generator & Category Server Actions
 * Phase 4 – Part 5 (Seat Generator) & Part 6 (Seat Categories)
 * ==============================================================================
 * Protected server actions enforcing multi-tenant isolation, role-based access
 * control, rate limiting, and audit logging for:
 * 1. Part 5: Automatic and manual seat generation, coordinates, and metadata.
 * 2. Part 6: Dynamic seat category registry and custom category lifecycle.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Part 5: Automatic Seat Generator Actions
// ------------------------------------------------------------------------------

export const generateSeatsAction = createProtectedAction<
  z.input<typeof GenerateSeatsSchema>,
  BulkSeatGenerationResult
>(
  {
    actionName: "generateSeatsAction",
    schema: GenerateSeatsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_GENERATOR",
    auditAction: "GENERATE_SEATS",
  },
  async (input, context) => {
    return seatGeneratorService.generateSeats(
      context.actor,
      input as unknown as Parameters<typeof seatGeneratorService.generateSeats>[1],
      {
        rowName: input.rowName,
        sectionName: input.sectionName,
        categoryName: input.categoryName,
        categoryColor: input.categoryColor,
      }
    );
  }
);

export const regenerateSeatsAction = createProtectedAction<
  z.input<typeof RegenerateSeatsSchema>,
  BulkSeatGenerationResult
>(
  {
    actionName: "regenerateSeatsAction",
    schema: RegenerateSeatsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_GENERATOR",
    auditAction: "REGENERATE_SEATS",
  },
  async (input, context) => {
    return seatGeneratorService.regenerateSeats(
      context.actor,
      input.rowId,
      input.layoutVersionId,
      input as unknown as Parameters<typeof seatGeneratorService.regenerateSeats>[3],
      {
        rowName: input.rowName,
        sectionName: input.sectionName,
        categoryName: input.categoryName,
        categoryColor: input.categoryColor,
      },
      input.theatreId
    );
  }
);

export const deleteGeneratedSeatsAction = createProtectedAction<
  z.input<typeof DeleteGeneratedSeatsSchema>,
  { deletedCount: number }
>(
  {
    actionName: "deleteGeneratedSeatsAction",
    schema: DeleteGeneratedSeatsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_GENERATOR",
    auditAction: "DELETE_SEATS",
  },
  async (input, context) => {
    return seatGeneratorService.deleteGeneratedSeats(
      context.actor,
      input.rowId,
      input.layoutVersionId,
      input.theatreId
    );
  }
);

export const loadSeatsAction = createProtectedAction<
  z.input<typeof LoadSeatsSchema>,
  SeatTemplate[]
>(
  {
    actionName: "loadSeatsAction",
    schema: LoadSeatsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_GENERATOR",
    auditAction: "LOAD_SEATS",
  },
  async (input, context) => {
    return seatGeneratorService.loadSeats(
      context.actor,
      input.rowId,
      input.theatreId
    );
  }
);

export const loadSeatsByVersionAction = createProtectedAction<
  z.input<typeof LoadSeatsByVersionSchema>,
  SeatTemplate[]
>(
  {
    actionName: "loadSeatsByVersionAction",
    schema: LoadSeatsByVersionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_GENERATOR",
    auditAction: "LOAD_SEATS_BY_VERSION",
  },
  async (input, context) => {
    return seatGeneratorService.loadSeatsByVersion(
      context.actor,
      input.layoutVersionId,
      input.theatreId
    );
  }
);

export const updateSeatMetadataAction = createProtectedAction<
  z.input<typeof UpdateSeatMetadataSchema>,
  SeatTemplate
>(
  {
    actionName: "updateSeatMetadataAction",
    schema: UpdateSeatMetadataSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_GENERATOR",
    auditAction: "UPDATE_SEAT_METADATA",
  },
  async (input, context) => {
    return seatGeneratorService.updateSeatMetadata(
      context.actor,
      input.seatId,
      input.layoutVersionId,
      {
        metadata: input.metadata as unknown as Parameters<typeof seatGeneratorService.updateSeatMetadata>[3]["metadata"],
        accessibility: input.accessibility as unknown as Parameters<typeof seatGeneratorService.updateSeatMetadata>[3]["accessibility"],
        coordinates: input.coordinates,
        categoryCode: input.categoryCode,
        status: input.status,
      },
      input.theatreId
    );
  }
);

// ------------------------------------------------------------------------------
// 2. Part 6: Seat Category Registry Server Actions
// ------------------------------------------------------------------------------

export const createCategoryAction = createProtectedAction<
  z.input<typeof CreateCategorySchema>,
  SeatCategoryRegistryItem
>(
  {
    actionName: "createCategoryAction",
    schema: CreateCategorySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_CATEGORIES",
    auditAction: "CREATE_CATEGORY",
  },
  async (input, context) => {
    return seatGeneratorService.createCategory(
      context.actor,
      input as unknown as Omit<SeatCategoryRegistryItem, "id" | "createdAt" | "updatedAt">
    );
  }
);

export const updateCategoryAction = createProtectedAction<
  z.input<typeof UpdateCategorySchema>,
  SeatCategoryRegistryItem
>(
  {
    actionName: "updateCategoryAction",
    schema: UpdateCategorySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_CATEGORIES",
    auditAction: "UPDATE_CATEGORY",
  },
  async (input, context) => {
    return seatGeneratorService.updateCategory(
      context.actor,
      input.categoryId,
      input.updates as unknown as Partial<Omit<SeatCategoryRegistryItem, "id" | "theatreId" | "createdAt">>,
      input.theatreId
    );
  }
);

export const archiveCategoryAction = createProtectedAction<
  z.input<typeof ArchiveCategorySchema>,
  SeatCategoryRegistryItem
>(
  {
    actionName: "archiveCategoryAction",
    schema: ArchiveCategorySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_CATEGORIES",
    auditAction: "ARCHIVE_CATEGORY",
  },
  async (input, context) => {
    return seatGeneratorService.archiveCategory(
      context.actor,
      input.categoryId,
      input.theatreId
    );
  }
);

export const restoreCategoryAction = createProtectedAction<
  z.input<typeof RestoreCategorySchema>,
  SeatCategoryRegistryItem
>(
  {
    actionName: "restoreCategoryAction",
    schema: RestoreCategorySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_CATEGORIES",
    auditAction: "RESTORE_CATEGORY",
  },
  async (input, context) => {
    return seatGeneratorService.restoreCategory(
      context.actor,
      input.categoryId,
      input.theatreId
    );
  }
);

export const duplicateCategoryAction = createProtectedAction<
  z.input<typeof DuplicateCategorySchema>,
  SeatCategoryRegistryItem
>(
  {
    actionName: "duplicateCategoryAction",
    schema: DuplicateCategorySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_CATEGORIES",
    auditAction: "DUPLICATE_CATEGORY",
  },
  async (input, context) => {
    return seatGeneratorService.duplicateCategory(
      context.actor,
      input.categoryId,
      input.theatreId
    );
  }
);

export const loadCategoriesAction = createProtectedAction<
  z.input<typeof LoadCategoriesSchema>,
  SeatCategoryRegistryItem[]
>(
  {
    actionName: "loadCategoriesAction",
    schema: LoadCategoriesSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_CATEGORIES",
    auditAction: "LOAD_CATEGORIES",
  },
  async (input, context) => {
    return seatGeneratorService.loadCategories(
      context.actor,
      input.theatreId,
      input.includeArchived
    );
  }
);

export const getCategoryAction = createProtectedAction<
  z.input<typeof GetCategorySchema>,
  SeatCategoryRegistryItem
>(
  {
    actionName: "getCategoryAction",
    schema: GetCategorySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_CATEGORIES",
    auditAction: "GET_CATEGORY",
  },
  async (input, context) => {
    return seatGeneratorService.getCategory(
      context.actor,
      input.categoryId,
      input.theatreId
    );
  }
);
