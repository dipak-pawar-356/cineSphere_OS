"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useTheatreStore, type ManagedMovie } from "@/store/theatre-store";
import { usePlatformStore } from "@/store/platform-store";
import { GlobalMasterMovie } from "@/types/movie-management.types";
import { TheatreMovieCatalogBrowserModal } from "@/components/movies/theatre-movie-catalog-browser-modal";
import { MasterMovieDetailModal } from "@/components/movies/master-movie-detail-modal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Film,
  Plus,
  Eye,
  Clock,
  Calendar,
  Sparkles,
  Filter,
  Search,
  Archive,
  CheckCircle2,
  X,
  Play,
  Globe,
  Lock,
  Layers,
  RotateCcw,
  Trash2,
} from "lucide-react";

export default function TheatreMoviesPage() {
  const { profile, movies, addMovie, archiveMovie, unlinkMovie, updateMovieScreeningStatus } = useTheatreStore();
  const { movies: globalMasterMovies } = usePlatformStore();

  const [activeTab, setActiveTab] = useState<"All" | "Now Showing" | "Upcoming" | "Archived">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [browserModalOpen, setBrowserModalOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [inspectingMasterMovie, setInspectingMasterMovie] = useState<GlobalMasterMovie | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Custom movie form state
  const [newTitle, setNewTitle] = useState("");
  const [newDirector, setNewDirector] = useState("");
  const [newLanguage, setNewLanguage] = useState("Hindi, English");
  const [newGenre, setNewGenre] = useState("Action, Drama");
  const [newRuntime, setNewRuntime] = useState("2h 45m");
  const [newStatus, setNewStatus] = useState<ManagedMovie["status"]>("Now Showing");
  const [newPoster, setNewPoster] = useState("");
  const [newTrailer, setNewTrailer] = useState("");
  const [newSynopsis, setNewSynopsis] = useState("");

  const filteredMovies = movies
    .filter((m) => (activeTab === "All" ? true : m.status === activeTab))
    .filter(
      (m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.director.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleCustomAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addMovie({
      title: newTitle.trim(),
      director: newDirector.trim() || "Exhibition Licensee",
      language: newLanguage.trim() || "Hindi",
      genre: newGenre.split(",").map((g) => g.trim()),
      runtime: newRuntime.trim() || "2h 30m",
      rating: "UA16+",
      releaseDate: new Date().toISOString().split("T")[0],
      status: newStatus,
      formats: ["2D", "3D", "IMAX"],
      leadCast: ["Ensemble Cast"],
      synopsis: newSynopsis.trim() || "Feature blockbuster film licensed for theatrical exhibition.",
      poster:
        newPoster.trim() ||
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
      backdrop:
        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&auto=format&fit=crop&q=80",
      trailerUrl: newTrailer.trim() || "https://www.youtube.com/watch?v=placeholder",
      kdmStatus: "Valid",
      kdmKeyId: `KDM-${profile.id.toUpperCase()}-${Date.now().toString().slice(-6)}`,
    });

    setCustomModalOpen(false);
    setNewTitle("");
    setNewDirector("");
    setNewPoster("");
    setNewTrailer("");
    setNewSynopsis("");
    setFeedbackNotice(`Movie "${newTitle}" added to exhibition catalog.`);
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const handleArchive = (id: string, title: string) => {
    if (confirm(`Archive exhibition print for "${title}"?`)) {
      archiveMovie(id);
      setFeedbackNotice(`"${title}" has been archived.`);
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  const handleUnlink = (id: string, title: string) => {
    if (confirm(`Remove "${title}" from your cinema's active exhibition catalog?`)) {
      unlinkMovie(id);
      setFeedbackNotice(`"${title}" removed from catalog.`);
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  const handleOpenMasterDetails = (movie: ManagedMovie) => {
    // Find matching master movie by movieId or title
    const found = globalMasterMovies.find(
      (m) => m.id === movie.movieId || m.title.toLowerCase() === movie.title.toLowerCase()
    );
    if (found) {
      setInspectingMasterMovie(found);
    } else {
      // Create synthetic master movie for inspector
      const synthetic: GlobalMasterMovie = {
        id: movie.id,
        slug: movie.title.toLowerCase().replace(/\s+/g, "-"),
        title: movie.title,
        synopsis: movie.synopsis,
        durationMinutes: 150,
        releaseDate: movie.releaseDate,
        certificate: movie.rating,
        status: movie.status === "Archived" ? "Archived" : "Now Showing",
        primaryLanguage: movie.language,
        availableLanguages: [movie.language],
        formats: movie.formats,
        genres: movie.genre,
        country: "India",
        posterUrl: movie.poster,
        bannerUrl: movie.backdrop,
        galleryImages: [],
        trailers: movie.trailerUrl
          ? [{ id: "t1", title: "Theatrical Trailer", videoUrl: movie.trailerUrl, platform: "YouTube", thumbnailUrl: movie.poster, duration: "2:30", isFeatured: true, order: 1 }]
          : [],
        cast: movie.leadCast.map((name, i) => ({ id: `c-${i}`, actorName: name, characterName: "Lead", profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80", displayOrder: i + 1 })),
        crew: [{ id: "cr-1", name: movie.director, role: "Director", displayOrder: 1 }],
        rating: 8.5,
        isFeatured: true,
        isTrending: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setInspectingMasterMovie(synthetic);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Licensed Feature Films & DCP Library"
        subtitle={`${profile.name} • ${movies.length} Licensed Theatrical Titles`}
        description="Manage licensed feature film prints, verify digital cinema package (DCP) ingestion integrity, track KDM decryption keys, and manage formats for upcoming show programming."
        badge={`${movies.filter((m) => m.status === "Now Showing").length} Titles Screening`}
        badgeVariant="primary"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCustomModalOpen(true)}
              className="gap-1.5 border-[#2A3445] text-xs text-[#94A3B8]"
            >
              <Plus className="h-3.5 w-3.5" /> Ingest Independent Print
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setBrowserModalOpen(true)}
              className="gap-2 font-bold shadow-lg shadow-amber-400/20"
            >
              <Globe className="h-4 w-4" /> Explore Global Film Library
            </Button>
          </div>
        }
      />

      {feedbackNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Architectural Invariant Box */}
      <Card variant="elevated" className="p-4 bg-[#0B1220] border-[#1E293B]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-bold text-white text-sm">
              Architectural Invariant: Movies are Global Master Entities
            </div>
            <p className="text-[#94A3B8] leading-relaxed">
              In real-world cinema platforms, movies are canonical records managed centrally. Your theatre licenses a movie from the Global Master Library rather than recreating posters, cast, or descriptions. When programming shows, you connect this movie to your auditorium halls, time slots, and dynamic section pricing.
            </p>
          </div>
        </div>
      </Card>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(["All", "Now Showing", "Upcoming", "Archived"] as const).map((tab) => {
            const count = tab === "All" ? movies.length : movies.filter((m) => m.status === tab).length;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#FBBF24] text-[#070B12] shadow-sm font-bold"
                    : "bg-[#111827] text-[#94A3B8] border border-[#2A3445] hover:text-white"
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search by title or language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
          />
        </div>
      </div>

      {/* Movie Catalog Table */}
      <Card variant="elevated" className="overflow-hidden border-[#2A3445] bg-[#0F172A] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0F19] text-[#64748B] uppercase text-[10px] font-bold tracking-wider border-b border-[#1E293B]">
              <tr>
                <th className="py-3.5 px-4">Film Asset</th>
                <th className="py-3.5 px-4">Audio Tracks</th>
                <th className="py-3.5 px-4">Licensed Formats</th>
                <th className="py-3.5 px-4">Runtime</th>
                <th className="py-3.5 px-4">KDM Key Decryption</th>
                <th className="py-3.5 px-4">Screening Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-[#CBD5E1]">
              {filteredMovies.map((movie) => (
                <tr key={movie.id} className="hover:bg-[#111827]/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-9 rounded-lg overflow-hidden bg-[#111827] border border-[#2A3445] shrink-0">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4
                          className="font-bold text-white text-sm hover:text-amber-400 cursor-pointer"
                          onClick={() => handleOpenMasterDetails(movie)}
                        >
                          {movie.title}
                        </h4>
                        <span className="text-[10px] text-[#64748B]">Dir: {movie.director}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-sky-400">{movie.language}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {movie.formats.map((fmt) => (
                        <span
                          key={fmt}
                          className="px-1.5 py-0.5 rounded bg-[#111827] border border-[#2A3445] text-[10px] font-mono text-[#FBBF24]"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">{movie.runtime}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                      <Lock className="h-3 w-3 text-emerald-400" />
                      <span>{movie.kdmKeyId || "KDM-ACTIVE-OK"}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        movie.status === "Now Showing"
                          ? "success"
                          : movie.status === "Upcoming"
                          ? "warning"
                          : "secondary"
                      }
                      size="sm"
                    >
                      {movie.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleOpenMasterDetails(movie)}
                      className="text-[#94A3B8] hover:text-white"
                      title="Inspect Master Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>

                    {movie.status !== "Archived" ? (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleArchive(movie.id, movie.title)}
                        className="text-amber-400 hover:text-amber-300"
                        title="Archive Exhibition License"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => updateMovieScreeningStatus(movie.id, "Now Showing")}
                        className="text-emerald-400 hover:text-emerald-300"
                        title="Restore to Now Showing"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleUnlink(movie.id, movie.title)}
                      className="text-[#64748B] hover:text-rose-400"
                      title="Remove From Catalog"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredMovies.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#94A3B8]">
                    No exhibition titles found. Click &quot;Explore Global Film Library&quot; to license master releases.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Global Catalog Browser Modal */}
      <TheatreMovieCatalogBrowserModal
        isOpen={browserModalOpen}
        onClose={() => setBrowserModalOpen(false)}
        onSelectMovieForInspector={(m) => setInspectingMasterMovie(m)}
      />

      {/* Master Movie Detail Modal */}
      <MasterMovieDetailModal
        isOpen={!!inspectingMasterMovie}
        onClose={() => setInspectingMasterMovie(null)}
        movie={inspectingMasterMovie}
      />

      {/* Custom Movie Ingest Modal */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#111827] border border-[#2A3445] p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Ingest Independent Film Print</h3>
              </div>
              <button onClick={() => setCustomModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCustomAddSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-medium">Film Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regional Film Showcase"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Director</label>
                  <input
                    type="text"
                    value={newDirector}
                    onChange={(e) => setNewDirector(e.target.value)}
                    placeholder="Director Name"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Runtime</label>
                  <input
                    type="text"
                    value={newRuntime}
                    onChange={(e) => setNewRuntime(e.target.value)}
                    placeholder="2h 15m"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Primary Language</label>
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Hindi, Marathi"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white"
                  >
                    <option value="Now Showing">Now Showing</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-medium">Poster Image URL</label>
                <input
                  type="text"
                  value={newPoster}
                  onChange={(e) => setNewPoster(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-medium">Synopsis</label>
                <textarea
                  rows={2}
                  value={newSynopsis}
                  onChange={(e) => setNewSynopsis(e.target.value)}
                  placeholder="Brief synopsis..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomModalOpen(false)}
                  className="border-[#2A3445] text-[#94A3B8]"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="font-bold">
                  Ingest Print
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
