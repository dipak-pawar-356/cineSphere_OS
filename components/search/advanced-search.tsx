"use client";

import React, { useState } from "react";
import { Search, SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";

export interface AdvancedSearchProps {
  onApplyFilters?: (filters: any) => void;
  className?: string;
}

/**
 * Enterprise Advanced Search Panel Placeholder
 * Multi-dimensional query refinement including format, date, and city.
 */
export function AdvancedSearch({ onApplyFilters, className }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative inline-block", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        iconLeft={<SlidersHorizontal className="h-3.5 w-3.5 text-[#FBBF24]" />}
        className="text-xs"
      >
        <span>Advanced Search</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#161F2E] border border-[#2A3445] p-5 shadow-2xl z-50 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-[#FBBF24]" />
              <span>Filter Deep Query</span>
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#94A3B8] hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] text-[#94A3B8] font-semibold">Format Tier</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {["IMAX", "Dolby Atmos", "4DX", "ScreenX", "70mm"].map((fmt, i) => (
                  <Badge key={i} variant="outline" size="sm" className="cursor-pointer hover:border-[#FBBF24]">
                    {fmt}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#94A3B8] font-semibold">Target Metro Region</label>
              <select
                disabled
                className="w-full mt-1.5 px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white text-xs"
              >
                <option>All 12 Cities Circuit</option>
                <option>Mumbai</option>
                <option>Delhi NCR</option>
                <option>Bengaluru</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#2A3445]">
            <Button variant="ghost" size="xs" onClick={() => alert("Filters reset")}>
              <RotateCcw className="h-3 w-3 mr-1" /> Reset
            </Button>
            <Button
              variant="primary"
              size="xs"
              onClick={() => {
                setIsOpen(false);
                alert("Applied advanced query filters");
              }}
            >
              Apply Filter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

