"use client";

import React, { useState } from "react";
import { cn } from "@/utils";

export interface RangeFilterProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  unitPrefix?: string;
  unitSuffix?: string;
  defaultValue?: number;
  onChange?: (val: number) => void;
  className?: string;
}

/**
 * Enterprise Numeric / Slider Range Filter
 * Used for ticket pricing caps, minimum seating capacities, and occupancy thresholds.
 */
export function RangeFilter({
  label,
  min,
  max,
  step = 1,
  unitPrefix = "",
  unitSuffix = "",
  defaultValue,
  onChange,
  className,
}: RangeFilterProps) {
  const [val, setVal] = useState(defaultValue ?? max);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setVal(num);
    onChange?.(num);
  };

  return (
    <div className={cn("p-3.5 rounded-xl bg-[#111827] border border-[#2A3445] space-y-2 text-xs", className)}>
      <div className="flex items-center justify-between text-[#94A3B8]">
        <span className="font-semibold">{label}</span>
        <span className="font-mono font-bold text-white">
          {unitPrefix}{val}{unitSuffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={handleChange}
        className="w-full accent-[#FBBF24] cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
        <span>{unitPrefix}{min}{unitSuffix}</span>
        <span>{unitPrefix}{max}{unitSuffix}</span>
      </div>
    </div>
  );
}

