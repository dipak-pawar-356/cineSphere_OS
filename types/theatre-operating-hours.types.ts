/**
 * ==============================================================================
 * CineSphere OS — Theatre Operating Hours Types (Phase 3 – Part 8)
 * ==============================================================================
 * Enterprise multi-tenant operating schedule contracts, weekly matrices,
 * holiday calendars, maintenance windows, and immutable audit ledgers.
 * ==============================================================================
 */

export type OperatingDayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type OperatingProfileStatus = "ACTIVE" | "INACTIVE" | "DRAFT" | "SUSPENDED";

export type SpecialOperatingEventType =
  | "FESTIVAL"
  | "MOVIE_PREMIERE"
  | "PRIVATE_SHOW"
  | "CORPORATE_BOOKING"
  | "CUSTOM";

export type MaintenanceWindowStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface OperatingTimeSlot {
  slotName: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface OperatingBreakHour {
  name: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

// ------------------------------------------------------------------------------
// Domain Database Records
// ------------------------------------------------------------------------------

export interface TheatreOperatingProfileRecord {
  id: string;
  theatreId: string;
  timezone: string;
  regularOpeningTime: string; // HH:mm
  regularClosingTime: string; // HH:mm
  is24x7: boolean;
  lateNightClosing: boolean;
  breakHours: OperatingBreakHour[];
  status: OperatingProfileStatus;
  version: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TheatreWeeklyScheduleRecord {
  id: string;
  operatingProfileId: string;
  theatreId: string;
  dayOfWeek: OperatingDayOfWeek;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  isOvernight: boolean;
  timeSlots: OperatingTimeSlot[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TheatreHolidayScheduleRecord {
  id: string;
  operatingProfileId: string;
  theatreId: string;
  holidayName: string;
  holidayDate: string; // YYYY-MM-DD
  isClosed: boolean;
  partialOpenTime: string | null;
  partialCloseTime: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TheatreMaintenanceScheduleRecord {
  id: string;
  operatingProfileId: string;
  theatreId: string;
  maintenanceDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  affectedHalls: string[]; // ["ALL"] or hall IDs
  reason: string;
  status: MaintenanceWindowStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TheatreSpecialOperatingEventRecord {
  id: string;
  operatingProfileId: string;
  theatreId: string;
  eventName: string;
  eventType: SpecialOperatingEventType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  openTime: string;  // HH:mm
  closeTime: string; // HH:mm
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TheatreOperatingProfileVersionRecord {
  id: string;
  operatingProfileId: string;
  theatreId: string;
  versionNumber: number;
  changeType: string;
  changeSummary: string | null;
  snapshot: Record<string, unknown>;
  changedBy: string | null;
  changedRole: string | null;
  createdAt: Date;
}

// ------------------------------------------------------------------------------
// Semantic Domain Entity Type Aliases
// ------------------------------------------------------------------------------
export type TheatreOperatingProfile = TheatreOperatingProfileRecord;
export type WeeklySchedule = TheatreWeeklyScheduleRecord;
export type HolidaySchedule = TheatreHolidayScheduleRecord;
export type MaintenanceSchedule = TheatreMaintenanceScheduleRecord;
export type SpecialOperatingEvent = TheatreSpecialOperatingEventRecord;
export type OperatingProfileVersion = TheatreOperatingProfileVersionRecord;

// ------------------------------------------------------------------------------
// Composite Aggregated Bundle
// ------------------------------------------------------------------------------

export interface TheatreOperatingBundle {
  profile: TheatreOperatingProfileRecord | null;
  weeklySchedules: TheatreWeeklyScheduleRecord[];
  holidays: TheatreHolidayScheduleRecord[];
  maintenanceWindows: TheatreMaintenanceScheduleRecord[];
  specialEvents: TheatreSpecialOperatingEventRecord[];
  versions?: TheatreOperatingProfileVersionRecord[];
}

// ------------------------------------------------------------------------------
// Mutation Input DTOs
// ------------------------------------------------------------------------------

export interface UpsertTheatreOperatingProfileInput {
  theatreId: string;
  timezone?: string;
  regularOpeningTime?: string;
  regularClosingTime?: string;
  is24x7?: boolean;
  lateNightClosing?: boolean;
  breakHours?: OperatingBreakHour[];
  status?: OperatingProfileStatus;
  expectedVersion?: number;
}

export interface UpsertWeeklyScheduleInput {
  theatreId: string;
  schedules: Array<{
    dayOfWeek: OperatingDayOfWeek;
    isOpen?: boolean;
    openTime?: string;
    closeTime?: string;
    isOvernight?: boolean;
    timeSlots?: OperatingTimeSlot[];
  }>;
}

export interface AddHolidayScheduleInput {
  theatreId: string;
  holidayName: string;
  holidayDate: string; // YYYY-MM-DD
  isClosed?: boolean;
  partialOpenTime?: string | null;
  partialCloseTime?: string | null;
  notes?: string | null;
}

export interface UpdateHolidayScheduleInput {
  theatreId: string;
  holidayId: string;
  holidayName?: string;
  holidayDate?: string;
  isClosed?: boolean;
  partialOpenTime?: string | null;
  partialCloseTime?: string | null;
  notes?: string | null;
}

export interface DeleteHolidayScheduleInput {
  theatreId: string;
  holidayId: string;
}

export interface AddMaintenanceScheduleInput {
  theatreId: string;
  maintenanceDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  affectedHalls?: string[];
  reason: string;
  status?: MaintenanceWindowStatus;
}

export interface UpdateMaintenanceScheduleInput {
  theatreId: string;
  maintenanceId: string;
  maintenanceDate?: string;
  startTime?: string;
  endTime?: string;
  affectedHalls?: string[];
  reason?: string;
  status?: MaintenanceWindowStatus;
}

export interface DeleteMaintenanceScheduleInput {
  theatreId: string;
  maintenanceId: string;
}

export interface AddSpecialOperatingEventInput {
  theatreId: string;
  eventName: string;
  eventType?: SpecialOperatingEventType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  openTime: string;  // HH:mm
  closeTime: string; // HH:mm
  notes?: string | null;
}

export interface UpdateSpecialOperatingEventInput {
  theatreId: string;
  eventId: string;
  eventName?: string;
  eventType?: SpecialOperatingEventType;
  startDate?: string;
  endDate?: string;
  openTime?: string;
  closeTime?: string;
  notes?: string | null;
}

export interface DeleteSpecialOperatingEventInput {
  theatreId: string;
  eventId: string;
}
