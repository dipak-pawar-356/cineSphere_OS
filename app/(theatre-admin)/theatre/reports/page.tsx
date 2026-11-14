import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { getReportSnapshots } from "@/lib/engine/analytics-engine";
import { theatreReportsRepository } from "@/lib/repositories/theatre-reports.repository";
import { TheatreReportsClient } from "./theatre-reports-client";

export const metadata = {
  title: "Reports & Analytics | CineSphere OS",
  description:
    "Decoupled historical read-model store, KPI telemetry engine, and multi-tenant business intelligence for cinema operations.",
};

export const dynamic = "force-dynamic";

export default async function TheatreReportsPage() {
  const theatreId = "th-pun-001";
  const initialReports = getReportSnapshots(theatreId);

  // Generate initial Executive Summary report payload for instant zero-latency render
  const initialReportPayload = theatreReportsRepository.buildReport(
    theatreId,
    "DEF_EXECUTIVE_SUMMARY",
    { dateRangePreset: "THIS_MONTH" },
    {
      userId: "usr-admin-pune",
      role: "THEATRE_ADMIN",
      theatreId,
      permissions: ["REPORTS_VIEW", "ANALYTICS_VIEW"],
      correlationId: "corr-init-reports-page",
    }
  );

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Reports & Analytics Layer"
        subtitle="Decoupled Historical Read-Model Store & Canonical KPI Telemetry"
        description="Inspect multi-dimensional box office ledgers, seat occupancy heatmaps, screen yield matrices, and customer cohort retention profiles."
        badge="Phase 3 — Part 15"
        badgeVariant="primary"
      />

      <TheatreReportsClient
        initialReports={initialReports}
        initialReportPayload={initialReportPayload}
        theatreId={theatreId}
      />
    </div>
  );
}
