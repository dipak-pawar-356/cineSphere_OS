"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PLATFORM_SUMMARY,
  SUPER_ADMIN_QUICK_ACTIONS,
  SUPER_ADMIN_STATS,
  PLATFORM_SERVICES,
  SYSTEM_HEALTH_DATA,
  PENDING_APPROVALS_LIST,
  RECENT_ACTIVITY_TIMELINE,
  UPCOMING_TASKS_TIMELINE,
  LATEST_THEATRES_DATA,
  LATEST_MOVIES_DATA,
  LATEST_BOOKINGS_DATA,
  LATEST_EVENTS_DATA,
  LATEST_ADMINS_DATA,
  LATEST_TICKETS_DATA,
} from "@/lib/constants/super-admin";
import {
  Building2,
  Film,
  Ticket,
  Users,
  Layers,
  ShieldCheck,
  TrendingUp,
  Activity,
  Zap,
  Clock,
  Sparkles,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  FileText,
  BarChart3,
  Tag,
  Settings,
  ChevronRight,
  ArrowUpRight,
  Search,
  Filter,
  Server,
  HardDrive,
  Cpu,
  Wifi,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SuperAdminDashboardPage() {
  const [activeTableTab, setActiveTableTab] = useState<
    "theatres" | "movies" | "bookings" | "events" | "admins" | "tickets"
  >("theatres");

  const [activeAnalyticsMetric, setActiveAnalyticsMetric] = useState<
    "revenue" | "bookings" | "occupancy"
  >("revenue");

  // Dynamic greeting based on current local hour
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-10">
      {/* =========================================================
          1. WELCOME SECTION (HERO COMMAND BANNER)
         ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#111827] via-[#161F2E] to-[#0B1220] border border-[#2A3445] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FBBF24]/10 border border-[#FBBF24]/30 text-[#FBBF24] text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multi-Tenant HQ Command Active</span>
              <span className="text-[#64748B]">•</span>
              <span>Nov 07, 2026</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] to-[#F59E0B]">Super Admin</span>
            </h1>

            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Global cinema operations are running with <strong className="text-white font-mono">99.98%</strong> platform health.
              All <strong className="text-white font-mono">25 Theatres</strong> across <strong className="text-white font-mono">12 Cities</strong> are synchronized with zero ticket locks or DCP schedule conflicts.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-mono text-[#CBD5E1]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Today: <strong>{PLATFORM_SUMMARY.todayBookings}</strong> Tix</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#38BDF8]" />
                <span>Monthly: <strong>{PLATFORM_SUMMARY.monthlyBookings}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#FBBF24]" />
                <span>Gross Box Office: <strong>{PLATFORM_SUMMARY.totalRevenue}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick telemetry summary badge */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-[#070B12]/80 border border-[#2A3445] space-y-1.5 min-w-[200px]">
              <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span>Platform Uptime</span>
                <Badge variant="success" size="sm">99.99%</Badge>
              </div>
              <div className="text-2xl font-bold font-mono text-white">0 Incident</div>
              <div className="text-[10px] text-[#64748B]">Last audit: 12 min ago</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#070B12]/80 border border-[#2A3445] space-y-1.5 min-w-[200px]">
              <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span>Active Circuits</span>
                <Badge variant="primary" size="sm">12 Cities</Badge>
              </div>
              <div className="text-2xl font-bold font-mono text-white">110 Screens</div>
              <div className="text-[10px] text-[#64748B]">Across 25 Flagships</div>
            </div>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-[#FBBF24]/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* =========================================================
          2. QUICK ACTIONS SECTION
         ========================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#FBBF24]" />
              <span>Platform Quick Actions</span>
            </h2>
            <p className="text-xs text-[#94A3B8]">Centralized command actions for onboarding, catalog, and settlements.</p>
          </div>
          <Badge variant="outline" size="sm">Coming Soon</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUPER_ADMIN_QUICK_ACTIONS.map((action) => {
            return (
              <div
                key={action.id}
                onClick={() => alert(`Action "${action.title}" is a placeholder in this phase.`)}
                className="group p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] hover:border-[#FBBF24]/50 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] group-hover:bg-[#FBBF24] group-hover:text-[#070B12] transition-colors">
                      <ActionIcon name={action.iconName} />
                    </div>
                    {action.badge && (
                      <Badge variant="warning" size="sm">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-sm group-hover:text-[#FBBF24] transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2">
                    {action.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-[#FBBF24] pt-2 border-t border-[#2A3445]/60">
                  <span>Trigger Action</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          3. COMPREHENSIVE STATISTICS SECTION (15 METRICS)
         ========================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <span>Global Circuit Telemetry & KPIs</span>
            </h2>
            <p className="text-xs text-[#94A3B8]">Real-time operational metrics across all connected cinema chains.</p>
          </div>
          <div className="text-xs font-mono text-[#64748B]">Updated: Just now</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {SUPER_ADMIN_STATS.map((stat) => (
            <div
              key={stat.id}
              className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2 hover:border-[#FBBF24]/30 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span className="truncate uppercase tracking-wider text-[10px] font-bold">{stat.label}</span>
                <ActionIcon name={stat.iconName} className="h-3.5 w-3.5 text-[#FBBF24] shrink-0" />
              </div>

              <div className="text-xl sm:text-2xl font-extrabold font-mono text-white tracking-tight">
                {stat.value}
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#2A3445]/50">
                <span className="text-[#94A3B8] truncate">{stat.subtext}</span>
                {stat.delta && (
                  <span
                    className={
                      stat.isPositive
                        ? "text-emerald-400 font-semibold shrink-0"
                        : "text-rose-400 font-semibold shrink-0"
                    }
                  >
                    {stat.delta}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================
          4. ANALYTICS PREVIEW SECTION (CHARTS PLACEHOLDER)
         ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#FBBF24]" />
                <span>Circuit Analytics & Performance Curves</span>
              </h3>
              <p className="text-xs text-[#94A3B8]">Aggregate metrics comparing weekend peaks, occupancy ratios, and box office yield.</p>
            </div>

            {/* Metric switcher tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
              <button
                onClick={() => setActiveAnalyticsMetric("revenue")}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  activeAnalyticsMetric === "revenue"
                    ? "bg-[#FBBF24] text-[#070B12] font-bold"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setActiveAnalyticsMetric("bookings")}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  activeAnalyticsMetric === "bookings"
                    ? "bg-[#FBBF24] text-[#070B12] font-bold"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveAnalyticsMetric("occupancy")}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  activeAnalyticsMetric === "occupancy"
                    ? "bg-[#FBBF24] text-[#070B12] font-bold"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Occupancy
              </button>
            </div>
          </div>

          {/* Interactive Chart Placeholder Graphic */}
          <div className="h-64 rounded-2xl bg-[#111827] border border-[#2A3445] p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-mono">Oct 08 — Nov 07 (Rolling 30 Days)</span>
              <span className="text-emerald-400 font-bold font-mono">+24.5% MoM Growth</span>
            </div>

            {/* Simulated SVG Wave Line Chart */}
            <div className="relative h-36 w-full flex items-end">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 120">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,90 Q50,40 100,65 T200,45 T300,75 T400,20 T500,35 L500,120 L0,120 Z"
                  fill="url(#chartGradient)"
                />
                <path
                  d="M0,90 Q50,40 100,65 T200,45 T300,75 T400,20 T500,35"
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth="3"
                />
              </svg>
            </div>

            {/* X-Axis labels */}
            <div className="flex justify-between text-[10px] text-[#64748B] font-mono pt-2 border-t border-[#2A3445]/60">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
              <span>Peak Weekend (Now)</span>
            </div>
          </div>

          {/* Secondary Micro-Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
              <div className="text-[10px] text-[#94A3B8] uppercase">Peak Occupancy</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">88.4%</div>
              <div className="text-[10px] text-emerald-400">Apex Grand IMAX</div>
            </div>
            <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
              <div className="text-[10px] text-[#94A3B8] uppercase">F&B Attachment</div>
              <div className="text-lg font-bold font-mono text-[#FBBF24] mt-0.5">₹340 / tix</div>
              <div className="text-[10px] text-emerald-400">+12% vs benchmark</div>
            </div>
            <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
              <div className="text-[10px] text-[#94A3B8] uppercase">Refund Rate</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">0.62%</div>
              <div className="text-[10px] text-[#94A3B8]">Low cancellation index</div>
            </div>
          </div>
        </div>

        {/* Right Side: City Distribution & Platform Usage */}
        <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#38BDF8]" />
              <span>Metro Hub Breakdown</span>
            </h3>
            <p className="text-xs text-[#94A3B8]">Gross ticket volumes by regional metropolitan circuits.</p>
          </div>

          <div className="space-y-3.5">
            {[
              { city: "Mumbai Metro", percentage: 34, amount: "₹2.92 Cr" },
              { city: "Delhi NCR", percentage: 26, amount: "₹2.24 Cr" },
              { city: "Bengaluru Tech Hub", percentage: 18, amount: "₹1.55 Cr" },
              { city: "Hyderabad Central", percentage: 12, amount: "₹1.03 Cr" },
              { city: "Pune & Others (8 Cities)", percentage: 10, amount: "₹0.86 Cr" },
            ].map((hub, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">{hub.city}</span>
                  <span className="font-mono text-[#FBBF24]">{hub.amount}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#111827] overflow-hidden">
                  <div
                    style={{ width: `${hub.percentage}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B]"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[#94A3B8]">All 12 Metro Gateways Active</span>
            </div>
            <Link href="/dashboard/analytics" className="text-[#FBBF24] font-semibold hover:underline">
              Full Analytics →
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================
          5. PENDING APPROVALS & SYSTEM HEALTH
         ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals Card */}
        <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Pending Circuit Approvals ({PENDING_APPROVALS_LIST.length})</span>
              </h3>
              <p className="text-xs text-[#94A3B8]">Exhibitors, distributor DCP prints, and promotional campaigns awaiting review.</p>
            </div>
            <Badge variant="warning" size="sm">Action Required</Badge>
          </div>

          <div className="space-y-3">
            {PENDING_APPROVALS_LIST.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-2 hover:border-[#FBBF24]/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" size="sm">{item.type}</Badge>
                      <h4 className="font-bold text-white text-xs">{item.title}</h4>
                    </div>
                    <p className="text-[11px] text-[#94A3B8]">{item.details}</p>
                  </div>
                  <Badge variant={item.priority === "Urgent" ? "danger" : "secondary"} size="sm">
                    {item.priority}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-2 border-t border-[#2A3445]/60">
                  <span>By: {item.submittedBy} • {item.submittedAt}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="h-6 text-[10px] px-2 py-0 border-[#2A3445]"
                  >
                    Review (Disabled)
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health Benchmarks Card */}
        <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-emerald-400" />
                <span>Enterprise Infrastructure Health</span>
              </h3>
              <p className="text-xs text-[#94A3B8]">Compute cluster, memory headroom, P99 API latency, and compliance index.</p>
            </div>
            <Badge variant="success" size="sm">Healthy</Badge>
          </div>

          <div className="space-y-3.5">
            {SYSTEM_HEALTH_DATA.map((health, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#CBD5E1]">{health.metric}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-white font-bold">{health.value}</span>
                    <span className="text-[10px] text-[#64748B]">({health.detail})</span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#111827] overflow-hidden">
                  <div
                    style={{ width: `${health.percentage}%` }}
                    className="h-full rounded-full bg-emerald-400"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#2A3445] flex items-center justify-between text-[11px] text-[#94A3B8]">
            <span>Compliance: SOC-2 Type II • ISO 27001 • PCI-DSS</span>
            <span className="text-emerald-400 font-bold font-mono">Grade A+</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          6. PLATFORM SERVICES STATUS GRID
         ========================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-[#38BDF8]" />
              <span>Platform Core Services Status</span>
            </h2>
            <p className="text-xs text-[#94A3B8]">Live telemetry monitoring API endpoints, database replicas, storage, and edge CDN nodes.</p>
          </div>
          <Badge variant="success" size="sm">All Systems Operational</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLATFORM_SERVICES.map((srv, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2.5 hover:border-[#38BDF8]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white truncate">{srv.name}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">{srv.status}</span>
              </div>

              <p className="text-[11px] text-[#94A3B8] leading-relaxed line-clamp-2">
                {srv.description}
              </p>

              <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-[#2A3445]/60 text-[#64748B]">
                <span>Uptime: <strong className="text-white">{srv.uptime}</strong></span>
                <span>Latency: <strong className="text-[#FBBF24]">{srv.latency}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================
          7. LATEST TABLES SECTION (MULTI-TAB VIEW)
         ========================================================= */}
      <div className="space-y-4 p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#FBBF24]" />
              <span>Latest Circuit Ledgers & Records</span>
            </h2>
            <p className="text-xs text-[#94A3B8]">Real-time operational tables for theatres, movies, bookings, events, admins, and support.</p>
          </div>

          {/* Table Tab Selector */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
            {(
              [
                { id: "theatres", label: "Theatres (25)" },
                { id: "movies", label: "Movies (48)" },
                { id: "bookings", label: "Bookings (124.8K)" },
                { id: "events", label: "Events (8)" },
                { id: "admins", label: "Admins (24)" },
                { id: "tickets", label: "Support (4)" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTableTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                  activeTableTab === tab.id
                    ? "bg-[#FBBF24] text-[#070B12] font-bold"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Search & Filter Bar Placeholder */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
            <input
              type="text"
              placeholder={`Filter ${activeTableTab}... (Search disabled)`}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
              disabled
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-[#94A3B8]">
            <Button variant="outline" size="sm" disabled className="gap-1.5 h-8 text-xs border-[#2A3445]">
              <Filter className="h-3.5 w-3.5" />
              <span>Filters</span>
            </Button>
            <span className="font-mono text-[11px] text-[#64748B]">Showing 5 of 25 items</span>
          </div>
        </div>

        {/* Dynamic Table Render */}
        <div className="overflow-x-auto rounded-2xl border border-[#2A3445]">
          {activeTableTab === "theatres" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
                <tr>
                  <th className="py-3 px-4">Theatre Name</th>
                  <th className="py-3 px-4">Chain / Circuit</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Screens</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Occupancy</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
                {LATEST_THEATRES_DATA.map((row) => (
                  <tr key={row.id} className="hover:bg-[#111827]/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-[#FBBF24]" />
                      <span>{row.name}</span>
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8]">{row.chain}</td>
                    <td className="py-3 px-4">{row.city}</td>
                    <td className="py-3 px-4 font-mono">{row.screens} Halls</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" size="sm">{row.tier}</Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{row.occupancy}</td>
                    <td className="py-3 px-4">
                      <Badge variant="success" size="sm">{row.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTableTab === "movies" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
                <tr>
                  <th className="py-3 px-4">Movie Title</th>
                  <th className="py-3 px-4">Formats</th>
                  <th className="py-3 px-4">Release Date</th>
                  <th className="py-3 px-4">Box Office</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
                {LATEST_MOVIES_DATA.map((row) => (
                  <tr key={row.id} className="hover:bg-[#111827]/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <Film className="h-3.5 w-3.5 text-[#38BDF8]" />
                      <span>{row.title}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {row.formats.map((f, i) => (
                          <Badge key={i} variant="secondary" size="sm">{f}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8]">{row.release}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#FBBF24]">{row.boxOffice}</td>
                    <td className="py-3 px-4 font-mono text-amber-400">{row.rating}</td>
                    <td className="py-3 px-4">
                      <Badge variant={row.status === "Active" ? "success" : "info"} size="sm">
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTableTab === "bookings" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Theatre & Movie</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
                {LATEST_BOOKINGS_DATA.map((row) => (
                  <tr key={row.id} className="hover:bg-[#111827]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#FBBF24]">{row.ref}</td>
                    <td className="py-3 px-4 font-semibold text-white">{row.customer}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{row.movie}</div>
                      <div className="text-[10px] text-[#94A3B8]">{row.theatre}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">{row.seats}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{row.amount}</td>
                    <td className="py-3 px-4 text-[#64748B]">{row.time}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          row.status === "Confirmed"
                            ? "success"
                            : row.status === "Processing"
                            ? "warning"
                            : "danger"
                        }
                        size="sm"
                      >
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTableTab === "events" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
                <tr>
                  <th className="py-3 px-4">Event Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Venue & City</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Tickets Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
                {LATEST_EVENTS_DATA.map((row) => (
                  <tr key={row.id} className="hover:bg-[#111827]/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{row.title}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" size="sm">{row.category}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white">{row.venue}</span> ({row.city})
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8]">{row.date}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{row.ticketsSold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTableTab === "admins" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Circuit / Org</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
                {LATEST_ADMINS_DATA.map((row) => (
                  <tr key={row.id} className="hover:bg-[#111827]/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{row.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="primary" size="sm">{row.role}</Badge>
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8]">{row.circuit}</td>
                    <td className="py-3 px-4 font-mono text-[#64748B]">{row.email}</td>
                    <td className="py-3 px-4 text-[#94A3B8]">{row.lastLogin}</td>
                    <td className="py-3 px-4">
                      <Badge variant={row.status === "Active" ? "success" : "warning"} size="sm">
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTableTab === "tickets" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
                <tr>
                  <th className="py-3 px-4">Ticket Ref</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Submitter & Theatre</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
                {LATEST_TICKETS_DATA.map((row) => (
                  <tr key={row.id} className="hover:bg-[#111827]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#FBBF24]">{row.ticketRef}</td>
                    <td className="py-3 px-4 font-semibold text-white">{row.subject}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" size="sm">{row.category}</Badge>
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8]">
                      {row.submitter} ({row.theatre})
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={row.priority === "Urgent" ? "danger" : "warning"} size="sm">
                        {row.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={row.status === "Resolved" ? "success" : "info"} size="sm">
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Placeholder */}
        <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-2">
          <span>Page 1 of 5</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" disabled className="h-7 px-2.5 text-xs border-[#2A3445]">
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled className="h-7 px-2.5 text-xs border-[#2A3445]">
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* =========================================================
          8. RECENT ACTIVITY & UPCOMING TASKS DUAL TIMELINE
         ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Timeline */}
        <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#FBBF24]" />
              <span>Real-Time Audit Trail</span>
            </h3>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-3.5">
            {RECENT_ACTIVITY_TIMELINE.map((item) => (
              <div key={item.id} className="flex items-start gap-3 text-xs">
                <div className="h-2 w-2 rounded-full bg-[#FBBF24] mt-1.5 shrink-0" />
                <div className="flex-1 space-y-0.5">
                  <div className="font-bold text-white">{item.title}</div>
                  <div className="text-[11px] text-[#94A3B8]">
                    By <strong className="text-white">{item.actor}</strong> ({item.role}) • {item.module}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#64748B] shrink-0">{item.timeAgo}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#2A3445] text-center">
            <Link href="/dashboard/audit-logs" className="text-xs text-[#FBBF24] font-semibold hover:underline">
              View Complete Immutable Audit Logs →
            </Link>
          </div>
        </div>

        {/* Upcoming Tasks Timeline */}
        <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#38BDF8]" />
              <span>Upcoming Operational Tasks</span>
            </h3>
            <Badge variant="outline" size="sm">5 Scheduled</Badge>
          </div>

          <div className="space-y-3.5">
            {UPCOMING_TASKS_TIMELINE.map((task) => (
              <div key={task.id} className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-white">{task.title}</div>
                  <div className="text-[11px] text-[#94A3B8]">
                    Due: <strong className="text-white">{task.dueDate}</strong> • Assignee: {task.assignee}
                  </div>
                </div>
                <Badge variant={task.status === "Scheduled" ? "info" : "warning"} size="sm">
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#2A3445] text-center">
            <Link href="/dashboard/settings" className="text-xs text-[#38BDF8] font-semibold hover:underline">
              Inspect Maintenance Schedules & Backups →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  switch (name) {
    case "Building2":
      return <Building2 className={className} />;
    case "Film":
      return <Film className={className} />;
    case "Ticket":
      return <Ticket className={className} />;
    case "Users":
      return <Users className={className} />;
    case "Layers":
      return <Layers className={className} />;
    case "ShieldCheck":
      return <ShieldCheck className={className} />;
    case "TrendingUp":
      return <TrendingUp className={className} />;
    case "Activity":
      return <Activity className={className} />;
    case "Zap":
      return <Zap className={className} />;
    case "Clock":
      return <Clock className={className} />;
    case "Sparkles":
      return <Sparkles className={className} />;
    case "CreditCard":
      return <CreditCard className={className} />;
    case "AlertTriangle":
      return <AlertTriangle className={className} />;
    case "CalendarDays":
      return <CalendarDays className={className} />;
    case "FileText":
      return <FileText className={className} />;
    case "BarChart3":
      return <BarChart3 className={className} />;
    case "Tag":
      return <Tag className={className} />;
    case "Settings":
      return <Settings className={className} />;
    default:
      return <Zap className={className} />;
  }
}
