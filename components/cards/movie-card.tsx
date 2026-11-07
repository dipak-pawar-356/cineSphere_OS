"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Calendar, Sparkles, Eye, Ticket } from "lucide-react";
import { Movie } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { FormatBadge } from "@/components/badges/format-badge";
import { ComingSoonButton } from "@/components/buttons/coming-soon-button";
import { cn } from "@/lib/utils";

export interface MovieCardProps {
  movie: Movie;
  variant?: "vertical" | "horizontal";
  className?: string;
}

export function MovieCard({ movie, variant = "vertical", className }: MovieCardProps) {
  if (variant === "horizontal") {
    return (
      <div
        className={cn(
          "group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-[#161F2E]/90 border border-white/5 hover:border-[#FBBF24]/40 transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/5",
          className
        )}
      >
        {/* Poster side */}
        <Link href={`/movie/${movie.slug}`} className="relative w-full sm:w-48 h-64 sm:h-auto shrink-0 overflow-hidden bg-[#070B12] block">
          <Image
            src={movie.poster}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 100vw, 200px"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#161F2E] sm:from-transparent sm:bg-gradient-to-r sm:to-[#161F2E]/80 via-transparent" />

          {/* Rating Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-amber-400/30 text-amber-400 text-xs font-bold shadow-lg">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>

          {movie.isComingSoon && (
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 backdrop-blur-md text-blue-300 text-[10px] font-semibold tracking-wider uppercase">
              Coming Soon
            </div>
          )}
        </Link>

        {/* Content side */}
        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {movie.formats.map((fmt) => (
                <FormatBadge key={fmt} format={fmt} size="xs" />
              ))}
              <span className="text-[11px] text-[#9CA3AF] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-semibold">
                {movie.certification}
              </span>
            </div>

            <Link href={`/movie/${movie.slug}`}>
              <h3 className="font-bold text-lg sm:text-xl text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                {movie.title}
              </h3>
            </Link>

            <div className="mt-1 flex items-center gap-3 text-xs text-[#9CA3AF]">
              <span>{movie.genre.join(", ")}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-400/80" />
                {formatDuration(movie.durationMinutes)}
              </span>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-[#9CA3AF] line-clamp-2 leading-relaxed">
              {movie.description}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
            <span className="text-xs text-[#9CA3AF] truncate">
              Dir: <span className="text-white font-medium">{movie.director}</span>
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/movie/${movie.slug}`}
                className="px-3 py-1.5 rounded-xl bg-[#111827] hover:bg-[#161F2E] border border-[#2A3445] text-xs font-semibold text-white transition-colors flex items-center gap-1"
              >
                <Eye className="h-3.5 w-3.5 text-[#FBBF24]" />
                <span>Details</span>
              </Link>
              <ComingSoonButton
                featureName={`Ticket Booking: ${movie.title}`}
                description={`The live booking pipeline and 3D seat picker for "${movie.title}" will unlock in Phase 2.`}
                size="sm"
                variant={movie.isComingSoon ? "outline" : "primary"}
                label={movie.isComingSoon ? "Preview" : "Book Now"}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vertical card (Grid standard)
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl bg-[#161F2E]/90 border border-white/5 hover:border-amber-400/30 transition-all duration-300 shadow-xl overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-500/10",
        className
      )}
    >
      {/* Poster */}
      <Link href={`/movie/${movie.slug}`} className="relative aspect-[2/3] w-full overflow-hidden bg-[#070B12] block">
        <Image
          src={movie.poster}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161F2E] via-transparent to-transparent opacity-90" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-amber-400/30 text-amber-400 text-xs font-bold shadow-lg">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>

          {movie.isComingSoon ? (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/25 border border-blue-400/40 backdrop-blur-md text-blue-300 text-[10px] font-bold tracking-wider uppercase">
              Coming Soon
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-black/60 backdrop-blur-md text-[#9CA3AF] border border-white/10">
              {movie.certification}
            </span>
          )}
        </div>

        {/* Bottom formats on poster */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1">
          {movie.formats.slice(0, 3).map((fmt) => (
            <FormatBadge key={fmt} format={fmt} size="xs" />
          ))}
          {movie.formats.length > 3 && (
            <span className="text-[10px] font-semibold text-[#9CA3AF] bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
              +{movie.formats.length - 3}
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between text-xs text-[#9CA3AF] mb-1.5">
            <span className="truncate">{movie.genre.slice(0, 2).join(" • ")}</span>
            <span className="shrink-0 flex items-center gap-1 text-[11px]">
              <Clock className="h-3 w-3 text-amber-400/70" />
              {formatDuration(movie.durationMinutes)}
            </span>
          </div>

          <Link href={`/movie/${movie.slug}`}>
            <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1">
              {movie.title}
            </h3>
          </Link>

          <p className="mt-1 text-xs text-[#9CA3AF] line-clamp-1">
            {movie.languages.join(", ")}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          <Link
            href={`/movie/${movie.slug}`}
            className="text-[11px] font-semibold text-[#9CA3AF] hover:text-[#FBBF24] transition-colors flex items-center gap-1"
          >
            <Eye className="h-3 w-3" /> Details
          </Link>

          <ComingSoonButton
            featureName={`Booking Engine: ${movie.title}`}
            description={`Seats and showtimes for ${movie.title} will be active when booking logic connects in Phase 2.`}
            size="sm"
            variant={movie.isComingSoon ? "outline" : "primary"}
            className="w-full max-w-[100px]"
            label={movie.isComingSoon ? "Preview" : "Book"}
          />
        </div>
      </div>
    </div>
  );
}
