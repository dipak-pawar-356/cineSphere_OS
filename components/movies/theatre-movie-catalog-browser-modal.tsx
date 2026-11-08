"use client";

import React, { useState, useMemo } from "react";
import { GlobalMasterMovie } from "@/types/movie-management.types";
import { usePlatformStore } from "@/store/platform-store";
import { useTheatreStore } from "@/store/theatre-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Search,
  Film,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  Layers,
  Globe,
  Star,
  Info,
} from "lucide-react";

interface TheatreMovieCatalogBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovieForInspector?: (movie: GlobalMasterMovie) => void;
}

export function TheatreMovieCatalogBrowserModal({
  isOpen,
  onClose,
  onSelectMovieForInspector,
}: TheatreMovieCatalogBrowserModalProps) {
  const { movies: globalMasterMovies } = usePlatformStore();
  const { profile, movies: theatreMovies, linkGlobalMovie } = useTheatreStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("ALL");
  const [selectedFormat, setSelectedFormat] = useState("ALL");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Filter global movies
  const filteredGlobalMovies = useMemo(() => {
    return globalMasterMovies
      .filter((m) => !m.isDeleted)
      .filter((m) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q)) ||
          m.availableLanguages.some((l) => l.toLowerCase().includes(q)) ||
          m.cast.some((c) => c.actorName.toLowerCase().includes(q)) ||
          m.crew.some((cr) => cr.name.toLowerCase().includes(q))
        );
      })
      .filter((m) => {
        if (selectedGenre === "ALL") return true;
        return m.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase());
      })
      .filter((m) => {
        if (selectedFormat === "ALL") return true;
        return m.formats.some((f) => f.toLowerCase() === selectedFormat.toLowerCase());
      });
  }, [globalMasterMovies, searchQuery, selectedGenre, selectedFormat]);

  // Handle Acquire / Link Movie
  const handleLinkMovie = (movie: GlobalMasterMovie) => {
    const res = linkGlobalMovie(movie);
    if (res.success) {
      setFeedback(`Acquired theatrical exhibition rights for "${movie.title}".`);
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback(res.error || "Failed to link movie.");
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0B1220] border border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between bg-[#0F172A]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Global Master Film Library Browser
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Select master titles to license for <span className="text-white font-bold">{profile.name}</span> without recreating film metadata.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[#1E293B] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="px-6 py-2.5 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="p-4 bg-[#080C14] border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748B]" />
            <Input
              type="text"
              placeholder="Search master movies, actors, directors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-xs bg-[#111827] border-[#2A3445] text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="h-8 px-2.5 rounded-lg bg-[#111827] border border-[#2A3445] text-xs text-white"
            >
              <option value="ALL">All Genres</option>
              <option value="Action">Action</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Drama">Drama</option>
              <option value="Adventure">Adventure</option>
              <option value="Thriller">Thriller</option>
            </select>

            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="h-8 px-2.5 rounded-lg bg-[#111827] border border-[#2A3445] text-xs text-white"
            >
              <option value="ALL">All Formats</option>
              <option value="IMAX">IMAX</option>
              <option value="4DX">4DX</option>
              <option value="Dolby Cinema">Dolby Cinema</option>
              <option value="2D">2D</option>
              <option value="3D">3D</option>
            </select>
          </div>
        </div>

        {/* Movies Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGlobalMovies.map((movie) => {
              const isAlreadyInTheatre = theatreMovies.some(
                (m) => m.movieId === movie.id || m.title.toLowerCase() === movie.title.toLowerCase()
              );

              return (
                <Card
                  key={movie.id}
                  variant="elevated"
                  className="p-4 bg-[#0F172A] border-[#1E293B] flex gap-4 items-start hover:border-[#2A3445] transition-all"
                >
                  <div className="h-28 w-20 rounded-xl overflow-hidden bg-[#111827] shrink-0 border border-[#2A3445]">
                    <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-white text-sm truncate">{movie.title}</h4>
                      <Badge variant="outline" size="sm" className="font-mono text-amber-400 border-amber-400/30 shrink-0">
                        {movie.certificate}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-[#94A3B8] font-mono text-[11px]">
                      <span>{Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m</span>
                      <span>•</span>
                      <span>{movie.primaryLanguage}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400" /> {movie.rating}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 py-0.5">
                      {movie.formats.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-[#111827] border border-[#2A3445] text-white font-mono">
                          {f}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      {isAlreadyInTheatre ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>In Exhibition Catalog</span>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => handleLinkMovie(movie)}
                          className="gap-1 font-bold shadow-md shadow-amber-400/20 text-xs"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Acquire Rights</span>
                        </Button>
                      )}

                      {onSelectMovieForInspector && (
                        <button
                          type="button"
                          onClick={() => onSelectMovieForInspector(movie)}
                          className="text-[#94A3B8] hover:text-white text-[11px] underline underline-offset-2"
                        >
                          Details
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredGlobalMovies.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-[#0F172A] border border-[#1E293B] text-[#94A3B8] space-y-2">
              <Film className="h-8 w-8 mx-auto opacity-40 text-amber-400" />
              <div className="font-bold text-white text-sm">No master films found</div>
              <p className="text-xs">Try adjusting your search criteria or genre filters.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1E293B] flex items-center justify-between bg-[#0F172A] text-xs text-[#94A3B8]">
          <span className="font-mono text-[11px]">
            {filteredGlobalMovies.length} master films available in platform registry
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="border-[#2A3445] text-xs">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
