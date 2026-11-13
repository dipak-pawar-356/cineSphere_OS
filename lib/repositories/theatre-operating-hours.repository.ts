import { BaseRepository } from "./base.repository";
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
  AddMaintenanceScheduleInput,
  UpdateMaintenanceScheduleInput,
  AddSpecialOperatingEventInput,
  UpdateSpecialOperatingEventInput,
  OperatingDayOfWeek,
} from "@/types/theatre-operating-hours.types";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Operating Hours Repository (Phase 3 – Part 8)
 * ==============================================================================
 * In-memory repository with pre-seeded operating hours, weekly matrix,
 * holidays, maintenance outages, special events, and version snapshots.
 * ==============================================================================
 */

const DAYS: OperatingDayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

// Seed Pune Flagship
const SEED_PUN_PROFILE: TheatreOperatingProfileRecord = {
  id: "op-pun-001",
  theatreId: "th-pun-001",
  timezone: "Asia/Kolkata",
  regularOpeningTime: "09:00",
  regularClosingTime: "23:30",
  is24x7: false,
  lateNightClosing: false,
  breakHours: [
    { name: "Afternoon Auditorium Turnaround", startTime: "14:30", endTime: "15:00" },
  ],
  status: "ACTIVE",
  version: 1,
  createdBy: "usr-super-1",
  updatedBy: "usr-th-pun",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_PUN_WEEKLY: TheatreWeeklyScheduleRecord[] = DAYS.map((day, idx) => ({
  id: `ws-pun-${idx + 1}`,
  operatingProfileId: "op-pun-001",
  theatreId: "th-pun-001",
  dayOfWeek: day,
  isOpen: true,
  openTime: "09:00",
  closeTime: day === "FRIDAY" || day === "SATURDAY" ? "23:59" : "23:30",
  isOvernight: false,
  timeSlots: [
    { slotName: "Morning Shows", startTime: "09:00", endTime: "12:30" },
    { slotName: "Matinee & Evening", startTime: "13:00", endTime: "19:00" },
    { slotName: "Night Shows", startTime: "19:30", endTime: "23:30" },
  ],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
}));

const SEED_PUN_HOLIDAYS: TheatreHolidayScheduleRecord[] = [
  {
    id: "hol-pun-001",
    operatingProfileId: "op-pun-001",
    theatreId: "th-pun-001",
    holidayName: "Diwali Festive Special Hours",
    holidayDate: "2026-11-08",
    isClosed: false,
    partialOpenTime: "11:00",
    partialCloseTime: "23:45",
    notes: "Morning cleaning buffer; blockbuster evening screenings.",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "hol-pun-002",
    operatingProfileId: "op-pun-001",
    theatreId: "th-pun-001",
    holidayName: "Independence Day Gala",
    holidayDate: "2026-08-15",
    isClosed: false,
    partialOpenTime: "08:00",
    partialCloseTime: "23:59",
    notes: "Patriotic classic film festival screening all day.",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
];

const SEED_PUN_MAINTENANCE: TheatreMaintenanceScheduleRecord[] = [
  {
    id: "maint-pun-001",
    operatingProfileId: "op-pun-001",
    theatreId: "th-pun-001",
    maintenanceDate: "2026-11-20",
    startTime: "02:00",
    endTime: "06:00",
    affectedHalls: ["hall-pun-1", "hall-pun-2"],
    reason: "Barco 4K Laser Projector Optical Recalibration & Dolby Atmos tuning",
    status: "SCHEDULED",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
];

const SEED_PUN_SPECIAL_EVENTS: TheatreSpecialOperatingEventRecord[] = [
  {
    id: "ev-pun-001",
    operatingProfileId: "op-pun-001",
    theatreId: "th-pun-001",
    eventName: "Midnight Fan Premiere Screening",
    eventType: "MOVIE_PREMIERE",
    startDate: "2026-12-18",
    endDate: "2026-12-19",
    openTime: "23:00",
    closeTime: "04:00",
    notes: "Special midnight screening with VIP red carpet foyer access.",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
];

// Seed Mumbai Palladium
const SEED_MUM_PROFILE: TheatreOperatingProfileRecord = {
  id: "op-mum-001",
  theatreId: "th-mum-001",
  timezone: "Asia/Kolkata",
  regularOpeningTime: "09:30",
  regularClosingTime: "01:00",
  is24x7: false,
  lateNightClosing: true,
  breakHours: [],
  status: "ACTIVE",
  version: 1,
  createdBy: "usr-super-1",
  updatedBy: "usr-th-mum",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const SEED_MUM_WEEKLY: TheatreWeeklyScheduleRecord[] = DAYS.map((day, idx) => ({
  id: `ws-mum-${idx + 1}`,
  operatingProfileId: "op-mum-001",
  theatreId: "th-mum-001",
  dayOfWeek: day,
  isOpen: true,
  openTime: "09:30",
  closeTime: "01:00",
  isOvernight: true,
  timeSlots: [],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
}));

export class TheatreOperatingHoursRepository extends BaseRepository<TheatreOperatingProfileRecord> {
  protected entityName = "TheatreOperatingProfile";
  protected tableName = "theatre_operating_profiles";

  private profilesStore: Map<string, TheatreOperatingProfileRecord> = new Map();
  private weeklyStore: Map<string, TheatreWeeklyScheduleRecord> = new Map(); // id -> record
  private holidaysStore: Map<string, TheatreHolidayScheduleRecord> = new Map(); // id -> record
  private maintenanceStore: Map<string, TheatreMaintenanceScheduleRecord> = new Map(); // id -> record
  private specialEventsStore: Map<string, TheatreSpecialOperatingEventRecord> = new Map(); // id -> record
  private versionsStore: TheatreOperatingProfileVersionRecord[] = [];

  constructor() {
    super();
    this.seed();
  }

  private seed(): void {
    // Seed Pune Flagship
    this.profilesStore.set(SEED_PUN_PROFILE.id, { ...SEED_PUN_PROFILE });
    SEED_PUN_WEEKLY.forEach((w) => this.weeklyStore.set(w.id, { ...w }));
    SEED_PUN_HOLIDAYS.forEach((h) => this.holidaysStore.set(h.id, { ...h }));
    SEED_PUN_MAINTENANCE.forEach((m) => this.maintenanceStore.set(m.id, { ...m }));
    SEED_PUN_SPECIAL_EVENTS.forEach((e) => this.specialEventsStore.set(e.id, { ...e }));

    this.versionsStore.push({
      id: "ver-op-pun-001",
      operatingProfileId: SEED_PUN_PROFILE.id,
      theatreId: SEED_PUN_PROFILE.theatreId,
      versionNumber: 1,
      changeType: "INITIAL_PROVISIONING",
      changeSummary: "Initial seeding of Pune flagship operating hours and weekly schedules.",
      snapshot: {
        profile: { ...SEED_PUN_PROFILE },
        weeklySchedules: SEED_PUN_WEEKLY.map((w) => ({ ...w })),
        holidays: SEED_PUN_HOLIDAYS.map((h) => ({ ...h })),
      },
      changedBy: "usr-super-1",
      changedRole: "SUPER_ADMIN",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    // Seed Mumbai Palladium
    this.profilesStore.set(SEED_MUM_PROFILE.id, { ...SEED_MUM_PROFILE });
    SEED_MUM_WEEKLY.forEach((w) => this.weeklyStore.set(w.id, { ...w }));
  }

  // ----------------------------------------------------------------------------
  // Base Repository Implementation
  // ----------------------------------------------------------------------------
  public async findById(id: string): Promise<TheatreOperatingProfileRecord | null> {
    const p = this.profilesStore.get(id);
    return p ? { ...p } : null;
  }

  public async findAll(): Promise<TheatreOperatingProfileRecord[]> {
    return Array.from(this.profilesStore.values()).map((p) => ({ ...p }));
  }

  public async create(data: TheatreOperatingProfileRecord): Promise<TheatreOperatingProfileRecord> {
    this.profilesStore.set(data.id, { ...data });
    return { ...data };
  }

  public async update(id: string, data: Partial<TheatreOperatingProfileRecord>): Promise<TheatreOperatingProfileRecord | null> {
    const existing = this.profilesStore.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.profilesStore.set(id, updated);
    return { ...updated };
  }

  public async delete(id: string): Promise<boolean> {
    const existing = this.profilesStore.get(id);
    if (!existing) return false;
    this.profilesStore.delete(id);

    // Delete child items
    for (const [key, val] of this.weeklyStore.entries()) {
      if (val.operatingProfileId === id) this.weeklyStore.delete(key);
    }
    for (const [key, val] of this.holidaysStore.entries()) {
      if (val.operatingProfileId === id) this.holidaysStore.delete(key);
    }
    for (const [key, val] of this.maintenanceStore.entries()) {
      if (val.operatingProfileId === id) this.maintenanceStore.delete(key);
    }
    for (const [key, val] of this.specialEventsStore.entries()) {
      if (val.operatingProfileId === id) this.specialEventsStore.delete(key);
    }
    return true;
  }

  // ----------------------------------------------------------------------------
  // Domain Query Methods
  // ----------------------------------------------------------------------------
  public async findByTheatreId(theatreId: string): Promise<TheatreOperatingProfileRecord | null> {
    for (const p of this.profilesStore.values()) {
      if (p.theatreId === theatreId) return { ...p };
    }
    return null;
  }

  public async findBundle(theatreId: string): Promise<TheatreOperatingBundle> {
    const profile = await this.findByTheatreId(theatreId);
    if (!profile) {
      return {
        profile: null,
        weeklySchedules: [],
        holidays: [],
        maintenanceWindows: [],
        specialEvents: [],
        versions: [],
      };
    }

    const weeklySchedules = Array.from(this.weeklyStore.values())
      .filter((w) => w.operatingProfileId === profile.id || w.theatreId === theatreId)
      .map((w) => ({ ...w }));

    const holidays = Array.from(this.holidaysStore.values())
      .filter((h) => h.operatingProfileId === profile.id || h.theatreId === theatreId)
      .sort((a, b) => a.holidayDate.localeCompare(b.holidayDate))
      .map((h) => ({ ...h }));

    const maintenanceWindows = Array.from(this.maintenanceStore.values())
      .filter((m) => m.operatingProfileId === profile.id || m.theatreId === theatreId)
      .sort((a, b) => a.maintenanceDate.localeCompare(b.maintenanceDate))
      .map((m) => ({ ...m }));

    const specialEvents = Array.from(this.specialEventsStore.values())
      .filter((e) => e.operatingProfileId === profile.id || e.theatreId === theatreId)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .map((e) => ({ ...e }));

    const versions = this.versionsStore
      .filter((v) => v.theatreId === theatreId || v.operatingProfileId === profile.id)
      .sort((a, b) => b.versionNumber - a.versionNumber)
      .map((v) => ({ ...v }));

    return {
      profile: { ...profile },
      weeklySchedules,
      holidays,
      maintenanceWindows,
      specialEvents,
      versions,
    };
  }

  // ----------------------------------------------------------------------------
  // Domain Mutation Methods
  // ----------------------------------------------------------------------------
  public async upsertProfile(
    theatreId: string,
    input: UpsertTheatreOperatingProfileInput,
    actorId: string = "system",
    actorRole: string = "THEATRE_ADMIN"
  ): Promise<TheatreOperatingProfileRecord> {
    let profile = await this.findByTheatreId(theatreId);
    const now = new Date();

    if (profile) {
      // Optimistic concurrency control check
      if (input.expectedVersion !== undefined && profile.version !== input.expectedVersion) {
        throw new Error(
          `Optimistic lock failure: Record modified by another transaction. Expected ${input.expectedVersion}, found ${profile.version}`
        );
      }

      const nextVersion = profile.version + 1;
      profile = {
        ...profile,
        timezone: input.timezone ?? profile.timezone,
        regularOpeningTime: input.regularOpeningTime ?? profile.regularOpeningTime,
        regularClosingTime: input.regularClosingTime ?? profile.regularClosingTime,
        is24x7: input.is24x7 !== undefined ? input.is24x7 : profile.is24x7,
        lateNightClosing: input.lateNightClosing !== undefined ? input.lateNightClosing : profile.lateNightClosing,
        breakHours: input.breakHours ?? profile.breakHours,
        status: input.status ?? profile.status,
        version: nextVersion,
        updatedBy: actorId,
        updatedAt: now,
      };
      this.profilesStore.set(profile.id, profile);

      await this.recordVersion(
        theatreId,
        profile.id,
        "OPERATING_PROFILE_UPDATED",
        `Updated regular hours to ${profile.regularOpeningTime} - ${profile.regularClosingTime} (TZ: ${profile.timezone}).`,
        { profile },
        actorId,
        actorRole
      );
    } else {
      const profileId = `op-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      profile = {
        id: profileId,
        theatreId,
        timezone: input.timezone || "Asia/Kolkata",
        regularOpeningTime: input.regularOpeningTime || "09:00",
        regularClosingTime: input.regularClosingTime || "23:30",
        is24x7: input.is24x7 || false,
        lateNightClosing: input.lateNightClosing || false,
        breakHours: input.breakHours || [],
        status: input.status || "ACTIVE",
        version: 1,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: now,
        updatedAt: now,
      };
      this.profilesStore.set(profileId, profile);

      const createdProfile = profile;
      // Create default weekly schedule
      DAYS.forEach((day, idx) => {
        const wsId = `ws-${Date.now()}-${idx}`;
        this.weeklyStore.set(wsId, {
          id: wsId,
          operatingProfileId: profileId,
          theatreId,
          dayOfWeek: day,
          isOpen: true,
          openTime: createdProfile.regularOpeningTime,
          closeTime: createdProfile.regularClosingTime,
          isOvernight: createdProfile.lateNightClosing,
          timeSlots: [],
          createdAt: now,
          updatedAt: now,
        });
      });

      await this.recordVersion(
        theatreId,
        profileId,
        "OPERATING_PROFILE_PROVISIONED",
        "Provisioned operating profile and initialized standard 7-day schedule.",
        { profile },
        actorId,
        actorRole
      );
    }

    return { ...profile };
  }

  public async upsertWeeklySchedule(
    theatreId: string,
    input: UpsertWeeklyScheduleInput,
    actorId: string = "system",
    actorRole: string = "THEATRE_ADMIN"
  ): Promise<TheatreWeeklyScheduleRecord[]> {
    let profile = await this.findByTheatreId(theatreId);
    if (!profile) {
      profile = await this.upsertProfile(theatreId, { theatreId }, actorId, actorRole);
    }

    const now = new Date();
    const updatedResults: TheatreWeeklyScheduleRecord[] = [];

    for (const dayInput of input.schedules) {
      // Find existing day record
      let existingDay: TheatreWeeklyScheduleRecord | null = null;
      for (const w of this.weeklyStore.values()) {
        if (w.operatingProfileId === profile.id && w.dayOfWeek === dayInput.dayOfWeek) {
          existingDay = w;
          break;
        }
      }

      if (existingDay) {
        const updatedDay: TheatreWeeklyScheduleRecord = {
          ...existingDay,
          isOpen: dayInput.isOpen !== undefined ? dayInput.isOpen : existingDay.isOpen,
          openTime: dayInput.openTime || existingDay.openTime,
          closeTime: dayInput.closeTime || existingDay.closeTime,
          isOvernight: dayInput.isOvernight !== undefined ? dayInput.isOvernight : existingDay.isOvernight,
          timeSlots: dayInput.timeSlots || existingDay.timeSlots,
          updatedAt: now,
        };
        this.weeklyStore.set(existingDay.id, updatedDay);
        updatedResults.push(updatedDay);
      } else {
        const newId = `ws-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newDay: TheatreWeeklyScheduleRecord = {
          id: newId,
          operatingProfileId: profile.id,
          theatreId,
          dayOfWeek: dayInput.dayOfWeek,
          isOpen: dayInput.isOpen ?? true,
          openTime: dayInput.openTime || "09:00",
          closeTime: dayInput.closeTime || "23:30",
          isOvernight: dayInput.isOvernight || false,
          timeSlots: dayInput.timeSlots || [],
          createdAt: now,
          updatedAt: now,
        };
        this.weeklyStore.set(newId, newDay);
        updatedResults.push(newDay);
      }
    }

    await this.recordVersion(
      theatreId,
      profile.id,
      "WEEKLY_SCHEDULE_UPDATED",
      `Updated weekly schedule for ${input.schedules.length} day(s).`,
      { updatedDays: input.schedules },
      actorId,
      actorRole
    );

    return updatedResults;
  }

  public async addHoliday(
    input: AddHolidayScheduleInput,
    actorId: string = "system",
    actorRole: string = "THEATRE_ADMIN"
  ): Promise<TheatreHolidayScheduleRecord> {
    let profile = await this.findByTheatreId(input.theatreId);
    if (!profile) {
      profile = await this.upsertProfile(input.theatreId, { theatreId: input.theatreId }, actorId, actorRole);
    }

    const now = new Date();
    const id = `hol-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const holiday: TheatreHolidayScheduleRecord = {
      id,
      operatingProfileId: profile.id,
      theatreId: input.theatreId,
      holidayName: input.holidayName,
      holidayDate: input.holidayDate,
      isClosed: input.isClosed ?? true,
      partialOpenTime: input.partialOpenTime || null,
      partialCloseTime: input.partialCloseTime || null,
      notes: input.notes || null,
      createdAt: now,
      updatedAt: now,
    };
    this.holidaysStore.set(id, holiday);

    await this.recordVersion(
      input.theatreId,
      profile.id,
      "HOLIDAY_ADDED",
      `Added holiday '${holiday.holidayName}' on ${holiday.holidayDate}.`,
      { holiday },
      actorId,
      actorRole
    );

    return { ...holiday };
  }

  public async updateHoliday(
    input: UpdateHolidayScheduleInput,
    actorId: string = "system",
    actorRole: string = "THEATRE_ADMIN"
  ): Promise<TheatreHolidayScheduleRecord | null> {
    const existing = this.holidaysStore.get(input.holidayId);
    if (!existing || existing.theatreId !== input.theatreId) return null;

    const updated: TheatreHolidayScheduleRecord = {
      ...existing,
      holidayName: input.holidayName ?? existing.holidayName,
      holidayDate: input.holidayDate ?? existing.holidayDate,
      isClosed: input.isClosed !== undefined ? input.isClosed : existing.isClosed,
      partialOpenTime: input.partialOpenTime !== undefined ? input.partialOpenTime : existing.partialOpenTime,
      partialCloseTime: input.partialCloseTime !== undefined ? input.partialCloseTime : existing.partialCloseTime,
      notes: input.notes !== undefined ? input.notes : existing.notes,
      updatedAt: new Date(),
    };
    this.holidaysStore.set(input.holidayId, updated);

    await this.recordVersion(
      input.theatreId,
      existing.operatingProfileId,
      "HOLIDAY_UPDATED",
      `Updated holiday '${updated.holidayName}' on ${updated.holidayDate}.`,
      { holiday: updated },
      actorId,
      actorRole
    );

    return { ...updated };
  }

  public async deleteHoliday(theatreId: string, holidayId: string): Promise<boolean> {
    const existing = this.holidaysStore.get(holidayId);
    if (!existing || existing.theatreId !== theatreId) return false;
    this.holidaysStore.delete(holidayId);
    return true;
  }

  public async addMaintenance(
    input: AddMaintenanceScheduleInput,
    actorId: string = "system",
    actorRole: string = "THEATRE_ADMIN"
  ): Promise<TheatreMaintenanceScheduleRecord> {
    let profile = await this.findByTheatreId(input.theatreId);
    if (!profile) {
      profile = await this.upsertProfile(input.theatreId, { theatreId: input.theatreId }, actorId, actorRole);
    }

    const now = new Date();
    const id = `maint-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const maintenance: TheatreMaintenanceScheduleRecord = {
      id,
      operatingProfileId: profile.id,
      theatreId: input.theatreId,
      maintenanceDate: input.maintenanceDate,
      startTime: input.startTime,
      endTime: input.endTime,
      affectedHalls: input.affectedHalls || ["ALL"],
      reason: input.reason,
      status: input.status || "SCHEDULED",
      createdAt: now,
      updatedAt: now,
    };
    this.maintenanceStore.set(id, maintenance);

    await this.recordVersion(
      input.theatreId,
      profile.id,
      "MAINTENANCE_SCHEDULED",
      `Scheduled maintenance for ${maintenance.maintenanceDate} (${maintenance.startTime} - ${maintenance.endTime}): ${maintenance.reason}.`,
      { maintenance },
      actorId,
      actorRole
    );

    return { ...maintenance };
  }

  public async updateMaintenance(
    input: UpdateMaintenanceScheduleInput,
    actorId: string = "system",
    actorRole: string = "THEATRE_ADMIN"
  ): Promise<TheatreMaintenanceScheduleRecord | null> {
    const existing = this.maintenanceStore.get(input.maintenanceId);
    if (!existing || existing.theatreId !== input.theatreId) return null;

    const updated: TheatreMaintenanceScheduleRecord = {
      ...existing,
      maintenanceDate: input.maintenanceDate ?? existing.maintenanceDate,
      startTime: input.startTime ?? existing.startTime,
      endTime: input.endTime ?? existing.endTime,
      affectedHalls: input.affectedHalls ?? existing.affectedHalls,
      reason: input.reason ?? existing.reason,
      status: input.status ?? existing.status,
      updatedAt: new Date(),
    };
    this.maintenanceStore.set(input.maintenanceId, updated);

    await this.recordVersion(
      input.theatreId,
      existing.operatingProfileId,
      "MAINTENANCE_UPDATED",
      `Updated maintenance window ${updated.id}.`,
      { maintenance: updated },
      actorId,
      actorRole
    );

    return { ...updated };
  }

  public async deleteMaintenance(theatreId: string, maintenanceId: string): Promise<boolean> {
    const existing = this.maintenanceStore.get(maintenanceId);
    if (!existing || existing.theatreId !== theatreId) return false;
    this.maintenanceStore.delete(maintenanceId);
    return true;
  }

  public async addSpecialEvent(
    input: AddSpecialOperatingEventInput,
    actorId: string = "system",
    actorRole: string = "THEATRE_ADMIN"
  ): Promise<TheatreSpecialOperatingEventRecord> {
    let profile = await this.findByTheatreId(input.theatreId);
    if (!profile) {
      profile = await this.upsertProfile(input.theatreId, { theatreId: input.theatreId }, actorId, actorRole);
    }

    const now = new Date();
    const id = `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const ev: TheatreSpecialOperatingEventRecord = {
      id,
      operatingProfileId: profile.id,
      theatreId: input.theatreId,
      eventName: input.eventName,
      eventType: input.eventType || "FESTIVAL",
      startDate: input.startDate,
      endDate: input.endDate,
      openTime: input.openTime,
      closeTime: input.closeTime,
      notes: input.notes || null,
      createdAt: now,
      updatedAt: now,
    };
    this.specialEventsStore.set(id, ev);

    await this.recordVersion(
      input.theatreId,
      profile.id,
      "SPECIAL_EVENT_ADDED",
      `Scheduled special event '${ev.eventName}' (${ev.startDate} to ${ev.endDate}).`,
      { event: ev },
      actorId,
      actorRole
    );

    return { ...ev };
  }

  public async updateSpecialEvent(
    input: UpdateSpecialOperatingEventInput,
    actorId: string = "system",
    actorRole: string = "THEATRE_ADMIN"
  ): Promise<TheatreSpecialOperatingEventRecord | null> {
    const existing = this.specialEventsStore.get(input.eventId);
    if (!existing || existing.theatreId !== input.theatreId) return null;

    const updated: TheatreSpecialOperatingEventRecord = {
      ...existing,
      eventName: input.eventName ?? existing.eventName,
      eventType: input.eventType ?? existing.eventType,
      startDate: input.startDate ?? existing.startDate,
      endDate: input.endDate ?? existing.endDate,
      openTime: input.openTime ?? existing.openTime,
      closeTime: input.closeTime ?? existing.closeTime,
      notes: input.notes !== undefined ? input.notes : existing.notes,
      updatedAt: new Date(),
    };
    this.specialEventsStore.set(input.eventId, updated);

    await this.recordVersion(
      input.theatreId,
      existing.operatingProfileId,
      "SPECIAL_EVENT_UPDATED",
      `Updated special event '${updated.eventName}'.`,
      { event: updated },
      actorId,
      actorRole
    );

    return { ...updated };
  }

  public async deleteSpecialEvent(theatreId: string, eventId: string): Promise<boolean> {
    const existing = this.specialEventsStore.get(eventId);
    if (!existing || existing.theatreId !== theatreId) return false;
    this.specialEventsStore.delete(eventId);
    return true;
  }

  public async recordVersion(
    theatreId: string,
    operatingProfileId: string,
    changeType: string,
    changeSummary: string,
    snapshot: Record<string, unknown>,
    changedBy: string = "system",
    changedRole: string = "THEATRE_ADMIN"
  ): Promise<TheatreOperatingProfileVersionRecord> {
    const existingVersions = this.versionsStore.filter((v) => v.theatreId === theatreId);
    const nextVersionNumber = existingVersions.length + 1;

    const ver: TheatreOperatingProfileVersionRecord = {
      id: `ver-op-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      operatingProfileId,
      theatreId,
      versionNumber: nextVersionNumber,
      changeType,
      changeSummary,
      snapshot,
      changedBy,
      changedRole,
      createdAt: new Date(),
    };
    this.versionsStore.push(ver);
    return { ...ver };
  }

  public async getVersions(theatreId: string): Promise<TheatreOperatingProfileVersionRecord[]> {
    return this.versionsStore
      .filter((v) => v.theatreId === theatreId)
      .sort((a, b) => b.versionNumber - a.versionNumber)
      .map((v) => ({ ...v }));
  }
}

export const theatreOperatingHoursRepository = new TheatreOperatingHoursRepository();
