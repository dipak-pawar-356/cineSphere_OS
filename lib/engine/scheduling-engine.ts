import {
  EnrichedShow,
  PricingProfile,
  ScheduleConflictResult,
  ShowCalendarSlot,
} from "@/types/show-management.types";
import { ManagedShow } from "@/store/theatre-store";
import { ShowSeat } from "@/types/show.types";
import { DynamicHallSectionConfig, SeatType } from "@/types/hall.types";
import { SeatTemplateContainer } from "@/types/seat-generation.types";
import { generateShowInventoryFromTemplate } from "./seat-generation-engine";

/**
 * ==============================================================================
 * CineSphere OS — Scheduling Engine & Conflict Detection (Phase 2 – Part 8)
 * ==============================================================================
 * Invariant Rules:
 * 1. A Hall cannot run overlapping Shows.
 * 2. Schedule turnaround must respect:
 *    [Show Start] -> [Movie Duration] -> [Intermission] -> [Show End] -> [Cleaning Buffer] -> [Next Available Slot]
 * 3. Shows combine Hall Seat Templates + Pricing Profiles to produce Show Seat Inventory.
 * ==============================================================================
 */

/**
 * Parse time string ("19:15", "07:15 PM", "10:30 AM", "14:00") into minutes from midnight (0..1439)
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().toUpperCase();

  // Handle 12-hour AM/PM format (e.g. "07:15 PM" or "10:30 AM")
  if (cleaned.includes("AM") || cleaned.includes("PM")) {
    const isPM = cleaned.includes("PM");
    const withoutPeriod = cleaned.replace(/AM|PM/g, "").trim();
    const [hoursStr, minutesStr] = withoutPeriod.split(":");
    let hours = parseInt(hoursStr, 10) || 0;
    const minutes = parseInt(minutesStr, 10) || 0;

    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  // Handle 24-hour format (e.g. "19:15" or "09:30")
  const [hoursStr, minutesStr] = cleaned.split(":");
  const hours = parseInt(hoursStr, 10) || 0;
  const minutes = parseInt(minutesStr, 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Format minutes from midnight into 12-hour or 24-hour display
 */
