"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Clock,
  Film,
  Building2,
  Layers,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminShowsPage() {
  const [selectedFormat, setSelectedFormat] = useState("all");

  const SHOWS_DATA = [
    {
      id: "sh-1",
      movie: "Chrono Nexus: Origins",
      theatre: "Apex Grand IMAX (Mumbai)",
      hall: "Hall 1 (IMAX Laser)",
      time: "10:30 AM",
      format: "IMAX Laser 4K",
      price: "₹650",
      occupancy: "92%",
      status: "Scheduled",
    },
    {
      id: "sh-2",
      movie: "Chrono Nexus: Origins",
      theatre: "Apex Grand IMAX (Mumbai)",
      hall: "Hall 1 (IMAX Laser)",
      time: "02:15 PM",
      format: "IMAX Laser 4K",
      price: "₹750",
      occupancy: "98% (Filling Fast)",
      status: "Scheduled",
    },
    {
      id: "sh-3",
      movie: "CyberPulse: 2099",
      theatre: "Starlight Dolby Cinema (Bengaluru)",
      hall: "Hall 2 (Dolby Atmos)",
      time: "06:00 PM",
      format: "Dolby Atmos",
      price: "₹450",
      occupancy: "84%",
      status: "Scheduled",
    },
    {
      id: "sh-4",
      movie: "Shadows of Elysium",
      theatre: "PVR Heritage Grand (Pune)",
      hall: "Hall 3 (Prime)",
      time: "08:45 PM",
      format: "Dolby Atmos",
      price: "₹380",
      occupancy: "76%",
      status: "Scheduled",
    },
    {
      id: "sh-5",
      movie: "Interstellar: 10th Anniv",
      theatre: "Apex Grand IMAX (Mumbai)",
      hall: "Hall 1 (IMAX Laser)",
      time: "11:30 PM",
      format: "70mm Film",
      price: "₹850",
      occupancy: "100% (Sold Out)",
      status: "Housefull",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Circuit-Wide Showtime Programming"
        subtitle="320+ Daily Shows Across 110 Connected Auditoriums"
        description="Oversee synchronized timetable schedules, intermission spacing, dynamic prime-time pricing, and laser automation cues."
        badge="320+ Shows"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <Plus className="h-4 w-4" /> Deploy Schedule Batch (Disabled)
          </Button>
        }
      />

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Daily Shows", val: "320 Timetables", sub: "100% Synced" },
          { label: "Housefull Sessions", val: "48 Shows", sub: "100% Capacity" },
          { label: "Prime-Time Slots", val: "140 Sessions", sub: "Peak Pricing Applied" },
          { label: "Schedule Conflicts", val: "0 Detected", sub: "Optimal Automation" },
        ].map((m, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">{m.label}</div>
            <div className="text-xl font-extrabold font-mono text-white">{m.val}</div>
            <div className="text-[11px] text-emerald-400">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Shows Table */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-5">Movie Title</th>
                <th className="py-3.5 px-5">Theatre & Auditorium</th>
                <th className="py-3.5 px-5">Showtime</th>
                <th className="py-3.5 px-5">Format</th>
                <th className="py-3.5 px-5">Ticket Base</th>
                <th className="py-3.5 px-5">Admissions</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {SHOWS_DATA.map((s) => (
                <tr key={s.id} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-white flex items-center gap-2">
                    <Film className="h-4 w-4 text-[#FBBF24]" />
                    <span>{s.movie}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="text-white font-medium">{s.theatre}</div>
                    <div className="text-[10px] text-[#94A3B8]">{s.hall}</div>
                  </td>
                  <td className="py-3.5 px-5 font-mono font-bold text-[#38BDF8] flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{s.time}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <Badge variant="outline" size="sm">{s.format}</Badge>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-white font-bold">{s.price}</td>
                  <td className="py-3.5 px-5 font-mono text-emerald-400 font-bold">{s.occupancy}</td>
                  <td className="py-3.5 px-5">
                    <Badge variant={s.status === "Housefull" ? "danger" : "success"} size="sm">
                      {s.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#111827]/60 border-t border-[#2A3445] flex items-center justify-between text-xs text-[#94A3B8]">
          <span className="font-mono text-[11px]">Showing 5 of 320 Scheduled Shows</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs border-[#2A3445]">Previous</Button>
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs border-[#2A3445]">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
