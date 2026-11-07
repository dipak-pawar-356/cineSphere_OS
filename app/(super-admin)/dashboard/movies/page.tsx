import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Film, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Movie Catalog | Super Admin HQ",
};

export default function SuperAdminMoviesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Global Film Catalog & DCP Management"
        subtitle="Studio Releases, Distributor Contracts & Censor Ratings"
        description="Ingest theatrical releases, assign studio royalty terms, distribute KDM security keys, and manage promotional media kits."
        badge="Catalog Control"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Ingest Film Asset
          </Button>
        }
      />

      <ComingSoon
        moduleName="Studio Release Orchestration & KDM Key Dispatch"
        description="Automated studio metadata synchronization, poster CDN caching, and distributor contract terms will activate in Phase 2."
        versionLabel="v1.2 Content Hub"
        icon={Film}
        backHref="/dashboard"
        backLabel="Back to Overview"
      />
    </div>
  );
}

