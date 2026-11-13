import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ConnectedBusinessWorkspace } from "@/components/theatre-business";
import { theatreBusinessService } from "@/lib/services/theatre-business.service";
import { ArrowLeft, Building, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Business & Legal Profile | CineSphere OS",
};

export default async function TheatreBusinessPage() {
  const theatreId = "th-pun-001";

  const bundle = await theatreBusinessService.getBusinessBundle(theatreId);

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
        title="Corporate Business Profile & Compliance Governance"
        subtitle="Manage corporate entity identity, government registrations (GSTIN/PAN/CIN), country-aware tax frameworks, consumer billing layouts, and legal compliance vault."
        badge={bundle.profile ? `v${bundle.profile.version} — ${bundle.compliance?.verificationStatus || "DRAFT"}` : "Unprovisioned"}
        badgeVariant="primary"
      />

      <ConnectedBusinessWorkspace
        theatreId={theatreId}
        isSuperAdmin={false}
        initialBundle={bundle}
      />
    </div>
  );
}
