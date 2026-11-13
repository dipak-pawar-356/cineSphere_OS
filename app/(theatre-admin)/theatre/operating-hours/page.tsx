import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ConnectedOperatingHoursWorkspace } from "@/components/theatre-operating-hours";
import { theatreOperatingHoursService } from "@/lib/services/theatre-operating-hours.service";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Operating Hours & Schedules | CineSphere OS",
};

export default async function TheatreOperatingHoursPage() {
  const theatreId = "th-pun-001";

  const bundle = await theatreOperatingHoursService.getOperatingBundle(theatreId);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between gap-3">
        <Link href="/theatre/profile">
          <Button variant="outline" size="xs" className="border-[#2A3445] gap-1.5 text-zinc-300 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Profile Hub
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Theatre Operating Hours & Schedule Management"
        subtitle="Configure daily schedules, day-by-day weekly operating hours, holiday calendars, facility maintenance downtime, and special midnight/festival releases."
        badge={bundle.profile ? `v${bundle.profile.version} — ${bundle.profile.status}` : "Unconfigured"}
        badgeVariant="primary"
      />

      <ConnectedOperatingHoursWorkspace
        theatreId={theatreId}
        isSuperAdmin={false}
        initialBundle={bundle}
      />
    </div>
  );
}
