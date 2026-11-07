import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { UserCheck, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Hall Staff Roster | Theatre Admin",
};

export default function TheatreStaffPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Complex Staff & Shift Schedule"
        subtitle="18 Ushers, Cashiers, Cleaners & Projectionists On Shift"
        description="Assign gate terminals, floor cleaning sweeps between shows, concessions stations, and audit staff punch-in times."
        badge="18 On Shift"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Staff Member
          </Button>
        }
      />

      <ComingSoon
        moduleName="Floor Shift Scheduler & Terminal Assignment"
        description="Shift rotation management, POS terminal checkout balancing, and cleaning sweep task queues deploy in Phase 2."
        versionLabel="v1.2 Operations"
        icon={UserCheck}
        backHref="/theatre"
        backLabel="Back to Theatre Control"
      />
    </div>
  );
}
