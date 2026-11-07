import React from "react";
import Link from "next/link";
import { THEATRE_EVENTS } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, Plus, Clock, MapPin } from "lucide-react";

export const metadata = {
  title: "Special Events & Premieres | CineSphere OS",
};

export default function TheatreEventsPage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Live Shows, Concerts & Stand-Up Events"
        subtitle="Auditorium Bookings for Non-Film Live Broadcasts, Comedy Tours and Festivals"
        badge="8 Scheduled Events"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <Plus className="h-4 w-4" /> Book Auditorium for Event (Phase 2)
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {THEATRE_EVENTS.map((event) => (
          <Card key={event.id} variant="elevated" className="overflow-hidden flex flex-col justify-between">
            <div>
              <div className="relative h-48 w-full bg-[#111827] overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161F2E] via-transparent to-black/30" />
                <div className="absolute top-3 left-3">
                  <Badge variant="solid" size="sm">{event.category}</Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="success" size="sm">{event.status}</Badge>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="font-bold text-white text-base leading-snug">{event.title}</h3>
                <span className="text-xs text-[#FBBF24] font-semibold block">Featuring: {event.artist}</span>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#CBD5E1] pt-2 border-t border-[#2A3445]/60">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#FBBF24]" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#FBBF24]" />
                    <span>{event.time}</span>
                  </div>
                  <div className="col-span-2 text-[#94A3B8]">
                    Venue: <span className="text-white font-medium">{event.hallName}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#64748B] block">Ticket Starting At</span>
                <span className="text-base font-bold font-mono text-white">₹{event.price}</span>
              </div>
              <Button variant="outline" size="xs" disabled className="border-[#2A3445] text-xs">
                Manage Passes (Soon)
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

