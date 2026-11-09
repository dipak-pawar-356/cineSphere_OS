"use client";

import React, { useState } from "react";
import { ChartDatapoint } from "@/types/analytics.types";
import { cn } from "@/utils";

export interface PieChartProps {
  data: ChartDatapoint[];
  title?: string;
  subtitle?: string;
  colors?: string[];
  className?: string;
}

const DEFAULT_COLORS = [
  "#FBBF24",
  "#38BDF8",
  "#34D399",
  "#A78BFA",
  "#FB7185",
  "#94A3B8",
];

export function PieChart({
  data,
  title,
  subtitle,
  colors = DEFAULT_COLORS,
  className,
}: PieChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className={cn("p-6 text-center text-xs text-[#64748B]", className)}>
        No slice data available.
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;

  // Pie slice path generator
  let cumulativeAngle = 0;
  const slices = data.map((d, i) => {
    const fraction = d.value / total;
    const angle = fraction * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const r = 70;
    const cx = 80;
    const cy = 80;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;
    const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      ...d,
      fraction,
      pathD,
      color: colors[i % colors.length],
    };
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
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
            {slices.map((slice, i) => (
              <path
                key={i}
                d={slice.pathD}
                fill={slice.color}
                className={cn(
                  "transition-all duration-300 cursor-pointer",
                  hoveredIdx === i ? "opacity-100 scale-105 origin-center" : "opacity-90 hover:opacity-100"
                )}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            ))}
          </svg>
        </div>

        <div className="flex-1 space-y-2 w-full">
          {slices.map((slice, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={cn(
                "p-2 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors",
                hoveredIdx === i
                  ? "bg-[#111827] text-white"
                  : "bg-transparent text-[#94A3B8] hover:text-white"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                <span className="truncate font-medium">{slice.label}</span>
              </div>
              <span className="font-mono font-bold text-white">
                {(slice.fraction * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
