import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { HelpCircle, Headphones, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Patron Concierge Help | CineSphere",
};

export default function CustomerSupportPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Patron Concierge & Booking Help"
        subtitle="Dedicated Assistance for Tickets, Refunds & Special Accommodations"
        description="Need urgent help with an upcoming screening tonight? Our specialized patron concierge desk is on standby for instant ticket assistance."
        badge="24/7 Concierge"
        badgeVariant="info"
      />

      <ComingSoon
        moduleName="Priority Patron Concierge Live Ticket Assistance"
        description="Instant live agent chat and automated booking discrepancy resolution activate in Phase 2."
        versionLabel="v1.2 Concierge Desk"
        icon={HelpCircle}
        backHref="/profile"
        backLabel="Back to Profile"
      />
    </div>
  );
}
