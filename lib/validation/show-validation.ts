import { CreateShowInput } from "@/types/show-management.types";

/**
 * ==============================================================================
 * CineSphere OS — Show Scheduling Validation Engine (Phase 2 – Part 8)
 * ==============================================================================
 */

export interface ShowValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateShowInput(input: Partial<CreateShowInput>): ShowValidationResult {
  const errors: Record<string, string> = {};

  if (!input.movieId || !input.movieId.trim()) {
    errors.movieId = "Movie selection is required for programming a show.";
  }

  if (!input.theatreId || !input.theatreId.trim()) {
    errors.theatreId = "Theatre tenancy ID is required.";
  }

  if (!input.hallId || !input.hallId.trim()) {
    errors.hallId = "Auditorium assignment is required.";
  }

  if (!input.date || !input.date.trim()) {
    errors.date = "Screening date is required.";
  } else {
    // Basic date validation YYYY-MM-DD or standard date string
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(input.date) && isNaN(Date.parse(input.date))) {
      errors.date = "Screening date must be a valid date format (YYYY-MM-DD).";
    }
  }

  if (!input.startTime || !input.startTime.trim()) {
    errors.startTime = "Start time is required (e.g. 19:15 or 07:15 PM).";
  }

  if (!input.language || !input.language.trim()) {
    errors.language = "Audio language track is required.";
  }

  if (!input.format || !input.format.trim()) {
    errors.format = "Screening format is required (e.g. IMAX, 2D, 3D, 4DX).";
  }

  if (!input.pricingProfileId || !input.pricingProfileId.trim()) {
    errors.pricingProfileId = "A reusable Pricing Profile must be assigned to determine section rates.";
  }

  if (input.intermissionMinutes !== undefined && (input.intermissionMinutes < 0 || input.intermissionMinutes > 60)) {
    errors.intermissionMinutes = "Intermission buffer must be between 0 and 60 minutes.";
  }

  if (input.cleaningBufferMinutes !== undefined && (input.cleaningBufferMinutes < 5 || input.cleaningBufferMinutes > 120)) {
    errors.cleaningBufferMinutes = "Auditorium cleaning buffer must be between 5 and 120 minutes.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

