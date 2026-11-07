"use client";

import React, { useState, useRef } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";
import { AVAILABLE_CITIES } from "@/lib/constants/navigation";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { cn } from "@/lib/utils";

export function LocationSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(AVAILABLE_CITIES[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
        aria-label="Select city"
      >
        <MapPin className="h-3.5 w-3.5 text-amber-400" />
        <span className="font-semibold text-white/90">{selectedCity.name}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-[#9CA3AF] transition-transform duration-200",
            isOpen && "rotate-180 text-amber-400"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:left-0 mt-2 w-56 rounded-xl bg-[#111827] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] border-b border-white/5 mb-1">
            Select Your Region
          </div>
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {AVAILABLE_CITIES.map((city) => {
              const isSelected = city.id === selectedCity.id;
              return (
                <button
                  key={city.id}
                  onClick={() => {
                    setSelectedCity(city);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left",
                    isSelected
                      ? "bg-amber-400/15 text-amber-400 font-semibold"
                      : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-amber-400/80" />
                    <span>
                      {city.name}, {city.state}
                    </span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
