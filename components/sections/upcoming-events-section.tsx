import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DUMMY_EVENTS } from "@/lib/constants/events";
import { EventCard } from "@/components/cards/event-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";

export function UpcomingEventsSection() {
  const previewEvents = DUMMY_EVENTS.slice(0, 3);

  return (
    <section className="py-20 relative bg-[#0B0F19]/60 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Beyond Cinema"
          title="Live Concerts, Sports & Premieres"
          subtitle="Transform traditional cinema halls into high-definition simulcast stadiums for global sports championships and live symphonic performances."
          action={
            <Link href="/events">
              <Button variant="outline" size="sm" className="group">
                <span>View All Events</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {previewEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
