import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Film, Layers, Clock } from "lucide-react";
import { MiniChartCard } from "@/components/dashboard/dashboard-widgets";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Theatre Performance Analytics | CineSphere OS",
};

export default function TheatreAnalyticsPage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Theatre Performance & Occupancy Analytics"
        subtitle="Auditorium Utilization, Movie Performance Curves & Peak Hour Admissions Telemetry"
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

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MiniChartCard
          label="Weekly Revenue Momentum"
          value="₹28,40,000"
          trend="+18.4% vs last week"
          dataPoints={[40, 50, 65, 70, 85, 95, 90]}
        />

        <MiniChartCard
          label="Screen 02 (IMAX Laser) Fill Rate Trend"
          value="98.2% Avg"
          trend="+8% above multiplex avg"
          dataPoints={[80, 85, 90, 92, 95, 98, 98]}
        />

        <Card variant="elevated" className="p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
            <Film className="h-4 w-4 text-[#FBBF24]" /> Movie Box Office Share
          </h3>

          <div className="space-y-3 pt-2 text-xs">
            {[
              { name: "Dune: Part Two (Dolby Cinema)", share: 42, color: "bg-[#FBBF24]" },
              { name: "Oppenheimer (IMAX Laser)", share: 34, color: "bg-emerald-400" },
              { name: "Stree 2 (Classic & VIP)", share: 14, color: "bg-[#38BDF8]" },
              { name: "Furiosa / Other (4DX)", share: 10, color: "bg-purple-400" },
            ].map((m) => (
              <div key={m.name} className="space-y-1">
                <div className="flex justify-between text-white font-medium">
                  <span>{m.name}</span>
                  <span className="font-mono text-[#FBBF24]">{m.share}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#111827] overflow-hidden">
                  <div style={{ width: `${m.share}%` }} className={`h-full rounded-full ${m.color}`} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="elevated" className="p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#FBBF24]" /> Peak Hour Traffic Heatmap
          </h3>

          <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
              <span className="text-[#64748B] text-[10px] block">Morning</span>
              <span className="font-bold text-white mt-1 block">42%</span>
              <span className="text-[9px] text-[#94A3B8]">09:00 - 13:00</span>
            </div>
            <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
              <span className="text-[#64748B] text-[10px] block">Matinee</span>
              <span className="font-bold text-white mt-1 block">68%</span>
              <span className="text-[9px] text-[#94A3B8]">13:00 - 17:00</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/40">
              <span className="text-amber-300 text-[10px] block font-bold">Prime Evening</span>
              <span className="font-bold text-[#FBBF24] mt-1 block text-base">96%</span>
              <span className="text-[9px] text-amber-300">17:00 - 21:00</span>
            </div>
            <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
              <span className="text-[#64748B] text-[10px] block">Late Night</span>
              <span className="font-bold text-white mt-1 block">88%</span>
              <span className="text-[9px] text-[#94A3B8]">21:00 - 01:30</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

