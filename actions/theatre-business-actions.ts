"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { theatreBusinessService } from "@/lib/services/theatre-business.service";
import {
  CreateTheatreBusinessProfileSchema,
  UpdateTheatreBusinessProfileSchema,
  UpdateTheatreTaxConfigurationSchema,
  UpdateTheatreInvoiceConfigurationSchema,
  VerifyTheatreBusinessProfileSchema,
  ArchiveTheatreBusinessProfileSchema,
  AddTheatreBusinessDocumentSchema,
  DeleteTheatreBusinessDocumentSchema,
} from "@/lib/validation/theatre-business.validation";
import type {
  TheatreBusinessProfileRecord,
  TheatreTaxConfigurationRecord,
  TheatreInvoiceConfigurationRecord,
  TheatreBusinessComplianceRecord,
  TheatreBusinessDocumentRecord,
  TheatreBusinessBundle,
  TheatreBusinessProfileWithDetails,
} from "@/types/theatre-business.types";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Business Server Actions (Phase 3 – Part 7)
 * ==============================================================================
 * Enterprise protected server actions:
 * Auth -> RBAC -> Tenant Isolation -> Input Sanitization -> Zod Validation
 *      -> Rate Limiting -> Audit Logging -> Cache Invalidation
 * ==============================================================================
 */

const GetTheatreBusinessInputSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
});

function revalidateBusinessPaths(theatreId: string) {
  revalidatePath("/theatre/business");
  revalidatePath("/theatre/profile");
  revalidatePath("/theatre/contacts");
  revalidatePath("/dashboard/theatres");
  revalidatePath(`/dashboard/theatres/${theatreId}`);
}

// ------------------------------------------------------------------------------
// 1. GET THEATRE BUSINESS PROFILE
// ------------------------------------------------------------------------------
export const getTheatreBusinessProfileAction = createProtectedAction<
  z.input<typeof GetTheatreBusinessInputSchema>,
  TheatreBusinessProfileWithDetails | null
>(
  {
    actionName: "getTheatreBusinessProfileAction",
    schema: GetTheatreBusinessInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_BUSINESS",
    auditAction: "READ",
  },
  async (input, context) => {
    return await theatreBusinessService.getBusinessProfile(input.theatreId, context.actor);
  }
);

// ------------------------------------------------------------------------------
// 2. GET THEATRE BUSINESS BUNDLE (Aggregate of profile, registration, tax, docs)
// ------------------------------------------------------------------------------
export const getTheatreBusinessBundleAction = createProtectedAction<
  z.input<typeof GetTheatreBusinessInputSchema>,
  TheatreBusinessBundle
>(
  {
    actionName: "getTheatreBusinessBundleAction",
    schema: GetTheatreBusinessInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_BUSINESS",
    auditAction: "READ",
  },
  async (input, context) => {
    return await theatreBusinessService.getBusinessBundle(input.theatreId, context.actor);
  }
);

// ------------------------------------------------------------------------------
// 3. CREATE THEATRE BUSINESS PROFILE
// ------------------------------------------------------------------------------
export const createTheatreBusinessProfileAction = createProtectedAction<
  z.input<typeof CreateTheatreBusinessProfileSchema>,
  TheatreBusinessProfileWithDetails
>(
  {
    actionName: "createTheatreBusinessProfileAction",
    schema: CreateTheatreBusinessProfileSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_BUSINESS",
    auditAction: "CREATE",
  },
  async (input, context) => {
    const profile = await theatreBusinessService.createBusinessProfile(input, context.actor);
    revalidateBusinessPaths(input.theatreId);
    return profile;
  }
);

// ------------------------------------------------------------------------------
// 4. UPDATE THEATRE BUSINESS PROFILE
// ------------------------------------------------------------------------------
export const updateTheatreBusinessProfileAction = createProtectedAction<
  z.input<typeof UpdateTheatreBusinessProfileSchema>,
  TheatreBusinessProfileWithDetails
>(
  {
    actionName: "updateTheatreBusinessProfileAction",
    schema: UpdateTheatreBusinessProfileSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_BUSINESS",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const profile = await theatreBusinessService.updateBusinessProfile(input, context.actor);
    revalidateBusinessPaths(input.theatreId);
    return profile;
  }
);

