"use server";

import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { publicTheatreService } from "@/lib/services/public-theatre.service";
import {
  loadPublicTheatreSchema,
  loadPublicShowsSchema,
  loadPublicMoviesSchema,
} from "@/lib/validation/public-theatre.validation";
import {
  PublicTheatreView,
  PublicShowItem,
  PublicMovieSummary,
  PublicAmenityItem,
  PublicGalleryImage,
  PublicContactView,
} from "@/types/public-theatre.types";

const PublicIdentifierSchema = z.object({
  theatreIdOrSlug: z.string().trim().min(1, "Identifier is required").max(100),
});

/**
 * ==============================================================================
 * CineSphere OS — Public Theatre Page Server Actions (Phase 3 – Part 13)
 * ==============================================================================
 * Reusable server actions for the Public Theatre Experience.
 * Gated by Public/Customer rate limiting and returning strictly sanitized
 * public-facing DTOs.
 * ==============================================================================
 */

// 1. Load Master Public Theatre Read Model
export const loadPublicTheatreAction = createProtectedAction<
  z.input<typeof loadPublicTheatreSchema>,
  PublicTheatreView
>(
  {
    actionName: "loadPublicTheatreAction",
    schema: loadPublicTheatreSchema,
    rateLimitCategory: "PUBLIC_DEFAULT",
    requiredRole: ["CUSTOMER", "STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
  },
  async (input, context) => {
    return publicTheatreService.getPublicTheatreView(input.slugOrId, {
      previewMode: input.previewMode,
      userRole: context.actor.role,
    });
  }
);

// 2. Load Filtered Public Shows for Date / Format
export const loadPublicTheatreShowsAction = createProtectedAction<
  z.input<typeof loadPublicShowsSchema>,
  PublicShowItem[]
>(
  {
    actionName: "loadPublicTheatreShowsAction",
    schema: loadPublicShowsSchema,
    rateLimitCategory: "PUBLIC_DEFAULT",
    requiredRole: ["CUSTOMER", "STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
  },
  async (input) => {
    const view = await publicTheatreService.getPublicTheatreView(input.theatreIdOrSlug);
    let shows = view.shows;

    if (input.date && input.date !== "Today" && input.date !== "All") {
      shows = shows.filter((s) => s.date === input.date);
    }
    if (input.format && input.format !== "All") {
      shows = shows.filter((s) =>
        s.format.toLowerCase().includes(input.format!.toLowerCase())
      );
    }
    if (input.movieId) {
      shows = shows.filter((s) => s.movieId === input.movieId);
    }

    return shows;
  }
);

// 3. Load Public Movies (Running & Upcoming)
export const loadPublicTheatreMoviesAction = createProtectedAction<
  z.input<typeof loadPublicMoviesSchema>,
  PublicMovieSummary[]
>(
  {
    actionName: "loadPublicTheatreMoviesAction",
    schema: loadPublicMoviesSchema,
    rateLimitCategory: "PUBLIC_DEFAULT",
    requiredRole: ["CUSTOMER", "STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
  },
  async (input) => {
    const view = await publicTheatreService.getPublicTheatreView(input.theatreIdOrSlug);
    if (input.status === "NOW_SHOWING") {
      return view.runningMovies;
    }
    if (input.status === "COMING_SOON") {
      return view.upcomingMovies;
    }
    return [...view.runningMovies, ...view.upcomingMovies];
  }
);

// 4. Load Public Amenities
export const loadPublicTheatreAmenitiesAction = createProtectedAction<
  z.input<typeof PublicIdentifierSchema>,
  PublicAmenityItem[]
>(
  {
    actionName: "loadPublicTheatreAmenitiesAction",
    schema: PublicIdentifierSchema,
    rateLimitCategory: "PUBLIC_DEFAULT",
    requiredRole: ["CUSTOMER", "STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
  },
  async (input) => {
    const view = await publicTheatreService.getPublicTheatreView(input.theatreIdOrSlug);
    return view.amenities;
  }
);

// 5. Load Public Gallery
export const loadPublicTheatreGalleryAction = createProtectedAction<
  z.input<typeof PublicIdentifierSchema>,
  PublicGalleryImage[]
>(
  {
    actionName: "loadPublicTheatreGalleryAction",
    schema: PublicIdentifierSchema,
    rateLimitCategory: "PUBLIC_DEFAULT",
    requiredRole: ["CUSTOMER", "STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
  },
  async (input) => {
    const view = await publicTheatreService.getPublicTheatreView(input.theatreIdOrSlug);
    return view.branding.gallery;
  }
);

// 6. Load Public Contact Directory
export const loadPublicTheatreContactAction = createProtectedAction<
  z.input<typeof PublicIdentifierSchema>,
  PublicContactView
>(
  {
    actionName: "loadPublicTheatreContactAction",
    schema: PublicIdentifierSchema,
    rateLimitCategory: "PUBLIC_DEFAULT",
    requiredRole: ["CUSTOMER", "STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
  },
  async (input) => {
    const view = await publicTheatreService.getPublicTheatreView(input.theatreIdOrSlug);
    return view.contact;
  }
);
