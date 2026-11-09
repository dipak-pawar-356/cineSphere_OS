import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { getTheatreAnalyticsDashboard } from "@/lib/engine/analytics-engine";
import { TheatreAnalyticsClient } from "./theatre-analytics-client";

export const metadata = {
  title: "Theatre Performance Analytics | CineSphere OS",
  description:
    "Auditorium Utilization, Movie Performance Curves & Peak Hour Admissions Telemetry.",
};

export const dynamic = "force-dynamic";

export default async function TheatreAnalyticsPage() {
  const theatreId = "th-pun-001";
  const initialAnalytics = getTheatreAnalyticsDashboard(theatreId, "last30days");

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Theatre Performance & Occupancy Analytics"
        subtitle="Auditorium Utilization, Movie Performance Curves & Peak Hour Admissions Telemetry"
        description="Review real-time audience telemetry, hourly booking velocity, format yield splits, and revenue per available seat."
        badge="Live Telemetry"
        badgeVariant="primary"
        actions={
          <Link href={ROUTES.THEATRE_ADMIN.REPORTS}>
            <Button variant="outline" size="sm" className="gap-2 border-[#2A3445]">
              View Audit Reports →
            </Button>
          </Link>
        }
      />

      <TheatreAnalyticsClient
        initialData={initialAnalytics}
        theatreId={theatreId}
      />
    </div>
  );
}
