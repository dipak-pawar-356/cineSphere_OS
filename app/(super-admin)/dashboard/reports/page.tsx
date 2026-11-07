import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Audit Reports | Super Admin HQ",
};

export default function SuperAdminReportsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Compliance & Audit Reports"
        subtitle="Distributor Tax Ledgers, EDI Filings & Hardware Maintenance History"
        description="Generate automated Rentrak/Comscore box office submissions, fiscal regulatory filings, and hardware laser uptime logs."
        badge="Compliance Audit"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Generate Audit Package
          </Button>
        }
      />

      <ComingSoon
        moduleName="Automated Rentrak / Comscore EDI Dispatch"
        description="Nightly automated EDI 460 box office exports, GST/VAT tax schedules, and auditor sign-off workflows activate in Phase 2."
        versionLabel="v1.2 Compliance Engine"
        icon={FileText}
        backHref="/dashboard"
        backLabel="Back to Overview"
      />
    </div>
  );
}
