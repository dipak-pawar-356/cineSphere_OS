"use client";

import React, { useState, useTransition } from "react";
import { ReportSnapshot, ReportType, TimeFilterPreset } from "@/types/analytics.types";
import { generateReportAction } from "@/actions/analytics-actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";

interface TheatreReportsClientProps {
  initialReports: ReportSnapshot[];
  theatreId: string;
}

export function TheatreReportsClient({
  initialReports,
  theatreId,
}: TheatreReportsClientProps) {
  const [reports, setReports] = useState<ReportSnapshot[]>(initialReports);
  const [activeSnapshot, setActiveSnapshot] = useState<ReportSnapshot | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New report form state
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<ReportType>("REVENUE_PERFORMANCE");
  const [newPreset, setNewPreset] = useState<TimeFilterPreset>("last30days");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await generateReportAction({
        theatreId,
        reportName: newTitle.trim() || "Auditorium Performance & Box Office Ledger",
        reportType: newType,
        dateRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString(),
          preset: newPreset,
        },
        dimensions: ["MOVIE", "HALL", "SECTION"],
        metrics: ["revenue", "bookings", "occupancy", "atp"],
      });

      if (res.success && res.data) {
        setReports((prev) => [res.data!, ...prev]);
        setIsCreateModalOpen(false);
        setNewTitle("");
        showToast(`Report "${res.data.reportName}" generated successfully.`);
      }
    });
  };

  const filteredReports = reports.filter((r) =>
    r.reportName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative min-w-[260px]">
          <Search className="h-3.5 w-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report archives..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 font-bold text-xs"
        >
          <Plus className="h-4 w-4" />
          Generate Snapshot Report
        </Button>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((report) => (
          <Card
            key={report.id}
            variant="elevated"
            className="p-5 flex flex-col justify-between space-y-4 hover:border-[#FBBF24]/40 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] shrink-0">
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm tracking-tight">{report.reportName}</h4>
                    <span className="text-[10px] font-mono text-[#64748B]">
                      ID: {report.id} • {report.fileSize}
                    </span>
                  </div>
                </div>

                <Badge variant="outline" size="sm" className="font-mono text-[10px] shrink-0">
                  {report.reportType}
                </Badge>
              </div>

              {/* Metrics Summary Strip */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-xs font-mono">
                {Object.entries(report.metrics).slice(0, 3).map(([key, val]) => (
                  <div key={key} className="p-2 rounded-lg bg-[#111827] border border-[#2A3445]/60">
                    <span className="text-[10px] text-[#64748B] block truncate uppercase">
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
                Inspect Snapshot
              </Button>
            </div>
          </Card>
        ))}
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
            onSubmit={handleGenerateReport}
            className="w-full max-w-lg rounded-2xl bg-[#0F172A] border border-[#2A3445] shadow-2xl p-6 space-y-5"
          >
            <div className="flex items-start justify-between pb-3 border-b border-[#2A3445]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#FBBF24]" />
                  Generate Snapshot Report
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Pre-aggregate performance metrics and generate an immutable business ledger.
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
                {isPending ? "Generating..." : "Generate Snapshot"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
