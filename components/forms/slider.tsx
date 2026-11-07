"use client";

import React from "react";
import { cn } from "@/utils";

export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
  label?: string;
  unit?: string;
  disabled?: boolean;
  className?: string;
}

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  label,
  unit = "",
  disabled = false,
  className,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full space-y-2", className)}>
      {(label || unit) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="font-semibold text-[#CBD5E1]">{label}</span>}
          <span className="font-mono font-bold text-[#FBBF24]">
            {value}
            {unit}
          </span>
        </div>
      )}

      <div className="relative flex items-center w-full">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[#2A3445] accent-[#FBBF24] focus:outline-none disabled:opacity-40"
        />
      </div>
    </div>
  );
}

