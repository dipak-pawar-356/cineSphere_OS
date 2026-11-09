"use client";

import React, { useState } from "react";
import { ChartDatapoint } from "@/types/analytics.types";
import { cn } from "@/utils";

export interface DonutChartProps {
  data: ChartDatapoint[];
  title?: string;
  subtitle?: string;
  centerLabel?: string;
  centerValue?: string;
  colors?: string[];
  className?: string;
}

const DEFAULT_COLORS = [
  "#FBBF24", // Gold
  "#38BDF8", // Sky blue
  "#34D399", // Emerald
  "#A78BFA", // Purple
  "#FB7185", // Rose
  "#94A3B8", // Slate
];

export function DonutChart({
  data,
  title,
  subtitle,
  centerLabel,
  centerValue,
  colors = DEFAULT_COLORS,
  className,
}: DonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className={cn("p-6 text-center text-xs text-[#64748B]", className)}>
        No distribution metrics available.
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;

  // Calculate SVG stroke dashes for donut segments
  const radius = 65;
  const circumference = 2 * Math.PI * radius; // ~408.4

  let cumulativeOffset = 0;
  const segments = data.map((d, i) => {
    const fraction = d.value / total;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeOffset;
    cumulativeOffset += fraction * circumference;
    const color = colors[i % colors.length];
    return { ...d, fraction, strokeDasharray, strokeDashoffset, color };
  });

  return (
    <div className={cn("p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-4", className)}>
      {(title || subtitle) && (
        <div>
          {title && <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>}
          {subtitle && <p className="text-xs text-[#94A3B8]">{subtitle}</p>}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* SVG Circle Donut */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#111827"
              strokeWidth="20"
            />

            {/* Segment rings */}
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={hoveredIdx === i ? 24 : 20}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            ))}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[11px] text-[#94A3B8] font-mono">
              {hoveredIdx !== null ? data[hoveredIdx].label : centerLabel || "Total Yield"}
            </span>
            <span className="text-base font-bold font-mono text-white">
              {hoveredIdx !== null
                ? `${((data[hoveredIdx].value / total) * 100).toFixed(1)}%`
                : centerValue || `₹${(total / 100000).toFixed(1)}L`}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 w-full">
          {segments.map((seg, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={cn(
                "p-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors",
                hoveredIdx === i
                  ? "bg-[#111827] border-[#FBBF24]/50 text-white"
                  : "bg-transparent border-transparent text-[#94A3B8] hover:text-white"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="truncate font-medium">{seg.label}</span>
              </div>
              <div className="text-right font-mono shrink-0 ml-2">
                <span className="font-bold text-white">
                  {seg.percentage ? `${seg.percentage}%` : `${(seg.fraction * 100).toFixed(1)}%`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
