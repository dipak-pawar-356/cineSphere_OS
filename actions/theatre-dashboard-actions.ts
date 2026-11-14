"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { theatreDashboardService } from "@/lib/services/theatre-dashboard.service";
import {
  dashboardFilterSchema,
  updateUserDashboardPreferencesSchema,
  refreshDashboardSchema,
} from "@/lib/validation/theatre-dashboard.validation";
import type {
  TheatreDashboardBundle,
  UserDashboardPreferences,
  DashboardActivityItem,
  RevenueMetricsBundle,
  BookingMetricsBundle,
} from "@/types/theatre-dashboard.types";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Dashboard Server Actions (Phase 3 – Part 11)
 * ==============================================================================
 * Protected server actions enforcing:
 * Auth -> RBAC -> Tenant Isolation -> Zod Validation -> Security Audit Log
 * ==============================================================================
 */

function revalidateDashboardPaths() {
  revalidatePath("/theatre");
  revalidatePath("/theatre/dashboard");
  revalidatePath("/theatre/reports");
  revalidatePath("/theatre/analytics");
}

const LoadActivitiesInputSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  limit: z.number().int().min(1).max(50).default(10),
});

// ------------------------------------------------------------------------------
// 1. Load Aggregated Dashboard Bundle Action
// ------------------------------------------------------------------------------
export const loadTheatreDashboardAction = createProtectedAction<
  z.input<typeof dashboardFilterSchema>,
  TheatreDashboardBundle
>(
  {
    actionName: "loadTheatreDashboardAction",
    schema: dashboardFilterSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_DASHBOARD",
    auditAction: "READ",
  },
  async (input, context) => {
    return await theatreDashboardService.getDashboardBundle(input.theatreId, input, context.actor);
  }
);

// ------------------------------------------------------------------------------
// 2. Refresh Dashboard Metrics Action
// ------------------------------------------------------------------------------
export const refreshTheatreDashboardAction = createProtectedAction<
  z.input<typeof refreshDashboardSchema>,
  TheatreDashboardBundle
>(
  {
    actionName: "refreshTheatreDashboardAction",
    schema: refreshDashboardSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_DASHBOARD",
    auditAction: "REFRESH",
  },
  async (input, context) => {
    const bundle = await theatreDashboardService.refreshDashboard(
      input.theatreId,
      input.filter,
      context.actor
    );
    revalidateDashboardPaths();
    return bundle;
  }
);

// ------------------------------------------------------------------------------
// 3. Update User Dashboard Preferences Action
// ------------------------------------------------------------------------------
export const updateUserDashboardPreferencesAction = createProtectedAction<
  z.input<typeof updateUserDashboardPreferencesSchema>,
  UserDashboardPreferences
>(
  {
    actionName: "updateUserDashboardPreferencesAction",
    schema: updateUserDashboardPreferencesSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_DASHBOARD",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const updated = await theatreDashboardService.updateUserPreferences(input, context.actor);
    revalidateDashboardPaths();
    return updated;
  }
);

// ------------------------------------------------------------------------------
// 4. Load Dashboard Activity Feed Action
// ------------------------------------------------------------------------------
export const loadDashboardActivitiesAction = createProtectedAction<
  z.input<typeof LoadActivitiesInputSchema>,
  DashboardActivityItem[]
>(
  {
    actionName: "loadDashboardActivitiesAction",
    schema: LoadActivitiesInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_DASHBOARD",
    auditAction: "READ",
  },
  async (input, context) => {
    const bundle = await theatreDashboardService.getDashboardBundle(
      input.theatreId,
      undefined,
      context.actor
    );
    return bundle.activities.slice(0, input.limit || 10);
  }
);

// ------------------------------------------------------------------------------
// 5. Load Revenue Summary Action
// ------------------------------------------------------------------------------
export const loadRevenueSummaryAction = createProtectedAction<
  z.input<typeof dashboardFilterSchema>,
  RevenueMetricsBundle
>(
  {
    actionName: "loadRevenueSummaryAction",
    schema: dashboardFilterSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_DASHBOARD",
    auditAction: "READ",
  },
  async (input, context) => {
    const bundle = await theatreDashboardService.getDashboardBundle(
      input.theatreId,
      input,
      context.actor
    );
    return bundle.revenue;
  }
);

// ------------------------------------------------------------------------------
// 6. Load Booking Summary Action
// ------------------------------------------------------------------------------
export const loadBookingSummaryAction = createProtectedAction<
  z.input<typeof dashboardFilterSchema>,
  BookingMetricsBundle
>(
  {
    actionName: "loadBookingSummaryAction",
    schema: dashboardFilterSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_DASHBOARD",
    auditAction: "READ",
  },
  async (input, context) => {
    const bundle = await theatreDashboardService.getDashboardBundle(
      input.theatreId,
      input,
      context.actor
    );
    return bundle.bookings;
  }
);
