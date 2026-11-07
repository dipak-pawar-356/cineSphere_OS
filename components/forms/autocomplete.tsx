"use client";

import React, { useState, useRef } from "react";
import { Search, Check } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/utils";

export interface AutocompleteProps {
  options: string[];
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function Autocomplete({
  options,
  value = "",
  onChange,
  placeholder = "Search or type...",
  className,
}: AutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={cn("relative w-full", className)} ref={ref}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-[#94A3B8]" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange?.(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full h-10 pl-9 pr-3.5 rounded-lg bg-[#111827] text-xs sm:text-sm text-[#F9FAFB] placeholder:text-[#94A3B8]/60 border border-[#2A3445] focus:border-[#FBBF24]/60 focus:ring-1 focus:ring-[#FBBF24]/30 outline-none"
        />
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute left-0 top-full mt-1.5 w-full rounded-xl bg-[#111827] border border-[#2A3445] shadow-[0_12px_40px_rgb(0,0,0,0.5)] p-1 z-50 max-h-48 overflow-y-auto">
          {filtered.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setQuery(item);
                onChange?.(item);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs text-[#CBD5E1] hover:text-[#F9FAFB] hover:bg-[#161F2E] rounded-lg transition-colors cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
