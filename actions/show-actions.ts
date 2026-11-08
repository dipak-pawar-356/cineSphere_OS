"use server";

import {
  CreateShowInput,
  EnrichedShow,
  PricingProfile,
  ScheduleConflictResult,
  ShowAuditLogRecord,
  UpdateShowInput,
} from "@/types/show-management.types";
import { validateShowInput } from "@/lib/validation/show-validation";
import {
  calculateScheduleWindow,
  detectScheduleConflict,
  generateShowSeatInventory,
  timeStringToMinutes,
} from "@/lib/engine/scheduling-engine";
import { INITIAL_PRICING_PROFILES } from "@/lib/constants/initial-pricing-profiles";

/**
 * ==============================================================================
 * CineSphere OS — Show Scheduling Server Actions (Phase 2 – Part 8)
 * ==============================================================================
 */

export interface ShowActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  conflict?: ScheduleConflictResult;
  auditRecord?: ShowAuditLogRecord;
}

/**
 * Server Action: Validate Schedule Conflict
 */
export async function validateScheduleAction(
  hallId: string,
  date: string,
  startTime: string,
  durationMinutes: number,
  cleaningBufferMinutes = 20,
  intermissionMinutes = 15,
  existingShows: EnrichedShow[] = [],
  excludeShowId?: string
): Promise<ScheduleConflictResult> {
  return detectScheduleConflict(
    {
      id: excludeShowId,
      hallId,
      date,
      startTime,
      durationMinutes,
      intermissionMinutes,
      cleaningBufferMinutes,
    },
    existingShows
  );
}

/**
 * Server Action: Create New Show Event
 */
