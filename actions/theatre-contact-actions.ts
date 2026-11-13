"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { theatreContactService } from "@/lib/services/theatre-contact.service";
import {
  CreateTheatreContactSchema,
  UpdateTheatreContactSchema,
  UpdateTheatreWebsiteSchema,
  UpdateTheatreSocialLinksSchema,
  ReorderTheatreContactsSchema,
  DeleteTheatreContactSchema,
  ArchiveTheatreContactSchema,
} from "@/lib/validation/theatre-contact.validation";
import type {
  TheatreContactRecord,
  TheatreContactWithDetails,
  TheatreContactDirectoryBundle,
  PublicTheatreContactDirectoryBundle,
} from "@/types/theatre-contact.types";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Contact Server Actions (Phase 3 – Part 6)
 * ==============================================================================
 * Protected Server Actions:
 * Auth -> RBAC -> Tenant Isolation -> Input Sanitization -> Zod Validation
 *      -> Rate Limiting -> Audit Logging -> Cache Revalidation
 * ==============================================================================
 */

const GetTheatreContactsInputSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
  channelType: z.enum([
    "PHONE",
    "EMAIL",
    "WEBSITE",
    "SOCIAL_LINK",
    "EMERGENCY",
    "MANAGER",
    "WHATSAPP",
    "TELEGRAM",
    "LIVE_CHAT",
    "CALL_CENTER",
  ]).optional(),
  contactRole: z.enum([
    "CUSTOMER_SUPPORT",
    "GENERAL_ENQUIRY",
    "EMERGENCY_DESK",
    "DUTY_MANAGER",
    "BUSINESS_DEVELOPMENT",
    "CORPORATE_OFFICE",
    "BOOKING_BOX_OFFICE",
    "TECHNICAL_OPERATIONS",
    "LOST_AND_FOUND",
  ]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT", "ARCHIVED"]).optional(),
  isPrimary: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  query: z.string().trim().optional(),
});

const GetTheatreBundleInputSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
});

const GetPublicContactsInputSchema = z.object({
  theatreIdOrSlug: z.string().trim().min(1, "Theatre ID or slug is required"),
});

function revalidateContactPaths(theatreId: string, slug?: string) {
  revalidatePath("/theatre/contacts");
  revalidatePath("/theatre/profile");
  revalidatePath("/theatre/location");
  revalidatePath("/dashboard/theatres");
  revalidatePath(`/dashboard/theatres/${theatreId}`);
  revalidatePath("/theatres");
  if (slug) {
    revalidatePath(`/theatre/${slug}`);
  }
}

// ------------------------------------------------------------------------------
// 1. CREATE CONTACT RECORD (Super Admin & Theatre Admin)
// ------------------------------------------------------------------------------
export const createTheatreContactAction = createProtectedAction<
  z.input<typeof CreateTheatreContactSchema>,
  TheatreContactWithDetails
>(
  {
    actionName: "createTheatreContactAction",
    schema: CreateTheatreContactSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONTACT",
    auditAction: "CREATE",
  },
  async (data, context) => {
    const contact = await theatreContactService.createContact(data, context.actor);
    revalidateContactPaths(data.theatreId);
    return contact;
  }
);

// ------------------------------------------------------------------------------
// 2. UPDATE CONTACT RECORD (Super Admin & Theatre Admin)
// ------------------------------------------------------------------------------
export const updateTheatreContactAction = createProtectedAction<
  z.input<typeof UpdateTheatreContactSchema>,
  TheatreContactWithDetails
>(
  {
    actionName: "updateTheatreContactAction",
    schema: UpdateTheatreContactSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONTACT",
    auditAction: "UPDATE",
  },
  async (data, context) => {
    const contact = await theatreContactService.updateContact(data, context.actor);
    revalidateContactPaths(data.theatreId);
    return contact;
  }
);

// ------------------------------------------------------------------------------
// 3. DELETE CONTACT RECORD (Super Admin & Theatre Admin)
// ------------------------------------------------------------------------------
export const deleteTheatreContactAction = createProtectedAction<
  z.input<typeof DeleteTheatreContactSchema>,
  { success: boolean; contactId: string }
>(
  {
    actionName: "deleteTheatreContactAction",
    schema: DeleteTheatreContactSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONTACT",
    auditAction: "DELETE",
  },
  async (data, context) => {
    await theatreContactService.deleteContact(data.contactId, data.theatreId, context.actor);
    revalidateContactPaths(data.theatreId);
    return { success: true, contactId: data.contactId };
  }
);

// ------------------------------------------------------------------------------
// 4. ARCHIVE CONTACT RECORD (Super Admin & Theatre Admin)
// ------------------------------------------------------------------------------
export const archiveTheatreContactAction = createProtectedAction<
  z.input<typeof ArchiveTheatreContactSchema>,
  TheatreContactRecord
