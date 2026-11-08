"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { useTheatreStore, type ManagedShow } from "@/store/theatre-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function TheatreShowsPage() {
  const { profile, shows, halls, movies, addShow, cancelShow } = useTheatreStore();

  const [selectedHallFilter, setSelectedHallFilter] = useState<string>("All");
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // New show form state
  const [selectedMovieId, setSelectedMovieId] = useState(movies[0]?.id || "");
  const [selectedHallId, setSelectedHallId] = useState(halls[0]?.id || "");
  const [showDate, setShowDate] = useState("Today, Nov 08");
  const [startTime, setStartTime] = useState("07:15 PM");
  const [endTime, setEndTime] = useState("10:15 PM");
  const [language, setLanguage] = useState("Hindi (Dolby Atmos)");
  const [format, setFormat] = useState<ManagedShow["format"]>("IMAX");
  const [ticketPrice, setTicketPrice] = useState(380);

  const filteredShows = shows.filter((s) => {
    if (selectedHallFilter === "All") return true;
    return s.hallName.toLowerCase().includes(selectedHallFilter.toLowerCase());
  });

  const handleProgramSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedMovie = movies.find((m) => m.id === selectedMovieId) || movies[0];
    const selectedHall = halls.find((h) => h.id === selectedHallId) || halls[0];

    addShow({
      movieId: selectedMovie.id,
      movieTitle: selectedMovie.title,
      hallId: selectedHall.id,
      hallName: selectedHall.name,
      date: showDate,
      startTime,
      endTime,
      language,
      format,
      ticketPrice: Number(ticketPrice) || 250,
      totalSeats: selectedHall.capacity,
      status: "Upcoming",
    });

    setProgramModalOpen(false);
    setFeedbackNotice(`Show for "${selectedMovie.title}" programmed in ${selectedHall.name}.`);
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const handleCancelShow = (id: string, movieTitle: string, time: string) => {
    if (confirm(`Cancel showtime for "${movieTitle}" at ${time}?`)) {
      cancelShow(id);
      setFeedbackNotice(`Showtime for "${movieTitle}" has been cancelled.`);
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Showtime Dispatch & Schedule Management"
        subtitle={`${profile.name} • ${shows.length} Programmed Shows`}
        description="Program feature film timetables into halls, define starting base ticket prices, track auditorium capacities, and inspect real-time seat lock telemetry."
        badge={`${shows.length} Shows Active`}
        badgeVariant="primary"
        actions={
          <div className="flex gap-2">
            <Link href={ROUTES.THEATRE_ADMIN.SHOW_CALENDAR}>
              <Button variant="outline" size="sm" className="gap-2 border-[#2A3445] text-white">
                <CalendarDays className="h-4 w-4 text-[#FBBF24]" /> Visual Calendar
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setProgramModalOpen(true)}
              className="gap-1.5 font-bold bg-[#E50914] text-white hover:bg-[#b80710]"
            >
              <Plus className="h-4 w-4" /> Program Showtime
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

      {/* Show Pricing Decoupling Architecture Note */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 flex items-center justify-center text-[#FBBF24] shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Decoupled Show Pricing & Inventory Law</h3>
            <p className="text-xs text-[#94A3B8]">
              In CineSphere OS, movies never own pricing. The Show is the central entity connecting the Hall Layout, Starting Price, and real-time Seat Inventory.
            </p>
          </div>
        </div>
        <Badge variant="outline" size="sm" className="border-emerald-500/40 text-emerald-400 shrink-0">
          Architectural Standard
        </Badge>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] p-3 rounded-2xl border border-[#2A3445]">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedHallFilter("All")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedHallFilter === "All"
                ? "bg-[#FBBF24] text-[#070B12] font-bold"
                : "bg-[#161F2E] text-[#94A3B8] border border-[#2A3445] hover:text-white"
            }`}
          >
            All Halls ({shows.length})
          </button>
          {halls.map((hall) => (
            <button
              key={hall.id}
              type="button"
              onClick={() => setSelectedHallFilter(hall.name)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedHallFilter === hall.name
                  ? "bg-[#FBBF24] text-[#070B12] font-bold"
                  : "bg-[#161F2E] text-[#94A3B8] border border-[#2A3445] hover:text-white"
              }`}
            >
              Screen 0{hall.hallNumber}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#64748B] font-mono">
          Showing {filteredShows.length} Scheduled Sessions
        </div>
      </div>

      {/* Shows Table */}
      <Card variant="elevated" className="overflow-hidden border-[#2A3445]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-4">Film Title</th>
                <th className="py-3.5 px-4">Auditorium & Capacity</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Language & Format</th>
                <th className="py-3.5 px-4">Starting Price</th>
                <th className="py-3.5 px-4">Fill Rate</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {filteredShows.map((show) => {
                const fillPercent = Math.round((show.seatsBooked / show.totalSeats) * 100);
                return (
                  <tr key={show.id} className="hover:bg-[#161F2E]/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-white text-sm block">{show.movieTitle}</span>
                      <span className="text-[10px] text-[#64748B] font-mono">ID: {show.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white block">{show.hallName}</span>
                      <span className="text-[10px] text-[#FBBF24] font-mono">{show.totalSeats} Total Seats</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-white block">{show.startTime} – {show.endTime}</span>
                      <span className="text-[10px] text-[#64748B]">{show.date}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white block">{show.language}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#111827] border border-[#2A3445] text-[#FBBF24] font-mono inline-block mt-0.5">
                        {show.format}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      ₹{show.ticketPrice}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{fillPercent}%</span>
                        <span className="text-[10px] text-[#64748B]">({show.seatsBooked}/{show.totalSeats})</span>
                      </div>
                      <div className="w-20 bg-[#111827] h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${Math.min(fillPercent, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          show.status === "Running"
                            ? "success"
                            : show.status === "Upcoming"
                            ? "primary"
                            : show.status === "Housefull"
                            ? "warning"
                            : "secondary"
                        }
                        size="sm"
                      >
                        {show.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {show.status !== "Cancelled" && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleCancelShow(show.id, show.movieTitle, show.startTime)}
                          className="border-[#2A3445] text-rose-400 hover:bg-rose-500/10 text-[11px]"
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Program New Show Modal */}
      {programModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#111827] border border-[#2A3445] p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#E50914]" />
                <h3 className="text-lg font-bold text-white">Program Showtime</h3>
              </div>
              <button onClick={() => setProgramModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleProgramSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-medium">Licensed Film</label>
                <select
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#E50914]"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.runtime})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-medium">Target Auditorium</label>
                <select
                  value={selectedHallId}
                  onChange={(e) => setSelectedHallId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#E50914]"
                >
                  {halls.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} — {h.screenType} ({h.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Show Date</label>
                  <input
                    type="text"
                    value={showDate}
                    onChange={(e) => setShowDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Starting Price (₹)</label>
                  <input
                    type="number"
                    min="100"
                    step="10"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="07:15 PM"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="10:15 PM"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Language Audio</label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Projection Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white"
                  >
                    <option value="IMAX">IMAX 3D</option>
                    <option value="Dolby Atmos">Dolby Atmos</option>
                    <option value="4DX">4DX Dynamic</option>
                    <option value="2D">Standard 2D</option>
                    <option value="3D">Standard 3D</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A3445]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setProgramModalOpen(false)}
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
                  Confirm & Dispatch
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
