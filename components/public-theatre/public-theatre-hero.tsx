"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { PublicTheatreView } from "@/types/public-theatre.types";
import {
  MapPin,
  Star,
  ExternalLink,
  Navigation,
  Ticket,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PublicTheatreHeroProps {
  theatre: PublicTheatreView;
}

export function PublicTheatreHero({ theatre }: PublicTheatreHeroProps) {
  const { branding, profile, location, shows, configuration } = theatre;
  const firstShowId = shows[0]?.id || `show-${theatre.slug}-1`;

  return (
    <div className="relative w-full h-[340px] sm:h-[450px] bg-[#070B12] overflow-hidden">
      {/* Background Hero Banner */}
      <Image
        src={branding.heroImageUrl || branding.bannerUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80"}
        alt={`${profile.displayName} Hero Banner`}
        fill
        priority
        unoptimized
        sizes="100vw"
        className="object-cover object-center opacity-40 brightness-75 transition-opacity duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070B12] via-[#070B12]/60 to-transparent" />

      {/* Hero Content Overlay */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 w-full">
          {/* Logo Avatar */}
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] flex items-center justify-center font-black text-[#070B12] text-2xl shadow-2xl border-4 border-[#070B12] shrink-0 overflow-hidden">
            {branding.logoUrl ? (
              <Image
                src={branding.logoUrl}
                alt={`${profile.displayName} Logo`}
                fill
                unoptimized
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <span>{profile.displayName.charAt(0)}</span>
            )}
          </div>

          {/* Title & Location Metadata */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#111827] border border-[#2A3445] text-[#FBBF24]">
                {profile.chainName || "CineSphere Circuit"}
              </span>

              <span className="text-xs px-2 py-0.5 rounded bg-[#111827] border border-[#2A3445] text-[#CBD5E1]">
                {profile.theatreType}
              </span>

              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Verified Cinema
              </span>

              <div className="flex items-center gap-1 text-xs text-[#FBBF24] font-bold">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>{theatre.reviewsSummary.averageRating.toFixed(1)}</span>
                <span className="text-[#94A3B8] font-normal">
                  ({theatre.reviewsSummary.totalReviews.toLocaleString()} ratings)
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight truncate">
              {profile.displayName}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#CBD5E1]">
              <MapPin className="h-4 w-4 text-[#FBBF24] shrink-0" />
              <span className="truncate max-w-xl">
                {location.completeAddress}
              </span>
              {location.landmark && (
                <span className="text-[#FBBF24] font-medium hidden md:inline">
                  (Near {location.landmark})
                </span>
              )}
              {location.googleMapsUrl && (
                <a
                  href={location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#FBBF24] hover:underline font-semibold ml-1 text-xs"
                  aria-label="View on Google Maps"
                >
                  <span>Maps</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {location.navigationUrl && (
                <a
                  href={location.navigationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:underline font-semibold ml-1.5 text-xs"
                  aria-label="Turn-by-turn directions"
                >
                  <Navigation className="h-3 w-3" />
                  <span>Directions</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Book Button */}
          <div className="pt-2 sm:pt-0 shrink-0">
            <Link href={`/booking/${firstShowId}`}>
              <Button
                variant="primary"
                size="md"
                className="font-bold shadow-lg shadow-amber-400/20 gap-2 cursor-pointer"
              >
                <Ticket className="h-4 w-4" /> Book Next Show
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
