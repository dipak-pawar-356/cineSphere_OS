"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { theatreLocationService } from "@/lib/services/theatre-location.service";
import {
  CreateTheatreLocationSchema,
  LocationStatusTransitionSchema,
  RetrieveTheatreLocationSchema,
  UpdateCoordinatesSchema,
  UpdateTheatreLocationSchema,
  ValidateAddressInputSchema,
  VerifyLocationSchema,
} from "@/lib/validation/theatre-location.validation";
import {
  AddressValidationResult,
  PaginatedTheatreLocationResult,
  PublicTheatreLocationView,
  TheatreCoordinatesRecord,
  TheatreLocationBundle,
  TheatreLocationRecord,
} from "@/types/theatre-location.types";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Location Server Actions (Phase 3 – Part 4)
 * ==============================================================================
 * Protected Server Actions:
 * Auth -> RBAC -> Tenant Isolation -> Input Sanitization -> Zod Validation
 *      -> Rate Limiting -> Audit Logging -> Cache Revalidation
 * ==============================================================================
 */

const LocationIdInputSchema = z.object({
  locationId: z.string().min(1, "Location ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
});

const PublicLocationQuerySchema = z.object({
  theatreIdOrSlug: z.string().min(1, "Theatre ID or slug is required").max(160),
});

const RollbackLocationVersionSchema = z.object({
  locationId: z.string().min(1, "Location ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  versionNumber: z.number().int().positive("Target version number must be positive"),
  reason: z.string().trim().max(500).optional(),
});

function revalidateLocationPaths(theatreId: string, slug?: string) {
  revalidatePath("/theatre/location");
  revalidatePath("/theatre/profile");
  revalidatePath("/dashboard/theatres");
  revalidatePath("/dashboard/theatres/locations");
  revalidatePath(`/dashboard/theatres/${theatreId}`);
  revalidatePath("/theatres");
  if (slug) {
    revalidatePath(`/theatre/${slug}`);
  }
}

// 1. Create Location
export const createTheatreLocationAction = createProtectedAction<
  z.input<typeof CreateTheatreLocationSchema>,
  TheatreLocationRecord
>(
  {
    actionName: "createTheatreLocationAction",
    schema: CreateTheatreLocationSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_LOCATION",
    auditAction: "CREATE",
  },
  async (input, context) => {
    const created = await theatreLocationService.createLocation(input, context.actor);
    revalidateLocationPaths(created.theatreId);
    return created;
  }
);

// 2. Update Location
export const updateTheatreLocationAction = createProtectedAction<
  z.input<typeof UpdateTheatreLocationSchema>,
  TheatreLocationRecord
>(
  {
    actionName: "updateTheatreLocationAction",
    schema: UpdateTheatreLocationSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_LOCATION",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const updated = await theatreLocationService.updateLocation(input, context.actor);
    revalidateLocationPaths(updated.theatreId);
    return updated;
  }
);

// 3. Update Coordinates
export const updateTheatreCoordinatesAction = createProtectedAction<
  z.input<typeof UpdateCoordinatesSchema>,
  TheatreCoordinatesRecord
>(
  {
    actionName: "updateTheatreCoordinatesAction",
    schema: UpdateCoordinatesSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_LOCATION",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const updated = await theatreLocationService.updateCoordinates(input, context.actor);
    revalidateLocationPaths(input.theatreId);
    return updated;
  }
);

// 4. Verify Location (Super Admin only)
export const verifyTheatreLocationAction = createProtectedAction<
  z.input<typeof VerifyLocationSchema>,
  TheatreLocationRecord
>(
  {
    actionName: "verifyTheatreLocationAction",
    schema: VerifyLocationSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    enforceTenantIsolation: false,
    auditModule: "THEATRE_LOCATION",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const verified = await theatreLocationService.verifyLocation(input, context.actor);
    revalidateLocationPaths(verified.theatreId);
    return verified;
  }
);

// 5. Publish Location
export const publishTheatreLocationAction = createProtectedAction<
  z.input<typeof LocationStatusTransitionSchema>,
  TheatreLocationRecord
>(
  {
    actionName: "publishTheatreLocationAction",
    schema: LocationStatusTransitionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_LOCATION",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const updated = await theatreLocationService.changeLocationStatus(
      input.locationId,
      "PUBLISHED",
      input.reason,
      context.actor
    );
    revalidateLocationPaths(updated.theatreId);
    return updated;
  }
);

// 6. Archive Location
export const archiveTheatreLocationAction = createProtectedAction<
  z.input<typeof LocationStatusTransitionSchema>,
  TheatreLocationRecord
>(
  {
    actionName: "archiveTheatreLocationAction",
    schema: LocationStatusTransitionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_LOCATION",
    auditAction: "DELETE",
  },
  async (input, context) => {
    const updated = await theatreLocationService.archiveLocation(
      input.locationId,
      input.reason,
      context.actor
    );
    revalidateLocationPaths(updated.theatreId);
    return updated;
  }
);

// 7. Retrieve Locations (Paginated & Filtered)
export const retrieveTheatreLocationsAction = createProtectedAction<
  z.input<typeof RetrieveTheatreLocationSchema>,
  PaginatedTheatreLocationResult
>(
  {
    actionName: "retrieveTheatreLocationsAction",
    schema: RetrieveTheatreLocationSchema,
    rateLimitCategory: "SEARCH",
    requiredRole: ["STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: false,
  },
  async (input, context) => {
    return theatreLocationService.retrieveLocations(input, context.actor);
  }
);

// 8. Get Location Detail Bundle
export const getTheatreLocationDetailAction = createProtectedAction<
  z.input<typeof LocationIdInputSchema>,
  TheatreLocationBundle
>(
  {
    actionName: "getTheatreLocationDetailAction",
    schema: LocationIdInputSchema,
    rateLimitCategory: "SEARCH",
    requiredRole: ["STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
  },
  async (input, context) => {
    return theatreLocationService.getLocationBundle(input.locationId, context.actor);
  }
);

// 9. Validate Address
export const validateTheatreAddressAction = createProtectedAction<
  z.input<typeof ValidateAddressInputSchema>,
  AddressValidationResult
>(
  {
    actionName: "validateTheatreAddressAction",
    schema: ValidateAddressInputSchema,
    rateLimitCategory: "SEARCH",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: false,
  },
  async (input) => {
    return theatreLocationService.validateAddress(input);
  }
);

// 10. Rollback Version
export const rollbackTheatreLocationVersionAction = createProtectedAction<
  z.input<typeof RollbackLocationVersionSchema>,
  TheatreLocationRecord
>(
  {
    actionName: "rollbackTheatreLocationVersionAction",
    schema: RollbackLocationVersionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_LOCATION",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const rolledBack = await theatreLocationService.rollbackToVersion(
      input.locationId,
      input.versionNumber,
      context.actor
    );
    revalidateLocationPaths(rolledBack.theatreId);
    return rolledBack;
  }
);

// 11. Public Theatre Location View
export const getPublicTheatreLocationAction = createProtectedAction<
  z.input<typeof PublicLocationQuerySchema>,
  PublicTheatreLocationView | null
>(
  {
    actionName: "getPublicTheatreLocationAction",
    schema: PublicLocationQuerySchema,
    rateLimitCategory: "PUBLIC_DEFAULT",
    requiredRole: ["CUSTOMER", "STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: false,
  },
  async (input) => {
    return theatreLocationService.getPublicTheatreLocation(input.theatreIdOrSlug);
  }
);
