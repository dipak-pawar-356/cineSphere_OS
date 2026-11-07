import React from "react";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { MovieCard } from "@/components/cards/movie-card";
import { DUMMY_MOVIES } from "@/lib/constants/movies";
import { DUMMY_THEATRES } from "@/lib/constants/theatres";
import { formatDuration } from "@/lib/utils";
import { FormatBadge } from "@/components/badges/format-badge";
import { ComingSoonButton } from "@/components/buttons/coming-soon-button";
import { ComingSoon } from "@/components/placeholders/coming-soon";
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
  Compass,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface MovieDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { slug } = await params;

  const movie =
    DUMMY_MOVIES.find((m) => m.slug === slug) ||
    DUMMY_MOVIES[0];

  const relatedMovies = DUMMY_MOVIES.filter((m) => m.id !== movie.id).slice(0, 4);
  const recommendedTheatres = DUMMY_THEATRES.slice(0, 3);

  const mockShowtimes = [
    { time: "10:30 AM", hall: "Hall 1 — IMAX Laser", price: "$24", format: "IMAX" },
    { time: "01:45 PM", hall: "Hall 3 — Dolby Cinema", price: "$22", format: "Dolby Atmos" },
    { time: "05:00 PM", hall: "Hall 1 — IMAX Laser", price: "$26", format: "IMAX", fillingFast: true },
    { time: "08:30 PM", hall: "Hall 4 — 4DX Motion", price: "$28", format: "4DX", almostFull: true },
    { time: "11:15 PM", hall: "Hall 2 — Laser 4K", price: "$18", format: "2D" },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* 1. LARGE HERO BANNER */}
      <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[540px] bg-[#070B12] overflow-hidden">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8 relative z-10">
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
                <span className="text-xs text-[#94A3B8]">
                  Released: {movie.releaseDate}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {movie.title}
              </h1>

              <p className="text-xs sm:text-sm text-[#FBBF24] font-medium italic">
                &ldquo;{movie.tagline}&rdquo;
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#CBD5E1] pt-1">
                <span>{movie.genre.join(", ")}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#FBBF24]" />
                  {formatDuration(movie.durationMinutes)}
                </span>
                <span>•</span>
                <span>Languages: {movie.languages.join(", ")}</span>
                <span>•</span>
                <span>Dir: <strong className="text-white">{movie.director}</strong></span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <ComingSoonButton
                  featureName={`Seat Reservation: ${movie.title}`}
                  description={`The live 3D seating map and ticket checkout for "${movie.title}" will unlock in Phase 2.`}
                  size="md"
                  variant="primary"
                  label="Book Tickets (Disabled)"
                  className="font-bold gap-2"
                />
                <Button variant="outline" size="md" className="gap-2">
                  <Play className="h-4 w-4 text-[#FBBF24]" />
                  <span>Watch Trailer</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN DETAILS & CAST / SYNOPSIS BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Synopsis, Cast, Trailer, Gallery */}
          <div className="lg:col-span-2 space-y-8">
            {/* Synopsis */}
            <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Film className="h-4 w-4 text-[#FBBF24]" />
                <span>Synopsis</span>
              </h3>
              <p className="text-sm text-[#CBD5E1] leading-relaxed">
                {movie.description}
              </p>
            </div>

            {/* Official Trailer Video Frame */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Play className="h-4 w-4 text-[#FBBF24]" />
                  <span>Official Trailer & Featurette</span>
                </h3>
                <span className="text-xs text-[#94A3B8]">4K UHD • 60 FPS</span>
              </div>
              <VideoPlaceholder title={`${movie.title} — Official IMAX Theatrical Trailer`} duration="02:35" />
            </div>

            {/* Cast & Crew Placeholders */}
            <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-[#FBBF24]" />
                <span>Starring Cast</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {movie.cast.map((actor, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center gap-3"
                  >
                    <div className="h-10 w-10 rounded-full bg-[#161F2E] border border-[#2A3445] flex items-center justify-center font-bold text-xs text-[#FBBF24] shrink-0">
                      {actor.charAt(0)}
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-white text-xs truncate">{actor}</div>
                      <div className="text-[10px] text-[#94A3B8]">Lead Role</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery Placeholders */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#FBBF24]" />
                <span>Theatrical Stills & Behind the Scenes</span>
              </h3>
              <GalleryPlaceholder count={4} />
            </div>

            {/* Future 3D Trailer Preview Placeholder */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#161F2E] to-[#111827] border border-[#2A3445] space-y-2">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#FBBF24]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FBBF24]">
                  Future 3D Spatial Trailer Preview
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Interactive stereoscopic 3D trailer playback calibrated for VR and WebGL spatial canvas launches in Phase 2.
              </p>
            </div>
          </div>

          {/* Right Column: Upcoming Showtimes & Recommended Theatres */}
          <div className="space-y-6">
            {/* Showtimes Today Card */}
            <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#2A3445]">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-[#FBBF24]" />
                  <span>Showtimes Today</span>
                </h3>
                <span className="text-xs text-[#94A3B8] font-mono">Select Screen</span>
              </div>

              <div className="space-y-2">
                {mockShowtimes.map((show, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between hover:border-[#FBBF24]/50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-white text-xs flex items-center gap-2">
                        <span>{show.time}</span>
                        <FormatBadge format={show.format} size="xs" />
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">{show.hall}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#FBBF24]">{show.price}</span>
                      <ComingSoonButton
                        featureName={`Seat Hold: ${show.time}`}
                        description="Seat selection and lock orchestra activates in Phase 2."
                        size="xs"
                        variant="primary"
                        label="Select"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Theatres */}
            <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-[#2A3445]">
                <Building2 className="h-4 w-4 text-[#38BDF8]" />
                <span>Recommended Theatres</span>
              </h3>

              <div className="space-y-3">
                {recommendedTheatres.map((theatre) => (
                  <Link
                    key={theatre.id}
                    href={`/theatre/${theatre.slug}`}
                    className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] block hover:border-amber-400/50 transition-colors group"
                  >
                    <div className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors">
                      {theatre.name}
                    </div>
                    <div className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-[#FBBF24]" />
                      <span>{theatre.city}, {theatre.state}</span>
                      <span>•</span>
                      <span>{theatre.hallCount} Screens</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. RELATED MOVIES SECTION */}
        <div className="space-y-6 pt-6 border-t border-[#2A3445]">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Film className="h-5 w-5 text-[#FBBF24]" />
              <span>You Might Also Like</span>
            </h3>
            <Link href="/movies" className="text-xs text-[#FBBF24] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedMovies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
