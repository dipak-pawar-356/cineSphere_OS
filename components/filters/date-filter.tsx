"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/utils";

export interface DateFilterProps {
  selectedPreset?: string;
  onPresetSelect?: (preset: string) => void;
  className?: string;
}

/**
 * Enterprise Date Range Filter Chips
 * Quick time horizon selector for operational and financial reports.
 */
export function DateFilter({
  selectedPreset = "30d",
  onPresetSelect,
  className,
}: DateFilterProps) {
  const PRESETS = [
    { id: "today", label: "Today" },
    { id: "7d", label: "Last 7 Days" },
    { id: "30d", label: "Last 30 Days" },
    { id: "90d", label: "Quarter (Q3)" },
    { id: "year", label: "Rolling 1 Year" },
  ];

  return (
    <div className={cn("inline-flex items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs", className)}>
      <div className="flex items-center gap-1 px-2 text-[#94A3B8]">
        <Calendar className="h-3.5 w-3.5 text-[#FBBF24]" />
        <span className="hidden sm:inline font-semibold">Period:</span>
      </div>
      {PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onPresetSelect?.(p.id)}
          className={cn(
            "px-2.5 py-1 rounded-lg transition-colors font-medium text-[11px]",
            selectedPreset === p.id
              ? "bg-[#FBBF24] text-[#070B12] font-bold"
              : "text-[#94A3B8] hover:text-white"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

