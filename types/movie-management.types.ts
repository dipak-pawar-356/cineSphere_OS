import { ID, MediaAsset } from "./common.types";
import { MovieFormat, MovieLanguage, Genre, Certification } from "./movie.types";

/**
 * ==============================================================================
 * CineSphere OS — Movie Management Subsystem Types (Phase 2 – Part 7)
 * ==============================================================================
 * Core Architectural Principle:
 * Movies are PLATFORM-LEVEL master entities.
 * A Movie represents the film itself (creative assets, metadata, cast, crew).
 * A Movie NEVER contains: Pricing, Seats, Hall information, Bookings, or Payments.
 * Those belong strictly to Shows.
 *
 * Two-Layer Architecture:
 * 1. Global Master Movie Library (Super Admin)
 * 2. Theatre Movie Catalog (Tenant-scoped availability linking to Master Movies)
 * ==============================================================================
 */

export type MasterMovieStatus =
  | "Draft"
  | "Upcoming"
  | "Now Showing"
  | "Archived"
  | "Inactive";

export type MasterMovieCertificate =
  | "U"
  | "UA"
  | "UA 13+"
  | "UA 16+"
  | "A"
  | "S"
  | "PG-13"
  | "R"
  | string;

export type MasterMovieLanguage =
  | "Hindi"
  | "English"
  | "Marathi"
  | "Tamil"
  | "Telugu"
  | "Kannada"
  | "Malayalam"
  | "Gujarati"
  | "Punjabi"
  | "Bengali"
  | string;

export type MasterMovieGenre =
  | "Action"
  | "Adventure"
  | "Comedy"
  | "Drama"
  | "Fantasy"
  | "Horror"
  | "Romance"
  | "Sci-Fi"
  | "Thriller"
  | "Animation"
  | "Biography"
  | "Crime"
  | "Documentary"
  | "Family"
  | "Mystery"
  | "Sports"
  | "War"
  | string;

export type MasterMovieFormat =
  | "2D"
  | "3D"
  | "IMAX"
  | "4DX"
  | "ScreenX"
  | "Dolby Cinema"
  | "IMAX 3D"
  | "Laser 4K"
  | "70mm Film"
  | string;

export type CrewRole =
  | "Director"
  | "Producer"
  | "Writer"
  | "Music Director"
  | "Cinematographer"
  | "Editor"
  | "Choreographer"
  | "Action Director"
  | string;

export interface MovieCastItem {
  id: string;
  actorName: string;
  characterName: string;
  profileImage: string;
  displayOrder: number;
  biography?: string;
}

export interface MovieCrewItem {
  id: string;
  name: string;
  role: CrewRole;
  profileImage?: string;
  displayOrder: number;
}

export interface MovieTrailerItem {
  id: string;
  title: string;
  videoUrl: string;
  platform: "YouTube" | "Vimeo" | "Self-Hosted" | "External";
  thumbnailUrl: string;
  duration: string;
  isFeatured: boolean;
  order: number;
}

export interface MovieGalleryImage {
  id: string;
  url: string;
  altText?: string;
  order: number;
  type?: "poster" | "banner" | "landscape" | "portrait" | "gallery" | "behind-the-scenes";
}

/**
 * Global Master Movie Entity
 * Canonical platform-level record managed by Super Admin.
 */
export interface GlobalMasterMovie {
  id: string;
  slug: string;
  title: string;
  originalTitle?: string;
  synopsis: string;
  shortDescription?: string;
  fullDescription?: string;
  durationMinutes: number;
  releaseDate: string; // ISO YYYY-MM-DD
  certificate: MasterMovieCertificate;
  status: MasterMovieStatus;
  primaryLanguage: MasterMovieLanguage;
  availableLanguages: MasterMovieLanguage[];
  formats: MasterMovieFormat[];
  genres: MasterMovieGenre[];
  productionHouse?: string;
  distributor?: string;
  country: string;
  imdbRating?: string;
  websiteUrl?: string;

  // Media Management
  posterUrl: string;
  bannerUrl: string;
  landscapeBannerUrl?: string;
  portraitBannerUrl?: string;
  galleryImages: MovieGalleryImage[];
  trailers: MovieTrailerItem[];

  // Cast & Crew
  cast: MovieCastItem[];
  crew: MovieCrewItem[];

  // Rating & Meta
  rating: number; // e.g. 8.8
  isFeatured: boolean;
  isTrending: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Layer 2: Theatre Movie Catalog Item
 * Scoped to each Theatre Admin tenant (`theatreId`).
 * Links to a Global Master Movie without duplicating its metadata.
 */
export interface TheatreMovieCatalogItem {
  id: string;
  theatreId: string;
  movieId: string;
  status: "Now Showing" | "Upcoming" | "Archived" | "Inactive";
  licensedFormats: MasterMovieFormat[];
  licensedLanguages: MasterMovieLanguage[];
  kdmStatus: "Valid" | "Pending" | "Expired";
  kdmKeyId?: string;
  kdmValidUntil?: string;
  availableFrom: string;
  availableUntil?: string;
  addedAt: string;
  updatedAt: string;
}

/**
 * Enriched view joining Master Movie with Theatre Exhibition Details
 */
export interface EnrichedTheatreMovie extends GlobalMasterMovie {
  theatreCatalogId: string;
  theatreId: string;
  theatreStatus: "Now Showing" | "Upcoming" | "Archived" | "Inactive";
  licensedFormats: MasterMovieFormat[];
  licensedLanguages: MasterMovieLanguage[];
  kdmStatus: "Valid" | "Pending" | "Expired";
  kdmKeyId?: string;
  kdmValidUntil?: string;
}

/**
 * Input DTO for Creating / Updating Master Movies
 */
export interface CreateMasterMovieInput {
  title: string;
  slug?: string;
  originalTitle?: string;
  synopsis: string;
  shortDescription?: string;
  fullDescription?: string;
  durationMinutes: number;
  releaseDate: string;
  certificate: MasterMovieCertificate;
  status?: MasterMovieStatus;
  primaryLanguage: MasterMovieLanguage;
  availableLanguages: MasterMovieLanguage[];
  formats: MasterMovieFormat[];
  genres: MasterMovieGenre[];
  productionHouse?: string;
  distributor?: string;
  country?: string;
  imdbRating?: string;
  websiteUrl?: string;
  posterUrl: string;
  bannerUrl: string;
  landscapeBannerUrl?: string;
  portraitBannerUrl?: string;
  galleryImages?: MovieGalleryImage[];
  trailers?: MovieTrailerItem[];
  cast?: MovieCastItem[];
  crew?: MovieCrewItem[];
  isFeatured?: boolean;
  isTrending?: boolean;
}

export type UpdateMasterMovieInput = Partial<CreateMasterMovieInput>;

/**
 * Filter and Search options for Global Movie Library
 */
export interface MovieFilterOptions {
  query?: string;
  genre?: string;
  language?: string;
  format?: string;
  status?: string;
  certificate?: string;
  releaseYear?: string;
  durationMax?: number;
  actor?: string;
  director?: string;
}

/**
 * Audit log entry for movie mutations
 */
export interface MovieAuditLogRecord {
  id: string;
  action: "CREATED" | "UPDATED" | "ARCHIVED" | "RESTORED" | "DELETED" | "MEDIA_UPLOADED" | "THEATRE_LINKED";
  movieId: string;
  movieTitle: string;
  theatreId?: string;
  user: string;
  timestamp: string;
  details: string;
  status: "SUCCESS" | "FAILED";
}
