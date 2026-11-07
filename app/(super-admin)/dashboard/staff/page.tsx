import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { UserCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Field Staff | Super Admin HQ",
};

export default function SuperAdminStaffPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Field Staff & Floor Operations Directory"
        subtitle="Box Office Ushers, Projectionists, Concessions Staff & Floor Leads"
        description="Monitor active shifts, terminal assignments, POS scanner permissions, and attendance logs across all cinema auditoriums."
        badge="Field Workforce"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Provision Staff
          </Button>
        }
      />

      <ComingSoon
        moduleName="Floor Roster & Mobile POS Scanner Management"
        description="Shift rotation scheduling, biometric PIN assignment, and real-time gate scanner throughput metrics launch in Phase 2."
        versionLabel="v1.2 Workforce Engine"
        icon={UserCheck}
        backHref="/dashboard"
        backLabel="Back to Overview"
      />
    </div>
  );
}

