import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Layers, Plus, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Auditoriums & Halls | Super Admin HQ",
};

export default function SuperAdminHallsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Auditoriums & Screen Architecture"
        subtitle="654 Connected Laser & Multi-Format Projection Screens"
        description="Configure auditorium seat topologies, audio profile calibrations, and laser projection parameters across the global circuit."
        badge="654 Auditoriums"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Provision Hall
          </Button>
        }
      />

      <ComingSoon
        moduleName="Interactive 3D WebGL Hall Topology Designer"
        description="Interactive 3D auditorium seat mapping, curved screen geometry, and acoustic simulation will launch in Phase 2 with Three.js integration."
        versionLabel="v1.3 Spatial Engine"
        icon={Layers}
        backHref="/dashboard"
        backLabel="Back to Overview"
      />
    </div>
  );
}
