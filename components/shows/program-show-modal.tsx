"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTheatreStore, ManagedShow } from "@/store/theatre-store";
import { Modal } from "@/components/dialogs/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Film,
  Building2,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  calculateScheduleWindow,
  detectScheduleConflict,
  minutesToTimeString,
  timeStringToMinutes,
} from "@/lib/engine/scheduling-engine";
import { PricingProfile } from "@/types/show-management.types";

interface ProgramShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingShow?: ManagedShow | null;
  initialDate?: string;
  initialHallId?: string;
  onSuccess?: (message: string) => void;
}

export function ProgramShowModal({
  isOpen,
  onClose,
  editingShow,
  initialDate,
  initialHallId,
  onSuccess,
}: ProgramShowModalProps) {
  const { movies, halls, shows, pricingProfiles, addShow, updateShow } = useTheatreStore();

  // Form Fields
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedHallId, setSelectedHallId] = useState("");
  const [showDate, setShowDate] = useState("");
  const [startTime, setStartTime] = useState("19:15");
  const [language, setLanguage] = useState("");
  const [format, setFormat] = useState("");
  const [pricingProfileId, setPricingProfileId] = useState("");
  const [intermissionMinutes, setIntermissionMinutes] = useState(15);
  const [cleaningBufferMinutes, setCleaningBufferMinutes] = useState(20);
  const [status, setStatus] = useState<ManagedShow["status"]>("Scheduled");
  const [bookingStatus, setBookingStatus] = useState<"Booking Open" | "Booking Closed" | "Sold Out" | "Cancelled">("Booking Open");

  // Selected Entities
  const selectedMovie = useMemo(
    () => movies.find((m) => m.id === selectedMovieId) || movies[0],
    [movies, selectedMovieId]
  );

  const selectedHall = useMemo(
    () => halls.find((h) => h.id === selectedHallId) || halls[0],
    [halls, selectedHallId]
  );

  const selectedProfile = useMemo(
    () =>
      pricingProfiles.find((p) => p.id === pricingProfileId) ||
      pricingProfiles[0],
    [pricingProfiles, pricingProfileId]
  );

  // Initialize form state
  useEffect(() => {
    if (!isOpen) return;

    if (editingShow) {
      setSelectedMovieId(editingShow.movieId);
      setSelectedHallId(editingShow.hallId);
      setShowDate(editingShow.date);
      setStartTime(editingShow.startTime);
      setLanguage(editingShow.language);
      setFormat(editingShow.format);
      setPricingProfileId(editingShow.pricingProfileId || pricingProfiles[0]?.id || "");
      setIntermissionMinutes(editingShow.intermissionMinutes ?? 15);
      setCleaningBufferMinutes(editingShow.cleaningBufferMinutes ?? 20);
      setStatus(editingShow.status);
      setBookingStatus(
        (editingShow.bookingStatus as any) || "Booking Open"
      );
    } else {
      const defaultMovie = movies[0];
      const defaultHall = initialHallId
        ? halls.find((h) => h.id === initialHallId) || halls[0]
        : halls[0];

      setSelectedMovieId(defaultMovie?.id || "");
      setSelectedHallId(defaultHall?.id || "");
      setShowDate(initialDate || new Date().toISOString().split("T")[0]);
      setStartTime("19:15");

      // Default language & format from movie
      if (defaultMovie) {
        setLanguage(defaultMovie.language || "Hindi");
        setFormat((defaultMovie.formats && defaultMovie.formats[0]) || "IMAX");
      }
      setPricingProfileId(pricingProfiles[0]?.id || "");
      setIntermissionMinutes(15);
      setCleaningBufferMinutes(20);
      setStatus("Scheduled");
      setBookingStatus("Booking Open");
    }
  }, [isOpen, editingShow, initialDate, initialHallId, movies, halls, pricingProfiles]);

  // When selected movie changes, default language & format if empty or incompatible
  useEffect(() => {
    if (!selectedMovie) return;
    if (!language) setLanguage(selectedMovie.language || "Hindi");
    if (!format) setFormat((selectedMovie.formats && selectedMovie.formats[0]) || "IMAX");
  }, [selectedMovie, language, format]);

  // Turnaround and Schedule Window Calculation
  const movieDuration = useMemo(() => {
    if (!selectedMovie) return 150;
    // Parse runtime e.g. "2h 46m" or number
    if (typeof selectedMovie.runtime === "string") {
      const matchHours = selectedMovie.runtime.match(/(\d+)\s*h/);
      const matchMins = selectedMovie.runtime.match(/(\d+)\s*m/);
      const h = matchHours ? parseInt(matchHours[1], 10) : 0;
      const m = matchMins ? parseInt(matchMins[1], 10) : 0;
      const total = h * 60 + m;
      return total > 0 ? total : 150;
    }
    return 150;
  }, [selectedMovie]);

  const scheduleWindow = useMemo(() => {
    return calculateScheduleWindow(
      startTime,
      movieDuration,
      intermissionMinutes,
      cleaningBufferMinutes
    );
  }, [startTime, movieDuration, intermissionMinutes, cleaningBufferMinutes]);

  // Real-Time Conflict Detection
  const conflictResult = useMemo(() => {
    if (!selectedHallId || !showDate || !startTime) {
      return { hasConflict: false, conflictType: "NONE" as const, message: "" };
    }

    return detectScheduleConflict(
      {
        id: editingShow?.id,
        hallId: selectedHallId,
        date: showDate,
        startTime,
        durationMinutes: movieDuration,
        intermissionMinutes,
        cleaningBufferMinutes,
      },
      shows
    );
  }, [
    editingShow?.id,
    selectedHallId,
    showDate,
    startTime,
    movieDuration,
    intermissionMinutes,
    cleaningBufferMinutes,
    shows,
  ]);

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (conflictResult.hasConflict) {
      alert(`Cannot schedule: ${conflictResult.message}`);
      return;
    }

    if (!selectedMovie || !selectedHall || !selectedProfile) {
      alert("Please ensure Movie, Hall, and Pricing Profile are properly selected.");
      return;
    }

    const payload = {
      movieId: selectedMovie.id,
      movieTitle: selectedMovie.title,
      moviePosterUrl: selectedMovie.poster,
      movieBannerUrl: selectedMovie.backdrop,
      movieDurationMinutes: movieDuration,
      movieCertificate: selectedMovie.rating || "UA",
      theatreId: "th-pun-001",
      theatreName: "CineSphere Grand Cinemas",
      hallId: selectedHall.id,
      hallName: selectedHall.name,
      hallCode: selectedHall.hallCode,
      screenType: selectedHall.screenType,
      date: showDate,
      startTime: scheduleWindow.startTimeFormatted,
      endTime: scheduleWindow.endTimeFormatted,
      durationMinutes: movieDuration,
      intermissionMinutes,
      cleaningBufferMinutes,
      totalOccupiedMinutes: scheduleWindow.totalOccupiedMinutes,
      language,
      format,
      pricingProfileId: selectedProfile.id,
      pricingProfileName: selectedProfile.name,
      sectionPricing: selectedProfile.tierPricing,
      ticketPrice: selectedProfile.tierPricing["Silver"] || 250,
      totalSeats: selectedHall.capacity,
      status,
      bookingStatus,
      salesStatus: status === "Cancelled" ? ("Off Sale" as const) : ("On Sale" as const),
    };

    if (editingShow) {
      const res = updateShow(editingShow.id, payload);
      if (res.success) {
        onSuccess?.(`Updated showtime schedule for "${selectedMovie.title}".`);
        onClose();
      } else {
        alert(res.error || "Failed to update showtime.");
      }
    } else {
      const res = addShow(payload);
      if (res.success) {
        onSuccess?.(
          `Successfully scheduled "${selectedMovie.title}" in ${selectedHall.name} at ${scheduleWindow.startTimeFormatted}.`
        );
        onClose();
      } else {
        alert(res.error || "Failed to program showtime.");
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingShow ? "Modify Showtime Screening Event" : "Program Complete Screening Event"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Input Controls */}
          <div className="lg:col-span-2 space-y-4 text-xs">
            {/* Conflict Detection Banner */}
            {conflictResult.hasConflict ? (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs">Scheduling Collision Detected</h4>
                    <p className="text-[11px] leading-relaxed text-rose-200/90 mt-0.5">
                      {conflictResult.message}
                    </p>
                  </div>
                </div>

                {conflictResult.suggestedStartTime && (
                  <div className="pt-2 border-t border-rose-500/30 flex items-center justify-between text-[11px]">
                    <span className="text-white/80">Earliest Safe Turnaround:</span>
                    <button
                      type="button"
                      onClick={() => setStartTime(conflictResult.suggestedStartTime!)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/30 hover:bg-rose-500/50 text-white font-mono font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>Apply {conflictResult.suggestedStartTime}</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-[11px]">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Auditorium slot is clear. No hall scheduling conflicts or turnaround overlaps.</span>
              </div>
            )}

            {/* Movie Selection */}
            <div className="space-y-1.5">
              <label className="font-bold text-white uppercase tracking-wider text-[10px] text-[#94A3B8] flex items-center gap-1">
                <Film className="h-3.5 w-3.5 text-amber-400" /> Canonical Master Film
              </label>
              <select
                value={selectedMovieId}
                onChange={(e) => setSelectedMovieId(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-[#0B0F19] border border-[#2A3445] text-white text-xs font-medium focus:border-amber-400 focus:outline-none"
              >
                {movies.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.runtime || "150m"} • {m.rating || "UA"})
                  </option>
                ))}
              </select>
            </div>

            {/* Hall Selection & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-white uppercase tracking-wider text-[10px] text-[#94A3B8] flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-sky-400" /> Target Auditorium
                </label>
                <select
                  value={selectedHallId}
                  onChange={(e) => setSelectedHallId(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[#0B0F19] border border-[#2A3445] text-white text-xs font-medium focus:border-sky-400 focus:outline-none"
                >
                  {halls.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.screenType} • {h.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-white uppercase tracking-wider text-[10px] text-[#94A3B8] flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" /> Screening Date
                </label>
                <Input
                  type="date"
                  value={showDate}
                  onChange={(e) => setShowDate(e.target.value)}
                  className="h-9 bg-[#0B0F19] border-[#2A3445] text-white text-xs font-mono"
                  required
                />
              </div>
            </div>

            {/* Start Time, Intermission & Cleaning Buffer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-white uppercase tracking-wider text-[10px] text-[#94A3B8] flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-amber-400" /> Showtime Start
                </label>
                <Input
                  type="text"
                  placeholder="19:15 or 07:15 PM"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-9 bg-[#0B0F19] border-[#2A3445] text-white text-xs font-mono font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-white uppercase tracking-wider text-[10px] text-[#94A3B8]">
                  Intermission (mins)
                </label>
                <select
                  value={intermissionMinutes}
                  onChange={(e) => setIntermissionMinutes(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-xl bg-[#0B0F19] border border-[#2A3445] text-white text-xs font-mono"
                >
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes (Standard)</option>
                  <option value={20}>20 minutes (Extended)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-white uppercase tracking-wider text-[10px] text-[#94A3B8]">
                  Cleaning Buffer (mins)
                </label>
                <select
                  value={cleaningBufferMinutes}
                  onChange={(e) => setCleaningBufferMinutes(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-xl bg-[#0B0F19] border border-[#2A3445] text-white text-xs font-mono"
                >
                  <option value={15}>15 minutes (Quick)</option>
                  <option value={20}>20 minutes (Standard)</option>
                  <option value={30}>30 minutes (Deep Clean)</option>
                </select>
              </div>
            </div>

            {/* Language & Format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-white uppercase tracking-wider text-[10px] text-[#94A3B8]">
                  Audio Language Track
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Hindi (Dolby Atmos) or English"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="h-9 bg-[#0B0F19] border-[#2A3445] text-white text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-white uppercase tracking-wider text-[10px] text-[#94A3B8]">
                  Screening Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[#0B0F19] border border-[#2A3445] text-white text-xs font-mono"
                >
                  <option value="IMAX">IMAX Laser</option>
                  <option value="IMAX 3D">IMAX 3D</option>
                  <option value="4DX">4DX Dynamic</option>
                  <option value="Dolby Cinema">Dolby Cinema</option>
                  <option value="2D">Standard 2D</option>
                  <option value="3D">Standard 3D</option>
                </select>
              </div>
            </div>

            {/* Reusable Pricing Profile Subsystem */}
            <div className="space-y-1.5 pt-1 border-t border-[#1E293B]">
              <label className="font-bold text-white uppercase tracking-wider text-[10px] text-[#94A3B8] flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Reusable Pricing Profile
              </label>
              <select
                value={pricingProfileId}
                onChange={(e) => setPricingProfileId(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-[#0B0F19] border border-[#2A3445] text-amber-400 text-xs font-bold focus:border-amber-400 focus:outline-none"
              >
                {pricingProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.dayType} • {p.slotType})
                  </option>
                ))}
              </select>

              {/* Profile Tier Rates Preview */}
              {selectedProfile && (
                <div className="p-3 rounded-xl bg-[#070B12] border border-[#1E293B] space-y-1.5 mt-2">
                  <div className="text-[10px] uppercase font-mono text-[#64748B] flex justify-between">
                    <span>Active Section Pricing</span>
                    <span>+₹{selectedProfile.convenienceFee} fee • {selectedProfile.gstPercent}% GST</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {Object.entries(selectedProfile.tierPricing).map(([tier, rate]) => (
                      <div
                        key={tier}
                        className="px-2.5 py-1 rounded-lg bg-[#0F172A] border border-[#2A3445] flex items-center gap-1.5 font-mono"
                      >
                        <span className="text-[#94A3B8]">{tier}:</span>
                        <span className="font-bold text-emerald-400">₹{rate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status & Booking Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="font-bold text-white uppercase tracking-wider text-[10px] text-[#94A3B8]">
                  Lifecycle Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-xl bg-[#0B0F19] border border-[#2A3445] text-white text-xs font-medium"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Draft">Draft</option>
                  <option value="Now Showing">Now Showing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-white uppercase tracking-wider text-[10px] text-[#94A3B8]">
                  Sales & Booking State
                </label>
                <select
                  value={bookingStatus}
                  onChange={(e) => setBookingStatus(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-xl bg-[#0B0F19] border border-[#2A3445] text-white text-xs font-medium"
                >
                  <option value="Booking Open">Booking Open (Live)</option>
                  <option value="Booking Closed">Booking Closed</option>
                  <option value="Sold Out">Sold Out</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Live Event Summary Preview */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#070B12] border border-[#1E293B] space-y-4 shadow-xl">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] font-mono flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Complete Screening Event
              </h4>

              {/* Poster & Title Header */}
              <div className="flex gap-3">
                <div className="h-28 w-20 rounded-xl overflow-hidden bg-[#111827] border border-[#2A3445] shrink-0">
                  <img
                    src={selectedMovie?.poster}
                    alt={selectedMovie?.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <Badge variant="primary" size="sm" className="font-mono text-[10px]">
                    {format}
                  </Badge>
                  <h3 className="font-bold text-white text-sm truncate">{selectedMovie?.title}</h3>
                  <div className="text-[11px] text-[#94A3B8]">{language}</div>
                  <div className="text-[10px] font-mono text-amber-400">
                    Cert: {selectedMovie?.rating || "UA"} • {movieDuration}m runtime
                  </div>
                </div>
              </div>

              {/* Schedule Turnaround Meter */}
              <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-2 text-xs font-mono">
                <div className="text-[10px] uppercase text-[#64748B]">Schedule Turnaround</div>
                <div className="flex justify-between items-center text-white">
                  <span>Start:</span>
                  <span className="font-bold text-amber-400">{scheduleWindow.startTimeFormatted}</span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span>End (+{intermissionMinutes}m int):</span>
                  <span className="font-bold text-sky-400">{scheduleWindow.endTimeFormatted}</span>
                </div>
                <div className="flex justify-between items-center text-[#94A3B8] text-[11px] pt-1 border-t border-[#1E293B]">
                  <span>Cleaning Turnaround:</span>
                  <span>Until {scheduleWindow.cleaningEndFormatted}</span>
                </div>
                <div className="text-[10px] text-[#64748B] text-right">
                  Total Blocked: {scheduleWindow.totalOccupiedMinutes} mins
                </div>
              </div>

              {/* Auditorium & Capacity */}
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Auditorium:</span>
                  <span className="text-white font-medium">{selectedHall?.name}</span>
                </div>
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Screen Tech:</span>
                  <span className="text-white">{selectedHall?.screenType}</span>
                </div>
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Auditorium Capacity:</span>
                  <span className="text-emerald-400 font-bold">{selectedHall?.capacity} Seats</span>
                </div>
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Starting Base Rate:</span>
                  <span className="text-amber-400 font-bold">
                    ₹{selectedProfile?.tierPricing["Silver"] || 250}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E293B]">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="border-[#2A3445]">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={conflictResult.hasConflict}
            className="gap-2 font-bold shadow-lg shadow-amber-400/20"
          >
            {editingShow ? "Save Schedule Changes" : "Confirm & Dispatch Screening Event"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
