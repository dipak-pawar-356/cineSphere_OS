"use client";

import React, { useState } from "react";
import { Search, Building2, MapPin, X } from "lucide-react";
import { cn } from "@/utils";

export interface TheatreSearchProps {
  placeholder?: string;
  onSearch?: (val: string) => void;
  className?: string;
}

/**
 * Enterprise Theatre & Venue Search Input
 * Location-aware venue search with chain and city filtering support.
 */
export function TheatreSearch({
  placeholder = "Search multiplex by name, chain, mall or metro city...",
  onSearch,
  className,
}: TheatreSearchProps) {
  const [val, setVal] = useState("");

  return (
    <div className={cn("relative w-full max-w-lg", className)}>
      <div className="relative flex items-center h-10 px-3.5 rounded-xl bg-[#111827] border border-[#2A3445] focus-within:border-[#FBBF24]/60 transition-colors">
        <Building2 className="h-4 w-4 text-[#38BDF8] mr-2.5 shrink-0" />
        <input
          type="text"
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            onSearch?.(e.target.value);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-xs text-white placeholder-[#94A3B8]/60 focus:outline-none"
        />
        {val && (
          <button
            type="button"
            onClick={() => {
              setVal("");
              onSearch?.("");
            }}
            className="text-[#94A3B8] hover:text-white p-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

