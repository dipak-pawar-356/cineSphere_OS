"use client";

import React from "react";
import { cn } from "@/utils";

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
  className?: string;
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  disabled = false,
  className,
}: RadioGroupProps) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {options.map((opt) => {
        const isChecked = opt.value === value;
        return (
          <label
            key={opt.value}
            className={cn(
              "flex items-start gap-3 select-none cursor-pointer group p-2.5 rounded-lg border transition-all",
              isChecked
                ? "bg-[#161F2E] border-[#FBBF24]/50"
                : "bg-[#111827]/60 border-[#2A3445] hover:border-[#3B485E]",
              disabled && "opacity-40 cursor-not-allowed pointer-events-none"
            )}
          >
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isChecked}
                disabled={disabled}
                onChange={() => onChange?.(opt.value)}
                className="sr-only"
              />
              <div
                className={cn(
                  "h-4 w-4 rounded-full border transition-all flex items-center justify-center",
                  isChecked ? "border-[#FBBF24]" : "border-[#2A3445] group-hover:border-[#FBBF24]/60"
                )}
              >
                {isChecked && <div className="h-2 w-2 rounded-full bg-[#FBBF24]" />}
              </div>
            </div>

            <div className="text-left text-xs">
              <div className={cn("font-medium", isChecked ? "text-[#FBBF24]" : "text-[#F9FAFB]")}>
                {opt.label}
              </div>
              {opt.description && (
                <p className="text-[#94A3B8] text-[11px] mt-0.5">{opt.description}</p>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
