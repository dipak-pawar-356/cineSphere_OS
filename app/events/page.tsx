"use client";

import React, { useState, useMemo } from "react";
import { DUMMY_EVENTS } from "@/lib/constants/events";
import { EventCategory } from "@/lib/types";
import { EventCard } from "@/components/cards/event-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { FilterChip } from "@/components/ui/filter-chip";
import { Calendar, Radio, Mic, Trophy, Drama } from "lucide-react";

const EVENT_CATEGORIES: (EventCategory | "All")[] = [
  "All",
  "Concerts",
  "Sports",
  "Stand-up",
  "Theatre",
];

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "All">("All");

  const filteredEvents = useMemo(() => {
    if (selectedCategory === "All") return DUMMY_EVENTS;
    return DUMMY_EVENTS.filter((e) => e.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Live Broadcasts & Stage"
          title="Events, Simulcasts & Stand-up Specials"
          subtitle="Experience stadium-scale sporting finals, legendary symphonies, and comedy tours on giant IMAX screens with theatre-grade audio."
        />

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 mt-6 scrollbar-none">
          {EVENT_CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              isActive={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>

        {/* Live Simulcast Explainer Strip */}
        <div className="mb-10 p-5 rounded-2xl bg-[#161F2E]/70 border border-white/5 flex items-center justify-between text-xs text-[#9CA3AF]">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <span className="text-white font-medium">
              4K Ultra-HD Satellite Feeds with Dolby 128-Channel Stadium Acoustics
            </span>
          </div>

          <span className="text-amber-400 font-semibold hidden sm:inline">
            Phase 1 Scheduling Preview
          </span>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}
