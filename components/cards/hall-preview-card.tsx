"use client";

import React from "react";
import { Eye, Layers, Sparkles, Box } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

export interface HallPreviewCardProps {
  hallName?: string;
  format?: string;
  totalSeats?: number;
  acousticZones?: number;
  className?: string;
  onPreview3D?: () => void;
}

/**
 * Enterprise Future Hall Preview Card
 * Wireframe card representing 3D WebGL seat layout visualization.
 */
export function HallPreviewCard({
  hallName = "IMAX Grand Auditorium",
  format = "IMAX with Laser",
  totalSeats = 480,
  acousticZones = 12,
  className,
  onPreview3D,
}: HallPreviewCardProps) {
  return (
    <Card variant="interactive" className={cn("p-5 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-white text-sm">{hallName}</h4>
          <p className="text-xs text-[#94A3B8]">{format}</p>
        </div>
        <Badge variant="primary" size="sm">3D Layout</Badge>
      </div>

      {/* Simulated Curved Cinema Screen and Grid View */}
      <div className="h-36 rounded-2xl bg-[#070B12] border border-[#2A3445] p-4 flex flex-col items-center justify-between relative overflow-hidden">
        {/* Curved Screen Banner */}
        <div className="w-48 h-2 rounded-full bg-gradient-to-r from-transparent via-[#FBBF24] to-transparent shadow-lg shadow-[#FBBF24]/30" />
        <span className="text-[9px] uppercase font-bold text-[#FBBF24] tracking-widest">
          CURVED AUDITORIUM SCREEN
        </span>

        {/* Seat rows preview dots */}
        <div className="space-y-1.5 w-full max-w-[200px]">
          <div className="flex justify-center gap-1.5">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="h-1.5 w-2 rounded-sm bg-[#2A3445]" />
            ))}
          </div>
          <div className="flex justify-center gap-1.5">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="h-1.5 w-2 rounded-sm bg-[#FBBF24]/60" />
            ))}
          </div>
          <div className="flex justify-center gap-1.5">
            {[...Array(12)].map((_, i) => (
              <span key={i} className="h-1.5 w-2 rounded-sm bg-[#38BDF8]/60" />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between w-full text-[10px] text-[#64748B] font-mono">
          <span>{acousticZones} Speaker Arrays</span>
          <span>{totalSeats} Total Seats</span>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between">
        <span className="text-[11px] text-[#94A3B8]">WebGL Three.js Preview</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onPreview3D || (() => alert("3D Seat Preview modal is a placeholder in this phase."))}
          iconLeft={<Box className="h-3.5 w-3.5 text-[#FBBF24]" />}
          className="h-7 text-xs px-2.5 border-[#2A3445]"
        >
          Launch Preview
        </Button>
      </div>
    </Card>
  );
}

