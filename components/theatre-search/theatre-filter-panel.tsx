"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Building,
  Sparkles,
  ShieldCheck,
  Film,
  Layers,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TheatreSearchFilters, FacetBucket } from "@/types/theatre-search.types";
import { cn } from "@/utils";

interface TheatreFilterPanelProps {
  filters: TheatreSearchFilters;
  onChange: (updatedFilters: TheatreSearchFilters) => void;
  onReset: () => void;
  facets?: {
    cities: FacetBucket[];
    states: FacetBucket[];
    countries: FacetBucket[];
    statuses: FacetBucket[];
    businessCategories: FacetBucket[];
    theatreTypes: FacetBucket[];
    amenities: FacetBucket[];
    currencies: FacetBucket[];
  };
  className?: string;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

export function TheatreFilterPanel({
  filters,
  onChange,
  onReset,
  facets,
  className,
  isMobileDrawer = false,
  onCloseMobile,
}: TheatreFilterPanelProps) {
  // Section toggle state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    status: true,
    location: true,
    classification: true,
    amenities: true,
    capacity: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Status toggle handler
  const handleToggleStatus = (statusValue: any) => {
    const current = filters.statuses || [];
    const updated = current.includes(statusValue)
      ? current.filter((s) => s !== statusValue)
      : [...current, statusValue];
    onChange({ ...filters, statuses: updated.length > 0 ? updated : undefined });
  };

  // City toggle handler
  const handleToggleCity = (city: string) => {
    const current = filters.cities || [];
    const updated = current.includes(city)
      ? current.filter((c) => c !== city)
      : [...current, city];
    onChange({ ...filters, cities: updated.length > 0 ? updated : undefined });
  };

  // State toggle handler
  const handleToggleState = (stateName: string) => {
    const current = filters.states || [];
    const updated = current.includes(stateName)
      ? current.filter((s) => s !== stateName)
      : [...current, stateName];
    onChange({ ...filters, states: updated.length > 0 ? updated : undefined });
  };

  // Amenity toggle handler
  const handleToggleAmenity = (amenity: string) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    onChange({ ...filters, amenities: updated.length > 0 ? updated : undefined });
  };

  // Business Category toggle handler
  const handleToggleCategory = (cat: string) => {
    const current = filters.businessCategories || [];
    const updated = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    onChange({ ...filters, businessCategories: updated.length > 0 ? updated : undefined });
  };

  const activeFiltersCount =
    (filters.statuses?.length || 0) +
    (filters.cities?.length || 0) +
    (filters.states?.length || 0) +
    (filters.amenities?.length || 0) +
    (filters.businessCategories?.length || 0) +
    (filters.theatreType && filters.theatreType !== "ALL" ? 1 : 0) +
    (filters.chainType && filters.chainType !== "ALL" ? 1 : 0) +
    (typeof filters.isVerified === "boolean" ? 1 : 0) +
    (typeof filters.screensMin === "number" || typeof filters.screensMax === "number" ? 1 : 0);

