"use server";

import { revalidatePath } from "next/cache";
import {
  GlobalMasterMovie,
  CreateMasterMovieInput,
  UpdateMasterMovieInput,
  MovieAuditLogRecord,
  TheatreMovieCatalogItem,
} from "@/types/movie-management.types";
import {
  validateMasterMovieInput,
  generateSlugFromTitle,
} from "@/lib/validation/movie-validation";
import { ServerActionResponse } from "./hall-actions";

/**
 * ==============================================================================
 * CineSphere OS — Master Movie Management Server Actions (Phase 2 – Part 7)
 * ==============================================================================
 * Master Movies represent films only (creative assets, cast, crew, metadata).
 * Movies NEVER contain: Pricing, Seats, Hall information, Bookings, or Payments.
 * Those belong strictly to Shows (Phase 2 Part 8).
 * ==============================================================================
 */

export interface MovieActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
  auditLog?: MovieAuditLogRecord;
}

/**
 * Server Action: Create Global Master Movie (Super Admin)
 */
export async function createMovieAction(
  input: CreateMasterMovieInput,
  userId: string = "usr_super_admin"
): Promise<MovieActionResponse<GlobalMasterMovie>> {
  const timestamp = new Date().toISOString();
  try {
    // 1. Server-side validation
    const validation = validateMasterMovieInput(input, false);
    if (!validation.isValid) {
      return {
        success: false,
        error: "Movie validation failed. Please check the entered fields.",
        errors: validation.errors,
      };
    }

    const slug = input.slug?.trim() || generateSlugFromTitle(input.title);
    const movieId = `mov-${Date.now()}`;

    const newMovie: GlobalMasterMovie = {
      id: movieId,
      slug,
      title: input.title.trim(),
      originalTitle: input.originalTitle?.trim(),
      synopsis: input.synopsis.trim(),
      shortDescription: input.shortDescription?.trim(),
      fullDescription: input.fullDescription?.trim(),
      durationMinutes: Number(input.durationMinutes),
      releaseDate: input.releaseDate,
      certificate: input.certificate,
      status: input.status || "Upcoming",
      primaryLanguage: input.primaryLanguage,
      availableLanguages: input.availableLanguages,
      formats: input.formats,
      genres: input.genres,
      productionHouse: input.productionHouse?.trim(),
      distributor: input.distributor?.trim(),
      country: input.country || "India",
      imdbRating: input.imdbRating,
      websiteUrl: input.websiteUrl,
      posterUrl: input.posterUrl,
      bannerUrl: input.bannerUrl,
      landscapeBannerUrl: input.landscapeBannerUrl || input.bannerUrl,
      portraitBannerUrl: input.portraitBannerUrl || input.posterUrl,
      galleryImages: (input.galleryImages || []).map((img, idx) => ({
        ...img,
        id: `gal-${Date.now()}-${idx}`,
      })),
      trailers: (input.trailers || []).map((t, idx) => ({
        ...t,
        id: `trl-${Date.now()}-${idx}`,
      })),
      cast: (input.cast || []).map((c, idx) => ({
        ...c,
        id: `cast-${Date.now()}-${idx}`,
      })),
      crew: (input.crew || []).map((cr, idx) => ({
        ...cr,
        id: `crew-${Date.now()}-${idx}`,
      })),
      rating: 8.5,
      isFeatured: !!input.isFeatured,
      isTrending: !!input.isTrending,
      isDeleted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const auditLog: MovieAuditLogRecord = {
      id: `audit-${Date.now()}`,
      action: "CREATED",
      movieId,
      movieTitle: newMovie.title,
      user: userId,
      timestamp,
      details: `Created master movie "${newMovie.title}" (${newMovie.durationMinutes} mins, ${newMovie.certificate})`,
      status: "SUCCESS",
    };

    revalidatePath("/dashboard/movies");
    revalidatePath("/movies");
    revalidatePath(`/movie/${newMovie.slug}`);
    return {
      success: true,
      data: newMovie,
      auditLog,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to create master movie.",
    };
  }
}

/**
 * Server Action: Update Global Master Movie (Super Admin)
 */
export async function updateMovieAction(
  id: string,
  input: UpdateMasterMovieInput,
  userId: string = "usr_super_admin"
): Promise<MovieActionResponse<Partial<GlobalMasterMovie>>> {
  const timestamp = new Date().toISOString();
  try {
    if (!id) {
      return { success: false, error: "Movie ID is required." };
    }

    const validation = validateMasterMovieInput(input, true);
    if (!validation.isValid) {
      return {
        success: false,
        error: "Movie validation failed.",
        errors: validation.errors,
      };
    }

    const sanitizedUpdates: Partial<GlobalMasterMovie> = {
      ...input,
      galleryImages: input.galleryImages
        ? input.galleryImages.map((img, idx) => ({ ...img, id: (img as any).id || `gal-${Date.now()}-${idx}` }))
        : undefined,
      trailers: input.trailers
        ? input.trailers.map((t, idx) => ({ ...t, id: (t as any).id || `trl-${Date.now()}-${idx}` }))
        : undefined,
      cast: input.cast
        ? input.cast.map((c, idx) => ({ ...c, id: (c as any).id || `cast-${Date.now()}-${idx}` }))
        : undefined,
      crew: input.crew
        ? input.crew.map((cr, idx) => ({ ...cr, id: (cr as any).id || `crew-${Date.now()}-${idx}` }))
        : undefined,
      updatedAt: timestamp,
    };

    const auditLog: MovieAuditLogRecord = {
      id: `audit-${Date.now()}`,
      action: "UPDATED",
      movieId: id,
      movieTitle: input.title || id,
      user: userId,
      timestamp,
      details: `Updated master movie metadata for ID ${id}`,
      status: "SUCCESS",
    };

    revalidatePath("/dashboard/movies");
    revalidatePath(`/dashboard/movies/${id}`);
    revalidatePath("/movies");
    return {
      success: true,
      data: sanitizedUpdates,
      auditLog,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to update movie.",
    };
  }
}

/**
 * Server Action: Archive Master Movie (Super Admin)
 */
export async function archiveMovieAction(
  id: string,
  userId: string = "usr_super_admin"
): Promise<MovieActionResponse<{ id: string; status: "Archived" }>> {
  const timestamp = new Date().toISOString();
  try {
    if (!id) return { success: false, error: "Movie ID is required." };

    const auditLog: MovieAuditLogRecord = {
      id: `audit-${Date.now()}`,
      action: "ARCHIVED",
      movieId: id,
      movieTitle: id,
      user: userId,
      timestamp,
      details: `Archived theatrical release for Movie ID ${id}`,
      status: "SUCCESS",
    };

    revalidatePath("/dashboard/movies");
    revalidatePath("/movies");
    return {
      success: true,
      data: { id, status: "Archived" },
      auditLog,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to archive movie.",
    };
  }
}

/**
 * Server Action: Restore Master Movie (Super Admin)
 */
export async function restoreMovieAction(
  id: string,
  userId: string = "usr_super_admin"
): Promise<MovieActionResponse<{ id: string; status: "Upcoming" | "Now Showing" }>> {
  const timestamp = new Date().toISOString();
  try {
    if (!id) return { success: false, error: "Movie ID is required." };

    const auditLog: MovieAuditLogRecord = {
      id: `audit-${Date.now()}`,
      action: "RESTORED",
      movieId: id,
      movieTitle: id,
      user: userId,
      timestamp,
      details: `Restored movie release ID ${id} to active catalog`,
      status: "SUCCESS",
    };

    revalidatePath("/dashboard/movies");
    revalidatePath("/movies");
    return {
      success: true,
      data: { id, status: "Now Showing" },
      auditLog,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to restore movie.",
    };
  }
}

/**
 * Server Action: Soft Delete Master Movie (Super Admin)
 */
export async function deleteMovieAction(
  id: string,
  userId: string = "usr_super_admin"
): Promise<MovieActionResponse<{ id: string; deleted: boolean }>> {
  const timestamp = new Date().toISOString();
  try {
    if (!id) return { success: false, error: "Movie ID is required." };

    const auditLog: MovieAuditLogRecord = {
      id: `audit-${Date.now()}`,
      action: "DELETED",
      movieId: id,
      movieTitle: id,
      user: userId,
      timestamp,
      details: `Soft-deleted master film record ID ${id}`,
      status: "SUCCESS",
    };

    revalidatePath("/dashboard/movies");
    revalidatePath("/movies");
    return {
      success: true,
      data: { id, deleted: true },
      auditLog,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to delete movie.",
    };
  }
}

/**
 * Server Action: Duplicate Master Movie Metadata (Super Admin)
 */
export async function duplicateMovieAction(
  sourceMovie: GlobalMasterMovie,
  userId: string = "usr_super_admin"
): Promise<MovieActionResponse<GlobalMasterMovie>> {
  const timestamp = new Date().toISOString();
  try {
    const newId = `mov-${Date.now()}`;
    const duplicated: GlobalMasterMovie = {
      ...sourceMovie,
      id: newId,
      title: `${sourceMovie.title} (Copy)`,
      slug: `${sourceMovie.slug}-copy`,
      status: "Draft",
      isDeleted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const auditLog: MovieAuditLogRecord = {
      id: `audit-${Date.now()}`,
      action: "CREATED",
      movieId: newId,
      movieTitle: duplicated.title,
      user: userId,
      timestamp,
      details: `Duplicated master movie metadata from "${sourceMovie.title}" (${sourceMovie.id})`,
      status: "SUCCESS",
    };

    revalidatePath("/dashboard/movies");
    return {
      success: true,
      data: duplicated,
      auditLog,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to duplicate movie.",
    };
  }
}

/**
 * Server Action: Upload Movie Media Asset (Poster, Banner, Gallery, Trailer Thumb)
 */
export async function uploadMovieMediaAction(
  movieId: string,
  mediaType: "poster" | "banner" | "gallery" | "trailer-thumb",
  fileInfo: { fileName: string; mimeType: string; simulatedUrl: string },
  userId: string = "usr_admin"
): Promise<MovieActionResponse<{ url: string; mediaType: string }>> {
  const timestamp = new Date().toISOString();
  try {
    if (!movieId || !fileInfo.simulatedUrl) {
      return { success: false, error: "Invalid media payload." };
    }

    const auditLog: MovieAuditLogRecord = {
      id: `audit-${Date.now()}`,
      action: "MEDIA_UPLOADED",
      movieId,
      movieTitle: movieId,
      user: userId,
      timestamp,
      details: `Uploaded ${mediaType} asset "${fileInfo.fileName}"`,
      status: "SUCCESS",
    };

    return {
      success: true,
      data: { url: fileInfo.simulatedUrl, mediaType },
      auditLog,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to upload movie media.",
    };
  }
}

/**
 * Server Action: Link Movie to Theatre Exhibition Catalog (Theatre Admin)
 * Architectural Law: A Theatre Admin never recreates the movie.
 * They link their theatre to the master film and assign screening rights.
 */
export async function linkMovieToTheatreAction(
  theatreId: string,
  movieId: string,
  options: {
    status?: "Now Showing" | "Upcoming";
    licensedFormats: string[];
    licensedLanguages: string[];
  },
  userId: string = "usr_theatre_admin"
): Promise<MovieActionResponse<TheatreMovieCatalogItem>> {
  const timestamp = new Date().toISOString();
  try {
    if (!theatreId || !movieId) {
      return { success: false, error: "Theatre ID and Movie ID are required." };
    }

    const catalogItem: TheatreMovieCatalogItem = {
      id: `th-mov-${theatreId}-${movieId}`,
      theatreId,
      movieId,
      status: options.status || "Now Showing",
      licensedFormats: options.licensedFormats,
      licensedLanguages: options.licensedLanguages,
      kdmStatus: "Valid",
      kdmKeyId: `KDM-${theatreId.slice(0, 6).toUpperCase()}-${movieId.slice(0, 6).toUpperCase()}`,
      kdmValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availableFrom: timestamp.split("T")[0],
      addedAt: timestamp,
      updatedAt: timestamp,
    };

    const auditLog: MovieAuditLogRecord = {
      id: `audit-${Date.now()}`,
      action: "THEATRE_LINKED",
      movieId,
      movieTitle: movieId,
      theatreId,
      user: userId,
      timestamp,
      details: `Theatre ${theatreId} acquired exhibition rights for Master Movie ${movieId}`,
      status: "SUCCESS",
    };

    revalidatePath("/theatre/movies");
    revalidatePath("/theatre/shows");
    return {
      success: true,
      data: catalogItem,
      auditLog,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to link movie to theatre.",
    };
  }
}

/**
 * Server Action: Toggle Theatre Screening Status
 */
export async function toggleTheatreMovieStatusAction(
  theatreId: string,
  movieId: string,
  status: "Now Showing" | "Upcoming" | "Archived" | "Inactive",
  userId: string = "usr_theatre_admin"
): Promise<MovieActionResponse<{ theatreId: string; movieId: string; status: string }>> {
  const timestamp = new Date().toISOString();
  try {
    if (!theatreId || !movieId) {
      return { success: false, error: "Missing parameters." };
    }

    const auditLog: MovieAuditLogRecord = {
      id: `audit-${Date.now()}`,
      action: "UPDATED",
      movieId,
      movieTitle: movieId,
      theatreId,
      user: userId,
      timestamp,
      details: `Theatre ${theatreId} changed screening status of ${movieId} to ${status}`,
      status: "SUCCESS",
    };

    revalidatePath("/theatre/movies");
    return {
      success: true,
      data: { theatreId, movieId, status },
      auditLog,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to toggle theatre movie status.",
    };
  }
}
