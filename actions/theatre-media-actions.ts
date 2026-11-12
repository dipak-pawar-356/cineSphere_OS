"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { theatreMediaService } from "@/lib/services/theatre-media.service";
import {
  DeleteMediaSchema,
  ReorderGallerySchema,
  ReplaceTheatreMediaSchema,
  RestoreMediaVersionSchema,
  RetrieveTheatreMediaSchema,
  UpdateMediaMetadataSchema,
  UploadTheatreMediaSchema,
} from "@/lib/validation/theatre-media.validation";
import {
  MediaUploadValidationResult,
  PaginatedTheatreMediaResult,
  TheatreMediaAsset,
  TheatreMediaCollectionBundle,
  TheatrePublicMediaView,
} from "@/types/theatre-media.types";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Branding & Media Server Actions (Phase 3 – Part 2)
 * ==============================================================================
 * Reusable, security-hardened Server Actions delegating to Domain Service:
 * UI -> Protected Server Actions -> TheatreMediaService -> TheatreMediaRepository
 * ==============================================================================
 */

const TheatreIdInputSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
});

const PublicMediaQuerySchema = z.object({
  theatreIdOrSlug: z.string().min(1, "Theatre ID or slug is required").max(150),
});

function revalidateMediaPaths(theatreId: string, theatreSlug?: string) {
  revalidatePath("/dashboard/media");
  revalidatePath("/dashboard/media-library");
  revalidatePath(`/dashboard/theatres/${theatreId}`);
  revalidatePath("/theatre/media");
  revalidatePath("/theatre/gallery");
  revalidatePath("/theatre/profile");
  revalidatePath("/theatres");
  if (theatreSlug) {
    revalidatePath(`/theatre/${theatreSlug}`);
  }
}

// 1. Upload Media
export const uploadTheatreMediaAction = createProtectedAction<
  z.input<typeof UploadTheatreMediaSchema>,
  TheatreMediaAsset
>(
  {
    actionName: "uploadTheatreMediaAction",
    schema: UploadTheatreMediaSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_MEDIA",
    auditAction: "CREATE",
  },
  async (input, context) => {
    const asset = await theatreMediaService.uploadMedia(input, context.actor);
    revalidateMediaPaths(asset.theatreId, asset.theatreSlug);
    return asset;
  }
);

// 2. Replace Media (with Version History Preservation)
export const replaceTheatreMediaAction = createProtectedAction<
  z.input<typeof ReplaceTheatreMediaSchema>,
  TheatreMediaAsset
>(
  {
    actionName: "replaceTheatreMediaAction",
    schema: ReplaceTheatreMediaSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_MEDIA",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const updated = await theatreMediaService.replaceMedia(input, context.actor);
    revalidateMediaPaths(updated.theatreId, updated.theatreSlug);
    return updated;
  }
);

// 3. Restore Previous Media Version
export const restoreTheatreMediaVersionAction = createProtectedAction<
  z.input<typeof RestoreMediaVersionSchema>,
  TheatreMediaAsset
>(
  {
    actionName: "restoreTheatreMediaVersionAction",
    schema: RestoreMediaVersionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_MEDIA",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const restored = await theatreMediaService.restoreMediaVersion(
      input.theatreId,
      input.mediaId,
      input.versionNumber,
      input.reason,
      context.actor
    );
    revalidateMediaPaths(restored.theatreId, restored.theatreSlug);
    return restored;
  }
);

// 4. Delete Media (Soft Delete)
export const deleteTheatreMediaAction = createProtectedAction<
  z.input<typeof DeleteMediaSchema>,
  TheatreMediaAsset
>(
  {
    actionName: "deleteTheatreMediaAction",
    schema: DeleteMediaSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_MEDIA",
    auditAction: "DELETE",
  },
  async (input, context) => {
    const deleted = await theatreMediaService.deleteMedia(
      input.theatreId,
      input.mediaId,
      input.reason,
      context.actor
    );
    revalidateMediaPaths(deleted.theatreId, deleted.theatreSlug);
    return deleted;
  }
);

// 5. Reorder Gallery (Drag & Drop, Manual, or Auto-Normalization)
export const reorderTheatreGalleryAction = createProtectedAction<
  z.input<typeof ReorderGallerySchema>,
  TheatreMediaAsset[]
>(
  {
    actionName: "reorderTheatreGalleryAction",
    schema: ReorderGallerySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_MEDIA",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const reordered = await theatreMediaService.reorderGallery(input, context.actor);
    revalidateMediaPaths(input.theatreId, reordered[0]?.theatreSlug);
    return reordered;
  }
);

// 6. Update Media Metadata & Lifecycle Status
export const updateTheatreMediaMetadataAction = createProtectedAction<
  z.input<typeof UpdateMediaMetadataSchema>,
  TheatreMediaAsset
>(
  {
    actionName: "updateTheatreMediaMetadataAction",
    schema: UpdateMediaMetadataSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_MEDIA",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const updated = await theatreMediaService.updateMetadata(input, context.actor);
    revalidateMediaPaths(updated.theatreId, updated.theatreSlug);
    return updated;
  }
);

// 7. Retrieve / Search / Filter / Paginate Media (Tenant-Scoped)
export const retrieveTheatreMediaAction = createProtectedAction<
  z.input<typeof RetrieveTheatreMediaSchema>,
  PaginatedTheatreMediaResult
>(
  {
    actionName: "retrieveTheatreMediaAction",
    schema: RetrieveTheatreMediaSchema,
    rateLimitCategory: "SEARCH",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
  },
  async (input, context) => {
    return theatreMediaService.retrieveMedia(input, context.actor);
  }
);

// 8. Get Full Centralized Branding Collection Bundle for Theatre
export const getTheatreBrandingCollectionAction = createProtectedAction<
  z.input<typeof TheatreIdInputSchema>,
  TheatreMediaCollectionBundle
>(
  {
    actionName: "getTheatreBrandingCollectionAction",
    schema: TheatreIdInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
  },
  async (input, context) => {
    return theatreMediaService.getTheatreBrandingCollection(input.theatreId, context.actor);
  }
);

// 9. Validate Media Upload (Pre-flight + Server Policy Verification)
export const validateTheatreMediaUploadAction = createProtectedAction<
  z.input<typeof UploadTheatreMediaSchema>,
  MediaUploadValidationResult
>(
  {
    actionName: "validateTheatreMediaUploadAction",
    schema: UploadTheatreMediaSchema,
    rateLimitCategory: "SEARCH",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
  },
  async (input, context) => {
    return theatreMediaService.validateUpload(input, context.actor);
  }
);

// 10. Public Theatre Media Resolver (Cached Active Assets Only)
export const getPublicTheatreMediaAction = createProtectedAction<
  z.input<typeof PublicMediaQuerySchema>,
  TheatrePublicMediaView | null
>(
  {
    actionName: "getPublicTheatreMediaAction",
    schema: PublicMediaQuerySchema,
    rateLimitCategory: "PUBLIC_DEFAULT",
    requiredRole: ["CUSTOMER", "STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
  },
  async (input) => {
    return theatreMediaService.getPublicTheatreMedia(input.theatreIdOrSlug);
  }
);

