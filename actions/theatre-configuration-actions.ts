"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { theatreConfigurationService } from "@/lib/services/theatre-configuration.service";
import {
  CreateTheatreConfigurationSchema,
  UpdateLocalizationConfigSchema,
  UpdateBookingConfigSchema,
  UpdateCancellationConfigSchema,
  UpdateRefundConfigSchema,
  UpdateAgeRestrictionConfigSchema,
  UpdateFeatureFlagsSchema,
  UpdateConfigurationTermsSchema,
  PublishTheatreConfigurationSchema,
  RestoreConfigurationVersionSchema,
} from "@/lib/validation/theatre-configuration.validation";
import type {
  TheatreConfigurationRecord,
  LocalizationConfigurationRecord,
  BookingConfigurationRecord,
  CancellationConfigurationRecord,
  RefundConfigurationRecord,
  AgeRestrictionConfigurationRecord,
  FeatureFlagConfigurationRecord,
  ConfigurationTermsRecord,
  TheatreConfigurationBundle,
} from "@/types/theatre-configuration.types";

/**
 * ==============================================================================
 * CineSphere OS — Dynamic Theatre Configuration Actions (Phase 3 – Part 9)
 * ==============================================================================
 * Protected server actions: Auth -> RBAC -> Tenant Isolation -> Input Sanitization
 * -> Zod Validation -> Rate Limiting -> Audit Logging -> Cache Invalidation
 * ==============================================================================
 */

const GetTheatreConfigInputSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
});

function revalidateConfigPaths(theatreId: string) {
  revalidatePath("/theatre/configuration");
  revalidatePath("/theatre/settings");
  revalidatePath("/theatre/profile");
  revalidatePath("/theatre/shows");
  revalidatePath("/theatre/pricing");
  revalidatePath("/dashboard/theatres");
  revalidatePath(`/dashboard/theatres/${theatreId}`);
  revalidatePath(`/theatre/${theatreId}`);
}

// ------------------------------------------------------------------------------
// 1. GET THEATRE CONFIGURATION BUNDLE
// ------------------------------------------------------------------------------
export const getTheatreConfigurationBundleAction = createProtectedAction<
  z.input<typeof GetTheatreConfigInputSchema>,
  TheatreConfigurationBundle
>(
  {
    actionName: "getTheatreConfigurationBundleAction",
    schema: GetTheatreConfigInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONFIGURATION",
    auditAction: "READ",
  },
  async (input, context) => {
    return await theatreConfigurationService.getConfigurationBundle(input.theatreId, context.actor);
  }
);

// ------------------------------------------------------------------------------
// 2. CREATE / UPSERT THEATRE CONFIGURATION
// ------------------------------------------------------------------------------
export const upsertTheatreConfigurationAction = createProtectedAction<
  z.input<typeof CreateTheatreConfigurationSchema>,
  TheatreConfigurationBundle
>(
  {
    actionName: "upsertTheatreConfigurationAction",
    schema: CreateTheatreConfigurationSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONFIGURATION",
    auditAction: "CREATE",
  },
  async (input, context) => {
    const bundle = await theatreConfigurationService.upsertConfiguration(input, context.actor);
    revalidateConfigPaths(input.theatreId);
    return bundle;
  }
);

// ------------------------------------------------------------------------------
// 3. PUBLISH CONFIGURATION
// ------------------------------------------------------------------------------
export const publishTheatreConfigurationAction = createProtectedAction<
  z.input<typeof PublishTheatreConfigurationSchema>,
  TheatreConfigurationRecord
>(
  {
    actionName: "publishTheatreConfigurationAction",
    schema: PublishTheatreConfigurationSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONFIGURATION",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const published = await theatreConfigurationService.publishConfiguration(input, context.actor);
    revalidateConfigPaths(input.theatreId);
    return published;
  }
);

// ------------------------------------------------------------------------------
// 4. RESTORE CONFIGURATION VERSION
// ------------------------------------------------------------------------------
export const restoreConfigurationVersionAction = createProtectedAction<
  z.input<typeof RestoreConfigurationVersionSchema>,
  TheatreConfigurationBundle
>(
  {
    actionName: "restoreConfigurationVersionAction",
    schema: RestoreConfigurationVersionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONFIGURATION",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const restored = await theatreConfigurationService.restoreVersion(input, context.actor);
    revalidateConfigPaths(input.theatreId);
    return restored;
  }
);

