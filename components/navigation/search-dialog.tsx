"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Film, Building2, Ticket, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { DUMMY_MOVIES } from "@/lib/constants/movies";
import { DUMMY_THEATRES } from "@/lib/constants/theatres";
import { cn } from "@/lib/utils";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredMovies = query.trim()
    ? DUMMY_MOVIES.filter((m) =>
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.genre.some((g) => g.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 4)
    : DUMMY_MOVIES.slice(0, 3);

  const filteredTheatres = query.trim()
    ? DUMMY_THEATRES.filter((t) =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.city.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3)
    : DUMMY_THEATRES.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Dialog box */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#111827] border border-white/10 shadow-2xl z-10 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10">
          <Search className="h-5 w-5 text-amber-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, theatres, screenings, events..."
            className="w-full bg-transparent text-sm text-white placeholder:text-[#9CA3AF]/70 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {/* Movies Section */}
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2 px-2">
              <Film className="h-3.5 w-3.5 text-amber-400" />
              <span>Movies ({filteredMovies.length})</span>
            </div>
            <div className="space-y-1">
              {filteredMovies.map((movie) => (
                <Link
                  key={movie.id}
                  href="/movies"
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-8 rounded bg-[#161F2E] overflow-hidden relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="object-cover h-full w-full"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">
                        {movie.title}
                      </div>
                      <div className="text-[11px] text-[#9CA3AF]">
                        {movie.genre.join(", ")} • {movie.certification}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400">★ {movie.rating}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Theatres Section */}
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2 px-2">
              <Building2 className="h-3.5 w-3.5 text-blue-400" />
              <span>Theatres ({filteredTheatres.length})</span>
            </div>
            <div className="space-y-1">
              {filteredTheatres.map((theatre) => (
                <Link
                  key={theatre.id}
                  href="/theatres"
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">
                      {theatre.name}
                    </div>
                    <div className="text-[11px] text-[#9CA3AF]">
                      {theatre.address}, {theatre.city}
                    </div>
                  </div>
                  <div className="text-xs text-amber-400 font-medium">
                    {theatre.hallCount} Screens
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#070B12]/80 border-t border-white/5 flex items-center justify-between text-[11px] text-[#9CA3AF]">
          <div className="flex items-center gap-3">
            <span>
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">ESC</kbd> to close
            </span>
          </div>
          <span className="text-amber-400/90 font-medium">Phase 1 Demo Index</span>
        </div>
      </div>
    </div>
  );
}
