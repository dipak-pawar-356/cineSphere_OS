"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { theatreLifecycleService } from "@/lib/services/theatre-lifecycle.service";
import {
  CreateTheatreSchema,
  UpdateTheatreSchema,
  ApprovalDecisionSchema,
  RejectOrRevisionSchema,
  SuspendTheatreSchema,
  ArchiveOrRestoreSchema,
  SoftDeleteTheatreSchema,
  TheatreSearchFiltersSchema,
} from "@/lib/validation/theatre-lifecycle.validation";
import {
  ManagedTheatreEntity,
  PaginatedTheatresResult,
  TheatreLifecycleDetailBundle,
} from "@/types/theatre-lifecycle.types";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Lifecycle Management Server Actions (Phase 3 – Part 1)
 * ==============================================================================
 * Reusable, security-hardened Server Actions delegating cleanly to Domain Service:
 * UI -> Server Actions -> Domain Services -> Repositories
 * ==============================================================================
 */

const TheatreIdInputSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
});

const SlugGenInputSchema = z.object({
  name: z.string().min(1, "Theatre name is required"),
  city: z.string().optional(),
  manualOverride: z.string().optional(),
  excludeTheatreId: z.string().optional(),
});

const SlugValidateInputSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  excludeTheatreId: z.string().optional(),
});

function revalidateLifecyclePaths(theatreId?: string) {
  revalidatePath("/dashboard/theatres");
  revalidatePath("/dashboard/theatres/lifecycle");
  if (theatreId) {
    revalidatePath(`/dashboard/theatres/${theatreId}`);
  }
  revalidatePath("/theatre/profile");
}

// 1. Create Theatre (DRAFT or PENDING_APPROVAL)
export const createTheatreLifecycleAction = createProtectedAction<
  z.input<typeof CreateTheatreSchema>,
  ManagedTheatreEntity
>(
  {
    actionName: "createTheatreLifecycleAction",
    schema: CreateTheatreSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    auditModule: "THEATRE_LIFECYCLE",
    auditAction: "CREATE",
  },
  async (input, context) => {
    const created = await theatreLifecycleService.createTheatre(input, context.actor);
    revalidateLifecyclePaths(created.id);
    return created;
  }
);

// 2. Update Theatre (with Optimistic Locking & Role Field Checks)
export const updateTheatreLifecycleAction = createProtectedAction<
  z.input<typeof UpdateTheatreSchema>,
  ManagedTheatreEntity
>(
  {
    actionName: "updateTheatreLifecycleAction",
    schema: UpdateTheatreSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "THEATRE_LIFECYCLE",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const updated = await theatreLifecycleService.updateTheatre(
      input.theatreId,
      input,
      context.actor
    );
    revalidateLifecyclePaths(updated.id);
    return updated;
  }
);

// 3. Submit Draft for Approval (DRAFT -> PENDING_APPROVAL)
export const submitTheatreForApprovalAction = createProtectedAction<
  z.infer<typeof TheatreIdInputSchema>,
  ManagedTheatreEntity
>(
  {
    actionName: "submitTheatreForApprovalAction",
    schema: TheatreIdInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    auditModule: "THEATRE_LIFECYCLE",
    auditAction: "SUBMIT_APPROVAL",
  },
  async (input, context) => {
    const updated = await theatreLifecycleService.submitForApproval(input.theatreId, context.actor);
    revalidateLifecyclePaths(updated.id);
    return updated;
  }
);

// 4. Approve Theatre (PENDING_APPROVAL -> APPROVED)
export const approveTheatreLifecycleAction = createProtectedAction<
  z.infer<typeof ApprovalDecisionSchema>,
  ManagedTheatreEntity
>(
  {
    actionName: "approveTheatreLifecycleAction",
    schema: ApprovalDecisionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    auditModule: "THEATRE_LIFECYCLE",
    auditAction: "APPROVE",
  },
  async (input, context) => {
    const updated = await theatreLifecycleService.approveTheatre(
      input.theatreId,
      input.comments,
      context.actor
    );
    revalidateLifecyclePaths(updated.id);
    return updated;
  }
);

