import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { theatres } from "./theatres";
import {
  operatingDayOfWeekEnum,
  operatingProfileStatusEnum,
  specialOperatingEventTypeEnum,
  maintenanceWindowStatusEnum,
} from "./enums";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Operating Hours Schema (Phase 3 – Part 8)
 * ==============================================================================
 * Tenant-isolated, independent operating profile governing regular opening/closing,
 * weekly schedules, holiday calendars, maintenance windows, and special events.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. THEATRE OPERATING PROFILES (Root Operating Identity)
// ------------------------------------------------------------------------------
export const theatreOperatingProfiles = pgTable(
  "theatre_operating_profiles",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" })
      .unique(),
    timezone: varchar("timezone", { length: 60 }).notNull().default("Asia/Kolkata"),
    regularOpeningTime: varchar("regular_opening_time", { length: 10 }).notNull().default("09:00"),
    regularClosingTime: varchar("regular_closing_time", { length: 10 }).notNull().default("23:30"),
    is24x7: boolean("is_24x7").notNull().default(false),
    lateNightClosing: boolean("late_night_closing").notNull().default(false),
    breakHours: jsonb("break_hours").default([]), // [{ name, startTime, endTime }]
    status: operatingProfileStatusEnum("status").notNull().default("ACTIVE"),
    version: integer("version").notNull().default(1),
    createdBy: varchar("created_by", { length: 40 }),
    updatedBy: varchar("updated_by", { length: 40 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_operating_profiles_theatre_id_idx").on(table.theatreId),
    index("theatre_operating_profiles_status_idx").on(table.status),
  ]
);

// ------------------------------------------------------------------------------
// 2. WEEKLY SCHEDULES (Per Day of Week Configuration)
// ------------------------------------------------------------------------------
export const theatreWeeklySchedules = pgTable(
  "theatre_weekly_schedules",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    operatingProfileId: varchar("operating_profile_id", { length: 40 })
      .notNull()
      .references(() => theatreOperatingProfiles.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    dayOfWeek: operatingDayOfWeekEnum("day_of_week").notNull(),
    isOpen: boolean("is_open").notNull().default(true),
    openTime: varchar("open_time", { length: 10 }).notNull().default("09:00"),
    closeTime: varchar("close_time", { length: 10 }).notNull().default("23:30"),
    isOvernight: boolean("is_overnight").notNull().default(false),
    timeSlots: jsonb("time_slots").default([]), // [{ slotName, startTime, endTime }]
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_weekly_schedules_profile_id_idx").on(table.operatingProfileId),
    index("theatre_weekly_schedules_theatre_id_idx").on(table.theatreId),
    index("theatre_weekly_schedules_day_idx").on(table.dayOfWeek),
  ]
);

// ------------------------------------------------------------------------------
// 3. HOLIDAY SCHEDULES (Statutory & Cultural Holidays)
// ------------------------------------------------------------------------------
export const theatreHolidaySchedules = pgTable(
  "theatre_holiday_schedules",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    operatingProfileId: varchar("operating_profile_id", { length: 40 })
      .notNull()
      .references(() => theatreOperatingProfiles.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    holidayName: varchar("holiday_name", { length: 150 }).notNull(),
    holidayDate: varchar("holiday_date", { length: 30 }).notNull(), // ISO YYYY-MM-DD
    isClosed: boolean("is_closed").notNull().default(true),
    partialOpenTime: varchar("partial_open_time", { length: 10 }),
    partialCloseTime: varchar("partial_close_time", { length: 10 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_holiday_schedules_profile_id_idx").on(table.operatingProfileId),
    index("theatre_holiday_schedules_theatre_id_idx").on(table.theatreId),
    index("theatre_holiday_schedules_date_idx").on(table.holidayDate),
  ]
);

// ------------------------------------------------------------------------------
// 4. MAINTENANCE SCHEDULES (Auditorium & Infrastructure Outages)
// ------------------------------------------------------------------------------
export const theatreMaintenanceSchedules = pgTable(
  "theatre_maintenance_schedules",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    operatingProfileId: varchar("operating_profile_id", { length: 40 })
      .notNull()
      .references(() => theatreOperatingProfiles.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    maintenanceDate: varchar("maintenance_date", { length: 30 }).notNull(),
    startTime: varchar("start_time", { length: 10 }).notNull(),
    endTime: varchar("end_time", { length: 10 }).notNull(),
    affectedHalls: jsonb("affected_halls").notNull().default(["ALL"]), // Array of hall IDs or ["ALL"]
    reason: varchar("reason", { length: 255 }).notNull(),
    status: maintenanceWindowStatusEnum("status").notNull().default("SCHEDULED"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_maintenance_schedules_profile_id_idx").on(table.operatingProfileId),
    index("theatre_maintenance_schedules_theatre_id_idx").on(table.theatreId),
    index("theatre_maintenance_schedules_date_idx").on(table.maintenanceDate),
  ]
);

// ------------------------------------------------------------------------------
// 5. SPECIAL OPERATING EVENTS (Festivals, Premieres, Corporate Bookings)
// ------------------------------------------------------------------------------
export const theatreSpecialOperatingEvents = pgTable(
  "theatre_special_operating_events",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    operatingProfileId: varchar("operating_profile_id", { length: 40 })
      .notNull()
      .references(() => theatreOperatingProfiles.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    eventName: varchar("event_name", { length: 150 }).notNull(),
    eventType: specialOperatingEventTypeEnum("event_type").notNull().default("FESTIVAL"),
    startDate: varchar("start_date", { length: 30 }).notNull(),
    endDate: varchar("end_date", { length: 30 }).notNull(),
    openTime: varchar("open_time", { length: 10 }).notNull(),
    closeTime: varchar("close_time", { length: 10 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_special_operating_events_profile_id_idx").on(table.operatingProfileId),
    index("theatre_special_operating_events_theatre_id_idx").on(table.theatreId),
    index("theatre_special_operating_events_type_idx").on(table.eventType),
  ]
);

// ------------------------------------------------------------------------------
// 6. OPERATING PROFILE VERSION SNAPSHOTS (Immutable Audit Ledger)
// ------------------------------------------------------------------------------
export const theatreOperatingProfileVersions = pgTable(
  "theatre_operating_profile_versions",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    operatingProfileId: varchar("operating_profile_id", { length: 40 }),
    theatreId: varchar("theatre_id", { length: 40 }),
    versionNumber: integer("version_number").notNull(),
    changeType: varchar("change_type", { length: 50 }).notNull(),
    changeSummary: text("change_summary"),
    snapshot: jsonb("snapshot").notNull(),
    changedBy: varchar("changed_by", { length: 40 }),
    changedRole: varchar("changed_role", { length: 40 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_operating_profile_versions_profile_id_idx").on(table.operatingProfileId),
    index("theatre_operating_profile_versions_theatre_id_idx").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// Semantic Aliases matching Architecture Specification
// ------------------------------------------------------------------------------
export const TheatreOperatingProfile = theatreOperatingProfiles;
export const WeeklySchedule = theatreWeeklySchedules;
export const HolidaySchedule = theatreHolidaySchedules;
export const MaintenanceSchedule = theatreMaintenanceSchedules;
export const SpecialOperatingEvent = theatreSpecialOperatingEvents;
export const OperatingProfileVersion = theatreOperatingProfileVersions;
