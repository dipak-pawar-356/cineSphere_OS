"use client";

import React from "react";
import { cn } from "@/utils";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: SwitchProps) {
  return (
    <label
      className={cn(
        "inline-flex items-center justify-between gap-4 select-none cursor-pointer group",
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
        className
      )}
    >
      {(label || description) && (
        <div className="text-left text-xs">
          {label && <div className="font-semibold text-[#F9FAFB]">{label}</div>}
          {description && (
            <p className="text-[#94A3B8] text-[11px] mt-0.5">{description}</p>
          )}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBBF24]/50",
          checked ? "bg-[#FBBF24]" : "bg-[#2A3445]"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#070B12] shadow-md transition duration-200 ease-in-out m-0.5",
            checked ? "translate-x-5 bg-[#070B12]" : "translate-x-0 bg-[#CBD5E1]"
          )}
        />
      </button>
    </label>
  );
}