// 5. Reject Theatre (PENDING_APPROVAL -> DRAFT with REJECTED approval record)
export const rejectTheatreLifecycleAction = createProtectedAction<
  z.infer<typeof RejectOrRevisionSchema>,
  ManagedTheatreEntity
>(
  {
    actionName: "rejectTheatreLifecycleAction",
    schema: RejectOrRevisionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    auditModule: "THEATRE_LIFECYCLE",
    auditAction: "REJECT",
  },
  async (input, context) => {
    const updated = await theatreLifecycleService.rejectOrRequestRevision(
      input.theatreId,
      "REJECTED",
      input.comments,
      context.actor
    );
    revalidateLifecyclePaths(updated.id);
    return updated;
  }
);

// 6. Request Revision (PENDING_APPROVAL -> DRAFT with REVISION_REQUESTED)
export const requestTheatreRevisionAction = createProtectedAction<
  z.infer<typeof RejectOrRevisionSchema>,
  ManagedTheatreEntity
>(
  {
    actionName: "requestTheatreRevisionAction",
    schema: RejectOrRevisionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    auditModule: "THEATRE_LIFECYCLE",
    auditAction: "REQUEST_REVISION",
  },
  async (input, context) => {
    const updated = await theatreLifecycleService.rejectOrRequestRevision(
      input.theatreId,
      "REVISION_REQUESTED",
      input.comments,
      context.actor
    );
    revalidateLifecyclePaths(updated.id);
    return updated;
  }
);

// 7. Activate Theatre (APPROVED | INACTIVE -> ACTIVE)
export const activateTheatreLifecycleAction = createProtectedAction<
  z.infer<typeof TheatreIdInputSchema>,
  ManagedTheatreEntity
>(
  {
    actionName: "activateTheatreLifecycleAction",
    schema: TheatreIdInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    auditModule: "THEATRE_LIFECYCLE",
    auditAction: "ACTIVATE",
  },
  async (input, context) => {
    const updated = await theatreLifecycleService.activateTheatre(input.theatreId, context.actor);
    revalidateLifecyclePaths(updated.id);
    return updated;
  }
);

// 8. Suspend Theatre (ACTIVE -> SUSPENDED with operational lockouts)
export const suspendTheatreLifecycleAction = createProtectedAction<
  z.infer<typeof SuspendTheatreSchema>,
  ManagedTheatreEntity
>(
  {
    actionName: "suspendTheatreLifecycleAction",
    schema: SuspendTheatreSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    auditModule: "THEATRE_LIFECYCLE",
    auditAction: "SUSPEND",
  },
  async (input, context) => {
    const updated = await theatreLifecycleService.suspendTheatre(
      input.theatreId,
      input.reason,
      input.endTimePlaceholder,
      context.actor
    );
    revalidateLifecyclePaths(updated.id);
    return updated;
  }
);

// 9. Resume Suspended Theatre (SUSPENDED -> ACTIVE)
export const resumeTheatreLifecycleAction = createProtectedAction<
  z.infer<typeof TheatreIdInputSchema>,
  ManagedTheatreEntity
>(
  {
    actionName: "resumeTheatreLifecycleAction",
    schema: TheatreIdInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    auditModule: "THEATRE_LIFECYCLE",
    auditAction: "RESUME",
  },
  async (input, context) => {
    const updated = await theatreLifecycleService.resumeTheatre(input.theatreId, context.actor);
    revalidateLifecyclePaths(updated.id);
    return updated;
  }
);

// 10. Archive Theatre (* -> ARCHIVED read-only)
export const archiveTheatreLifecycleAction = createProtectedAction<
  z.infer<typeof ArchiveOrRestoreSchema>,
  ManagedTheatreEntity
