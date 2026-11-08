"use client";

import React, { useState } from "react";
import { DynamicHallSectionConfig, Future3DHallConfig } from "@/types/hall.types";
import { getCategoryDesignTokens } from "@/lib/constants/seating-design-system";
import { Badge } from "@/components/ui/badge";
import {
  Tv,
  Camera,
  DoorClosed,
  Footprints,
  Info,
  Maximize2,
  Volume2,
  Sparkles,
  Accessibility,
} from "lucide-react";

interface HallPreview2DProps {
  hallName?: string;
  hallCode?: string;
  screenType?: string;
  capacity: number;
  sections: DynamicHallSectionConfig[];
  layout?: Future3DHallConfig;
  className?: string;
  show3DOverlay?: boolean;
}

export function HallPreview2D({
  hallName = "Auditorium Preview",
  hallCode = "AUD-01",
  screenType = "Laser 4K",
  capacity,
  sections = [],
  layout,
  className = "",
  show3DOverlay = true,
}: HallPreview2DProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [showCameraCone, setShowCameraCone] = useState(true);

  const totalConfiguredSeats = sections.reduce(
    (acc, sec) => acc + (Number(sec.seatCount) || 0),
    0
  );

  const activeSections = [...sections]
    .filter((s) => s.status !== "Disabled")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const selectedSection = activeSections.find((s) => s.id === selectedSectionId) || activeSections[0];

  return (
    <div
      className={`relative w-full rounded-2xl bg-[#0B0F19] border border-[#1E293B] overflow-hidden flex flex-col ${className}`}
    >
      {/* Top Architectural Blueprint Header */}
      <div className="px-5 py-3.5 bg-[#0F172A]/80 border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
            2D Floor Plan Schematic
          </span>
          <span className="text-[#334155]">•</span>
          <span className="text-xs font-semibold text-white">{hallName}</span>
          <Badge variant="outline" size="sm" className="font-mono text-[#FBBF24] border-[#FBBF24]/30">
            {hallCode}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-[#94A3B8]">
            <span className="font-mono text-white font-bold">{totalConfiguredSeats}</span> /
            <span className="font-mono text-[#64748B]">{capacity || 0}</span> Seats
          </div>
          {show3DOverlay && (
            <button
              type="button"
              onClick={() => setShowCameraCone(!showCameraCone)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 border ${
                showCameraCone
                  ? "bg-[#6366F1]/15 text-[#818CF8] border-[#6366F1]/40"
                  : "bg-[#1E293B] text-[#94A3B8] border-transparent hover:text-white"
              }`}
            >
              <Camera className="h-3 w-3" />
              <span>3D Camera Frustum</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Floor Plan Canvas */}
      <div className="relative p-6 sm:p-8 flex-1 flex flex-col items-center justify-center min-h-[380px] bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Cinema Curved Screen Representation at Top */}
        <div className="w-full max-w-xl relative mb-10 flex flex-col items-center">
          {/* Subtle Ambient Projection Glow */}
          <div className="absolute -top-8 w-3/4 h-16 bg-gradient-to-b from-[#38BDF8]/20 to-transparent blur-xl pointer-events-none" />

          {/* Curved Screen Architectural Arc */}
          <div className="relative w-full h-8 flex items-center justify-center">
            <svg
              className="w-full h-10 overflow-visible"
              viewBox="0 0 600 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="screenBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2" />
                  <stop offset="25%" stopColor="#818CF8" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#FBBF24" stopOpacity="1" />
                  <stop offset="75%" stopColor="#818CF8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path
                d="M 20 24 Q 300 0 580 24"
                stroke="url(#screenBeam)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#94A3B8] font-bold">
              SCREEN / CURVED PROJECTION PLANE ({screenType})
            </span>
          </div>

          {/* Audio Rig Output Channels */}
          <div className="w-full flex justify-between items-center px-4 mt-1.5 text-[9px] font-mono text-[#64748B]">
            <span className="flex items-center gap-1"><Volume2 className="h-2.5 w-2.5 text-[#38BDF8]" /> L-Channel</span>
            <span className="flex items-center gap-1"><Volume2 className="h-2.5 w-2.5 text-[#FBBF24]" /> C-Channel</span>
            <span className="flex items-center gap-1"><Volume2 className="h-2.5 w-2.5 text-[#38BDF8]" /> R-Channel</span>
          </div>

          {/* Emergency Exits: Front Stage */}
          <div className="w-full flex justify-between items-center px-1 -mt-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono">
              <DoorClosed className="h-2.5 w-2.5" /> EXIT 1
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono">
              EXIT 2 <DoorClosed className="h-2.5 w-2.5" />
            </div>
          </div>
        </div>

        {/* 3D Camera Frustum Wireframe Cone (Visualizer for future Three.js perspective) */}
        {show3DOverlay && showCameraCone && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <svg
              className="w-full h-full opacity-25"
              viewBox="0 0 800 500"
              fill="none"
              preserveAspectRatio="none"
            >
              {/* Camera Focal Cone */}
              <polygon
                points="400,440 100,60 700,60"
                fill="url(#camConeGrad)"
              />
              <defs>
                <linearGradient id="camConeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="400" y1="440" x2="100" y2="60" stroke="#818CF8" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="400" y1="440" x2="700" y2="60" stroke="#818CF8" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="400" cy="440" r="6" fill="#818CF8" />
            </svg>
            <div className="absolute bottom-6 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1E1B4B]/80 border border-[#6366F1]/50 text-[#C7D2FE] text-[10px] font-mono shadow-lg backdrop-blur-md">
              <Camera className="h-3 w-3 text-[#A5B4FC]" />
              <span>3D Camera Sweetspot (FOV 60° • Eye 1.2m)</span>
            </div>
          </div>
        )}

        {/* Dynamic Sections Stack (Rendered proportionally based on seat count) */}
        <div className="w-full max-w-xl space-y-3.5 z-10">
          {activeSections.length === 0 ? (
            <div className="py-12 px-6 rounded-2xl border border-dashed border-[#334155] bg-[#0F172A]/50 text-center space-y-2">
              <Sparkles className="h-8 w-8 text-[#64748B] mx-auto" />
              <p className="text-sm font-semibold text-white">No Sections Configured Yet</p>
              <p className="text-xs text-[#94A3B8]">
                Add dynamic sections below to calculate rows and view the live architectural layout.
              </p>
            </div>
          ) : (
            activeSections.map((sec, idx) => {
              const tokens = getCategoryDesignTokens(sec.category);
              const isSelected = selectedSectionId === sec.id || (!selectedSectionId && idx === 0);
              const percentage = capacity > 0 ? Math.round((sec.seatCount / capacity) * 100) : 0;
              const rowCount = sec.rows?.length || Math.ceil(sec.seatCount / (sec.seatsPerRow || 10));
              const firstRow = sec.rows?.[0] || "A";
              const lastRow = sec.rows?.[sec.rows.length - 1] || firstRow;

              return (
                <div
                  key={sec.id}
                  onClick={() => setSelectedSectionId(sec.id)}
                  style={{
                    minHeight: `${Math.max(52, Math.min(100, rowCount * 22))}px`,
                  }}
                  className={`group relative w-full rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `${tokens.bgClass} ${tokens.borderClass} ring-2 ring-[${tokens.color}]/40 shadow-lg`
                      : "bg-[#111827]/70 border-[#1E293B] hover:border-[#334155] hover:bg-[#161F2E]"
                  }`}
                >
                  {/* Left Color Indicator Accent */}
                  <div
                    className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r"
                    style={{ backgroundColor: tokens.color }}
                  />

                  {/* Section Top Meta */}
                  <div className="flex items-center justify-between gap-2 pl-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {sec.name}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${tokens.color}20`,
                          color: tokens.color,
                        }}
                      >
                        {sec.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">
                        {sec.seatCount} <span className="text-[10px] font-normal text-[#94A3B8]">Seats</span>
                      </span>
                      <Badge variant="outline" size="sm" className="font-mono text-[10px] border-[#334155]">
                        {percentage}%
                      </Badge>
                    </div>
                  </div>

                  {/* Visual Tiered Rows Schematic Grid */}
                  <div className="pl-2 pt-2 flex items-center justify-between text-[11px] text-[#94A3B8] border-t border-[#1E293B]/60 mt-2">
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span>Rows:</span>
                      <span className="text-white font-bold">
                        {firstRow === lastRow ? `Row ${firstRow}` : `Rows ${firstRow} – ${lastRow}`}
                      </span>
                      <span className="text-[#475569]">({rowCount} rows)</span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-mono">
                      <span>{sec.seatsPerRow || 10} seats/row</span>
                      <div className="flex gap-1 items-center">
                        <div
                          className="h-2 w-2 rounded-sm"
                          style={{ backgroundColor: tokens.color }}
                        />
                        <span className="capitalize">{sec.status.toLowerCase()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center Aisle Indicator */}
                  <div className="absolute inset-y-0 left-1/2 w-4 -translate-x-1/2 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="h-full border-r border-dashed border-[#64748B]" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rear Concourse & Emergency Exits */}
        <div className="w-full max-w-xl mt-8 pt-4 border-t border-[#1E293B] flex justify-between items-center px-2 text-[10px] font-mono text-[#64748B]">
          <div className="flex items-center gap-1.5">
            <Footprints className="h-3 w-3 text-[#38BDF8]" />
            <span>Rear Audience Concourse & Ingress</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <DoorClosed className="h-2.5 w-2.5" /> EXIT 3 (Lobby Concourse)
          </div>
        </div>
      </div>

      {/* Bottom Category Legend & Design System Mapping */}
      <div className="px-5 py-3 bg-[#0F172A]/90 border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] font-bold">
            Category Legend:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {activeSections.map((sec) => {
              const tokens = getCategoryDesignTokens(sec.category);
              return (
                <div
                  key={sec.id}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1E293B]/60 text-[11px]"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: tokens.color }}
                  />
                  <span className="text-white font-medium">{sec.name}</span>
                  <span className="text-[#64748B] font-mono">({sec.seatCount})</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
          <Info className="h-3.5 w-3.5 text-[#38BDF8]" />
          <span>Colors automatically inherit from Centralized Cinema Design System</span>
        </div>
      </div>
    </div>
  );
}
