"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  MapPin,
  Film,
  Users,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Clock,
  DollarSign,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TheatreSearchResultItem } from "@/types/theatre-search.types";
import { cn } from "@/utils";

interface TheatreSearchCardProps {
  theatre: TheatreSearchResultItem;
  className?: string;
}

export function TheatreSearchCard({ theatre, className }: TheatreSearchCardProps) {
  // Format localized currency amount helper
  const formatCurrency = (amount?: number) => {
    if (typeof amount !== "number") return null;
    const symbol = theatre.configuration.currencySymbol;
    if (theatre.configuration.numberFormat === "INDIAN") {
      return `${symbol}${amount.toLocaleString("en-IN")}`;
    }
    return `${symbol}${amount.toLocaleString("en-US")}`;
  };

  // Status badge variant mapper
  const getStatusBadge = () => {
    switch (theatre.status) {
      case "ACTIVE":
        return <Badge variant="success" size="sm">Active</Badge>;
      case "PENDING_APPROVAL":
        return <Badge variant="warning" size="sm">Pending Approval</Badge>;
      case "SUSPENDED":
        return <Badge variant="danger" size="sm">Suspended</Badge>;
      case "ARCHIVED":
        return <Badge variant="secondary" size="sm">Archived</Badge>;
      case "DRAFT":
      default:
        return <Badge variant="info" size="sm">Draft</Badge>;
    }
  };

  return (
    <Card
      variant="elevated"
      className={cn(
        "group relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#131D31] to-[#0A101D] border border-[#2A3445] hover:border-[#F59E0B]/50 transition-all duration-300 hover:shadow-2xl flex flex-col justify-between p-5 rounded-2xl",
        className
      )}
    >
      <div>
        {/* Top Header: Logo, Name, Badges */}
        <div className="flex items-start gap-3.5 justify-between">
          <div className="flex items-start gap-3 min-w-0">
            {/* Logo / Thumbnail */}
            <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-[#1E293B] border border-[#334155] flex-shrink-0 flex items-center justify-center group-hover:border-[#F59E0B]/40 transition-colors">
              {theatre.logoUrl ? (
                <img
                  src={theatre.logoUrl}
                  alt={theatre.theatreName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-6 w-6 text-[#94A3B8] group-hover:text-[#F59E0B] transition-colors" />
              )}
            </div>

            {/* Name, Slug & Badges */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base font-bold text-white group-hover:text-[#F59E0B] transition-colors truncate">
                  {theatre.theatreName}
                </h3>
                {theatre.isVerified && (
                  <span title="Verified Enterprise Complex">
                    <ShieldCheck className="h-4 w-4 text-[#22C55E]" />
                  </span>
                )}
              </div>

              <div className="text-xs text-[#94A3B8] flex items-center gap-2 mt-0.5 truncate">
                <span className="font-mono text-[11px] text-[#64748B]">{theatre.theatreCode}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#CBD5E1]">
                  <MapPin className="h-3 w-3 text-[#F59E0B]" />
                  {theatre.city}, {theatre.state}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0">
            {getStatusBadge()}
          </div>
        </div>

        {/* Chain & Business Category Tags */}
        <div className="flex items-center gap-1.5 flex-wrap mt-3.5">
          <Badge variant="secondary" size="sm" className="text-[10px] uppercase font-mono tracking-wider">
            {theatre.theatreType}
          </Badge>
          {theatre.chainName && (
            <Badge variant="outline" size="sm" className="text-[10px] text-sky-400 border-sky-500/30">
              {theatre.chainName}
            </Badge>
          )}
          <span className="text-[11px] text-[#64748B] font-medium px-1">
            {theatre.businessCategory.replace(/_/g, " ")}
          </span>
        </div>

        {/* Key Metrics: Screens & Capacity */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-[#111A2E]/70 rounded-xl border border-[#1E293B]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#1E293B] text-[#F59E0B]">
              <Film className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-mono">
                {theatre.screensCount} Screens
              </div>
              <div className="text-[10px] text-[#64748B] uppercase">Auditoriums</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#1E293B] text-[#38BDF8]">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-mono">
                {theatre.totalCapacity.toLocaleString()} Seats
              </div>
              <div className="text-[10px] text-[#64748B] uppercase">Total Capacity</div>
            </div>
          </div>
        </div>

        {/* Amenities Pills */}
        {theatre.amenitiesSummary.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-3.5">
            {theatre.amenitiesSummary.map((amn) => (
              <span
                key={amn}
                className="px-2 py-0.5 rounded-md bg-[#1E293B]/60 border border-[#334155]/50 text-[10px] font-medium text-[#CBD5E1]"
              >
                {amn}
              </span>
            ))}
          </div>
        )}

        {/* Match Highlights (if search query matched specific fields) */}
        {theatre.matchHighlights && theatre.matchHighlights.length > 0 && (
          <div className="mt-3 text-[11px] text-[#F59E0B] flex items-center gap-1 bg-[#F59E0B]/10 px-2 py-1 rounded-lg border border-[#F59E0B]/20">
            <Sparkles className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">
              Matches: <strong className="font-semibold">{theatre.matchHighlights.join(", ")}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-5 pt-3.5 border-t border-[#1E293B] flex items-center justify-between text-xs text-[#94A3B8]">
        {/* Primary Admin & Timezone */}
        <div className="flex items-center gap-2 truncate">
          <UserCheck className="h-3.5 w-3.5 text-[#64748B]" />
          <span className="truncate">{theatre.primaryAdmin.name}</span>
          <span className="text-[#64748B]">•</span>
          <span className="font-mono text-[10px] text-[#64748B]">{theatre.configuration.currency}</span>
        </div>

        {/* Deep Link Button */}
        <Link
          href={`/theatres?slug=${theatre.theatreSlug}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#F59E0B] hover:text-white transition-colors group/link ml-2 flex-shrink-0"
        >
          View
          <ChevronRight className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </Card>
  );
}
