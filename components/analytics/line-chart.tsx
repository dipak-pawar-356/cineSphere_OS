"use client";

import React, { useState } from "react";
import { ChartDatapoint } from "@/types/analytics.types";
import { cn } from "@/utils";

export interface LineChartProps {
  data: ChartDatapoint[];
  title?: string;
  subtitle?: string;
  strokeColor?: string;
  valueFormatter?: (val: number) => string;
  height?: number;
  className?: string;
}

export function LineChart({
  data,
  title,
  subtitle,
  strokeColor = "#FBBF24",
  valueFormatter = (val) => val.toLocaleString(),
  height = 200,
  className,
}: LineChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className={cn("p-6 text-center text-xs text-[#64748B]", className)}>
        No trend data available for this range.
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const width = 600;
  const paddingX = 40;
  const paddingY = 30;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  // Generate coordinates for points
  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * usableWidth;
    const y = height - paddingY - ((d.value - minVal) / range) * usableHeight;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  return (
    <div className={cn("p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3", className)}>
      {(title || subtitle) && (
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
      )}

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#2A3445"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="#2A3445"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#2A3445"
          />

          {/* Stroke Path */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, i) => (
            <g
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === i ? 6 : 4}
                className={cn(
                  "transition-all fill-[#070B12] stroke-[#FBBF24]",
                  hoveredIdx === i ? "stroke-[3]" : "stroke-[2]"
                )}
              />
              <text
                x={pt.x}
                y={height - 10}
                textAnchor="middle"
                className="text-[10px] fill-[#64748B] font-mono"
              >
                {pt.data.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
