import React from "react";
import Image from "next/image";
import Link from "next/link";
import { DUMMY_THEATRES } from "@/lib/constants/theatres";
import { DUMMY_MOVIES } from "@/lib/constants/movies";
import { MULTI_TENANT_THEATRES } from "@/data/theatres/multi-tenant-theatres";
import { DYNAMIC_SHOWS } from "@/data/shows/dynamic-shows";
import { FormatBadge } from "@/components/badges/format-badge";
import { ComingSoonButton } from "@/components/buttons/coming-soon-button";
import { GalleryPlaceholder } from "@/components/media";
import { Hall } from "@/types";
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
  Ticket,
  QrCode,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface TheatreDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TheatreDetailPage({ params }: TheatreDetailPageProps) {
  const { slug } = await params;

  // Resolve Theatre (Multi-Tenant first, then fallback to DUMMY_THEATRES)
  const multiTenantMatch = MULTI_TENANT_THEATRES.find(
    (t) => t.slug === slug || t.id === slug
  );
  const fallbackMatch = DUMMY_THEATRES.find((t) => t.slug === slug) || DUMMY_THEATRES[0];
  const theatre = multiTenantMatch || fallbackMatch;

  // Resolve scheduled shows running at this theatre
  const theatreShows = DYNAMIC_SHOWS.filter(
    (s) => s.theatreId === theatre.id || s.theatreName === theatre.name
  );
  const activeShows = theatreShows.length > 0 ? theatreShows : DYNAMIC_SHOWS.slice(0, 2);

  const currentMovies = DUMMY_MOVIES.slice(0, 4);

  // Resolved Halls for this theatre
  const hallsList: Hall[] = (multiTenantMatch?.halls && multiTenantMatch.halls.length > 0)
    ? multiTenantMatch.halls
    : [
        {
          id: "hall-1",
          theatreId: theatre.id,
          name: "Hall 1 - IMAX Laser",
          hallNumber: 1,
          screenType: "IMAX Laser",
          capacity: 100,
          soundSystem: "IMAX 12-Channel High-Dynamic Precision Array",
          projectionType: "IMAX Dual 4K Commercial Laser",
          status: "Active",
        },
        {
          id: "hall-2",
          theatreId: theatre.id,
          name: "Hall 2 - Dolby Cinema",
          hallNumber: 2,
          screenType: "Dolby Cinema",
          capacity: 120,
          soundSystem: "Dolby Atmos 64-Channel Spatial Matrix",
          projectionType: "Dolby Vision Dual 4K Laser",
          status: "Active",
        },
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
              {theatre.logo && typeof theatre.logo === "string" && theatre.logo.startsWith("http") ? (
                <img src={theatre.logo} alt={theatre.name} className="h-full w-full object-cover rounded-2xl" />
              ) : (
                <span>{theatre.name.charAt(0)}</span>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#111827] border border-[#2A3445] text-[#FBBF24]">
                  {theatre.chain || "CineSphere Circuit"}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                  Multi-Tenant Calibrated
                </span>
                <div className="flex items-center gap-1 text-xs text-[#FBBF24] font-bold">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{(theatre.rating || 4.8).toFixed(1)}</span>
                  <span className="text-[#94A3B8] font-normal">({theatre.reviewsCount || 1420} reviews)</span>
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
              <Link href={`/booking/${activeShows[0]?.id || "show-pun-001"}`}>
                <Button variant="primary" size="md" className="font-bold shadow-lg shadow-amber-400/20 gap-2">
                  <Ticket className="h-4 w-4" /> Book Seats
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BODY CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Quick Specs Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
            <div className="text-[10px] text-[#94A3B8] uppercase font-bold">Auditorium Fleet</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5">
              {hallsList.length} Halls
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
            <div className="text-[10px] text-[#94A3B8] uppercase font-bold">Flagship Hall</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#FBBF24] mt-0.5">
              {hallsList[0]?.name?.split(" - ")[1] || "IMAX Laser"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
            <div className="text-[10px] text-[#94A3B8] uppercase font-bold">Direct UPI Rail</div>
            <div className="text-sm font-mono text-emerald-400 mt-1 truncate">
              {theatre.upiDetails?.upiId || "theatre@icici"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
            <div className="text-[10px] text-[#94A3B8] uppercase font-bold">GST Compliance</div>
            <div className="text-sm font-mono text-white mt-1">
              {theatre.gstNumber || "27AAACG0921N1Z1"}
            </div>
          </div>
        </div>

        {/* 3. SCHEDULED SHOWTIMES TODAY */}
        <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#2A3445]">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Ticket className="h-5 w-5 text-[#FBBF24]" />
                <span>Live Shows Scheduled Today</span>
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Shows dynamically connect films, physical auditorium layouts, and time-slot pricing.
              </p>
            </div>
            <Badge variant="primary" size="sm" className="font-mono">
              {activeShows.length} Shows Active
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeShows.map((show) => (
              <div
                key={show.id}
                className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] flex flex-col justify-between space-y-3 hover:border-[#FBBF24]/50 transition-all shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                        {show.startTime}
                      </span>
                      <FormatBadge format={show.format} size="xs" />
                      <span className="text-xs text-[#94A3B8]">{show.language}</span>
                    </div>
                    <h4 className="font-extrabold text-white text-base leading-snug">
                      {show.movieTitle}
                    </h4>
                    <p className="text-xs text-[#94A3B8]">
                      {show.hallName} • {show.totalSeats} Total Seats
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-[#94A3B8] block">From</span>
                    <span className="font-mono text-base font-bold text-[#FBBF24]">
                      ₹{show.ticketPrice || 200}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                    <Layers className="h-3 w-3 text-[#38BDF8]" />
                    Section Pricing Enabled
                  </span>
                  <Link href={`/booking/${show.id}`}>
                    <Button variant="primary" size="xs" className="font-bold gap-1 shadow-sm">
                      Select Seats <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. AUDITORIUM / HALL LIST */}
        <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Monitor className="h-5 w-5 text-[#38BDF8]" />
            <span>Auditorium Breakdown & Reusable Layout Fleet</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hallsList.map((hall: Hall, idx: number) => (
              <div
                key={hall.id || idx}
                className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <span>{hall.name}</span>
                    <Badge variant="primary" size="sm">
                      {hall.screenType}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">
                    Capacity: {hall.capacity || 100} Seats • {hall.soundSystem}
                  </div>
                  <div className="text-[10px] text-[#64748B]">
                    Projection: {hall.projectionType || "Barco 4K Laser"}
                  </div>
                </div>

                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0" title="Screen Operational & Calibrated" />
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

        {/* 7. GALLERY */}
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
