"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LATEST_TICKETS_DATA } from "@/lib/constants/super-admin";
import {
  Headphones,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ticket,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminSupportTicketsPage() {
  const [selectedPriority, setSelectedPriority] = useState("all");

  const filteredTickets = LATEST_TICKETS_DATA.filter((t) => {
    if (selectedPriority === "all") return true;
    return t.priority.toLowerCase() === selectedPriority.toLowerCase();
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Exhibitor & Patron Support Desk"
        subtitle="Hardware Incidents, Double Billing Escalations & Emergency Turnstile Tickets"
        description="Centralized ticketing queue with automated priority escalation for active showtime technical failures."
        badge="Concierge Desk"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <Plus className="h-4 w-4" /> Create Support Ticket (Disabled)
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {[
            { id: "all", label: "All Tickets (4)" },
            { id: "urgent", label: "Urgent Priority" },
            { id: "high", label: "High" },
            { id: "medium", label: "Medium" },
          ].map((pr) => (
            <button
              key={pr.id}
              onClick={() => setSelectedPriority(pr.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium capitalize ${
                selectedPriority === pr.id
                  ? "bg-[#FBBF24] text-[#070B12] font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {pr.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search tickets by ID or submitter... (disabled)"
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
            disabled
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.map((t) => (
          <div
            key={t.id}
            className="p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3 hover:border-[#FBBF24]/40 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#FBBF24] text-xs">{t.ticketRef}</span>
                <Badge variant="outline" size="sm">{t.category}</Badge>
                <Badge variant={t.priority === "Urgent" ? "danger" : "warning"} size="sm">
                  {t.priority}
                </Badge>
              </div>
              <span className="text-[11px] font-mono text-[#64748B]">{t.time}</span>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm">{t.subject}</h4>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Reported by <strong className="text-white">{t.submitter}</strong> • Venue: {t.theatre}
              </p>
            </div>

            <div className="pt-2 border-t border-[#2A3445]/60 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-[#CBD5E1]">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>Status: <strong className="text-white">{t.status}</strong></span>
              </span>
              <Button variant="outline" size="sm" disabled className="h-7 text-xs px-2.5 border-[#2A3445]">
                View Thread (Disabled)
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

