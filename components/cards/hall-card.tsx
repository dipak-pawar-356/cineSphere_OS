"use client";

import React from "react";
import { Layers, Tv, Volume2, Users, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

export interface HallCardProps {
  id: string;
  name: string;
  theatreName: string;
  format: string;
  soundSystem: string;
  seatingCapacity: number;
  projectorModel: string;
  status?: "Active" | "Maintenance" | "Offline";
  className?: string;
  onManage?: () => void;
}

/**
 * Enterprise Auditorium / Hall Card
 * Displays screen acoustics, laser engine, and seat capacity.
 */
export function HallCard({
  id,
  name,
  theatreName,
  format,
  soundSystem,
  seatingCapacity,
  projectorModel,
  status = "Active",
  className,
  onManage,
}: HallCardProps) {
  return (
    <Card variant="elevated" className={cn("p-5 space-y-4 flex flex-col justify-between", className)}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">{format}</Badge>
              <Badge variant={status === "Active" ? "success" : "warning"} size="sm">
                {status}
              </Badge>
            </div>
            <h3 className="font-bold text-white text-base mt-1">{name}</h3>
            <p className="text-xs text-[#94A3B8]">{theatreName}</p>
          </div>

          <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] shrink-0">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#CBD5E1]">
            <span className="flex items-center gap-1.5 text-[#94A3B8]">
              <Volume2 className="h-3.5 w-3.5 text-[#38BDF8]" /> Sound:
            </span>
            <span className="font-medium text-white truncate max-w-[180px]">{soundSystem}</span>
          </div>
          <div className="flex items-center justify-between text-[#CBD5E1]">
            <span className="flex items-center gap-1.5 text-[#94A3B8]">
              <Tv className="h-3.5 w-3.5 text-[#FBBF24]" /> Projector:
            </span>
            <span className="font-mono text-white text-[11px]">{projectorModel}</span>
          </div>
          <div className="flex items-center justify-between text-[#CBD5E1]">
            <span className="flex items-center gap-1.5 text-[#94A3B8]">
              <Users className="h-3.5 w-3.5 text-emerald-400" /> Capacity:
            </span>
            <span className="font-mono font-bold text-white">{seatingCapacity} Seats</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-[#2A3445] flex items-center justify-between">
        <span className="text-[11px] font-mono text-[#64748B]">ID: {id}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onManage || (() => alert(`Hall ${name} management action (Placeholder)`))}
          className="h-7 text-xs px-2.5 border-[#2A3445]"
        >
          Hall Settings
        </Button>
      </div>
    </Card>
  );
}

