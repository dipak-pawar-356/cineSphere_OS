import React from "react";
import Link from "next/link";
import { THEATRE_SHOWS, THEATRE_HALLS, THEATRE_MOVIES } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Ticket,
  CheckCircle2,
  Users,
  Tv,
  Volume2,
} from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Showtime Dispatch Inspection | CineSphere OS",
};

export default async function TheatreShowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const show = THEATRE_SHOWS.find((s) => s.id === resolvedParams.id) || THEATRE_SHOWS[0];
  const hall = THEATRE_HALLS.find((h) => h.id === show.hallId) || THEATRE_HALLS[0];
  const fillRate = Math.round((show.seatsBooked / show.totalSeats) * 100);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-2">
        <Link href={ROUTES.THEATRE_ADMIN.SHOWS}>
          <Button variant="ghost" size="xs" className="gap-1 text-xs text-[#94A3B8]">
            <ArrowLeft className="h-3 w-3" /> Back to Showtime Roster
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`${show.movieTitle} — Showtime Dispatch`}
        subtitle={`${show.hallName} • ${show.startTime} – ${show.endTime}`}
        description="Real-time projection status, sound processor readings, digital ticket scan throughput, and floor usher readiness checklist."
        badge={show.status}
        badgeVariant={show.status === "Running" ? "success" : "secondary"}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
              Projector Sweep: OK
            </Button>
            <Button variant="primary" size="sm" disabled className="gap-1.5 font-bold">
              Dispatch Ushed Scan
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
              Operational Dispatch Telemetry
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
              <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                <span className="text-[#64748B]">Auditorium</span>
                <p className="font-bold text-white text-sm truncate">{show.hallName}</p>
                <span className="text-[10px] text-[#FBBF24] font-medium">{show.format}</span>
              </div>

              <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                <span className="text-[#64748B]">Ticket Price</span>
                <p className="font-bold font-mono text-white text-sm">₹{show.ticketPrice}</p>
                <span className="text-[10px] text-[#64748B]">Base Adult Rate</span>
              </div>

              <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                <span className="text-[#64748B]">Seats Booked</span>
                <p className="font-bold font-mono text-emerald-400 text-sm">{show.seatsBooked} / {show.totalSeats}</p>
                <span className="text-[10px] text-emerald-400 font-semibold">{fillRate}% Occupied</span>
              </div>

              <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                <span className="text-[#64748B]">Gross Collection</span>
                <p className="font-bold font-mono text-[#FBBF24] text-sm">₹{(show.seatsBooked * show.ticketPrice).toLocaleString()}</p>
                <span className="text-[10px] text-[#64748B]">Est. Box Office</span>
              </div>
            </div>
          </Card>

          {/* Usher Operational Checklist */}
          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
              Pre-Show Floor Checklist
            </h3>

            <div className="space-y-2.5 text-xs">
              {[
                "DCP Playlist Cues & Trailer Pre-roll Verified on Barco TMS",
                "Dolby Atmos Surround Speaker Diagnostic Test Passed (0 Dead Cones)",
                "Pneumatic Air Compressor Active for 4DX Motion Seats",
                "Automated Entrance QR Turnstiles Calibrated with 0ms Gate Delay",
                "Temperature Pre-Set to 21.5°C with Dual Filter Fresh Air Circulation",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-[#CBD5E1] font-medium">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Assigned Crew */}
        <div className="space-y-6">
          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
              Assigned Shift Crew
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                <span className="text-[#64748B] text-[10px] uppercase font-bold">Hall Manager</span>
                <p className="font-bold text-white">Deepak Shinde</p>
                <span className="text-[10px] text-emerald-400">On Duty • Stationed Screen 02</span>
              </div>

              <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                <span className="text-[#64748B] text-[10px] uppercase font-bold">Lead Usher</span>
                <p className="font-bold text-white">Sunita More</p>
                <span className="text-[10px] text-emerald-400">Gate Scanning Operational</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

