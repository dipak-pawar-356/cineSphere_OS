"use client";

import React, { useState } from "react";
import { TrendingUp, Calendar, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export function RevenueChartPreview() {
  const [range, setRange] = useState<"7D" | "30D" | "90D">("30D");

  // Mock bar/line heights for 12 months/periods
  const dataPoints = [
    { label: "Jan", val: 38, rev: "$380K" },
    { label: "Feb", val: 45, rev: "$450K" },
    { label: "Mar", val: 58, rev: "$580K" },
    { label: "Apr", val: 52, rev: "$520K" },
    { label: "May", val: 68, rev: "$680K" },
    { label: "Jun", val: 85, rev: "$850K" },
    { label: "Jul", val: 94, rev: "$940K" },
    { label: "Aug", val: 78, rev: "$780K" },
    { label: "Sep", val: 70, rev: "$700K" },
    { label: "Oct", val: 88, rev: "$880K" },
    { label: "Nov", val: 96, rev: "$962K" },
    { label: "Dec", val: 91, rev: "$910K" },
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#161F2E]/90 border border-white/5 shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Box Office & Concessions Yield
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-xl font-bold text-white">$4,892,400</h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +24.8%
              </span>
            </div>
          </div>

          {/* Time range pills */}
          <div className="flex items-center gap-1 bg-[#111827] p-1 rounded-lg border border-white/10 self-start sm:self-auto">
            {(["7D", "30D", "90D"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors",
                  range === r
                    ? "bg-amber-400 text-black font-bold shadow-sm"
                    : "text-[#9CA3AF] hover:text-white"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Bar Chart Visualizer */}
        <div className="h-48 w-full flex items-end gap-2 sm:gap-4 pt-4 pb-2 border-b border-white/5">
          {dataPoints.map((pt, i) => (
            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[10px] font-bold py-1 px-2 rounded border border-amber-400/40 pointer-events-none whitespace-nowrap z-10">
                {pt.label}: {pt.rev}
              </div>

              {/* Bar */}
              <div
                style={{ height: `${pt.val}%` }}
                className={cn(
                  "w-full rounded-t-md transition-all duration-300 relative overflow-hidden",
                  i === dataPoints.length - 2
                    ? "bg-gradient-to-t from-amber-500 to-amber-300 shadow-lg shadow-amber-500/20"
                    : "bg-[#1F2937] group-hover:bg-amber-400/50"
                )}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>

        {/* Labels */}
        <div className="flex justify-between items-center text-[11px] text-[#9CA3AF] pt-2 px-1">
          {dataPoints.map((pt, i) => (
            <span key={i} className="text-center w-full truncate">
              {pt.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-[#9CA3AF]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>Ticket Admissions (68%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>F&B Dining (32%)</span>
          </div>
        </div>

        <span className="text-[11px] text-amber-400/80 font-medium">
          Analytics Engine v1.0 Active
        </span>
      </div>
    </div>
  );
}
