import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Patron Management | Super Admin HQ",
};

export default function SuperAdminCustomersPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Patron Registry & Loyalty Intelligence"
        subtitle="Unified Customer Identities, CineClub Credits & Booking Histories"
        description="View patron accounts, VIP tier loyalty milestones, preferences, and support resolution tickets across the cinema network."
        badge="Patron CRM"
        badgeVariant="primary"
      />

      <ComingSoon
        moduleName="Customer 360 & Omnichannel Loyalty Rewards"
        description="Comprehensive customer profiling, automated gift pass distribution, and GDPR data portability tools are scheduled for Phase 2."
        versionLabel="v1.2 CRM Engine"
        icon={Users}
        backHref="/dashboard"
        backLabel="Back to Overview"
      />
    </div>
  );
}
