"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { theatreProfileService } from "@/lib/services/theatre-profile.service";
import {
  CreateTheatreProfileSchema,
  ProfileStatusTransitionSchema,
  RetrieveTheatreProfileSchema,
  UpdateTheatreLanguagesSchema,
  UpdateTheatreProfileSchema,
  UpdateTheatreSocialLinksSchema,
} from "@/lib/validation/theatre-profile.validation";
import {
  PaginatedTheatreProfileResult,
  PublicTheatreProfileView,
  TheatreProfileBundle,
  TheatreProfileRecord,
} from "@/types/theatre-profile.types";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Profile Server Actions (Phase 3 – Part 3)
 * ==============================================================================
 * Protected Server Actions:
 * Auth -> RBAC -> Tenant Isolation -> Input Sanitization -> Zod Validation
 *      -> Rate Limiting -> Audit Logging -> Cache Revalidation
 * ==============================================================================
 */

const TheatreIdInputSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
});

const PublicProfileQuerySchema = z.object({
  theatreIdOrSlug: z.string().min(1, "Theatre ID or public slug is required").max(160),
});

const RollbackProfileVersionSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  versionNumber: z.number().int().positive("Target version number must be positive"),
  reason: z.string().trim().max(500).optional(),
});

function revalidateProfilePaths(
  theatreId: string,
  internalSlug?: string,
  publicSlug?: string
) {
  revalidatePath("/theatre/profile");
  revalidatePath("/dashboard/theatres");
  revalidatePath("/dashboard/theatres/profiles");
  revalidatePath(`/dashboard/theatres/${theatreId}`);
  revalidatePath("/theatres");
  if (internalSlug) {
    revalidatePath(`/theatre/${internalSlug}`);
  }
  if (publicSlug && publicSlug !== internalSlug) {
    revalidatePath(`/theatre/${publicSlug}`);
  }
}

// 1. Create Profile
export const createTheatreProfileAction = createProtectedAction<
  z.input<typeof CreateTheatreProfileSchema>,
  TheatreProfileRecord
>(
  {
    actionName: "createTheatreProfileAction",
    schema: CreateTheatreProfileSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_PROFILE",
    auditAction: "CREATE",
  },
  async (input, context) => {
    const created = await theatreProfileService.createProfile(input, context.actor);
    revalidateProfilePaths(created.theatreId, created.internalTheatreSlug, created.publicSlug);
    return created;
  }
);

// 2. Update Profile
export const updateTheatreProfileAction = createProtectedAction<
  z.input<typeof UpdateTheatreProfileSchema>,
  TheatreProfileRecord
>(
  {
    actionName: "updateTheatreProfileAction",
    schema: UpdateTheatreProfileSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_PROFILE",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const updated = await theatreProfileService.updateProfile(input, context.actor);
    revalidateProfilePaths(updated.theatreId, updated.internalTheatreSlug, updated.publicSlug);
    return updated;
  }
);

// 3. Publish Profile
export const publishTheatreProfileAction = createProtectedAction<
  z.input<typeof ProfileStatusTransitionSchema>,
  TheatreProfileRecord
>(
  {
    actionName: "publishTheatreProfileAction",
    schema: ProfileStatusTransitionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_PROFILE",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const updated = await theatreProfileService.changeProfileStatus(
      input.theatreId,
      "PUBLISHED",
      input.reason,
      context.actor
    );
    revalidateProfilePaths(updated.theatreId, updated.internalTheatreSlug, updated.publicSlug);
    return updated;
  }
);

// 4. Hide Profile
export const hideTheatreProfileAction = createProtectedAction<
  z.input<typeof ProfileStatusTransitionSchema>,
  TheatreProfileRecord
>(
  {
    actionName: "hideTheatreProfileAction",
    schema: ProfileStatusTransitionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_PROFILE",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const updated = await theatreProfileService.changeProfileStatus(
      input.theatreId,
      "HIDDEN",
      input.reason,
      context.actor
    );
    revalidateProfilePaths(updated.theatreId, updated.internalTheatreSlug, updated.publicSlug);
    return updated;
  }
);

