"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { useTheatreStore, ManagedShow } from "@/store/theatre-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Plus,
  Clock,
  Filter,
  Eye,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Sparkles,
  Layers,
  Copy,
  Edit,
  Trash2,
  RotateCcw,
  List,
  LayoutGrid,
  Film,
  Building2,
  DollarSign,
  Users,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import { ProgramShowModal } from "@/components/shows/program-show-modal";
import { ShowDetailModal } from "@/components/shows/show-detail-modal";

export default function TheatreShowsPage() {
  const { profile, shows, halls, movies, cancelShow, duplicateShow } = useTheatreStore();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHallFilter, setSelectedHallFilter] = useState("all");
  const [selectedFormatFilter, setSelectedFormatFilter] = useState("all");
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedBookingStatus, setSelectedBookingStatus] = useState("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modal states
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<ManagedShow | null>(null);
  const [inspectingShow, setInspectingShow] = useState<ManagedShow | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered shows
  const filteredShows = useMemo(() => {
    return shows
      .filter((s) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          s.movieTitle.toLowerCase().includes(q) ||
          s.hallName.toLowerCase().includes(q) ||
          (s.showCode && s.showCode.toLowerCase().includes(q)) ||
          s.language.toLowerCase().includes(q) ||
          s.format.toLowerCase().includes(q) ||
          s.date.toLowerCase().includes(q)
        );
      })
      .filter((s) => {
        if (selectedHallFilter === "all") return true;
        return s.hallId === selectedHallFilter || s.hallName.toLowerCase().includes(selectedHallFilter.toLowerCase());
      })
      .filter((s) => {
        if (selectedFormatFilter === "all") return true;
        return s.format.toLowerCase().includes(selectedFormatFilter.toLowerCase());
      })
      .filter((s) => {
        if (selectedLanguageFilter === "all") return true;
        return s.language.toLowerCase().includes(selectedLanguageFilter.toLowerCase());
      })
      .filter((s) => {
        if (selectedStatusFilter === "all") return true;
        return s.status.toLowerCase() === selectedStatusFilter.toLowerCase();
      })
      .filter((s) => {
        if (selectedBookingStatus === "all") return true;
        const status = s.bookingStatus || (s.status === "Cancelled" ? "Cancelled" : "Booking Open");
        return status.toLowerCase() === selectedBookingStatus.toLowerCase();
      })
      .filter((s) => {
        if (selectedDateFilter === "all") return true;
        return s.date === selectedDateFilter;
      });
  }, [
    shows,
    searchQuery,
    selectedHallFilter,
    selectedFormatFilter,
    selectedLanguageFilter,
    selectedStatusFilter,
    selectedBookingStatus,
    selectedDateFilter,
  ]);

  // Paginated shows
  const paginatedShows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredShows.slice(start, start + pageSize);
  }, [filteredShows, currentPage]);

  const totalPages = Math.ceil(filteredShows.length / pageSize) || 1;

  // Aggregate Metrics
  const activeShowsCount = shows.filter((s) => s.status !== "Cancelled" && s.status !== "Archived").length;
  const totalBookedSeats = shows.reduce((sum, s) => sum + s.seatsBooked, 0);
  const totalSeatsCapacity = shows.reduce((sum, s) => sum + s.totalSeats, 0);
  const averageOccupancy = totalSeatsCapacity > 0 ? Math.round((totalBookedSeats / totalSeatsCapacity) * 100) : 0;
  const projectedRevenue = shows.reduce((sum, s) => sum + s.seatsBooked * s.ticketPrice, 0);

  // Handlers
  const handleOpenCreate = () => {
    setEditingShow(null);
    setProgramModalOpen(true);
  };

  const handleEditShow = (show: ManagedShow) => {
    setEditingShow(show);
    setProgramModalOpen(true);
  };

  const handleCancelShow = (id: string, movieTitle: string) => {
    if (confirm(`Cancel showtime screening for "${movieTitle}"?`)) {
      cancelShow(id, "Cancelled by Theatre Admin");
      setFeedbackNotice(`Showtime for "${movieTitle}" has been cancelled.`);
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  const handleDuplicateShow = (show: ManagedShow) => {
    const res = duplicateShow(show.id);
    if (res.success) {
      setFeedbackNotice(`Duplicated showtime slot for "${show.movieTitle}".`);
      setTimeout(() => setFeedbackNotice(null), 4000);
    } else {
      alert(res.error || "Failed to duplicate show.");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedHallFilter("all");
    setSelectedFormatFilter("all");
    setSelectedLanguageFilter("all");
    setSelectedStatusFilter("all");
    setSelectedBookingStatus("all");
    setSelectedDateFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Feedback */}
      {feedbackNotice && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="font-medium">{feedbackNotice}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Showtime Dispatch & Scheduling Engine"
        subtitle={`${profile.name} • ${shows.length} Programmed Screenings`}
        description="Schedule feature films into auditoriums with automatic conflict prevention, turnaround calculation, reusable pricing profile mapping, and show-specific seat inventory preparation."
        badge={`${activeShowsCount} Screenings Active`}
        badgeVariant="primary"
        actions={
          <div className="flex items-center gap-2">
            <Link href={ROUTES.THEATRE_ADMIN.SHOW_CALENDAR}>
              <Button variant="outline" size="sm" className="gap-2 border-[#2A3445] text-white">
                <CalendarDays className="h-4 w-4 text-amber-400" /> Visual Timeline Grid
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="gap-1.5 font-bold shadow-lg shadow-amber-400/20"
            >
              <Plus className="h-4 w-4" /> Program New Showtime
            </Button>
          </div>
        }
      />

      {/* Telemetry Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Active Screenings",
            val: `${activeShowsCount} Shows`,
            sub: "Dispatch Roster",
            color: "text-emerald-400",
          },
          {
            label: "Seat Occupancy",
            val: `${averageOccupancy}%`,
            sub: `${totalBookedSeats} / ${totalSeatsCapacity} seats`,
            color: "text-amber-400",
          },
          {
            label: "Est. Box Office",
            val: `₹${(projectedRevenue / 100000).toFixed(2)} Lakh`,
            sub: "Gross Revenue",
            color: "text-sky-400",
          },
          {
            label: "Auditoriums in Action",
            val: `${halls.length} Halls`,
            sub: "Multi-Screen Fleet",
            color: "text-purple-400",
          },
        ].map((m, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#64748B] font-mono">{m.label}</div>
            <div className="text-xl font-extrabold font-mono text-white">{m.val}</div>
            <div className={`text-[11px] ${m.color} font-medium`}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
            <Input
              type="text"
              placeholder="Search by movie, hall, code, language..."
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
              Showing {filteredShows.length} of {shows.length} shows
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
                title="Grid Cards View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1E293B]">
          <select
            value={selectedHallFilter}
            onChange={(e) => {
              setSelectedHallFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-7 px-2 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-[11px] text-white"
          >
            <option value="all">All Auditoriums</option>
            {halls.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          <select
            value={selectedFormatFilter}
            onChange={(e) => {
              setSelectedFormatFilter(e.target.value);
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
            value={selectedLanguageFilter}
            onChange={(e) => {
              setSelectedLanguageFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-7 px-2 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-[11px] text-white"
          >
            <option value="all">All Languages</option>
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
            <option value="Telugu">Telugu</option>
            <option value="Tamil">Tamil</option>
            <option value="Marathi">Marathi</option>
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => {
              setSelectedStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-7 px-2 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-[11px] text-white"
          >
            <option value="all">All Lifecycle Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Running">Running</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={selectedBookingStatus}
            onChange={(e) => {
              setSelectedBookingStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="h-7 px-2 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-[11px] text-white"
          >
            <option value="all">All Booking States</option>
            <option value="Booking Open">Booking Open</option>
            <option value="Booking Closed">Booking Closed</option>
            <option value="Sold Out">Sold Out</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {(searchQuery ||
            selectedHallFilter !== "all" ||
            selectedFormatFilter !== "all" ||
            selectedLanguageFilter !== "all" ||
            selectedStatusFilter !== "all" ||
            selectedBookingStatus !== "all" ||
            selectedDateFilter !== "all") && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleResetFilters}
              className="h-7 text-[11px] text-[#94A3B8] hover:text-white gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Reset Filters
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
                  <th className="py-3.5 px-5">Showtime & Movie</th>
                  <th className="py-3.5 px-4">Auditorium</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Format & Audio</th>
                  <th className="py-3.5 px-4">Pricing Profile</th>
                  <th className="py-3.5 px-4">Occupancy Telemetry</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {paginatedShows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#94A3B8]">
                      <Film className="h-8 w-8 mx-auto text-amber-400 mb-2 opacity-50" />
                      <p className="font-semibold text-white">No scheduled shows match your criteria</p>
                      <p className="text-[11px] mt-0.5">Try adjusting your filters or program a new screening.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedShows.map((show) => {
                    const fillRate =
                      show.totalSeats > 0 ? Math.round((show.seatsBooked / show.totalSeats) * 100) : 0;
                    return (
                      <tr key={show.id} className="hover:bg-[#111827]/60 transition-colors">
                        {/* Movie & Code */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            {show.moviePosterUrl ? (
                              <div className="h-12 w-8 rounded-lg overflow-hidden bg-[#111827] border border-[#2A3445] shrink-0">
                                <img
                                  src={show.moviePosterUrl}
                                  alt={show.movieTitle}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                                <Film className="h-4 w-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-bold text-white text-xs truncate block hover:text-amber-400 transition-colors">
                                {show.movieTitle}
                              </span>
                              <span className="text-[10px] text-[#64748B] font-mono">
                                {show.showCode || `SH-${show.id.slice(0, 8)}`}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Auditorium */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-white">{show.hallName}</div>
                          <span className="text-[10px] text-sky-400 font-mono">
                            {show.screenType || show.format}
                          </span>
                        </td>

                        {/* Date & Time */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-amber-400 font-mono text-xs">
                            {show.startTime} – {show.endTime}
                          </div>
                          <div className="text-[10px] text-[#94A3B8] flex items-center gap-1 font-mono">
                            <Calendar className="h-3 w-3 text-[#64748B]" /> {show.date}
                          </div>
                        </td>

                        {/* Format & Audio */}
                        <td className="py-3.5 px-4">
                          <Badge variant="primary" size="sm" className="font-mono text-[10px]">
                            {show.format}
                          </Badge>
                          <div className="text-[11px] text-[#94A3B8] mt-0.5 truncate">{show.language}</div>
                        </td>

                        {/* Pricing Profile */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-white truncate">
                            {show.pricingProfileName || "Standard Tariff"}
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">
                            Base: ₹{show.ticketPrice}
                          </span>
                        </td>

                        {/* Occupancy */}
                        <td className="py-3.5 px-4">
                          <div className="w-28 space-y-1">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span className="text-white font-bold">{show.seatsBooked}/{show.totalSeats}</span>
                              <span className="text-emerald-400">{fillRate}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[#1E293B] overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${fillRate}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              show.status === "Cancelled"
                                ? "danger"
                                : show.status === "Running"
                                ? "success"
                                : "outline"
                            }
                            size="sm"
                          >
                            {show.status}
                          </Badge>
                          <div className="text-[10px] text-[#64748B] mt-0.5">
                            {show.bookingStatus || "Booking Open"}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setInspectingShow(show)}
                              className="p-1.5 rounded-lg bg-[#0B0F19] text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors"
                              title="Inspect Screening Event"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditShow(show)}
                              className="p-1.5 rounded-lg bg-[#0B0F19] text-sky-400 hover:bg-[#1E293B] transition-colors"
                              title="Modify Show"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateShow(show)}
                              className="p-1.5 rounded-lg bg-[#0B0F19] text-amber-400 hover:bg-[#1E293B] transition-colors"
                              title="Duplicate Show"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancelShow(show.id, show.movieTitle)}
                              disabled={show.status === "Cancelled"}
                              className="p-1.5 rounded-lg bg-[#0B0F19] text-rose-400 hover:bg-[#1E293B] transition-colors disabled:opacity-40"
                              title="Cancel Show"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 bg-[#0B0F19] border-t border-[#1E293B] flex items-center justify-between text-xs">
              <span className="text-[#64748B]">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-[#2A3445]"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-[#2A3445]"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedShows.map((show) => {
            const fillRate =
              show.totalSeats > 0 ? Math.round((show.seatsBooked / show.totalSeats) * 100) : 0;
            return (
              <Card
                key={show.id}
                variant="elevated"
                className="p-5 bg-[#0F172A] border-[#1E293B] space-y-4 hover:border-amber-400/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {show.moviePosterUrl && (
                        <div className="h-16 w-12 rounded-lg overflow-hidden bg-[#111827] border border-[#2A3445] shrink-0">
                          <img
                            src={show.moviePosterUrl}
                            alt={show.movieTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <Badge variant="primary" size="sm" className="font-mono text-[9px]">
                          {show.format}
                        </Badge>
                        <h4 className="font-bold text-white text-sm mt-1 line-clamp-1">
                          {show.movieTitle}
                        </h4>
                        <div className="text-[11px] text-[#94A3B8]">{show.hallName}</div>
                      </div>
                    </div>

                    <Badge
                      variant={show.status === "Cancelled" ? "danger" : "success"}
                      size="sm"
                    >
                      {show.status}
                    </Badge>
                  </div>

                  {/* Schedule turnaround */}
                  <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B] flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#64748B] block">SHOWTIME</span>
                      <span className="font-bold text-amber-400">{show.startTime} – {show.endTime}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#64748B] block">BASE RATE</span>
                      <span className="font-bold text-emerald-400">₹{show.ticketPrice}</span>
                    </div>
                  </div>

                  {/* Occupancy telemetry */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-[#94A3B8]">Occupancy: {show.seatsBooked}/{show.totalSeats}</span>
                      <span className="text-emerald-400 font-bold">{fillRate}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#1E293B] overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${fillRate}%` }} />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[#1E293B]">
                  <span className="text-[10px] font-mono text-[#64748B]">
                    {show.bookingStatus || "Booking Open"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setInspectingShow(show)}
                      className="text-xs text-[#94A3B8] hover:text-white"
                    >
                      <Eye className="h-3 w-3 mr-1" /> View
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleEditShow(show)}
                      className="border-[#2A3445] text-xs text-sky-400"
                    >
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Program / Edit Modal */}
      <ProgramShowModal
        isOpen={programModalOpen}
        onClose={() => setProgramModalOpen(false)}
        editingShow={editingShow}
        onSuccess={(msg) => {
          setFeedbackNotice(msg);
          setTimeout(() => setFeedbackNotice(null), 4000);
        }}
      />

      {/* Detail Inspection Modal */}
      <ShowDetailModal
        isOpen={!!inspectingShow}
        onClose={() => setInspectingShow(null)}
        show={inspectingShow}
        onEdit={(sh) => {
          setInspectingShow(null);
          handleEditShow(sh);
        }}
        onCancel={(id, title) => handleCancelShow(id, title)}
        onDuplicate={(sh) => handleDuplicateShow(sh)}
      />
    </div>
  );
}
