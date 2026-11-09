"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/layout/page-header";
import { useCityStore } from "@/store/city-store";
import { getAllPublishedMovies, getFilteredMovies } from "@/lib/engine/customer-discovery-engine";
import { CustomerMovieDTO } from "@/types/customer-discovery.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Search,
  Filter,
  Sparkles,
  Film,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  Clock,
  Ticket,
  TrendingUp,
  Flame,
  Calendar,
  X,
  Eye,
  Heart,
} from "lucide-react";
import { cn } from "@/utils";

type MovieTab =
  | "Now Showing"
  | "Coming Soon"
  | "Trending"
  | "Recommended"
  | "Recently Viewed"
  | "Favorites";

const GENRES = [
  "All",
  "Action",
  "Sci-Fi",
  "Drama",
  "Thriller",
  "Adventure",
  "Fantasy",
  "Biography",
];

const LANGUAGES = ["All", "English", "Hindi", "Telugu", "Tamil", "Malayalam"];
const FORMATS = ["All", "IMAX", "Dolby Cinema", "4DX", "3D", "2D"];
const CERTIFICATES = ["All", "U", "UA", "UA 16+", "A", "PG-13", "R"];

export default function MoviesPage() {
  const { selectedCity, setCityModalOpen } = useCityStore();

  const [activeTab, setActiveTab] = useState<MovieTab>("Now Showing");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [selectedCertificate, setSelectedCertificate] = useState("All");
  const [recentlyViewedSlugs, setRecentlyViewedSlugs] = useState<string[]>([]);
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Load recently viewed & favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cinesphere_recent_movies");
      if (stored) {
        setRecentlyViewedSlugs(JSON.parse(stored));
      }
      const favs = localStorage.getItem("cinesphere_favorite_movies");
      if (favs) {
        setFavoriteSlugs(JSON.parse(favs));
      }
    } catch {
      // Fallback
    }
  }, []);

  const toggleFavorite = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavoriteSlugs((prev) => {
      const updated = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug];
      try {
        localStorage.setItem("cinesphere_favorite_movies", JSON.stringify(updated));
      } catch {
        // Fallback
      }
      return updated;
    });
  };

  const allMovies = useMemo(() => getAllPublishedMovies(), []);

  // Filter movies based on active tab & facets
  const filteredMovies = useMemo(() => {
    let list = allMovies;

    // 1. Tab Filtering
    if (activeTab === "Now Showing") {
      list = list.filter((m) => m.status === "Now Showing");
    } else if (activeTab === "Coming Soon") {
      list = list.filter((m) => m.status === "Coming Soon");
    } else if (activeTab === "Trending") {
      list = list.filter((m) => m.isTrending || m.rating >= 8.8);
    } else if (activeTab === "Recommended") {
      list = list.filter((m) => m.isFeatured || m.rating >= 8.5);
    } else if (activeTab === "Recently Viewed") {
      list = list.filter((m) => recentlyViewedSlugs.includes(m.slug));
    } else if (activeTab === "Favorites") {
      list = list.filter((m) => favoriteSlugs.includes(m.slug));
    }

    // 2. Facet Filtering
    if (selectedGenre !== "All") {
      list = list.filter((m) => m.genre.some((g) => g.toLowerCase() === selectedGenre.toLowerCase()));
    }
    if (selectedLanguage !== "All") {
      list = list.filter((m) => m.languages.some((l) => l.toLowerCase() === selectedLanguage.toLowerCase()));
    }
    if (selectedFormat !== "All") {
      list = list.filter((m) => m.formats.some((f) => f.toLowerCase().includes(selectedFormat.toLowerCase())));
    }
    if (selectedCertificate !== "All") {
      list = list.filter((m) => m.certification === selectedCertificate);
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genre.some((g) => g.toLowerCase().includes(q)) ||
          (m.director && m.director.toLowerCase().includes(q)) ||
          (m.cast && m.cast.some((c) => c.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [
    allMovies,
    activeTab,
    selectedGenre,
    selectedLanguage,
    selectedFormat,
    selectedCertificate,
    searchQuery,
    recentlyViewedSlugs,
    favoriteSlugs,
  ]);

  // Paginated Movies
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMovies.slice(start, start + pageSize);
  }, [filteredMovies, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredMovies.length / pageSize));

  // Search Suggestions (Interactive autocomplete)
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return ["Pushpa 2", "Kantara", "Gladiator II", "Dune", "Action", "IMAX"];
    }
    const q = searchQuery.toLowerCase().trim();
    return allMovies
      .filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genre.some((g) => g.toLowerCase().includes(q)) ||
          (m.director && m.director.toLowerCase().includes(q))
      )
      .slice(0, 5)
      .map((m) => m.title);
  }, [searchQuery, allMovies]);

  const resetFilters = () => {
    setSelectedGenre("All");
    setSelectedLanguage("All");
    setSelectedFormat("All");
    setSelectedCertificate("All");
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedGenre !== "All" ||
    selectedLanguage !== "All" ||
    selectedFormat !== "All" ||
    selectedCertificate !== "All" ||
    searchQuery !== "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Page Header with Circuit City Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A3445]/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="primary" size="sm">
              Customer Discovery
            </Badge>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-amber-400 font-mono">Journey 1 & 2</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore Theatrical Releases
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Discover blockbuster screenings, archival runs, and festival premieres in your region.
          </p>
        </div>

        {/* City Indicator Pill */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#111827] border border-[#2A3445]">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Circuit</span>
            <span className="font-bold text-white">{selectedCity.name}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setCityModalOpen(true)}
            className="ml-2 text-amber-300 border-amber-400/40 hover:bg-amber-400/10"
          >
            Change City
          </Button>
        </div>
      </div>

      {/* 2. Primary Discovery Tabs (Now Showing, Coming Soon, Trending, Recommended, Recently Viewed) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#2A3445]/60 scrollbar-none">
        {(
          [
            { id: "Now Showing", label: "Now Showing", icon: Film },
            { id: "Coming Soon", label: "Coming Soon", icon: Calendar },
            { id: "Trending", label: "Trending", icon: Flame },
            { id: "Recommended", label: "Recommended", icon: Sparkles },
            { id: "Recently Viewed", label: "Recently Viewed", icon: Eye },
            { id: "Favorites", label: "Favorites", icon: Heart },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0",
                isActive
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                  : "bg-[#111827] text-slate-300 border border-[#2A3445] hover:text-white hover:border-slate-500"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.id === "Recently Viewed" && recentlyViewedSlugs.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-amber-400">
                  {recentlyViewedSlugs.length}
                </span>
              )}
              {tab.id === "Favorites" && favoriteSlugs.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                  {favoriteSlugs.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Search & Multi-Faceted Filters */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] shadow-lg space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by movie title, genre, director, or cast..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Interactive Search Suggestions Dropdown */}
            {isSearchFocused && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl bg-[#0B1220] border border-[#2A3445] p-2 shadow-2xl z-30 space-y-1">
                <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5">
                  {searchQuery ? "Matching Titles & Categories" : "Popular Searches"}
                </div>
                {searchSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchQuery(s);
                      setIsSearchFocused(false);
                      setCurrentPage(1);
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

          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="text-amber-400 border-amber-400/40 hover:bg-amber-400/10 shrink-0"
            >
              Reset Filters
            </Button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Genre
            </label>
            <select
              className="w-full bg-[#070B12] border border-[#2A3445] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              value={selectedGenre}
              onChange={(e) => {
                setSelectedGenre(e.target.value);
                setCurrentPage(1);
              }}
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g === "All" ? "All Genres" : g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Language
            </label>
            <select
              className="w-full bg-[#070B12] border border-[#2A3445] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setCurrentPage(1);
              }}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l === "All" ? "All Languages" : l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Format
            </label>
            <select
              className="w-full bg-[#070B12] border border-[#2A3445] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              value={selectedFormat}
              onChange={(e) => {
                setSelectedFormat(e.target.value);
                setCurrentPage(1);
              }}
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f === "All" ? "All Formats" : f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Certificate
            </label>
            <select
              className="w-full bg-[#070B12] border border-[#2A3445] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              value={selectedCertificate}
              onChange={(e) => {
                setSelectedCertificate(e.target.value);
                setCurrentPage(1);
              }}
            >
              {CERTIFICATES.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Certificates" : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Results Count Header */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Showing <strong className="text-white">{filteredMovies.length}</strong> titles playing in{" "}
          <strong className="text-amber-400">{selectedCity.name}</strong>
        </span>
        <span className="text-[11px] font-mono">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* 5. Movies Grid */}
      {paginatedMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedMovies.map((movie) => (
            <Card
              key={movie.id}
              className="overflow-hidden bg-[#111827] border-[#2A3445] flex flex-col justify-between hover:border-amber-400/50 transition-all duration-300 group hover:-translate-y-1 shadow-xl"
            >
              {/* Poster Thumbnail */}
              <Link href={`/movie/${movie.slug}`} className="relative aspect-[2/3] overflow-hidden bg-[#070B12] block">
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-60" />

                {/* Rating Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-amber-400/30 text-amber-400 text-xs font-bold">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>{movie.rating.toFixed(1)}</span>
                </div>

                {/* Favorite Toggle & Certificate */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(movie.slug, e)}
                    className="p-1 rounded-md bg-black/80 backdrop-blur-md border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                    title={favoriteSlugs.includes(movie.slug) ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    <Heart
                      className={cn(
                        "w-3 h-3 transition-colors",
                        favoriteSlugs.includes(movie.slug) && "fill-rose-500 text-rose-500"
                      )}
                    />
                  </button>

                  <div className="px-2 py-0.5 rounded-md bg-black/80 border border-slate-700 text-slate-300 text-[10px] font-bold font-mono">
                    {movie.certification}
                  </div>
                </div>

                {/* Starting Price Pill */}
                <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-extrabold shadow">
                  From ₹{movie.startingPrice || 200}
                </div>
              </Link>

              {/* Movie Details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1">
                    {movie.formats.slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#161F2E] text-slate-300 border border-[#2A3445]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  <Link href={`/movie/${movie.slug}`}>
                    <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {movie.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span className="truncate">{movie.genre.slice(0, 2).join(", ")}</span>
                    <span>•</span>
                    <span className="shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {movie.durationMinutes}m
                    </span>
                  </p>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {movie.synopsis}
                  </p>
                </div>

                {/* Book Shows CTA Button */}
                <div className="pt-2 border-t border-[#2A3445]/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">
                    {movie.availableTheatresCount} Theatres in {selectedCity.name}
                  </span>

                  <Link href={`/movie/${movie.slug}`}>
                    <Button variant="primary" size="xs" className="font-bold gap-1">
                      <Ticket className="w-3 h-3" />
                      <span>Book</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-[#111827] border border-[#2A3445] space-y-3">
          <Film className="h-10 w-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No releases match your query in {selectedCity.name}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search terms, changing the active city, or clearing the facet filters.
          </p>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Clear All Filters
          </Button>
        </div>
      )}

      {/* 6. Pagination */}
      {totalPages > 1 && (
        <div className="pt-8 border-t border-[#2A3445] flex items-center justify-between text-xs text-slate-400">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="gap-1.5"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              const isCurrent = currentPage === pNum;
              return (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => setCurrentPage(pNum)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                    isCurrent
                      ? "bg-amber-400 text-slate-950"
                      : "bg-[#111827] text-slate-400 hover:text-white border border-[#2A3445]"
                  )}
                >
                  {pNum}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="gap-1.5"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* 7. Infinite Scroll & Discovery Mode Indicator */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Displaying page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> ({filteredMovies.length} total releases matching current filters)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#111827] border border-[#2A3445] text-slate-300">
            Infinite Scroll Mode: Ready
          </span>
        </div>
      </div>
    </div>
  );
}
