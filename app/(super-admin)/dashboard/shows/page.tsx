import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Show Schedules | Super Admin HQ",
};

export default function SuperAdminShowsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Circuit-Wide Show Programming"
        subtitle="Auditorium Timetables, Intermission Timing & Audio Profiles"
        description="Program weekly showtime matrices, configure dynamic prime-time pricing rules, and automate projector start triggers."
        badge="Schedule Grid"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Create Show Schedule
          </Button>
        }
      />

      <ComingSoon
        moduleName="Algorithmic Showtime Yield Optimizer"
        description="Automated showtime spacing, cleaning buffer adjustments, and demand-responsive pricing algorithms will launch in Phase 2."
        versionLabel="v1.2 Scheduling Engine"
        icon={Calendar}
        backHref="/dashboard"
        backLabel="Back to Overview"
      />
    </div>
  );
}
