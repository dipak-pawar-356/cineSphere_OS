"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  FileSpreadsheet,
  FileType,
  Clock,
  CheckCircle2,
  Building2,
  Film,
  TrendingUp,
  CreditCard,
  Layers,
  MapPin,
  Coffee,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const REPORT_CARDS = [
    {
      id: "rep-1",
      title: "Gross Revenue & Distributor Settlement",
      category: "financial",
      description: "Aggregated box office gross, exhibitor-distributor splits (55/45), GST/VAT deductions, and net yield.",
      period: "Monthly (Oct 2026)",
      recordsCount: "124,850 Bookings",
      fileSize: "4.2 MB",
      format: "PDF + XLSX",
      icon: TrendingUp,
    },
    {
      id: "rep-2",
      title: "Circuit-Wide Booking & Ticketing Audit",
      category: "operational",
      description: "Every ticket transaction, seat allocation, refund event, discount voucher, and payment gateway fee.",
      period: "Last 30 Days",
      recordsCount: "148,200 Transactions",
      fileSize: "8.6 MB",
      format: "XLSX + CSV",
      icon: CreditCard,
    },
    {
      id: "rep-3",
      title: "Auditorium Occupancy & Fill Rate Analysis",
      category: "operational",
      description: "Seat capacity utilization percentages broken down across IMAX, 4DX, ScreenX, and Dolby Atmos screens.",
      period: "Q3 2026",
      recordsCount: "110 Screens",
      fileSize: "2.8 MB",
      format: "PDF + XLSX",
      icon: Layers,
    },
    {
      id: "rep-4",
      title: "Movie Box Office & Distributor Performance",
      category: "catalog",
      description: "Title-by-title gross collection, rental terms, KDM activation dates, and Hollywood/Regional distributor shares.",
      period: "Active Run (48 Titles)",
      recordsCount: "48 Movies",
      fileSize: "3.4 MB",
      format: "PDF",
      icon: Film,
    },
    {
      id: "rep-5",
      title: "Metro Cities & Regional Circuit Yield",
      category: "financial",
      description: "Municipal entertainment tax filings and regional box office contributions across all 12 metro jurisdictions.",
      period: "Rolling 90 Days",
      recordsCount: "12 Metro Hubs",
      fileSize: "1.9 MB",
      format: "PDF + XLSX",
      icon: MapPin,
    },
    {
      id: "rep-6",
      title: "F&B Concessions & Attach Rate Breakdown",
      category: "financial",
      description: "Gourmet concession yields, combo sales ratios, kiosk QR throughput, and inventory wastage reconciliation.",
      period: "Monthly (Oct 2026)",
      recordsCount: "68,400 Orders",
      fileSize: "3.1 MB",
      format: "XLSX",
      icon: Coffee,
    },
    {
      id: "rep-7",
      title: "Rentrak / Comscore EDI Compliance Audit",
      category: "tax",
      description: "Automated nightly EDI 460 box office dispatches submitted to global industry reporting authorities.",
      period: "Daily Scheduled",
      recordsCount: "30 Transmissions",
      fileSize: "850 KB",
      format: "EDI / XML",
      icon: FileText,
    },
    {
      id: "rep-8",
      title: "Hardware Laser Projector & Uptime Log",
      category: "operational",
      description: "Barco and Christie laser engine operating hours, calibration certificates, and turnstile telemetry.",
      period: "Annual 2026",
      recordsCount: "110 Projectors",
      fileSize: "1.4 MB",
      format: "PDF",
      icon: Building2,
    },
  ];

  const filteredReports =
    selectedCategory === "all"
      ? REPORT_CARDS
      : REPORT_CARDS.filter((r) => r.category === selectedCategory);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Compliance & Financial Reports"
        subtitle="Distributor Settlements, Box Office Audits, Occupancy Ledgers & Comscore EDI Exports"
        description="Generate certified fiscal statements, tax filing schedules, and hardware telemetry archives across the entire CineSphere circuit."
        badge="Audit Vault"
        badgeVariant="primary"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
              <Calendar className="h-4 w-4" /> Select Date Range
            </Button>
            <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
              <Download className="h-4 w-4" /> Batch Download All
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {[
            { id: "all", label: "All Reports (8)" },
            { id: "financial", label: "Financial & Splits" },
            { id: "operational", label: "Operations & Screens" },
            { id: "catalog", label: "Movies & Distro" },
            { id: "tax", label: "Comscore & Tax" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                selectedCategory === cat.id
                  ? "bg-[#FBBF24] text-[#070B12] font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Placeholder */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search report titles... (disabled)"
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
            disabled
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReports.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4 hover:border-[#FBBF24]/40 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{report.title}</h3>
                      <div className="text-[11px] text-[#94A3B8]">{report.period}</div>
                    </div>
                  </div>
                  <Badge variant="outline" size="sm">{report.format}</Badge>
                </div>

                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {report.description}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-[#2A3445]/60 text-[#64748B]">
                  <span>Scope: <strong className="text-white">{report.recordsCount}</strong></span>
                  <span>Archive: <strong className="text-[#FBBF24]">{report.fileSize}</strong></span>
                </div>
              </div>

              {/* Action Buttons: Export PDF & Excel (Disabled) */}
              <div className="pt-3 border-t border-[#2A3445] flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="flex-1 gap-1.5 text-xs h-8 border-[#2A3445]"
                >
                  <FileType className="h-3.5 w-3.5 text-rose-400" />
                  <span>Export PDF (Disabled)</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="flex-1 gap-1.5 text-xs h-8 border-[#2A3445]"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Export Excel (Disabled)</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