export function minutesToTimeString(minutesTotal: number, format24 = false): string {
  // Normalize past midnight or wrap around
  let normalized = Math.floor(minutesTotal) % 1440;
  if (normalized < 0) normalized += 1440;

  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const minutesPadded = minutes.toString().padStart(2, "0");

  if (format24) {
    return `${hours.toString().padStart(2, "0")}:${minutesPadded}`;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours.toString().padStart(2, "0")}:${minutesPadded} ${period}`;
}

/**
 * Calculate Show End Time & Turnaround Schedule Window
 */
export function calculateScheduleWindow(
  startTimeStr: string,
  durationMinutes: number,
  intermissionMinutes = 15,
  cleaningBufferMinutes = 20
) {
  const startMinutes = timeStringToMinutes(startTimeStr);
  const screeningRuntime = Math.max(1, durationMinutes) + Math.max(0, intermissionMinutes);
  const endMinutes = startMinutes + screeningRuntime;
  const cleaningEndMinutes = endMinutes + Math.max(0, cleaningBufferMinutes);

  return {
    startMinutes,
    endMinutes,
    cleaningEndMinutes,
    startTimeFormatted: minutesToTimeString(startMinutes),
    endTimeFormatted: minutesToTimeString(endMinutes),
    cleaningEndFormatted: minutesToTimeString(cleaningEndMinutes),
    totalOccupiedMinutes: screeningRuntime + cleaningBufferMinutes,
  };
}

export interface CandidateShowSlot {
  id?: string;
  hallId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  intermissionMinutes?: number;
  cleaningBufferMinutes?: number;
}

/**
 * Deterministic Hall Scheduling Conflict Detector
 * Validates that no two shows overlap in the same auditorium and enforces the cleaning buffer.
 */
export function detectScheduleConflict(
  candidate: CandidateShowSlot,
  existingShows: (EnrichedShow | ManagedShow)[],
  options: { allowAdjacent?: boolean } = {}
): ScheduleConflictResult {
  const intermission = candidate.intermissionMinutes ?? 15;
  const cleaningBuffer = candidate.cleaningBufferMinutes ?? 20;

  const candidateWindow = calculateScheduleWindow(
    candidate.startTime,
    candidate.durationMinutes,
    intermission,
    cleaningBuffer
  );

  // Filter shows running in the same hall on the same date (ignoring cancelled shows)
  const hallShowsOnDate = existingShows.filter((s) => {
    if (candidate.id && s.id === candidate.id) return false; // Ignore self when updating
    if (s.hallId !== candidate.hallId) return false;
    if (s.date !== candidate.date) return false;
    if (s.status === "Cancelled" || s.status === "Archived") return false;
    return true;
  });

  for (const existing of hallShowsOnDate) {
    // Determine existing show's duration and cleaning buffer
    const existingDuration =
      "durationMinutes" in existing && existing.durationMinutes
        ? existing.durationMinutes
        : 150; // Fallback runtime if legacy
    const existingIntermission =
      "intermissionMinutes" in existing && existing.intermissionMinutes !== undefined
        ? existing.intermissionMinutes
        : 15;
    const existingBuffer =
      "cleaningBufferMinutes" in existing && existing.cleaningBufferMinutes !== undefined
        ? existing.cleaningBufferMinutes
        : 20;

    const existingWindow = calculateScheduleWindow(
      existing.startTime,
      existingDuration,
      existingIntermission,
      existingBuffer
    );

    // Overlap condition:
    // [CandidateStart, CandidateCleaningEnd] overlaps with [ExistingStart, ExistingCleaningEnd]
    // Overlap occurs if: CandidateStart < ExistingCleaningEnd && CandidateCleaningEnd > ExistingStart
    const hasOverlap = options.allowAdjacent
      ? candidateWindow.startMinutes < existingWindow.cleaningEndMinutes &&
        candidateWindow.cleaningEndMinutes > existingWindow.startMinutes
      : candidateWindow.startMinutes < existingWindow.cleaningEndMinutes &&
        candidateWindow.cleaningEndMinutes > existingWindow.startMinutes;

    if (hasOverlap) {
      // Suggest the earliest safe start time right after existing show's cleaning buffer
      const suggestedTime = minutesToTimeString(existingWindow.cleaningEndMinutes);

      return {
        hasConflict: true,
        conflictType: "HALL_OVERLAP",
        message: `Conflict in ${existing.hallName}: "${existing.movieTitle}" is screening from ${existingWindow.startTimeFormatted} to ${existingWindow.endTimeFormatted} (turnaround until ${existingWindow.cleaningEndFormatted}).`,
        conflictingShowId: existing.id,
        conflictingShowTitle: existing.movieTitle,
        conflictingTimeWindow: `${existingWindow.startTimeFormatted} – ${existingWindow.cleaningEndFormatted}`,
        suggestedStartTime: suggestedTime,
      };
    }
  }

  return {
    hasConflict: false,
    conflictType: "NONE",
    message: "Screening slot is clear. No hall scheduling conflicts or turnaround overlaps detected.",
  };
}

/**
 * Generate Show-Specific Seat Inventory by combining Hall Template + Pricing Profile
 * Leaves the reusable Hall Template pristine and creates independent show seat availability.
 */
export function generateShowSeatInventory(
  showId: string,
  hallId: string,
  hallCapacity: number,
  pricingProfile: PricingProfile,
  seatTemplate?: SeatTemplateContainer
): ShowSeat[] {
  // If a full pre-computed Seat Template Container exists, use the official adapter
  if (seatTemplate && seatTemplate.seats && seatTemplate.seats.length > 0) {
    return generateShowInventoryFromTemplate(seatTemplate, {
      showId,
      hallId,
      theatreId: seatTemplate.theatreId || "th-pun-001",
      generatedAt: new Date().toISOString(),
      showPricing: {
        sectionPricing: pricingProfile.tierPricing,
        defaultPrice: pricingProfile.tierPricing["Silver"] || 250,
      },
    });
  }

  // Fallback deterministic synthesis if raw template container isn't pre-saved
  const seats: ShowSeat[] = [];
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "R", "S"];
  const seatsPerRow = Math.min(25, Math.ceil(hallCapacity / 10));
  let remainingCapacity = hallCapacity;
  let rowIndex = 0;

  while (remainingCapacity > 0 && rowIndex < rows.length) {
    const rowLetter = rows[rowIndex];
    const seatsInThisRow = Math.min(remainingCapacity, seatsPerRow);

    // Determine tier based on row progression
    let tier = "Silver";
    if (rowIndex >= 3 && rowIndex < 6) tier = "Gold";
    if (rowIndex >= 6 && rowIndex < 8) tier = "Platinum";
    if (rowIndex >= 8) tier = "VIP";

    const price = pricingProfile.tierPricing[tier] || 250;
    const seatType: SeatType = tier === "VIP" ? "Recliner" : "Standard";

    for (let col = 1; col <= seatsInThisRow; col++) {
      const seatNumber = `${rowLetter}${col}`;
      seats.push({
        id: `${showId}-${seatNumber}`,
        showId,
        seatNumber,
        row: rowLetter,
        column: col,
        sectionId: `sec-${tier.toLowerCase()}`,
        sectionName: tier,
        seatType,
        price,
        status: "Available",
        isWheelchair: rowLetter === "A" && col <= 2,
        isRecliner: tier === "VIP",
        dynamicPricingMultiplier: 1.0,
      });
      remainingCapacity--;
    }
    rowIndex++;
  }

  return seats;
}

/**
 * Transform Shows into Visual Timeline Slots for Calendar Matrix
 */
export function buildCalendarTimelineSlots(
  shows: (EnrichedShow | ManagedShow)[]
): ShowCalendarSlot[] {
  return shows.map((show) => {
    const duration =
      "durationMinutes" in show && show.durationMinutes ? show.durationMinutes : 150;
    const intermission =
      "intermissionMinutes" in show && show.intermissionMinutes !== undefined
        ? show.intermissionMinutes
        : 15;
    const cleaningBuffer =
      "cleaningBufferMinutes" in show && show.cleaningBufferMinutes !== undefined
        ? show.cleaningBufferMinutes
        : 20;

    const window = calculateScheduleWindow(
      show.startTime,
      duration,
      intermission,
      cleaningBuffer
    );

    const occupancy =
      show.totalSeats > 0 ? Math.round((show.seatsBooked / show.totalSeats) * 100) : 0;

    return {
      id: `slot-${show.id}`,
      showId: show.id,
      hallId: show.hallId,
      hallName: show.hallName,
      movieTitle: show.movieTitle,
      format: show.format,
      language: show.language,
      startMinutes: window.startMinutes,
      endMinutes: window.endMinutes,
      cleaningEndMinutes: window.cleaningEndMinutes,
      startTimeFormatted: window.startTimeFormatted,
      endTimeFormatted: window.endTimeFormatted,
      status: show.status,
      bookingStatus:
        "bookingStatus" in show && show.bookingStatus
          ? show.bookingStatus
          : show.status === "Cancelled"
          ? "Cancelled"
          : "Booking Open",
      occupancyPercent: occupancy,
      isConflict: "isConflict" in show ? show.isConflict : false,
    };
  });
}
