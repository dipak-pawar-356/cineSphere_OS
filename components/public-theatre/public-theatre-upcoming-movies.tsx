"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { PublicTheatreView } from "@/types/public-theatre.types";
import { Calendar, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface PublicTheatreUpcomingMoviesProps {
  theatre: PublicTheatreView;
}

export function PublicTheatreUpcomingMovies({ theatre }: PublicTheatreUpcomingMoviesProps) {
  const { upcomingMovies, profile } = theatre;

  if (upcomingMovies.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <span>Coming Soon to {profile.displayName}</span>
          </h2>
          <p className="text-xs text-[#94A3B8]">
            Upcoming blockbuster releases scheduled for premiere on our auditoriums.
          </p>
        </div>

        <Badge variant="secondary" size="sm" className="font-mono">
          {upcomingMovies.length} Premieres
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {upcomingMovies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movie/${movie.slug}`}
            className="group rounded-2xl bg-[#161F2E] border border-[#2A3445] overflow-hidden hover:border-amber-400/50 transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-[2/3] w-full bg-[#070B12] overflow-hidden">
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-300 font-mono border border-amber-400/30">
                {movie.certification}
              </div>
            </div>

            <div className="p-3 space-y-1">
              <h4 className="text-xs font-bold text-white group-hover:text-[#FBBF24] transition-colors truncate">
                {movie.title}
              </h4>
              <div className="flex items-center gap-1 text-[10px] text-[#94A3B8]">
                <Calendar className="h-3 w-3 text-amber-400 shrink-0" />
                <span className="truncate">{movie.releaseDate}</span>
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                {movie.formats.slice(0, 2).join(", ")}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
