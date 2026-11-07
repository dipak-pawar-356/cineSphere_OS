"use client";

import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  Building2,
  QrCode,
  Coffee,
  Clock,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminStaffPage() {
  const STAFF_DATA = [
    {
      id: "stf-1",
      name: "Ramesh Sharma",
      role: "Lead Gate Scanner Usher",
      theatre: "Apex Grand IMAX (Mumbai)",
      terminal: "Turnstile POS #02",
      shift: "Evening (04:00 PM — 12:00 AM)",
      status: "On Shift",
    },
    {
      id: "stf-2",
      name: "Aman Gupta",
      role: "Chief Projectionist",
      theatre: "Apex Grand IMAX (Mumbai)",
      terminal: "Christie Laser Suite B",
      shift: "Full Day (10:00 AM — 08:00 PM)",
      status: "On Shift",
    },
    {
      id: "stf-3",
      name: "Pooja Varma",
      role: "Gourmet Concessions Lead",
      theatre: "Starlight Dolby Cinema (Bengaluru)",
      terminal: "F&B Kitchen Terminal 1",
      shift: "Evening (03:00 PM — 11:30 PM)",
      status: "On Shift",
    },
    {
      id: "stf-4",
      name: "Karan Singhania",
      role: "Will-Call Box Office Concierge",
      theatre: "CineWave Megaplex (Delhi NCR)",
      terminal: "Kiosk Will-Call 4",
      shift: "Morning (09:00 AM — 05:00 PM)",
      status: "Off Shift",
    },
    {
      id: "stf-5",
      name: "Divya Nair",
      role: "VIP Recliner Floor Usher",
      theatre: "PVR Heritage Grand (Pune)",
      terminal: "Hall 1 VIP Gate",
      shift: "Evening (05:00 PM — 01:00 AM)",
      status: "On Shift",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Field Staff & Operational Workforce"
        subtitle="180 Registered Floor Agents, Gate Scanners, Ushers & Projectionists"
        description="Monitor staff assignments, floor POS scanner logins, active shifts, and contactless turnstile throughput across all venues."
        badge="180 Field Staff"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <Plus className="h-4 w-4" /> Provision Staff Account (Disabled)
          </Button>
        }
      />

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Workforce", val: "180 Staff", sub: "Active Registered" },
          { label: "Currently On Shift", val: "84 Agents", sub: "Active at Gates" },
          { label: "Connected Scanners", val: "65 Terminals", sub: "100% Synced" },
          { label: "Avg Scan Speed", val: "1.4s / ticket", sub: "Zero Queue Delays" },
        ].map((m, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">{m.label}</div>
            <div className="text-xl font-extrabold font-mono text-white">{m.val}</div>
            <div className="text-[11px] text-emerald-400">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Staff Table */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-5">Staff Member</th>
                <th className="py-3.5 px-5">Floor Role</th>
                <th className="py-3.5 px-5">Assigned Cinema Complex</th>
                <th className="py-3.5 px-5">Device / Terminal</th>
                <th className="py-3.5 px-5">Active Shift</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {STAFF_DATA.map((st) => (
                <tr key={st.id} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-white flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-[#FBBF24]" />
                    <span>{st.name}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <Badge variant="outline" size="sm">{st.role}</Badge>
                  </td>
                  <td className="py-3.5 px-5 text-[#94A3B8]">{st.theatre}</td>
                  <td className="py-3.5 px-5 font-mono text-[#FBBF24]">{st.terminal}</td>
                  <td className="py-3.5 px-5 text-[#94A3B8] font-mono">{st.shift}</td>
                  <td className="py-3.5 px-5">
                    <Badge variant={st.status === "On Shift" ? "success" : "secondary"} size="sm">
                      {st.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#111827]/60 border-t border-[#2A3445] flex items-center justify-between text-xs text-[#94A3B8]">
          <span className="font-mono text-[11px]">Showing 5 of 180 Onboarded Field Staff</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs border-[#2A3445]">Previous</Button>
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs border-[#2A3445]">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
