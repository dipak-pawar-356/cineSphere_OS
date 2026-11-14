"use client";

import React from "react";
import { PublicTheatreView } from "@/types/public-theatre.types";
import { Clock, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/utils";

export interface PublicTheatreOperatingHoursSectionProps {
  theatre: PublicTheatreView;
}

export function PublicTheatreOperatingHoursSection({
  theatre,
}: PublicTheatreOperatingHoursSectionProps) {
  const { operatingHours, configuration, location } = theatre;
  const { weeklySchedule, todayHours, isOpenNow, holidayNoticePlaceholder } = operatingHours;

  const currentDayName = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ][new Date().getDay()];

  return (
    <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#FBBF24]" />
            <span>Operating Hours & Weekly Schedule</span>
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Multiplex box office opening times, concessions turnaround, and midnight scheduling.
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border",
              isOpenNow
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/15 text-rose-400 border-rose-500/30"
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isOpenNow ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
              )}
            />
            {isOpenNow ? "Open Today" : "Currently Closed"} ({todayHours})
          </span>
          <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
            TZ: {configuration.timezone}
          </span>
        </div>
      </div>

      {/* Weekly Schedule Table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
        {weeklySchedule.map((day) => {
          const isToday = day.dayOfWeek === currentDayName;

          return (
            <div
              key={day.dayOfWeek}
              className={cn(
                "p-3.5 rounded-xl border text-center transition-all space-y-1 flex flex-col justify-between",
                isToday
                  ? "bg-[#111827] border-[#FBBF24] shadow-md shadow-amber-400/10 ring-1 ring-amber-400/30"
                  : "bg-[#111827]/70 border-[#2A3445] text-zinc-300"
              )}
            >
              <div>
                <div className="flex items-center justify-center gap-1">
                  <span
                    className={cn(
                      "text-xs font-bold uppercase",
                      isToday ? "text-[#FBBF24]" : "text-white"
                    )}
                  >
                    {day.dayLabel}
                  </span>
                  {isToday && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  )}
                </div>
                <div className="text-[10px] text-zinc-400 uppercase font-mono mt-0.5">
                  {day.dayOfWeek.substring(0, 3)}
                </div>
              </div>

              <div className="pt-1.5 border-t border-[#1E293B]">
                {day.isOpen ? (
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold font-mono text-white">
                      {day.openTime}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">to</div>
                    <div className="text-xs font-bold font-mono text-white">
                      {day.closeTime}
                    </div>
                    {day.isOvernight && (
                      <span className="inline-block text-[9px] text-amber-300 font-medium">
                        🌙 Overnight
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs font-bold text-rose-400">Closed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Holiday / Special Events Notice */}
      {holidayNoticePlaceholder && (
        <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center gap-3 text-xs text-[#CBD5E1]">
          <Calendar className="h-4 w-4 text-[#FBBF24] shrink-0" />
          <span>{holidayNoticePlaceholder}</span>
        </div>
      )}
    </div>
  );
}