  return (
    <div
      className={cn(
        "bg-[#0F172A]/90 border border-[#2A3445] rounded-2xl p-5 shadow-xl backdrop-blur-xl flex flex-col gap-5 text-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#F59E0B]" />
          <span className="font-bold text-white text-base">Filter Venues</span>
          {activeFiltersCount > 0 && (
            <Badge variant="primary" size="sm" className="ml-1 text-[11px] px-1.5 py-0 font-mono">
              {activeFiltersCount}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-[#94A3B8] hover:text-[#F59E0B] flex items-center gap-1 transition-colors font-medium"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}

          {isMobileDrawer && onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* 1. Lifecycle Status Section */}
      <div className="space-y-2.5 pb-4 border-b border-[#1E293B]">
        <button
          type="button"
          onClick={() => toggleSection("status")}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#94A3B8] hover:text-white"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#38BDF8]" />
            Lifecycle Status
          </span>
          {openSections.status ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {openSections.status && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { id: "ACTIVE", label: "Active", color: "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30" },
              { id: "PENDING_APPROVAL", label: "Pending", color: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30" },
              { id: "SUSPENDED", label: "Suspended", color: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30" },
              { id: "ARCHIVED", label: "Archived", color: "text-[#94A3B8] bg-[#94A3B8]/10 border-[#94A3B8]/30" },
              { id: "DRAFT", label: "Draft", color: "text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/30" },
            ].map((st) => {
              const isSelected = filters.statuses?.includes(st.id as any);
              const bucketCount = facets?.statuses?.find((b) => b.value === st.id)?.count;

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleToggleStatus(st.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5",
                    isSelected
                      ? cn("font-semibold", st.color)
                      : "bg-[#1E293B]/40 text-[#64748B] border-[#334155]/60 hover:text-white hover:border-[#475569]"
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  {st.label}
                  {typeof bucketCount === "number" && (
                    <span className="text-[10px] opacity-75 font-mono">({bucketCount})</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Geographical Location Section */}
      <div className="space-y-2.5 pb-4 border-b border-[#1E293B]">
        <button
          type="button"
          onClick={() => toggleSection("location")}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#94A3B8] hover:text-white"
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#22C55E]" />
            Cities & Regions
          </span>
          {openSections.location ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {openSections.location && (
          <div className="space-y-3 pt-1">
            {/* Cities Facets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase">Cities</span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {(facets?.cities || [
                  { value: "Pune", label: "Pune", count: 1 },
                  { value: "Mumbai", label: "Mumbai", count: 1 },
                  { value: "Dubai", label: "Dubai", count: 1 },
                  { value: "New Delhi", label: "New Delhi", count: 1 },
                  { value: "Bengaluru", label: "Bengaluru", count: 1 },
                  { value: "Panaji", label: "Panaji", count: 1 },
                  { value: "Kolkata", label: "Kolkata", count: 1 },
                ]).map((c) => {
                  const isSelected = filters.cities?.includes(c.value);
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => handleToggleCity(c.value)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1",
                        isSelected
                          ? "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40 font-semibold"
                          : "bg-[#1E293B]/40 text-[#94A3B8] border-[#334155]/60 hover:text-white hover:border-[#475569]"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      {c.label}
                      <span className="text-[10px] text-[#64748B] font-mono">({c.count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* States Facets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase">States / Territories</span>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {(facets?.states || [
                  { value: "Maharashtra", label: "Maharashtra", count: 2 },
                  { value: "Delhi", label: "Delhi", count: 1 },
                  { value: "Karnataka", label: "Karnataka", count: 1 },
                  { value: "Goa", label: "Goa", count: 1 },
                  { value: "West Bengal", label: "West Bengal", count: 1 },
                  { value: "Dubai", label: "Dubai", count: 1 },
                ]).map((st) => {
                  const isSelected = filters.states?.includes(st.value);
                  return (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => handleToggleState(st.value)}
                      className={cn(
                        "px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-all flex items-center gap-1",
                        isSelected
                          ? "bg-sky-500/15 text-sky-400 border-sky-500/40 font-semibold"
                          : "bg-[#1E293B]/30 text-[#94A3B8] border-[#334155]/40 hover:text-white"
                      )}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5" />}
                      {st.label}
                      <span className="text-[10px] text-[#64748B] font-mono">({st.count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Classification & Chain Type Section */}
      <div className="space-y-2.5 pb-4 border-b border-[#1E293B]">
        <button
          type="button"
          onClick={() => toggleSection("classification")}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#94A3B8] hover:text-white"
        >
          <span className="flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-[#F59E0B]" />
            Classification & Chain
          </span>
          {openSections.classification ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {openSections.classification && (
          <div className="space-y-3 pt-1">
            {/* Theatre Type: Premium vs Standard */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase">Theatre Type</span>
              <div className="grid grid-cols-3 gap-1 p-1 bg-[#1E293B]/60 rounded-xl border border-[#334155]/60 text-xs">
                {(["ALL", "PREMIUM", "STANDARD"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onChange({ ...filters, theatreType: t })}
                    className={cn(
                      "py-1.5 rounded-lg font-medium transition-all text-center",
                      (filters.theatreType || "ALL") === t
                        ? "bg-[#F59E0B] text-[#070B12] font-bold shadow-sm"
                        : "text-[#94A3B8] hover:text-white"
                    )}
                  >
                    {t === "ALL" ? "All" : t === "PREMIUM" ? "Premium" : "Standard"}
                  </button>
                ))}
              </div>
            </div>

            {/* Chain Type: Chain vs Independent */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase">Circuit Affiliation</span>
              <div className="grid grid-cols-3 gap-1 p-1 bg-[#1E293B]/60 rounded-xl border border-[#334155]/60 text-xs">
                {(["ALL", "CHAIN", "INDEPENDENT"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onChange({ ...filters, chainType: c })}
                    className={cn(
                      "py-1.5 rounded-lg font-medium transition-all text-center",
                      (filters.chainType || "ALL") === c
                        ? "bg-[#38BDF8] text-[#070B12] font-bold shadow-sm"
                        : "text-[#94A3B8] hover:text-white"
                    )}
                  >
                    {c === "ALL" ? "All" : c === "CHAIN" ? "Chain" : "Independent"}
                  </button>
                ))}
              </div>
            </div>

            {/* Verified Only Toggle */}
            <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-[#CBD5E1] select-none">
              <input
                type="checkbox"
                checked={filters.isVerified === true}
                onChange={(e) =>
                  onChange({ ...filters, isVerified: e.target.checked ? true : undefined })
                }
                className="rounded border-[#334155] text-[#F59E0B] focus:ring-[#F59E0B] bg-[#1E293B]"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#22C55E]" />
                Show Verified Venues Only
              </span>
            </label>
          </div>
        )}
      </div>

      {/* 4. Amenities & Experiences Section */}
      <div className="space-y-2.5 pb-4 border-b border-[#1E293B]">
        <button
          type="button"
          onClick={() => toggleSection("amenities")}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#94A3B8] hover:text-white"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#EC4899]" />
            Amenities & Formats
          </span>
          {openSections.amenities ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {openSections.amenities && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              "IMAX",
              "Dolby Atmos",
              "Laser",
              "VIP Lounge",
              "Butler",
              "Recliners",
              "Valet",
              "Food Court",
            ].map((amn) => {
              const isSelected = filters.amenities?.some((a) => a.toLowerCase().includes(amn.toLowerCase()));
              return (
                <button
                  key={amn}
                  type="button"
                  onClick={() => handleToggleAmenity(amn)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1",
                    isSelected
                      ? "bg-pink-500/15 text-pink-400 border-pink-500/40 font-semibold"
                      : "bg-[#1E293B]/40 text-[#94A3B8] border-[#334155]/60 hover:text-white hover:border-[#475569]"
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  {amn}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Screens & Capacity Ranges Section */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => toggleSection("capacity")}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#94A3B8] hover:text-white"
        >
          <span className="flex items-center gap-1.5">
            <Film className="h-3.5 w-3.5 text-amber-400" />
            Screens & Capacity
          </span>
          {openSections.capacity ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {openSections.capacity && (
          <div className="space-y-3 pt-1">
            {/* Screens Count Range */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase">Minimum Screens</span>
              <div className="grid grid-cols-4 gap-1">
                {[0, 3, 5, 8].map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...filters,
                        screensMin: filters.screensMin === min ? undefined : min,
                      })
                    }
                    className={cn(
                      "py-1 rounded text-xs border font-medium",
                      filters.screensMin === min
                        ? "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]"
                        : "bg-[#1E293B]/40 text-[#94A3B8] border-[#334155]"
                    )}
                  >
                    {min === 0 ? "Any" : `${min}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Capacity Range */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase">Minimum Capacity</span>
              <div className="grid grid-cols-4 gap-1">
                {[0, 500, 1000, 1500].map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...filters,
                        capacityMin: filters.capacityMin === cap ? undefined : cap,
                      })
                    }
                    className={cn(
                      "py-1 rounded text-xs border font-medium",
                      filters.capacityMin === cap
                        ? "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]"
                        : "bg-[#1E293B]/40 text-[#94A3B8] border-[#334155]"
                    )}
                  >
                    {cap === 0 ? "Any" : `${cap}+`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
