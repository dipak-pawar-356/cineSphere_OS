import React from "react";
import Link from "next/link";
import { THEATRE_SHOWS, THEATRE_HALLS, THEATRE_MOVIES } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Clock, Filter, Eye, CalendarDays } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Showtime Dispatch & Scheduling | CineSphere OS",
};

export default function TheatreShowsPage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Showtime Dispatch & Schedule Management"
        subtitle="25 Scheduled Shows Today across 5 Laser Auditoriums"
        description="Monitor automated DCP ingestion triggers, projector lamp warmups, sound processor calibration tests, and seat fill rate progressions."
        badge="25 Shows Today"
        badgeVariant="primary"
        actions={
          <div className="flex gap-2">
            <Link href={ROUTES.THEATRE_ADMIN.SHOW_CALENDAR}>
              <Button variant="outline" size="sm" className="gap-2 border-[#2A3445]">
                <CalendarDays className="h-4 w-4 text-[#FBBF24]" /> Visual Calendar
              </Button>
            </Link>
            <Button variant="primary" size="sm" disabled className="gap-1.5 font-bold">
              <Plus className="h-4 w-4" /> Schedule New Show (Phase 2)
            </Button>
          </div>
        }
      />

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] p-3 rounded-2xl border border-[#2A3445]">
        <div className="flex flex-wrap items-center gap-2">
          {["All Halls (5)", "Screen 01 (Dolby)", "Screen 02 (IMAX)", "Screen 03 (Prime)", "Screen 04 (4DX)", "Screen 05 (Royal)"].map((chip, idx) => (
            <button
              key={chip}
              type="button"
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                idx === 0
                  ? "bg-[#FBBF24] text-[#070B12]"
                  : "bg-[#161F2E] text-[#94A3B8] border border-[#2A3445] hover:text-white"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#64748B] font-mono">
          Showing 10 Active Showtimes
        </div>
      </div>

      {/* Shows Table */}
      <Card variant="elevated" className="overflow-hidden border-[#2A3445]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-4">Film Title</th>
                <th className="py-3.5 px-4">Auditorium</th>
                <th className="py-3.5 px-4">Start – End Time</th>
                <th className="py-3.5 px-4">Language & Format</th>
                <th className="py-3.5 px-4">Base Ticket</th>
                <th className="py-3.5 px-4">Admissions</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60">
              {THEATRE_SHOWS.map((show) => {
                const fillPercent = Math.round((show.seatsBooked / show.totalSeats) * 100);
                return (
                  <tr key={show.id} className="hover:bg-[#161F2E]/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white text-sm">
                      {show.movieTitle}
                    </td>
                    <td className="py-3.5 px-4 text-[#CBD5E1]">
                      {show.hallName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#FBBF24]">
                      {show.startTime} – {show.endTime}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#CBD5E1]">{show.language}</span>
                        <Badge variant="outline" size="sm">{show.format}</Badge>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      ₹{show.ticketPrice}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-[#94A3B8]">{show.seatsBooked}/{show.totalSeats}</span>
                          <span className={fillPercent >= 90 ? "text-emerald-400 font-bold" : "text-[#94A3B8]"}>
                            {fillPercent}%
                          </span>
                        </div>
                        <div className="h-1.5 w-24 rounded-full bg-[#111827] overflow-hidden">
                          <div
                            style={{ width: `${fillPercent}%` }}
                            className={`h-full rounded-full ${
                              fillPercent >= 90 ? "bg-emerald-400" : "bg-[#FBBF24]"
                            }`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          show.status === "Running"
                            ? "success"
                            : show.status === "Completed"
                            ? "secondary"
                            : "primary"
                        }
                        size="sm"
                        dot={show.status === "Running"}
                      >
                        {show.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/theatre/shows/${show.id}`}>
                        <Button variant="outline" size="xs" className="gap-1 border-[#2A3445] text-xs">
                          <Eye className="h-3 w-3" /> Inspect
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