>(
  {
    actionName: "archiveTheatreLifecycleAction",
    schema: ArchiveOrRestoreSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    auditModule: "THEATRE_LIFECYCLE",
    auditAction: "ARCHIVE",
  },
  async (input, context) => {
    const updated = await theatreLifecycleService.archiveTheatre(
      input.theatreId,
      input.reason,
      context.actor
    );
    revalidateLifecyclePaths(updated.id);
    return updated;
  }
);

// 11. Restore Archived Theatre (ARCHIVED -> ACTIVE | INACTIVE)
export const restoreTheatreLifecycleAction = createProtectedAction<
  z.infer<typeof TheatreIdInputSchema>,
  ManagedTheatreEntity
>(
  {
    actionName: "restoreTheatreLifecycleAction",
    schema: TheatreIdInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    auditModule: "THEATRE_LIFECYCLE",
    auditAction: "RESTORE",
  },
  async (input, context) => {
    const updated = await theatreLifecycleService.restoreTheatre(input.theatreId, context.actor);
    revalidateLifecyclePaths(updated.id);
    return updated;
  }
);

// 12. Soft Delete Theatre (blocks if ACTIVE; stores deletedBy, deletedAt, deleteReason)
export const softDeleteTheatreLifecycleAction = createProtectedAction<
  z.infer<typeof SoftDeleteTheatreSchema>,
  ManagedTheatreEntity
>(
  {
    actionName: "softDeleteTheatreLifecycleAction",
    schema: SoftDeleteTheatreSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"],
    auditModule: "THEATRE_LIFECYCLE",
    auditAction: "SOFT_DELETE",
  },
  async (input, context) => {
    const updated = await theatreLifecycleService.softDeleteTheatre(
      input.theatreId,
      input.deleteReason,
      context.actor
    );
    revalidateLifecyclePaths(updated.id);
    return updated;
  }
);

// 13. Generate Unique Slug
export const generateTheatreSlugAction = createProtectedAction<
  z.infer<typeof SlugGenInputSchema>,
  { slug: string }
>(
  {
    actionName: "generateTheatreSlugAction",
    schema: SlugGenInputSchema,
    rateLimitCategory: "SEARCH",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
  },
  async (input) => {
    const slug = await theatreLifecycleService.generateUniqueSlug(
      input.name,
      input.city,
      input.manualOverride,
      input.excludeTheatreId
    );
    return { slug };
  }
);

// 14. Validate Slug Uniqueness & Syntax
export const validateTheatreSlugAction = createProtectedAction<
  z.infer<typeof SlugValidateInputSchema>,
  { isValid: boolean; isAvailable: boolean; error?: string }
>(
  {
    actionName: "validateTheatreSlugAction",
    schema: SlugValidateInputSchema,
    rateLimitCategory: "SEARCH",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
  },
  async (input) => {
    return theatreLifecycleService.validateSlugAvailability(input.slug, input.excludeTheatreId);
  }
);

// 15. Search & Paginate Theatres (Tenant-Isolated for Theatre Admin)
export const searchTheatresLifecycleAction = createProtectedAction<
  z.infer<typeof TheatreSearchFiltersSchema>,
  PaginatedTheatresResult
>(
  {
    actionName: "searchTheatresLifecycleAction",
    schema: TheatreSearchFiltersSchema,
    rateLimitCategory: "SEARCH",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
  },
  async (input, context) => {
    return theatreLifecycleService.searchTheatres(input, context.actor);
  }
);

// 16. Get Full Lifecycle Detail Bundle (Theatre + History + Approvals + Slugs + Audits)
export const getTheatreLifecycleDetailAction = createProtectedAction<
  z.infer<typeof TheatreIdInputSchema>,
  TheatreLifecycleDetailBundle
>(
  {
    actionName: "getTheatreLifecycleDetailAction",
    schema: TheatreIdInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
  },
  async (input, context) => {
    return theatreLifecycleService.getTheatreLifecycleDetails(input.theatreId, context.actor);
  }
);

