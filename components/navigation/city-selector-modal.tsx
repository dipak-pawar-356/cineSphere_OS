"use client";

import React, { useState } from "react";
import { Modal } from "@/components/dialogs/modal";
import { useCityStore } from "@/store/city-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Search,
  Crosshair,
  Sparkles,
  Building2,
  CheckCircle2,
  Check,
  Compass,
} from "lucide-react";
import { cn } from "@/utils";

export function CitySelectorModal() {
  const {
    cities,
    selectedCity,
    recentCities,
    isCityModalOpen,
    setSelectedCity,
    setCityModalOpen,
    detectLocation,
  } = useCityStore();

  const [search, setSearch] = useState("");
  const [detectNotice, setDetectNotice] = useState<string | null>(null);

  const filteredCities = cities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase())
  );

  const popularCities = cities.filter((c) => c.isPopular);

  const handleSelect = (city: (typeof cities)[0]) => {
    setSelectedCity(city);
    setSearch("");
    setDetectNotice(null);
  };

  const handleDetect = () => {
    const res = detectLocation();
    setDetectNotice(res.message);
    setTimeout(() => {
      setDetectNotice(null);
    }, 4000);
  };

  return (
    <Modal
      isOpen={isCityModalOpen}
      onClose={() => {
        setCityModalOpen(false);
        setSearch("");
        setDetectNotice(null);
      }}
      size="lg"
      title="Select Your Cinema Circuit City"
      description="Choose your city to discover current theatrical releases, certified multiplexes, and live show schedules."
    >
      <div className="space-y-5">
        {/* Search Bar + Location Auto-Detect Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by city name (e.g. Pune, Mumbai, Bengaluru)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-xs"
              autoFocus
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDetect}
            className="w-full sm:w-auto shrink-0 gap-2 border-amber-400/40 text-amber-300 hover:bg-amber-400/10"
          >
            <Crosshair className="w-4 h-4 text-amber-400" />
            <span>Detect My City</span>
          </Button>
        </div>

        {detectNotice && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{detectNotice}</span>
          </div>
        )}

        {/* Recent Searches */}
        {recentCities.length > 0 && !search && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Recent Circuit Cities</span>
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {recentCities.map((cityName) => {
                const found = cities.find((c) => c.name === cityName);
                const isSelected = selectedCity.name === cityName;
                return (
                  <button
                    key={cityName}
                    type="button"
                    onClick={() => found && handleSelect(found)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer",
                      isSelected
                        ? "bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-sm"
                        : "bg-[#111827] text-slate-300 border-[#2A3445] hover:border-slate-500"
                    )}
                  >
                    <span>{cityName}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Popular Cities Quick Grid */}
        {!search && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Popular Entertainment Hubs</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {popularCities.map((city) => {
                const isSelected = selectedCity.id === city.id;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelect(city)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all cursor-pointer group flex flex-col justify-between",
                      isSelected
                        ? "bg-amber-400/10 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.1)]"
                        : "bg-[#0B0F17] border-[#2A3445] hover:border-slate-500 hover:bg-[#161F2E]"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={cn(
                          "text-xs font-bold transition-colors",
                          isSelected ? "text-amber-400" : "text-slate-200 group-hover:text-amber-300"
                        )}
                      >
                        {city.name}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">
                      {city.theatreCount} Theatres • {city.screenCount} Screens
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* All / Filtered Cities List */}
        <div className="space-y-2 pt-2 border-t border-[#2A3445]/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{search ? `Search Results (${filteredCities.length})` : "All Circuit Cities"}</span>
          </span>

          <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {filteredCities.map((city) => {
              const isSelected = selectedCity.id === city.id;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className={cn(
                    "w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors cursor-pointer text-left",
                    isSelected
                      ? "bg-amber-400/15 text-amber-300 border border-amber-400/40"
                      : "hover:bg-[#161F2E] text-slate-300"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-100">{city.name}</span>
                      <span className="text-slate-400 text-[11px] ml-1.5">({city.state})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">
                      {city.theatreCount} complexes
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                </button>
              );
            })}

            {filteredCities.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No cinema circuits found matching &ldquo;{search}&rdquo;. Try another city name.
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

