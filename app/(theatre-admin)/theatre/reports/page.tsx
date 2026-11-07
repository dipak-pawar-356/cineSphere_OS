import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Box Office Reports | Theatre Admin",
};

export default function TheatreReportsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Daily Box Office & Concession Reports"
        subtitle="End-of-Day Cash Balancing, Card Settlements & Fill Rates"
        description="Review end-of-day register reconcilements, concession yield audits, ticket refund logs, and manager sign-off packages."
        badge="Daily Reconciliation"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Download Daily Audit
          </Button>
        }
      />

      <ComingSoon
        moduleName="End-of-Day Register Reconciliation & Manager Sign-Off"
        description="Automated cash drawer balancing, credit terminal batch closing, and distributor settlement export activate in Phase 2."
        versionLabel="v1.2 Auditing Engine"
        icon={FileText}
        backHref="/theatre"
        backLabel="Back to Theatre Control"
      />
    </div>
  );
}

