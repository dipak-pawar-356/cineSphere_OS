/**
 * ==============================================================================
 * CineSphere OS — Theatre Lifecycle Validation Schemas (Phase 3 – Part 1)
 * ==============================================================================
 * Server-side Zod validation contracts for theatre onboarding, editing, approvals,
 * suspension, archival, soft deletion, and SEO slug validation.
 * ==============================================================================
 */

import { z } from "zod";

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const TheatreSlugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(120, "Slug cannot exceed 120 characters")
  .regex(SLUG_REGEX, "Slug must be lowercase alphanumeric with hyphens only (e.g. inox-kolhapur)");

export const CreateTheatreSchema = z.object({
  name: z.string().min(3, "Theatre name must be at least 3 characters").max(150),
  chain: z.string().min(2).max(100).optional(),
  slug: TheatreSlugSchema.optional(),
  tagline: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
  gstNumber: z.string().max(30).optional(),
  pricingTier: z.enum(["LUXURY", "PREMIUM", "STANDARD", "BUDGET"]).optional(),
  subscriptionPlan: z.enum(["Free", "Starter", "Professional", "Enterprise"]).optional(),
  contactEmail: z.string().email("Valid business contact email is required"),
  contactNumber: z.string().min(8, "Valid contact phone number is required").max(30),
  adminName: z.string().min(2, "Primary theatre administrator name is required").max(120),
  adminEmail: z.string().email("Valid theatre administrator email is required"),
  address: z.string().min(5, "Physical street address is required").max(500),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State/Province is required").max(100),
  pinCode: z.string().max(20).optional(),
  country: z.string().min(2).max(100).optional(),
  submitImmediately: z.boolean().optional(),
  branding: z
    .object({
      logoUrl: z.string().optional(),
      bannerUrl: z.string().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      accentColor: z.string().optional(),
    })
    .optional(),
  defaultConfig: z
    .object({
      timezone: z.string().optional(),
      currency: z.string().optional(),
      openingTime: z.string().optional(),
      closingTime: z.string().optional(),
      convenienceFeeDefault: z.number().nonnegative().optional(),
      allowSelfCheckIn: z.boolean().optional(),
      maxSeatsPerBooking: z.number().int().min(1).max(20).optional(),
    })
    .optional(),
});

export const UpdateTheatreSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  expectedVersion: z.number().int().positive("Optimistic lock version is required"),
  name: z.string().min(3).max(150).optional(),
  chain: z.string().min(2).max(100).optional(),
  slug: TheatreSlugSchema.optional(),
  tagline: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
  gstNumber: z.string().max(30).optional(),
  pricingTier: z.enum(["LUXURY", "PREMIUM", "STANDARD", "BUDGET"]).optional(),
  subscriptionPlan: z.enum(["Free", "Starter", "Professional", "Enterprise"]).optional(),
  contactEmail: z.string().email().optional(),
  contactNumber: z.string().min(8).max(30).optional(),
  adminName: z.string().min(2).max(120).optional(),
  adminEmail: z.string().email().optional(),
  address: z.string().min(5).max(500).optional(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(100).optional(),
  pinCode: z.string().max(20).optional(),
  country: z.string().min(2).max(100).optional(),
  branding: z
    .object({
      logoUrl: z.string().optional(),
      bannerUrl: z.string().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      accentColor: z.string().optional(),
    })
    .optional(),
  defaultConfig: z
    .object({
      timezone: z.string().optional(),
      currency: z.string().optional(),
      openingTime: z.string().optional(),
      closingTime: z.string().optional(),
      convenienceFeeDefault: z.number().nonnegative().optional(),
      allowSelfCheckIn: z.boolean().optional(),
      maxSeatsPerBooking: z.number().int().min(1).max(20).optional(),
    })
    .optional(),
});

/**
 * Restricted schema verifying fields a Theatre Admin is permitted to modify.
 * Prevents Theatre Admins from mutating pricing tier, SaaS plan, slug, or governance fields.
 */
export const TheatreAdminEditableFields = [
  "tagline",
  "description",
  "contactEmail",
  "contactNumber",
  "address",
  "pinCode",
  "branding",
  "defaultConfig",
] as const;

export const ApprovalDecisionSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  comments: z.string().max(1000).optional(),
});

export const RejectOrRevisionSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  comments: z.string().min(5, "Detailed comments/reason are required for rejection or revision requests").max(1000),
});

export const SuspendTheatreSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  reason: z.string().min(5, "Suspension reason must be at least 5 characters").max(500),
  endTimePlaceholder: z.string().optional(),
});

export const ArchiveOrRestoreSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  reason: z.string().max(500).optional(),
});

export const SoftDeleteTheatreSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  deleteReason: z.string().min(5, "Mandatory delete reason is required for compliance audits").max(500),
});

export const TheatreSearchFiltersSchema = z.object({
  query: z.string().max(120).optional(),
  status: z
    .enum([
      "ALL",
      "DRAFT",
      "PENDING_APPROVAL",
      "APPROVED",
      "ACTIVE",
      "INACTIVE",
      "SUSPENDED",
      "ARCHIVED",
      "SOFT_DELETED",
    ])
    .optional(),
  approvalStatus: z.enum(["ALL", "PENDING", "APPROVED", "REJECTED", "REVISION_REQUESTED"]).optional(),
  onlySuspended: z.boolean().optional(),
  onlyArchived: z.boolean().optional(),
  includeDeleted: z.boolean().optional(),
  createdFrom: z.string().optional(),
  createdTo: z.string().optional(),
  updatedFrom: z.string().optional(),
  updatedTo: z.string().optional(),
  sortBy: z.enum(["name", "city", "createdAt", "updatedAt", "status", "hallCount"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
});

