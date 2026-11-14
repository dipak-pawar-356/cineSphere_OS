"use client";

import React from "react";
import { ArrowUpDown, Check } from "lucide-react";
import { TheatreSearchSortOption } from "@/types/theatre-search.types";
import { cn } from "@/utils";

interface TheatreSearchSortDropdownProps {
  value: TheatreSearchSortOption;
  onChange: (sort: TheatreSearchSortOption) => void;
  className?: string;
}

const SORT_OPTIONS: { id: TheatreSearchSortOption; label: string }[] = [
  { id: "NEWEST", label: "Newest Added First" },
  { id: "OLDEST", label: "Oldest Added First" },
  { id: "NAME_ASC", label: "Alphabetical: A to Z" },
  { id: "NAME_DESC", label: "Alphabetical: Z to A" },
  { id: "MOST_SCREENS", label: "Most Screens First" },
  { id: "LARGEST_CAPACITY", label: "Largest Capacity First" },
  { id: "RECENTLY_UPDATED", label: "Recently Updated" },
];

export function TheatreSearchSortDropdown({
  value,
  onChange,
  className,
}: TheatreSearchSortDropdownProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-xs text-[#94A3B8] font-medium hidden sm:inline-flex items-center gap-1">
        <ArrowUpDown className="h-3.5 w-3.5 text-[#F59E0B]" />
        Sort:
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TheatreSearchSortOption)}
        className="bg-[#0F172A] border border-[#2A3445] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#F59E0B] transition-colors cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id} className="bg-[#0F172A] text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
