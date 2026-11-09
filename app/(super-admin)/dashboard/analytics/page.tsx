import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getSuperAdminAnalyticsDashboard } from "@/lib/engine/analytics-engine";
import { SuperAdminAnalyticsClient } from "./super-admin-analytics-client";

export const metadata = {
  title: "Platform Analytics & Business Intelligence | CineSphere OS",
  description:
    "Cross-circuit audience telemetry, revenue momentum, format yield, and hierarchical drill-down navigator.",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminAnalyticsPage() {
  const initialAnalytics = getSuperAdminAnalyticsDashboard("last30days");

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Platform Analytics & Intelligence"
        subtitle="Cross-Circuit Occupancy, Revenue Heatmaps, Format Comparisons & Demographic Velocity"
        description="Comprehensive real-time audience telemetry, hourly seat velocity, and comparative yield across 25 connected multiplexes."
        badge="Analytics Engine"
        badgeVariant="primary"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/dashboard/reports">
              <Button variant="outline" size="sm" className="gap-2 border-[#2A3445]">
                View Circuit Reports →
              </Button>
            </Link>
          </div>
        }
      />

      <SuperAdminAnalyticsClient initialData={initialAnalytics} />
    </div>
  );
}
