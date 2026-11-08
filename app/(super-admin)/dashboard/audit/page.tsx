"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { usePlatformStore } from "@/store/platform-store";
import {
  History,
  Search,
  Filter,
  Shield,
  Clock,
  Terminal,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminAuditPage() {
  const { auditLogs } = usePlatformStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModule, setFilterModule] = useState<string>("all");

  const filteredLogs = auditLogs.filter((log) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const mD = log.description.toLowerCase().includes(q);
      const mA = log.action.toLowerCase().includes(q);
      const mU = log.user.toLowerCase().includes(q);
      if (!mD && !mA && !mU) return false;
    }
    if (filterModule !== "all" && log.module.toLowerCase() !== filterModule.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Immutable Platform Security Audit Trail"
        subtitle="Tamper-Evident Security Log Capturing Administrative Actions, License Approvals & Edge Rotations"
        badge="Zero Log Tamper"
        badgeVariant="success"
        actions={
          <Button variant="outline" size="sm" className="gap-2 border-[#2A3445] text-xs font-semibold">
            <Download className="h-3.5 w-3.5" /> Export Security Audit (JSON)
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {["all", "theatres", "settings", "security"].map((mod) => (
            <button
              key={mod}
              onClick={() => setFilterModule(mod)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium ${
                filterModule === mod ? "bg-[#FBBF24] text-[#070B12] font-bold" : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, description, IP..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-5">Timestamp (IST)</th>
                <th className="py-3.5 px-5">User & Role</th>
                <th className="py-3.5 px-5">Action Key</th>
                <th className="py-3.5 px-5">Module</th>
                <th className="py-3.5 px-5">Event Description</th>
                <th className="py-3.5 px-5">IP Address</th>
                <th className="py-3.5 px-5">Device Client</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-white text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-white">{log.user}</div>
                    <Badge variant="warning" size="sm" className="text-[9px] mt-0.5">
                      {log.role}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5 font-mono font-bold text-[#FBBF24]">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-5 text-[#94A3B8]">{log.module}</td>
                  <td className="py-3.5 px-5 text-white max-w-md">{log.description}</td>
                  <td className="py-3.5 px-5 font-mono text-[11px] text-emerald-400">
                    {log.ipAddress}
                  </td>
                  <td className="py-3.5 px-5 text-[10px] text-[#94A3B8] max-w-xs truncate">
                    {log.device}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

