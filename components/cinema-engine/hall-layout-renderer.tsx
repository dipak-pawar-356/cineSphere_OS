"use client";

import React from "react";
import { HallLayout, ShowSeat, HallSection } from "@/types";
import { SectionRenderer } from "./section-renderer";
import { SeatLegend } from "./seat-legend";
import { cn } from "@/utils";
import { DoorOpen } from "lucide-react";

export interface HallLayoutRendererProps {
  layout: HallLayout;
  seatInventory: ShowSeat[];
  selectedSeatNumbers?: string[];
  sectionPricing?: Record<string, number>;
  onSeatClick?: (seat: ShowSeat) => void;
  screenName?: string;
  className?: string;
}

export function HallLayoutRenderer({
  layout,
  seatInventory,
  selectedSeatNumbers = [],
  sectionPricing = {},
  onSeatClick,
  screenName = "Cinema Curved Screen",
  className,
}: HallLayoutRendererProps) {
  // Map inventory by section
  const sectionSeatsMap = new Map<string, ShowSeat[]>();
  seatInventory.forEach((seat) => {
    if (!sectionSeatsMap.has(seat.sectionId)) {
      sectionSeatsMap.set(seat.sectionId, []);
    }
    sectionSeatsMap.get(seat.sectionId)!.push(seat);
  });

  return (
    <div className={cn("space-y-8 select-none", className)}>
      {/* 1. Curved Screen Visual Indicator */}
      <div className="relative max-w-2xl mx-auto text-center space-y-2 pt-2">
        <div className="relative flex justify-center">
          {/* Curved Projection Screen Arc */}
          <div className="w-full h-8 border-t-4 border-amber-400/80 rounded-t-[100px] shadow-[0_-12px_24px_rgba(245,158,11,0.25)] relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-amber-400/15 to-transparent blur-sm" />
          </div>
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold flex items-center justify-center gap-2">
          <span>•</span>
          <span>{screenName} (All Eyes This Way)</span>
          <span>•</span>
        </div>
      </div>

      {/* 2. Emergency Exits Top Indicators */}
      <div className="flex justify-between items-center px-4 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
        <div className="flex items-center gap-1.5 text-emerald-400/80">
          <DoorOpen className="h-3.5 w-3.5" />
          <span>Exit Left</span>
        </div>
        <div className="text-zinc-500">Acoustic Sweet Spot (Rows D-G)</div>
        <div className="flex items-center gap-1.5 text-emerald-400/80">
          <span>Exit Right</span>
          <DoorOpen className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* 3. Sections Container */}
      <div className="space-y-6">
        {layout.sections.map((section: HallSection) => {
          const sectionSeats =
            sectionSeatsMap.get(section.id) ||
            seatInventory.filter((s) => s.sectionName === section.name);

          return (
            <SectionRenderer
              key={section.id}
              section={section}
              seats={sectionSeats}
              selectedSeatNumbers={selectedSeatNumbers}
              onSeatClick={onSeatClick}
              showPricing={
                sectionPricing[section.id] ?? sectionPricing[section.name]
              }
            />
          );
        })}
      </div>

      {/* 4. Dynamic Legend */}
      <SeatLegend
        sections={layout.sections}
        sectionPricing={sectionPricing}
      />
    </div>
  );
}

