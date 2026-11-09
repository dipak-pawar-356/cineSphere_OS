"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  TheatreDashboardAnalytics,
  TimeFilterPreset,
} from "@/types/analytics.types";
import { fetchTheatreDashboardMetricsAction } from "@/actions/analytics-actions";
import {
  AreaChart,
  BarChart,
  DonutChart,
  HeatmapChart,
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
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  Film,
  Flame,
  Gauge,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";

interface TheatreAnalyticsClientProps {
  initialData: TheatreDashboardAnalytics;
  theatreId: string;
}

export function TheatreAnalyticsClient({
  initialData,
  theatreId,
}: TheatreAnalyticsClientProps) {
  const [data, setData] = useState<TheatreDashboardAnalytics>(initialData);
  const [timeFilter, setTimeFilter] = useState<TimeFilterPreset>(
    initialData.dateRange.preset
  );
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<
    "overview" | "movies" | "halls" | "bookings" | "payments" | "customers"
  >("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const handleTimeFilterChange = (preset: TimeFilterPreset) => {
    setTimeFilter(preset);
    startTransition(async () => {
      const res = await fetchTheatreDashboardMetricsAction(theatreId, preset);
      if (res.success && res.data) {
        setData(res.data);
      }
    });
  };

  const handleRefresh = () => {
    startTransition(async () => {
      const res = await fetchTheatreDashboardMetricsAction(theatreId, timeFilter);
      if (res.success && res.data) {
        setData(res.data);
      }
    });
  };

  const filteredMovies = data.movies.allMovies.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Filter & Time Range Bar */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-wrap items-center justify-between gap-4">
        {/* Preset Pills */}
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

        {/* Live Status and Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8] font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telemetry Active</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isPending}
            className="gap-1.5 border-[#2A3445] text-xs h-8"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-[#FBBF24] ${isPending ? "animate-spin" : ""}`}
            />
            Sync Aggregates
          </Button>
        </div>
      </div>

      {/* 1. PRIMARY OPERATIONAL & REVENUE KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TrendMetricCard
          title="Today's Revenue"
          value={`₹${data.cards.todayRevenue.toLocaleString("en-IN")}`}
          subtitle={`₹${(data.cards.monthlyRevenue / 100000).toFixed(1)}L this month`}
          changePercent={data.cards.revenueGrowthRate}
          changeLabel="vs yesterday"
          sparklineData={[35, 45, 60, 50, 75, 80, 95]}
          icon={<DollarSign className="h-4 w-4" />}
        />

        <TrendMetricCard
          title="Average Occupancy"
          value={`${data.kpis.occupancyPercent}%`}
          subtitle="Across 4 active halls"
          changePercent={8.4}
          changeLabel="above circuit avg"
          sparklineData={[70, 75, 82, 80, 88, 92, 94]}
          icon={<Gauge className="h-4 w-4" />}
        />

        <TrendMetricCard
          title="Avg Ticket Price (ATP)"
          value={`₹${data.kpis.averageTicketPrice.toFixed(0)}`}
          subtitle={`ABV: ₹${data.kpis.averageBookingValue.toFixed(0)}`}
          changePercent={4.2}
          changeLabel="premium format yield"
          sparklineData={[240, 260, 275, 280, 295, 301]}
          icon={<Ticket className="h-4 w-4" />}
        />

        <TrendMetricCard
          title="Bookings & Velocity"
          value={data.cards.totalBookings.toLocaleString("en-IN")}
          subtitle={`${data.cards.todayBookings} confirmed today`}
          changePercent={data.cards.bookingGrowthRate}
          changeLabel="conversion 64.2%"
          sparklineData={[420, 510, 680, 590, 720, 810, 680]}
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#2A3445] pb-3 text-xs">
        {[
          { id: "overview" as const, label: "Executive Overview", icon: BarChart3 },
          { id: "movies" as const, label: "Movie Box Office", icon: Film },
          { id: "halls" as const, label: "Hall & Section Yield", icon: Layers },
          { id: "bookings" as const, label: "Peak Hours & Bookings", icon: Clock },
          { id: "payments" as const, label: "Payment Settlement", icon: CreditCard },
          { id: "customers" as const, label: "Patron Demographics", icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#FBBF24] text-[#070B12] font-bold shadow-md"
                  : "bg-[#111827] text-[#94A3B8] border border-[#2A3445] hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Charts Row 1: Revenue Momentum & Occupancy Fill Rate */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AreaChart
              title="Revenue Momentum & Yield Trend"
              subtitle="7-day gross box office collections (INR)"
              data={data.charts.revenueTrend}
              color="#FBBF24"
              valueFormatter={(val) => `₹${val.toLocaleString("en-IN")}`}
            />

            <LineChart
              title="Auditorium Occupancy Fill Rate"
              subtitle="Daily peak-hour seat utilization percentage"
              data={data.charts.occupancyTrend}
              strokeColor="#38BDF8"
              valueFormatter={(val) => `${val}% Fill`}
            />
          </div>

          {/* Charts Row 2: Movie Box Office Share & Hourly Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DonutChart
              title="Movie Box Office Distribution"
              subtitle="Gross revenue split across programmed titles"
              data={data.charts.movieShareDonut}
              centerLabel="Multiplex Gross"
              centerValue={`₹${(data.cards.totalRevenue / 100000).toFixed(1)}L`}
            />

            <BarChart
              title="Peak Booking Velocity (Hourly)"
              subtitle="Reservation spikes throughout the operating day"
              data={data.charts.hourlyBookingsBar}
              valueFormatter={(val) => `${val} Bookings`}
            />
          </div>

          {/* Heatmap Row */}
          <HeatmapChart
            title="Screen Fill Rate Heatmap"
            subtitle="Hourly occupancy density across multiplex auditoriums"
          />

          {/* Live Telemetry Bar */}
          <Card variant="elevated" className="p-4 bg-[#111827] border-[#2A3445]">
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">
                    Live Telemetry Handshake
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    Updated: {new Date(data.liveTelemetry.lastRefreshedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span className="text-[#64748B] block text-[10px]">LIVE BOOKINGS</span>
                  <span className="text-white font-bold">{data.liveTelemetry.liveBookingsCount} active</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">CURRENT OCCUPANCY</span>
                  <span className="text-[#FBBF24] font-bold">{data.liveTelemetry.liveOccupancyPercent}%</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">GATE TURNSTILES</span>
                  <span className="text-emerald-400 font-bold">{data.liveTelemetry.activeTurnstiles} Online</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: MOVIE BOX OFFICE ANALYTICS */}
      {activeTab === "movies" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Movie Box Office Performance</h3>
              <p className="text-xs text-[#94A3B8]">
                Real-time yield, occupancy, and ticket distribution across all programmed features.
              </p>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#2A3445] bg-[#161F2E]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#111827] text-[#94A3B8] font-mono border-b border-[#2A3445]">
                <tr>
                  <th className="p-3.5">Rank</th>
                  <th className="p-3.5">Movie Title</th>
                  <th className="p-3.5">Exhibition Format</th>
                  <th className="p-3.5 text-right">Bookings</th>
                  <th className="p-3.5 text-right">Tickets Sold</th>
                  <th className="p-3.5 text-right">Gross Box Office</th>
                  <th className="p-3.5 text-right">Occupancy %</th>
                  <th className="p-3.5 text-right">Circuit Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3445]">
                {filteredMovies.map((movie) => (
                  <tr key={movie.movieId} className="hover:bg-[#111827]/60 transition-colors">
                    <td className="p-3.5 font-mono text-[#FBBF24] font-bold">#{movie.rank}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-white text-sm">{movie.title}</div>
                      <span className="text-[10px] text-[#64748B]">
                        Released: {movie.releaseDate}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                        {movie.format}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right font-mono text-[#94A3B8]">
                      {movie.bookingsCount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5 text-right font-mono text-[#94A3B8]">
                      {movie.ticketsSold.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      ₹{movie.totalRevenue.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5 text-right font-mono">
                      <span
                        className={
                          movie.occupancyPercent >= 90
                            ? "text-emerald-400 font-bold"
                            : movie.occupancyPercent >= 75
                            ? "text-[#FBBF24]"
                            : "text-[#94A3B8]"
                        }
                      >
                        {movie.occupancyPercent}%
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      {movie.boxOfficeSharePercent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: HALL & SECTION PERFORMANCE */}
      {activeTab === "halls" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BarChart
              title="Hall Occupancy Fill Rates"
              subtitle="Comparison across physical auditoriums"
              orientation="horizontal"
              data={data.charts.hallOccupancyComparison}
              valueFormatter={(val) => `${val}% Fill`}
            />

            {/* Section Breakdown Card */}
            <Card variant="elevated" className="p-5 space-y-4">
              <h4 className="text-sm font-bold text-white">Section Utilization & Yield</h4>
              <p className="text-xs text-[#94A3B8]">
                Seat fill percentage, average ticket price, and popularity by seating class.
              </p>

              <div className="space-y-3 pt-2">
                {data.sections.map((sec) => (
                  <div
                    key={sec.sectionType}
                    className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{sec.name}</div>
                      <div className="text-[11px] text-[#94A3B8] font-mono">
                        {sec.bookedSeats} / {sec.totalSeats} Seats ({sec.seatUtilizationPercent}% Fill)
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-[#FBBF24]">₹{sec.revenue.toLocaleString("en-IN")}</div>
                      <div className="text-[10px] text-[#64748B]">ATP: ₹{sec.averageTicketPrice.toFixed(0)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Hall Fleet Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#2A3445] bg-[#161F2E]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#111827] text-[#94A3B8] font-mono border-b border-[#2A3445]">
                <tr>
                  <th className="p-3.5">Hall Name</th>
                  <th className="p-3.5">Acoustic / Visual Format</th>
                  <th className="p-3.5 text-right">Seat Capacity</th>
                  <th className="p-3.5 text-right">Shows Run</th>
                  <th className="p-3.5 text-right">Occupancy %</th>
                  <th className="p-3.5 text-right">Utilization Rate</th>
                  <th className="p-3.5 text-right">RevPAS</th>
                  <th className="p-3.5 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3445]">
                {data.halls.hallMetrics.map((hall) => (
                  <tr key={hall.hallId} className="hover:bg-[#111827]/60 transition-colors">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2">
                      <span>{hall.name}</span>
                      {hall.isMostUsed && (
                        <Badge variant="warning" size="sm" className="text-[10px]">
                          Top Earner
                        </Badge>
                      )}
                    </td>
                    <td className="p-3.5 text-[#94A3B8] font-mono">{hall.format}</td>
                    <td className="p-3.5 text-right font-mono">{hall.capacity}</td>
                    <td className="p-3.5 text-right font-mono">{hall.totalShows}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                      {hall.occupancyPercent}%
                    </td>
                    <td className="p-3.5 text-right font-mono">{hall.utilizationRate}%</td>
                    <td className="p-3.5 text-right font-mono text-[#FBBF24]">₹{hall.revPAS}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      ₹{hall.totalRevenue.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PEAK HOURS & BOOKINGS */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-mono text-[#64748B]">CONFIRMED BOOKINGS</span>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {data.bookings.confirmedBookings.toLocaleString("en-IN")}
              </div>
            </Card>
            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-mono text-[#64748B]">CONVERSION RATE</span>
              <div className="text-xl font-bold font-mono text-[#FBBF24]">
                {data.bookings.conversionRatePercent}%
              </div>
            </Card>
            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-mono text-[#64748B]">CANCELLATION RATE</span>
              <div className="text-xl font-bold font-mono text-rose-400">
                {data.bookings.cancellationRatePercent}%
              </div>
            </Card>
            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-mono text-[#64748B]">AVG SEATS / BOOKING</span>
              <div className="text-xl font-bold font-mono text-sky-400">
                {data.bookings.averageSeatsPerBooking} Seats
              </div>
            </Card>
          </div>

          <BarChart
            title="Hourly Booking Velocity & Traffic Density"
            subtitle="Distribution of ticket purchases across the operating schedule"
            data={data.charts.hourlyBookingsBar}
            valueFormatter={(val) => `${val} Bookings`}
            height={260}
          />
        </div>
      )}

      {/* TAB 5: PAYMENT SETTLEMENT ANALYTICS */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="elevated" className="p-5 space-y-4">
              <h4 className="text-sm font-bold text-white">Payment Method Share</h4>
              <p className="text-xs text-[#94A3B8]">
                Breakdown of collections across UPI, Cards, Netbanking, and Box Office cash.
              </p>

              <div className="space-y-3 pt-2">
                {data.payments.methods.map((pm) => (
                  <div
                    key={pm.method}
                    className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{pm.label}</div>
                      <div className="text-[11px] text-[#64748B] font-mono">
                        {pm.transactionsCount.toLocaleString("en-IN")} transactions
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-white">₹{pm.totalRevenue.toLocaleString("en-IN")}</div>
                      <Badge variant="primary" size="sm" className="mt-0.5">
                        {pm.sharePercent}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="elevated" className="p-5 space-y-4">
              <h4 className="text-sm font-bold text-white">Payment Gateway Telemetry</h4>
              <p className="text-xs text-[#94A3B8]">
                Autonomous routing health, settlement SLAs, and failure metrics.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                  <span className="text-[#64748B] font-mono text-[10px]">PRIMARY ESCROW RAIL</span>
                  <div className="text-white font-bold">{data.payments.gatewayTelemetryPlaceholder.primaryRail}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                  <span className="text-[#64748B] font-mono text-[10px]">HANDSHAKE LATENCY</span>
                  <div className="text-emerald-400 font-bold font-mono">
                    {data.payments.gatewayTelemetryPlaceholder.averageHandshakeLatencyMs} ms avg
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                  <span className="text-[#64748B] font-mono text-[10px]">SETTLEMENT WINDOW</span>
                  <div className="text-white font-mono">{data.payments.gatewayTelemetryPlaceholder.settlementWindow}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 6: CUSTOMER DEMOGRAPHICS & COHORT */}
      {activeTab === "customers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-mono text-[#64748B]">UNIQUE PATRONS</span>
              <div className="text-xl font-bold font-mono text-white">
                {data.customers.totalUniqueCustomers.toLocaleString("en-IN")}
              </div>
            </Card>
            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-mono text-[#64748B]">REPEAT VISITOR RATIO</span>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {data.customers.repeatRatioPercent}%
              </div>
            </Card>
            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-mono text-[#64748B]">BOOKINGS / PATRON</span>
              <div className="text-xl font-bold font-mono text-[#FBBF24]">
                {data.customers.bookingsPerCustomer}
              </div>
            </Card>
            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-mono text-[#64748B]">AVG PATRON LTV</span>
              <div className="text-xl font-bold font-mono text-sky-400">
                ₹{data.customers.averageSpend.toFixed(0)}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
