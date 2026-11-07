"use client";

import React from "react";
import { cn } from "@/utils";

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presetColors?: string[];
  label?: string;
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  presetColors = ["#FBBF24", "#2563EB", "#22C55E", "#EF4444", "#38BDF8", "#F59E0B", "#A855F7"],
  label,
  className,
}: ColorPickerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="block text-xs font-semibold text-[#CBD5E1]">{label}</label>}

      <div className="flex items-center gap-2">
        {presetColors.map((col) => {
          const isSelected = col.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={col}
              type="button"
              onClick={() => onChange(col)}
              style={{ backgroundColor: col }}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-transform cursor-pointer",
                isSelected
                  ? "border-white scale-110 shadow-md ring-2 ring-white/30"
                  : "border-[#2A3445] hover:scale-105"
              )}
              aria-label={`Select color ${col}`}
            />
          );
        })}

        <div className="relative ml-2 flex items-center">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-8 rounded-lg cursor-pointer bg-transparent border border-[#2A3445]"
          />
        </div>
      </div>
    </div>
  );
}

