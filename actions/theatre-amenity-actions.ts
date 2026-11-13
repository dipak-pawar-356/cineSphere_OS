"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { theatreAmenityService } from "@/lib/services/theatre-amenity.service";
import {
  CreateAmenityCatalogSchema,
  UpdateAmenityCatalogSchema,
  CreateAmenityCategorySchema,
  AssignAmenityToTheatreSchema,
  UpdateTheatreAmenitySchema,
  ReorderTheatreAmenitiesSchema,
} from "@/lib/validation/theatre-amenity.validation";
import type {
  AmenityCategoryRecord,
  AmenityCatalogRecord,
  TheatreAmenityRecord,
  TheatreAmenityWithCatalog,
  PublicTheatreAmenityDTO,
  TheatreAmenityBundle,
} from "@/types/theatre-amenity.types";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Amenities Server Actions (Phase 3 – Part 5)
 * ==============================================================================
 * Protected Server Actions:
 * Auth -> RBAC -> Tenant Isolation -> Input Sanitization -> Zod Validation
 *      -> Rate Limiting -> Audit Logging -> Cache Revalidation
 * ==============================================================================
 */

const ArchiveCatalogInputSchema = z.object({
  id: z.string().trim().min(1, "Catalog item ID is required"),
});

const RemoveAssignmentInputSchema = z.object({
  assignmentId: z.string().trim().min(1, "Assignment ID is required"),
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
});

const GetTheatreAmenitiesInputSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
  categoryCode: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT", "ARCHIVED"]).optional(),
  availability: z.enum(["AVAILABLE", "TEMPORARILY_UNAVAILABLE", "SEASONAL", "UNDER_MAINTENANCE"]).optional(),
  query: z.string().trim().optional(),
});

const GetTheatreBundleInputSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
});

const GetPublicAmenitiesInputSchema = z.object({
  theatreIdOrSlug: z.string().trim().min(1, "Theatre ID or slug is required"),
});

function revalidateAmenityPaths(theatreId: string, slug?: string) {
  revalidatePath("/theatre/amenities");
  revalidatePath("/theatre/profile");
  revalidatePath("/dashboard/amenities");
  revalidatePath("/dashboard/theatres");
  revalidatePath(`/dashboard/theatres/${theatreId}`);
  revalidatePath("/theatres");
  if (slug) {
    revalidatePath(`/theatre/${slug}`);
  }
}

// ------------------------------------------------------------------------------
// 1. CREATE AMENITY CATEGORY (Super Admin Only)
// ------------------------------------------------------------------------------
export const createAmenityCategoryAction = createProtectedAction<
  z.input<typeof CreateAmenityCategorySchema>,
  AmenityCategoryRecord
>(
  {
    actionName: "createAmenityCategoryAction",
    schema: CreateAmenityCategorySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    auditModule: "THEATRE_AMENITY",
    auditAction: "CREATE_CATEGORY",
  },
  async (data, context) => {
    const category = await theatreAmenityService.createCategory(data, context.actor);
    revalidatePath("/dashboard/amenities");
    return category;
  }
);

// ------------------------------------------------------------------------------
// 2. CREATE CATALOG AMENITY (Super Admin Only)
// ------------------------------------------------------------------------------
export const createAmenityCatalogAction = createProtectedAction<
  z.input<typeof CreateAmenityCatalogSchema>,
  AmenityCatalogRecord
>(
  {
    actionName: "createAmenityCatalogAction",
    schema: CreateAmenityCatalogSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    auditModule: "THEATRE_AMENITY",
    auditAction: "CREATE_CATALOG_ITEM",
  },
  async (data, context) => {
    const item = await theatreAmenityService.createCatalogItem(data, context.actor);
    revalidatePath("/dashboard/amenities");
    return item;
  }
);

// ------------------------------------------------------------------------------
// 3. UPDATE CATALOG AMENITY (Super Admin Only)
// ------------------------------------------------------------------------------
export const updateAmenityCatalogAction = createProtectedAction<
  z.input<typeof UpdateAmenityCatalogSchema>,
  AmenityCatalogRecord
>(
  {
    actionName: "updateAmenityCatalogAction",
    schema: UpdateAmenityCatalogSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    auditModule: "THEATRE_AMENITY",
    auditAction: "UPDATE_CATALOG_ITEM",
  },
  async (data, context) => {
    const item = await theatreAmenityService.updateCatalogItem(data, context.actor);
    revalidatePath("/dashboard/amenities");
    return item;
  }
);

// ------------------------------------------------------------------------------
// 4. ARCHIVE CATALOG AMENITY (Super Admin Only)
// ------------------------------------------------------------------------------
export const archiveAmenityCatalogAction = createProtectedAction<
  z.input<typeof ArchiveCatalogInputSchema>,
  AmenityCatalogRecord
>(
  {
    actionName: "archiveAmenityCatalogAction",
    schema: ArchiveCatalogInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    auditModule: "THEATRE_AMENITY",
    auditAction: "ARCHIVE_CATALOG_ITEM",
  },
  async (data, context) => {
    const item = await theatreAmenityService.archiveCatalogItem(data.id, context.actor);
    revalidatePath("/dashboard/amenities");
    return item;
  }
);

