"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useTheatreStore } from "@/store/theatre-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Clock,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Ticket,
  Layers,
  Film,
  Sparkles,
} from "lucide-react";

export default function TheatreReportsPage() {
  const { profile, halls, movies, shows, logTenantAudit } = useTheatreStore();

  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleExport = (reportName: string, format: string) => {
    logTenantAudit("REPORT_EXPORTED", "Reports", `Exported ${reportName} in ${format} format`);
    setDownloadNotice(`Generated and downloaded "${reportName}" (${format.toUpperCase()}).`);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  const reportSuites = [
    {
      title: "Daily Box Office Revenue & Settlement Ledger",
      category: "Revenue",
      desc: "Detailed breakdown of ticket collections per show, split by NPCI UPI and supplementary gateway rails.",
      size: "2.4 MB",
      frequency: "Daily automated run (06:00 AM)",
    },
    {
      title: "Auditorium Occupancy & Seat Utilization",
      category: "Occupancy",
      desc: "Hall-by-hall fill rates, VIP motorized recliner attachment, and interval turnover velocity across all screens.",
      size: "4.1 MB",
      frequency: "Hourly telemetry aggregation",
    },
    {
      title: "Movie Performance & Format Yield Split",
      category: "Movie Performance",
      desc: "Gross box office yield comparison across IMAX Laser, Dolby Cinema, 4DX, and Standard 2D exhibition prints.",
      size: "1.9 MB",
      frequency: "Weekly distributor review",
    },
    {
      title: "Hall Engineering & Projection Telemetry",
      category: "Hall Performance",
      desc: "Projector lamp runtime hours, laser optic calibration scores, and Dolby Atmos acoustic processor headroom.",
      size: "3.2 MB",
      frequency: "Daily hardware sweep",
    },
    {
      title: "Popular Showtimes & Peak Hour Analysis",
      category: "Popular Shows",
      desc: "Heatmap of patron reservation velocity analyzing evening prime drops vs afternoon student concessions.",
      size: "1.8 MB",
      frequency: "Rolling 30-day analytics",
    },
    {
      title: "GST Entertainment Tax Monthly Return",
      category: "Compliance",
      desc: "18% GST output tax liability statement mapped to state commercial tax authorities.",
      size: "1.1 MB",
      frequency: "Monthly compliance ledger",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Audit & Operational Box Office Reports"
        subtitle={`${profile.name} • Automated Revenue, Occupancy & Tax Filings`}
        description="Access audit-grade operational reports, box office distributor settlement sheets, hall performance metrics, and tax compliance data."
        badge="Ready for Export"
        badgeVariant="success"
      />

      {downloadNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* High-Level Reporting Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Daily Gross Revenue</span>
          <div className="text-2xl font-black font-mono text-white">₹4,85,250</div>
          <span className="text-[10px] text-emerald-400 font-semibold">+18.4% vs Daily Target</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Monthly Revenue</span>
          <div className="text-2xl font-black font-mono text-white">₹1.12 Cr</div>
          <span className="text-[10px] text-emerald-400">104% of Monthly Target</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Overall Occupancy</span>
          <div className="text-2xl font-black font-mono text-[#FBBF24]">92.4% Average</div>
          <span className="text-[10px] text-[#94A3B8]">Peak 98.2% in Hall 1</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Top Popular Show</span>
          <div className="text-base font-bold text-white truncate">Pushpa 2 (07:15 PM)</div>
          <span className="text-[10px] text-emerald-400 font-mono font-semibold">₹2.84 L Box Office</span>
        </Card>
      </div>

      {/* Performance Split Overview: Movie & Hall */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" className="p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#2A3445] pb-2.5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Film className="h-4 w-4 text-[#FBBF24]" /> Movie Performance Ranking (Today)
            </h3>
            <Badge variant="outline" size="sm">Top 3 Titles</Badge>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { title: "Pushpa 2: The Rule", screens: "Hall 1, Hall 2", revenue: "₹2,84,000", fill: "98.2%" },
              { title: "Kalki 2898 AD", screens: "Hall 3", revenue: "₹1,12,500", fill: "89.4%" },
              { title: "Dune: Part Two (IMAX)", screens: "Hall 1 (Morning)", revenue: "₹88,750", fill: "86.1%" },
            ].map((m, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{m.title}</div>
                  <div className="text-[10px] text-[#64748B]">{m.screens}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-400">{m.revenue}</div>
                  <div className="text-[10px] text-[#FBBF24] font-mono">{m.fill} Occupancy</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="elevated" className="p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#2A3445] pb-2.5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#38BDF8]" /> Hall Performance & Yield
            </h3>
            <Badge variant="outline" size="sm">{halls.length} Auditoriums</Badge>
          </div>

          <div className="space-y-2.5 text-xs">
            {halls.slice(0, 3).map((hall) => (
              <div key={hall.id} className="p-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{hall.name}</div>
                  <div className="text-[10px] text-[#64748B] font-mono">{hall.screenType} • {hall.capacity} Seats</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-white">{hall.occupancyPercent}% Fill</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">100% Operational</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detailed Report Suites with Active PDF, Excel & CSV Generators */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
            Automated Audit Packages & Filings
          </h2>
          <span className="text-xs text-[#64748B]">Click format pill to simulate download</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportSuites.map((rep, idx) => (
            <Card key={idx} variant="elevated" className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" size="sm">{rep.category}</Badge>
                  <span className="text-[10px] font-mono text-[#64748B]">{rep.size}</span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base leading-snug">{rep.title}</h3>
                  <p className="text-xs text-[#94A3B8] mt-1">{rep.desc}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#2A3445] space-y-2">
                <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {rep.frequency}
                </span>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleExport(rep.title, "PDF")}
                    className="text-[11px] border-[#2A3445] text-white hover:border-[#E50914] hover:text-[#E50914]"
                  >
                    <Download className="h-3 w-3 mr-1" /> PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleExport(rep.title, "Excel")}
                    className="text-[11px] border-[#2A3445] text-white hover:border-emerald-400 hover:text-emerald-400"
                  >
                    <Download className="h-3 w-3 mr-1" /> Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleExport(rep.title, "CSV")}
                    className="text-[11px] border-[#2A3445] text-white hover:border-[#FBBF24] hover:text-[#FBBF24]"
                  >
                    <Download className="h-3 w-3 mr-1" /> CSV
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
