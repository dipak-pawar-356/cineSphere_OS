"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  AnalyticsDrilldownLevel,
  AnalyticsDrilldownNode,
  SuperAdminDashboardAnalytics,
  TimeFilterPreset,
} from "@/types/analytics.types";
import {
  fetchDrilldownAction,
  fetchSuperAdminDashboardMetricsAction,
} from "@/actions/analytics-actions";
import {
  AreaChart,
  BarChart,
  DonutChart,
  LineChart,
  TrendMetricCard,
} from "@/components/analytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Film,
  Flame,
  Globe,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";

interface SuperAdminAnalyticsClientProps {
  initialData: SuperAdminDashboardAnalytics;
}

export function SuperAdminAnalyticsClient({
  initialData,
}: SuperAdminAnalyticsClientProps) {
  const [data, setData] = useState<SuperAdminDashboardAnalytics>(initialData);
  const [timeFilter, setTimeFilter] = useState<TimeFilterPreset>(
    initialData.dateRange.preset
  );
  const [isPending, startTransition] = useTransition();

  // Hierarchical Drilldown state
  const [drilldownLevel, setDrilldownLevel] = useState<AnalyticsDrilldownLevel>("PLATFORM");
  const [drilldownNodes, setDrilldownNodes] = useState<AnalyticsDrilldownNode[]>([]);
  const [drilldownBreadcrumbs, setDrilldownBreadcrumbs] = useState<
    Array<{ level: AnalyticsDrilldownLevel; id?: string; label: string }>
  >([{ level: "PLATFORM", label: "Entire Circuit" }]);

  const handleTimeFilterChange = (preset: TimeFilterPreset) => {
    setTimeFilter(preset);
    startTransition(async () => {
      const res = await fetchSuperAdminDashboardMetricsAction(preset);
      if (res.success && res.data) {
        setData(res.data);
      }
    });
  };

  const handleDrilldownClick = (node: AnalyticsDrilldownNode) => {
    startTransition(async () => {
      const nextLevel: AnalyticsDrilldownLevel =
        node.level === "THEATRE"
          ? "THEATRE"
          : node.level === "HALL"
          ? "HALL"
          : node.level === "SHOW"
          ? "SHOW"
          : "BOOKING";

      const res = await fetchDrilldownAction({
        level: node.level,
        id: node.id,
      });

      if (res.success && res.data) {
        setDrilldownLevel(node.level);
        setDrilldownNodes(res.data);
        setDrilldownBreadcrumbs((prev) => [
          ...prev,
          { level: node.level, id: node.id, label: node.label },
        ]);
      }
    });
  };

  const handleBreadcrumbClick = (idx: number) => {
    const target = drilldownBreadcrumbs[idx];
    startTransition(async () => {
      const res = await fetchDrilldownAction({
        level: target.level,
        id: target.id,
      });
      if (res.success && res.data) {
        setDrilldownLevel(target.level);
        setDrilldownNodes(res.data);
        setDrilldownBreadcrumbs(drilldownBreadcrumbs.slice(0, idx + 1));
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Time Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {[
            { id: "today" as const, label: "Today" },
            { id: "yesterday" as const, label: "Yesterday" },
            { id: "last7days" as const, label: "Last 7 Days" },
            { id: "last30days" as const, label: "Last 30 Days" },
            { id: "thisMonth" as const, label: "This Month" },
            { id: "quarter" as const, label: "Quarter" },
            { id: "year" as const, label: "Year" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleTimeFilterChange(item.id)}
              disabled={isPending}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${
                timeFilter === item.id
                  ? "bg-[#FBBF24] text-[#070B12] font-bold shadow-sm"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-[#94A3B8] flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Cross-Circuit Engine Online</span>
        </div>
      </div>

      {/* 1. TOP PLATFORM KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TrendMetricCard
          title="Circuit Total Revenue"
          value={`₹${(data.cards.totalRevenue / 10000000).toFixed(2)} Cr`}
          subtitle={`${data.cards.activeTheatres} active multiplex properties`}
          changePercent={data.cards.platformGrowthRate}
          changeLabel="vs last month"
          sparklineData={[62, 68, 74, 79, 81, 84]}
          icon={<DollarSign className="h-4 w-4" />}
        />

        <TrendMetricCard
          title="Circuit Bookings"
          value={data.cards.totalBookings.toLocaleString("en-IN")}
          subtitle={`ATP: ₹${data.platformKPIs.averageTicketPrice.toFixed(0)}`}
          changePercent={12.4}
          changeLabel="booking velocity"
          sparklineData={[110, 118, 124, 129, 135]}
          icon={<Ticket className="h-4 w-4" />}
        />

        <TrendMetricCard
          title="Platform Occupancy"
          value={`${data.cards.platformOccupancy}%`}
          subtitle="360,000 seat capacity aggregate"
          changePercent={6.1}
          changeLabel="cross-format avg"
          sparklineData={[74, 76, 79, 81, 82]}
          icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
        />

        <TrendMetricCard
          title="Theatre Fleet Scale"
          value={`${data.cards.totalTheatres} Properties`}
          subtitle={`${data.cards.pendingTheatres} pending review, ${data.cards.suspendedTheatres} suspended`}
          changePercent={8.0}
          changeLabel="onboarding rate"
          icon={<Building2 className="h-4 w-4" />}
        />
      </div>

      {/* 2. CHARTS: Cross-Circuit Revenue Momentum & City Market Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChart
          title="Circuit Gross Revenue Momentum"
          subtitle="Aggregated 4-week ticket revenue curve across all properties"
          data={data.charts.circuitRevenueTrend}
          color="#FBBF24"
          valueFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
        />

        <DonutChart
          title="Metropolitan City Market Share"
          subtitle="Revenue distribution across premier cinema circuits"
          data={data.charts.cityDistributionDonut}
          centerLabel="National Circuit"
          centerValue={`₹${(data.cards.totalRevenue / 10000000).toFixed(2)}Cr`}
        />
      </div>

      {/* 3. CHARTS: Theatre Comparison & Occupancy Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          title="Top Multiplex Collections Comparison"
          subtitle="Gross collections comparison across leading city circuits"
          data={data.charts.theatreComparisonBar}
          valueFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
        />

        <LineChart
          title="Platform Occupancy Trajectory"
          subtitle="Multi-week auditorium fill rate percentage"
          data={data.charts.platformOccupancyArea}
          strokeColor="#38BDF8"
          valueFormatter={(val) => `${val}% Occupancy`}
        />
      </div>

      {/* 4. THEATRE PERFORMANCE TABLE */}
      <Card variant="elevated" className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              Circuit Multiplex Performance Matrix
            </h4>
            <p className="text-xs text-[#94A3B8]">
              Comparative gross receipts, ticket volume, and fill rate across all connected cinemas.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#2A3445] bg-[#070B12]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#111827] text-[#94A3B8] font-mono border-b border-[#2A3445]">
              <tr>
                <th className="p-3">Multiplex Property</th>
                <th className="p-3">City Region</th>
                <th className="p-3 text-right">Gross Collections</th>
                <th className="p-3 text-right">Total Bookings</th>
                <th className="p-3 text-right">Avg Occupancy</th>
                <th className="p-3 text-right">Momentum</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {data.circuitPerformance.revenueByTheatre.map((t) => (
                <tr key={t.theatreId} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="p-3 font-bold text-white">{t.theatreName}</td>
                  <td className="p-3 text-[#94A3B8] font-mono">{t.city}</td>
                  <td className="p-3 text-right font-mono font-bold text-white">
                    ₹{t.revenue.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3 text-right font-mono text-[#94A3B8]">
                    {t.bookings.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-400 font-bold">
                    {t.occupancy}%
                  </td>
                  <td className="p-3 text-right font-mono text-[#FBBF24]">
                    +{t.growthRate}%
                  </td>
                  <td className="p-3 text-right">
                    <Badge variant={t.status === "ACTIVE" ? "primary" : "secondary"} size="sm">
                      {t.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 5. HIERARCHICAL DRILL-DOWN NAVIGATION */}
      <Card variant="elevated" className="p-5 space-y-4 border-[#FBBF24]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#FBBF24]" />
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                Hierarchical Performance Trace Navigator
              </h4>
              <p className="text-xs text-[#94A3B8]">
                Trace performance from platform high-level aggregates down to specific tickets.
              </p>
            </div>
          </div>

          <Badge variant="outline" size="sm" className="font-mono text-[10px]">
            Platform → Theatre → Hall → Show → Booking → Ticket
          </Badge>
        </div>

        {/* Breadcrumb Trail */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-xs font-mono">
          {drilldownBreadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-[#64748B]" />}
              <button
                onClick={() => handleBreadcrumbClick(idx)}
                className={`px-2 py-1 rounded transition-colors ${
                  idx === drilldownBreadcrumbs.length - 1
                    ? "bg-[#FBBF24] text-[#070B12] font-bold"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                {crumb.label}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Drilldown Child Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {(drilldownNodes.length > 0
            ? drilldownNodes
            : data.circuitPerformance.revenueByTheatre.map((t) => ({
                level: "THEATRE" as const,
                id: t.theatreId,
                label: t.theatreName,
                metrics: {
                  revenue: t.revenue,
                  bookingsCount: t.bookings,
                  occupancyPercent: t.occupancy,
                },
                childrenCount: 4,
                navigationUrl: `/theatre/${t.theatreId}`,
              }))
          ).map((node) => (
            <div
              key={node.id}
              onClick={() => handleDrilldownClick(node)}
              className="p-3.5 rounded-xl bg-[#070B12] border border-[#2A3445] hover:border-[#FBBF24] transition-colors cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#FBBF24] uppercase font-bold">
                  {node.level}
                </span>
                <span className="text-[10px] text-[#64748B] font-mono flex items-center gap-1 group-hover:text-white">
                  <span>Drill down</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>

              <div className="font-bold text-white text-xs truncate">{node.label}</div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] pt-1 border-t border-[#1E293B]">
                <span>₹{node.metrics.revenue.toLocaleString("en-IN")}</span>
                <span>{node.metrics.bookingsCount} Bookings</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