// ------------------------------------------------------------------------------
// 5. ASSIGN AMENITY TO THEATRE (Super Admin & Theatre Admin)
// ------------------------------------------------------------------------------
export const assignAmenityToTheatreAction = createProtectedAction<
  z.input<typeof AssignAmenityToTheatreSchema>,
  TheatreAmenityWithCatalog
>(
  {
    actionName: "assignAmenityToTheatreAction",
    schema: AssignAmenityToTheatreSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_AMENITY",
    auditAction: "ASSIGN_AMENITY",
  },
  async (data, context) => {
    const assignment = await theatreAmenityService.assignAmenityToTheatre(data, context.actor);
    revalidateAmenityPaths(data.theatreId);
    return assignment;
  }
);

// ------------------------------------------------------------------------------
// 6. UPDATE THEATRE AMENITY (Super Admin & Theatre Admin)
// ------------------------------------------------------------------------------
export const updateTheatreAmenityAction = createProtectedAction<
  z.input<typeof UpdateTheatreAmenitySchema>,
  TheatreAmenityWithCatalog
>(
  {
    actionName: "updateTheatreAmenityAction",
    schema: UpdateTheatreAmenitySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_AMENITY",
    auditAction: "UPDATE_THEATRE_AMENITY",
  },
  async (data, context) => {
    const updated = await theatreAmenityService.updateTheatreAmenity(data, context.actor);
    revalidateAmenityPaths(data.theatreId);
    return updated;
  }
);

// ------------------------------------------------------------------------------
// 7. REMOVE THEATRE AMENITY (Super Admin & Theatre Admin)
// ------------------------------------------------------------------------------
export const removeTheatreAmenityAction = createProtectedAction<
  z.input<typeof RemoveAssignmentInputSchema>,
  { success: boolean; assignmentId: string }
>(
  {
    actionName: "removeTheatreAmenityAction",
    schema: RemoveAssignmentInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_AMENITY",
    auditAction: "REMOVE_THEATRE_AMENITY",
  },
  async (data, context) => {
    await theatreAmenityService.removeTheatreAmenity(data.assignmentId, data.theatreId, context.actor);
    revalidateAmenityPaths(data.theatreId);
    return { success: true, assignmentId: data.assignmentId };
  }
);

// ------------------------------------------------------------------------------
// 8. REORDER THEATRE AMENITIES (Super Admin & Theatre Admin)
// ------------------------------------------------------------------------------
export const reorderTheatreAmenitiesAction = createProtectedAction<
  z.input<typeof ReorderTheatreAmenitiesSchema>,
  TheatreAmenityRecord[]
>(
  {
    actionName: "reorderTheatreAmenitiesAction",
    schema: ReorderTheatreAmenitiesSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_AMENITY",
    auditAction: "REORDER_THEATRE_AMENITIES",
  },
  async (data, context) => {
    const reordered = await theatreAmenityService.reorderTheatreAmenities(data, context.actor);
    revalidateAmenityPaths(data.theatreId);
    return reordered;
  }
);

// ------------------------------------------------------------------------------
// 9. GET THEATRE AMENITIES (Scoped Query)
// ------------------------------------------------------------------------------
export const getTheatreAmenitiesAction = createProtectedAction<
  z.input<typeof GetTheatreAmenitiesInputSchema>,
  TheatreAmenityWithCatalog[]
>(
  {
    actionName: "getTheatreAmenitiesAction",
    schema: GetTheatreAmenitiesInputSchema,
    rateLimitCategory: "SEARCH",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_AMENITY",
    auditAction: "GET_THEATRE_AMENITIES",
  },
  async (data, context) => {
    return theatreAmenityService.getTheatreAmenities(data.theatreId, data, context.actor);
  }
);

// ------------------------------------------------------------------------------
// 10. GET THEATRE AMENITY BUNDLE
// ------------------------------------------------------------------------------
export const getTheatreAmenityBundleAction = createProtectedAction<
  z.input<typeof GetTheatreBundleInputSchema>,
  TheatreAmenityBundle
>(
  {
    actionName: "getTheatreAmenityBundleAction",
    schema: GetTheatreBundleInputSchema,
    rateLimitCategory: "SEARCH",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_AMENITY",
    auditAction: "GET_THEATRE_AMENITY_BUNDLE",
  },
  async (data, context) => {
    return theatreAmenityService.getTheatreAmenityBundle(data.theatreId, context.actor);
  }
);

// ------------------------------------------------------------------------------
// 11. GET PUBLIC THEATRE AMENITIES (Patron Access)
// ------------------------------------------------------------------------------
export const getPublicTheatreAmenitiesAction = createProtectedAction<
  z.input<typeof GetPublicAmenitiesInputSchema>,
  PublicTheatreAmenityDTO[]
>(
  {
    actionName: "getPublicTheatreAmenitiesAction",
    schema: GetPublicAmenitiesInputSchema,
    rateLimitCategory: "PUBLIC_DEFAULT",
    requiredRole: ["CUSTOMER", "STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
    auditModule: "THEATRE_AMENITY",
    auditAction: "GET_PUBLIC_THEATRE_AMENITIES",
  },
  async (data) => {
    return theatreAmenityService.getPublicTheatreAmenities(data.theatreIdOrSlug);
  }
);
