import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ConnectedConfigurationWorkspace } from "@/components/theatre-configuration";
import { theatreConfigurationService } from "@/lib/services/theatre-configuration.service";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Dynamic Theatre Configuration | CineSphere OS",
};

export default async function TheatreConfigurationPage() {
  const theatreId = "th-pun-001";

  const bundle = await theatreConfigurationService.getConfigurationBundle(theatreId);

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
        title="Dynamic Theatre Configuration & Governance"
        subtitle="Manage localization parameters, booking rules, seat lock timers, cancellation deduction percentages, age restrictions, and modular feature toggles."
        badge={bundle.configuration ? `v${bundle.configuration.version} — ${bundle.configuration.status}` : "Unconfigured"}
        badgeVariant="primary"
      />

      <ConnectedConfigurationWorkspace
        theatreId={theatreId}
        isSuperAdmin={false}
        initialBundle={bundle}
      />
    </div>
  );
}
