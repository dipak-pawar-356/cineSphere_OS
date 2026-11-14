import React from "react";
import { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Search, Building2, SlidersHorizontal, ShieldCheck } from "lucide-react";
import { theatreSearchService } from "@/lib/services/theatre-search.service";
import { ConnectedTheatreSearch } from "@/components/theatre-search";
import { SecurityActorContext } from "@/types/security-hardening.types";

export const metadata: Metadata = {
  title: "Theatre Search & Discovery Engine | CineSphere OS Super Admin",
  description:
    "Production multi-tenant search index aggregating profiles, locations, legal credentials, amenities, configurations, and administrative staff.",
};

const SUPER_ADMIN: SecurityActorContext = {
  userId: "usr-super-1",
  email: "superadmin@cinesphere.io",
  name: "Global Platform Director",
  role: "SUPER_ADMIN",
  permissions: ["*"],
  correlationId: "corr-search-page",
};

export default async function TheatreSearchEnginePage() {
  // Load initial search payload through Search Engine Index
  const initialData = await theatreSearchService.searchTheatres(
    {
      page: 1,
      pageSize: 12,
      sortBy: "NEWEST",
      sortDirection: "desc",
    },
    SUPER_ADMIN
  );

  // Load saved search presets
  const initialPresets = await theatreSearchService.getUserSavedPresets(SUPER_ADMIN);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Theatre Search & Discovery Engine"
        subtitle="Dedicated multi-tenant search index aggregating cinema profiles, geographical locations, business tax identities, amenities, and operating configurations."
        badge="Phase 3 • Part 12"
      />

      {/* Connected Search Workspace */}
      <ConnectedTheatreSearch
        initialData={initialData}
        initialPresets={initialPresets}
      />
    </div>
  );
}
