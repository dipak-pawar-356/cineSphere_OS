"use client";

import React from "react";
import { PublicTheatreView } from "@/types/public-theatre.types";
import { AmenityIconResolver } from "@/components/theatre-amenity/amenity-icon-resolver";
import { Sparkles, Utensils, Car, Accessibility, Monitor, Armchair, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface PublicTheatreAmenitiesSectionProps {
  theatre: PublicTheatreView;
}

export function PublicTheatreAmenitiesSection({ theatre }: PublicTheatreAmenitiesSectionProps) {
  const { amenities } = theatre;

  if (amenities.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#FBBF24]" />
            <span>Amenities, Comfort & Guest Facilities</span>
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Multiplex amenities designed for patron comfort, accessibility, and luxury cinema dining.
          </p>
        </div>

        <span className="text-xs font-mono text-[#94A3B8] bg-[#111827] px-2.5 py-1 rounded-lg border border-[#2A3445]">
          {amenities.length} Verified Facilities
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {amenities.map((am) => (
          <div
            key={am.id}
            className="p-5 rounded-2xl bg-[#111827] border border-[#2A3445] flex items-start gap-4 hover:border-zinc-700 transition-all"
          >
            <div className="h-10 w-10 rounded-xl bg-[#161F2E] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] shrink-0">
              <AmenityIconResolver iconName={am.icon} className="h-5 w-5" />
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-white truncate">{am.name}</h4>
                {am.isFeatured && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
                    ★ Featured
                  </span>
                )}
              </div>

              <span className="inline-block text-[10px] text-[#38BDF8] font-semibold uppercase tracking-wider">
                {am.category}
              </span>

              {am.description && (
                <p className="text-xs text-[#94A3B8] line-clamp-2">{am.description}</p>
              )}

              {am.notes && (
                <p className="text-[11px] text-[#FBBF24] font-medium pt-0.5">
                  📍 {am.notes}
                </p>
              )}

              {am.metadata && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-zinc-400">
                  {am.metadata.parkingCapacity && (
                    <span className="bg-[#0B1220] px-1.5 py-0.5 rounded border border-[#1E293B]">
                      {am.metadata.parkingCapacity} Bays
                    </span>
                  )}
                  {am.metadata.evChargerCount && (
                    <span className="bg-[#0B1220] px-1.5 py-0.5 rounded border border-[#1E293B] text-emerald-400">
                      {am.metadata.evChargerCount} EV Fast Chargers
                    </span>
                  )}
                  {am.metadata.wifiSsid && (
                    <span className="bg-[#0B1220] px-1.5 py-0.5 rounded border border-[#1E293B] text-sky-400">
                      Wi-Fi: {am.metadata.wifiSsid}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
