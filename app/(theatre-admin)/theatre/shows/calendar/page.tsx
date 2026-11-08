"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useTheatreStore, ManagedShow } from "@/store/theatre-store";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  ArrowLeft,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  AlertTriangle,
  Film,
  Building2,
  CheckCircle2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import { ProgramShowModal } from "@/components/shows/program-show-modal";
import { ShowDetailModal } from "@/components/shows/show-detail-modal";
import {
  buildCalendarTimelineSlots,
  calculateScheduleWindow,
} from "@/lib/engine/scheduling-engine";

export default function TheatreShowsCalendarPage() {
  const { profile, halls, shows, cancelShow, duplicateShow } = useTheatreStore();

  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [selectedView, setSelectedView] = useState<"timeline" | "day" | "week" | "month">("timeline");
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<ManagedShow | null>(null);
  const [inspectingShow, setInspectingShow] = useState<ManagedShow | null>(null);
  const [targetHallId, setTargetHallId] = useState<string | undefined>(undefined);

  // Generate 7-day date list
  const dateList = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      const label =
        i === 0
          ? "Today"
          : i === 1
          ? "Tomorrow"
          : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      list.push({
        iso,
        label,
        full: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
      });
    }
    return list;
  }, []);

  const activeDate = dateList[currentDateIndex] || dateList[0];

  // Active Shows
  const activeShows = useMemo(() => {
    return shows.filter((s) => s.status !== "Cancelled" && s.status !== "Archived");
  }, [shows]);

  // Aggregate Metrics for Calendar
  const totalScreeningsToday = activeShows.length;
  const totalHallSeats = halls.reduce((sum, h) => sum + h.capacity, 0);
  const bookedSeatsToday = activeShows.reduce((sum, s) => sum + s.seatsBooked, 0);
  const averageOccupancy =
    totalHallSeats > 0 ? Math.round((bookedSeatsToday / (totalHallSeats * (activeShows.length || 1))) * 100) : 0;

  // Day View Slots: Morning, Matinee, Evening, Night
  const daySlotGroups = useMemo(() => {
    return [
      {
        id: "morning",
        name: "Morning Slot",
        timeRange: "09:00 AM – 01:00 PM",
        shows: activeShows.filter((s) => s.startTime.includes("09:") || s.startTime.includes("10:") || s.startTime.includes("11:")),
      },
      {
        id: "matinee",
        name: "Matinee Slot",
        timeRange: "01:00 PM – 05:00 PM",
        shows: activeShows.filter((s) => s.startTime.includes("01:") || s.startTime.includes("02:") || s.startTime.includes("03:") || s.startTime.includes("13:") || s.startTime.includes("14:") || s.startTime.includes("15:")),
      },
      {
        id: "evening",
        name: "Prime Evening Slot",
        timeRange: "05:00 PM – 09:00 PM",
        shows: activeShows.filter((s) => s.startTime.includes("06:") || s.startTime.includes("07:") || s.startTime.includes("08:") || s.startTime.includes("18:") || s.startTime.includes("19:") || s.startTime.includes("20:")),
      },
      {
        id: "night",
        name: "Late Night Slot",
        timeRange: "09:00 PM – 01:30 AM",
        shows: activeShows.filter((s) => s.startTime.includes("09:") || s.startTime.includes("10:") || s.startTime.includes("11:") || s.startTime.includes("21:") || s.startTime.includes("22:") || s.startTime.includes("23:")),
      },
    ];
  }, [activeShows]);

  const handleOpenProgram = (hallId?: string) => {
    setTargetHallId(hallId);
    setEditingShow(null);
    setProgramModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link href={ROUTES.THEATRE_ADMIN.SHOWS}>
          <Button variant="ghost" size="xs" className="gap-1 text-xs text-[#94A3B8]">
            <ArrowLeft className="h-3 w-3" /> Back to Showtime Roster
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Multi-Screen Showtime Dispatch Matrix"
        subtitle={`${profile.name} • Visual Scheduling Calendar Across ${halls.length} Auditoriums`}
        description="Monitor turnaround times between screenings, cleaning windows, DCP playlist durations, and peak auditorium overlaps."
        badge="Visual Dispatch"
        badgeVariant="success"
        actions={
          <div className="flex items-center gap-3">
            {/* View Mode Switcher Pills */}
            <div className="flex items-center bg-[#111827] border border-[#2A3445] rounded-xl p-1 text-xs font-medium">
              {(["timeline", "day", "week", "month"] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setSelectedView(view)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    selectedView === view
                      ? "bg-[#1E293B] text-amber-400 font-bold"
                      : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  {view} View
                </button>
              ))}
            </div>

            {/* Date Navigator */}
            <div className="flex items-center bg-[#111827] border border-[#2A3445] rounded-xl p-0.5">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setCurrentDateIndex((i) => Math.max(0, i - 1))}
                disabled={currentDateIndex === 0}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 text-xs font-semibold text-white min-w-28 text-center font-mono">
                {activeDate.label}
              </span>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setCurrentDateIndex((i) => Math.min(dateList.length - 1, i + 1))}
                disabled={currentDateIndex === dateList.length - 1}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenProgram()}
              className="gap-1.5 font-bold shadow-lg shadow-amber-400/20"
            >
              <Plus className="h-4 w-4" /> Program Showtime
            </Button>
          </div>
        }
      />

      {/* Calendar Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Dispatch Date", val: activeDate.label, sub: activeDate.full, color: "text-amber-400" },
          { label: "Scheduled Screenings", val: `${activeShows.length} Shows`, sub: "Across All Screens", color: "text-emerald-400" },
          { label: "Auditorium Turnaround", val: "100% On-Time", sub: "Turnaround Buffers Clear", color: "text-sky-400" },
          { label: "Available Slots", val: "14 Open Slots", sub: "Ready for Ingestion", color: "text-purple-400" },
        ].map((m, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#64748B] font-mono">{m.label}</div>
            <div className="text-lg font-extrabold font-mono text-white truncate">{m.val}</div>
            <div className={`text-[11px] ${m.color} font-medium truncate`}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* 7-Day Date Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {dateList.map((d, idx) => (
          <button
            key={d.iso}
            type="button"
            onClick={() => setCurrentDateIndex(idx)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 font-mono ${
              currentDateIndex === idx
                ? "bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20"
                : "bg-[#0F172A] border border-[#1E293B] text-[#94A3B8] hover:text-white"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. TIMELINE VIEW */}
      {/* ------------------------------------------------------------- */}
      {selectedView === "timeline" && (
        <div className="space-y-5">
          {halls.map((hall) => {
            const hallShows = shows.filter((s) => s.hallId === hall.id && s.status !== "Cancelled");

            return (
              <Card
                key={hall.id}
                variant="elevated"
                className="p-5 bg-[#0F172A] border-[#1E293B] space-y-4 shadow-xl"
              >
                {/* Hall Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
                  <div className="flex items-center gap-3">
                    <Badge variant="primary" size="sm" className="font-mono text-xs">
                      Screen 0{hall.hallNumber}
                    </Badge>
                    <div>
                      <h3 className="font-bold text-white text-sm">{hall.name}</h3>
                      <span className="text-[11px] text-amber-400 font-medium">{hall.screenType}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-[#94A3B8]">{hall.capacity} Seats</span>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleOpenProgram(hall.id)}
                      className="gap-1 border-[#2A3445] text-amber-400 text-[11px]"
                    >
                      <Plus className="h-3 w-3" /> Add Slot
                    </Button>
                  </div>
                </div>

                {/* Show Slots Cards in this Hall */}
                {hallShows.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#0B0F19] border border-dashed border-[#1E293B] text-center text-xs text-[#94A3B8]">
                    <p>No screenings programmed in {hall.name} for {activeDate.label}.</p>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleOpenProgram(hall.id)}
                      className="mt-2 text-amber-400 text-xs"
                    >
                      + Schedule first showtime
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                    {hallShows.map((show) => {
                      const fillRate =
                        show.totalSeats > 0 ? Math.round((show.seatsBooked / show.totalSeats) * 100) : 0;

                      return (
                        <div
                          key={show.id}
                          onClick={() => setInspectingShow(show)}
                          className="group p-3.5 rounded-2xl bg-[#0B0F19] border border-[#1E293B] space-y-2.5 hover:border-amber-400/50 hover:bg-[#111827] transition-all cursor-pointer shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-amber-400">
                              {show.startTime}
                            </span>
                            <Badge
                              variant={show.status === "Running" ? "success" : "outline"}
                              size="sm"
                              className="text-[10px]"
                            >
                              {show.status}
                            </Badge>
                          </div>

                          <div>
                            <h4 className="font-bold text-white text-xs truncate group-hover:text-amber-400 transition-colors">
                              {show.movieTitle}
                            </h4>
                            <div className="text-[10px] text-[#64748B] font-mono mt-0.5">
                              {show.language} • {show.format}
                            </div>
                          </div>

                          <div className="space-y-1 pt-1.5 border-t border-[#1E293B] text-[10px] font-mono">
                            <div className="flex justify-between items-center text-[#94A3B8]">
                              <span>Occupancy:</span>
                              <span className="text-emerald-400 font-bold">
                                {show.seatsBooked}/{show.totalSeats} ({fillRate}%)
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[#64748B]">
                              <span>Turnaround:</span>
                              <span>Until {show.endTime}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. DAY VIEW (Hourly Slot Sections) */}
      {/* ------------------------------------------------------------- */}
      {selectedView === "day" && (
        <div className="space-y-5">
          {daySlotGroups.map((group) => (
            <Card key={group.id} variant="elevated" className="p-5 bg-[#0F172A] border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">{group.name}</h3>
                  <span className="text-xs font-mono text-[#64748B]">({group.timeRange})</span>
                </div>
                <Badge variant="outline" size="sm" className="font-mono text-xs">
                  {group.shows.length} Scheduled
                </Badge>
              </div>

              {group.shows.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#0B0F19] text-xs text-[#64748B] flex items-center justify-between">
                  <span>Auditoriums are open and unbooked for this time slot.</span>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleOpenProgram()}
                    className="text-amber-400 text-xs"
                  >
                    + Program Slot
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.shows.map((show) => (
                    <div
                      key={show.id}
                      onClick={() => setInspectingShow(show)}
                      className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-2 hover:border-amber-400/40 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono font-bold text-amber-400">{show.startTime} – {show.endTime}</span>
                        <Badge variant="primary" size="sm" className="text-[10px]">{show.format}</Badge>
                      </div>
                      <h4 className="font-bold text-white text-xs truncate">{show.movieTitle}</h4>
                      <div className="flex justify-between text-[11px] text-[#94A3B8]">
                        <span>{show.hallName}</span>
                        <span className="font-mono text-emerald-400">₹{show.ticketPrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. WEEK VIEW (7-Day Overview) */}
      {/* ------------------------------------------------------------- */}
      {selectedView === "week" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {dateList.map((day, idx) => {
            const dayShows = shows.filter((s) => s.status !== "Cancelled");
            return (
              <Card
                key={day.iso}
                variant="elevated"
                className={`p-4 bg-[#0F172A] border-[#1E293B] space-y-3 ${
                  currentDateIndex === idx ? "border-amber-400/50 bg-[#111827]" : ""
                }`}
              >
                <div className="text-center pb-2 border-b border-[#1E293B]">
                  <span className="text-[11px] font-mono text-[#64748B] uppercase block">{day.label}</span>
                  <span className="font-bold text-white text-sm">{day.iso.slice(5)}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-[#0B0F19] text-center font-mono">
                    <span className="text-[10px] text-[#64748B] block">PROGRAMMED</span>
                    <span className="font-bold text-amber-400 text-sm">{dayShows.length} Shows</span>
                  </div>

                  <div className="space-y-1">
                    {dayShows.slice(0, 3).map((s) => (
                      <div
                        key={s.id}
                        onClick={() => setInspectingShow(s)}
                        className="p-1.5 rounded-lg bg-[#070B12] text-[10px] truncate hover:text-amber-400 cursor-pointer"
                      >
                        <span className="font-bold font-mono text-amber-400 mr-1">{s.startTime.slice(0, 5)}</span>
                        <span className="text-white">{s.movieTitle}</span>
                      </div>
                    ))}
                  </div>

                  {dayShows.length > 3 && (
                    <div className="text-[10px] text-center text-[#64748B]">
                      +{dayShows.length - 3} more
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. MONTH VIEW (Monthly Overview) */}
      {/* ------------------------------------------------------------- */}
      {selectedView === "month" && (
        <Card variant="elevated" className="p-6 bg-[#0F172A] border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-amber-400" />
              Monthly Screening Allocation Matrix (November 2026)
            </h3>
            <span className="text-xs font-mono text-emerald-400">100% Turnaround Efficiency</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
              <div key={dayName} className="font-bold text-[11px] font-mono text-[#64748B] py-1">
                {dayName}
              </div>
            ))}

            {Array.from({ length: 30 }).map((_, i) => {
              const dayNum = i + 1;
              const hasShows = dayNum >= 1 && dayNum <= 15;
              return (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-left space-y-1 min-h-20 ${
                    dayNum === 8
                      ? "bg-amber-400/10 border-amber-400/50"
                      : "bg-[#0B0F19] border-[#1E293B]"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-mono font-bold ${dayNum === 8 ? "text-amber-400" : "text-white"}`}>
                      {dayNum}
                    </span>
                    {hasShows && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )}
                  </div>
                  {hasShows && (
                    <div className="text-[10px] text-[#94A3B8] font-mono">
                      <span>{shows.length} shows</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Program Modal */}
      <ProgramShowModal
        isOpen={programModalOpen}
        onClose={() => setProgramModalOpen(false)}
        editingShow={editingShow}
        initialDate={activeDate.iso}
        initialHallId={targetHallId}
      />

      {/* Detail Inspection Modal */}
      <ShowDetailModal
        isOpen={!!inspectingShow}
        onClose={() => setInspectingShow(null)}
        show={inspectingShow}
        onEdit={(sh) => {
          setInspectingShow(null);
          setEditingShow(sh);
          setProgramModalOpen(true);
        }}
        onCancel={(id, title) => cancelShow(id, "Cancelled by Theatre Admin")}
        onDuplicate={(sh) => duplicateShow(sh.id)}
      />
    </div>
  );
}
