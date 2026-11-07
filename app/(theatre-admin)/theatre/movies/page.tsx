import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Film, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Assigned Movies | Theatre Admin",
};

export default function TheatreMoviesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Licensed Feature Films"
        subtitle="Currently Ingested DCPs & Studio Exhibition Licenses"
        description="Review local DCP drive ingestion progress, KDM security expiration dates, and upcoming studio premiere assets for this complex."
        badge="Active DCPs"
        badgeVariant="primary"
      />

      <ComingSoon
        moduleName="Local TMS (Theatre Management System) Library & Ingest"
        description="Local network DCP server ingest monitoring, KDM decryption key status, and trailer playlist sequencer deploy in Phase 2."
        versionLabel="v1.2 TMS Ingest"
        icon={Film}
        backHref="/theatre"
        backLabel="Back to Theatre Control"
      />
    </div>
  );
}

