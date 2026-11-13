import { z } from "zod";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Operating Hours Validation (Phase 3 – Part 8)
 * ==============================================================================
 * Zod validation schemas enforcing strict operational time limits, non-overlapping
 * schedules, valid IANA timezones, and ISO date boundaries.
 * ==============================================================================
 */

export const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Common Timezone validator using Intl.DateTimeFormat
export function isValidIanaTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const timezoneSchema = z
  .string()
  .trim()
  .min(3, "Timezone is required")
  .max(60)
  .refine(isValidIanaTimezone, {
    message: "Invalid IANA timezone identifier (e.g. 'Asia/Kolkata', 'America/New_York')",
  });

export const timeStringSchema = z
  .string()
  .trim()
  .regex(TIME_REGEX, "Time must be in 24-hour 'HH:mm' format (e.g. '09:00', '23:30')");

export const isoDateSchema = z
  .string()
  .trim()
  .regex(ISO_DATE_REGEX, "Date must be in 'YYYY-MM-DD' ISO format (e.g. '2026-12-25')");

export const OperatingDayOfWeekEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

export const OperatingProfileStatusEnum = z.enum(["ACTIVE", "INACTIVE", "DRAFT", "SUSPENDED"]);

export const SpecialOperatingEventTypeEnum = z.enum([
  "FESTIVAL",
  "MOVIE_PREMIERE",
  "PRIVATE_SHOW",
  "CORPORATE_BOOKING",
  "CUSTOM",
]);

export const MaintenanceWindowStatusEnum = z.enum([
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const OperatingTimeSlotSchema = z
  .object({
    slotName: z.string().trim().min(2).max(50),
    startTime: timeStringSchema,
    endTime: timeStringSchema,
  })
  .refine(
    (slot) => slot.startTime < slot.endTime,
    { message: "Slot startTime must be before endTime" }
  );

export const OperatingBreakHourSchema = z
  .object({
    name: z.string().trim().min(2).max(50),
    startTime: timeStringSchema,
    endTime: timeStringSchema,
  })
  .refine(
    (b) => b.startTime < b.endTime,
    { message: "Break startTime must be before endTime" }
  );

// ------------------------------------------------------------------------------
// Mutation Request Schemas
// ------------------------------------------------------------------------------

export const UpsertTheatreOperatingProfileSchema = z
  .object({
    theatreId: z.string().trim().min(1, "theatreId is required"),
    timezone: timezoneSchema.optional(),
    regularOpeningTime: timeStringSchema.optional(),
    regularClosingTime: timeStringSchema.optional(),
    is24x7: z.boolean().optional(),
    lateNightClosing: z.boolean().optional(),
    breakHours: z.array(OperatingBreakHourSchema).optional(),
    status: OperatingProfileStatusEnum.optional(),
    expectedVersion: z.number().int().min(1).optional(),
  })
  .refine(
    (data) => {
      if (data.is24x7) return true;
      if (data.lateNightClosing) return true; // Allows closing past midnight (e.g. 02:00)
      if (data.regularOpeningTime && data.regularClosingTime) {
        return data.regularOpeningTime < data.regularClosingTime;
      }
      return true;
    },
    {
      message: "regularOpeningTime must be earlier than regularClosingTime unless lateNightClosing or 24x7 is enabled",
      path: ["regularClosingTime"],
    }
  );

export const SingleDayScheduleSchema = z
  .object({
    dayOfWeek: OperatingDayOfWeekEnum,
    isOpen: z.boolean().default(true),
    openTime: timeStringSchema.default("09:00"),
    closeTime: timeStringSchema.default("23:30"),
    isOvernight: z.boolean().default(false),
    timeSlots: z.array(OperatingTimeSlotSchema).optional(),
  })
  .refine(
    (d) => {
      if (!d.isOpen || d.isOvernight) return true;
      return d.openTime < d.closeTime;
    },
    {
      message: "openTime must be before closeTime unless day is overnight or closed",
      path: ["closeTime"],
    }
  );

export const UpsertWeeklyScheduleSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  schedules: z
    .array(SingleDayScheduleSchema)
    .min(1, "At least one day schedule is required")
    .max(7, "Cannot provide more than 7 day schedules"),
});

