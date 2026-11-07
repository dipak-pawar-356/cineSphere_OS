import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Settings, Save, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Theatre Configuration | Theatre Admin",
};

export default function TheatreSettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Theatre Facility & Hardware Configuration"
        subtitle="Address, Box Office Hours, Emergency Protocols & Local Policies"
        description="Configure local concession menus, parking validation codes, door opening buffer periods, and sound level parameters."
        badge="Theatre Settings"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" className="gap-2">
            <Save className="h-4 w-4" /> Save Theatre Profile
          </Button>
        }
      />

      <ComingSoon
        moduleName="Theatre Facility & Floor Device Configuration"
        description="Local receipt printer configuration, barcode scanner pairing, and digital display signage feeds connect in Phase 2."
        versionLabel="v1.2 Local Setup"
        icon={Settings}
        backHref="/theatre"
        backLabel="Back to Theatre Control"
      />
    </div>
  );
}

