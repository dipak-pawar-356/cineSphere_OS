"use client";

import React, { useState } from "react";
import { cn } from "@/utils";

export interface HeatmapCell {
  rowLabel: string; // e.g. "Hall 1", "Mon"
  colLabel: string; // e.g. "12:00", "15:00", "18:00", "21:00"
  value: number;    // Occupancy % (0 - 100)
}

export interface HeatmapChartProps {
  title?: string;
  subtitle?: string;
  rows?: string[];
  cols?: string[];
  cells?: HeatmapCell[];
  className?: string;
}

const DEFAULT_ROWS = ["Hall 1 (IMAX)", "Hall 2 (Dolby)", "Hall 3 (VIP)", "Hall 4 (2D)"];
const DEFAULT_COLS = ["09:00", "12:00", "15:00", "18:00", "21:00", "23:30"];

export function HeatmapChart({
  title = "Auditorium Occupancy Heatmap",
  subtitle = "Hourly fill rate density across multiplex screens",
  rows = DEFAULT_ROWS,
  cols = DEFAULT_COLS,
  cells,
  className,
}: HeatmapChartProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: string; col: string; val: number } | null>(null);

  // Generate synthetic or use passed cells
  const cellMap: Record<string, number> = {};
  if (cells && cells.length > 0) {
    cells.forEach((c) => {
      cellMap[`${c.rowLabel}-${c.colLabel}`] = c.value;
    });
  } else {
    // Realistic cinema occupancy distribution
    rows.forEach((r, rIdx) => {
      cols.forEach((c, cIdx) => {
        let base = 60 + rIdx * 5;
        if (c === "18:00" || c === "21:00") base += 25; // Prime evening peaks
        if (c === "09:00") base -= 30; // Morning slow
        const jitter = ((rIdx * 7 + cIdx * 13) % 15) - 7;
        const val = Math.min(100, Math.max(20, base + jitter));
        cellMap[`${r}-${c}`] = val;
      });
    });
  }

  const getHeatmapBg = (val: number) => {
    if (val >= 90) return "bg-amber-400 text-[#070B12] font-bold";
    if (val >= 75) return "bg-amber-500/70 text-white";
    if (val >= 60) return "bg-amber-600/40 text-amber-200";
    if (val >= 40) return "bg-slate-700/50 text-[#94A3B8]";
    return "bg-[#111827] text-[#64748B]";
  };

  return (
    <div className={cn("p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          {title && <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>}
          {subtitle && <p className="text-xs text-[#94A3B8]">{subtitle}</p>}
        </div>
        {hoveredCell && (
          <div className="text-right text-xs font-mono">
            <span className="text-white font-bold">{hoveredCell.row}</span> @{" "}
            <span className="text-[#38BDF8]">{hoveredCell.col}</span>:{" "}
            <span className="text-[#FBBF24] font-bold">{hoveredCell.val}% Fill</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-[11px] font-mono text-[#64748B]">Screen / Time</th>
              {cols.map((col) => (
                <th key={col} className="p-2 text-center text-[11px] font-mono text-[#94A3B8]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row} className="border-t border-[#1E293B]">
                <td className="p-2.5 font-medium text-white truncate max-w-[140px]">{row}</td>
                {cols.map((col) => {
                  const val = cellMap[`${row}-${col}`] || 0;
                  return (
                    <td
                      key={col}
                      onMouseEnter={() => setHoveredCell({ row, col, val })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className="p-1.5 text-center"
                    >
                      <div
                        className={cn(
                          "py-2 px-1 rounded-lg transition-transform hover:scale-105 cursor-pointer font-mono text-[11px]",
                          getHeatmapBg(val)
                        )}
                      >
                        {val}%
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#1E293B]">
        <span>Occupancy Density:</span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-[#111827] border border-[#2A3445]" /> &lt;40%
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-amber-600/40" /> 60%
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-amber-500/70" /> 75%
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-amber-400" /> 90%+
          </span>
        </div>
      </div>
    </div>
  );
}
