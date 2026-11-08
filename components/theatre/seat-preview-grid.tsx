"use client";

import React, { useState, useMemo } from "react";
import {
  GeneratedSeatTemplate,
  SeatTemplateContainer,
} from "@/types/seat-generation.types";
import { getCategoryDesignTokens } from "@/lib/constants/seating-design-system";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Info,
  Tv,
  Accessibility,
  Armchair,
  Sparkles,
  Crown,
  Star,
  CheckCircle2,
  X,
  Camera,
  Layers,
  RotateCcw,
} from "lucide-react";

interface SeatPreviewGridProps {
  template: SeatTemplateContainer;
  className?: string;
  onRegenerate?: () => void;
}

export function SeatPreviewGrid({
  template,
  className = "",
  onRegenerate,
}: SeatPreviewGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState("ALL");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");
  const [accessibilityOnly, setAccessibilityOnly] = useState(false);
  const [vipOnly, setVipOnly] = useState(false);
  const [reclinerOnly, setReclinerOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedSeat, setSelectedSeat] = useState<GeneratedSeatTemplate | null>(null);

  // Group seats by section
  const sectionGroups = useMemo(() => {
    const groups: Record<string, { summary: any; seats: GeneratedSeatTemplate[] }> = {};

    template.sectionsSummary.forEach((sec) => {
      groups[sec.sectionId] = {
        summary: sec,
        seats: [],
      };
    });

    template.seats.forEach((seat) => {
      if (groups[seat.sectionId]) {
        groups[seat.sectionId].seats.push(seat);
      }
    });

    return groups;
  }, [template]);

  // Filtered Seats
  const filteredSeats = useMemo(() => {
    return template.seats.filter((seat) => {
      // Search Seats, Sections, and Labels
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesLabel = seat.seatLabel.toLowerCase().includes(q);
        const matchesNumber = seat.seatNumber.toLowerCase().includes(q);
        const matchesSection = seat.sectionName.toLowerCase().includes(q);
        const matchesCategory = seat.seatCategory.toLowerCase().includes(q);
        if (!matchesLabel && !matchesNumber && !matchesSection && !matchesCategory) return false;
      }

      // Section Filter
      if (selectedSectionFilter !== "ALL" && seat.sectionId !== selectedSectionFilter) {
        return false;
      }

      // Seat Type Filter
      if (selectedTypeFilter !== "ALL" && seat.seatType !== selectedTypeFilter) {
        return false;
      }

      // Status Filter
      if (statusFilter !== "ALL" && seat.status !== statusFilter) {
        return false;
      }

      // Quick Attribute Flags
      if (accessibilityOnly && !seat.accessibilityFlag && !seat.wheelchairFlag) {
        return false;
      }
      if (vipOnly && !seat.vipFlag) {
        return false;
      }
      if (reclinerOnly && !seat.reclinerFlag) {
        return false;
      }

      return true;
    });
  }, [template, searchQuery, selectedSectionFilter, selectedTypeFilter, statusFilter, accessibilityOnly, vipOnly, reclinerOnly]);

  // Aggregate Metrics
  const totalRecliners = template.seats.filter((s) => s.reclinerFlag).length;
  const totalVIP = template.seats.filter((s) => s.vipFlag).length;
  const totalWheelchair = template.seats.filter((s) => s.wheelchairFlag).length;
  const totalStandard = template.seats.length - totalRecliners - totalVIP - totalWheelchair;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Top Architectural Summary Bar */}
      <Card variant="elevated" className="p-4 bg-[#0F172A] border-[#1E293B] rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FBBF24]">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Generated Seat Template Matrix</h3>
                <Badge variant="success" size="sm" className="font-mono">
                  {template.totalGeneratedSeats} / {template.capacity} Seats Generated
                </Badge>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Deterministic seat templates are reused across thousands of future shows. Prices are injected dynamically per showtime.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="text-center px-3 py-1.5 rounded-lg bg-[#0B0F19] border border-[#1E293B]">
              <span className="text-[10px] text-[#64748B] block uppercase">Standard</span>
              <span className="font-bold text-white">{Math.max(0, totalStandard)}</span>
            </div>
            <div className="text-center px-3 py-1.5 rounded-lg bg-[#0B0F19] border border-[#1E293B]">
              <span className="text-[10px] text-[#64748B] block uppercase">VIP Tier</span>
              <span className="font-bold text-purple-400">{totalVIP}</span>
            </div>
            <div className="text-center px-3 py-1.5 rounded-lg bg-[#0B0F19] border border-[#1E293B]">
              <span className="text-[10px] text-[#64748B] block uppercase">Recliners</span>
              <span className="font-bold text-emerald-400">{totalRecliners}</span>
            </div>
            <div className="text-center px-3 py-1.5 rounded-lg bg-[#0B0F19] border border-[#1E293B]">
              <span className="text-[10px] text-[#64748B] block uppercase">Accessible</span>
              <span className="font-bold text-[#06B6D4]">{totalWheelchair}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Search & Filter Bar */}
      <div className="p-3.5 rounded-xl bg-[#0F172A] border border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748B]" />
            <Input
              type="text"
              placeholder="Search seat label (e.g. A1, B12)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-xs bg-[#0B0F19] border-[#2A3445] text-white"
            />
          </div>

          {/* Section Filter */}
          <select
            value={selectedSectionFilter}
            onChange={(e) => setSelectedSectionFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Sections ({template.sectionsSummary.length})</option>
            {template.sectionsSummary.map((sec) => (
              <option key={sec.sectionId} value={sec.sectionId}>
                {sec.sectionName} ({sec.seatCount} seats)
              </option>
            ))}
          </select>

          {/* Seat Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Seat Types</option>
            <option value="Standard">Standard</option>
            <option value="VIP">VIP</option>
            <option value="Recliner">Recliner</option>
            <option value="Wheelchair">Wheelchair</option>
          </select>

          {/* Seat Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Blocked">Blocked</option>
            <option value="Disabled">Disabled</option>
            <option value="Reserved">Reserved</option>
          </select>

          {/* Quick Attribute Toggles */}
          <button
            type="button"
            onClick={() => setVipOnly(!vipOnly)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
              vipOnly
                ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                : "bg-[#0B0F19] text-[#94A3B8] border-[#2A3445] hover:text-white"
            }`}
          >
            <Crown className="h-3 w-3" /> VIP
          </button>

          <button
            type="button"
            onClick={() => setReclinerOnly(!reclinerOnly)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
              reclinerOnly
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                : "bg-[#0B0F19] text-[#94A3B8] border-[#2A3445] hover:text-white"
            }`}
          >
            <Armchair className="h-3 w-3" /> Recliner
          </button>

          <button
            type="button"
            onClick={() => setAccessibilityOnly(!accessibilityOnly)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
              accessibilityOnly
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                : "bg-[#0B0F19] text-[#94A3B8] border-[#2A3445] hover:text-white"
            }`}
          >
            <Accessibility className="h-3 w-3" /> Accessible
          </button>

          {(searchQuery ||
            selectedSectionFilter !== "ALL" ||
            selectedTypeFilter !== "ALL" ||
            statusFilter !== "ALL" ||
            accessibilityOnly ||
            vipOnly ||
            reclinerOnly) && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => {
                setSearchQuery("");
                setSelectedSectionFilter("ALL");
                setSelectedTypeFilter("ALL");
                setStatusFilter("ALL");
                setAccessibilityOnly(false);
                setVipOnly(false);
                setReclinerOnly(false);
              }}
              className="text-[#94A3B8] hover:text-white gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Clear Filters
            </Button>
          )}
        </div>

        <div className="text-[11px] text-[#64748B] font-mono">
          Showing {filteredSeats.length} of {template.seats.length} seats
        </div>
      </div>

      {/* 3. Main Interactive Seat Grid Canvas */}
      <div className="relative p-6 sm:p-10 rounded-2xl bg-[#080C14] border border-[#1E293B] overflow-x-auto flex flex-col items-center min-w-full">
        {/* Cinema Curved Screen at Top */}
        <div className="w-full max-w-2xl relative mb-12 flex flex-col items-center">
          <div className="absolute -top-6 w-3/4 h-16 bg-gradient-to-b from-[#FBBF24]/20 to-transparent blur-xl pointer-events-none" />
          <div className="w-full h-8 flex items-center justify-center">
            <svg
              className="w-full h-10 overflow-visible"
              viewBox="0 0 600 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="screenGridBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#FBBF24" stopOpacity="1" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path
                d="M 20 24 Q 300 0 580 24"
                stroke="url(#screenGridBeam)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#94A3B8] font-bold mt-1">
            SCREEN / CURVED PROJECTION APERTURE (ALL EYES THIS WAY)
          </span>
        </div>

        {/* Section Groups & Physical Rows */}
        <div className="w-full max-w-4xl space-y-8 select-none">
          {Object.entries(sectionGroups)
            .filter(([secId]) => selectedSectionFilter === "ALL" || selectedSectionFilter === secId)
            .map(([secId, { summary, seats }]) => {
              const tokens = getCategoryDesignTokens(summary.category);

              // Group section seats by physical row
              const rowMap: Record<string, GeneratedSeatTemplate[]> = {};
              seats.forEach((seat) => {
                if (!rowMap[seat.row]) rowMap[seat.row] = [];
                rowMap[seat.row].push(seat);
              });

              return (
                <div key={secId} className="space-y-3">
                  {/* Section Title Banner */}
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: tokens.color }}
                      />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {summary.sectionName}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                        style={{
                          backgroundColor: `${tokens.color}20`,
                          color: tokens.color,
                        }}
                      >
                        {summary.category}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-[#94A3B8]">
                      <span>Labels: </span>
                      <span className="text-white font-bold">
                        {summary.firstSeatLabel} – {summary.lastSeatLabel}
                      </span>
                      <span className="text-[#64748B]"> ({summary.seatCount} seats)</span>
                    </div>
                  </div>

                  {/* Rows Grid */}
                  <div className="space-y-2.5 py-1">
                    {Object.entries(rowMap).map(([rowLetter, rowSeats]) => (
                      <div key={rowLetter} className="flex items-center justify-center gap-2">
                        {/* Left Row Indicator */}
                        <div className="w-6 text-center font-mono font-bold text-xs text-[#64748B]">
                          {rowLetter}
                        </div>

                        {/* Physical Seats in Row */}
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {rowSeats.map((seat) => {
                            const isMatch = filteredSeats.some((fs) => fs.id === seat.id);
                            const isSelected = selectedSeat?.id === seat.id;

                            return (
                              <button
                                key={seat.id}
                                type="button"
                                onClick={() => setSelectedSeat(seat)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setSelectedSeat(seat);
                                  }
                                }}
                                aria-label={`Seat ${seat.seatLabel}, Section ${seat.sectionName}, Category ${seat.seatCategory}, Status ${seat.status}`}
                                aria-pressed={isSelected}
                                tabIndex={isMatch ? 0 : -1}
                                className={`h-8 min-w-[34px] px-1.5 rounded-t-lg rounded-b border text-[11px] font-mono font-bold transition-all flex flex-col items-center justify-center focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 focus:ring-offset-[#080C14] ${
                                  !isMatch
                                    ? "opacity-20 pointer-events-none"
                                    : isSelected
                                    ? "bg-[#FBBF24] text-black border-white shadow-lg shadow-amber-400/40 scale-110 z-20"
                                    : "bg-[#111827] text-[#CBD5E1] hover:text-white hover:scale-105 active:scale-95"
                                }`}
                                style={{
                                  borderTopColor: isSelected ? undefined : tokens.color,
                                  borderTopWidth: isSelected ? "2px" : "3px",
                                }}
                                title={`${seat.seatLabel} • ${seat.sectionName} (${seat.seatCategory}) • Click or press Enter to inspect metadata`}
                              >
                                {seat.wheelchairFlag ? (
                                  <Accessibility className="h-3 w-3 text-[#06B6D4]" />
                                ) : (
                                  <span>{seat.seatLabel}</span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Right Row Indicator */}
                        <div className="w-6 text-center font-mono font-bold text-xs text-[#64748B]">
                          {rowLetter}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Center Aisle Guide Mark */}
        <div className="w-full max-w-4xl pt-8 border-t border-[#1E293B] mt-8 flex items-center justify-between text-[10px] font-mono text-[#64748B]">
          <span>Rear Concourse Egress</span>
          <span>Screen Centerline Aisle</span>
          <span>Sound Sweetspot (Rows D – G)</span>
        </div>
      </div>

      {/* 4. Dedicated Seat Inspector Card / Drawer */}
      {selectedSeat && (
        <Card variant="elevated" className="p-5 rounded-2xl bg-[#0F172A] border border-[#FBBF24]/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center font-mono font-black text-amber-400 text-sm">
                {selectedSeat.seatLabel}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Auditorium Seat Specification</span>
                  <Badge variant="outline" size="sm" className="font-mono text-amber-400 border-amber-400/30">
                    {selectedSeat.seatCategory}
                  </Badge>
                </h4>
                <p className="text-xs text-[#94A3B8]">
                  Immutable Seat Identifier: <span className="font-mono text-white">{selectedSeat.id}</span>
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setSelectedSeat(null)}
              className="h-8 w-8 p-0 text-[#94A3B8] hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B]">
              <span className="text-[10px] text-[#64748B] block uppercase">Physical Row & Col</span>
              <span className="text-sm font-bold text-white">Row {selectedSeat.row}, Col {selectedSeat.column}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B]">
              <span className="text-[10px] text-[#64748B] block uppercase">Sequence Order</span>
              <span className="text-sm font-bold text-[#FBBF24]">#{selectedSeat.displayOrder} of {template.capacity}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B]">
              <span className="text-[10px] text-[#64748B] block uppercase">3D Coordinates (X, Y, Z)</span>
              <span className="text-xs font-bold text-[#38BDF8]">
                [{selectedSeat.coordinates.x}m, {selectedSeat.coordinates.y}m, {selectedSeat.coordinates.z}m]
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B]">
              <span className="text-[10px] text-[#64748B] block uppercase">Pricing Rule</span>
              <span className="text-xs font-bold text-emerald-400">Dynamic (Assigned per Show)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-[11px]">
              <Camera className="h-3.5 w-3.5" />
              <span>3D Camera Eye Anchor:</span>
              <span className="text-white font-bold">
                [{selectedSeat.cameraAnchor.eyePosition.join(", ")}]
              </span>
              <span className="text-[#64748B]">FOV {selectedSeat.cameraAnchor.fov}°</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={selectedSeat.vipFlag ? "primary" : "secondary"} size="sm">
                VIP: {selectedSeat.vipFlag ? "Yes" : "No"}
              </Badge>
              <Badge variant={selectedSeat.reclinerFlag ? "success" : "secondary"} size="sm">
                Recliner: {selectedSeat.reclinerFlag ? "Yes" : "No"}
              </Badge>
              <Badge variant={selectedSeat.wheelchairFlag ? "info" : "secondary"} size="sm">
                Accessible: {selectedSeat.wheelchairFlag ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

