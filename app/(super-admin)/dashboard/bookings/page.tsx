"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LATEST_BOOKINGS_DATA } from "@/lib/constants/super-admin";
import {
  Ticket,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBookings = LATEST_BOOKINGS_DATA.filter((b) => {
    if (statusFilter === "all") return true;
    return b.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cross-Circuit Global Bookings Ledger"
        subtitle="124,850 Monthly Transactions Across 25 Flagship Multiplexes"
        description="Audit all ticket reservations, F&B concession attachments, payment gateway tokens, and refund chargebacks in real-time."
        badge="Live Ledger"
        badgeVariant="success"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
              <Filter className="h-4 w-4" /> Filter Date (Disabled)
            </Button>
            <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
              <Download className="h-4 w-4" /> Export CSV (Disabled)
            </Button>
          </div>
        }
      />

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Today's Volume", val: "4,820 Tix", sub: "+14.2% vs Yesterday" },
          { label: "Monthly Volume", val: "124,850 Tix", sub: "+18.6% MoM" },
          { label: "Gross Box Office", val: "₹8.6 Cr", sub: "100% Settled" },
          { label: "Refund / Dispute Rate", val: "0.62%", sub: "Industry Low" },
        ].map((m, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">{m.label}</div>
            <div className="text-xl font-extrabold font-mono text-white">{m.val}</div>
            <div className="text-[11px] text-emerald-400">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {[
            { id: "all", label: "All Bookings (5)" },
            { id: "confirmed", label: "Confirmed" },
            { id: "processing", label: "Processing" },
            { id: "refunded", label: "Refunded" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium capitalize ${
                statusFilter === st.id
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
            placeholder="Search booking ref or customer... (disabled)"
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
            disabled
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-5">Booking Ref</th>
                <th className="py-3.5 px-5">Customer Patron</th>
                <th className="py-3.5 px-5">Movie & Multiplex</th>
                <th className="py-3.5 px-5">Allocated Seats</th>
                <th className="py-3.5 px-5">Gross Amount</th>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-[#FBBF24]">{b.ref}</td>
                  <td className="py-3.5 px-5 font-semibold text-white">{b.customer}</td>
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-white">{b.movie}</div>
                    <div className="text-[10px] text-[#94A3B8]">{b.theatre}</div>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-white">{b.seats}</td>
                  <td className="py-3.5 px-5 font-mono font-bold text-white">{b.amount}</td>
                  <td className="py-3.5 px-5 text-[#64748B] font-mono">{b.time}</td>
                  <td className="py-3.5 px-5">
                    <Badge
                      variant={
                        b.status === "Confirmed"
                          ? "success"
                          : b.status === "Processing"
                          ? "warning"
                          : "danger"
                      }
                      size="sm"
                    >
                      {b.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#111827]/60 border-t border-[#2A3445] flex items-center justify-between text-xs text-[#94A3B8]">
          <span className="font-mono text-[11px]">Showing 5 of 124,850 Monthly Bookings</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs border-[#2A3445]">Previous</Button>
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs border-[#2A3445]">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
