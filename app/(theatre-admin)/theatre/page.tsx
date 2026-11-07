import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard, MiniChartCard, SystemStatusCard, ActivityCard } from "@/components/dashboard/dashboard-widgets";
import { Building2, Layers, Film, Ticket, Users, Plus, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Theatre Command Portal | CineSphere OS",
};

export default function TheatreAdminDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="AMC Empire 25 — Control Center"
        subtitle="Times Square Flagship Complex • 12 Active Auditoriums"
        description="Daily operational console for showtime dispatch, laser projector calibration, ticket queue flow, and floor staff assignments."
        badge="Theatre Operator"
        badgeVariant="primary"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Calibrate Laser
            </Button>
            <Button variant="primary" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Schedule Showtime
            </Button>
          </div>
        }
      />

      {/* Operator KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Today's Box Office"
          value="$42,850"
          delta="+14.2% vs yesterday"
          deltaType="positive"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          label="Admissions Today"
          value="2,410 Patrons"
          delta="88% Fill Rate"
          deltaType="positive"
          icon={<Ticket className="h-4 w-4" />}
        />
        <MetricCard
          label="Screen Telemetry"
          value="12 / 12 Active"
          delta="100% Calibrated"
          deltaType="positive"
          icon={<Layers className="h-4 w-4" />}
        />
        <MetricCard
          label="Floor Staff on Duty"
          value="18 Ushers & POS"
          delta="Shift 2 Active"
          deltaType="neutral"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Live Occupancy & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MiniChartCard
            label="Hourly Admissions Flow (Peak Evening Drop)"
            value="480 tickets / hr"
            trend="+32% vs last Friday"
            dataPoints={[25, 40, 50, 70, 85, 95, 90, 80]}
          />
        </div>
        <div>
          <SystemStatusCard
            clusterName="Times Square Local LAN & Projector Rack"
            uptime="100.0%"
            latency="4ms (On-Premises)"
            activeNodes={12}
          />
        </div>
      </div>

      <ActivityCard
        title="Today's Screen Activity"
        activities={[
          { id: "1", user: "IMAX Laser Hall 1", action: "Show #104 started on time (420 patrons seated)", time: "5m ago" },
          { id: "2", user: "Dolby Cinema Hall 3", action: "Audio processor calibration verified 128dB headroom", time: "18m ago" },
          { id: "3", user: "Concessions POS #04", action: "Completed combo order #8841 ($38.50)", time: "24m ago" },
          { id: "4", user: "Gate Usher Terminal #01", action: "Scanned 148 digital QR tickets in 10 minutes", time: "30m ago" },
        ]}
      />
    </div>
  );
}

