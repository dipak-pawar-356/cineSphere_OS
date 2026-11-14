"use client";

import React from "react";
import Link from "next/link";
import { PublicTheatreView } from "@/types/public-theatre.types";
import { PublicTheatreHero } from "./public-theatre-hero";
import { PublicTheatreSpecs } from "./public-theatre-specs";
import { PublicTheatreAbout } from "./public-theatre-about";
import { PublicTheatreShowsSection } from "./public-theatre-shows-section";
import { PublicTheatreUpcomingMovies } from "./public-theatre-upcoming-movies";
import { PublicTheatreHallsSection } from "./public-theatre-halls-section";
import { PublicTheatreAmenitiesSection } from "./public-theatre-amenities-section";
import { PublicTheatreGallerySection } from "./public-theatre-gallery-section";
import { PublicTheatreOperatingHoursSection } from "./public-theatre-operating-hours-section";
import { PublicTheatreContactSection } from "./public-theatre-contact-section";
import { PublicTheatreReviewsPlaceholder } from "./public-theatre-reviews-placeholder";
import { ChevronRight } from "lucide-react";

export interface PublicTheatreViewContainerProps {
  theatre: PublicTheatreView;
}

export function PublicTheatreViewContainer({ theatre }: PublicTheatreViewContainerProps) {
  const { profile } = theatre;

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <nav className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-[#64748B]" />
          <Link href="/theatres" className="hover:text-white transition-colors">
            Cinema Complexes
          </Link>
          <ChevronRight className="h-3 w-3 text-[#64748B]" />
          <span className="text-[#FBBF24] font-medium truncate">{profile.displayName}</span>
        </nav>
      </div>

      {/* 2. Hero Banner */}
      <PublicTheatreHero theatre={theatre} />

      {/* 3. Main Body Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Quick Specs */}
        <PublicTheatreSpecs theatre={theatre} />

        {/* Profile & About */}
        <PublicTheatreAbout theatre={theatre} />

        {/* Now Screening & Shows (Journey 3 Convergence) */}
        <PublicTheatreShowsSection theatre={theatre} />

        {/* Upcoming Movies Premiere Showcase */}
        <PublicTheatreUpcomingMovies theatre={theatre} />

        {/* Auditorium Fleet & Projection Systems */}
        <PublicTheatreHallsSection theatre={theatre} />

        {/* Amenities, Facilities & Guest Services */}
        <PublicTheatreAmenitiesSection theatre={theatre} />

        {/* Architectural Showcase & Gallery */}
        <PublicTheatreGallerySection theatre={theatre} />

        {/* Operating Hours & Weekly Schedule */}
        <PublicTheatreOperatingHoursSection theatre={theatre} />

        {/* Contact Directory & Navigation Hub */}
        <PublicTheatreContactSection theatre={theatre} />

        {/* Reviews & Guest Experience Placeholder */}
        <PublicTheatreReviewsPlaceholder theatre={theatre} />
      </div>
    </div>
  );
}
