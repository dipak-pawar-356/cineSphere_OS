"use client";

import React from "react";
import Image from "next/image";
import { Star, MapPin, Monitor, CheckCircle, Shield } from "lucide-react";
import { Theatre } from "@/lib/types";
import { FormatBadge } from "@/components/badges/format-badge";
import { ComingSoonButton } from "@/components/buttons/coming-soon-button";
import { cn } from "@/lib/utils";

export interface TheatreCardProps {
  theatre: Theatre;
  className?: string;
}

export function TheatreCard({ theatre, className }: TheatreCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl bg-[#161F2E]/90 border border-white/5 hover:border-amber-400/30 transition-all duration-300 shadow-xl overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-500/5",
        className
      )}
    >
      {/* Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-[#070B12]">
        <Image
          src={theatre.banner}
          alt={theatre.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161F2E] via-black/40 to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-amber-400/30 text-amber-400 text-xs font-bold shadow-lg">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{theatre.rating.toFixed(1)}</span>
            <span className="text-[10px] text-[#9CA3AF] font-normal">
              ({theatre.reviewsCount})
            </span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/75 backdrop-blur-md text-amber-300 border border-amber-400/25">
            {theatre.pricingTier}
          </span>
        </div>

        {/* Chain Logo Avatar badge */}
        <div className="absolute -bottom-4 left-5 flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black text-sm flex items-center justify-center border-2 border-[#161F2E] shadow-xl">
            {theatre.logo}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 drop-shadow-md">
            {theatre.chain}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-5 pt-7">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
            {theatre.name}
          </h3>

          <div className="mt-2 flex items-start gap-1.5 text-xs text-[#9CA3AF]">
            <MapPin className="h-3.5 w-3.5 text-amber-400/80 shrink-0 mt-0.5" />
            <span className="line-clamp-1">
              {theatre.address}, {theatre.city}, {theatre.state}
            </span>
          </div>

          {/* Formats & Halls */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9CA3AF] px-2 py-0.5 rounded bg-white/5 border border-white/10">
              <Monitor className="h-3 w-3 text-amber-400" />
              {theatre.hallCount} Screens
            </span>
            {theatre.screenTypes.map((type) => (
              <FormatBadge key={type} format={type} size="xs" />
            ))}
          </div>

          {/* Key Facilities */}
          <div className="mt-4 space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9CA3AF]/80">
              Key Facilities
            </span>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-[#9CA3AF]">
              {theatre.facilities.slice(0, 4).map((f) => (
                <div key={f} className="flex items-center gap-1.5 truncate">
                  <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
          <div className="text-xs text-[#9CA3AF]">
            {theatre.distanceKm ? (
              <span>
                <strong className="text-white">{theatre.distanceKm} km</strong> away
              </span>
            ) : (
              <span>Active</span>
            )}
          </div>

          <ComingSoonButton
            featureName={`Showtimes at ${theatre.name}`}
            description={`Viewing live schedule and hall layout for ${theatre.name} is scheduled for Phase 2.`}
            size="sm"
            variant="primary"
            label="View Shows"
          />
        </div>
      </div>
    </div>
  );
}