>(
  {
    actionName: "archiveTheatreContactAction",
    schema: ArchiveTheatreContactSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONTACT",
    auditAction: "ARCHIVE",
  },
  async (data, context) => {
    const archived = await theatreContactService.archiveContact(data.contactId, data.theatreId, context.actor);
    revalidateContactPaths(data.theatreId);
    return archived;
  }
);

// ------------------------------------------------------------------------------
// 5. UPDATE OFFICIAL WEBSITE (Super Admin & Theatre Admin)
// ------------------------------------------------------------------------------
export const updateTheatreWebsiteAction = createProtectedAction<
  z.input<typeof UpdateTheatreWebsiteSchema>,
  TheatreContactWithDetails
>(
  {
    actionName: "updateTheatreWebsiteAction",
    schema: UpdateTheatreWebsiteSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONTACT",
    auditAction: "UPDATE_WEBSITE",
  },
  async (data, context) => {
    const contact = await theatreContactService.updateWebsite(data, context.actor);
    revalidateContactPaths(data.theatreId);
    return contact;
  }
);

// ------------------------------------------------------------------------------
// 6. UPDATE SOCIAL MEDIA LINKS (Super Admin & Theatre Admin)
// ------------------------------------------------------------------------------
export const updateTheatreContactSocialLinksAction = createProtectedAction<
  z.input<typeof UpdateTheatreSocialLinksSchema>,
  TheatreContactWithDetails[]
>(
  {
    actionName: "updateTheatreContactSocialLinksAction",
    schema: UpdateTheatreSocialLinksSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONTACT",
    auditAction: "UPDATE_SOCIAL_LINKS",
  },
  async (data, context) => {
    const contacts = await theatreContactService.updateSocialLinks(data, context.actor);
    revalidateContactPaths(data.theatreId);
    return contacts;
  }
);

// ------------------------------------------------------------------------------
// 7. REORDER CONTACTS (Super Admin & Theatre Admin)
// ------------------------------------------------------------------------------
export const reorderTheatreContactsAction = createProtectedAction<
  z.input<typeof ReorderTheatreContactsSchema>,
  TheatreContactRecord[]
>(
  {
    actionName: "reorderTheatreContactsAction",
    schema: ReorderTheatreContactsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONTACT",
    auditAction: "REORDER",
  },
  async (data, context) => {
    const reordered = await theatreContactService.reorderContacts(data, context.actor);
    revalidateContactPaths(data.theatreId);
    return reordered;
  }
);

// ------------------------------------------------------------------------------
// 8. GET THEATRE CONTACTS (Scoped Query)
// ------------------------------------------------------------------------------
export const getTheatreContactsAction = createProtectedAction<
  z.input<typeof GetTheatreContactsInputSchema>,
  TheatreContactWithDetails[]
>(
  {
    actionName: "getTheatreContactsAction",
    schema: GetTheatreContactsInputSchema,
    rateLimitCategory: "SEARCH",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONTACT",
    auditAction: "GET_CONTACTS",
  },
  async (data, context) => {
    return theatreContactService.getTheatreContacts(data.theatreId, data, context.actor);
  }
);

// ------------------------------------------------------------------------------
// 9. GET THEATRE CONTACT BUNDLE
// ------------------------------------------------------------------------------
export const getTheatreContactBundleAction = createProtectedAction<
  z.input<typeof GetTheatreBundleInputSchema>,
  TheatreContactDirectoryBundle
>(
  {
    actionName: "getTheatreContactBundleAction",
    schema: GetTheatreBundleInputSchema,
    rateLimitCategory: "SEARCH",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONTACT",
    auditAction: "GET_CONTACT_BUNDLE",
  },
  async (data, context) => {
    return theatreContactService.getTheatreContactBundle(data.theatreId, context.actor);
  }
);

// ------------------------------------------------------------------------------
// 10. GET PUBLIC THEATRE CONTACTS (Patron Access)
// ------------------------------------------------------------------------------
export const getPublicTheatreContactsAction = createProtectedAction<
  z.input<typeof GetPublicContactsInputSchema>,
  PublicTheatreContactDirectoryBundle | null
>(
  {
    actionName: "getPublicTheatreContactsAction",
    schema: GetPublicContactsInputSchema,
    rateLimitCategory: "PUBLIC_DEFAULT",
    requiredRole: ["CUSTOMER", "STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
    auditModule: "THEATRE_CONTACT",
    auditAction: "GET_PUBLIC_CONTACTS",
  },
  async (data) => {
    return theatreContactService.getPublicTheatreContacts(data.theatreIdOrSlug);
  }
);
