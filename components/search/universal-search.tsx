"use client";

import React, { useState } from "react";
import { Search, X, History, Sparkles, Film, Building2, Tag } from "lucide-react";
import { cn } from "@/utils";

export interface UniversalSearchProps {
  onSearch?: (query: string) => void;
  recentSearches?: string[];
  suggestions?: string[];
  placeholder?: string;
  className?: string;
}

export function UniversalSearch({
  onSearch,
  recentSearches = ["IMAX 3D Recliner", "Dolby Atmos Chicago", "Chrono Nexus Premieres", "Apex Grand Complex"],
  suggestions = ["Laser 4K Projection", "Student Pass Discounts", "VIP Dining Lounge", "Weekend Midnight Shows"],
  placeholder = "Search movies, theatres, experiences, passes...",
  className,
}: UniversalSearchProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSelect = (item: string) => {
    setQuery(item);
    onSearch?.(item);
    setIsFocused(false);
  };

  return (
    <div className={cn("relative w-full max-w-xl", className)}>
      <div
        className={cn(
          "relative flex items-center h-11 px-3.5 rounded-xl bg-[#111827] border transition-all",
          isFocused
            ? "border-[#FBBF24]/60 ring-2 ring-[#FBBF24]/20 bg-[#161F2E]"
            : "border-[#2A3445]"
        )}
      >
        <Search className="h-4 w-4 text-[#94A3B8] mr-2.5 shrink-0" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-xs sm:text-sm text-[#F9FAFB] placeholder:text-[#94A3B8]/60 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="p-1 rounded text-[#94A3B8] hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isFocused && (
        <div className="absolute left-0 top-full mt-2 w-full rounded-2xl bg-[#111827] border border-[#2A3445] shadow-[0_16px_50px_rgb(0,0,0,0.6)] p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-4">
          {/* Recent Searches Placeholder */}
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
              <History className="h-3.5 w-3.5 text-[#FBBF24]" />
              <span>Recent Searches</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onMouseDown={() => handleSelect(item)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-[#161F2E] border border-[#2A3445] text-[#CBD5E1] hover:text-white hover:border-[#FBBF24]/40 transition-colors cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Telemetry Placeholder */}
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
              <Sparkles className="h-3.5 w-3.5 text-[#38BDF8]" />
              <span>Suggested Searches</span>
            </div>
            <div className="space-y-1">
              {suggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onMouseDown={() => handleSelect(item)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#CBD5E1] hover:text-white hover:bg-[#161F2E] transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span>{item}</span>
                  <span className="text-[10px] text-[#64748B]">Trending</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export interface ActiveFiltersBarProps {
  filters: { id: string; label: string; value: string }[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function ActiveFiltersBar({
  filters,
  onRemove,
  onClearAll,
  className,
}: ActiveFiltersBarProps) {
  if (filters.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2 pt-2", className)}>
      <span className="text-xs text-[#94A3B8]">Active Filters:</span>
      {filters.map((f) => (
        <span
          key={f.id}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161F2E] border border-[#2A3445] text-xs text-white"
        >
          <span className="text-[#94A3B8]">{f.label}:</span>
          <span className="font-semibold text-[#FBBF24]">{f.value}</span>
          <X
            className="h-3 w-3 text-[#94A3B8] hover:text-red-400 cursor-pointer ml-1"
            onClick={() => onRemove(f.id)}
          />
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-[#94A3B8] hover:text-white underline cursor-pointer ml-2"
      >
        Clear All
      </button>
    </div>
  );
}

