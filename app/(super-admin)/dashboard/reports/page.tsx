import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { getReportSnapshots } from "@/lib/engine/analytics-engine";
import { SuperAdminReportsClient } from "./super-admin-reports-client";

export const metadata = {
  title: "Circuit Audit Reports & Financial Ledgers | CineSphere OS",
  description:
    "Cross-circuit box office reconciliations, platform settlement reports, and multi-tenant audit ledgers.",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminReportsPage() {
  const initialReports = getReportSnapshots();

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Circuit Audit Reports & Financial Ledgers"
        subtitle="Platform-Wide Box Office Reconciliations & Multi-Tenant Audit Ledgers"
        description="Inspect circuit-wide financial sheets, distributor settlement reports, and automated occupancy telemetry snapshots."
        badge={`${initialReports.length} Reports Ready`}
        badgeVariant="primary"
      />

      <SuperAdminReportsClient initialReports={initialReports} />
    </div>
  );
}
