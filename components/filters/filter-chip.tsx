"use client";

import React from "react";
import { cn } from "@/utils";
import { Check, X } from "lucide-react";

export interface FilterChipProps {
  label: string;
  active?: boolean;
  count?: number | string;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

/**
 * Enterprise Filter Chip
 * Interactive filter pill with count badge, check indicator, or removal cross.
 */
export function FilterChip({
  label,
  active = false,
  count,
  removable = false,
  onRemove,
  onClick,
  className,
  icon,
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold select-none transition-all duration-150 cursor-pointer border",
        active
          ? "bg-[#FBBF24] text-[#070B12] border-[#FBBF24] shadow-sm shadow-[#FBBF24]/20"
          : "bg-[#111827] text-[#94A3B8] border-[#2A3445] hover:text-[#F9FAFB] hover:border-[#3B485E]",
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {active && !icon && <Check className="h-3 w-3 stroke-[3]" />}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold leading-none",
            active ? "bg-[#070B12]/20 text-[#070B12]" : "bg-[#161F2E] text-[#CBD5E1]"
          )}
        >
          {count}
        </span>
      )}
      {removable && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="p-0.5 rounded-full hover:bg-black/20"
          aria-label="Remove filter"
        >
          <X className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}

