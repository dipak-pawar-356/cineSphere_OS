"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { PublicTheatreView, PublicShowItem } from "@/types/public-theatre.types";
import { FormatBadge } from "@/components/badges/format-badge";
import { Badge } from "@/components/ui/badge";
import { Film, Calendar, Clock } from "lucide-react";
import { cn } from "@/utils";

export interface PublicTheatreShowsSectionProps {
  theatre: PublicTheatreView;
}

export function PublicTheatreShowsSection({ theatre }: PublicTheatreShowsSectionProps) {
  const { runningMovies, shows, profile, configuration } = theatre;

  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedFormat, setSelectedFormat] = useState("All");

  // Generate 7-Day Date Tabs
  const dateTabs = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isToday = i === 0;
      const isTomorrow = i === 1;
      const label = isToday
        ? "Today"
        : isTomorrow
        ? "Tomorrow"
        : d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      const isoDate = d.toISOString().split("T")[0];
      days.push({
        id: isToday ? "Today" : isoDate,
        label,
        dayNum,
        isoDate,
      });
    }
    return days;
  }, []);

  // Formats available in shows
  const availableFormats = useMemo(() => {
    const set = new Set<string>(["All"]);
    shows.forEach((s) => set.add(s.format));
    return Array.from(set);
  }, [shows]);

  // Filter shows by date & format, then group by movie
  const moviesWithShows = useMemo(() => {
    const movieMap = new Map<
      string,
      {
        movie: (typeof runningMovies)[0];
        shows: PublicShowItem[];
      }
    >();

    shows.forEach((show) => {
      // Format Filter
      if (
        selectedFormat !== "All" &&
        !show.format.toLowerCase().includes(selectedFormat.toLowerCase())
      ) {
        return;
      }

      // Date Filter
      if (selectedDate !== "Today" && show.date !== selectedDate) {
        return;
      }

      const foundMovie =
        runningMovies.find((m) => m.id === show.movieId || m.title === show.movieTitle) || {
          id: show.movieId,
          slug: show.movieId,
          title: show.movieTitle,
          posterUrl: show.moviePosterUrl,
          synopsis: "Theatrical presentation running at this complex.",
          genres: ["Action", "Sci-Fi"],
          languages: [show.language],
          durationMinutes: 150,
          certification: "UA",
          formats: [show.format],
          rating: 9.1,
          showCount: 4,
          status: "NOW_SHOWING" as const,
          releaseDate: "2026-11-01",
        };

      if (!movieMap.has(show.movieId)) {
        movieMap.set(show.movieId, {
          movie: foundMovie,
          shows: [],
        });
      }

      movieMap.get(show.movieId)!.shows.push(show);
    });

    return Array.from(movieMap.values());
  }, [shows, runningMovies, selectedDate, selectedFormat]);

  return (
    <div className="space-y-6">
      {/* 1. Date Tabs & Format Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A3445] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#FBBF24]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Screening Date & Formats:
            </span>
          </div>

          {/* Format Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-[#94A3B8] mr-1 hidden sm:inline">Format:</span>
            {availableFormats.map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setSelectedFormat(fmt)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                  selectedFormat === fmt
                    ? "bg-[#FBBF24] text-[#070B12] font-bold"
                    : "bg-[#161F2E] text-[#94A3B8] hover:text-white border border-[#2A3445]"
                )}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* 7-Day Date Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {dateTabs.map((dt) => {
            const isSelected = selectedDate === dt.id;
            return (
              <button
                key={dt.id}
                type="button"
                onClick={() => setSelectedDate(dt.id)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[85px] py-2 px-3 rounded-xl border text-center transition-all cursor-pointer shrink-0",
                  isSelected
                    ? "bg-[#FBBF24] text-[#070B12] border-[#FBBF24] shadow-md shadow-[#FBBF24]/20 font-bold"
                    : "bg-[#161F2E] text-[#94A3B8] border-[#2A3445] hover:text-white hover:border-[#38BDF8]"
                )}
              >
                <span className="text-[11px] font-bold uppercase">{dt.label}</span>
                <span className="text-xs font-mono font-semibold">{dt.dayNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Film className="h-5 w-5 text-[#FBBF24]" />
            <span>Now Screening at {profile.displayName}</span>
          </h2>
          <p className="text-xs text-[#94A3B8]">
            Select any scheduled showtime to enter the auditorium 2D seat selector.
          </p>
        </div>

        <Badge variant="warning" size="sm" className="font-mono">
          {moviesWithShows.length} Films Running
        </Badge>
      </div>

      {/* 3. Movie Cards with Showtimes */}
      {moviesWithShows.length > 0 ? (
        <div className="space-y-6">
          {moviesWithShows.map(({ movie, shows: movieShows }) => (
            <div
              key={movie.id}
              className="rounded-3xl bg-[#161F2E] border border-[#2A3445] p-5 sm:p-6 space-y-5 shadow-xl hover:border-[#2A3445]/90 transition-all"
            >
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {/* Poster */}
                <Link
                  href={`/movie/${movie.slug}`}
                  className="relative h-36 w-24 sm:h-44 sm:w-30 rounded-xl overflow-hidden shrink-0 border border-[#2A3445] shadow-lg group block"
                >
                  <Image
                    src={movie.posterUrl}
                    alt={movie.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Movie Information & Showtimes */}
                <div className="space-y-4 flex-1 min-w-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                        {movie.certification}
                      </span>
                      <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#FBBF24]" />
                        {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m
                      </span>
                      <span className="text-xs text-[#94A3B8]">•</span>
                      <span className="text-xs text-[#94A3B8]">
                        {movie.languages.join(", ")}
                      </span>
                    </div>

                    <Link href={`/movie/${movie.slug}`}>
                      <h3 className="text-lg sm:text-xl font-bold text-white hover:text-[#FBBF24] transition-colors leading-snug">
                        {movie.title}
                      </h3>
                    </Link>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {movie.genres.map((g) => (
                        <span
                          key={g}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[#111827] text-[#94A3B8] border border-[#2A3445]"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Showtime Grid */}
                  <div className="space-y-2 pt-2 border-t border-[#2A3445]/60">
                    <div className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider font-semibold">
                      Available Showtimes:
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {movieShows.map((show) => {
                        const isFillingFast = show.bookingStatusPlaceholder === "FILLING_FAST";
                        const isSoldOut = show.bookingStatusPlaceholder === "SOLD_OUT";

                        return (
                          <Link
                            key={show.id}
                            href={`/booking/${show.id}`}
                            className={cn(
                              "group/btn p-3 rounded-xl bg-[#111827] border border-[#2A3445] transition-all flex flex-col justify-between space-y-1.5 cursor-pointer",
                              isSoldOut
                                ? "opacity-60 pointer-events-none"
                                : "hover:border-[#FBBF24] hover:shadow-lg hover:shadow-amber-400/5"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm font-bold text-white group-hover/btn:text-[#FBBF24] transition-colors">
                                {show.startTime}
                              </span>
                              <FormatBadge format={show.format} size="xs" />
                            </div>

                            <div className="text-[10px] text-[#94A3B8] truncate">
                              {show.hallName}
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-[#1E293B] text-[10px]">
                              <span className="font-mono font-bold text-amber-400">
                                {show.formattedPrice}
                              </span>
                              <span
                                className={cn(
                                  "px-1.5 py-0.5 rounded text-[9px] font-semibold",
                                  isSoldOut
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                    : isFillingFast
                                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                )}
                              >
                                {isSoldOut
                                  ? "Sold Out"
                                  : isFillingFast
                                  ? "Filling Fast"
                                  : `${show.availableSeats} Left`}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-[#111827] border border-[#2A3445] space-y-2">
          <Film className="h-8 w-8 text-[#64748B] mx-auto" />
          <h3 className="text-base font-bold text-white">No shows matching filter</h3>
          <p className="text-xs text-[#94A3B8]">
            Try selecting &quot;All&quot; formats or selecting another date on the calendar tab.
          </p>
        </div>
      )}
    </div>
  );
}
