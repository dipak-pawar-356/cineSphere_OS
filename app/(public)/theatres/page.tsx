"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TheatreCard } from "@/components/cards/theatre-card";
import { DUMMY_THEATRES } from "@/lib/constants/theatres";
import { Search, Building2, MapPin, SlidersHorizontal, Monitor, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

const THEATRE_FILTERS = [
  "All Complexes",
  "New York",
  "Los Angeles",
  "Chicago",
  "San Francisco",
  "IMAX with Laser",
  "Dolby Cinema",
  "4DX Motion",
  "VIP Recliners",
];

export default function TheatresPage() {
  const [activeFilter, setActiveFilter] = useState("All Complexes");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTheatres = DUMMY_THEATRES.filter((theatre) => {
    const matchesSearch =
      theatre.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theatre.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theatre.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theatre.chain.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "New York") return theatre.city === "New York";
    if (activeFilter === "Los Angeles") return theatre.city === "Los Angeles";
    if (activeFilter === "Chicago") return theatre.city === "Chicago";
    if (activeFilter === "San Francisco") return theatre.city === "San Francisco";
    if (activeFilter === "IMAX with Laser") return theatre.screenTypes.includes("IMAX");
    if (activeFilter === "Dolby Cinema") return theatre.screenTypes.includes("Dolby Atmos");
    if (activeFilter === "4DX Motion") return theatre.screenTypes.includes("4DX");
    if (activeFilter === "VIP Recliners") return theatre.facilities.includes("Recliner Seating");

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Find Cinema Complexes & Auditoriums"
        subtitle="152 Registered Multiplexes Across Premier Global Entertainment Circuits"
        description="Explore world-class exhibition venues calibrated for immersive IMAX dual-laser projection, spatial Dolby Atmos sound, and motorized leather recliners."
        badge={`${DUMMY_THEATRES.length} Verified Venues`}
        badgeVariant="primary"
      />

      {/* Large Search & Filter Section */}
      <div className="space-y-4 p-4 rounded-2xl bg-[#111827] border border-[#2A3445] shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by complex name, street, city, or cinema chain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
            />
          </div>

          <Button variant="outline" size="sm" className="gap-2 shrink-0">
            <SlidersHorizontal className="h-4 w-4 text-[#FBBF24]" />
            <span>Format Filters</span>
          </Button>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {THEATRE_FILTERS.map((tag) => {
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

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#94A3B8]">
        <span>
          Showing <strong className="text-white">{filteredTheatres.length}</strong> cinema complexes
        </span>
        <span className="text-[11px] font-mono">Distance: Geo-calibrated</span>
      </div>

      {/* Theatres Grid */}
      {filteredTheatres.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTheatres.map((theatre) => (
            <TheatreCard key={theatre.id} theatre={theatre} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#111827] border border-[#2A3445] space-y-2">
          <Building2 className="h-10 w-10 text-[#64748B] mx-auto" />
          <h3 className="text-base font-bold text-white">No cinema complexes found</h3>
          <p className="text-xs text-[#94A3B8]">Try selecting a different city or clearing your search filter.</p>
        </div>
      )}
    </div>
  );
}
