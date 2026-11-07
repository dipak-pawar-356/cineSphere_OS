"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { MovieCard } from "@/components/cards/movie-card";
import { DUMMY_MOVIES } from "@/lib/constants/movies";
import { Search, Filter, Sparkles, Film, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

const FILTER_TAGS = [
  "All Movies",
  "Now Showing",
  "Coming Soon",
  "IMAX with Laser",
  "Dolby Cinema",
  "4DX Motion",
  "Sci-Fi",
  "Action",
  "Drama",
];

export default function MoviesPage() {
  const [activeFilter, setActiveFilter] = useState("All Movies");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMovies = DUMMY_MOVIES.filter((movie) => {
    const matchesSearch =
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
      movie.director.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "Now Showing") return !movie.isComingSoon;
    if (activeFilter === "Coming Soon") return movie.isComingSoon;
    if (activeFilter === "IMAX with Laser") return movie.formats.includes("IMAX");
    if (activeFilter === "Dolby Cinema") return movie.formats.includes("Dolby Atmos");
    if (activeFilter === "4DX Motion") return movie.formats.includes("4DX");
    if (activeFilter === "Sci-Fi") return movie.genre.includes("Sci-Fi");
    if (activeFilter === "Action") return movie.genre.includes("Action");
    if (activeFilter === "Drama") return movie.genre.includes("Drama");

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Explore Theatrical Releases"
        subtitle="Current Blockbusters, Archival 70mm Runs & Film Festival Premieres"
        description="Experience the pinnacle of cinema audio-visual technology across our connected partner circuit. Bookings open up to 14 days in advance."
        badge={`${DUMMY_MOVIES.length} Titles Available`}
        badgeVariant="primary"
      />

      {/* Top Search & Filter Bar */}
      <div className="space-y-4 p-4 rounded-2xl bg-[#111827] border border-[#2A3445] shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by movie title, genre, or director..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
            />
          </div>

          <Button variant="outline" size="sm" className="gap-2 shrink-0">
            <SlidersHorizontal className="h-4 w-4 text-[#FBBF24]" />
            <span>More Filters</span>
          </Button>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_TAGS.map((tag) => {
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
          Showing <strong className="text-white">{filteredMovies.length}</strong> movies
        </span>
        <span className="text-[11px] font-mono">Sorted by Premiere Date</span>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#111827] border border-[#2A3445] space-y-2">
          <Film className="h-10 w-10 text-[#64748B] mx-auto" />
          <h3 className="text-base font-bold text-white">No releases match your query</h3>
          <p className="text-xs text-[#94A3B8]">Try adjusting your search terms or filter tags.</p>
        </div>
      )}

      {/* Pagination Placeholder */}
      <div className="pt-8 border-t border-[#2A3445] flex items-center justify-between text-xs text-[#94A3B8]">
        <Button variant="outline" size="sm" disabled className="gap-1.5">
          <ChevronLeft className="h-3.5 w-3.5" /> Previous
        </Button>

        <div className="flex items-center gap-1">
          <button className="h-8 w-8 rounded-lg bg-[#FBBF24] text-[#070B12] font-bold text-xs">
            1
          </button>
          <button className="h-8 w-8 rounded-lg bg-[#111827] text-[#94A3B8] hover:text-white text-xs border border-[#2A3445]">
            2
          </button>
          <button className="h-8 w-8 rounded-lg bg-[#111827] text-[#94A3B8] hover:text-white text-xs border border-[#2A3445]">
            3
          </button>
        </div>

        <Button variant="outline" size="sm" className="gap-1.5">
          Next <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
