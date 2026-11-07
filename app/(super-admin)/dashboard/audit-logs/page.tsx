"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AUDIT_LOGS_DATA } from "@/lib/constants/super-admin";
import {
  History,
  Shield,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Terminal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminAuditLogsPage() {
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredLogs = AUDIT_LOGS_DATA.filter((log) => {
    if (selectedStatus === "all") return true;
    return log.status.toLowerCase() === selectedStatus.toLowerCase();
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Immutable Platform Audit Trail"
        subtitle="Cryptographic Activity Records, API Invocations & Privileged Super Admin Actions"
        description="Tamper-proof compliance ledger tracking configuration changes, security events, license requests, and financial reconciliations."
        badge="SOC-2 Audit Log"
        badgeVariant="primary"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
              <Filter className="h-4 w-4" /> Filter Logs
            </Button>
            <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
              <Download className="h-4 w-4" /> Export CSV / JSON (Disabled)
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {[
            { id: "all", label: "All Logs (6)" },
            { id: "success", label: "Success" },
            { id: "flagged", label: "Flagged Incidents" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium capitalize ${
                selectedStatus === st.id
                  ? "bg-[#FBBF24] text-[#070B12] font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search actor, action, or IP... (disabled)"
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
            disabled
          />
        </div>
      </div>

      {/* Professional Audit Table */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-5">Who (Actor)</th>
                <th className="py-3.5 px-5">Action Description</th>
                <th className="py-3.5 px-5">Module</th>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-5">IP Address</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-white">{log.who}</div>
                    <div className="text-[11px] font-mono text-[#64748B]">{log.email}</div>
                  </td>
                  <td className="py-3.5 px-5 font-medium text-white max-w-xs">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-5">
                    <Badge variant="outline" size="sm">{log.module}</Badge>
                  </td>
                  <td className="py-3.5 px-5 text-[#94A3B8] font-mono">{log.time}</td>
                  <td className="py-3.5 px-5 font-mono text-xs text-[#FBBF24]">{log.ipAddress}</td>
                  <td className="py-3.5 px-5">
                    <Badge variant={log.status === "Success" ? "success" : "danger"} size="sm">
                      {log.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer with pagination */}
        <div className="p-4 bg-[#111827]/60 border-t border-[#2A3445] flex items-center justify-between text-xs text-[#94A3B8]">
          <span className="font-mono text-[11px]">Showing 6 immutable block entries</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs border-[#2A3445]">
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs border-[#2A3445]">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

