import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Users, Heart } from "lucide-react";

export const metadata = {
  title: "Theatre Patrons | Theatre Admin",
};

export default function TheatreCustomersPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Local Theatre Patrons & Club Members"
        subtitle="Frequent Moviegoers, Special Needs Assistance & Lost & Found"
        description="Review local theatre patron profiles, VIP seating notes, wheelchair assistance requests, and concession pre-order habits."
        badge="Patron Roster"
        badgeVariant="primary"
      />

      <ComingSoon
        moduleName="Local Patron Hospitality & VIP Guest List"
        description="Dedicated guest service notes, VIP usher greetings, and accessibility coordination tools activate in Phase 2."
        versionLabel="v1.2 Hospitality Core"
        icon={Users}
        backHref="/theatre"
        backLabel="Back to Theatre Control"
      />
    </div>
  );
}
