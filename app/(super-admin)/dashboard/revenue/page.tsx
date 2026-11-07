import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { TrendingUp, DollarSign, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Revenue Yield | Super Admin HQ",
};

export default function SuperAdminRevenuePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Circuit Financials & Royalty Splits"
        subtitle="Gross Box Office, Distributor Remittances & F&B Margins"
        description="Calculate automated distributor splits (Warner, Universal, Disney), tax withholdings, dynamic convenience fee yields, and concession profitability."
        badge="Financial Command"
        badgeVariant="success"
        actions={
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Download Settlement Statement
          </Button>
        }
      />

      <ComingSoon
        moduleName="Automated Distributor Royalty Splits & Stripe Settlements"
        description="Smart contract reconciliation, multi-currency payout routing, and automated tax reporting connect in Phase 2."
        versionLabel="v1.2 Financial Core"
        icon={TrendingUp}
        backHref="/dashboard"
        backLabel="Back to Overview"
      />
    </div>
  );
}
