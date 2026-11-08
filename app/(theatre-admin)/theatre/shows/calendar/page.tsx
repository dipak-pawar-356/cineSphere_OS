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
  const [selectedView, setSelectedView] = useState<"day" | "timeline" | "week">("timeline");
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
      const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      list.push({ iso, label, full: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) });
    }
    return list;
  }, []);

  const activeDate = dateList[currentDateIndex] || dateList[0];

  // Shows for active date
  const showsForDate = useMemo(() => {
    return shows.filter((s) => s.status !== "Cancelled" && s.status !== "Archived");
  }, [shows]);

  const timelineSlots = useMemo(() => {
    return buildCalendarTimelineSlots(showsForDate);
  }, [showsForDate]);

  // Turnaround hours from 08:00 to 01:00 (17 hours)
  const timelineHours = [8, 10, 12, 14, 16, 18, 20, 22, 24];

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
        subtitle={`${profile.name} • Visual Timeline Grid Across ${halls.length} Auditoriums`}
        description="Monitor turnaround times between screenings, cleaning windows, DCP playlist durations, and peak auditorium overlaps."
        badge="Visual Dispatch"
        badgeVariant="success"
        actions={
          <div className="flex items-center gap-3">
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
              <span className="px-3 text-xs font-semibold text-white min-w-32 text-center font-mono">
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

      {/* Date Switcher Tabs */}
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

      {/* Hall Timeline Grid */}
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
