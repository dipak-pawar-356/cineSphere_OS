"use client";

import React, { useState, useRef } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/utils";

export interface MultiSelectProps {
  options: { label: string; value: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = "Select multiple options...",
  disabled = false,
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const removeValue = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== val));
  };

  return (
    <div className={cn("relative w-full", className)} ref={ref}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full min-h-[40px] px-3 py-1.5 rounded-lg bg-[#111827] border border-[#2A3445] transition-all flex flex-wrap items-center justify-between gap-1.5 cursor-pointer",
          isOpen && "border-[#FBBF24]/60 ring-1 ring-[#FBBF24]/30",
          disabled && "opacity-40 cursor-not-allowed bg-[#0B1220]"
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedValues.length === 0 ? (
            <span className="text-xs text-[#94A3B8]/70">{placeholder}</span>
          ) : (
            selectedValues.map((val) => {
              const label = options.find((o) => o.value === val)?.label || val;
              return (
                <span
                  key={val}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#161F2E] border border-[#2A3445] text-[#F9FAFB] text-[11px] font-medium"
                >
                  <span>{label}</span>
                  <X
                    className="h-3 w-3 hover:text-red-400 cursor-pointer"
                    onClick={(e) => removeValue(e, val)}
                  />
                </span>
              );
            })
          )}
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-[#94A3B8] ml-auto transition-transform duration-150",
            isOpen && "rotate-180 text-[#FBBF24]"
          )}
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full rounded-xl bg-[#111827] border border-[#2A3445] shadow-[0_12px_40px_rgb(0,0,0,0.5)] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-56 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = selectedValues.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleOption(opt.value)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left",
                  isSelected
                    ? "bg-[#FBBF24]/15 text-[#FBBF24] font-semibold"
                    : "text-[#CBD5E1] hover:text-[#F9FAFB] hover:bg-[#161F2E]"
                )}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-[#FBBF24]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

