"use client";

import React from "react";
import Link from "next/link";
import { useTheatreStore } from "@/store/theatre-store";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Sparkles,
  Tv,
  Volume2,
  CheckCircle2,
  Eye,
  SlidersHorizontal,
  Info,
} from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function TheatreHallsPage() {
  const { profile, halls } = useTheatreStore();

  const totalHalls = halls.length;
  const activeHalls = halls.filter((h) => h.status === "Active" || h.status === "Show Running").length;
  const maintenanceHalls = halls.filter((h) => h.status === "Maintenance" || h.status === "Cleaning").length;
  const totalSeats = halls.reduce((acc, h) => acc + h.capacity, 0);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Auditoriums & Hall Fleet Management"
        subtitle={`${profile.name} • ${totalHalls} Commercial Screens`}
        description="Monitor projection optics, audio processor curves, motorized recliner telemetry, and seating capacity distribution across all complex screens."
        badge={`${totalHalls} Screens Active`}
        badgeVariant="success"
        actions={
          <div className="flex gap-2">
            <Link href={ROUTES.THEATRE_ADMIN.HALL_DESIGNER}>
              <Button variant="outline" size="sm" className="gap-2 border-[#2A3445] text-[#FBBF24] hover:bg-[#FBBF24]/10">
                <Sparkles className="h-4 w-4" /> Hall Designer (Phase 2 Part 5)
              </Button>
            </Link>
          </div>
        }
      />

      {/* Hall Designer Roadmap Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 flex items-center justify-center text-[#FBBF24] shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">CAD Hall Designer Entry Point</h3>
            <p className="text-xs text-[#94A3B8]">
              Hall seat matrices are created once and reused across hundreds of future shows. Dynamic 2D/3D matrix customization launches in Phase 2 Part 5.
            </p>
          </div>
        </div>
        <Badge variant="outline" size="sm" className="border-amber-400/40 text-amber-400 shrink-0">
          Planned Next Phase
        </Badge>
      </div>

      {/* Capacity & Screen Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Total Screens</span>
          <div className="text-2xl font-black font-mono text-white">{totalHalls} Screens</div>
          <span className="text-[10px] text-[#64748B]">100% Laser Projectors</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Active Halls</span>
          <div className="text-2xl font-black font-mono text-emerald-400">{activeHalls} Active</div>
          <span className="text-[10px] text-emerald-400">Zero downtime reported</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Under Maintenance</span>
          <div className="text-2xl font-black font-mono text-white">{maintenanceHalls} Halls</div>
          <span className="text-[10px] text-[#64748B]">Routine laser check</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Total Seating Capacity</span>
          <div className="text-2xl font-black font-mono text-[#FBBF24]">{totalSeats} Seats</div>
          <span className="text-[10px] text-[#94A3B8]">Across all active zones</span>
        </Card>
      </div>

      {/* Halls Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
            Complex Screens & Auditoriums
          </h2>
          <span className="text-xs text-[#64748B] font-mono">{profile.name} Fleet</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {halls.map((hall) => (
            <Card key={hall.id} variant="elevated" className="overflow-hidden space-y-4 flex flex-col justify-between">
              <div>
                {/* Hall Header & Image */}
                <div className="relative h-44 w-full bg-[#111827] overflow-hidden">
                  <img
                    src={hall.image}
                    alt={hall.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161F2E] via-transparent to-black/40" />
                  <div className="absolute top-3 left-3">
                    <Badge variant="solid" size="sm" className="font-bold bg-black/70 backdrop-blur-md">
                      Screen 0{hall.hallNumber}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant={hall.status === "Active" || hall.status === "Show Running" ? "success" : "warning"} size="sm" dot>
                      {hall.status}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#FBBF24] tracking-wider font-bold">
                        {hall.screenType}
                      </span>
                      <h3 className="text-base font-bold text-white leading-tight">{hall.name}</h3>
                    </div>
                  </div>
                </div>

                {/* Specs Content */}
                <div className="p-5 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#64748B]">Capacity</span>
                      <p className="font-mono font-bold text-white mt-0.5">{hall.capacity} Seats</p>
                    </div>
                    <div>
                      <span className="text-[#64748B]">Occupancy</span>
                      <p className="font-mono font-bold text-emerald-400 mt-0.5">{hall.occupancyPercent}% Fill</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#2A3445]/60 text-xs text-[#94A3B8]">
                    <div className="flex items-center gap-2">
                      <Tv className="h-3.5 w-3.5 text-[#FBBF24] shrink-0" />
                      <span className="truncate">{hall.projectionType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-3.5 w-3.5 text-[#FBBF24] shrink-0" />
                      <span className="truncate">{hall.soundSystem}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">Current Dispatch</span>
                    <p className="font-semibold text-white truncate">{hall.currentMovie || "No Active Show"}</p>
                    <span className="text-[10px] text-[#FBBF24] font-mono font-medium">Showtime: {hall.currentShow || "Next at 06:00 PM"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <Link href={`/theatre/halls/${hall.id}`}>
                  <Button variant="outline" size="xs" className="w-full text-xs gap-1 border-[#2A3445] text-white">
                    <Eye className="h-3 w-3" /> View Specs
                  </Button>
                </Link>
                <Link href={ROUTES.THEATRE_ADMIN.HALL_DESIGNER}>
                  <Button variant="ghost" size="xs" className="w-full text-xs text-[#FBBF24]">
                    CAD Designer →
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