// ------------------------------------------------------------------------------
// 5. UPDATE TAX CONFIGURATION
// ------------------------------------------------------------------------------
export const updateTheatreTaxConfigurationAction = createProtectedAction<
  z.input<typeof UpdateTheatreTaxConfigurationSchema>,
  TheatreTaxConfigurationRecord
>(
  {
    actionName: "updateTheatreTaxConfigurationAction",
    schema: UpdateTheatreTaxConfigurationSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_TAX_CONFIGURATION",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const taxConfig = await theatreBusinessService.updateTaxConfiguration(input, context.actor);
    revalidateBusinessPaths(input.theatreId);
    return taxConfig;
  }
);

// ------------------------------------------------------------------------------
// 6. UPDATE INVOICE CONFIGURATION
// ------------------------------------------------------------------------------
export const updateTheatreInvoiceConfigurationAction = createProtectedAction<
  z.input<typeof UpdateTheatreInvoiceConfigurationSchema>,
  TheatreInvoiceConfigurationRecord
>(
  {
    actionName: "updateTheatreInvoiceConfigurationAction",
    schema: UpdateTheatreInvoiceConfigurationSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_INVOICE_CONFIGURATION",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const invoiceConfig = await theatreBusinessService.updateInvoiceConfiguration(input, context.actor);
    revalidateBusinessPaths(input.theatreId);
    return invoiceConfig;
  }
);

// ------------------------------------------------------------------------------
// 7. VERIFY THEATRE BUSINESS PROFILE (SUPER_ADMIN Only)
// ------------------------------------------------------------------------------
export const verifyTheatreBusinessProfileAction = createProtectedAction<
  z.input<typeof VerifyTheatreBusinessProfileSchema>,
  TheatreBusinessComplianceRecord
>(
  {
    actionName: "verifyTheatreBusinessProfileAction",
    schema: VerifyTheatreBusinessProfileSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN"], // Strict Super Admin Authority
    enforceTenantIsolation: false, // Super Admin cross-tenant oversight
    auditModule: "THEATRE_BUSINESS_COMPLIANCE",
    auditAction: "VERIFY",
  },
  async (input, context) => {
    const compliance = await theatreBusinessService.verifyBusinessProfile(input, context.actor);
    revalidateBusinessPaths(input.theatreId);
    return compliance;
  }
);

// ------------------------------------------------------------------------------
// 8. ARCHIVE THEATRE BUSINESS PROFILE
// ------------------------------------------------------------------------------
export const archiveTheatreBusinessProfileAction = createProtectedAction<
  z.input<typeof ArchiveTheatreBusinessProfileSchema>,
  TheatreBusinessProfileRecord
>(
  {
    actionName: "archiveTheatreBusinessProfileAction",
    schema: ArchiveTheatreBusinessProfileSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_BUSINESS",
    auditAction: "ARCHIVE",
  },
  async (input, context) => {
    const archived = await theatreBusinessService.archiveBusinessProfile(input, context.actor);
    revalidateBusinessPaths(input.theatreId);
    return archived;
  }
);

// ------------------------------------------------------------------------------
// 9. ADD COMPLIANCE DOCUMENT
// ------------------------------------------------------------------------------
export const addTheatreBusinessDocumentAction = createProtectedAction<
  z.input<typeof AddTheatreBusinessDocumentSchema>,
  TheatreBusinessDocumentRecord
>(
  {
    actionName: "addTheatreBusinessDocumentAction",
    schema: AddTheatreBusinessDocumentSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_BUSINESS_DOCUMENT",
    auditAction: "CREATE",
  },
  async (input, context) => {
    const doc = await theatreBusinessService.addDocument(input, context.actor);
    revalidateBusinessPaths(input.theatreId);
    return doc;
  }
);

// ------------------------------------------------------------------------------
// 10. DELETE COMPLIANCE DOCUMENT
// ------------------------------------------------------------------------------
export const deleteTheatreBusinessDocumentAction = createProtectedAction<
  z.input<typeof DeleteTheatreBusinessDocumentSchema>,
  { success: boolean }
>(
  {
    actionName: "deleteTheatreBusinessDocumentAction",
    schema: DeleteTheatreBusinessDocumentSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_BUSINESS_DOCUMENT",
    auditAction: "DELETE",
  },
  async (input, context) => {
    await theatreBusinessService.deleteDocument(input, context.actor);
    revalidateBusinessPaths(input.theatreId);
    return { success: true };
  }
);
