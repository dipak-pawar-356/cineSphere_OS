"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Layers,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Building2,
  Tv,
  Volume2,
  Sliders,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminHallsPage() {
  const [selectedFormat, setSelectedFormat] = useState("all");

  const HALLS_DATA = [
    {
      id: "hl-1",
      name: "Hall 1 — Grand IMAX",
      theatre: "Apex Grand IMAX (Mumbai)",
      format: "IMAX Laser 4K",
      sound: "12-Channel Spatial Laser Audio",
      capacity: 480,
      projector: "Christie CP4450-RGB",
      status: "Active",
    },
    {
      id: "hl-2",
      name: "Hall 2 — Dolby Cinema",
      theatre: "Apex Grand IMAX (Mumbai)",
      format: "Dolby Atmos",
      sound: "Dolby CP950 128-ch Array",
      capacity: 320,
      projector: "Christie 4K Dual Laser",
      status: "Active",
    },
    {
      id: "hl-3",
      name: "Hall 3 — 4DX Dynamic",
      theatre: "Apex Grand IMAX (Mumbai)",
      format: "4DX",
      sound: "JBL Professional Cinema 7.1",
      capacity: 180,
      projector: "Barco DP4K-32B",
      status: "Active",
    },
    {
      id: "hl-4",
      name: "Hall 1 — Dolby Atmos AtmosX",
      theatre: "Starlight Dolby Cinema (Bengaluru)",
      format: "Dolby Atmos",
      sound: "Dolby Atmos 64-speaker ceiling grid",
      capacity: 390,
      projector: "Barco Series 4 Laser",
      status: "Active",
    },
    {
      id: "hl-5",
      name: "Hall 1 — ScreenX 270°",
      theatre: "CineWave Megaplex (Delhi NCR)",
      format: "ScreenX",
      sound: "QSC Digital Cinema Sound",
      capacity: 290,
      projector: "Triple Christie HD Arrays",
      status: "Active",
    },
    {
      id: "hl-6",
      name: "Hall 2 — Heritage 70mm",
      theatre: "PVR Heritage Grand (Pune)",
      format: "70mm Film",
      sound: "Datasat Digital Sound DTS",
      capacity: 310,
      projector: "Century JJ 70/35mm Dual",
      status: "Maintenance",
    },
  ];

  const filteredHalls = HALLS_DATA.filter((h) => {
    if (selectedFormat === "all") return true;
    return h.format.toLowerCase().includes(selectedFormat.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Auditoriums & Hall Telemetry"
        subtitle="110 Physical Screens, Laser Projectors & Dolby Sound System Configurations"
        description="Monitor projection calibration profiles, acoustic channel alignments, and seat layouts across all connected halls."
        badge="110 Screens"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <Plus className="h-4 w-4" /> Provision Auditorium (Disabled)
          </Button>
        }
      />

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Auditoriums", val: "110 Halls", sub: "100% Monitored" },
          { label: "IMAX & Dolby Auditoriums", val: "42 Premium", sub: "Calibrated" },
          { label: "Total Seating Capacity", val: "38,400 Seats", sub: "Recliner & VIP" },
          { label: "Projector Health", val: "99.98%", sub: "Zero Lamp Failures" },
        ].map((m, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">{m.label}</div>
            <div className="text-xl font-extrabold font-mono text-white">{m.val}</div>
            <div className="text-[11px] text-emerald-400">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {[
            { id: "all", label: "All Formats" },
            { id: "imax", label: "IMAX" },
            { id: "dolby", label: "Dolby Atmos" },
            { id: "4dx", label: "4DX" },
            { id: "screenx", label: "ScreenX" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFormat(f.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                selectedFormat === f.id
                  ? "bg-[#FBBF24] text-[#070B12] font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search hall name or projector... (disabled)"
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
            disabled
          />
        </div>
      </div>

      {/* Halls Table */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-5">Auditorium Name</th>
                <th className="py-3.5 px-5">Theatre Venue</th>
                <th className="py-3.5 px-5">Projection Format</th>
                <th className="py-3.5 px-5">Acoustic Sound System</th>
                <th className="py-3.5 px-5">Capacity</th>
                <th className="py-3.5 px-5">Projector Model</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {filteredHalls.map((h) => (
                <tr key={h.id} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#FBBF24]" />
                    <span>{h.name}</span>
                  </td>
                  <td className="py-3.5 px-5 text-[#94A3B8]">{h.theatre}</td>
                  <td className="py-3.5 px-5">
                    <Badge variant="primary" size="sm">{h.format}</Badge>
                  </td>
                  <td className="py-3.5 px-5 text-white">{h.sound}</td>
                  <td className="py-3.5 px-5 font-mono text-white font-bold">{h.capacity} Seats</td>
                  <td className="py-3.5 px-5 font-mono text-xs text-[#64748B]">{h.projector}</td>
                  <td className="py-3.5 px-5">
                    <Badge variant={h.status === "Active" ? "success" : "warning"} size="sm">
                      {h.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#111827]/60 border-t border-[#2A3445] flex items-center justify-between text-xs text-[#94A3B8]">
          <span className="font-mono text-[11px]">Showing {filteredHalls.length} of 110 Configured Screens</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs border-[#2A3445]">Previous</Button>
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs border-[#2A3445]">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
