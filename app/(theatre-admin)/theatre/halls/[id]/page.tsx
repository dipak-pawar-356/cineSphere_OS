import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { THEATRE_HALLS, THEATRE_SHOWS } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Tv,
  Volume2,
  Calendar,
  Clock,
  ArrowLeft,
  Sliders,
  CheckCircle2,
  Sparkles,
  Ticket,
} from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Auditorium Details | CineSphere OS",
};

export default async function TheatreHallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const hall = THEATRE_HALLS.find((h) => h.id === resolvedParams.id) || THEATRE_HALLS[0];
  const hallShows = THEATRE_SHOWS.filter((s) => s.hallId === hall.id);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-2">
        <Link href={ROUTES.THEATRE_ADMIN.HALLS}>
          <Button variant="ghost" size="xs" className="gap-1 text-xs text-[#94A3B8]">
            <ArrowLeft className="h-3 w-3" /> Back to All Screens
          </Button>
        </Link>
      </div>

      <PageHeader
        title={hall.name}
        subtitle={`${hall.screenType} • ${hall.seatCount} Seating Capacity`}
        description="Comprehensive technical diagnostics, seating matrix layout, projection calibration history, and current showtime dispatch list."
        badge={hall.status}
        badgeVariant={hall.status === "Active" ? "success" : "warning"}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
              <Sliders className="h-4 w-4" /> Calibrate Audio Rig
            </Button>
            <Button variant="primary" size="sm" disabled className="gap-1.5 font-bold">
              <Sparkles className="h-4 w-4" /> 3D Seat Designer (Soon)
            </Button>
          </div>
        }
      />

      {/* Hall Hero Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated" className="overflow-hidden p-0 border-[#2A3445]">
            <div className="relative h-64 sm:h-80 w-full bg-[#111827]">
              <img
                src={hall.image}
                alt={hall.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161F2E] via-transparent to-black/30" />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="space-y-1">
                  <Badge variant="solid" size="sm">Screen 0{hall.hallNumber}</Badge>
                  <h2 className="text-2xl font-black text-white">{hall.name}</h2>
                  <p className="text-xs text-[#CBD5E1]">{hall.aspectRatio} Aspect Ratio • Laser Projection</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#94A3B8] block">Current Fill Rate</span>
                  <span className="text-2xl font-bold font-mono text-[#FBBF24]">{hall.occupancyPercent}%</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
                Projection & Acoustic Hardware Architecture
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                  <div className="flex items-center gap-2 text-[#FBBF24] font-semibold">
                    <Tv className="h-4 w-4" /> Laser Projection Engine
                  </div>
                  <p className="text-sm font-bold text-white mt-1">{hall.projectorModel}</p>
                  <span className="text-[10px] text-[#64748B]">Laser Diode Health: 99.4% (1,240 hrs run)</span>
                </div>

                <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                  <div className="flex items-center gap-2 text-[#FBBF24] font-semibold">
                    <Volume2 className="h-4 w-4" /> Spatial Audio Array
                  </div>
                  <p className="text-sm font-bold text-white mt-1">{hall.audioSpec}</p>
                  <span className="text-[10px] text-emerald-400">Acoustic Curve: SMPTE 202M Calibrated</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Seating Layout Placeholder Visualizer */}
          <Card variant="elevated" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
                  Auditorium Seating Matrix
                </h3>
                <p className="text-xs text-[#64748B]">Visual representation of tiers and accessibility rows</p>
              </div>
              <Badge variant="outline" size="sm">{hall.seatCount} Total Seats</Badge>
            </div>

            {/* Screen Arc */}
            <div className="pt-6 pb-2 text-center space-y-4">
              <div className="w-3/4 mx-auto h-2 rounded-t-full bg-gradient-to-r from-transparent via-[#FBBF24] to-transparent shadow-[0_-8px_20px_rgba(251,191,36,0.3)]" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#64748B] block">
                CURVED CINEMA SCREEN (ALL EYES THIS WAY)
              </span>

              {/* Sample Rows Mockup */}
              <div className="space-y-2 pt-4 max-w-lg mx-auto">
                {["Row A (VIP Recliners)", "Row B (VIP Recliners)", "Row C (Prime Club)", "Row D (Prime Club)", "Row E (Classic)"].map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-[#64748B] w-28 text-left">{row}</span>
                    <div className="flex gap-1.5 flex-1 justify-center">
                      {Array.from({ length: 12 }, (_, s) => (
                        <div
                          key={s}
                          className={`h-4 w-4 rounded-xs border transition-colors ${
                            idx === 0
                              ? "bg-amber-400/20 border-amber-400/50"
                              : s % 3 === 0
                              ? "bg-white/5 border-[#2A3445]"
                              : "bg-[#111827] border-[#2A3445]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Shows Scheduled Today in this Hall */}
        <div className="space-y-6">
          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#FBBF24]" /> Today&apos;s Showtimes in Hall
            </h3>

            {hallShows.length > 0 ? (
              <div className="space-y-3">
                {hallShows.map((show) => (
                  <div key={show.id} className="p-3.5 rounded-xl bg-[#111827] border border-[#2A3445] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[160px]">{show.movieTitle}</span>
                      <Badge variant={show.status === "Running" ? "success" : "secondary"} size="sm">
                        {show.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                      <span className="font-mono text-[#FBBF24] font-semibold">{show.startTime} – {show.endTime}</span>
                      <span className="font-mono font-bold text-white">₹{show.ticketPrice}</span>
                    </div>

                    <div className="text-[10px] text-[#64748B] flex justify-between">
                      <span>Occupancy: {show.seatsBooked}/{show.totalSeats}</span>
                      <span>Format: {show.format}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8]">No additional shows scheduled today for this hall.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

