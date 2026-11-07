import React from "react";
import Link from "next/link";
import { THEATRE_HALLS } from "@/lib/constants/theatre-admin";
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
  SlidersHorizontal,
  Eye,
  Edit,
  Cpu,
  ArrowRight,
} from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Hall & Screen Management | CineSphere OS",
};

export default function TheatreHallsPage() {
  const totalHalls = THEATRE_HALLS.length;
  const activeHalls = THEATRE_HALLS.filter((h) => h.status === "Active").length;
  const maintenanceHalls = THEATRE_HALLS.filter((h) => h.status === "Maintenance").length;
  const totalSeats = THEATRE_HALLS.reduce((acc, h) => acc + h.seatCount, 0);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Auditoriums & Hall Fleet"
        subtitle="5 Commercial Screens • IMAX Laser, Dolby Cinema, 4DX & Royal VIP"
        description="Monitor projection optics, audio processor curves, motorized recliner telemetry, and seating capacity distribution across all complex screens."
        badge="5 Screens Active"
        badgeVariant="success"
        actions={
          <div className="flex gap-2">
            <Link href={ROUTES.THEATRE_ADMIN.HALL_DESIGNER}>
              <Button variant="outline" size="sm" className="gap-2 border-[#2A3445]">
                <Sparkles className="h-4 w-4 text-[#FBBF24]" /> Hall Designer
              </Button>
            </Link>
            <Button variant="primary" size="sm" disabled className="gap-1.5 font-bold">
              Add New Screen (Coming Soon)
            </Button>
          </div>
        }
      />

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
          <span className="text-[10px] text-[#64748B]">Routine night sweep</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Total Seating Capacity</span>
          <div className="text-2xl font-black font-mono text-[#FBBF24]">{totalSeats} Seats</div>
          <span className="text-[10px] text-[#94A3B8]">Includes 100 Royal Recliners</span>
        </Card>
      </div>

      {/* Halls Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
            Complex Screens & Auditoriums
          </h2>
          <span className="text-xs text-[#64748B]">Phoenix Marketcity Complex</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {THEATRE_HALLS.map((hall) => (
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
                    <Badge variant={hall.status === "Active" ? "success" : "warning"} size="sm" dot>
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
                      <p className="font-mono font-bold text-white mt-0.5">{hall.seatCount} Seats</p>
                    </div>
                    <div>
                      <span className="text-[#64748B]">Occupancy</span>
                      <p className="font-mono font-bold text-emerald-400 mt-0.5">{hall.occupancyPercent}% Fill</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#2A3445]/60 text-xs text-[#94A3B8]">
                    <div className="flex items-center gap-2">
                      <Tv className="h-3.5 w-3.5 text-[#FBBF24] shrink-0" />
                      <span className="truncate">{hall.projectorModel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-3.5 w-3.5 text-[#FBBF24] shrink-0" />
                      <span className="truncate">{hall.audioSpec}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">Current Dispatch</span>
                    <p className="font-semibold text-white truncate">{hall.currentMovie}</p>
                    <span className="text-[10px] text-[#FBBF24] font-mono font-medium">Showtime: {hall.currentShow}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <Link href={`/theatre/halls/${hall.id}`}>
                  <Button variant="outline" size="xs" className="w-full text-xs gap-1 border-[#2A3445]">
                    <Eye className="h-3 w-3" /> View Hall
                  </Button>
                </Link>
                <Button variant="ghost" size="xs" disabled className="w-full text-xs text-[#94A3B8]">
                  3D Preview (Soon)
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
