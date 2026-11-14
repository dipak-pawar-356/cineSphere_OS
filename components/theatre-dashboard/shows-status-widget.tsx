"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Film,
  Clock,
  AlertCircle,
  PlayCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { ShowMetricsBundle } from "@/types/theatre-dashboard.types";

interface ShowsStatusWidgetProps {
  shows: ShowMetricsBundle;
  currencySymbol: string;
}

export function ShowsStatusWidget({ shows, currencySymbol }: ShowsStatusWidgetProps) {
  return (
    <Card variant="elevated" className="p-6 space-y-6 bg-[#0D1525] border border-[#2A3445]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2A3445]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#F59E0B]">
            <Film className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Showtime Programming & Running Audis</h3>
            <p className="text-xs text-[#94A3B8]">
              {shows.runningShowsCount} running screenings • {shows.upcomingShowsCount} upcoming today
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="success" size="sm" dot>
            {shows.runningShowsCount} Running
          </Badge>
          <Badge variant="warning" size="sm">
            {shows.upcomingShowsCount} Upcoming
          </Badge>
          <Badge variant="secondary" size="sm">
            {shows.completedShowsCount} Completed
          </Badge>
        </div>
      </div>

      {/* Shows Starting Soon Alert Banner */}
      {shows.showsStartingSoon.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <AlertCircle className="h-4 w-4" />
            <span>Screenings Commencing in &lt; 60 Minutes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {shows.showsStartingSoon.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#111827] border border-amber-500/30 flex items-center justify-between gap-3 shadow-lg"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm truncate">{item.movieTitle}</span>
                    <Badge variant="outline" size="sm" className="border-[#2A3445] text-[10px]">
                      {item.format}
                    </Badge>
                  </div>
                  <div className="text-xs text-[#94A3B8] flex items-center gap-2">
                    <span>{item.hallName}</span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400">
                      {item.bookedSeats}/{item.totalSeats} seats ({item.occupancyPercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <Badge variant="warning" size="sm" className="font-mono font-bold animate-pulse">
                    in {item.minutesUntilStart}m
                  </Badge>
                  <span className="block text-[11px] text-[#94A3B8] font-mono mt-0.5">
                    Starts {item.startTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Shows Timetable List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
          Operational Screening Schedule
        </h4>

        <div className="divide-y divide-[#2A3445] border border-[#2A3445] rounded-xl overflow-hidden bg-[#111827]">
          {shows.showsSummary.map((show) => {
            const isRunning = show.status === "RUNNING";
            return (
              <div
                key={show.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#161F2E]/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg shrink-0 ${isRunning ? "bg-emerald-500/10 text-emerald-400" : "bg-[#1E293B] text-[#94A3B8]"}`}>
                    {isRunning ? <PlayCircle className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm block">{show.movieTitle}</span>
                    <span className="text-[#94A3B8] text-xs">
                      {show.hallName} • <span className="font-mono text-zinc-300">{show.startTime} - {show.endTime}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-[#94A3B8] block">Audience Load</span>
                    <span className="font-mono font-semibold text-white">
                      {show.bookedSeats} / {show.totalCapacity} ({Math.round((show.bookedSeats / show.totalCapacity) * 100)}%)
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-[#94A3B8] block">Revenue</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      {currencySymbol}{show.revenue.toLocaleString()}
                    </span>
                  </div>

                  <Badge
                    variant={isRunning ? "success" : show.status === "UPCOMING" ? "warning" : "secondary"}
                    size="sm"
                    className="shrink-0"
                  >
                    {show.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