// ------------------------------------------------------------------------------
// 5. VALIDATE THEATRE CONFIGURATION ACTION
// ------------------------------------------------------------------------------
export const validateTheatreConfigurationAction = createProtectedAction<
  z.input<typeof CreateTheatreConfigurationSchema>,
  { valid: boolean; errors?: Record<string, string[]> }
>(
  {
    actionName: "validateTheatreConfigurationAction",
    schema: CreateTheatreConfigurationSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONFIGURATION",
    auditAction: "READ",
  },
  async (input) => {
    const parsed = CreateTheatreConfigurationSchema.safeParse(input);
    if (!parsed.success) {
      const errMap: Record<string, string[]> = {};
      parsed.error.issues.forEach((iss) => {
        const path = iss.path.join(".") || "root";
        if (!errMap[path]) errMap[path] = [];
        errMap[path].push(iss.message);
      });
      return { valid: false, errors: errMap };
    }
    return { valid: true };
  }
);

// ------------------------------------------------------------------------------
// 6. UPDATE SUB-DOMAIN CONFIGURATIONS
// ------------------------------------------------------------------------------
export const updateLocalizationConfigAction = createProtectedAction<
  z.input<typeof UpdateLocalizationConfigSchema>,
  LocalizationConfigurationRecord
>(
  {
    actionName: "updateLocalizationConfigAction",
    schema: UpdateLocalizationConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONFIGURATION",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const loc = await theatreConfigurationService.updateLocalization(input, context.actor);
    revalidateConfigPaths(input.theatreId);
    return loc;
  }
);

export const updateBookingConfigAction = createProtectedAction<
  z.input<typeof UpdateBookingConfigSchema>,
  BookingConfigurationRecord
>(
  {
    actionName: "updateBookingConfigAction",
    schema: UpdateBookingConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONFIGURATION",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const bk = await theatreConfigurationService.updateBooking(input, context.actor);
    revalidateConfigPaths(input.theatreId);
    return bk;
  }
);

export const updateCancellationConfigAction = createProtectedAction<
  z.input<typeof UpdateCancellationConfigSchema>,
  CancellationConfigurationRecord
>(
  {
    actionName: "updateCancellationConfigAction",
    schema: UpdateCancellationConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONFIGURATION",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const cnc = await theatreConfigurationService.updateCancellation(input, context.actor);
    revalidateConfigPaths(input.theatreId);
    return cnc;
  }
);

export const updateRefundConfigAction = createProtectedAction<
  z.input<typeof UpdateRefundConfigSchema>,
  RefundConfigurationRecord
>(
  {
    actionName: "updateRefundConfigAction",
    schema: UpdateRefundConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONFIGURATION",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const ref = await theatreConfigurationService.updateRefund(input, context.actor);
    revalidateConfigPaths(input.theatreId);
    return ref;
  }
);

export const updateAgeRestrictionConfigAction = createProtectedAction<
  z.input<typeof UpdateAgeRestrictionConfigSchema>,
  AgeRestrictionConfigurationRecord
>(
  {
    actionName: "updateAgeRestrictionConfigAction",
    schema: UpdateAgeRestrictionConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONFIGURATION",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const age = await theatreConfigurationService.updateAgeRestriction(input, context.actor);
    revalidateConfigPaths(input.theatreId);
    return age;
  }
);

export const updateFeatureFlagsAction = createProtectedAction<
  z.input<typeof UpdateFeatureFlagsSchema>,
  FeatureFlagConfigurationRecord
>(
  {
    actionName: "updateFeatureFlagsAction",
    schema: UpdateFeatureFlagsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONFIGURATION",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const ff = await theatreConfigurationService.updateFeatureFlags(input, context.actor);
    revalidateConfigPaths(input.theatreId);
    return ff;
  }
);

export const updateConfigurationTermsAction = createProtectedAction<
  z.input<typeof UpdateConfigurationTermsSchema>,
  ConfigurationTermsRecord
>(
  {
    actionName: "updateConfigurationTermsAction",
    schema: UpdateConfigurationTermsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_CONFIGURATION",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const trm = await theatreConfigurationService.updateTerms(input, context.actor);
    revalidateConfigPaths(input.theatreId);
    return trm;
  }
);
