import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Ticket, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Global Bookings | Super Admin HQ",
};

export default function SuperAdminBookingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Cross-Circuit Ticketing Ledger"
        subtitle="Real-time Patron Transactions, Gateway Settlements & Refunds"
        description="Audit all ticket reservations, concessions add-ons, and dynamic QR validations occurring across all 152 multiplexes."
        badge="Live Ledger"
        badgeVariant="success"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        }
      />

      <ComingSoon
        moduleName="Real-Time Ticketing Transaction Gateway & Audit Log"
        description="High-throughput transactional ledger with instant refund processing and dispute resolution will deploy in Phase 2."
        versionLabel="v1.2 Transaction Engine"
        icon={Ticket}
        backHref="/dashboard"
        backLabel="Back to Overview"
      />
    </div>
  );
}

