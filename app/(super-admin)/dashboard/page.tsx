import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard, MiniChartCard, QuickActionCard, SystemStatusCard, ActivityCard } from "@/components/dashboard/dashboard-widgets";
import { Building2, Film, Ticket, Users, Layers, ShieldCheck, DollarSign, Plus, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "HQ Dashboard | CineSphere OS",
  description: "CineSphere OS Central Command & Multi-Tenant Super Admin Headquarters.",
};

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Executive Command Center"
        subtitle="Global Cinema Circuit Management & Operations Telemetry"
        description="Monitor real-time gross box office yield, auditorium laser projector statuses, concurrent patron bookings, and cross-circuit distributor settlements."
        badge="Live Telemetry"
        badgeVariant="success"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Building2 className="h-4 w-4" /> Add Theatre
            </Button>
            <Button variant="primary" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Deploy Schedule
            </Button>
          </div>
        }
      />

      {/* Top Telemetry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Gross Circuit Revenue"
          value="$4.82M"
          delta="+18.4% vs last week"
          deltaType="positive"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          label="Active Theatres"
          value="152 Complexes"
          delta="100% Operational"
          deltaType="positive"
          icon={<Building2 className="h-4 w-4" />}
        />
        <MetricCard
          label="Connected Screens"
          value="654 Auditoriums"
          delta="8 under maintenance"
          deltaType="neutral"
          icon={<Layers className="h-4 w-4" />}
        />
        <MetricCard
          label="Active Bookings"
          value="48,290 Tickets"
          delta="+24.1% peak drop"
          deltaType="positive"
          icon={<Ticket className="h-4 w-4" />}
        />
      </div>

      {/* Analytics & Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MiniChartCard
            label="Real-time Box Office Influx"
            value="$184,200 / hr"
            trend="+22.8% during premiere"
            dataPoints={[20, 35, 45, 60, 55, 75, 90, 85, 95]}
          />
        </div>
        <div>
          <SystemStatusCard
            clusterName="CineSphere Global Edge Circuit"
            uptime="99.99%"
            latency="18ms"
            activeNodes={152}
          />
        </div>
      </div>

      {/* Live Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityCard
          title="Circuit Operational Feed"
          activities={[
            { id: "1", user: "AMC Century City", action: "Calibrated Christie 4K Laser in Hall #04", time: "2m ago" },
            { id: "2", user: "PVR Luxe Mumbai", action: "Published weekend IMAX schedule for Gladiator II", time: "8m ago" },
            { id: "3", user: "Regal Times Square", action: "Processed 850 advance premiere reservations", time: "14m ago" },
            { id: "4", user: "BFI IMAX London", action: "Dolby Atmos audio processor firmware verified", time: "25m ago" },
          ]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickActionCard
            title="Film Catalog Import"
            description="Synchronize distributor metadata, DCP keys, and trailers directly from studio feeds."
            icon={<Film className="h-5 w-5" />}
            actionLabel="Sync Catalog"
          />
          <QuickActionCard
            title="Royalty Split Audit"
            description="Reconcile weekend box office revenue with Warner Bros, Universal, and Sony Pictures."
            icon={<ShieldCheck className="h-5 w-5" />}
            actionLabel="Review Ledgers"
          />
        </div>
      </div>
    </div>
  );
}