export async function createShowAction(
  input: CreateShowInput,
  existingShows: EnrichedShow[] = [],
  pricingProfiles: PricingProfile[] = INITIAL_PRICING_PROFILES,
  movieDetails?: { title: string; poster?: string; banner?: string; durationMinutes: number; certificate?: string },
  hallDetails?: { name: string; capacity: number; screenType: string; code?: string }
): Promise<ShowActionResponse<EnrichedShow>> {
  // 1. Input Validation
  const validation = validateShowInput(input);
  if (!validation.isValid) {
    return {
      success: false,
      message: "Show schedule input failed validation checks.",
      errors: validation.errors,
    };
  }

  const duration = movieDetails?.durationMinutes || 150;
  const intermission = input.intermissionMinutes ?? 15;
  const cleaningBuffer = input.cleaningBufferMinutes ?? 20;

  // 2. Schedule Conflict Detection
  const conflict = detectScheduleConflict(
    {
      hallId: input.hallId,
      date: input.date,
      startTime: input.startTime,
      durationMinutes: duration,
      intermissionMinutes: intermission,
      cleaningBufferMinutes: cleaningBuffer,
    },
    existingShows
  );

  if (conflict.hasConflict) {
    return {
      success: false,
      message: conflict.message,
      conflict,
    };
  }

  // 3. Resolve Pricing Profile
  const profile =
    pricingProfiles.find((p) => p.id === input.pricingProfileId) ||
    pricingProfiles[0] ||
    INITIAL_PRICING_PROFILES[0];

  const window = calculateScheduleWindow(input.startTime, duration, intermission, cleaningBuffer);
  const showId = `shw-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const movieSlug = (movieDetails?.title || "movie").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const showCode = `SH-${input.hallId.toUpperCase()}-${movieSlug.toUpperCase().slice(0, 6)}-${timeStringToMinutes(input.startTime)}`;

  const totalSeats = hallDetails?.capacity || 200;

  // 4. Generate Initial Show-Specific Seat Inventory
  const seatInventory = generateShowSeatInventory(showId, input.hallId, totalSeats, profile);

  const baseTicketPrice = input.ticketPrice || profile.tierPricing["Silver"] || 250;

  const newShow: EnrichedShow = {
    id: showId,
    showCode,
    slug: `${input.theatreId}-${input.hallId}-${movieSlug}-${window.startMinutes}`,
    movieId: input.movieId,
    movieTitle: movieDetails?.title || "Feature Presentation",
    moviePosterUrl: movieDetails?.poster,
    movieBannerUrl: movieDetails?.banner,
    movieDurationMinutes: duration,
    movieCertificate: movieDetails?.certificate || "UA",
    theatreId: input.theatreId,
    theatreName: "CineSphere Cinema Complex",
    hallId: input.hallId,
    hallName: hallDetails?.name || "Auditorium 1",
    hallCode: hallDetails?.code || "AUD-01",
    screenType: hallDetails?.screenType || input.format,
    date: input.date,
    startTime: window.startTimeFormatted,
    endTime: window.endTimeFormatted,
    durationMinutes: duration,
    intermissionMinutes: intermission,
    cleaningBufferMinutes: cleaningBuffer,
    totalOccupiedMinutes: window.totalOccupiedMinutes,
    language: input.language,
    format: input.format,
    status: input.status || "Scheduled",
    bookingStatus: input.bookingStatus || "Booking Open",
    salesStatus: input.salesStatus || "On Sale",
    pricingProfileId: profile.id,
    pricingProfileName: profile.name,
    sectionPricing: profile.tierPricing,
    ticketPrice: baseTicketPrice,
    totalSeats,
    seatsBooked: 0,
    seatsAvailable: totalSeats,
    seatsBlocked: 0,
    occupancyPercent: 0,
    revenueEstimated: 0,
    seatInventory,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const auditRecord: ShowAuditLogRecord = {
    id: `aud-${Date.now()}`,
    action: "CREATED",
    showId: newShow.id,
    showCode: newShow.showCode,
    movieTitle: newShow.movieTitle,
    hallName: newShow.hallName,
    theatreId: newShow.theatreId,
    user: "theatre-admin@cinesphere.com",
    timestamp: new Date().toISOString(),
    details: `Programmed showtime ${newShow.startTime} in ${newShow.hallName} with profile "${profile.name}".`,
    status: "SUCCESS",
  };

  return {
    success: true,
    message: `Successfully scheduled "${newShow.movieTitle}" in ${newShow.hallName} at ${newShow.startTime}.`,
    data: newShow,
    auditRecord,
  };
}

/**
 * Server Action: Update Show
 */
export async function updateShowAction(
  showId: string,
  input: UpdateShowInput,
  currentShow: EnrichedShow,
  existingShows: EnrichedShow[] = [],
  pricingProfiles: PricingProfile[] = INITIAL_PRICING_PROFILES
): Promise<ShowActionResponse<EnrichedShow>> {
  const mergedStartTime = input.startTime || currentShow.startTime;
  const mergedHallId = input.hallId || currentShow.hallId;
  const mergedDate = input.date || currentShow.date;
  const intermission = input.intermissionMinutes ?? currentShow.intermissionMinutes ?? 15;
  const cleaningBuffer = input.cleaningBufferMinutes ?? currentShow.cleaningBufferMinutes ?? 20;
  const duration = currentShow.durationMinutes;

  // Check conflicts if hall, date, or start time changed
  if (
    mergedStartTime !== currentShow.startTime ||
    mergedHallId !== currentShow.hallId ||
    mergedDate !== currentShow.date
  ) {
    const conflict = detectScheduleConflict(
      {
        id: showId,
        hallId: mergedHallId,
        date: mergedDate,
        startTime: mergedStartTime,
        durationMinutes: duration,
        intermissionMinutes: intermission,
        cleaningBufferMinutes: cleaningBuffer,
      },
      existingShows
    );

    if (conflict.hasConflict) {
      return {
        success: false,
        message: conflict.message,
        conflict,
      };
    }
  }

  const window = calculateScheduleWindow(mergedStartTime, duration, intermission, cleaningBuffer);

  const profile = input.pricingProfileId
    ? pricingProfiles.find((p) => p.id === input.pricingProfileId) || pricingProfiles[0]
    : undefined;

  const updatedShow: EnrichedShow = {
    ...currentShow,
    hallId: mergedHallId,
    date: mergedDate,
    startTime: window.startTimeFormatted,
    endTime: window.endTimeFormatted,
    intermissionMinutes: intermission,
    cleaningBufferMinutes: cleaningBuffer,
    totalOccupiedMinutes: window.totalOccupiedMinutes,
    language: input.language || currentShow.language,
    format: input.format || currentShow.format,
    status: input.status || currentShow.status,
    bookingStatus: input.bookingStatus || currentShow.bookingStatus,
    salesStatus: input.salesStatus || currentShow.salesStatus,
    pricingProfileId: profile ? profile.id : currentShow.pricingProfileId,
    pricingProfileName: profile ? profile.name : currentShow.pricingProfileName,
    sectionPricing: profile ? profile.tierPricing : currentShow.sectionPricing,
    ticketPrice: input.ticketPrice || currentShow.ticketPrice,
    updatedAt: new Date().toISOString(),
  };

  const auditRecord: ShowAuditLogRecord = {
    id: `aud-${Date.now()}`,
    action: "UPDATED",
    showId: updatedShow.id,
    showCode: updatedShow.showCode,
    movieTitle: updatedShow.movieTitle,
    hallName: updatedShow.hallName,
    theatreId: updatedShow.theatreId,
    user: "theatre-admin@cinesphere.com",
    timestamp: new Date().toISOString(),
    details: `Updated schedule parameters for show ${updatedShow.showCode}.`,
    status: "SUCCESS",
  };

  return {
    success: true,
    message: `Updated showtime schedule for "${updatedShow.movieTitle}".`,
    data: updatedShow,
    auditRecord,
  };
}

/**
 * Server Action: Cancel Show
 */
export async function cancelShowAction(
  showId: string,
  reason: string,
  showTitle = "Feature Film"
): Promise<ShowActionResponse<null>> {
  return {
    success: true,
    message: `Showtime for "${showTitle}" has been cancelled (${reason}).`,
    auditRecord: {
      id: `aud-${Date.now()}`,
      action: "CANCELLED",
      showId,
      showCode: `SH-${showId}`,
      movieTitle: showTitle,
      hallName: "Auditorium",
      theatreId: "th-pun-001",
      user: "theatre-admin@cinesphere.com",
      timestamp: new Date().toISOString(),
      details: `Show cancelled with stated reason: ${reason}.`,
      status: "SUCCESS",
    },
  };
}

/**
 * Server Action: Duplicate Show to another Date/Slot
 */
export async function duplicateShowAction(
  sourceShow: EnrichedShow,
  targetDate: string,
  targetStartTime: string,
  existingShows: EnrichedShow[] = []
): Promise<ShowActionResponse<EnrichedShow>> {
  return createShowAction(
    {
      movieId: sourceShow.movieId,
      theatreId: sourceShow.theatreId,
      hallId: sourceShow.hallId,
      date: targetDate,
      startTime: targetStartTime,
      language: sourceShow.language,
      format: sourceShow.format,
      pricingProfileId: sourceShow.pricingProfileId,
      intermissionMinutes: sourceShow.intermissionMinutes,
      cleaningBufferMinutes: sourceShow.cleaningBufferMinutes,
      status: "Scheduled",
      bookingStatus: "Booking Open",
      ticketPrice: sourceShow.ticketPrice,
    },
    existingShows,
    INITIAL_PRICING_PROFILES,
    {
      title: sourceShow.movieTitle,
      poster: sourceShow.moviePosterUrl,
      banner: sourceShow.movieBannerUrl,
      durationMinutes: sourceShow.durationMinutes,
      certificate: sourceShow.movieCertificate,
    },
    {
      name: sourceShow.hallName,
      capacity: sourceShow.totalSeats,
      screenType: sourceShow.screenType,
      code: sourceShow.hallCode,
    }
  );
}

