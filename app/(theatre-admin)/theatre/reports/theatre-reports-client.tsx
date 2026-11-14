"use client";

import React, { useState, useTransition } from "react";
import { ReportSnapshot, ReportType, TimeFilterPreset } from "@/types/analytics.types";
import {
  generateReportAction,
  exportReportAction,
} from "@/actions/theatre-reports-actions";
import {
  GeneratedReportPayload,
  ReportCategoryKey,
  ReportDateRangePreset,
  ReportDefinition,
} from "@/types/theatre-reports-analytics.types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Film,
  Layers,
  Percent,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
  DollarSign,
} from "lucide-react";

interface CategoryMeta {
  key: ReportCategoryKey;
  definitionId: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
}

const CATEGORY_TABS: CategoryMeta[] = [
  {
    key: "EXECUTIVE_SUMMARY",
    definitionId: "DEF_EXECUTIVE_SUMMARY",
    label: "Executive Summary",
    shortLabel: "Executive",
    icon: Sparkles,
    description: "High-level board briefing, headline KPIs, revenue drivers and screen rank scorecards.",
  },
  {
    key: "REVENUE_REPORTS",
    definitionId: "DEF_REVENUE_PERFORMANCE",
    label: "Revenue Analytics",
    shortLabel: "Revenue",
    icon: DollarSign,
    description: "Box office gross & net, daily/weekly/monthly trends, ATV, RevPAS and dimensional splits.",
  },
  {
    key: "OCCUPANCY_REPORTS",
    definitionId: "DEF_OCCUPANCY_ANALYSIS",
    label: "Occupancy & Capacity",
    shortLabel: "Occupancy",
    icon: Users,
    description: "Seat utilization rates, peak vs matinee hours, and auditorium occupancy heatmaps.",
  },
  {
    key: "HALL_PERFORMANCE",
    definitionId: "DEF_HALL_PERFORMANCE",
    label: "Hall Fleet Yield",
    shortLabel: "Halls",
    icon: Building2,
    description: "Screen-by-screen gross revenue, ticket yield, and screen efficiency benchmarking.",
  },
  {
    key: "MOVIE_PERFORMANCE",
    definitionId: "DEF_MOVIE_PERFORMANCE",
    label: "Movie Box Office",
    shortLabel: "Movies",
    icon: Film,
    description: "Title exhibition performance, attendance volume, run duration and gross collections.",
  },
  {
    key: "BOOKING_TRENDS",
    definitionId: "DEF_BOOKING_TRENDS",
    label: "Booking Velocity",
    shortLabel: "Bookings",
    icon: Activity,
    description: "Confirmed admissions vs cancellations, cancellation rates, and hourly booking demand.",
  },
  {
    key: "CUSTOMER_ANALYTICS",
    definitionId: "DEF_CUSTOMER_ANALYTICS",
    label: "Patron Cohorts",
    shortLabel: "Customers",
    icon: Users,
    description: "New vs returning patron retention, visit frequency, and average customer lifetime spend.",
  },
  {
    key: "PAYMENT_ANALYTICS",
    definitionId: "DEF_PAYMENT_ANALYTICS",
    label: "Payment Rails",
    shortLabel: "Payments",
    icon: CreditCard,
    description: "Settlement rails (UPI, Cards, NetBanking, Cash), gateway success rates and reconciliation.",
  },
  {
    key: "THEATRE_GROWTH",
    definitionId: "DEF_THEATRE_GROWTH",
    label: "Growth & Telemetry",
    shortLabel: "Growth",
    icon: TrendingUp,
    description: "Month-over-month revenue growth rate, audience acquisition, and multi-year trajectory.",
  },
  {
    key: "OPERATIONAL_KPIS",
    definitionId: "DEF_OPERATIONAL_KPIS",
    label: "Operational KPIs",
    shortLabel: "Operations",
    icon: ShieldCheck,
    description: "Screen turnaround efficiency, turnstile throughput, and daily staff productivity metrics.",
  },
];

