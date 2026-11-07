import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Clock, UserCheck, Calendar } from "lucide-react";

export const metadata = {
  title: "Shift Schedule | Staff Terminal",
};

export default function StaffSchedulePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Floor Shift Schedule & Rotation"
        subtitle="Current Station: Gate Scanner Terminal #08 • Shift Ends 23:00"
        description="View your upcoming auditorium cleaning assignments, intermission assistance stations, and shift handover notes."
        badge="Shift In Progress"
        badgeVariant="primary"
      />

      <ComingSoon
        moduleName="Personal Floor Roster & Shift Swap Requests"
        description="Automated punch-in timesheet logging and peer shift exchange requests launch in Phase 2."
        versionLabel="v1.2 Workforce"
        icon={Clock}
        backHref="/staff"
        backLabel="Back to Shift Dashboard"
      />
    </div>
  );
}
