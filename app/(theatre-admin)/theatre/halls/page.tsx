import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Auditoriums & Screens | Theatre Admin",
};

export default function TheatreHallsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Complex Screens & Auditoriums"
        subtitle="12 Physical Auditoriums • 2 IMAX with Laser • 1 Dolby Cinema"
        description="Monitor projector bulb/laser hours, acoustic test sweeps, motorized recliner diagnostics, and seat configuration matrices for this theatre."
        badge="12 Auditoriums"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Hall Screen
          </Button>
        }
      />

      <ComingSoon
        moduleName="Local Hall Seat Re-Configuration & Projector Telemetry"
        description="Direct Christie/Barco laser hardware status readings, audio curve adjustments, and seat maintenance locks activate in Phase 2."
        versionLabel="v1.2 Theatre Engine"
        icon={Layers}
        backHref="/theatre"
        backLabel="Back to Theatre Control"
      />
    </div>
  );
}

