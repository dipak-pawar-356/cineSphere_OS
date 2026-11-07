"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DUMMY_THEATRES } from "@/lib/constants/theatres";
import {
  Building2,
  Plus,
  MapPin,
  Layers,
  Search,
  Filter,
  Star,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminTheatresPage() {
  const [filterTier, setFilterTier] = useState<string>("all");

  const filteredTheatres = DUMMY_THEATRES.filter((th) => {
    if (filterTier === "all") return true;
    return th.pricingTier.toLowerCase() === filterTier.toLowerCase();
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Multi-Tenant Cinema Theatres Circuit"
        subtitle="25 Connected Flagship Complexes Across 12 Metropolitan Regions"
        description="Oversee cinema chains, acoustic certifications, projection hardware specifications, and localized tenant boundaries."
        badge="25 Complexes"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <Plus className="h-4 w-4" /> Onboard Theatre Chain (Disabled)
          </Button>
        }
      />

      {/* Metric Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Theatres", val: "25 Complexes", sub: "100% Online" },
          { label: "Active Auditoriums", val: "110 Screens", sub: "IMAX & Dolby Atmos" },
          { label: "Metro Jurisdictions", val: "12 Cities", sub: "All Gateways Synced" },
          { label: "Average Occupancy", val: "78.4%", sub: "+6.2% vs last month" },
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
            { id: "all", label: "All Theatres (13)" },
            { id: "luxury", label: "Luxury" },
            { id: "premium", label: "Premium" },
            { id: "standard", label: "Standard" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterTier(t.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium capitalize ${
                filterTier === t.id
                  ? "bg-[#FBBF24] text-[#070B12] font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search multiplex names or cities... (disabled)"
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
            disabled
          />
        </div>
      </div>

      {/* Theatres Table */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-5">Theatre Name</th>
                <th className="py-3.5 px-5">Chain / Operator</th>
                <th className="py-3.5 px-5">Location</th>
                <th className="py-3.5 px-5">Halls</th>
                <th className="py-3.5 px-5">Formats</th>
                <th className="py-3.5 px-5">Tier</th>
                <th className="py-3.5 px-5">Rating</th>
                <th className="py-3.5 px-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {filteredTheatres.map((th) => (
                <tr key={th.id} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#FBBF24]" />
                      <span>{th.name}</span>
                    </div>
                    <div className="text-[10px] text-[#64748B]">{th.address}</div>
                  </td>
                  <td className="py-3.5 px-5 font-medium text-white">{th.chain}</td>
                  <td className="py-3.5 px-5">
                    <div className="text-white">{th.city}</div>
                    <div className="text-[10px] text-[#94A3B8]">{th.state}</div>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-white font-bold">{th.hallCount} Screens</td>
                  <td className="py-3.5 px-5">
                    <div className="flex flex-wrap gap-1">
                      {th.screenTypes.slice(0, 3).map((fmt, i) => (
                        <Badge key={i} variant="outline" size="sm">{fmt}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <Badge variant={th.pricingTier === "Luxury" ? "warning" : "secondary"} size="sm">
                      {th.pricingTier}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-amber-400 font-bold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400" />
                    <span>{th.rating}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <Button variant="outline" size="sm" disabled className="h-7 text-xs px-2.5 border-[#2A3445]">
                      Manage (Disabled)
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#111827]/60 border-t border-[#2A3445] flex items-center justify-between text-xs text-[#94A3B8]">
          <span className="font-mono text-[11px]">Showing {filteredTheatres.length} of 25 Total Complexes</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs border-[#2A3445]">Previous</Button>
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs border-[#2A3445]">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