// 5. Archive Profile (Super Admin Only)
export const archiveTheatreProfileAction = createProtectedAction<
  z.input<typeof ProfileStatusTransitionSchema>,
  TheatreProfileRecord
>(
  {
    actionName: "archiveTheatreProfileAction",
    schema: ProfileStatusTransitionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    enforceTenantIsolation: false,
    auditModule: "THEATRE_PROFILE",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const updated = await theatreProfileService.changeProfileStatus(
      input.theatreId,
      "ARCHIVED",
      input.reason,
      context.actor
    );
    revalidateProfilePaths(updated.theatreId, updated.internalTheatreSlug, updated.publicSlug);
    return updated;
  }
);

// 6. Retrieve Profiles (Search, Multi-Filter & Pagination)
export const retrieveTheatreProfilesAction = createProtectedAction<
  z.input<typeof RetrieveTheatreProfileSchema>,
  PaginatedTheatreProfileResult
>(
  {
    actionName: "retrieveTheatreProfilesAction",
    schema: RetrieveTheatreProfileSchema,
    rateLimitCategory: "SEARCH",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: false,
  },
  async (input, context) => {
    return theatreProfileService.retrieveProfiles(input, context.actor);
  }
);

// 7. Retrieve Single Theatre Profile Detail Bundle
export const getTheatreProfileDetailAction = createProtectedAction<
  z.input<typeof TheatreIdInputSchema>,
  TheatreProfileBundle
>(
  {
    actionName: "getTheatreProfileDetailAction",
    schema: TheatreIdInputSchema,
    rateLimitCategory: "SEARCH",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
  },
  async (input, context) => {
    return theatreProfileService.getProfileBundle(input.theatreId, context.actor);
  }
);

// 8. Update Languages
export const updateTheatreLanguagesAction = createProtectedAction<
  z.input<typeof UpdateTheatreLanguagesSchema>,
  TheatreProfileRecord
>(
  {
    actionName: "updateTheatreLanguagesAction",
    schema: UpdateTheatreLanguagesSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_PROFILE",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const updated = await theatreProfileService.updateLanguages(input, context.actor);
    revalidateProfilePaths(updated.theatreId, updated.internalTheatreSlug, updated.publicSlug);
    return updated;
  }
);

// 9. Update Social Links
export const updateTheatreSocialLinksAction = createProtectedAction<
  z.input<typeof UpdateTheatreSocialLinksSchema>,
  TheatreProfileRecord
>(
  {
    actionName: "updateTheatreSocialLinksAction",
    schema: UpdateTheatreSocialLinksSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_PROFILE",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const updated = await theatreProfileService.updateSocialLinks(input, context.actor);
    revalidateProfilePaths(updated.theatreId, updated.internalTheatreSlug, updated.publicSlug);
    return updated;
  }
);

// 10. Rollback Profile Version (Future Rollback Architecture Endpoint)
export const rollbackTheatreProfileVersionAction = createProtectedAction<
  z.input<typeof RollbackProfileVersionSchema>,
  TheatreProfileRecord
>(
  {
    actionName: "rollbackTheatreProfileVersionAction",
    schema: RollbackProfileVersionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_PROFILE",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const restored = await theatreProfileService.rollbackToVersion(
      input.theatreId,
      input.versionNumber,
      input.reason,
      context.actor
    );
    revalidateProfilePaths(restored.theatreId, restored.internalTheatreSlug, restored.publicSlug);
    return restored;
  }
);

// 11. Public Profile Projection (Logo & Banner + Business Info + Languages + Socials)
export const getPublicTheatreProfileAction = createProtectedAction<
  z.input<typeof PublicProfileQuerySchema>,
  PublicTheatreProfileView | null
>(
  {
    actionName: "getPublicTheatreProfileAction",
    schema: PublicProfileQuerySchema,
    rateLimitCategory: "PUBLIC_DEFAULT",
    enforceTenantIsolation: false,
  },
  async (input) => {
    return theatreProfileService.getPublicTheatreProfile(input.theatreIdOrSlug);
  }
);

