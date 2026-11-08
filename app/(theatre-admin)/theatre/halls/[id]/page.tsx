"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTheatreStore } from "@/store/theatre-store";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HallPreview2D } from "@/components/theatre/hall-preview-2d";
import { HallModal } from "@/components/theatre/hall-modal";
import { getCategoryDesignTokens } from "@/lib/constants/seating-design-system";
import {
  Layers,
  Tv,
  Volume2,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Ticket,
  Copy,
  Edit2,
  Archive,
  Power,
  Camera,
  DoorClosed,
  ShieldCheck,
  Film,
  Compass,
} from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function TheatreHallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hallId = (params?.id as string) || "hall-01";

  const {
    profile,
    halls,
    shows,
    updateHall,
    duplicateHall,
    activateHall,
    deactivateHall,
    archiveHall,
    auditLogs,
  } = useTheatreStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const hall = halls.find((h) => h.id === hallId) || halls[0];
  const hallShows = shows.filter((s) => s.hallId === hall?.id);
  const sections = hall?.sections || [];

  if (!hall) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Auditorium Not Found</h2>
        <p className="text-xs text-[#94A3B8]">The requested screen does not exist in this theatre fleet.</p>
        <Link href={ROUTES.THEATRE_ADMIN.HALLS}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Hall Fleet
          </Button>
        </Link>
      </div>
    );
  }

  const isOnline = hall.status === "Active" || hall.status === "Show Running";

  const handleDuplicate = () => {
    const res = duplicateHall(hall.id);
    if (res.success && res.newId) {
      router.push(`/theatre/halls/${res.newId}`);
    }
  };

  const handleToggleStatus = () => {
    if (isOnline) {
      deactivateHall(hall.id);
    } else {
      activateHall(hall.id);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Back to Hall Fleet Navigation */}
      <div className="flex items-center gap-2">
        <Link href={ROUTES.THEATRE_ADMIN.HALLS}>
          <Button variant="ghost" size="xs" className="gap-1 text-xs text-[#94A3B8] hover:text-white">
            <ArrowLeft className="h-3 w-3" /> Back to All Auditoriums
          </Button>
        </Link>
      </div>

      <PageHeader
        title={hall.name}
        subtitle={`${hall.screenType} • ${hall.capacity} Seating Capacity • ${hall.floorNumber || "Floor 2"}`}
        description="Comprehensive technical diagnostics, dynamic seating tiers, hardware calibration, 2D floor plans, and showtime dispatch list."
        badge={hall.status}
        badgeVariant={isOnline ? "success" : hall.status === "Maintenance" ? "warning" : "secondary"}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="gap-1.5 border-[#2A3445] text-amber-400 hover:bg-amber-400/10"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit Configuration
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
              className="gap-1.5 border-[#2A3445] text-[#38BDF8] hover:bg-sky-400/10"
            >
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              className={`gap-1.5 border-[#2A3445] ${
                isOnline ? "text-rose-400 hover:bg-rose-500/10" : "text-emerald-400 hover:bg-emerald-400/10"
              }`}
            >
              <Power className="h-3.5 w-3.5" /> {isOnline ? "Deactivate" : "Activate"}
            </Button>
          </div>
        }
      />

      {/* Main Grid: 2D Schematic Preview & Hardware Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 2D Floor Plan & Future 3D Architecture */}
        <div className="lg:col-span-2 space-y-6">
          <HallPreview2D
            hallName={hall.name}
            hallCode={hall.hallCode}
            screenType={hall.screenType}
            capacity={hall.capacity}
            sections={sections}
          />

          {/* Dynamic Sections Table Breakdown */}
          <Card variant="elevated" className="p-6 rounded-2xl bg-[#111827] border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#FBBF24]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Dynamic Seating Tiers ({sections.length} Sections)
                </h3>
              </div>
              <Badge variant="success" size="sm" className="font-mono">
                100% Balanced ({hall.capacity} Seats)
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E293B] bg-[#0F172A] text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    <th className="py-2.5 px-3">Order</th>
                    <th className="py-2.5 px-3">Section Name</th>
                    <th className="py-2.5 px-3">Category Tier</th>
                    <th className="py-2.5 px-3 text-center">Seat Count</th>
                    <th className="py-2.5 px-3">Rows</th>
                    <th className="py-2.5 px-3">Seats / Row</th>
                    <th className="py-2.5 px-3 text-center">Visibility</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B] font-mono text-[#CBD5E1]">
                  {sections.map((sec) => {
                    const tokens = getCategoryDesignTokens(sec.category);
                    const rowCount = sec.rows?.length || Math.ceil(sec.seatCount / (sec.seatsPerRow || 10));

                    return (
                      <tr key={sec.id} className="hover:bg-[#161F2E]/60 transition-colors">
                        <td className="py-2.5 px-3 text-[#64748B]">#{sec.sortOrder}</td>
                        <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: tokens.color }}
                          />
                          {sec.name}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{
                              backgroundColor: `${tokens.color}20`,
                              color: tokens.color,
                            }}
                          >
                            {sec.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-white">
                          {sec.seatCount}
                        </td>
                        <td className="py-2.5 px-3 text-[#94A3B8]">
                          {sec.rows?.join(", ") || `A – ${String.fromCharCode(64 + rowCount)}`}
                        </td>
                        <td className="py-2.5 px-3 text-[#94A3B8]">{sec.seatsPerRow}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge variant={sec.visibility ? "success" : "secondary"} size="sm">
                            {sec.visibility ? "Visible" : "Hidden"}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge variant="outline" size="sm" className="border-[#2A3445] text-white">
                            {sec.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Future 3D Architecture & Camera Placement Spec Card */}
          <Card variant="elevated" className="p-6 rounded-2xl bg-[#111827] border-[#1E293B] space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Camera className="h-4 w-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Future 3D Cinematic Viewport Architecture
              </h3>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Ready for Phase 6 Three.js & React Three Fiber visualizer. The spatial metadata below is stored natively within the hall configuration.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-0.5">
                <span className="text-[10px] text-[#64748B] uppercase block">FOV (Field of View)</span>
                <span className="text-sm font-bold text-white">60.0°</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-0.5">
                <span className="text-[10px] text-[#64748B] uppercase block">Screen Curvature</span>
                <span className="text-sm font-bold text-[#FBBF24]">0.18 rad</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-0.5">
                <span className="text-[10px] text-[#64748B] uppercase block">Eye-Level Height</span>
                <span className="text-sm font-bold text-emerald-400">1.20 m</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-0.5">
                <span className="text-[10px] text-[#64748B] uppercase block">Stage Elevation</span>
                <span className="text-sm font-bold text-[#38BDF8]">0.80 m</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B] text-xs space-y-1.5">
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase font-bold block">
                Camera Presets in Memory:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#CBD5E1]">
                <div className="p-2 rounded bg-[#111827] border border-[#2A3445]">
                  <strong className="text-white block">1. Center Sweetspot</strong>
                  <span className="text-[10px] text-[#64748B] font-mono">[0, 4.5, 14]</span>
                </div>
                <div className="p-2 rounded bg-[#111827] border border-[#2A3445]">
                  <strong className="text-white block">2. Screen Horizon</strong>
                  <span className="text-[10px] text-[#64748B] font-mono">[0, 1.5, 1]</span>
                </div>
                <div className="p-2 rounded bg-[#111827] border border-[#2A3445]">
                  <strong className="text-white block">3. VIP Balcony Tier</strong>
                  <span className="text-[10px] text-[#64748B] font-mono">[-5, 6, 18]</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Hardware Specs, Current Shows & Audit History */}
        <div className="space-y-6">
          {/* Hardware & Calibration Spec Card */}
          <Card variant="elevated" className="p-6 rounded-2xl bg-[#111827] border-[#1E293B] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Hardware & Optical Specs
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-1">
                <div className="flex items-center gap-2 text-[#FBBF24] font-semibold">
                  <Tv className="h-4 w-4" /> Projection System
                </div>
                <p className="font-bold text-white mt-0.5">{hall.projectionType}</p>
                <span className="text-[10px] text-[#64748B]">Barco / Christie Pure Laser Diode array</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-1">
                <div className="flex items-center gap-2 text-[#38BDF8] font-semibold">
                  <Volume2 className="h-4 w-4" /> Spatial Acoustic Processor
                </div>
                <p className="font-bold text-white mt-0.5">{hall.soundSystem}</p>
                <span className="text-[10px] text-[#64748B]">B-Chain calibrated to SMPTE 202M curve</span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-[#1E293B]">
                  <span className="text-[9px] text-[#64748B] block uppercase">Aspect Ratio</span>
                  <span className="font-bold text-white">{hall.aspectRatio || "2.39:1 Scope"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-[#1E293B]">
                  <span className="text-[9px] text-[#64748B] block uppercase">Screen Number</span>
                  <span className="font-bold text-white">0{hall.hallNumber}</span>
                </div>
              </div>

              {hall.description && (
                <div className="p-3 rounded-lg bg-[#0B0F19] border border-[#1E293B] text-[11px] text-[#94A3B8] leading-relaxed">
                  {hall.description}
                </div>
              )}
            </div>
          </Card>

          {/* Current Showtime Timetable Dispatch */}
          <Card variant="elevated" className="p-6 rounded-2xl bg-[#111827] border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#FBBF24]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Programmed Showtimes
                </h3>
              </div>
              <Badge variant="outline" size="sm" className="font-mono text-[#FBBF24] border-[#FBBF24]/30">
                {hallShows.length} Shows
              </Badge>
            </div>

            {hallShows.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#0B0F19] border border-dashed border-[#2A3445] text-center text-xs text-[#94A3B8]">
                No shows currently scheduled in this auditorium.
              </div>
            ) : (
              <div className="space-y-2.5">
                {hallShows.map((show) => (
                  <div
                    key={show.id}
                    className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-white">{show.movieTitle}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-[#64748B] font-mono mt-0.5">
                        <span>{show.date}</span>
                        <span>•</span>
                        <span className="text-amber-400 font-bold">{show.startTime}</span>
                      </div>
                    </div>
                    <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                      ₹{show.ticketPrice}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Audit History Log */}
          <Card variant="elevated" className="p-6 rounded-2xl bg-[#111827] border-[#1E293B] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Auditorium Audit History
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5 text-[#CBD5E1]">
                <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Created & Calibrated</p>
                  <p className="text-[10px] text-[#64748B] font-mono">
                    {hall.createdAt ? hall.createdAt.split("T")[0] : "2026-09-01"} • System Architect
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-[#CBD5E1]">
                <div className="h-2 w-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Capacity & Section Balance Verified</p>
                  <p className="text-[10px] text-[#64748B] font-mono">
                    {hall.updatedAt ? hall.updatedAt.split("T")[0] : "2026-11-05"} • Automated Engine
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Auditorium Modal */}
      <HallModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(updatedData) => updateHall(hall.id, updatedData)}
        initialHall={hall}
        existingHalls={halls}
      />
    </div>
  );
}
