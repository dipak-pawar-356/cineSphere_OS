"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { usePlatformStore, type SupportTicket } from "@/store/platform-store";
import {
  Headphones,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  User,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminSupportPage() {
  const { supportTickets, updateTicketStatus, assignTicket } = usePlatformStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredTickets = supportTickets.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!t.subject.toLowerCase().includes(q) && !t.theatreName.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filterStatus !== "all" && t.status.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Multi-Tenant Support Desk & Incident Escalation"
        subtitle="Exhibitor Technical Inquiries, Acoustic Calibration Tickets & Bug Reporting"
        badge={`${supportTickets.length} Escalations`}
        badgeVariant="primary"
      />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {["all", "open", "in progress", "resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium ${
                filterStatus === st ? "bg-[#FBBF24] text-[#070B12] font-bold" : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets by subject, theatre..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
          />
        </div>
      </div>

      {/* Tickets Table */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-5">Ticket / Subject</th>
                <th className="py-3.5 px-5">Exhibitor Theatre</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Priority</th>
                <th className="py-3.5 px-5">Assigned To</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {filteredTickets.map((tkt) => (
                <tr key={tkt.id} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-white">{tkt.subject}</div>
                    <div className="text-[10px] text-[#64748B] font-mono">{tkt.ticketNumber} · Submitter: {tkt.submitterEmail}</div>
                  </td>
                  <td className="py-3.5 px-5 font-medium text-white">{tkt.theatreName}</td>
                  <td className="py-3.5 px-5 text-[#94A3B8]">{tkt.category}</td>
                  <td className="py-3.5 px-5">
                    <Badge
                      variant={
                        tkt.priority === "Critical"
                          ? "danger"
                          : tkt.priority === "High"
                          ? "warning"
                          : "secondary"
                      }
                      size="sm"
                    >
                      {tkt.priority}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-white text-[11px]">{tkt.assignedTo}</td>
                  <td className="py-3.5 px-5">
                    <Badge
                      variant={
                        tkt.status === "Resolved"
                          ? "success"
                          : tkt.status === "In Progress"
                          ? "warning"
                          : "secondary"
                      }
                      size="sm"
                    >
                      {tkt.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {tkt.status !== "Resolved" ? (
                        <Button
                          onClick={() => updateTicketStatus(tkt.id, "Resolved")}
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                        >
                          Resolve
                        </Button>
                      ) : (
                        <Button
                          onClick={() => updateTicketStatus(tkt.id, "In Progress")}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-[#94A3B8]"
                        >
                          Reopen
                        </Button>
                      )}
                    </div>
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
