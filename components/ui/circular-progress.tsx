import React from "react";
import { cn } from "@/utils";

export interface CircularProgressProps {
  value: number; // 0 to 100
  size?: number; // size in px
  strokeWidth?: number;
  label?: string;
  className?: string;
}

/**
 * Enterprise Circular Progress Gauge
 * SVG ring used for occupancy ratios, CPU usage, and completion metrics.
 */
export function CircularProgress({
  value,
  size = 64,
  strokeWidth = 6,
  label,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1F2937"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FBBF24"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-xs font-bold text-white">{Math.round(value)}%</span>
        {label && <span className="text-[9px] text-[#94A3B8]">{label}</span>}
      </div>
    </div>
  );
}

