import React from "react";
import Image from "next/image";
import Link from "next/link";
import { DUMMY_THEATRES } from "@/lib/constants/theatres";
import { DUMMY_MOVIES } from "@/lib/constants/movies";
import { FormatBadge } from "@/components/badges/format-badge";
import { ComingSoonButton } from "@/components/buttons/coming-soon-button";
import { GalleryPlaceholder } from "@/components/media";
import {
  Building2,
  MapPin,
  Star,
  Monitor,
  CheckCircle2,
  Car,
  Utensils,
  Accessibility,
  Boxes,
  Film,
  Calendar,
  Clock,
  Sparkles,
  Compass,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface TheatreDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TheatreDetailPage({ params }: TheatreDetailPageProps) {
  const { slug } = await params;

  const theatre =
    DUMMY_THEATRES.find((t) => t.slug === slug) ||
    DUMMY_THEATRES[0];

  const currentMovies = DUMMY_MOVIES.slice(0, 4);

  const mockHalls = [
    { name: "Auditorium 1", format: "IMAX with Laser", capacity: "420 Recliners", sound: "12-Channel IMAX Audio", status: "Active" },
    { name: "Auditorium 2", format: "Dolby Cinema", capacity: "280 Recliners", sound: "Dolby Atmos 128-Ch", status: "Active" },
    { name: "Auditorium 3", format: "4DX Motion", capacity: "180 Motion Seats", sound: "7.1 Surround", status: "Active" },
    { name: "Auditorium 4-6", format: "Laser Digital 4K", capacity: "160 Seats each", sound: "Dolby 7.1", status: "Active" },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* 1. LARGE HERO BANNER */}
      <div className="relative w-full h-[320px] sm:h-[440px] bg-[#070B12] overflow-hidden">
        <Image
          src={theatre.banner}
          alt={theatre.name}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-50 brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B12] via-[#070B12]/60 to-transparent" />

        {/* Hero Overlay */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 w-full">
            {/* Logo Badge */}
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] flex items-center justify-center font-black text-[#070B12] text-2xl shadow-2xl border-4 border-[#070B12] shrink-0">
              {theatre.logo}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#111827] border border-[#2A3445] text-[#FBBF24]">
                  {theatre.chain} Circuit
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                  Active & Calibrated
                </span>
                <div className="flex items-center gap-1 text-xs text-[#FBBF24] font-bold">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{theatre.rating.toFixed(1)}</span>
                  <span className="text-[#94A3B8] font-normal">({theatre.reviewsCount} reviews)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {theatre.name}
              </h1>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#CBD5E1]">
                <MapPin className="h-4 w-4 text-[#FBBF24] shrink-0" />
                <span>{theatre.address}, {theatre.city}, {theatre.state}</span>
                {theatre.distanceKm && (
                  <span className="text-[#94A3B8]">({theatre.distanceKm} km away)</span>
                )}
              </div>
            </div>

            <div className="pt-2 sm:pt-0 shrink-0">
              <ComingSoonButton
                featureName={`Showtimes at ${theatre.name}`}
                description="Live seat reservation and booking connects in Phase 2."
                size="md"
                variant="primary"
                label="Book Tickets (Disabled)"
                className="font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. BODY CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Quick Specs Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
            <div className="text-[10px] text-[#94A3B8] uppercase font-bold">Total Screens</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5">{theatre.hallCount} Auditoriums</div>
          </div>
          <div className="p-4 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
            <div className="text-[10px] text-[#94A3B8] uppercase font-bold">Flagship Hall</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#FBBF24] mt-0.5">IMAX Laser</div>
          </div>
          <div className="p-4 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
            <div className="text-[10px] text-[#94A3B8] uppercase font-bold">Pricing Tier</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5">{theatre.pricingTier}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
            <div className="text-[10px] text-[#94A3B8] uppercase font-bold">Parking Capacity</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-0.5">Valet Available</div>
          </div>
        </div>

        {/* 3. CURRENT SHOWING MOVIES PLACEHOLDER */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Film className="h-5 w-5 text-[#FBBF24]" />
              <span>Current Movies at this Complex</span>
            </h3>
            <Link href="/movies" className="text-xs text-[#FBBF24] hover:underline flex items-center gap-1">
              <span>View All Movies</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentMovies.map((movie) => (
              <div
                key={movie.id}
                className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col justify-between space-y-3"
              >
                <div className="flex gap-3">
                  <div className="relative w-16 h-24 rounded-lg overflow-hidden bg-[#070B12] shrink-0 border border-[#2A3445]">
                    <Image src={movie.poster} alt={movie.title} fill className="object-cover" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-xs line-clamp-1">{movie.title}</h4>
                    <div className="text-[10px] text-[#94A3B8]">{movie.genre.slice(0, 2).join(", ")}</div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {movie.formats.slice(0, 2).map((fmt) => (
                        <FormatBadge key={fmt} format={fmt} size="xs" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#2A3445] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#FBBF24]">4 Showtimes</span>
                  <ComingSoonButton
                    featureName={`Showtimes for ${movie.title}`}
                    description="Live showtime matrix activates in Phase 2."
                    size="xs"
                    variant="primary"
                    label="Shows"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. AUDITORIUM / HALL LIST PLACEHOLDER */}
        <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Monitor className="h-5 w-5 text-[#38BDF8]" />
            <span>Auditorium Breakdown & Acoustic Telemetry</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mockHalls.map((hall, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <span>{hall.name}</span>
                    <Badge variant="primary" size="sm">
                      {hall.format}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">
                    {hall.capacity} • {hall.sound}
                  </div>
                </div>

                <span className="h-2 w-2 rounded-full bg-emerald-400" title="Screen Operational" />
              </div>
            ))}
          </div>
        </div>

        {/* 5. AMENITIES: FOOD COURT, PARKING, ACCESSIBILITY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
              <Utensils className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-base">Gourmet Food Court</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Artisan cinema dining, craft cocktails, gourmet popcorn flavors, and seat-level waiter delivery available across all auditoriums.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#38BDF8]">
              <Car className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-base">Parking & Valet</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Dedicated cinema parking structure with EV fast charging bays, 4 hours ticket validation, and executive valet drop-off at entrance.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-emerald-400">
              <Accessibility className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-base">Accessibility Services</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Elevator access to all tiers, wheelchair companion spaces, Dolby Fidelio closed-caption devices, and assistive audio receivers.
            </p>
          </div>
        </div>

        {/* 6. FUTURE 3D HALL PREVIEW PLACEHOLDER */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#161F2E] via-[#111827] to-[#161F2E] border border-[#2A3445] text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mx-auto">
            <Boxes className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xl font-bold text-white">
              Future 3D Hall & Seating Map Visualizer
            </h4>
            <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
              Inspect your seat sightlines and Dolby Atmos sound dispersion in realistic 3D WebGL space. Available in Phase 2.
            </p>
          </div>
        </div>

        {/* 7. GALLERY & MAP PLACEHOLDER */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#FBBF24]" />
            <span>Venue Gallery</span>
          </h3>
          <GalleryPlaceholder count={4} />
        </div>
      </div>
    </div>
  );
}
