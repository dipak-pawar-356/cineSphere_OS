"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
  size?: "md" | "lg";
}

export function SearchBar({
  value = "",
  onChange,
  placeholder = "Search movies, theatres, events, experiences...",
  className,
  onClear,
  size = "md",
}: SearchBarProps) {
  const [internalVal, setInternalVal] = React.useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalVal(e.target.value);
    onChange?.(e.target.value);
  };

  const handleClear = () => {
    setInternalVal("");
    onChange?.("");
    onClear?.();
  };

  return (
    <div
      className={cn(
        "relative flex items-center w-full rounded-xl bg-[#111827] border border-white/10 transition-all focus-within:border-amber-400/50 focus-within:ring-2 focus-within:ring-amber-400/20 shadow-inner",
        size === "lg" ? "h-14 px-4" : "h-11 px-3.5",
        className
      )}
    >
      <Search
        className={cn(
          "shrink-0 text-[#9CA3AF] mr-3 transition-colors",
          size === "lg" ? "h-5 w-5" : "h-4 w-4"
        )}
      />
      <input
        type="text"
        value={value !== undefined ? value : internalVal}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF]/70 focus:outline-none"
      />
      {(value || internalVal) && (
        <button
          type="button"
          onClick={handleClear}
          className="p-1 rounded-full text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-colors ml-2"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
