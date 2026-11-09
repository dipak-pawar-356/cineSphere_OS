"use client";

import React, { useState, useMemo, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCityStore } from "@/store/city-store";
import {
  getAllPublishedMovies,
  getAllPublishedShows,
  getAllPublishedTheatres,
} from "@/lib/engine/customer-discovery-engine";
import { formatDuration } from "@/lib/utils";
import { FormatBadge } from "@/components/badges/format-badge";
import { VideoPlaceholder, GalleryPlaceholder } from "@/components/media";
import {
  Star,
  Clock,
  Calendar,
  Film,
  Building2,
  Users,
  Play,
  Sparkles,
  Ticket,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Layers,
  ChevronRight,
  Armchair,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

export interface MovieDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { slug } = use(params);
  const { selectedCity, setCityModalOpen } = useCityStore();

  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  const allMovies = useMemo(() => getAllPublishedMovies(), []);
  const movie = useMemo(() => {
    return allMovies.find((m) => m.slug === slug) || allMovies[0];
  }, [allMovies, slug]);

  const allTheatres = useMemo(() => getAllPublishedTheatres(), []);
  const allShows = useMemo(() => getAllPublishedShows(), []);

  // Filter shows running this movie in the selected city
  const cityTheatres = useMemo(() => {
    return allTheatres.filter(
      (t) => t.city.toLowerCase() === selectedCity.name.toLowerCase()
    );
  }, [allTheatres, selectedCity]);

  // Generate 7-day date strip
  const dateOptions = useMemo(() => {
    const days = ["Today", "Tomorrow"];
    const dates = ["Nov 14", "Nov 15", "Nov 16", "Nov 17", "Nov 18", "Nov 19", "Nov 20"];
    return [
      { id: "Today", label: "Today", dateText: "Nov 14", dayOfWeek: "Thu" },
      { id: "Tomorrow", label: "Tomorrow", dateText: "Nov 15", dayOfWeek: "Fri" },
      { id: "Nov 16", label: "Sat", dateText: "Nov 16", dayOfWeek: "Sat" },
      { id: "Nov 17", label: "Sun", dateText: "Nov 17", dayOfWeek: "Sun" },
      { id: "Nov 18", label: "Mon", dateText: "Nov 18", dayOfWeek: "Mon" },
      { id: "Nov 19", label: "Tue", dateText: "Nov 19", dayOfWeek: "Tue" },
      { id: "Nov 20", label: "Wed", dateText: "Nov 20", dayOfWeek: "Wed" },
    ];
  }, []);

  // Filter and group shows by Theatre
  const theatresWithShows = useMemo(() => {
    const list: {
      theatre: (typeof allTheatres)[0];
      shows: typeof allShows;
    }[] = [];

    // Fallback to active theatres if none in current city
    const targetTheatres = cityTheatres.length > 0 ? cityTheatres : allTheatres.slice(0, 3);

    for (const th of targetTheatres) {
      let matchingShows = allShows.filter((s) => {
        const matchesMovie =
          s.movieId === movie.id ||
          s.movieTitle.toLowerCase().includes(movie.title.toLowerCase()) ||
          movie.title.toLowerCase().includes(s.movieTitle.toLowerCase());

        const matchesTheatre = s.theatreId === th.id || s.theatreName.includes(th.name);
        return matchesMovie && matchesTheatre;
      });

      // If no exact match, fallback to any available shows for that complex
      if (matchingShows.length === 0) {
        matchingShows = allShows.filter((s) => s.theatreId === th.id);
      }

      if (selectedFormat !== "All") {
        matchingShows = matchingShows.filter((s) =>
          s.format.toLowerCase().includes(selectedFormat.toLowerCase())
        );
      }

      if (selectedLanguage !== "All") {
        matchingShows = matchingShows.filter(
          (s) => s.language.toLowerCase() === selectedLanguage.toLowerCase()
        );
      }

      if (matchingShows.length > 0) {
        list.push({
          theatre: th,
          shows: matchingShows,
        });
      }
    }

    return list;
  }, [cityTheatres, allTheatres, allShows, movie, selectedFormat, selectedLanguage]);

  return (
    <div className="space-y-12 pb-20">
      {/* 1. Large Hero Banner */}
      <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[520px] bg-[#070B12] overflow-hidden">
        <Image
          src={movie.banner}
          alt={movie.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40 brightness-75 filter blur-xs"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B12] via-[#070B12]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070B12] via-transparent to-[#070B12]" />

        {/* Hero Overlay Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-8 relative z-10 space-y-4">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <Link href="/movies" className="hover:text-white transition-colors">
              Movies
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-amber-400 font-semibold truncate max-w-xs">{movie.title}</span>
          </nav>

          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 sm:gap-8 w-full">
            {/* Poster Card */}
            <div className="relative w-36 sm:w-48 lg:w-56 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-[#2A3445] shadow-[0_20px_50px_rgba(0,0,0,0.8)] shrink-0 bg-[#111827]">
              <Image
                src={movie.poster}
                alt={movie.title}
                fill
                sizes="(max-width: 640px) 150px, 220px"
                className="object-cover object-center"
              />
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-amber-400/30 text-amber-400 text-xs font-bold">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span>{movie.rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Movie Headline Info */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {movie.formats.map((fmt) => (
                  <FormatBadge key={fmt} format={fmt} size="sm" />
                ))}
                <span className="text-xs px-2 py-0.5 rounded bg-[#111827] border border-[#2A3445] text-white font-mono font-bold">
                  {movie.certification}
                </span>
                <span className="text-xs text-slate-400">
                  Release: {movie.releaseDate}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {movie.title}
              </h1>

              {movie.shortDescription && (
                <p className="text-xs sm:text-sm text-amber-400 font-medium italic">
                  &ldquo;{movie.shortDescription}&rdquo;
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span>{movie.genre.join(", ")}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  {formatDuration(movie.durationMinutes)}
                </span>
                <span>•</span>
                <span>Languages: {movie.languages.join(", ")}</span>
                <span>•</span>
                <span>Dir: <strong className="text-white">{movie.director}</strong></span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a href="#showtimes-section">
                  <Button
                    size="md"
                    variant="primary"
                    className="font-bold gap-2 shadow-xl shadow-amber-400/20"
                  >
                    <Ticket className="h-4 w-4" /> Book Tickets
                  </Button>
                </a>
                <Button variant="outline" size="md" className="gap-2">
                  <Play className="h-4 w-4 text-amber-400" />
                  <span>Watch Trailer</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SHOWTIMES & THEATRE SELECTION PANEL */}
      <div id="showtimes-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-24">
        {/* Date Selector Strip & Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#2A3445]/60 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Select Screening Date & Circuit
              </h2>
            </div>

            {/* City Switcher Pill */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Showing for:</span>
              <button
                type="button"
                onClick={() => setCityModalOpen(true)}
                className="font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{selectedCity.name}</span>
                <span className="text-[10px] text-slate-400">(Change)</span>
              </button>
            </div>
          </div>

          {/* 7-Day Date Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {dateOptions.map((opt) => {
              const isSelected = selectedDate === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedDate(opt.id)}
                  className={cn(
                    "p-2.5 rounded-xl border text-center transition-all cursor-pointer min-w-[76px] shrink-0",
                    isSelected
                      ? "bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-400/20"
                      : "bg-[#0B0F17] text-slate-300 border-[#2A3445] hover:border-slate-500 hover:bg-[#161F2E]"
                  )}
                >
                  <span className="text-[10px] uppercase font-semibold block">{opt.dayOfWeek}</span>
                  <span className="text-sm font-extrabold block mt-0.5">{opt.dateText.split(" ")[1]}</span>
                  <span className="text-[9px] text-slate-400 block">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Format & Language Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2A3445]/60 text-xs">
            <span className="text-slate-400 font-medium">Filter Formats:</span>
            {["All", "IMAX 3D", "Dolby Cinema", "Laser 4K", "2D"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFormat(f)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                  selectedFormat === f
                    ? "bg-amber-400/20 text-amber-300 border-amber-400"
                    : "bg-[#0B0F17] text-slate-400 border-[#2A3445] hover:text-white"
                )}
              >
                {f}
              </button>
            ))}

            <span className="text-slate-400 font-medium ml-2">Language:</span>
            {["All", "Telugu", "Hindi", "English", "Tamil"].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setSelectedLanguage(l)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                  selectedLanguage === l
                    ? "bg-amber-400/20 text-amber-300 border-amber-400"
                    : "bg-[#0B0F17] text-slate-400 border-[#2A3445] hover:text-white"
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Theatres Screening This Movie */}
        <div className="space-y-4">
          {theatresWithShows.map(({ theatre, shows }) => (
            <div
              key={theatre.id}
              className="p-5 rounded-2xl bg-[#111827] border border-[#2A3445] hover:border-slate-600 transition-all space-y-4 shadow-xl"
            >
              {/* Theatre Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A3445]/60 pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-white text-base hover:text-amber-400 transition-colors">
                      <Link href={`/theatre/${theatre.slug}`}>{theatre.name}</Link>
                    </h3>
                    <Badge variant="outline" size="sm" className="text-[10px]">
                      {theatre.chain}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{theatre.address} • {theatre.distancePlaceholder}</span>
                  </p>
                </div>

                {/* Amenities / Screen Formats */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {theatre.amenities.slice(0, 2).map((amenity) => (
                    <span
                      key={amenity}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#161F2E] text-slate-300 border border-[#2A3445]"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Showtimes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
                {shows.map((show) => {
                  const isSoldOut = show.availableSeats <= 0;
                  const isFastFilling = show.availableSeats < 25;

                  return (
                    <Link
                      key={show.id}
                      href={`/booking/${show.id}`}
                      className={cn(
                        "group p-3 rounded-xl border text-center space-y-1 transition-all duration-200 block",
                        isSoldOut
                          ? "bg-[#070B12]/60 border-[#2A3445] opacity-50 cursor-not-allowed pointer-events-none"
                          : "bg-[#0B0F17] border-[#2A3445] hover:border-amber-400 hover:bg-[#161F2E] hover:shadow-lg hover:shadow-amber-400/5 cursor-pointer"
                      )}
                    >
                      <div className="font-mono font-extrabold text-sm text-white group-hover:text-amber-400 transition-colors">
                        {show.startTime}
                      </div>

                      <div className="text-[10px] text-slate-400 font-medium truncate">
                        {show.format} • {show.language}
                      </div>

                      <div className="flex items-center justify-center gap-1 pt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[10px] font-mono font-bold text-amber-300">
                          ₹{show.ticketPrice}
                        </span>
                      </div>

                      <div className="text-[9px] text-slate-400 truncate">
                        {show.hallName}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {theatresWithShows.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-[#111827] border border-[#2A3445] space-y-3">
              <Armchair className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No screening schedules found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No shows match the selected date or format filters in {selectedCity.name}. Try changing your date or switching cities.
              </p>
              <Button variant="outline" size="sm" onClick={() => setCityModalOpen(true)}>
                Switch Circuit City
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 3. SYNOPSIS, TRAILERS, AND CAST DETAILS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Synopsis */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Film className="h-4 w-4 text-amber-400" />
                <span>Synopsis</span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">{movie.synopsis}</p>
            </div>

            {/* Trailer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Play className="h-4 w-4 text-amber-400" />
                  <span>Official Theatrical Trailer</span>
                </h3>
                <span className="text-xs text-slate-400">4K Ultra HD • Spatial Audio</span>
              </div>
              <VideoPlaceholder title={`${movie.title} — Official Trailer`} duration="02:35" />
            </div>

            {/* Cast & Crew */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="p-6 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-400" />
                  <span>Lead Cast</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {movie.cast.map((actor, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#0B0F17] border border-[#2A3445] flex items-center gap-3"
                    >
                      <div className="h-9 w-9 rounded-full bg-[#161F2E] border border-[#2A3445] flex items-center justify-center font-bold text-xs text-amber-400 shrink-0">
                        {actor.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-white text-xs truncate">{actor}</div>
                        <div className="text-[10px] text-slate-400">Cast</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Architecture Callout */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Layers className="w-4 h-4" />
                <span>Show-Centric Architecture</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Movies are canonical master records. When you click any showtime button above, the booking flow resolves the central Show ID connecting this movie to its specific auditorium and dynamic pricing profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
