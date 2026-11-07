"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  MapPin,
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminLocationsPage() {
  const CITIES_DATA = [
    { name: "Mumbai", state: "Maharashtra", theatres: 8, screens: 38, status: "Active Hub" },
    { name: "Delhi NCR", state: "National Capital Region", theatres: 6, screens: 28, status: "Active Hub" },
    { name: "Bengaluru", state: "Karnataka", theatres: 5, screens: 22, status: "Active Hub" },
    { name: "Hyderabad", state: "Telangana", theatres: 4, screens: 16, status: "Active Hub" },
    { name: "Pune", state: "Maharashtra", theatres: 3, screens: 12, status: "Active Hub" },
    { name: "Kolkata", state: "West Bengal", theatres: 3, screens: 11, status: "Active Hub" },
    { name: "Chennai", state: "Tamil Nadu", theatres: 2, screens: 8, status: "Active Hub" },
    { name: "Ahmedabad", state: "Gujarat", theatres: 2, screens: 7, status: "Active Hub" },
    { name: "Chandigarh", state: "Punjab / Haryana", theatres: 1, screens: 4, status: "Active Hub" },
    { name: "Jaipur", state: "Rajasthan", theatres: 1, screens: 4, status: "Active Hub" },
    { name: "Kochi", state: "Kerala", theatres: 1, screens: 4, status: "Active Hub" },
    { name: "Lucknow", state: "Uttar Pradesh", theatres: 1, screens: 4, status: "Active Hub" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Metropolitan Cities, States & Regional Hubs"
        subtitle="Jurisdictions, Municipal Tax Zones & Cinema Circuit Footprint"
        description="Manage regional coverage boundaries across 12 metropolitan hubs connecting 25 flagship multiplexes."
        badge="12 Hubs Active"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <Plus className="h-4 w-4" /> Provision New City Hub (Disabled)
          </Button>
        }
      />

      {/* Grid of Cities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CITIES_DATA.map((city, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3 hover:border-[#FBBF24]/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
                <MapPin className="h-4 w-4" />
              </div>
              <Badge variant="success" size="sm">{city.status}</Badge>
            </div>

            <div>
              <h3 className="font-bold text-white text-base">{city.name}</h3>
              <p className="text-xs text-[#94A3B8]">{city.state}</p>
            </div>

            <div className="pt-2 border-t border-[#2A3445]/60 flex items-center justify-between text-xs font-mono text-[#CBD5E1]">
              <span>{city.theatres} Theatres</span>
              <span className="text-[#FBBF24]">{city.screens} Screens</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

