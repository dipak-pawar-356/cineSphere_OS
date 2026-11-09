"use client";

import React, { useState } from "react";
import { ChartDatapoint } from "@/types/analytics.types";
import { cn } from "@/utils";

export interface AreaChartProps {
  data: ChartDatapoint[];
  title?: string;
  subtitle?: string;
  color?: string; // hex
  valueFormatter?: (val: number) => string;
  height?: number;
  className?: string;
}

export function AreaChart({
  data,
  title,
  subtitle,
  color = "#FBBF24",
  valueFormatter = (val) => `₹${val.toLocaleString("en-IN")}`,
  height = 220,
  className,
}: AreaChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className={cn("p-6 text-center text-xs text-[#64748B]", className)}>
        No area distribution data available.
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const minVal = 0;
  const maxVal = Math.max(...values, 1);

  const width = 600;
  const paddingX = 40;
  const paddingY = 30;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * usableWidth;
    const y = height - paddingY - (d.value / maxVal) * usableHeight;
    return { x, y, data: d };
  });

  const lineD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${lineD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className={cn("p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div>
          {title && <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>}
          {subtitle && <p className="text-xs text-[#94A3B8]">{subtitle}</p>}
        </div>
        {hoveredIdx !== null ? (
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-[#FBBF24]">
              {valueFormatter(data[hoveredIdx].value)}
            </span>
            <span className="text-[10px] text-[#64748B] block">{data[hoveredIdx].label}</span>
          </div>
        ) : (
          <div className="text-right text-xs font-mono text-[#94A3B8]">
            Peak: <span className="text-white font-bold">{valueFormatter(maxVal)}</span>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="areaFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Guidelines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#2A3445" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#2A3445" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#2A3445" />

          {/* Area fill */}
          <path d={areaD} fill="url(#areaFillGrad)" />

          {/* Stroke path */}
          <path d={lineD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive dots */}
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
                r={hoveredIdx === i ? 6 : 3.5}
                className={cn(
                  "transition-all fill-[#070B12]",
                  hoveredIdx === i ? "stroke-[#FBBF24] stroke-[3]" : "stroke-white stroke-[2]"
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
