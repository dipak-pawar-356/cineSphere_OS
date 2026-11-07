import React from "react";
import Link from "next/link";
import { THEATRE_HALLS, THEATRE_SHOWS } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, ArrowLeft, Plus, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Auditorium Showtimes Calendar | CineSphere OS",
};

export default function TheatreShowsCalendarPage() {
  const timeSlots = ["Morning (09:00 - 13:00)", "Matinee (13:00 - 17:00)", "Evening (17:00 - 21:00)", "Night (21:00 - 01:30)"];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-2">
        <Link href={ROUTES.THEATRE_ADMIN.SHOWS}>
          <Button variant="ghost" size="xs" className="gap-1 text-xs text-[#94A3B8]">
            <ArrowLeft className="h-3 w-3" /> Back to Shows Table
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Multi-Screen Showtime Dispatch Matrix"
        subtitle="Visual Timeline Grid Across 5 Auditoriums • Friday, November 07"
        description="Monitor turnaround times between screenings, cleaning windows, DCP playlist durations, and peak auditorium overlaps."
        badge="Live Schedule"
        badgeVariant="success"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#111827] border border-[#2A3445] rounded-xl p-0.5">
              <Button variant="ghost" size="xs" className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 text-xs font-semibold text-white">Today, Nov 07</span>
              <Button variant="ghost" size="xs" className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        }
      />

      {/* Calendar Grid by Hall */}
      <div className="space-y-4">
        {THEATRE_HALLS.map((hall) => {
          const showsInHall = THEATRE_SHOWS.filter((s) => s.hallId === hall.id);
          return (
            <Card key={hall.id} variant="elevated" className="p-5 space-y-3 border-[#2A3445]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#2A3445]/60">
                <div className="flex items-center gap-3">
                  <Badge variant="solid" size="sm">Screen 0{hall.hallNumber}</Badge>
                  <h3 className="font-bold text-white text-sm">{hall.name}</h3>
                  <span className="text-xs text-[#FBBF24] font-medium">{hall.screenType}</span>
                </div>
                <span className="text-xs font-mono text-[#94A3B8]">{hall.seatCount} Total Seats</span>
              </div>

              {/* Time Slots Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {showsInHall.map((show) => (
                  <div
                    key={show.id}
                    className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1.5 hover:border-[#FBBF24]/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-[#FBBF24]">{show.startTime}</span>
                      <Badge variant={show.status === "Running" ? "success" : "secondary"} size="sm">
                        {show.status}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-white text-xs truncate">{show.movieTitle}</h4>
                    <div className="flex justify-between items-center text-[10px] text-[#94A3B8]">
                      <span>{show.format}</span>
                      <span className="font-mono text-emerald-400 font-bold">{show.seatsBooked}/{show.totalSeats}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

