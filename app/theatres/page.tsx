"use client";

import React, { useState, useMemo } from "react";
import { DUMMY_THEATRES } from "@/lib/constants/theatres";
import { TheatreCard } from "@/components/cards/theatre-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterChip } from "@/components/ui/filter-chip";
import { EmptyState } from "@/components/empty-states/empty-state";
import { Building2, Sparkles } from "lucide-react";

const FILTER_CHIPS = [
  { id: "all", label: "All Theatres" },
  { id: "luxury", label: "Luxury Tier" },
  { id: "imax", label: "IMAX Laser" },
  { id: "dolby", label: "Dolby Atmos" },
  { id: "4dx", label: "4DX Motion" },
  { id: "nyc", label: "New York" },
  { id: "la", label: "Los Angeles" },
  { id: "sf", label: "San Francisco" },
  { id: "chi", label: "Chicago" },
];

export default function TheatresPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChip, setActiveChip] = useState("all");

  const filteredTheatres = useMemo(() => {
    return DUMMY_THEATRES.filter((theatre) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = theatre.name.toLowerCase().includes(q);
        const matchesCity = theatre.city.toLowerCase().includes(q);
        const matchesChain = theatre.chain.toLowerCase().includes(q);
        const matchesAddress = theatre.address.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesChain && !matchesAddress) return false;
      }

      // Filter Chips
      if (activeChip === "luxury" && theatre.pricingTier !== "Luxury") return false;
      if (activeChip === "imax" && !theatre.screenTypes.includes("IMAX")) return false;
      if (activeChip === "dolby" && !theatre.screenTypes.includes("Dolby Atmos")) return false;
      if (activeChip === "4dx" && !theatre.screenTypes.includes("4DX")) return false;
      if (activeChip === "nyc" && theatre.city !== "New York") return false;
      if (activeChip === "la" && theatre.city !== "Los Angeles") return false;
      if (activeChip === "sf" && theatre.city !== "San Francisco") return false;
      if (activeChip === "chi" && theatre.city !== "Chicago") return false;

      return true;
    });
  }, [searchQuery, activeChip]);

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Partner Circuits"
          title="Theatres & Multiplex Complexes"
          subtitle="Explore premier exhibition halls featuring laser projection, high frame rate playback, 128-channel spatial sound, and luxury loungers."
        />

        {/* Large Search Bar as requested */}
        <div className="mt-8 mb-6 max-w-2xl">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search theatres by complex name, metropolitan city, or chain..."
            size="lg"
          />
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {FILTER_CHIPS.map((chip) => (
            <FilterChip
              key={chip.id}
              label={chip.label}
              isActive={activeChip === chip.id}
              onClick={() => setActiveChip(chip.id)}
            />
          ))}
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/5 text-xs text-[#9CA3AF]">
          <div>
            Showing <strong className="text-white">{filteredTheatres.length}</strong> of{" "}
            <strong className="text-white">{DUMMY_THEATRES.length}</strong> Cinema Complexes
          </div>
          <span className="text-amber-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Active Real-time Synchronization
          </span>
        </div>

        {filteredTheatres.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No Theatres Found in this Search"
            description="No venues matched your criteria. Try adjusting your city filter or searching for a different theatre chain."
            actionLabel="Reset Search & Filters"
            onAction={() => {
              setSearchQuery("");
              setActiveChip("all");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTheatres.map((theatre) => (
              <TheatreCard key={theatre.id} theatre={theatre} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
