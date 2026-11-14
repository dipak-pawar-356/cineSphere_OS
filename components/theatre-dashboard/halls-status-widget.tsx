"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  Wrench,
  CheckCircle2,
  PlayCircle,
  AlertTriangle,
} from "lucide-react";
import { HallMetricsBundle } from "@/types/theatre-dashboard.types";

interface HallsStatusWidgetProps {
  halls: HallMetricsBundle;
}

export function HallsStatusWidget({ halls }: HallsStatusWidgetProps) {
  return (
    <Card variant="elevated" className="p-6 space-y-5 bg-[#0D1525] border border-[#2A3445]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2A3445]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Auditoriums & Hardware Status</h3>
            <p className="text-xs text-[#94A3B8]">
              {halls.totalHalls} configured screens • {halls.occupiedHalls} live • {halls.availableHalls} ready
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#94A3B8]">Fleet Capacity:</span>
          <Badge variant="warning" size="sm" className="font-mono font-bold">
            {halls.seatUtilizationPercent}% Loaded
          </Badge>
        </div>
      </div>

      {/* Grid of screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {halls.hallsSummary.map((hall) => {
          const isOccupied = hall.status === "OCCUPIED";
          const isMaintenance = hall.status === "MAINTENANCE";
          const isAvailable = hall.status === "AVAILABLE";

          return (
            <div
              key={hall.id}
              className={`p-4 rounded-xl border transition-all ${
                isOccupied
                  ? "bg-[#111827] border-emerald-500/30 hover:border-emerald-500/50"
                  : isMaintenance
                  ? "bg-[#161214] border-amber-500/30 hover:border-amber-500/50"
                  : "bg-[#111827] border-[#2A3445] hover:border-zinc-500/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-bold text-white text-sm">{hall.name}</h4>
                  <span className="text-[11px] text-[#94A3B8] font-mono block">
                    {hall.hallType} • {hall.totalCapacity} Seats
                  </span>
                </div>
                <Badge
                  variant={isOccupied ? "success" : isMaintenance ? "warning" : isAvailable ? "secondary" : "danger"}
                  size="sm"
                >
                  {hall.status}
                </Badge>
              </div>

              {isOccupied && hall.currentShowTitle && (
                <div className="mt-2 pt-2 border-t border-[#2A3445]/60 text-xs">
                  <span className="text-[#94A3B8] text-[10px] uppercase font-semibold block">Now Screening</span>
                  <span className="font-bold text-emerald-400 truncate block">{hall.currentShowTitle}</span>
                  <span className="text-[10px] text-[#64748B] font-mono">
                    {hall.currentShowStart} - {hall.currentShowEnd}
                  </span>
                </div>
              )}

              {isMaintenance && hall.maintenanceReason && (
                <div className="mt-2 pt-2 border-t border-[#2A3445]/60 text-xs">
                  <span className="text-amber-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                    <Wrench className="h-3 w-3" /> Tech Downtime
                  </span>
                  <span className="text-zinc-300 text-[11px] block mt-0.5">{hall.maintenanceReason}</span>
                </div>
              )}

              {isAvailable && (
                <div className="mt-2 pt-2 border-t border-[#2A3445]/60 text-xs text-zinc-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-[11px]">Ready for next show programming</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