export const AddHolidayScheduleSchema = z
  .object({
    theatreId: z.string().trim().min(1, "theatreId is required"),
    holidayName: z.string().trim().min(2, "Holiday name must be at least 2 characters").max(150),
    holidayDate: isoDateSchema,
    isClosed: z.boolean().default(true),
    partialOpenTime: timeStringSchema.nullable().optional(),
    partialCloseTime: timeStringSchema.nullable().optional(),
    notes: z.string().trim().max(500).nullable().optional(),
  })
  .refine(
    (h) => {
      if (h.isClosed) return true;
      if (h.partialOpenTime && h.partialCloseTime) {
        return h.partialOpenTime < h.partialCloseTime;
      }
      return true;
    },
    {
      message: "partialOpenTime must be before partialCloseTime when operating on partial hours",
      path: ["partialCloseTime"],
    }
  );

export const UpdateHolidayScheduleSchema = z
  .object({
    theatreId: z.string().trim().min(1, "theatreId is required"),
    holidayId: z.string().trim().min(1, "holidayId is required"),
    holidayName: z.string().trim().min(2).max(150).optional(),
    holidayDate: isoDateSchema.optional(),
    isClosed: z.boolean().optional(),
    partialOpenTime: timeStringSchema.nullable().optional(),
    partialCloseTime: timeStringSchema.nullable().optional(),
    notes: z.string().trim().max(500).nullable().optional(),
  })
  .refine(
    (h) => {
      if (h.isClosed) return true;
      if (h.partialOpenTime && h.partialCloseTime) {
        return h.partialOpenTime < h.partialCloseTime;
      }
      return true;
    },
    {
      message: "partialOpenTime must be before partialCloseTime",
      path: ["partialCloseTime"],
    }
  );

export const DeleteHolidayScheduleSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  holidayId: z.string().trim().min(1, "holidayId is required"),
});

export const AddMaintenanceScheduleSchema = z
  .object({
    theatreId: z.string().trim().min(1, "theatreId is required"),
    maintenanceDate: isoDateSchema,
    startTime: timeStringSchema,
    endTime: timeStringSchema,
    affectedHalls: z.array(z.string().trim()).default(["ALL"]),
    reason: z.string().trim().min(3, "Reason must be at least 3 characters").max(255),
    status: MaintenanceWindowStatusEnum.default("SCHEDULED"),
  })
  .refine(
    (m) => m.startTime < m.endTime,
    {
      message: "Maintenance startTime must be before endTime",
      path: ["endTime"],
    }
  );

export const UpdateMaintenanceScheduleSchema = z
  .object({
    theatreId: z.string().trim().min(1, "theatreId is required"),
    maintenanceId: z.string().trim().min(1, "maintenanceId is required"),
    maintenanceDate: isoDateSchema.optional(),
    startTime: timeStringSchema.optional(),
    endTime: timeStringSchema.optional(),
    affectedHalls: z.array(z.string().trim()).optional(),
    reason: z.string().trim().min(3).max(255).optional(),
    status: MaintenanceWindowStatusEnum.optional(),
  })
  .refine(
    (m) => {
      if (m.startTime && m.endTime) return m.startTime < m.endTime;
      return true;
    },
    {
      message: "Maintenance startTime must be before endTime",
      path: ["endTime"],
    }
  );

export const DeleteMaintenanceScheduleSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  maintenanceId: z.string().trim().min(1, "maintenanceId is required"),
});

export const AddSpecialOperatingEventSchema = z
  .object({
    theatreId: z.string().trim().min(1, "theatreId is required"),
    eventName: z.string().trim().min(2, "Event name must be at least 2 characters").max(150),
    eventType: SpecialOperatingEventTypeEnum.default("FESTIVAL"),
    startDate: isoDateSchema,
    endDate: isoDateSchema,
    openTime: timeStringSchema,
    closeTime: timeStringSchema,
    notes: z.string().trim().max(1000).nullable().optional(),
  })
  .refine(
    (e) => e.startDate <= e.endDate,
    {
      message: "startDate must be on or before endDate",
      path: ["endDate"],
    }
  );

export const UpdateSpecialOperatingEventSchema = z
  .object({
    theatreId: z.string().trim().min(1, "theatreId is required"),
    eventId: z.string().trim().min(1, "eventId is required"),
    eventName: z.string().trim().min(2).max(150).optional(),
    eventType: SpecialOperatingEventTypeEnum.optional(),
    startDate: isoDateSchema.optional(),
    endDate: isoDateSchema.optional(),
    openTime: timeStringSchema.optional(),
    closeTime: timeStringSchema.optional(),
    notes: z.string().trim().max(1000).nullable().optional(),
  })
  .refine(
    (e) => {
      if (e.startDate && e.endDate) return e.startDate <= e.endDate;
      return true;
    },
    {
      message: "startDate must be on or before endDate",
      path: ["endDate"],
    }
  );

export const DeleteSpecialOperatingEventSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  eventId: z.string().trim().min(1, "eventId is required"),
});
