"use client";

import React from "react";
import { PublicTheatreView } from "@/types/public-theatre.types";
import { Monitor, Volume2, Sparkles, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface PublicTheatreHallsSectionProps {
  theatre: PublicTheatreView;
}

export function PublicTheatreHallsSection({ theatre }: PublicTheatreHallsSectionProps) {
  const { halls } = theatre;

  return (
    <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Monitor className="h-5 w-5 text-[#38BDF8]" />
            <span>Auditorium Fleet & Acoustic Systems</span>
          </h3>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Engineered with Barco 4K Laser, uncompressed Dolby Atmos, and ergonomic spatial sightlines.
          </p>
        </div>
        <span className="text-xs font-mono text-zinc-300 bg-[#111827] px-2.5 py-1 rounded-lg border border-[#2A3445] shrink-0">
          {halls.length} Active Screens
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {halls.map((hall) => (
          <div
            key={hall.id}
            className="p-5 rounded-2xl bg-[#111827] border border-[#2A3445] flex flex-col justify-between space-y-3 hover:border-sky-500/40 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#FBBF24] uppercase font-bold tracking-wider">
                  Screen Specs
                </span>
                <span
                  className="h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0"
                  title="Screen Operational"
                />
              </div>

              <div>
                <h4 className="font-bold text-white text-sm">{hall.name}</h4>
                <div className="text-xs font-medium text-sky-400 mt-0.5">
                  {hall.screenType}
                </div>
              </div>

              <div className="space-y-1 text-xs text-[#94A3B8] pt-1 border-t border-[#1E293B]">
                <div className="flex items-center justify-between">
                  <span>Capacity:</span>
                  <span className="font-mono text-white font-semibold">
                    {hall.capacity} Seats
                  </span>
                </div>
                <div className="text-[11px] text-zinc-300">
                  <span className="text-zinc-500">Audio:</span> {hall.soundSystem}
                </div>
                <div className="text-[11px] text-zinc-300">
                  <span className="text-zinc-500">Optical:</span> {hall.projectionType}
                </div>
              </div>
            </div>

            {hall.premiumFeatures && hall.premiumFeatures.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2 border-t border-[#1E293B]">
                {hall.premiumFeatures.map((feat, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#161F2E] border border-[#2A3445] text-zinc-300"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
