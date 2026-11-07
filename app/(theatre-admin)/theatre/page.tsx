import React from "react";
import Link from "next/link";
import {
  CURRENT_THEATRE,
  THEATRE_HALLS,
  THEATRE_SHOWS,
  THEATRE_NOTIFICATIONS,
} from "@/lib/constants/theatre-admin";
import {
  Building2,
  Layers,
  Film,
  Ticket,
  Users,
  Plus,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  SlidersHorizontal,
  MapPin,
} from "lucide-react";
import { MetricCard, MiniChartCard, SystemStatusCard, ActivityCard } from "@/components/dashboard/dashboard-widgets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterChip } from "@/components/filters/filter-chip";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Theatre Command Portal | CineSphere OS",
};

export default function TheatreAdminDashboardPage() {
  const activeHallsCount = THEATRE_HALLS.filter((h) => h.status === "Active").length;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. WELCOME HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111827] via-[#161F2E] to-[#0B1220] border border-[#2A3445] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-[#FBBF24]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="warning" size="sm" className="font-bold">
                {CURRENT_THEATRE.code}
              </Badge>
              <Badge variant="success" size="sm" dot>
                {CURRENT_THEATRE.status} Operations
              </Badge>
              <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[#FBBF24]" />
                {CURRENT_THEATRE.address}, {CURRENT_THEATRE.city}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Good Morning, Theatre Admin
              </h1>
              <p className="text-sm text-[#94A3B8] max-w-2xl mt-1">
                Here&apos;s an overview of your operations at <span className="text-white font-semibold">{CURRENT_THEATRE.name}</span>.
                All 5 Laser auditoriums are calibrated with 64-channel spatial sound active.
              </p>
            </div>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link href={ROUTES.THEATRE_ADMIN.SHOW_CALENDAR}>
              <Button variant="outline" size="sm" className="gap-2 border-[#2A3445]">
                <Calendar className="h-4 w-4 text-[#FBBF24]" /> Show Calendar
              </Button>
            </Link>
            <Button variant="primary" size="sm" className="gap-1.5 font-bold shadow-lg shadow-[#FBBF24]/20" disabled title="Coming Soon in Phase 2">
              <Plus className="h-4 w-4" /> Schedule Showtime
            </Button>
          </div>
        </div>

        {/* 2. OPERATIONAL QUICK SUMMARY ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#2A3445]/60">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Today&apos;s Shows</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-white">25 Scheduled</div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> 100% on-time dispatch
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Today&apos;s Admissions</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-white">1,842 Tickets</div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +14.8% vs last Friday
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Current Occupancy</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-[#FBBF24]">92.4% Average</div>
            <div className="text-[10px] text-[#94A3B8]">Peak Evening Session</div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Today&apos;s Gross Box Office</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-white">₹4,85,250</div>
            <div className="text-[10px] text-emerald-400 font-semibold">Includes ₹92K F&B Yield</div>
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTION CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
            Operations Quick Actions
          </h2>
          <span className="text-xs text-[#64748B]">Common Operational Shortcuts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: "Add Movie", icon: Film, href: ROUTES.THEATRE_ADMIN.MOVIES, tag: "Phase 2" },
            { label: "Schedule Show", icon: Calendar, href: ROUTES.THEATRE_ADMIN.SHOWS, tag: "Phase 2" },
            { label: "Manage Halls", icon: Layers, href: ROUTES.THEATRE_ADMIN.HALLS },
            { label: "View Bookings", icon: Ticket, href: ROUTES.THEATRE_ADMIN.BOOKINGS },
            { label: "Manage Staff", icon: Users, href: ROUTES.THEATRE_ADMIN.STAFF },
            { label: "Create Offer", icon: Sparkles, href: ROUTES.THEATRE_ADMIN.OFFERS, tag: "Phase 2" },
            { label: "View Reports", icon: FileText, href: ROUTES.THEATRE_ADMIN.REPORTS },
            { label: "Update Profile", icon: Building2, href: ROUTES.THEATRE_ADMIN.PROFILE },
          ].map((act, i) => (
            <Link key={i} href={act.href}>
              <Card
                variant="interactive"
                className="p-3.5 text-center flex flex-col items-center justify-center gap-2 h-full hover:border-[#FBBF24]/50 group"
              >
                <div className="h-9 w-9 rounded-xl bg-[#111827] border border-[#2A3445] group-hover:border-[#FBBF24]/40 flex items-center justify-center text-[#FBBF24] transition-colors">
                  <act.icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-white leading-tight group-hover:text-[#FBBF24] transition-colors">
                  {act.label}
                </span>
                {act.tag && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-300 font-mono">
                    {act.tag}
                  </span>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. THEATRE STATISTICS (7 PRIMARY METRIC CARDS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
            Key Theatre Statistics & Telemetry
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B]">Showing Real-Time Pune Metrics</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
          <MetricCard
            label="Total Halls"
            value="5 Auditoriums"
            subtitle="All Laser Equipped"
            icon={<Layers className="h-4 w-4" />}
          />
          <MetricCard
            label="Total Capacity"
            value="850 Seats"
            subtitle="100 VIP Recliners"
            icon={<Ticket className="h-4 w-4" />}
          />
          <MetricCard
            label="Active Movies"
            value="12 Running"
            delta="+3 This Week"
            deltaType="positive"
            icon={<Film className="h-4 w-4" />}
          />
          <MetricCard
            label="Today's Shows"
            value="25 Scheduled"
            subtitle="5 Prime Time Shows"
            icon={<Clock className="h-4 w-4" />}
          />
          <MetricCard
            label="Today's Box Office"
            value="₹4,85,250"
            delta="+18.4% vs Avg"
            deltaType="positive"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <MetricCard
            label="Monthly Revenue"
            value="₹1.12 Cr"
            delta="104% of Target"
            deltaType="positive"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <MetricCard
            label="Occupancy Rate"
            value="92.4%"
            delta="Peak 98% Screen 2"
            deltaType="positive"
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* 5. TIME-RANGE SELECTOR PLACEHOLDER & PERFORMANCE ANALYTICS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
              Performance Analytics & Occupancy Trends
            </h2>
            <p className="text-xs text-[#64748B]">Real-time admissions telemetry across 5 auditoriums</p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-[#111827] p-1 rounded-xl border border-[#2A3445]">
            {["Today", "Last 7 Days", "Last 30 Days", "Last 3 Months", "Custom Range"].map((range, idx) => (
              <button
                key={range}
                type="button"
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  idx === 0
                    ? "bg-[#FBBF24] text-[#070B12] shadow-sm"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MiniChartCard
              label="Hourly Admissions Velocity (Peak Evening Drop)"
              value="420 patrons / hour"
              trend="+28.4% vs last week"
              dataPoints={[30, 45, 60, 55, 80, 95, 98, 85]}
            />
          </div>

          <div>
            <SystemStatusCard
              clusterName="Phoenix Marketcity LAN & Barco Projector Rack"
              uptime="99.98%"
              latency="3ms (On-Premises)"
              activeNodes={5}
            />
          </div>
        </div>
      </div>

      {/* 6. HALLS SNAPSHOT & LIVE OCCUPANCY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
              Live Auditorium Status
            </h2>
            <p className="text-xs text-[#64748B]">Real-time projection and seating status</p>
          </div>
          <Link href={ROUTES.THEATRE_ADMIN.HALLS} className="text-xs font-bold text-[#FBBF24] hover:underline">
            View All 5 Screens →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {THEATRE_HALLS.map((hall) => (
            <Card key={hall.id} variant="elevated" className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={hall.status === "Active" ? "success" : "warning"} size="sm" dot>
                  {hall.status}
                </Badge>
                <span className="text-[10px] font-mono text-[#94A3B8]">{hall.seatCount} Seats</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white truncate">{hall.name}</h3>
                <span className="text-xs text-[#FBBF24] font-medium">{hall.screenType}</span>
              </div>

              <div className="space-y-1 pt-1 border-t border-[#2A3445]/60 text-xs">
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Occupancy</span>
                  <span className="font-mono font-bold text-white">{hall.occupancyPercent}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#111827] overflow-hidden">
                  <div
                    style={{ width: `${hall.occupancyPercent}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#FBBF24]"
                  />
                </div>
              </div>

              <div className="text-[11px] text-[#94A3B8] truncate">
                Now: <span className="text-white font-medium">{hall.currentMovie}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 7. LIVE ACTIVITY & NOTIFICATIONS AUDIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityCard
            title="Real-Time Screen & Box Office Dispatch"
            activities={[
              { id: "1", user: "Screen 01 — Dolby Cinema", action: "Show #003 started on time (220/220 Housefull)", time: "6m ago" },
              { id: "2", user: "Screen 02 — IMAX Laser", action: "12-Channel sound calibration test passed with 130dB headroom", time: "18m ago" },
              { id: "3", user: "Concessions POS #02", action: "Order #BK-PUN-8932 fulfilled (Caramel Tub + Nachos)", time: "24m ago" },
              { id: "4", user: "Automated QR Gate 01", action: "Scanned 84 digital tickets in 5 minutes with zero queue", time: "32m ago" },
              { id: "5", user: "HVAC Climate Control", action: "Hall 04 cooled to target 21.0°C for 4DX session", time: "45m ago" },
            ]}
          />
        </div>

        <div>
          <Card variant="elevated" className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A3445]">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#FBBF24]" /> Critical Operational Alerts
              </span>
              <Badge variant="danger" size="sm">
                {THEATRE_NOTIFICATIONS.length} Total
              </Badge>
            </div>

            <div className="space-y-3">
              {THEATRE_NOTIFICATIONS.map((notif) => (
                <div key={notif.id} className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{notif.title}</span>
                    <span className="text-[10px] text-[#64748B] font-mono">{notif.time}</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">{notif.message}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
