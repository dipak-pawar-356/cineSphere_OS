"use client";

import React, { useState, useRef } from "react";
import { MapPin, ChevronDown, Check, Globe, Building, Navigation, Search } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/utils";

export interface LocationHierarchy {
  country: string;
  state: string;
  city: string;
  area: string;
}

const PRESET_LOCATIONS: LocationHierarchy[] = [
  { country: "United States", state: "New York", city: "New York", area: "Manhattan AMC Complex" },
  { country: "United States", state: "California", city: "Los Angeles", area: "Century City IMAX" },
  { country: "United States", state: "California", city: "San Francisco", area: "Metreon Dolby Cinema" },
  { country: "United States", state: "Illinois", city: "Chicago", area: "River East 21" },
  { country: "United States", state: "Texas", city: "Dallas", area: "NorthPark Center" },
  { country: "India", state: "Maharashtra", city: "Mumbai", area: "BKC PVR Maison IMAX" },
  { country: "India", state: "Karnataka", city: "Bengaluru", area: "Forum Mall PVR Luxe" },
  { country: "United Kingdom", state: "Greater London", city: "London", area: "BFI IMAX Southbank" },
];

export function LocationSelector({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<LocationHierarchy>(PRESET_LOCATIONS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const filteredLocations = PRESET_LOCATIONS.filter(
    (loc) =>
      loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-[#CBD5E1] hover:text-[#F9FAFB] hover:bg-[#161F2E] border border-[#2A3445]/60 hover:border-[#FBBF24]/50 transition-all cursor-pointer focus:outline-none"
        aria-label="Select Cinema Circuit Region"
      >
        <MapPin className="h-3.5 w-3.5 text-[#FBBF24] shrink-0" />
        <div className="text-left hidden sm:block">
          <div className="text-[10px] text-[#94A3B8] leading-none">Circuit Hub</div>
          <div className="font-semibold text-white leading-tight">{selected.city}</div>
        </div>
        <span className="sm:hidden font-semibold">{selected.city}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-[#94A3B8] transition-transform duration-200",
            isOpen && "rotate-180 text-[#FBBF24]"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#111827] border border-[#2A3445] shadow-[0_16px_50px_rgba(0,0,0,0.6)] p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="pb-2 border-b border-[#2A3445] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-[#FBBF24]" />
                Select Cinema Region
              </span>
              <span className="text-[10px] text-[#94A3B8] font-mono">Hierarchy: 4-Tier</span>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search city, state, or circuit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#070B12] border border-[#2A3445] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1 py-2">
            {filteredLocations.map((loc, i) => {
              const isSelected = loc.city === selected.city && loc.area === selected.area;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSelected(loc);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-start justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer text-left",
                    isSelected
                      ? "bg-[#FBBF24]/15 border border-[#FBBF24]/30 text-white"
                      : "text-[#94A3B8] hover:text-white hover:bg-[#161F2E]"
                  )}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-[#FBBF24]" />
                      <span>{loc.city}, {loc.state}</span>
                      <span className="text-[10px] text-[#64748B]">({loc.country})</span>
                    </div>
                    <div className="text-[11px] text-[#94A3B8] pl-4">{loc.area}</div>
                  </div>

                  {isSelected && <Check className="h-4 w-4 text-[#FBBF24] shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Hierarchy Legend */}
          <div className="pt-2 border-t border-[#2A3445] flex items-center justify-between text-[10px] text-[#64748B]">
            <span>Country • State • City • Area</span>
            <span className="text-[#FBBF24]">Multi-Circuit</span>
          </div>
        </div>
      )}
    </div>
  );
}
