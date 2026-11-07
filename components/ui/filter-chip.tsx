"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number | string;
  icon?: React.ReactNode;
  className?: string;
}

export function FilterChip({
  label,
  isActive,
  onClick,
  count,
  icon,
  className,
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border whitespace-nowrap active:scale-95",
        isActive
          ? "bg-amber-400 text-black border-amber-300 font-semibold shadow-md shadow-amber-500/20"
          : "bg-[#111827] text-[#9CA3AF] border-white/10 hover:text-white hover:border-white/20 hover:bg-[#161F2E]",
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "px-1.5 py-0.2 rounded text-[10px]",
            isActive ? "bg-black/20 text-black font-bold" : "bg-white/10 text-[#9CA3AF]"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
