"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EventCard } from "@/components/cards/event-card";
import { DUMMY_EVENTS } from "@/lib/constants/events";
import { Search, Calendar, SlidersHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

const EVENT_CATEGORIES = [
  "All Events",
  "Concerts",
  "Sports",
  "Stand-up",
  "Theatre",
  "Festival",
  "Coming Soon",
];

export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState("All Events");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = DUMMY_EVENTS.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeCategory === "Coming Soon") return evt.isComingSoon;
    if (activeCategory !== "All Events") return evt.category === activeCategory;

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Premieres, Concerts & Live Simulcasts"
        subtitle="Experience Stadium Atmosphere on the Big Screen with Dolby Atmos Audio"
        description="From international esports finals and championship boxing to Broadway theatrical encore broadcasts and classical symphonic tributes."
        badge={`${DUMMY_EVENTS.length} Live Shows Scheduled`}
        badgeVariant="primary"
      />

      {/* Search & Filter Bar */}
      <div className="space-y-4 p-4 rounded-2xl bg-[#111827] border border-[#2A3445] shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search concerts, sports championships, comedy tours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
            />
          </div>

          <Button variant="outline" size="sm" className="gap-2 shrink-0">
            <SlidersHorizontal className="h-4 w-4 text-[#FBBF24]" />
            <span>Filter Category</span>
          </Button>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {EVENT_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                  isActive
                    ? "bg-[#FBBF24] text-[#070B12] font-bold shadow-md shadow-[#FBBF24]/20"
                    : "bg-[#161F2E] text-[#94A3B8] hover:text-white hover:bg-[#1f293d] border border-[#2A3445]"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#94A3B8]">
        <span>
          Showing <strong className="text-white">{filteredEvents.length}</strong> live simulcasts
        </span>
        <span className="text-[11px] font-mono">Satellite 4K Feeds Calibrated</span>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#111827] border border-[#2A3445] space-y-2">
          <Calendar className="h-10 w-10 text-[#64748B] mx-auto" />
          <h3 className="text-base font-bold text-white">No live events match this filter</h3>
          <p className="text-xs text-[#94A3B8]">Try selecting a different genre or clearing the search query.</p>
        </div>
      )}
    </div>
  );
}
