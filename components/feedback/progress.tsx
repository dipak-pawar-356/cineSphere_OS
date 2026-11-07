import React from "react";
import { cn } from "@/utils";

export interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  color?: "primary" | "success" | "danger" | "info";
  className?: string;
}

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  color = "primary",
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const colorStyles = {
    primary: "bg-[#FBBF24]",
    success: "bg-[#22C55E]",
    danger: "bg-[#EF4444]",
    info: "bg-[#38BDF8]",
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="font-semibold text-[#CBD5E1]">{label}</span>}
          {showPercentage && (
            <span className="font-mono font-bold text-white">{clamped}%</span>
          )}
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-[#111827] border border-[#2A3445] overflow-hidden">
        <div
          style={{ width: `${clamped}%` }}
          className={cn("h-full rounded-full transition-all duration-300", colorStyles[color])}
        />
      </div>
    </div>
  );
}

export interface CircularLoaderProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CircularLoader({
  size = 32,
  strokeWidth = 3,
  className,
}: CircularLoaderProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={cn("animate-spin", className)}
    >
      <circle
        cx="20"
        cy="20"
        r="16"
        fill="none"
        stroke="#2A3445"
        strokeWidth={strokeWidth}
      />
      <circle
        cx="20"
        cy="20"
        r="16"
        fill="none"
        stroke="#FBBF24"
        strokeWidth={strokeWidth}
        strokeDasharray="80"
        strokeDashoffset="60"
        strokeLinecap="round"
      />
    </svg>
  );
}

