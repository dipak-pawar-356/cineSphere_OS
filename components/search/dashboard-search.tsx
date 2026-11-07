"use client";

import React from "react";
import { Search, Command } from "lucide-react";
import { cn } from "@/utils";

export interface DashboardSearchProps {
  onTrigger?: () => void;
  placeholder?: string;
  className?: string;
}

/**
 * Enterprise Dashboard Command Search Bar
 * Displays quick shortcut `⌘K` badge to open global command palette.
 */
export function DashboardSearch({
  onTrigger,
  placeholder = "Search across circuit, movies, bookings and telemetry...",
  className,
}: DashboardSearchProps) {
  return (
    <div
      onClick={onTrigger || (() => alert("Command palette shortcut: Press ⌘K (Placeholder)"))}
      className={cn(
        "group flex items-center justify-between w-full max-w-md px-3.5 py-2 rounded-xl bg-[#111827] border border-[#2A3445] hover:border-[#FBBF24]/50 cursor-pointer transition-colors text-xs",
        className
      )}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <Search className="h-3.5 w-3.5 text-[#64748B] group-hover:text-[#FBBF24] shrink-0" />
        <span className="text-xs text-[#94A3B8] truncate">{placeholder}</span>
      </div>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#070B12] border border-[#2A3445] text-[10px] font-mono text-[#94A3B8] shrink-0">
        ⌘K
      </kbd>
    </div>
  );
}

