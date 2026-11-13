"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { theatreOperatingHoursService } from "@/lib/services/theatre-operating-hours.service";
import {
  UpsertTheatreOperatingProfileSchema,
  UpsertWeeklyScheduleSchema,
  AddHolidayScheduleSchema,
  UpdateHolidayScheduleSchema,
  DeleteHolidayScheduleSchema,
  AddMaintenanceScheduleSchema,
  UpdateMaintenanceScheduleSchema,
  DeleteMaintenanceScheduleSchema,
  AddSpecialOperatingEventSchema,
  UpdateSpecialOperatingEventSchema,
  DeleteSpecialOperatingEventSchema,
} from "@/lib/validation/theatre-operating-hours.validation";
import type {
  TheatreOperatingProfileRecord,
  TheatreWeeklyScheduleRecord,
  TheatreHolidayScheduleRecord,
  TheatreMaintenanceScheduleRecord,
  TheatreSpecialOperatingEventRecord,
  TheatreOperatingBundle,
} from "@/types/theatre-operating-hours.types";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Operating Hours Actions (Phase 3 – Part 8)
 * ==============================================================================
 * Protected server actions: Auth -> RBAC -> Tenant Isolation -> Input Sanitization
 * -> Zod Validation -> Rate Limiting -> Audit Logging -> Cache Invalidation
 * ==============================================================================
 */

const GetTheatreOperatingInputSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
});

function revalidateOperatingPaths(theatreId: string) {
  revalidatePath("/theatre/operating-hours");
  revalidatePath("/theatre/settings");
  revalidatePath("/theatre/profile");
  revalidatePath("/theatre/shows");
  revalidatePath("/dashboard/theatres");
  revalidatePath(`/dashboard/theatres/${theatreId}`);
  revalidatePath(`/theatre/${theatreId}`);
}

// ------------------------------------------------------------------------------
// 1. GET THEATRE OPERATING BUNDLE
// ------------------------------------------------------------------------------
export const getTheatreOperatingBundleAction = createProtectedAction<
  z.input<typeof GetTheatreOperatingInputSchema>,
  TheatreOperatingBundle
>(
  {
    actionName: "getTheatreOperatingBundleAction",
    schema: GetTheatreOperatingInputSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_OPERATING_HOURS",
    auditAction: "READ",
  },
  async (input, context) => {
    return await theatreOperatingHoursService.getOperatingBundle(input.theatreId, context.actor);
  }
);

// ------------------------------------------------------------------------------
// 2. UPSERT OPERATING PROFILE (Regular Hours & Timezone)
// ------------------------------------------------------------------------------
export const upsertTheatreOperatingProfileAction = createProtectedAction<
  z.input<typeof UpsertTheatreOperatingProfileSchema>,
  TheatreOperatingProfileRecord
>(
  {
    actionName: "upsertTheatreOperatingProfileAction",
    schema: UpsertTheatreOperatingProfileSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_OPERATING_HOURS",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const profile = await theatreOperatingHoursService.upsertOperatingProfile(input, context.actor);
    revalidateOperatingPaths(input.theatreId);
    return profile;
  }
);

// ------------------------------------------------------------------------------
// 3. UPSERT WEEKLY SCHEDULE
// ------------------------------------------------------------------------------
export const upsertWeeklyScheduleAction = createProtectedAction<
  z.input<typeof UpsertWeeklyScheduleSchema>,
  TheatreWeeklyScheduleRecord[]
>(
  {
    actionName: "upsertWeeklyScheduleAction",
    schema: UpsertWeeklyScheduleSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_OPERATING_HOURS",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const schedules = await theatreOperatingHoursService.upsertWeeklySchedule(input, context.actor);
    revalidateOperatingPaths(input.theatreId);
    return schedules;
  }
);

// ------------------------------------------------------------------------------
// 4. HOLIDAY SCHEDULE ACTIONS
// ------------------------------------------------------------------------------
export const addHolidayScheduleAction = createProtectedAction<
  z.input<typeof AddHolidayScheduleSchema>,
  TheatreHolidayScheduleRecord
>(
  {
    actionName: "addHolidayScheduleAction",
    schema: AddHolidayScheduleSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_OPERATING_HOURS",
    auditAction: "CREATE",
  },
  async (input, context) => {
    const holiday = await theatreOperatingHoursService.addHoliday(input, context.actor);
    revalidateOperatingPaths(input.theatreId);
    return holiday;
  }
);

export const updateHolidayScheduleAction = createProtectedAction<
  z.input<typeof UpdateHolidayScheduleSchema>,
  TheatreHolidayScheduleRecord
