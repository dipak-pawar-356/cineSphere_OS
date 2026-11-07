import React from "react";
import { ShowSeat } from "@/types";

export interface SeatTooltipProps {
  seat: ShowSeat;
  children: React.ReactNode;
}

export function SeatTooltip({ seat, children }: SeatTooltipProps) {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
        <div className="bg-zinc-950/95 text-white border border-zinc-700/80 px-2.5 py-1.5 rounded-lg shadow-2xl text-[11px] whitespace-nowrap backdrop-blur-md space-y-0.5">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-amber-400 font-mono">{seat.seatNumber}</span>
            <span className="text-zinc-500">•</span>
            <span>{seat.sectionName}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-zinc-300 text-[10px]">
            <span>Type: {seat.seatType}</span>
            <span className="font-mono font-bold text-emerald-400">₹{seat.price}</span>
          </div>
          <div className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono">
            Status: {seat.status}
          </div>
        </div>
        <div className="w-2 h-2 bg-zinc-950 border-r border-b border-zinc-700/80 rotate-45 -mt-1" />
      </div>
    </div>
  );
}
