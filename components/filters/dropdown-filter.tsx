"use client";

import React, { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/utils";

export interface DropdownFilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface DropdownFilterProps {
  label: string;
  options: DropdownFilterOption[];
  selectedValue?: string;
  onSelect?: (val: string) => void;
  className?: string;
}

/**
 * Enterprise Dropdown Filter
 * Compact popover filter selector with active checkmarks.
 */
export function DropdownFilter({
  label,
  options,
  selectedValue,
  onSelect,
  className,
}: DropdownFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((o) => o.value === selectedValue);

  return (
    <div className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-[#CBD5E1] hover:border-[#FBBF24]/50 transition-colors"
      >
        <span className="text-[#94A3B8]">{label}:</span>
        <span className="font-bold text-white">{selectedOption ? selectedOption.label : "All"}</span>
        <ChevronDown className="h-3 w-3 text-[#64748B]" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-48 rounded-xl bg-[#161F2E] border border-[#2A3445] shadow-xl p-1.5 z-50 text-xs space-y-0.5">
          {options.map((opt) => {
            const isSelected = opt.value === selectedValue;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onSelect?.(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors",
                  isSelected
                    ? "bg-[#FBBF24] text-[#070B12] font-bold"
                    : "text-[#CBD5E1] hover:bg-[#111827] hover:text-white"
                )}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

