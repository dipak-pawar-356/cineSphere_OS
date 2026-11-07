import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Building2, Plus, MapPin, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Theatres Circuit | Super Admin HQ",
};

export default function SuperAdminTheatresPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Multi-Tenant Cinema Circuit"
        subtitle="152 Registered Multiplexes Across 14 Territories"
        description="Oversee cinema chains, contract licenses, hardware certifications, and localized pricing tiers across all onboarded exhibitors."
        badge="152 Complexes"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Cinema Tenant
          </Button>
        }
      />

      <ComingSoon
        moduleName="Cinema Circuit Manager & Licensing Gate"
        description="Complete exhibitor tenant provisioning, custom domain routing, and hardware serial telemetry will connect in Phase 2."
        versionLabel="v1.2 Operations"
        icon={Building2}
        backHref="/dashboard"
        backLabel="Back to Overview"
      />
    </div>
  );
}
