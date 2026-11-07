import React from "react";
import { HallSection } from "@/types";
import { cn } from "@/utils";
import { Accessibility, Check } from "lucide-react";

export interface SeatLegendProps {
  sections?: HallSection[];
  sectionPricing?: Record<string, number>;
  className?: string;
}

export function SeatLegend({
  sections = [],
  sectionPricing = {},
  className,
}: SeatLegendProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-zinc-950/80 border border-zinc-800 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs select-none backdrop-blur-md",
        className
      )}
    >
      {/* Sections & Show Pricing */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <span className="text-zinc-500 font-mono uppercase text-[10px] tracking-wider font-bold">
          Tier Pricing:
        </span>
        {sections.map((section) => {
          const price =
            sectionPricing[section.id] ??
            sectionPricing[section.name] ??
            undefined;

          return (
            <div key={section.id} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: section.defaultColor }}
              />
              <span className="text-zinc-200 font-medium">{section.name}</span>
              {price !== undefined && (
                <span className="font-mono font-bold text-amber-400">
                  ₹{price}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Seat Status Legend */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-5 border-t sm:border-t-0 sm:border-l border-zinc-800 pt-2 sm:pt-0 sm:pl-6 text-zinc-400">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-t-md rounded-b border border-zinc-600 bg-zinc-900" />
          <span>Available</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-t-md rounded-b bg-amber-400 text-black flex items-center justify-center font-bold">
            <Check className="h-2.5 w-2.5 stroke-[3]" />
          </div>
          <span className="text-amber-400 font-medium">Selected</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-t-md rounded-b bg-zinc-900 border border-zinc-800 opacity-40" />
          <span>Sold</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-t-md rounded-b bg-sky-950 border border-sky-500 text-sky-400 flex items-center justify-center">
            <Accessibility className="h-2.5 w-2.5" />
          </div>
          <span>Wheelchair</span>
        </div>
      </div>
    </div>
  );
}
