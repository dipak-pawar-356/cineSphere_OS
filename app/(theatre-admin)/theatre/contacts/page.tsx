import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ConnectedContactWorkspace } from "@/components/theatre-contact";
import { theatreContactService } from "@/lib/services/theatre-contact.service";
import { ArrowLeft, PhoneCall } from "lucide-react";

export const metadata = {
  title: "Contact Directory & Support Lines | CineSphere OS",
};

export default async function TheatreContactsPage() {
  const theatreId = "th-pun-001";
  const theatreName = "CineSphere Grand Cinemas (Phoenix Marketcity, Pune)";

  const bundle = await theatreContactService.getTheatreContactBundle(theatreId);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between gap-3">
        <Link href="/theatre/profile">
          <Button variant="outline" size="xs" className="border-[#2A3445] gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Profile Hub
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Official Contact Directory & Response Desks"
        subtitle="Manage customer support lines, box office voice desks, duty managers, 24/7 emergency response channels, and verified digital presence."
        badge={`${bundle.totalContacts} Configured Channels`}
        badgeVariant="primary"
      />

      <ConnectedContactWorkspace
        theatreId={theatreId}
        theatreName={theatreName}
        isSuperAdmin={false}
        initialBundle={bundle}
      />
    </div>
  );
}
