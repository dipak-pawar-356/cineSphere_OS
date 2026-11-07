"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  BarChart3,
  TrendingUp,
  Flame,
  Calendar,
  Filter,
  ArrowUpRight,
  Layers,
  Sparkles,
  Download,
  Building2,
  Film,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminAnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Analytics & Intelligence"
        subtitle="Cross-Circuit Occupancy, Revenue Heatmaps, Format Comparisons & Demographic Velocity"
        description="Comprehensive real-time audience telemetry, hourly seat velocity, and comparative yield across 25 connected multiplexes."
        badge="Analytics Engine"
        badgeVariant="primary"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="gap-2 border-[#2A3445]"
            >
              <Filter className="h-4 w-4" /> Filter Metrics
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled
              className="gap-2 font-bold"
            >
              <Download className="h-4 w-4" /> Export Raw Dataset
            </Button>
          </div>
        }
      />

      {/* 1. TOP ANALYTICS KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Average Ticket Yield",
            value: "₹485",
            change: "+8.4% vs last mo",
            sub: "Concession attach ₹165",
            isPos: true,
          },
          {
            title: "Peak Weekend Occupancy",
            value: "86.2%",
            change: "+12.1% MoM",
            sub: "IMAX & Dolby Atmos leading",
            isPos: true,
          },
          {
            title: "Cart Conversion Rate",
            value: "4.82%",
            change: "+0.6% vs benchmark",
            sub: "Average checkout 2m 14s",
            isPos: true,
          },
          {
            title: "Peak Velocity",
            value: "420 tix/min",
            change: "Opening night record",
            sub: "Zero database contention",
            isPos: true,
          },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2 hover:border-[#FBBF24]/40 transition-colors"
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              {kpi.title}
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {kpi.value}
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#2A3445]/60">
              <span className="text-[#94A3B8]">{kpi.sub}</span>
              <span className="text-emerald-400 font-bold">{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. MAIN CHARTS PLACEHOLDER */}
      <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#FBBF24]" />
              <span>Seat Occupancy Curves & Revenue Influx</span>
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Continuous 30-day projection model vs actual realized gross box office admissions.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
            {["7d", "30d", "90d", "1y"].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedTimeRange(r)}
                className={`px-3 py-1 rounded-lg uppercase font-mono font-bold transition-colors ${
                  selectedTimeRange === r
                    ? "bg-[#FBBF24] text-[#070B12]"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Big Chart Area Simulation */}
        <div className="h-72 rounded-2xl bg-[#111827] border border-[#2A3445] p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center text-xs text-[#94A3B8]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-white">
                <span className="h-2 w-2 rounded-full bg-[#FBBF24]" /> Realized Admissions
              </span>
              <span className="flex items-center gap-1.5 font-medium text-[#38BDF8]">
                <span className="h-2 w-2 rounded-full bg-[#38BDF8]" /> AI Forecast Target
              </span>
            </div>
            <span className="font-mono text-xs text-[#64748B]">Resolution: 1 Hour Buckets</span>
          </div>

          {/* Curved SVG Area Plot */}
          <div className="relative h-44 w-full flex items-end">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 160">
              <defs>
                <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0,130 C80,60 160,110 240,40 C320,100 400,20 480,50 C540,10 580,30 600,25 L600,160 L0,160 Z"
                fill="url(#amberGrad)"
              />
              <path
                d="M0,130 C80,60 160,110 240,40 C320,100 400,20 480,50 C540,10 580,30 600,25"
                fill="none"
                stroke="#FBBF24"
                strokeWidth="3.5"
              />
              {/* Forecast dotted line */}
              <path
                d="M0,140 C80,80 160,95 240,55 C320,85 400,35 480,45 C540,25 580,20 600,15"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
            </svg>
          </div>

          <div className="flex justify-between text-[11px] text-[#64748B] font-mono pt-2 border-t border-[#2A3445]/60">
            <span>Oct 08</span>
            <span>Oct 15</span>
            <span>Oct 22</span>
            <span>Oct 29</span>
            <span>Nov 05 (Weekend Surge)</span>
            <span>Nov 07</span>
          </div>
        </div>
      </div>

      {/* 3. HEATMAP PLACEHOLDER & COMPARISON CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Showtime Influx Heatmap */}
        <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-rose-400" />
                <span>Weekly Showtime Influx Heatmap</span>
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Hourly occupancy density across Monday to Sunday show slots.
              </p>
            </div>
            <Badge variant="outline" size="sm">7x6 Grid</Badge>
          </div>

          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-3">
            {/* Days of week rows */}
            {[
              { day: "Mon", vals: [20, 25, 30, 45, 60, 40] },
              { day: "Tue", vals: [15, 20, 35, 50, 70, 55] },
              { day: "Wed", vals: [20, 30, 40, 55, 65, 45] },
              { day: "Thu", vals: [30, 40, 50, 70, 85, 60] },
              { day: "Fri", vals: [45, 60, 75, 90, 98, 85] },
              { day: "Sat", vals: [65, 80, 95, 100, 98, 90] },
              { day: "Sun", vals: [60, 85, 98, 95, 88, 70] },
            ].map((row, rIdx) => (
              <div key={rIdx} className="flex items-center gap-2 text-xs">
                <span className="w-8 font-mono text-[#94A3B8] font-bold">{row.day}</span>
                <div className="grid grid-cols-6 gap-1.5 flex-1">
                  {row.vals.map((v, cIdx) => {
                    const bgClass =
                      v > 90
                        ? "bg-[#FBBF24] text-[#070B12]"
                        : v > 70
                        ? "bg-[#FBBF24]/70 text-white"
                        : v > 40
                        ? "bg-[#FBBF24]/40 text-white"
                        : "bg-[#2A3445]/50 text-[#64748B]";
                    return (
                      <div
                        key={cIdx}
                        className={`h-7 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold ${bgClass}`}
                        title={`${row.day} Slot ${cIdx + 1}: ${v}% Occupancy`}
                      >
                        {v}%
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex justify-between text-[10px] font-mono text-[#64748B] pt-2 border-t border-[#2A3445]/60 pl-10">
              <span>Morning (10AM)</span>
              <span>Matinee (1PM)</span>
              <span>Afternoon (4PM)</span>
              <span>Evening (7PM)</span>
              <span>Night (10PM)</span>
              <span>Late (1AM)</span>
            </div>
          </div>
        </div>

        {/* Format Comparison & Market Share */}
        <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#38BDF8]" />
                <span>Format Comparison & Premium Yield</span>
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Admissions, ticket pricing leverage, and occupancy by projection tier.
              </p>
            </div>
            <Badge variant="primary" size="sm">Breakdown</Badge>
          </div>

          <div className="space-y-3">
            {[
              {
                format: "IMAX Laser 4K",
                share: "38%",
                avgTicket: "₹650",
                fillRate: "91.2%",
                color: "bg-[#FBBF24]",
              },
              {
                format: "Dolby Atmos 128-ch",
                share: "28%",
                avgTicket: "₹450",
                fillRate: "82.5%",
                color: "bg-[#38BDF8]",
              },
              {
                format: "4DX Dynamic Motion",
                share: "18%",
                avgTicket: "₹550",
                fillRate: "78.0%",
                color: "bg-purple-400",
              },
              {
                format: "ScreenX 270° Panoramic",
                share: "10%",
                avgTicket: "₹480",
                fillRate: "71.4%",
                color: "bg-emerald-400",
              },
              {
                format: "Standard 2D / 3D Digital",
                share: "6%",
                avgTicket: "₹280",
                fillRate: "58.2%",
                color: "bg-gray-400",
              },
            ].map((fmt, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{fmt.format}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-[#94A3B8]">Avg: <strong className="text-white">{fmt.avgTicket}</strong></span>
                    <span className="text-emerald-400 font-bold">{fmt.fillRate} Fill</span>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-[#161F2E] overflow-hidden">
                  <div
                    style={{ width: fmt.share }}
                    className={`h-full rounded-full ${fmt.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
