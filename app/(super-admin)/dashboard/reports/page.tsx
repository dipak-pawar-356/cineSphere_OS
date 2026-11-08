"use client";

import React, { useState, useMemo } from "react";
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
  Users,
  Coffee,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ReportItem {
  id: string;
  title: string;
  category: "revenue" | "bookings" | "occupancy" | "movies" | "theatres" | "cities" | "customers";
  description: string;
  period: string;
  recordsCount: string;
  fileSize: string;
  icon: React.ComponentType<{ className?: string }>;
}

const REPORT_CARDS: ReportItem[] = [
  {
    id: "rep-1",
    title: "Gross Revenue & Distributor Box Office Settlement",
    category: "revenue",
    description: "Aggregated box office collections, 55/45 exhibitor-distributor splits, GST/TDS deductions, and net yield.",
    period: "Monthly (Oct - Nov 2026)",
    recordsCount: "124,850 Bookings",
    fileSize: "4.2 MB",
    icon: TrendingUp,
  },
  {
    id: "rep-2",
    title: "Circuit-Wide Booking & Ticketing Audit",
    category: "bookings",
    description: "Every ticket transaction, seat allocation, refund event, discount voucher, and payment gateway settlement.",
    period: "Last 30 Days",
    recordsCount: "148,200 Transactions",
    fileSize: "8.6 MB",
    icon: CreditCard,
  },
  {
    id: "rep-3",
    title: "Auditorium Occupancy & Fill Rate Analysis",
    category: "occupancy",
    description: "Seat capacity utilization percentages broken down across IMAX, 4DX, ScreenX, and Dolby Atmos screens.",
    period: "Q3 2026",
    recordsCount: "110 Screens",
    fileSize: "2.8 MB",
    icon: Layers,
  },
  {
    id: "rep-4",
    title: "Movie Box Office & Distributor Performance",
    category: "movies",
    description: "Title-by-title gross collection, rental terms, KDM activation dates, and Hollywood/Regional distributor shares.",
    period: "Active Run (48 Titles)",
    recordsCount: "48 Movies",
    fileSize: "3.4 MB",
    icon: Film,
  },
  {
    id: "rep-5",
    title: "Metro Cities & Regional Circuit Yield",
    category: "cities",
    description: "Municipal entertainment tax filings and regional box office contributions across all 12 metro jurisdictions.",
    period: "Rolling 90 Days",
    recordsCount: "12 Metro Hubs",
    fileSize: "1.9 MB",
    icon: MapPin,
  },
  {
    id: "rep-6",
    title: "Exhibitor Complex Compliance & Hardware Audit",
    category: "theatres",
    description: "Hardware calibration logs, projection lamp runtimes, sound level certifications, and active licences.",
    period: "Annual 2026",
    recordsCount: "25 Theatres",
    fileSize: "5.1 MB",
    icon: Building2,
  },
  {
    id: "rep-7",
    title: "Customer Loyalty & Retention Cohort Report",
    category: "customers",
    description: "Patron attendance frequency, VIP lounge spend per admission, repeat rate, and churn metrics.",
    period: "Year to Date",
    recordsCount: "385,000 Patrons",
    fileSize: "6.2 MB",
    icon: Users,
  },
];

export default function SuperAdminReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const filteredReports = useMemo(() => {
    return REPORT_CARDS.filter((rep) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!rep.title.toLowerCase().includes(q) && !rep.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (selectedCategory !== "all" && rep.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const handleExport = (title: string, format: "PDF" | "Excel" | "CSV") => {
    setDownloadToast(`Preparing ${format} download for "${title}"... Ingress verified.`);
    setTimeout(() => setDownloadToast(null), 4000);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Reporting & Regulatory Box Office Marts"
        subtitle="Executive Financial Audit, Distributor Splits, CBFC Declarations & Operational Analytics"
        badge="Audit Ready"
        badgeVariant="primary"
      />

      {downloadToast && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{downloadToast}</span>
          </div>
          <button onClick={() => setDownloadToast(null)} className="text-emerald-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {[
            { id: "all", label: "All Reports" },
            { id: "revenue", label: "Revenue" },
            { id: "bookings", label: "Bookings" },
            { id: "occupancy", label: "Occupancy" },
            { id: "movies", label: "Movies" },
            { id: "theatres", label: "Theatres" },
            { id: "cities", label: "Cities" },
            { id: "customers", label: "Customers" },
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

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report titles..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
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
              className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4 hover:border-[#FBBF24]/40 transition-colors flex flex-col justify-between shadow-xl"
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
                  <Badge variant="outline" size="sm" className="capitalize">{report.category}</Badge>
                </div>

                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {report.description}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-[#2A3445]/60 text-[#64748B]">
                  <span>Scope: <strong className="text-white">{report.recordsCount}</strong></span>
                  <span>Archive Size: <strong className="text-[#FBBF24]">{report.fileSize}</strong></span>
                </div>
              </div>

              {/* Action Buttons: Export PDF, Excel, CSV */}
              <div className="pt-3 border-t border-[#2A3445] grid grid-cols-3 gap-2">
                <Button
                  onClick={() => handleExport(report.title, "PDF")}
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs h-8 border-[#2A3445] hover:text-rose-400"
                >
                  <FileType className="h-3.5 w-3.5 text-rose-400" />
                  <span>PDF</span>
                </Button>

                <Button
                  onClick={() => handleExport(report.title, "Excel")}
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs h-8 border-[#2A3445] hover:text-emerald-400"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Excel</span>
                </Button>

                <Button
                  onClick={() => handleExport(report.title, "CSV")}
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs h-8 border-[#2A3445] hover:text-[#FBBF24]"
                >
                  <Download className="h-3.5 w-3.5 text-[#FBBF24]" />
                  <span>CSV</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
