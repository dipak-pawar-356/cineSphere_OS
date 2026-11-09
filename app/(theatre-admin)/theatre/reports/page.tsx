import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { getReportSnapshots } from "@/lib/engine/analytics-engine";
import { TheatreReportsClient } from "./theatre-reports-client";

export const metadata = {
  title: "Audit Reports & Settlement Ledgers | CineSphere OS",
  description:
    "Pre-aggregated daily, weekly, and monthly business intelligence snapshots for theatre operations.",
};

export const dynamic = "force-dynamic";

export default async function TheatreReportsPage() {
  const theatreId = "th-pun-001";
  const initialReports = getReportSnapshots(theatreId);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Audit Reports & Settlement Ledgers"
        subtitle="Pre-Aggregated Daily, Weekly & Monthly BI Ledgers for Theatre Operations"
        description="Inspect pre-aggregated box office summaries, auditorium occupancy audits, and distributor split reconciliation sheets."
        badge={`${initialReports.length} Reports Ready`}
        badgeVariant="primary"
      />

      <TheatreReportsClient
        initialReports={initialReports}
        theatreId={theatreId}
      />
    </div>
  );
}
