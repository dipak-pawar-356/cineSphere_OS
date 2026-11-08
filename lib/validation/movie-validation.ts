import { CreateMasterMovieInput, UpdateMasterMovieInput } from "@/types/movie-management.types";

export interface MovieValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateMovieSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateDateIso(dateString: string): boolean {
  if (!dateString) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const d = new Date(dateString);
  return !isNaN(d.getTime());
}

/**
 * Validates a Master Movie Input payload
 */
export function validateMasterMovieInput(
  input: CreateMasterMovieInput | UpdateMasterMovieInput,
  isUpdate: boolean = false
): MovieValidationResult {
  const errors: Record<string, string> = {};

  // 1. Title
  if (!isUpdate || input.title !== undefined) {
    if (!input.title || input.title.trim().length < 2) {
      errors.title = "Movie title must be at least 2 characters long.";
    } else if (input.title.length > 255) {
      errors.title = "Movie title cannot exceed 255 characters.";
    }
  }

  // 2. Slug
  if (input.slug !== undefined && input.slug.trim()) {
    if (!validateMovieSlug(input.slug.trim())) {
      errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens.";
    }
  }

  // 3. Synopsis
  if (!isUpdate || input.synopsis !== undefined) {
    if (!input.synopsis || input.synopsis.trim().length < 10) {
      errors.synopsis = "Synopsis must be at least 10 characters long.";
    }
  }

  // 4. Duration
  if (!isUpdate || input.durationMinutes !== undefined) {
    const duration = Number(input.durationMinutes);
    if (isNaN(duration) || duration <= 0) {
      errors.durationMinutes = "Duration must be a positive number of minutes.";
    } else if (duration > 600) {
      errors.durationMinutes = "Duration cannot exceed 600 minutes (10 hours).";
    }
  }

  // 5. Release Date
  if (!isUpdate || input.releaseDate !== undefined) {
    if (!input.releaseDate || !validateDateIso(input.releaseDate)) {
      errors.releaseDate = "Release date must be in YYYY-MM-DD format.";
    }
  }

  // 6. Certificate
  const validCerts = ["U", "UA", "UA 13+", "UA 16+", "A", "S", "PG-13", "R", "PG"];
  if (!isUpdate || input.certificate !== undefined) {
    if (!input.certificate || !input.certificate.trim()) {
      errors.certificate = "Certificate rating is required (e.g. U, UA, A, S).";
    }
  }

  // 7. Languages
  if (!isUpdate || input.availableLanguages !== undefined) {
    if (!input.availableLanguages || input.availableLanguages.length === 0) {
      errors.availableLanguages = "At least one audio language must be specified.";
    }
  }

  // 8. Formats
  if (!isUpdate || input.formats !== undefined) {
    if (!input.formats || input.formats.length === 0) {
      errors.formats = "At least one screening format (2D, 3D, IMAX, etc.) must be selected.";
    }
  }

  // 9. Genres
  if (!isUpdate || input.genres !== undefined) {
    if (!input.genres || input.genres.length === 0) {
      errors.genres = "At least one genre must be selected.";
    }
  }

  // 10. Poster URL
  if (!isUpdate || input.posterUrl !== undefined) {
    if (!input.posterUrl || !validateUrl(input.posterUrl)) {
      errors.posterUrl = "A valid HTTP/HTTPS poster image URL is required.";
    }
  }

  // 11. Banner URL
  if (!isUpdate || input.bannerUrl !== undefined) {
    if (!input.bannerUrl || !validateUrl(input.bannerUrl)) {
      errors.bannerUrl = "A valid HTTP/HTTPS banner image URL is required.";
    }
  }

  // 12. Trailers validation
  if (input.trailers && input.trailers.length > 0) {
    input.trailers.forEach((trailer, idx) => {
      if (!trailer.title || !trailer.title.trim()) {
        errors[`trailer_${idx}_title`] = `Trailer #${idx + 1} title is required.`;
      }
      if (!trailer.videoUrl || !validateUrl(trailer.videoUrl)) {
        errors[`trailer_${idx}_url`] = `Trailer #${idx + 1} must have a valid video URL.`;
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
