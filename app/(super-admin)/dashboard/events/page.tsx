"use client";

import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LATEST_EVENTS_DATA } from "@/lib/constants/super-admin";
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  Users,
  Ticket,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminEventsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Live Events, Festivals & Stadium Simulcasts"
        subtitle="Concerts, Esports Championships, Theatrical Broadcasts & Premieres"
        description="Program single-night global simulcasts, anime film festivals, and live stadium events across cinema screens."
        badge="Live Programming"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <Plus className="h-4 w-4" /> Create Live Event (Disabled)
          </Button>
        }
      />

      {/* Events Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {LATEST_EVENTS_DATA.map((event) => (
          <div
            key={event.id}
            className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4 hover:border-[#FBBF24]/40 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" size="sm">{event.category}</Badge>
                <span className="text-xs font-mono text-[#FBBF24] font-bold">{event.date}</span>
              </div>
              <h3 className="font-bold text-white text-base">{event.title}</h3>
              <p className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#64748B]" />
                <span>{event.venue}, {event.city}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-[#2A3445]/60 flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">
                Admissions: <strong className="text-emerald-400 font-mono">{event.ticketsSold}</strong>
              </span>
              <Button variant="outline" size="sm" disabled className="h-7 text-xs px-2.5 border-[#2A3445]">
                Manage Simulcast (Disabled)
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