>(
  {
    actionName: "updateHolidayScheduleAction",
    schema: UpdateHolidayScheduleSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_OPERATING_HOURS",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const holiday = await theatreOperatingHoursService.updateHoliday(input, context.actor);
    revalidateOperatingPaths(input.theatreId);
    return holiday;
  }
);

export const deleteHolidayScheduleAction = createProtectedAction<
  z.input<typeof DeleteHolidayScheduleSchema>,
  { success: boolean }
>(
  {
    actionName: "deleteHolidayScheduleAction",
    schema: DeleteHolidayScheduleSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_OPERATING_HOURS",
    auditAction: "DELETE",
  },
  async (input, context) => {
    await theatreOperatingHoursService.deleteHoliday(input, context.actor);
    revalidateOperatingPaths(input.theatreId);
    return { success: true };
  }
);

// ------------------------------------------------------------------------------
// 5. MAINTENANCE SCHEDULE ACTIONS
// ------------------------------------------------------------------------------
export const addMaintenanceScheduleAction = createProtectedAction<
  z.input<typeof AddMaintenanceScheduleSchema>,
  TheatreMaintenanceScheduleRecord
>(
  {
    actionName: "addMaintenanceScheduleAction",
    schema: AddMaintenanceScheduleSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_OPERATING_HOURS",
    auditAction: "CREATE",
  },
  async (input, context) => {
    const maint = await theatreOperatingHoursService.addMaintenance(input, context.actor);
    revalidateOperatingPaths(input.theatreId);
    return maint;
  }
);

export const updateMaintenanceScheduleAction = createProtectedAction<
  z.input<typeof UpdateMaintenanceScheduleSchema>,
  TheatreMaintenanceScheduleRecord
>(
  {
    actionName: "updateMaintenanceScheduleAction",
    schema: UpdateMaintenanceScheduleSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_OPERATING_HOURS",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const maint = await theatreOperatingHoursService.updateMaintenance(input, context.actor);
    revalidateOperatingPaths(input.theatreId);
    return maint;
  }
);

export const deleteMaintenanceScheduleAction = createProtectedAction<
  z.input<typeof DeleteMaintenanceScheduleSchema>,
  { success: boolean }
>(
  {
    actionName: "deleteMaintenanceScheduleAction",
    schema: DeleteMaintenanceScheduleSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_OPERATING_HOURS",
    auditAction: "DELETE",
  },
  async (input, context) => {
    await theatreOperatingHoursService.deleteMaintenance(input, context.actor);
    revalidateOperatingPaths(input.theatreId);
    return { success: true };
  }
);

// ------------------------------------------------------------------------------
// 6. SPECIAL OPERATING EVENT ACTIONS
// ------------------------------------------------------------------------------
export const addSpecialOperatingEventAction = createProtectedAction<
  z.input<typeof AddSpecialOperatingEventSchema>,
  TheatreSpecialOperatingEventRecord
>(
  {
    actionName: "addSpecialOperatingEventAction",
    schema: AddSpecialOperatingEventSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_OPERATING_HOURS",
    auditAction: "CREATE",
  },
  async (input, context) => {
    const ev = await theatreOperatingHoursService.addSpecialEvent(input, context.actor);
    revalidateOperatingPaths(input.theatreId);
    return ev;
  }
);

export const updateSpecialOperatingEventAction = createProtectedAction<
  z.input<typeof UpdateSpecialOperatingEventSchema>,
  TheatreSpecialOperatingEventRecord
>(
  {
    actionName: "updateSpecialOperatingEventAction",
    schema: UpdateSpecialOperatingEventSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_OPERATING_HOURS",
    auditAction: "UPDATE",
  },
  async (input, context) => {
    const ev = await theatreOperatingHoursService.updateSpecialEvent(input, context.actor);
    revalidateOperatingPaths(input.theatreId);
    return ev;
  }
);

export const deleteSpecialOperatingEventAction = createProtectedAction<
  z.input<typeof DeleteSpecialOperatingEventSchema>,
  { success: boolean }
>(
  {
    actionName: "deleteSpecialOperatingEventAction",
    schema: DeleteSpecialOperatingEventSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (data) => data.theatreId,
    auditModule: "THEATRE_OPERATING_HOURS",
    auditAction: "DELETE",
  },
  async (input, context) => {
    await theatreOperatingHoursService.deleteSpecialEvent(input, context.actor);
    revalidateOperatingPaths(input.theatreId);
    return { success: true };
  }
);
