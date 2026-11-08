"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { usePlatformStore } from "@/store/platform-store";
import { GlobalMasterMovie, CreateMasterMovieInput } from "@/types/movie-management.types";
import { MasterMovieFormModal } from "@/components/movies/master-movie-form-modal";
import { MasterMovieDetailModal } from "@/components/movies/master-movie-detail-modal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Film,
  Plus,
  Search,
  Filter,
  Star,
  Clock,
  Sparkles,
  Key,
  Layers,
  Globe,
  Eye,
  Edit,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
  CheckCircle2,
  LayoutGrid,
  List,
  Calendar,
} from "lucide-react";

export default function SuperAdminMoviesPage() {
  const {
    movies,
    addMasterMovie,
    updateMasterMovie,
    archiveMasterMovie,
    restoreMasterMovie,
    deleteMasterMovie,
    duplicateMasterMovie,
  } = usePlatformStore();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCertificate, setSelectedCertificate] = useState("all");
  const [selectedReleaseYear, setSelectedReleaseYear] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [sortBy, setSortBy] = useState<"release-desc" | "release-asc" | "title-asc" | "title-desc" | "duration-desc" | "rating-desc">("release-desc");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<GlobalMasterMovie | null>(null);
  const [inspectingMovie, setInspectingMovie] = useState<GlobalMasterMovie | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered and Sorted master movies
  const filteredMovies = useMemo(() => {
    const list = movies
      .filter((m) => !m.isDeleted)
      .filter((m) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.originalTitle?.toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q)) ||
          m.availableLanguages.some((l) => l.toLowerCase().includes(q)) ||
          m.formats.some((f) => f.toLowerCase().includes(q)) ||
          m.certificate.toLowerCase().includes(q) ||
          m.releaseDate.toLowerCase().includes(q) ||
          m.cast.some((c) => c.actorName.toLowerCase().includes(q)) ||
          m.crew.some((cr) => cr.name.toLowerCase().includes(q))
        );
      })
      .filter((m) => {
        if (selectedGenre === "all") return true;
        return m.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase());
      })
      .filter((m) => {
        if (selectedFormat === "all") return true;
        return m.formats.some((f) => f.toLowerCase() === selectedFormat.toLowerCase());
      })
      .filter((m) => {
        if (selectedLanguage === "all") return true;
        return m.availableLanguages.some((l) => l.toLowerCase() === selectedLanguage.toLowerCase());
      })
      .filter((m) => {
        if (selectedStatus === "all") return true;
        return m.status.toLowerCase() === selectedStatus.toLowerCase();
      })
      .filter((m) => {
        if (selectedCertificate === "all") return true;
        return m.certificate.toLowerCase() === selectedCertificate.toLowerCase();
      })
      .filter((m) => {
        if (selectedReleaseYear === "all") return true;
        return m.releaseDate.startsWith(selectedReleaseYear);
      })
      .filter((m) => {
        if (selectedDuration === "all") return true;
        if (selectedDuration === "under-120") return m.durationMinutes < 120;
        if (selectedDuration === "120-150") return m.durationMinutes >= 120 && m.durationMinutes <= 150;
        if (selectedDuration === "over-150") return m.durationMinutes > 150;
        return true;
      });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === "release-desc") return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      if (sortBy === "release-asc") return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
      if (sortBy === "title-asc") return a.title.localeCompare(b.title);
      if (sortBy === "title-desc") return b.title.localeCompare(a.title);
      if (sortBy === "duration-desc") return b.durationMinutes - a.durationMinutes;
      if (sortBy === "rating-desc") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [
    movies,
    searchQuery,
    selectedGenre,
    selectedFormat,
    selectedLanguage,
    selectedStatus,
    selectedCertificate,
    selectedReleaseYear,
    selectedDuration,
    sortBy,
  ]);

  // Paginated movies
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMovies.slice(start, start + pageSize);
  }, [filteredMovies, currentPage]);

  const totalPages = Math.ceil(filteredMovies.length / pageSize) || 1;

  // Aggregate Metrics
  const activeReleases = movies.filter((m) => !m.isDeleted && m.status === "Now Showing").length;
  const upcomingReleases = movies.filter((m) => !m.isDeleted && m.status === "Upcoming").length;
  const archivedReleases = movies.filter((m) => !m.isDeleted && m.status === "Archived").length;
  const uniqueLanguagesCount = new Set(
    movies.filter((m) => !m.isDeleted).flatMap((m) => m.availableLanguages)
  ).size;

  // Action Handlers
  const handleOpenCreate = () => {
    setEditingMovie(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (movie: GlobalMasterMovie) => {
    setEditingMovie(movie);
    setFormModalOpen(true);
  };

  const handleSaveMovie = (input: CreateMasterMovieInput) => {
    if (editingMovie) {
      updateMasterMovie(editingMovie.id, input);
      setToastMessage(`Updated master film "${input.title}".`);
    } else {
      addMasterMovie(input as any);
      setToastMessage(`Ingested new master film "${input.title}".`);
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDuplicate = (id: string, title: string) => {
    const res = duplicateMasterMovie(id);
    if (res.success) {
      setToastMessage(`Duplicated master metadata for "${title}".`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleArchive = (id: string, title: string) => {
    archiveMasterMovie(id);
    setToastMessage(`Archived master film "${title}".`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRestore = (id: string, title: string) => {
    restoreMasterMovie(id);
    setToastMessage(`Restored master film "${title}" to active status.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to soft-delete master film "${title}"?`)) {
      deleteMasterMovie(id);
      setToastMessage(`Soft-deleted master film "${title}".`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedGenre("all");
    setSelectedFormat("all");
    setSelectedLanguage("all");
    setSelectedStatus("all");
    setSelectedCertificate("all");
    setSelectedReleaseYear("all");
    setSelectedDuration("all");
    setSortBy("release-desc");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Global Master Film Catalog & DCP Registry"
        subtitle={`${movies.filter((m) => !m.isDeleted).length} Canonical Theatrical Releases • Multi-Tenant Exhibition Rails`}
        description="Ingest master films once with canonical media assets, cast, crew, and technical specifications. Registered cinemas link to these master titles without duplicating film records."
        badge={`${activeReleases} Active Theatrical Titles`}
        badgeVariant="primary"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="gap-2 font-bold shadow-lg shadow-amber-400/20"
          >
            <Plus className="h-4 w-4" /> Ingest New Film Asset
          </Button>
        }
      />

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active Releases", val: `${activeReleases} Titles`, sub: "Currently Screening", color: "text-emerald-400" },
          { label: "Upcoming Pipeline", val: `${upcomingReleases} Movies`, sub: "DCP Ingest Ready", color: "text-amber-400" },
          { label: "Audio Languages", val: `${uniqueLanguagesCount} Languages`, sub: "Multi-Track Soundtracks", color: "text-sky-400" },
          { label: "Archived Releases", val: `${archivedReleases} Titles`, sub: "Exhibition Concluded", color: "text-[#94A3B8]" },
        ].map((m, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#64748B] font-mono">{m.label}</div>
            <div className="text-xl font-extrabold font-mono text-white">{m.val}</div>
            <div className={`text-[11px] ${m.color} font-medium`}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
            <Input
              type="text"
              placeholder="Search by title, actor, director, genre..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-8 text-xs bg-[#0B0F19] border-[#2A3445] text-white"
            />
          </div>

          {/* View Mode & Count */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-[11px] text-[#64748B] font-mono">
              Showing {filteredMovies.length} master films
            </span>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0B0F19] border border-[#2A3445]">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table" ? "bg-[#1E293B] text-amber-400" : "text-[#64748B] hover:text-white"
                }`}
                title="Table View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-[#1E293B] text-amber-400" : "text-[#64748B] hover:text-white"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1E293B]">
          <select
            value={selectedGenre}
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              setCurrentPage(1);
            }}
            className="h-7 px-2 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-[11px] text-white"
          >
            <option value="all">All Genres</option>
            <option value="Action">Action</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Drama">Drama</option>
            <option value="Adventure">Adventure</option>
            <option value="Thriller">Thriller</option>
            <option value="Biography">Biography</option>
            <option value="Comedy">Comedy</option>
          </select>

          <select
            value={selectedFormat}
            onChange={(e) => {
              setSelectedFormat(e.target.value);
              setCurrentPage(1);
            }}
            className="h-7 px-2 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-[11px] text-white"
          >
            <option value="all">All Formats</option>
            <option value="IMAX">IMAX</option>
            <option value="4DX">4DX</option>
            <option value="Dolby Cinema">Dolby Cinema</option>
            <option value="2D">2D</option>
            <option value="3D">3D</option>
          </select>

          <select
            value={selectedLanguage}
            onChange={(e) => {
              setSelectedLanguage(e.target.value);
              setCurrentPage(1);
            }}
            className="h-7 px-2 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-[11px] text-white"
          >
            <option value="all">All Languages</option>
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
            <option value="Telugu">Telugu</option>
            <option value="Tamil">Tamil</option>
            <option value="Malayalam">Malayalam</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="h-7 px-2 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-[11px] text-white"
          >
            <option value="all">All Statuses</option>
            <option value="Now Showing">Now Showing</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            value={selectedCertificate}
            onChange={(e) => {
              setSelectedCertificate(e.target.value);
              setCurrentPage(1);
            }}
            className="h-7 px-2 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-[11px] text-white"
          >
            <option value="all">All Ratings</option>
            <option value="U">U</option>
            <option value="UA">UA</option>
            <option value="UA 13+">UA 13+</option>
            <option value="UA 16+">UA 16+</option>
            <option value="A">A</option>
            <option value="S">S</option>
          </select>

          <select
            value={selectedReleaseYear}
            onChange={(e) => {
              setSelectedReleaseYear(e.target.value);
              setCurrentPage(1);
            }}
            className="h-7 px-2 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-[11px] text-white font-mono"
          >
            <option value="all">All Release Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2014">2014 (Classics)</option>
          </select>

          <select
            value={selectedDuration}
            onChange={(e) => {
              setSelectedDuration(e.target.value);
              setCurrentPage(1);
            }}
            className="h-7 px-2 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-[11px] text-white font-mono"
          >
            <option value="all">All Durations</option>
            <option value="under-120">&lt; 120 mins</option>
            <option value="120-150">120 - 150 mins</option>
            <option value="over-150">&gt; 150 mins (Epic)</option>
          </select>

          <div className="h-4 w-[1px] bg-[#1E293B] hidden sm:block mx-1" />

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-mono text-[#64748B]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-7 px-2 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-[11px] text-amber-400 font-mono"
            >
              <option value="release-desc">Release Date (Newest)</option>
              <option value="release-asc">Release Date (Oldest)</option>
              <option value="title-asc">Title (A to Z)</option>
              <option value="title-desc">Title (Z to A)</option>
              <option value="duration-desc">Duration (Longest)</option>
              <option value="rating-desc">Rating (Highest)</option>
            </select>
          </div>

          {(searchQuery ||
            selectedGenre !== "all" ||
            selectedFormat !== "all" ||
            selectedLanguage !== "all" ||
            selectedStatus !== "all" ||
            selectedCertificate !== "all" ||
            selectedReleaseYear !== "all" ||
            selectedDuration !== "all" ||
            sortBy !== "release-desc") && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleResetFilters}
              className="h-7 text-[11px] text-[#94A3B8] hover:text-white gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area: Table or Grid */}
      {viewMode === "table" ? (
        <div className="rounded-3xl bg-[#0F172A] border border-[#1E293B] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0F19] text-[#64748B] font-bold uppercase tracking-wider text-[10px] border-b border-[#1E293B]">
                <tr>
                  <th className="py-3.5 px-5">Film Asset</th>
                  <th className="py-3.5 px-4">Formats</th>
                  <th className="py-3.5 px-4">Audio Languages</th>
                  <th className="py-3.5 px-4">Genres</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Certificate</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] text-[#CBD5E1]">
                {paginatedMovies.map((mv) => (
                  <tr key={mv.id} className="hover:bg-[#111827]/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-9 rounded-lg overflow-hidden bg-[#111827] border border-[#2A3445] shrink-0">
                          <img src={mv.posterUrl} alt={mv.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white hover:text-amber-400 cursor-pointer truncate" onClick={() => setInspectingMovie(mv)}>
                            {mv.title}
                          </div>
                          <div className="text-[10px] text-[#64748B] truncate">
                            Dir: {mv.crew.find((c) => c.role === "Director")?.name || "Filmmaker"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {mv.formats.slice(0, 3).map((f, i) => (
                          <Badge key={i} variant="secondary" size="sm" className="font-mono text-[9px] px-1 py-0">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#94A3B8]">
                      {mv.availableLanguages.slice(0, 3).join(", ")}
                    </td>
                    <td className="py-3.5 px-4 text-[#94A3B8]">
                      {mv.genres.slice(0, 2).join(", ")}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-white">
                      {Math.floor(mv.durationMinutes / 60)}h {mv.durationMinutes % 60}m
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" size="sm" className="font-mono text-amber-400 border-amber-400/30">
                        {mv.certificate}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-400 font-bold">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span>{mv.rating}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={mv.status === "Now Showing" ? "success" : mv.status === "Upcoming" ? "warning" : "secondary"} size="sm">
                        {mv.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setInspectingMovie(mv)}
                          className="h-7 w-7 p-0 text-[#94A3B8] hover:text-white"
                          title="Inspect Master Film"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleOpenEdit(mv)}
                          className="h-7 w-7 p-0 text-[#94A3B8] hover:text-amber-400"
                          title="Edit Film Metadata"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleDuplicate(mv.id, mv.title)}
                          className="h-7 w-7 p-0 text-[#94A3B8] hover:text-sky-400"
                          title="Duplicate Metadata"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        {mv.status === "Archived" ? (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleRestore(mv.id, mv.title)}
                            className="h-7 w-7 p-0 text-[#94A3B8] hover:text-emerald-400"
                            title="Restore Film"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleArchive(mv.id, mv.title)}
                            className="h-7 w-7 p-0 text-[#94A3B8] hover:text-amber-400"
                            title="Archive Film"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleDelete(mv.id, mv.title)}
                          className="h-7 w-7 p-0 text-[#94A3B8] hover:text-rose-400"
                          title="Soft Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedMovies.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#94A3B8]">
                      No master films found matching your search and filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-[#0B0F19] border-t border-[#1E293B] flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="font-mono text-[11px]">
              Page {currentPage} of {totalPages} ({filteredMovies.length} total releases)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="xs"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-7 px-2.5 text-xs border-[#2A3445]"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="xs"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 px-2.5 text-xs border-[#2A3445]"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedMovies.map((mv) => (
              <Card
                key={mv.id}
                variant="elevated"
                className="overflow-hidden bg-[#0F172A] border-[#1E293B] hover:border-amber-400/40 transition-all flex flex-col justify-between group shadow-xl"
              >
                <div className="relative h-48 w-full bg-[#070B12] overflow-hidden">
                  <img
                    src={mv.bannerUrl || mv.posterUrl}
                    alt={mv.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-black/40" />

                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <Badge variant={mv.status === "Now Showing" ? "success" : mv.status === "Upcoming" ? "warning" : "secondary"} size="sm">
                      {mv.status}
                    </Badge>
                    <Badge variant="outline" size="sm" className="font-mono text-amber-400 border-amber-400/30">
                      {mv.certificate}
                    </Badge>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base drop-shadow-md truncate">
                        {mv.title}
                      </h4>
                      <p className="text-[11px] text-[#94A3B8] font-mono">
                        {Math.floor(mv.durationMinutes / 60)}h {mv.durationMinutes % 60}m • {mv.primaryLanguage}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-amber-400 font-bold text-xs bg-black/60 px-2 py-0.5 rounded-md border border-amber-400/20">
                      <Star className="h-3 w-3 fill-amber-400" />
                      <span>{mv.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                  <p className="text-[#94A3B8] line-clamp-2 text-[11px] leading-relaxed">
                    {mv.synopsis}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {mv.formats.map((f, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-[#0B0F19] border border-[#2A3445] text-white font-mono">
                        {f}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setInspectingMovie(mv)}
                      className="text-[#FBBF24] hover:text-white p-0 text-xs"
                    >
                      Inspect Master Film &rarr;
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleOpenEdit(mv)}
                        className="h-7 w-7 p-0 text-[#94A3B8] hover:text-white"
                        title="Edit Film"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDuplicate(mv.id, mv.title)}
                        className="h-7 w-7 p-0 text-[#94A3B8] hover:text-sky-400"
                        title="Duplicate Metadata"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDelete(mv.id, mv.title)}
                        className="h-7 w-7 p-0 text-[#94A3B8] hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="p-4 bg-[#0F172A] rounded-2xl border border-[#1E293B] flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="font-mono text-[11px]">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="xs"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-7 px-2.5 text-xs border-[#2A3445]"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="xs"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 px-2.5 text-xs border-[#2A3445]"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <MasterMovieFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSaveMovie}
        initialMovie={editingMovie}
      />

      <MasterMovieDetailModal
        isOpen={!!inspectingMovie}
        onClose={() => setInspectingMovie(null)}
        movie={inspectingMovie}
        onEdit={(mv) => handleOpenEdit(mv)}
      />
    </div>
  );
}
