"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useTheatreStore, type ManagedMovie } from "@/store/theatre-store";
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
} from "lucide-react";

export default function TheatreMoviesPage() {
  const { profile, movies, addMovie, archiveMovie } = useTheatreStore();

  const [activeTab, setActiveTab] = useState<"All" | "Now Showing" | "Upcoming" | "Archived">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // New movie form state
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

  const handleAddSubmit = (e: React.FormEvent) => {
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
    });

    setAddModalOpen(false);
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

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Licensed Feature Films & DCP Library"
        subtitle={`${profile.name} • ${movies.length} Exhibition Titles`}
        description="Manage licensed feature film prints, verify digital cinema package (DCP) ingestion integrity, track KDM decryption keys, and manage formats."
        badge={`${movies.filter((m) => m.status === "Now Showing").length} Titles Screening`}
        badgeVariant="primary"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setAddModalOpen(true)}
            className="gap-2 font-bold bg-[#E50914] text-white hover:bg-[#b80710]"
          >
            <Plus className="h-4 w-4" /> Ingest Film Print
          </Button>
        }
      />

      {feedbackNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

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
      <Card variant="elevated" className="overflow-hidden border-[#2A3445]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-4">Film & Poster</th>
                <th className="py-3.5 px-4">Language & Audio</th>
                <th className="py-3.5 px-4">Formats</th>
                <th className="py-3.5 px-4">Runtime</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {filteredMovies.map((movie) => (
                <tr key={movie.id} className="hover:bg-[#161F2E]/60 transition-colors">
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
                        <h4 className="font-bold text-white text-sm">{movie.title}</h4>
                        <span className="text-[10px] text-[#64748B]">Dir: {movie.director}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{movie.language}</td>
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
                  <td className="py-3 px-4 text-right space-x-2">
                    {movie.status !== "Archived" && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleArchive(movie.id, movie.title)}
                        className="border-[#2A3445] text-amber-400 hover:bg-amber-400/10"
                      >
                        <Archive className="h-3 w-3 mr-1" /> Archive
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Movie Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#111827] border border-[#2A3445] p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-[#E50914]" />
                <h3 className="text-lg font-bold text-white">Ingest Movie License</h3>
              </div>
              <button onClick={() => setAddModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-medium">Film Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gladiator II"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Director</label>
                  <input
                    type="text"
                    placeholder="Ridley Scott"
                    value={newDirector}
                    onChange={(e) => setNewDirector(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Languages (Comma separated)</label>
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Runtime</label>
                  <input
                    type="text"
                    value={newRuntime}
                    onChange={(e) => setNewRuntime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Exhibition Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#E50914]"
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
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newPoster}
                  onChange={(e) => setNewPoster(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-medium">Trailer Video URL (Placeholder)</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={newTrailer}
                  onChange={(e) => setNewTrailer(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A3445]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddModalOpen(false)}
                  className="border-[#2A3445] text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-[#E50914] text-white font-bold"
                >
                  Save to Catalog
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
