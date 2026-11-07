import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Show Schedules | Theatre Admin",
};

export default function TheatreShowsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Complex Daily Showtime Schedule"
        subtitle="Auditorium Slotting, Cleaning Intermissions & Seat Allocation"
        description="Schedule morning matinees, prime-time screenings, and midnight premiere slots across all 12 auditoriums with conflict detection."
        badge="Daily Schedule"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Screening Slot
          </Button>
        }
      />

      <ComingSoon
        moduleName="Visual Drag & Drop Showtime Timeline Scheduler"
        description="Gantt chart-style showtime sequencer with automatic projector automation triggers and cleaning buffer guards launches in Phase 2."
        versionLabel="v1.2 Timeline Grid"
        icon={Calendar}
        backHref="/theatre"
        backLabel="Back to Theatre Control"
      />
    </div>
  );
}
