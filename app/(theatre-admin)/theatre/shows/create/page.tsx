"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheatreStore, ManagedShow } from "@/store/theatre-store";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  Film,
  Building2,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import {
  calculateScheduleWindow,
  detectScheduleConflict,
  minutesToTimeString,
  timeStringToMinutes,
} from "@/lib/engine/scheduling-engine";

export default function CreateTheatreShowPage() {
  const router = useRouter();
  const { profile, movies, halls, shows, pricingProfiles, addShow } = useTheatreStore();

  const [selectedMovieId, setSelectedMovieId] = useState(movies[0]?.id || "");
  const [selectedHallId, setSelectedHallId] = useState(halls[0]?.id || "");
  const [showDate, setShowDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("19:15");
  const [language, setLanguage] = useState("");
  const [format, setFormat] = useState("IMAX");
  const [pricingProfileId, setPricingProfileId] = useState(pricingProfiles[0]?.id || "");
  const [intermissionMinutes, setIntermissionMinutes] = useState(15);
  const [cleaningBufferMinutes, setCleaningBufferMinutes] = useState(20);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

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

  useEffect(() => {
    if (selectedMovie) {
      if (!language) setLanguage(selectedMovie.language || "Hindi");
      if (selectedMovie.formats && selectedMovie.formats.length > 0) {
        setFormat(selectedMovie.formats[0]);
      }
    }
  }, [selectedMovie]);

  const movieDuration = useMemo(() => {
    if (!selectedMovie) return 150;
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

  const conflictResult = useMemo(() => {
    if (!selectedHallId || !showDate || !startTime) {
      return { hasConflict: false, conflictType: "NONE" as const, message: "" };
    }

    return detectScheduleConflict(
      {
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
    selectedHallId,
    showDate,
    startTime,
    movieDuration,
    intermissionMinutes,
    cleaningBufferMinutes,
    shows,
  ]);

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
      theatreName: profile.name,
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
      language: language || "Hindi",
      format: format || "IMAX",
      pricingProfileId: selectedProfile.id,
      pricingProfileName: selectedProfile.name,
      sectionPricing: selectedProfile.tierPricing,
      ticketPrice: selectedProfile.tierPricing["Silver"] || 250,
      totalSeats: selectedHall.capacity,
      status: "Scheduled" as const,
      bookingStatus: "Booking Open" as const,
      salesStatus: "On Sale" as const,
    };

    const res = addShow(payload);
    if (res.success) {
      setFeedbackNotice(
        `Scheduled "${selectedMovie.title}" in ${selectedHall.name} at ${scheduleWindow.startTimeFormatted}.`
      );
      setTimeout(() => {
        router.push(ROUTES.THEATRE_ADMIN.SHOWS);
      }, 1000);
    } else {
      alert(res.error || "Failed to schedule showtime.");
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link href={ROUTES.THEATRE_ADMIN.SHOWS}>
          <Button variant="ghost" size="xs" className="gap-1.5 text-xs text-[#94A3B8]">
            <ArrowLeft className="h-3 w-3" /> Back to Showtime Roster
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Program Complete Screening Event"
        subtitle={`${profile.name} • Dynamic Multi-Screen Dispatch Engine`}
        description="Schedule feature films into auditoriums with automatic conflict prevention, turnaround calculation, reusable pricing profile mapping, and show-specific seat inventory preparation."
        badge="Screening Dispatch"
        badgeVariant="primary"
      />

      {feedbackNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{feedbackNotice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Form Controls */}
          <div className="lg:col-span-2 space-y-6">
            <Card variant="elevated" className="p-6 bg-[#0F172A] border-[#1E293B] space-y-4">
              {/* Conflict Detection Banner */}
              {conflictResult.hasConflict ? (
                <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 space-y-2 text-xs">
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
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Auditorium slot is clear. No hall scheduling conflicts or turnaround overlaps detected.</span>
                </div>
              )}

              {/* Movie Selection */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-white uppercase tracking-wider text-[10px] text-[#94A3B8] flex items-center gap-1">
                  <Film className="h-3.5 w-3.5 text-amber-400" /> Canonical Master Film
                </label>
                <select
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F19] border border-[#2A3445] text-white text-xs font-medium focus:border-amber-400 focus:outline-none"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.runtime || "150m"} • {m.rating || "UA"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Hall & Date Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-white uppercase tracking-wider text-[10px] text-[#94A3B8] flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-sky-400" /> Target Auditorium
                  </label>
                  <select
                    value={selectedHallId}
                    onChange={(e) => setSelectedHallId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F19] border border-[#2A3445] text-white text-xs font-medium focus:border-sky-400 focus:outline-none"
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
                    className="h-10 bg-[#0B0F19] border-[#2A3445] text-white text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* Timing & Buffer Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-white uppercase tracking-wider text-[10px] text-[#94A3B8] flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-amber-400" /> Showtime Start
                  </label>
                  <Input
                    type="text"
                    placeholder="19:15 or 07:15 PM"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-10 bg-[#0B0F19] border-[#2A3445] text-white text-xs font-mono font-bold"
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
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F19] border border-[#2A3445] text-white text-xs font-mono"
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
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F19] border border-[#2A3445] text-white text-xs font-mono"
                  >
                    <option value={15}>15 minutes (Quick)</option>
                    <option value={20}>20 minutes (Standard)</option>
                    <option value={30}>30 minutes (Deep Clean)</option>
                  </select>
                </div>
              </div>

              {/* Language & Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-white uppercase tracking-wider text-[10px] text-[#94A3B8]">
                    Audio Language Track
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Hindi (Dolby Atmos)"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="h-10 bg-[#0B0F19] border-[#2A3445] text-white text-xs"
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
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F19] border border-[#2A3445] text-white text-xs font-mono"
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

              {/* Reusable Pricing Profile */}
              <div className="space-y-2 pt-2 border-t border-[#1E293B] text-xs">
                <label className="font-bold text-white uppercase tracking-wider text-[10px] text-[#94A3B8] flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Reusable Pricing Profile
                </label>
                <select
                  value={pricingProfileId}
                  onChange={(e) => setPricingProfileId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F19] border border-[#2A3445] text-amber-400 text-xs font-bold focus:border-amber-400 focus:outline-none"
                >
                  {pricingProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.dayType} • {p.slotType})
                    </option>
                  ))}
                </select>

                {selectedProfile && (
                  <div className="p-3.5 rounded-xl bg-[#070B12] border border-[#1E293B] space-y-2">
                    <div className="text-[10px] uppercase font-mono text-[#64748B] flex justify-between">
                      <span>Active Section Rates</span>
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
            </Card>

            <div className="flex items-center justify-end gap-3">
              <Link href={ROUTES.THEATRE_ADMIN.SHOWS}>
                <Button variant="outline" size="sm" className="border-[#2A3445] text-white">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={conflictResult.hasConflict}
                className="gap-2 font-bold shadow-lg shadow-amber-400/20"
              >
                Confirm & Dispatch Screening Event
              </Button>
            </div>
          </div>

          {/* Right Column: Live Event Summary */}
          <div className="space-y-6">
            <Card variant="elevated" className="p-6 bg-[#070B12] border-[#1E293B] space-y-5 shadow-xl">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] font-mono flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Screening Event Live Card
              </h4>

              <div className="flex gap-3.5">
                <div className="h-32 w-24 rounded-xl overflow-hidden bg-[#111827] border border-[#2A3445] shrink-0">
                  <img
                    src={selectedMovie?.poster}
                    alt={selectedMovie?.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <Badge variant="primary" size="sm" className="font-mono text-[10px]">
                    {format}
                  </Badge>
                  <h3 className="font-bold text-white text-base truncate">{selectedMovie?.title}</h3>
                  <div className="text-xs text-[#94A3B8]">{language}</div>
                  <div className="text-[10px] font-mono text-amber-400">
                    Cert: {selectedMovie?.rating || "UA"} • {movieDuration}m runtime
                  </div>
                </div>
              </div>

              {/* Turnaround Meter */}
              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-2 text-xs font-mono">
                <div className="text-[10px] uppercase text-[#64748B]">Auditorium Turnaround</div>
                <div className="flex justify-between items-center text-white">
                  <span>Start:</span>
                  <span className="font-bold text-amber-400">{scheduleWindow.startTimeFormatted}</span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span>End (+{intermissionMinutes}m int):</span>
                  <span className="font-bold text-sky-400">{scheduleWindow.endTimeFormatted}</span>
                </div>
                <div className="flex justify-between items-center text-[#94A3B8] text-[11px] pt-1.5 border-t border-[#1E293B]">
                  <span>Cleaning Buffer:</span>
                  <span>Until {scheduleWindow.cleaningEndFormatted}</span>
                </div>
                <div className="text-[10px] text-[#64748B] text-right">
                  Total Occupied: {scheduleWindow.totalOccupiedMinutes} mins
                </div>
              </div>

              {/* Specs */}
              <div className="space-y-2 text-xs font-mono pt-1">
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Auditorium:</span>
                  <span className="text-white font-medium">{selectedHall?.name}</span>
                </div>
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Auditorium Capacity:</span>
                  <span className="text-emerald-400 font-bold">{selectedHall?.capacity} Seats</span>
                </div>
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Starting Ticket Rate:</span>
                  <span className="text-amber-400 font-bold">
                    ₹{selectedProfile?.tierPricing["Silver"] || 250}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

