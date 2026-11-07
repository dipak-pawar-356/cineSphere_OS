"use client";

import React from "react";
import Image from "next/image";
import { Calendar, Clock, MapPin, Star, Tag } from "lucide-react";
import { LiveEvent } from "@/lib/types";
import { ComingSoonButton } from "@/components/buttons/coming-soon-button";
import { cn } from "@/lib/utils";

export interface EventCardProps {
  event: LiveEvent;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl bg-[#161F2E]/90 border border-white/5 hover:border-amber-400/30 transition-all duration-300 shadow-xl overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-500/5",
        className
      )}
    >
      {/* Banner image */}
      <div className="relative h-52 w-full overflow-hidden bg-[#070B12]">
        <Image
          src={event.banner}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161F2E] via-black/40 to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400 text-black shadow-md">
            {event.category}
          </span>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-amber-400/30 text-amber-400 text-xs font-bold shadow-lg">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{event.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Starting Price Overlay */}
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-white/10 text-xs">
          <span className="text-[#9CA3AF]">From </span>
          <span className="font-bold text-white text-sm">{event.priceStart}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center gap-3 text-xs text-amber-400/90 font-medium mb-1.5">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              {event.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              {event.time}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
            {event.title}
          </h3>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <MapPin className="h-3.5 w-3.5 text-[#9CA3AF] shrink-0" />
            <span className="line-clamp-1">{event.venue}, {event.city}</span>
          </div>

          {/* Tags */}
          <div className="mt-3.5 flex flex-wrap gap-1">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 border border-white/10 text-[#9CA3AF]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-[#9CA3AF]">
            {event.isComingSoon ? "Registrations Opening Soon" : "Limited Passes Available"}
          </span>

          <ComingSoonButton
            featureName={`Pass Registration: ${event.title}`}
            description={`Live event ticketing and pass allocation for "${event.title}" will unlock in Phase 2.`}
            size="sm"
            variant={event.isComingSoon ? "outline" : "primary"}
            label={event.isComingSoon ? "Notify Me" : "Book Passes"}
          />
        </div>
      </div>
    </div>
  );
}
