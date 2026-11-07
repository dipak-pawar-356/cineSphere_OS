"use client";

import React, { useState } from "react";
import { Search, Film, X } from "lucide-react";
import { cn } from "@/utils";

export interface MovieSearchProps {
  placeholder?: string;
  onSearch?: (val: string) => void;
  className?: string;
}

/**
 * Enterprise Movie Search Input
 * Styled specifically for film catalogs with rapid clear and format badge styling.
 */
export function MovieSearch({
  placeholder = "Search movies by title, director, actor or format...",
  onSearch,
  className,
}: MovieSearchProps) {
  const [val, setVal] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVal(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className={cn("relative w-full max-w-lg", className)}>
      <div className="relative flex items-center h-10 px-3.5 rounded-xl bg-[#111827] border border-[#2A3445] focus-within:border-[#FBBF24]/60 transition-colors">
        <Film className="h-4 w-4 text-[#FBBF24] mr-2.5 shrink-0" />
        <input
          type="text"
          value={val}
          onChange={handleChange}
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

