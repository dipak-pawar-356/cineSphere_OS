"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/layout/page-header";
import { useCityStore } from "@/store/city-store";
import { getAllPublishedTheatres, getFilteredTheatres } from "@/lib/engine/customer-discovery-engine";
import { CustomerTheatreDTO } from "@/types/customer-discovery.types";
import { FormatBadge } from "@/components/badges/format-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Building2,
  MapPin,
  SlidersHorizontal,
  Monitor,
  CheckCircle,
  Star,
  ArrowRight,
  Ticket,
  Utensils,
  Car,
  Accessibility,
  Armchair,
  Layers,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/utils";

const THEATRE_FORMAT_FILTERS = [
  "All Complexes",
  "IMAX with Laser",
  "Dolby Cinema",
  "4DX Motion",
  "VIP Recliners",
  "Gourmet Dining",
  "Valet Parking",
];

export default function TheatresPage() {
  const { selectedCity, setCityModalOpen } = useCityStore();

  const [activeFilter, setActiveFilter] = useState("All Complexes");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filterByCityOnly, setFilterByCityOnly] = useState(false);

  // Fetch all published venues
  const allTheatres = useMemo(() => getAllPublishedTheatres(), []);

  // Filter pipeline
  const filteredTheatres = useMemo(() => {
    return allTheatres.filter((theatre) => {
      // 1. City Filter (if toggle active)
      if (filterByCityOnly && selectedCity.name !== "All") {
        const matchesCity =
          theatre.city.toLowerCase() === selectedCity.name.toLowerCase() ||
          theatre.state.toLowerCase() === selectedCity.state.toLowerCase();
        if (!matchesCity) return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          theatre.name.toLowerCase().includes(q) ||
          theatre.city.toLowerCase().includes(q) ||
          theatre.address.toLowerCase().includes(q) ||
          theatre.chain.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // 3. Format & Facility Filters
      if (activeFilter === "IMAX with Laser") {
        return theatre.screenTypes.some((s) => s.toLowerCase().includes("imax"));
      }
      if (activeFilter === "Dolby Cinema") {
        return (
          theatre.screenTypes.some((s) => s.toLowerCase().includes("dolby")) ||
          theatre.amenities.some((a) => a.toLowerCase().includes("dolby"))
        );
      }
      if (activeFilter === "4DX Motion") {
        return theatre.screenTypes.some((s) => s.toLowerCase().includes("4dx"));
      }
      if (activeFilter === "VIP Recliners") {
        return (
          theatre.facilities?.some((f) => f.toLowerCase().includes("recliner")) ||
          theatre.amenities.some((a) => a.toLowerCase().includes("recliner"))
        );
      }
      if (activeFilter === "Gourmet Dining") {
        return (
          theatre.facilities?.some((f) => f.toLowerCase().includes("dining") || f.toLowerCase().includes("food")) ||
          theatre.amenities.some((a) => a.toLowerCase().includes("dining") || a.toLowerCase().includes("food"))
        );
      }
      if (activeFilter === "Valet Parking") {
        return (
          theatre.facilities?.some((f) => f.toLowerCase().includes("parking") || f.toLowerCase().includes("valet")) ||
          theatre.amenities.some((a) => a.toLowerCase().includes("parking") || a.toLowerCase().includes("valet"))
        );
      }

      return true;
    });
  }, [allTheatres, activeFilter, searchQuery, filterByCityOnly, selectedCity]);

  // Count theatres in active city
  const cityTheatresCount = useMemo(() => {
    return allTheatres.filter(
      (t) => t.city.toLowerCase() === selectedCity.name.toLowerCase()
    ).length;
  }, [allTheatres, selectedCity]);

  // Search Suggestions (Interactive autocomplete)
  const theatreSuggestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return ["CineSphere Grand Cinemas", "PVR ICON", "INOX Megaplex", "IMAX Laser", "Dolby Cinema"];
    }
    const q = searchQuery.toLowerCase().trim();
    return allTheatres
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.chain.toLowerCase().includes(q) ||
          t.city.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((t) => t.name);
  }, [searchQuery, allTheatres]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. BREADCRUMBS */}
      <nav className="flex items-center gap-2 text-xs text-[#94A3B8]">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-[#64748B]" />
        <span className="text-[#FBBF24] font-medium">Cinema Complexes</span>
      </nav>

      {/* 2. PAGE HEADER */}
      <PageHeader
        title="Find Cinema Complexes & Auditoriums"
        subtitle="Premier Multi-Tenant Exhibition Venues Across India & Global Circuits"
        description="Explore world-class exhibition venues calibrated for immersive IMAX dual-laser projection, spatial Dolby Atmos sound, and motorized leather recliners. Journey 3: Browse by theatre to view all films and showtimes playing today."
        badge={`${allTheatres.length} Verified Venues`}
        badgeVariant="primary"
      />

      {/* 3. CITY SELECTION CONTEXT BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111827] border border-[#2A3445] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#94A3B8]">Active Discovery City:</span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                {selectedCity.name}
                <span className="text-xs font-normal text-[#94A3B8]">
                  ({selectedCity.state})
                </span>
              </span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              {cityTheatresCount > 0
                ? `${cityTheatresCount} multiplexes registered in this metropolitan region.`
                : `Showing venues across nearby regions with auto-distance calibration.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setFilterByCityOnly(!filterByCityOnly)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5",
              filterByCityOnly
                ? "bg-amber-400/15 text-amber-400 border-amber-400/40"
                : "bg-[#161F2E] text-[#94A3B8] border-[#2A3445] hover:text-white"
            )}
          >
            <span>Filter by {selectedCity.name} only</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCityModalOpen(true)}
            className="text-xs gap-1.5 border-[#2A3445] text-white hover:border-amber-400 shrink-0"
          >
            <MapPin className="h-3.5 w-3.5 text-[#FBBF24]" />
            <span>Change City</span>
          </Button>
        </div>
      </div>

      {/* 4. SEARCH & FORMAT FILTERS */}
      <div className="space-y-4 p-4 rounded-2xl bg-[#111827] border border-[#2A3445] shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by complex name, street, city, or cinema circuit..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-[#64748B] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Interactive Search Suggestions Dropdown */}
            {isSearchFocused && theatreSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl bg-[#0B1220] border border-[#2A3445] p-2 shadow-2xl z-30 space-y-1">
                <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5">
                  {searchQuery ? "Matching Complexes & Circuits" : "Popular Complexes"}
                </div>
                {theatreSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchQuery(s);
                      setIsSearchFocused(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-[#161F2E] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{s}</span>
                    <Search className="w-3 h-3 text-slate-500" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeFilter !== "All Complexes" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFilter("All Complexes")}
                className="text-xs text-[#94A3B8] hover:text-white gap-1"
              >
                <X className="h-3.5 w-3.5" /> Reset Filter
              </Button>
            )}
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {THEATRE_FORMAT_FILTERS.map((tag) => {
            const isActive = activeFilter === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveFilter(tag)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                  isActive
                    ? "bg-[#FBBF24] text-[#070B12] font-bold shadow-md shadow-[#FBBF24]/20"
                    : "bg-[#161F2E] text-[#94A3B8] hover:text-white hover:bg-[#1f293d] border border-[#2A3445]"
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. RESULTS HEADER */}
      <div className="flex items-center justify-between text-xs text-[#94A3B8]">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-white">{filteredTheatres.length}</strong> cinema complexes
          </span>
          {filterByCityOnly && (
            <Badge variant="warning" size="sm">
              in {selectedCity.name}
            </Badge>
          )}
        </div>
        <span className="text-[11px] font-mono text-[#64748B]">
          Geo-calibrated to {selectedCity.name}
        </span>
      </div>

      {/* 6. THEATRES GRID */}
      {filteredTheatres.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTheatres.map((theatre: CustomerTheatreDTO) => (
            <div
              key={theatre.id}
              className="group relative flex flex-col rounded-2xl bg-[#161F2E]/90 border border-white/5 hover:border-amber-400/30 transition-all duration-300 shadow-xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/5"
            >
              {/* Banner Header */}
              <Link
                href={`/theatre/${theatre.slug}`}
                className="relative h-44 w-full overflow-hidden bg-[#070B12] block"
              >
                <Image
                  src={theatre.banner}
                  alt={theatre.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161F2E] via-black/40 to-black/20" />

                {/* Rating & Distance Badges */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-amber-400/30 text-amber-400 text-xs font-bold shadow-lg">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{theatre.rating.toFixed(1)}</span>
                    <span className="text-[10px] text-[#9CA3AF] font-normal">
                      ({theatre.reviewsCount || 850})
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-black/75 backdrop-blur-md text-amber-300 border border-amber-400/25">
                    {theatre.distancePlaceholder || `${theatre.distanceKm || 2.4} km away`}
                  </span>
                </div>

                {/* Chain Logo Avatar badge */}
                <div className="absolute -bottom-3 left-4 flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black text-xs flex items-center justify-center border-2 border-[#161F2E] shadow-xl">
                    {theatre.chain?.charAt(0) || "C"}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 drop-shadow-md">
                    {theatre.chain}
                  </span>
                </div>
              </Link>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-5 pt-6 space-y-4">
                <div className="space-y-3">
                  <Link href={`/theatre/${theatre.slug}`}>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                      {theatre.name}
                    </h3>
                  </Link>

                  <div className="flex items-start gap-1.5 text-xs text-[#9CA3AF]">
                    <MapPin className="h-3.5 w-3.5 text-amber-400/80 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">
                      {theatre.address}, {theatre.city}, {theatre.state}
                    </span>
                  </div>

                  {/* Hall Count & Formats */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9CA3AF] px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      <Monitor className="h-3 w-3 text-amber-400" />
                      {theatre.hallCount} Screens
                    </span>
                    {theatre.screenTypes.slice(0, 3).map((type) => (
                      <FormatBadge key={type} format={type} size="xs" />
                    ))}
                  </div>

                  {/* Amenities Highlights */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-[#9CA3AF] pt-1">
                    {(theatre.facilities || theatre.amenities).slice(0, 4).map((f) => (
                      <div key={f} className="flex items-center gap-1.5 truncate">
                        <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer with Pricing, Live Shows & Action */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#9CA3AF] block">Tickets From</span>
                    <span className="font-mono text-sm font-bold text-amber-400">
                      ₹{theatre.startingPrice || 200}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" size="sm" className="text-[#38BDF8] border-[#38BDF8]/30 font-mono">
                      {theatre.availableShowsCount || 4} Shows Today
                    </Badge>

                    <Link
                      href={`/theatre/${theatre.slug}`}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-1 transition-colors shadow-md shadow-amber-500/20"
                    >
                      <span>View Shows</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#111827] border border-[#2A3445] space-y-4">
          <Building2 className="h-12 w-12 text-[#64748B] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              No cinema complexes found in {selectedCity.name}
            </h3>
            <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
              We couldn&apos;t find any venues matching your current filter. You can browse complexes nationwide or switch your active city.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterByCityOnly(false);
                setActiveFilter("All Complexes");
                setSearchQuery("");
              }}
              className="text-xs border-[#2A3445]"
            >
              Browse All Cities
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCityModalOpen(true)}
              className="text-xs font-bold"
            >
              Change City
            </Button>
          </div>
        </div>
      )}

      {/* 7. ARCHITECTURAL CALLOUT */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#161F2E] via-[#111827] to-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Journey 3: Theatre-First Discovery
            </h4>
            <p className="text-xs text-[#94A3B8]">
              Select any theatre above to view all films and daily schedules at that specific complex. Every showtime navigates directly into the central Show ID seat selection.
            </p>
          </div>
        </div>

        <Link href="/movies" className="shrink-0">
          <Button variant="outline" size="sm" className="gap-2 text-xs border-[#2A3445] text-white hover:border-amber-400">
            <Ticket className="h-3.5 w-3.5 text-amber-400" />
            <span>Switch to Movie-First Discovery</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
