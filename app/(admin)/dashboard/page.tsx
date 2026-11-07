import React from "react";
import { PagePlaceholder } from "@/components/placeholders/page-placeholder";
import { LayoutDashboard } from "lucide-react";

export const metadata = {
  title: "Dashboard",
  description: "CineSphere OS Central Command & Super Admin Dashboard.",
};

export default function DashboardPage() {
  return (
    <PagePlaceholder
      badge="Central Command"
      icon={LayoutDashboard}
      targetRole="Super Admin & HQ Executive"
      title="Executive Command Dashboard"
      description="The central nervous system for multi-tenant circuit operations. Monitor real-time gross box office metrics, screen fill rates, hardware telemetry, and automated concession yield."
      phase="Phase 2 Operations Module"
      futureFeatures={[
        "Multi-Tenant Complex Partitioning & Isolation",
        "Live Telemetry Feeds from Connected Laser Projectors",
        "Automated Distributor Royalty Splits & Settlement Ledgers",
        "Interactive 3D WebGL Hall Acoustic & Seating Designer",
      ]}
    />
  );
}

