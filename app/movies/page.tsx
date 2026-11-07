"use client";

import React, { useState, useMemo } from "react";
import { DUMMY_MOVIES } from "@/lib/constants/movies";
import { MovieCard } from "@/components/cards/movie-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { SearchBar } from "@/components/ui/search-bar";
import { EmptyState } from "@/components/empty-states/empty-state";
import { MovieGenre, MovieFormat, MovieLanguage } from "@/lib/types";
import { SlidersHorizontal, RotateCcw, Film, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_GENRES = ["All", "Sci-Fi", "Action", "Thriller", "Drama", "Adventure", "Animation", "Comedy", "Horror"];
const ALL_FORMATS = ["All", "IMAX", "4DX", "Dolby Atmos", "3D", "2D"];
const ALL_LANGUAGES = ["All", "English", "Spanish", "French", "Japanese", "Hindi", "German"];
const ALL_RATINGS = [
  { label: "All Ratings", min: 0 },
  { label: "9.0+ Exceptional", min: 9.0 },
  { label: "8.5+ Critically Acclaimed", min: 8.5 },
  { label: "8.0+ Highly Rated", min: 8.0 },
];

export default function MoviesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedRating, setSelectedRating] = useState(0);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedGenre("All");
    setSelectedFormat("All");
    setSelectedLanguage("All");
    setSelectedRating(0);
  };

  const filteredMovies = useMemo(() => {
    return DUMMY_MOVIES.filter((movie) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = movie.title.toLowerCase().includes(q);
        const matchesCast = movie.cast.some((c) => c.toLowerCase().includes(q));
        const matchesDirector = movie.director.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCast && !matchesDirector) return false;
      }

      // Genre
      if (selectedGenre !== "All" && !movie.genre.includes(selectedGenre as MovieGenre)) {
        return false;
      }

      // Format
      if (selectedFormat !== "All" && !movie.formats.includes(selectedFormat as MovieFormat)) {
        return false;
      }

      // Language
      if (selectedLanguage !== "All" && !movie.languages.includes(selectedLanguage as MovieLanguage)) {
        return false;
      }

      // Rating
      if (movie.rating < selectedRating) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedGenre, selectedFormat, selectedLanguage, selectedRating]);

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Heading */}
        <SectionHeading
          badge="Theatrical Catalogue"
          title="Explore Movies & Premieres"
          subtitle="Browse 10 curated blockbuster releases, indie festival titles, and remastered 70mm cinematic epics playing in partner theatres."
        />

        {/* Search Bar Strip */}
        <div className="mb-10 max-w-xl">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title, director, cast..."
            size="md"
          />
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar (UI only as requested) */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-2xl bg-[#161F2E]/80 border border-white/5 shadow-xl sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <SlidersHorizontal className="h-4 w-4 text-amber-400" />
                  <span>Filters</span>
                </div>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#9CA3AF] hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>

              {/* Genre Filter */}
              <div className="space-y-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Genre
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_GENRES.map((genre) => {
                    const isSelected = selectedGenre === genre;
                    return (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                          isSelected
                            ? "bg-amber-400 text-black font-semibold shadow-sm"
                            : "bg-[#111827] text-[#9CA3AF] hover:text-white border border-white/5"
                        )}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Format Filter */}
              <div className="space-y-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Format Experience
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_FORMATS.map((fmt) => {
                    const isSelected = selectedFormat === fmt;
                    return (
                      <button
                        key={fmt}
                        onClick={() => setSelectedFormat(fmt)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                          isSelected
                            ? "bg-amber-400 text-black font-semibold shadow-sm"
                            : "bg-[#111827] text-[#9CA3AF] hover:text-white border border-white/5"
                        )}
                      >
                        {fmt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language Filter */}
              <div className="space-y-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Language
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_LANGUAGES.map((lang) => {
                    const isSelected = selectedLanguage === lang;
                    return (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                          isSelected
                            ? "bg-amber-400 text-black font-semibold shadow-sm"
                            : "bg-[#111827] text-[#9CA3AF] hover:text-white border border-white/5"
                        )}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Critic & User Rating
                </span>
                <div className="space-y-1">
                  {ALL_RATINGS.map((item) => {
                    const isSelected = selectedRating === item.min;
                    return (
                      <button
                        key={item.label}
                        onClick={() => setSelectedRating(item.min)}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left",
                          isSelected
                            ? "bg-amber-400/15 text-amber-400 font-bold"
                            : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          <span>{item.label}</span>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Movie Cards Grid */}
          <main className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
              <div className="text-xs text-[#9CA3AF]">
                Showing <strong className="text-white">{filteredMovies.length}</strong> of{" "}
                <strong className="text-white">{DUMMY_MOVIES.length}</strong> Movies
              </div>

              <span className="text-xs text-amber-400/80 font-medium">
                Live Theatrical Rotation
              </span>
            </div>

            {filteredMovies.length === 0 ? (
              <EmptyState
                icon={Film}
                title="No Movies Match Your Criteria"
                description="Try clearing some of your genre, format, or language filters to view more available showtimes."
                actionLabel="Clear All Filters"
                onAction={resetFilters}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} variant="vertical" />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
