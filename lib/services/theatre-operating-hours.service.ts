import { createLogger } from "@/lib/observability/structured-logger";
import { securityAuditService } from "@/lib/services/security-audit.service";
import { tenantService } from "@/lib/services/tenant.service";
import { theatreOperatingHoursRepository } from "@/lib/repositories/theatre-operating-hours.repository";
import { invalidateCacheByTag, CACHE_TAGS } from "@/lib/performance/cache-strategy";
import {
  ValidationError,
  NotFoundError,
} from "@/lib/errors/app-error";
import { sanitizeString } from "@/lib/security/input-sanitizer";
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
  TheatreOperatingProfileVersionRecord,
  TheatreOperatingBundle,
  UpsertTheatreOperatingProfileInput,
  UpsertWeeklyScheduleInput,
  AddHolidayScheduleInput,
  UpdateHolidayScheduleInput,
  DeleteHolidayScheduleInput,
  AddMaintenanceScheduleInput,
  UpdateMaintenanceScheduleInput,
  DeleteMaintenanceScheduleInput,
  AddSpecialOperatingEventInput,
  UpdateSpecialOperatingEventInput,
  DeleteSpecialOperatingEventInput,
} from "@/types/theatre-operating-hours.types";
import type { SecurityActorContext } from "@/types/security-hardening.types";
import type { ZodIssue } from "zod";

const logger = createLogger("TheatreOperatingHoursService");

function formatZodIssues(issues: ZodIssue[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const issue of issues) {
    const path = issue.path.join(".") || "root";
    if (!result[path]) result[path] = [];
    result[path].push(issue.message);
  }
  return result;
}

export class TheatreOperatingHoursService {
  private invalidateOperatingCache(theatreId: string): void {
    invalidateCacheByTag(CACHE_TAGS.THEATRE_OPERATING_HOURS(theatreId));
    invalidateCacheByTag(CACHE_TAGS.PUBLIC_THEATRE_OPERATING_HOURS(theatreId));
  }

  // ----------------------------------------------------------------------------
  // Query Bundle
  // ----------------------------------------------------------------------------
  public async getOperatingBundle(
    theatreId: string,
    actor?: SecurityActorContext
  ): Promise<TheatreOperatingBundle> {
    const correlationId = actor?.correlationId || `corr-op-bundle-${Date.now()}`;
    logger.info("API", "Fetching theatre operating bundle", {
      correlationId,
      theatreId,
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }

    return await theatreOperatingHoursRepository.findBundle(theatreId);
  }

  // ----------------------------------------------------------------------------
  // Profile Mutations
  // ----------------------------------------------------------------------------
  public async upsertOperatingProfile(
    input: UpsertTheatreOperatingProfileInput,
    actor?: SecurityActorContext
  ): Promise<TheatreOperatingProfileRecord> {
    const correlationId = actor?.correlationId || `corr-op-upsert-${Date.now()}`;
    logger.info("API", "Upserting theatre operating profile", {
      correlationId,
      theatreId: input.theatreId,
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = UpsertTheatreOperatingProfileSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid operating profile payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const data = parsed.data;
    const profile = await theatreOperatingHoursRepository.upsertProfile(
      data.theatreId,
      data,
      actor?.userId || "system",
      actor?.role || "THEATRE_ADMIN"
    );

    this.invalidateOperatingCache(data.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_OPERATING_HOURS",
        action: "UPDATE",
        description: `Updated regular operating hours (${profile.regularOpeningTime} - ${profile.regularClosingTime})`,
        metadata: {
          theatreId: data.theatreId,
          timezone: profile.timezone,
          openingTime: profile.regularOpeningTime,
          closingTime: profile.regularClosingTime,
        },
      });
    }

    return profile;
  }

  // ----------------------------------------------------------------------------
  // Weekly Schedules
  // ----------------------------------------------------------------------------
  public async upsertWeeklySchedule(
    input: UpsertWeeklyScheduleInput,
    actor?: SecurityActorContext
  ): Promise<TheatreWeeklyScheduleRecord[]> {
    const correlationId = actor?.correlationId || `corr-op-weekly-${Date.now()}`;
    logger.info("API", "Updating weekly operating schedule", {
      correlationId,
      theatreId: input.theatreId,
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = UpsertWeeklyScheduleSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid weekly schedule payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const schedules = await theatreOperatingHoursRepository.upsertWeeklySchedule(
      parsed.data.theatreId,
      parsed.data,
      actor?.userId || "system",
      actor?.role || "THEATRE_ADMIN"
    );

    this.invalidateOperatingCache(parsed.data.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_OPERATING_HOURS",
        action: "UPDATE",
        description: `Updated weekly schedule for ${schedules.length} days`,
        metadata: {
          theatreId: parsed.data.theatreId,
          dayCount: schedules.length,
        },
      });
    }

    return schedules;
  }

  // ----------------------------------------------------------------------------
  // Holiday Calendar
  // ----------------------------------------------------------------------------
  public async addHoliday(
    input: AddHolidayScheduleInput,
    actor?: SecurityActorContext
  ): Promise<TheatreHolidayScheduleRecord> {
    const correlationId = actor?.correlationId || `corr-op-hol-add-${Date.now()}`;
    logger.info("API", "Adding holiday schedule", {
      correlationId,
      theatreId: input.theatreId,
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = AddHolidayScheduleSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid holiday schedule payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const holiday = await theatreOperatingHoursRepository.addHoliday(
      {
        ...parsed.data,
        holidayName: sanitizeString(parsed.data.holidayName),
        notes: parsed.data.notes ? sanitizeString(parsed.data.notes) : null,
      },
      actor?.userId || "system",
      actor?.role || "THEATRE_ADMIN"
    );

    this.invalidateOperatingCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_OPERATING_HOURS",
        action: "CREATE",
        description: `Added holiday '${holiday.holidayName}' on ${holiday.holidayDate}`,
        metadata: {
          theatreId: input.theatreId,
          holidayId: holiday.id,
          holidayName: holiday.holidayName,
          holidayDate: holiday.holidayDate,
        },
      });
    }

    return holiday;
  }