const PRESET_OPTIONS: Array<{ value: ReportDateRangePreset; label: string }> = [
  { value: "TODAY", label: "Today" },
  { value: "YESTERDAY", label: "Yesterday" },
  { value: "THIS_WEEK", label: "This Week" },
  { value: "THIS_MONTH", label: "This Month" },
  { value: "THIS_YEAR", label: "This Year" },
];

interface TheatreReportsClientProps {
  initialReports: ReportSnapshot[];
  initialReportPayload?: GeneratedReportPayload;
  theatreId: string;
}

export function TheatreReportsClient({
  initialReports,
  initialReportPayload,
  theatreId,
}: TheatreReportsClientProps) {
  // Category & Active Filter State
  const [activeCategory, setActiveCategory] = useState<ReportCategoryKey>("EXECUTIVE_SUMMARY");
  const [selectedPreset, setSelectedPreset] = useState<ReportDateRangePreset>("THIS_MONTH");
  const [currentReport, setCurrentReport] = useState<GeneratedReportPayload | null>(
    initialReportPayload || null
  );

  // Historical Snapshot archive state
  const [reports, setReports] = useState<ReportSnapshot[]>(initialReports);
  const [activeSnapshot, setActiveSnapshot] = useState<ReportSnapshot | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Transition & Loading States
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);

  // New legacy snapshot form state
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<ReportType>("REVENUE_PERFORMANCE");
  const [newPreset, setNewPreset] = useState<TimeFilterPreset>("last30days");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper to load report for chosen category and preset
  const handleSelectCategory = (meta: CategoryMeta, preset: ReportDateRangePreset = selectedPreset) => {
    setActiveCategory(meta.key);
    startTransition(async () => {
      const res = await generateReportAction({
        theatreId,
        definitionId: meta.definitionId,
        filters: {
          dateRangePreset: preset,
        },
      });

      if (res.success && res.data) {
        setCurrentReport(res.data);
      } else {
        showToast(res.error?.message || "Failed to generate analytical report.");
      }
    });
  };

  const handlePresetChange = (newPreset: ReportDateRangePreset) => {
    setSelectedPreset(newPreset);
    const meta = CATEGORY_TABS.find((t) => t.key === activeCategory) || CATEGORY_TABS[0];
    handleSelectCategory(meta, newPreset);
  };

  const handleExportCsv = async () => {
    if (!currentReport) return;
    setIsExporting(true);
    try {
      const activeMeta = CATEGORY_TABS.find((t) => t.key === activeCategory) || CATEGORY_TABS[0];
      const res = await exportReportAction({
        theatreId,
        definitionId: activeMeta.definitionId,
        format: "CSV",
        filters: { dateRangePreset: selectedPreset },
      });

      if (res.success && res.data) {
        const blob = new Blob([res.data.content], { type: res.data.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${activeCategory.toLowerCase()}_${theatreId}_${selectedPreset.toLowerCase()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`CSV export downloaded successfully.`);
      } else {
        showToast(res.error?.message || "Failed to export CSV report.");
      }
    } catch (err: unknown) {
      showToast("Export process encountered an unexpected issue.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const activeMeta = CATEGORY_TABS.find((t) => t.key === activeCategory) || CATEGORY_TABS[0];
      const res = await generateReportAction({
        theatreId,
        definitionId: activeMeta.definitionId,
        filters: {
          dateRangePreset: selectedPreset,
        },
      });

      if (res.success && res.data) {
        // Construct snapshot entry for history ledger
        const newSnapshot: ReportSnapshot = {
          id: res.data.reportId,
          theatreId,
          reportType: (newType as ReportType) || "REVENUE_PERFORMANCE",
          reportName: newTitle.trim() || res.data.reportTitle,
          dateRange: {
            from: res.data.effectiveDateRange.from,
            to: res.data.effectiveDateRange.to,
            preset: newPreset,
          },
          filters: res.data.filterState as unknown as Record<string, unknown>,
          status: "READY",
          metrics: res.data.summaryCards.reduce<Record<string, number | string>>((acc, card) => {
            acc[card.label] = card.formattedValue;
            return acc;
          }, {}),
          breakdown: res.data.detailedTableData as any,
          fileSize: "142 KB",
          createdAt: new Date().toISOString(),
        };

        setReports((prev) => [newSnapshot, ...prev]);
        setIsCreateModalOpen(false);
        setNewTitle("");
        showToast(`Snapshot "${newSnapshot.reportName}" archived to historical ledger.`);
      } else {
        showToast(res.error?.message || "Failed to generate snapshot.");
      }
    });
  };

  const filteredReports = reports.filter((r) =>
    r.reportName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMeta = CATEGORY_TABS.find((t) => t.key === activeCategory) || CATEGORY_TABS[0];

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 10 Core Category Horizontal Navigation Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#94A3B8]">
            BI Report Categories (10 Strategic Domains)
          </span>
          <span className="text-[11px] font-mono text-[#FBBF24]">
            Decoupled Historical Read-Model Store
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#2A3445]">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleSelectCategory(tab)}
                disabled={isPending}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? "bg-[#FBBF24]/10 border-[#FBBF24] text-[#FBBF24] shadow-md shadow-[#FBBF24]/5"
                    : "bg-[#111827] border-[#2A3445] text-[#94A3B8] hover:text-white hover:border-[#38455A]"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-[#FBBF24]" : "text-[#64748B]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Analytical View Header & Controls */}
      <Card variant="elevated" className="p-5 border-[#2A3445] bg-[#111827]/80 backdrop-blur-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#2A3445]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-[#FBBF24]/10 text-[#FBBF24]">
                <activeMeta.icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {currentReport?.reportTitle || activeMeta.label}
              </h3>
              <Badge variant="outline" size="sm" className="font-mono text-[10px] text-[#FBBF24] border-[#FBBF24]/40">
                {activeCategory}
              </Badge>
            </div>
            <p className="text-xs text-[#94A3B8]">
              {currentReport?.subtitle || activeMeta.description}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Time Period Selector */}
            <div className="flex items-center bg-[#070B12] rounded-xl border border-[#2A3445] p-1">
              <Calendar className="h-3.5 w-3.5 text-[#64748B] ml-2 shrink-0" />
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value as ReportDateRangePreset)}
                disabled={isPending}
                className="bg-transparent text-xs text-white px-2 py-1 focus:outline-none font-mono cursor-pointer"
              >
                {PRESET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#0F172A] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectCategory(activeMeta)}
              disabled={isPending}
              className="gap-1.5 border-[#2A3445] text-xs hover:border-[#FBBF24]"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#FBBF24] ${isPending ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            {/* Export CSV */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={isExporting || isPending}
              className="gap-1.5 border-[#2A3445] text-xs hover:border-emerald-500 hover:text-emerald-300"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
            </Button>

            {/* Generate Snapshot */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-1.5 font-bold text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Archive Snapshot</span>
            </Button>
          </div>
        </div>

        {/* Live Report Metadata Strip */}
        {currentReport && (
          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-[#64748B] gap-2 pt-1">
            <div className="flex items-center gap-3">
              <span>Venue: <strong className="text-white font-medium">{currentReport.theatreName}</strong></span>
              <span>•</span>
              <span>Currency: <strong className="text-[#FBBF24]">{currentReport.localization.currency} ({currentReport.localization.currencySymbol})</strong></span>
              <span>•</span>
              <span>Range: <strong className="text-white">{currentReport.effectiveDateRange.from} → {currentReport.effectiveDateRange.to}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span>Timezone: {currentReport.localization.timezone}</span>
              <span>•</span>
              <span>Execution: <strong className="text-emerald-400">{currentReport.executionTimeMs} ms</strong></span>
            </div>
          </div>
        )}

        {/* Headline KPI Summary Cards */}
        {currentReport && currentReport.summaryCards.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
            {currentReport.summaryCards.map((card, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#0B101B] border border-[#2A3445] hover:border-[#38455A] transition-all space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#94A3B8] font-mono uppercase tracking-wider truncate">
                    {card.label}
                  </span>
                  {card.trend && (
                    <span
                      className={`flex items-center text-[10px] font-mono font-bold ${
                        card.trend === "UP"
                          ? "text-emerald-400"
                          : card.trend === "DOWN"
                          ? "text-rose-400"
                          : "text-[#64748B]"
                      }`}
                    >
                      {card.trend === "UP" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : card.trend === "DOWN" ? (
                        <ArrowDownRight className="h-3 w-3" />
                      ) : null}
                      {card.changePercent !== undefined ? `${card.changePercent}%` : ""}
                    </span>
                  )}
                </div>
                <div className="text-lg font-bold text-white font-mono tracking-tight">
                  {card.formattedValue}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Visual Charts & Series Datapoints Section */}
        {currentReport && currentReport.chartSeries.length > 0 && (
          <div className="space-y-4 pt-3 border-t border-[#2A3445]">
            {currentReport.chartSeries.map((series, sIdx) => {
              const maxVal = Math.max(...series.datapoints.map((d) => d.primaryValue), 1);
              return (
                <div key={sIdx} className="space-y-3 p-4 rounded-xl bg-[#0B101B] border border-[#2A3445]">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                      <BarChart3 className="h-3.5 w-3.5 text-[#FBBF24]" />
                      {series.title}
                    </h4>
                    <Badge variant="outline" size="sm" className="font-mono text-[9px]">
                      {series.chartType} DISTRIBUTION
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {series.datapoints.slice(0, 8).map((dp, dpIdx) => {
                      const pct = Math.min(100, Math.round((dp.primaryValue / maxVal) * 100));
                      return (
                        <div key={dpIdx} className="space-y-1.5 p-2 rounded-lg bg-[#111827]/60 border border-[#1E293B]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#94A3B8] font-medium truncate max-w-[65%]">
                              {dp.dimensionKey}
                            </span>
                            <span className="text-white font-mono font-bold">
                              {dp.formattedPrimary || dp.primaryValue.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#FBBF24] to-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Dimensional Table Section */}
        {currentReport && currentReport.detailedTableData.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-[#2A3445]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#FBBF24]" />
                Granular Dimensional Ledger ({currentReport.detailedTableData.length} records)
              </h4>
              <span className="text-[10px] font-mono text-[#64748B]">
                Sorted by Primary Contribution
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#2A3445] bg-[#070B12]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#111827] text-[#94A3B8] font-mono border-b border-[#2A3445]">
                  <tr>
                    {currentReport.tableColumns.map((col) => (
                      <th key={col.key} className="p-3 uppercase font-mono text-[10px] tracking-wider">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {currentReport.detailedTableData.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#111827]/50 transition-colors">
                      {currentReport.tableColumns.map((col) => (
                        <td key={col.key} className="p-3 text-white font-mono text-[11px]">
                          {row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* Historical Report Snapshots & Archives */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#FBBF24]" />
              Historical Report Snapshots & Settlement Ledgers
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Immutable audit snapshots persisted for tax reconciliation, distributor settlements, and compliance.
            </p>
          </div>

          <div className="relative min-w-[260px]">
            <Search className="h-3.5 w-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search archived ledgers..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
            />
          </div>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <Card
              key={report.id}
              variant="elevated"
              className="p-5 flex flex-col justify-between space-y-4 hover:border-[#FBBF24]/40 transition-colors bg-[#111827]/70"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-[#0B101B] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] shrink-0">
                      <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm tracking-tight">{report.reportName}</h4>
                      <span className="text-[10px] font-mono text-[#64748B]">
                        ID: {report.id} • {report.fileSize}
                      </span>
                    </div>
                  </div>

                  <Badge variant="outline" size="sm" className="font-mono text-[9px] shrink-0 text-[#94A3B8]">
                    {report.reportType}
                  </Badge>
                </div>

                {/* Metrics Summary Strip */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {Object.entries(report.metrics).slice(0, 4).map(([key, val]) => (
                    <div key={key} className="p-2 rounded-lg bg-[#0B101B] border border-[#2A3445]/60">
                      <span className="text-[9px] text-[#64748B] block truncate uppercase">
                        {key.replace(/([A-Z])/g, " $1")}
                      </span>
                      <span className="text-white font-bold text-xs block truncate mt-0.5">
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#2A3445] flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-mono text-[11px] flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>

                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setActiveSnapshot(report)}
                  className="gap-1.5 border-[#2A3445] text-xs hover:border-[#FBBF24]"
                >
                  <Eye className="h-3.5 w-3.5 text-[#FBBF24]" />
                  Inspect
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Snapshot Inspector Modal */}
      {activeSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-2xl bg-[#0F172A] border border-[#2A3445] shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-[#2A3445]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{activeSnapshot.reportName}</h3>
                  <Badge variant="primary" size="sm">
                    {activeSnapshot.status}
                  </Badge>
                </div>
                <p className="text-xs text-[#94A3B8] mt-1 font-mono">
                  Type: {activeSnapshot.reportType} • Period: {activeSnapshot.dateRange.preset} • Size: {activeSnapshot.fileSize}
                </p>
              </div>

              <button
                onClick={() => setActiveSnapshot(null)}
                className="text-[#64748B] hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Executive KPI Summary
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(activeSnapshot.metrics).map(([k, v]) => (
                  <div key={k} className="p-3 rounded-xl bg-[#070B12] border border-[#2A3445]">
                    <span className="text-[10px] text-[#64748B] uppercase font-mono block">
                      {k.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="text-sm font-bold text-white font-mono mt-1 block">
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Breakdown Table */}
            {activeSnapshot.breakdown && activeSnapshot.breakdown.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Granular Breakdown Rows
                </h4>
                <div className="overflow-x-auto rounded-xl border border-[#2A3445] bg-[#070B12]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#111827] text-[#94A3B8] font-mono border-b border-[#2A3445]">
                      <tr>
                        {Object.keys(activeSnapshot.breakdown[0]).map((col) => (
                          <th key={col} className="p-2.5 uppercase font-mono text-[10px]">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]">
                      {activeSnapshot.breakdown.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#111827]/40">
                          {Object.values(row).map((val, cellIdx) => (
                            <td key={cellIdx} className="p-2.5 text-white font-mono text-[11px]">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2A3445]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSnapshot(null)}
                className="border-[#2A3445] text-xs"
              >
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Custom Snapshot Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleGenerateSnapshot}
            className="w-full max-w-lg rounded-2xl bg-[#0F172A] border border-[#2A3445] shadow-2xl p-6 space-y-5"
          >
            <div className="flex items-start justify-between pb-3 border-b border-[#2A3445]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#FBBF24]" />
                  Archive New Snapshot Report
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Pre-aggregate performance metrics and persist an immutable business ledger.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#64748B] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#94A3B8] block mb-1 font-mono">Report Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Weekly IMAX Format Box Office Audit"
                  className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white text-xs focus:outline-none focus:border-[#FBBF24]"
                />
              </div>

              <div>
                <label className="text-[#94A3B8] block mb-1 font-mono">Report Category / Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as ReportType)}
                  className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white text-xs focus:outline-none focus:border-[#FBBF24]"
                >
                  <option value="REVENUE_PERFORMANCE">Revenue & Settlement Ledger</option>
                  <option value="OCCUPANCY_UTILIZATION">Auditorium Occupancy & Seat Utilization</option>
                  <option value="MOVIE_BOX_OFFICE">Movie Box Office & Format Yield</option>
                  <option value="HALL_CAPACITY">Hall Capacity & Utilization</option>
                  <option value="PAYMENT_RECONCILIATION">Payment Method Reconciliation</option>
                </select>
              </div>

              <div>
                <label className="text-[#94A3B8] block mb-1 font-mono">Time Period Preset</label>
                <select
                  value={newPreset}
                  onChange={(e) => setNewPreset(e.target.value as TimeFilterPreset)}
                  className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white text-xs focus:outline-none focus:border-[#FBBF24]"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">Full Year</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A3445]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
                className="border-[#2A3445] text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isPending}
                className="font-bold text-xs"
              >
                {isPending ? "Generating..." : "Archive Snapshot"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}