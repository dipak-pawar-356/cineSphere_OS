"use client";

import React from "react";
import { PublicTheatreView } from "@/types/public-theatre.types";

export interface PublicTheatreSpecsProps {
  theatre: PublicTheatreView;
}

export function PublicTheatreSpecs({ theatre }: PublicTheatreSpecsProps) {
  const { profile, halls, shows, configuration } = theatre;
  const flagshipHall = halls[0]?.name?.split(" - ")[1] || "IMAX with Laser";
  const startingShow = shows[0];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="p-4 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
        <div className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">
          Auditorium Fleet
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5">
          {profile.screensCount} Screens
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
        <div className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">
          Flagship Technology
        </div>
        <div className="text-lg sm:text-xl font-bold font-mono text-[#FBBF24] mt-0.5 truncate">
          {flagshipHall}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
        <div className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">
          Seating Capacity
        </div>
        <div className="text-xl sm:text-2xl font-mono text-emerald-400 font-bold mt-0.5">
          {profile.totalSeatingCapacity.toLocaleString()} Seats
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
        <div className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">
          Today&apos;s Schedule
        </div>
        <div className="text-xl sm:text-2xl font-mono text-white font-bold mt-0.5">
          {shows.length} Shows ({configuration.currency})
        </div>
      </div>
    </div>
  );
}