  public async updateHoliday(
    input: UpdateHolidayScheduleInput,
    actor?: SecurityActorContext
  ): Promise<TheatreHolidayScheduleRecord> {
    const correlationId = actor?.correlationId || `corr-op-hol-upd-${Date.now()}`;
    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = UpdateHolidayScheduleSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid holiday update payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const updated = await theatreOperatingHoursRepository.updateHoliday(
      {
        ...parsed.data,
        holidayName: parsed.data.holidayName ? sanitizeString(parsed.data.holidayName) : undefined,
        notes: parsed.data.notes !== undefined ? (parsed.data.notes ? sanitizeString(parsed.data.notes) : null) : undefined,
      },
      actor?.userId || "system",
      actor?.role || "THEATRE_ADMIN"
    );

    if (!updated) {
      throw new NotFoundError(`Holiday '${input.holidayId}' not found.`, correlationId);
    }

    this.invalidateOperatingCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_OPERATING_HOURS",
        action: "UPDATE",
        description: `Updated holiday '${updated.holidayName}'`,
        metadata: {
          theatreId: input.theatreId,
          holidayId: updated.id,
        },
      });
    }

    return updated;
  }

  public async deleteHoliday(
    input: DeleteHolidayScheduleInput,
    actor?: SecurityActorContext
  ): Promise<boolean> {
    const correlationId = actor?.correlationId || `corr-op-hol-del-${Date.now()}`;
    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = DeleteHolidayScheduleSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid holiday delete payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const success = await theatreOperatingHoursRepository.deleteHoliday(input.theatreId, input.holidayId);
    if (!success) {
      throw new NotFoundError(`Holiday '${input.holidayId}' not found.`, correlationId);
    }

    this.invalidateOperatingCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_OPERATING_HOURS",
        action: "DELETE",
        description: `Deleted holiday '${input.holidayId}'`,
        metadata: {
          theatreId: input.theatreId,
          holidayId: input.holidayId,
        },
      });
    }

    return true;
  }

  // ----------------------------------------------------------------------------
  // Maintenance Schedule
  // ----------------------------------------------------------------------------
  public async addMaintenance(
    input: AddMaintenanceScheduleInput,
    actor?: SecurityActorContext
  ): Promise<TheatreMaintenanceScheduleRecord> {
    const correlationId = actor?.correlationId || `corr-op-maint-add-${Date.now()}`;
    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = AddMaintenanceScheduleSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid maintenance payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const maint = await theatreOperatingHoursRepository.addMaintenance(
      {
        ...parsed.data,
        reason: sanitizeString(parsed.data.reason),
      },
      actor?.userId || "system",
      actor?.role || "THEATRE_ADMIN"
    );

    this.invalidateOperatingCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_OPERATING_HOURS",
        action: "CREATE",
        description: `Scheduled maintenance on ${maint.maintenanceDate}: ${maint.reason}`,
        metadata: {
          theatreId: input.theatreId,
          maintenanceId: maint.id,
          date: maint.maintenanceDate,
        },
      });
    }

    return maint;
  }

  public async updateMaintenance(
    input: UpdateMaintenanceScheduleInput,
    actor?: SecurityActorContext
  ): Promise<TheatreMaintenanceScheduleRecord> {
    const correlationId = actor?.correlationId || `corr-op-maint-upd-${Date.now()}`;
    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = UpdateMaintenanceScheduleSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid maintenance update payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const updated = await theatreOperatingHoursRepository.updateMaintenance(
      {
        ...parsed.data,
        reason: parsed.data.reason ? sanitizeString(parsed.data.reason) : undefined,
      },
      actor?.userId || "system",
      actor?.role || "THEATRE_ADMIN"
    );

    if (!updated) {
      throw new NotFoundError(`Maintenance window '${input.maintenanceId}' not found.`, correlationId);
    }

    this.invalidateOperatingCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_OPERATING_HOURS",
        action: "UPDATE",
        description: `Updated maintenance window '${updated.id}'`,
        metadata: {
          theatreId: input.theatreId,
          maintenanceId: updated.id,
        },
      });
    }

    return updated;
  }

  public async deleteMaintenance(
    input: DeleteMaintenanceScheduleInput,
    actor?: SecurityActorContext
  ): Promise<boolean> {
    const correlationId = actor?.correlationId || `corr-op-maint-del-${Date.now()}`;
    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = DeleteMaintenanceScheduleSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid maintenance delete payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const success = await theatreOperatingHoursRepository.deleteMaintenance(input.theatreId, input.maintenanceId);
    if (!success) {
      throw new NotFoundError(`Maintenance window '${input.maintenanceId}' not found.`, correlationId);
    }

    this.invalidateOperatingCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_OPERATING_HOURS",
        action: "DELETE",
        description: `Deleted maintenance window '${input.maintenanceId}'`,
        metadata: {
          theatreId: input.theatreId,
          maintenanceId: input.maintenanceId,
        },
      });
    }

    return true;
  }

  // ----------------------------------------------------------------------------
  // Special Operating Events
  // ----------------------------------------------------------------------------
  public async addSpecialEvent(
    input: AddSpecialOperatingEventInput,
    actor?: SecurityActorContext
  ): Promise<TheatreSpecialOperatingEventRecord> {
    const correlationId = actor?.correlationId || `corr-op-ev-add-${Date.now()}`;
    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = AddSpecialOperatingEventSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid special event payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const ev = await theatreOperatingHoursRepository.addSpecialEvent(
      {
        ...parsed.data,
        eventName: sanitizeString(parsed.data.eventName),
        notes: parsed.data.notes ? sanitizeString(parsed.data.notes) : null,
      },
      actor?.userId || "system",
      actor?.role || "THEATRE_ADMIN"
    );

    this.invalidateOperatingCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_OPERATING_HOURS",
        action: "CREATE",
        description: `Scheduled special event '${ev.eventName}' (${ev.startDate} to ${ev.endDate})`,
        metadata: {
          theatreId: input.theatreId,
          eventId: ev.id,
          eventName: ev.eventName,
        },
      });
    }

    return ev;
  }

  public async updateSpecialEvent(
    input: UpdateSpecialOperatingEventInput,
    actor?: SecurityActorContext
  ): Promise<TheatreSpecialOperatingEventRecord> {
    const correlationId = actor?.correlationId || `corr-op-ev-upd-${Date.now()}`;
    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = UpdateSpecialOperatingEventSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid special event update payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const updated = await theatreOperatingHoursRepository.updateSpecialEvent(
      {
        ...parsed.data,
        eventName: parsed.data.eventName ? sanitizeString(parsed.data.eventName) : undefined,
        notes: parsed.data.notes !== undefined ? (parsed.data.notes ? sanitizeString(parsed.data.notes) : null) : undefined,
      },
      actor?.userId || "system",
      actor?.role || "THEATRE_ADMIN"
    );

    if (!updated) {
      throw new NotFoundError(`Special event '${input.eventId}' not found.`, correlationId);
    }

    this.invalidateOperatingCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_OPERATING_HOURS",
        action: "UPDATE",
        description: `Updated special event '${updated.eventName}'`,
        metadata: {
          theatreId: input.theatreId,
          eventId: updated.id,
        },
      });
    }

    return updated;
  }

  public async deleteSpecialEvent(
    input: DeleteSpecialOperatingEventInput,
    actor?: SecurityActorContext
  ): Promise<boolean> {
    const correlationId = actor?.correlationId || `corr-op-ev-del-${Date.now()}`;
    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = DeleteSpecialOperatingEventSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid special event delete payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const success = await theatreOperatingHoursRepository.deleteSpecialEvent(input.theatreId, input.eventId);
    if (!success) {
      throw new NotFoundError(`Special event '${input.eventId}' not found.`, correlationId);
    }

    this.invalidateOperatingCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_OPERATING_HOURS",
        action: "DELETE",
        description: `Deleted special event '${input.eventId}'`,
        metadata: {
          theatreId: input.theatreId,
          eventId: input.eventId,
        },
      });
    }

    return true;
  }

  // ----------------------------------------------------------------------------
  // Versions
  // ----------------------------------------------------------------------------
  public async getVersions(
    theatreId: string,
    actor?: SecurityActorContext
  ): Promise<TheatreOperatingProfileVersionRecord[]> {
    if (actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }
    return await theatreOperatingHoursRepository.getVersions(theatreId);
  }

  // Convenient Aliases
  public addHolidaySchedule = this.addHoliday;
  public updateHolidaySchedule = this.updateHoliday;
  public deleteHolidaySchedule = this.deleteHoliday;
  public addMaintenanceSchedule = this.addMaintenance;
  public updateMaintenanceSchedule = this.updateMaintenance;
  public deleteMaintenanceSchedule = this.deleteMaintenance;
  public addSpecialOperatingEvent = this.addSpecialEvent;
  public updateSpecialOperatingEvent = this.updateSpecialEvent;
  public deleteSpecialOperatingEvent = this.deleteSpecialEvent;
}

export const theatreOperatingHoursService = new TheatreOperatingHoursService();
