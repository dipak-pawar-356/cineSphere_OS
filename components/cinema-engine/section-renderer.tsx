"use client";

import React from "react";
import { HallSection, ShowSeat } from "@/types";
import { SeatRenderer } from "./seat-renderer";
import { SectionBadge } from "./section-badge";
import { cn } from "@/utils";

export interface SectionRendererProps {
  section: HallSection;
  seats: ShowSeat[];
  selectedSeatNumbers?: string[];
  onSeatClick?: (seat: ShowSeat) => void;
  showPricing?: number;
  className?: string;
}

export function SectionRenderer({
  section,
  seats,
  selectedSeatNumbers = [],
  onSeatClick,
  showPricing,
  className,
}: SectionRendererProps) {
  const selectedSet = new Set(selectedSeatNumbers);

  // Group seats by row
  const rowMap = new Map<string, ShowSeat[]>();
  seats.forEach((seat) => {
    if (!rowMap.has(seat.row)) {
      rowMap.set(seat.row, []);
    }
    rowMap.get(seat.row)!.push(seat);
  });

  // Sort each row's seats by column
  rowMap.forEach((rowSeats) => {
    rowSeats.sort((a, b) => a.column - b.column);
  });

  const sortedRows = Array.from(rowMap.keys()).sort();
  const representativePrice = showPricing ?? (seats[0]?.price || 250);

  return (
    <div
      className={cn(
        "rounded-2xl bg-zinc-950/60 border border-zinc-800/80 p-4 sm:p-6 space-y-4 backdrop-blur-sm transition-all",
        className
      )}
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <SectionBadge
          name={section.name}
          color={section.defaultColor}
          price={representativePrice}
        />

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="font-mono">{section.seatCount} Total Seats</span>
          <span>•</span>
          <span className="capitalize">{section.seatType} Tier</span>
        </div>
      </div>

      {/* Rows Matrix */}
      <div className="overflow-x-auto pb-2 flex flex-col items-center gap-2.5">
        {sortedRows.map((rowLabel) => {
          const rowSeats = rowMap.get(rowLabel) || [];

          return (
            <div
              key={rowLabel}
              className="flex items-center gap-2 sm:gap-3 shrink-0"
            >
              {/* Left Row Indicator */}
              <span className="w-5 text-right font-mono text-xs font-bold text-zinc-400 select-none">
                {rowLabel}
              </span>

              {/* Seats in Row */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {rowSeats.map((seat) => (
                  <SeatRenderer
                    key={seat.id}
                    seat={seat}
                    isSelected={selectedSet.has(seat.seatNumber)}
                    sectionColor={section.defaultColor}
                    onClick={onSeatClick}
                  />
                ))}
              </div>

              {/* Right Row Indicator */}
              <span className="w-5 text-left font-mono text-xs font-bold text-zinc-400 select-none">
                {rowLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

