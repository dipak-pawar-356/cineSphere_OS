"use client";

import React, { useState } from "react";
import { ChartDatapoint } from "@/types/analytics.types";
import { cn } from "@/utils";

export interface BarChartProps {
  data: ChartDatapoint[];
  title?: string;
  subtitle?: string;
  orientation?: "vertical" | "horizontal";
  barColor?: string;
  valueFormatter?: (val: number) => string;
  height?: number;
  className?: string;
}

export function BarChart({
  data,
  title,
  subtitle,
  orientation = "vertical",
  barColor = "#FBBF24",
  valueFormatter = (val) => val.toLocaleString(),
  height = 200,
  className,
}: BarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className={cn("p-6 text-center text-xs text-[#64748B]", className)}>
        No bar distribution data available.
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1);

  if (orientation === "horizontal") {
    return (
      <div className={cn("p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-4", className)}>
        {(title || subtitle) && (
          <div>
            {title && <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>}
            {subtitle && <p className="text-xs text-[#94A3B8]">{subtitle}</p>}
          </div>
        )}

        <div className="space-y-3">
          {data.map((item, idx) => {
            const widthPct = Math.min(100, Math.max(5, (item.value / maxVal) * 100));
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="space-y-1.5 cursor-pointer"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className={cn("font-medium transition-colors", isHovered ? "text-white" : "text-[#94A3B8]")}>
                    {item.label}
                  </span>
                  <span className="font-mono font-bold text-white">
                    {valueFormatter(item.value)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#111827] overflow-hidden">
                  <div
                    style={{ width: `${widthPct}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isHovered ? "bg-[#FBBF24]" : "bg-[#FBBF24]/60"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div>
          {title && <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>}
          {subtitle && <p className="text-xs text-[#94A3B8]">{subtitle}</p>}
        </div>
        {hoveredIdx !== null && (
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-[#FBBF24]">
              {valueFormatter(data[hoveredIdx].value)}
            </span>
            <span className="text-[10px] text-[#64748B] block">{data[hoveredIdx].label}</span>
          </div>
        )}
      </div>

      <div style={{ height }} className="flex items-end gap-2 pt-4 border-b border-[#2A3445] pb-2">
        {data.map((item, idx) => {
          const heightPct = Math.min(100, Math.max(6, (item.value / maxVal) * 100));
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="flex-1 h-full flex flex-col justify-end items-center cursor-pointer group"
            >
              <div
                style={{ height: `${heightPct}%` }}
                className={cn(
                  "w-full rounded-t-md transition-all duration-200",
                  isHovered ? "bg-[#FBBF24] shadow-lg shadow-[#FBBF24]/20" : "bg-[#FBBF24]/40 hover:bg-[#FBBF24]/80"
                )}
              />
              <span className="text-[10px] text-[#64748B] font-mono mt-2 truncate w-full text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
