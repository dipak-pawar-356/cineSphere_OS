"use client";

import React, { useState, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  disabled = false,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const selectedOpt = options.find((o) => o.value === value);

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-10 px-3.5 rounded-lg bg-[#111827] text-left text-xs sm:text-sm border border-[#2A3445] transition-all flex items-center justify-between cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBBF24]/50 focus-visible:border-[#FBBF24]/60",
          isOpen && "border-[#FBBF24]/60 ring-1 ring-[#FBBF24]/30",
          disabled && "opacity-40 cursor-not-allowed bg-[#0B1220]"
        )}
      >
        <span className={selectedOpt ? "text-[#F9FAFB] font-medium" : "text-[#94A3B8]/70"}>
          {selectedOpt ? selectedOpt.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[#94A3B8] transition-transform duration-150",
            isOpen && "rotate-180 text-[#FBBF24]"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full rounded-xl bg-[#111827] border border-[#2A3445] shadow-[0_12px_40px_rgb(0,0,0,0.5)] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-56 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange?.(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left",
                  isSelected
                    ? "bg-[#FBBF24]/15 text-[#FBBF24] font-bold"
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

