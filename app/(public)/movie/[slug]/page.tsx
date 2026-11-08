import React from "react";
import Image from "next/image";
import Link from "next/link";
import { DUMMY_MOVIES } from "@/lib/constants/movies";
import { MULTI_TENANT_THEATRES } from "@/data/theatres/multi-tenant-theatres";
import { DYNAMIC_SHOWS } from "@/data/shows/dynamic-shows";
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
  Compass,
  ArrowRight,
  ShieldCheck,
  Layers,
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

  // 1. Resolve Shows playing this movie (or fallback to active dynamic shows)
  const movieShows = DYNAMIC_SHOWS.filter(
    (s) =>
      s.movieId === movie.id ||
      s.movieTitle.toLowerCase().includes(movie.title.toLowerCase()) ||
      movie.title.toLowerCase().includes(s.movieTitle.toLowerCase())
  );

  const activeShows = movieShows.length > 0 ? movieShows : DYNAMIC_SHOWS;

  // 2. Group shows by Theatre
  const theatreMap = new Map<string, { theatre: (typeof MULTI_TENANT_THEATRES)[0]; shows: typeof activeShows }>();

  activeShows.forEach((show) => {
    const theatre =
      MULTI_TENANT_THEATRES.find((t) => t.id === show.theatreId) ||
      MULTI_TENANT_THEATRES[0];

    if (!theatreMap.has(theatre.id)) {
      theatreMap.set(theatre.id, { theatre, shows: [] });
    }
    theatreMap.get(theatre.id)!.shows.push(show);
  });

  const theatresPlayingMovie = Array.from(theatreMap.values());

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
                <Link href={`/booking/${activeShows[0]?.id || "show-pun-001"}`}>
                  <Button
                    size="md"
                    variant="primary"
                    className="font-bold gap-2 shadow-xl shadow-amber-400/20"
                  >
                    <Ticket className="h-4 w-4" /> Book Tickets
                  </Button>
                </Link>
                <Button variant="outline" size="md" className="gap-2">
                  <Play className="h-4 w-4 text-[#FBBF24]" />
                  <span>Watch Trailer</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN DETAILS & THEATRE SHOWTIME SCHEDULE */}
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
              <VideoPlaceholder title={`${movie.title} — Official Theatrical Trailer`} duration="02:35" />
            </div>

            {/* Cast & Crew */}
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

            {/* Gallery */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#FBBF24]" />
                <span>Theatrical Stills</span>
              </h3>
              <GalleryPlaceholder count={4} />
            </div>
          </div>

          {/* Right Column: Dynamic Theatres & Showtimes */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#2A3445]">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-[#FBBF24]" />
                  <span>Theatres Playing This Movie</span>
                </h3>
                <span className="text-xs text-[#94A3B8] font-mono">Real-Time</span>
              </div>

              {theatresPlayingMovie.map(({ theatre, shows }) => (
                <div
                  key={theatre.id}
                  className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs hover:text-[#FBBF24] transition-colors">
                        <Link href={`/theatre/${theatre.slug}`}>
                          {theatre.name}
                        </Link>
                      </h4>
                      <p className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-[#FBBF24] shrink-0" />
                        <span>{theatre.city} • {theatre.distanceKm || 2.4} km</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-[#94A3B8] block">Starts from</span>
                      <span className="font-mono text-xs font-bold text-[#FBBF24]">
                        ₹{Math.min(...shows.map((s) => s.ticketPrice || 200))}
                      </span>
                    </div>
                  </div>

                  {/* Shows for this theatre */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {shows.map((show) => (
                      <Link key={show.id} href={`/booking/${show.id}`} className="group">
                        <div className="p-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] group-hover:border-[#FBBF24] transition-all text-center space-y-1">
                          <div className="font-mono font-bold text-xs text-white group-hover:text-[#FBBF24]">
                            {show.startTime}
                          </div>
                          <div className="text-[9px] text-[#94A3B8] truncate">
                            {show.format} • {show.language}
                          </div>
                          <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                            ₹{show.ticketPrice || 200}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Architecture Callout */}
            <div className="p-4 rounded-2xl bg-[#111827]/80 border border-[#2A3445] space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#FBBF24] font-bold">
                <Layers className="h-4 w-4" />
                <span>Show-Centric Concurrency</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Movies do not own seats or pricing. Each show binds this film to a physical hall layout and generates its own seat availability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
