"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  TrendingUp,
  CreditCard,
  Download,
  Filter,
  DollarSign,
  PieChart,
  ArrowUpRight,
  Building2,
  Film,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminRevenuePage() {
  const DISTRIBUTOR_REVENUE_DATA = [
    {
      distributor: "Warner Bros. Pictures India",
      films: "Chrono Nexus, Dune 2, Beetlejuice",
      gross: "₹3.42 Cr",
      distributorShare: "55% (₹1.88 Cr)",
      theatreShare: "45% (₹1.54 Cr)",
      tax: "₹61.5 L",
      status: "Settled",
    },
    {
      distributor: "Sony Pictures Releasing",
      films: "CyberPulse 2099, Spider-Man",
      gross: "₹2.28 Cr",
      distributorShare: "52% (₹1.18 Cr)",
      theatreShare: "48% (₹1.10 Cr)",
      tax: "₹41.0 L",
      status: "Settled",
    },
    {
      distributor: "Universal Pictures",
      films: "Oppenheimer, Twisters",
      gross: "₹1.64 Cr",
      distributorShare: "50% (₹82.0 L)",
      theatreShare: "50% (₹82.0 L)",
      tax: "₹29.5 L",
      status: "Processing",
    },
    {
      distributor: "Independent Regional Prints",
      films: "Shadows of Elysium, Indie Films",
      gross: "₹1.26 Cr",
      distributorShare: "45% (₹56.7 L)",
      theatreShare: "55% (₹69.3 L)",
      tax: "₹22.6 L",
      status: "Settled",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Circuit Financials & Royalty Splits"
        subtitle="₹8.6 Cr Gross Box Office Collections & Automated Distributor Remittances"
        description="Audit multi-tenant revenue ledgers, studio contracts, GST/VAT tax withholdings, and concession profitability in real-time."
        badge="₹8.6 Cr Gross"
        badgeVariant="success"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
              <Filter className="h-4 w-4" /> Filter Period
            </Button>
            <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
              <Download className="h-4 w-4" /> Download Statement (Disabled)
            </Button>
          </div>
        }
      />

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Gross Box Office", val: "₹8.60 Cr", sub: "+24.5% vs Last Mo", pos: true },
          { label: "Distributor Splits (52%)", val: "₹4.47 Cr", sub: "Contract Remittances", pos: true },
          { label: "Cinema Net Share (48%)", val: "₹4.13 Cr", sub: "Operating Retained", pos: true },
          { label: "Concessions Gross", val: "₹1.82 Cr", sub: "100% Margin Retained", pos: true },
        ].map((m, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">{m.label}</div>
            <div className="text-2xl font-black font-mono text-white">{m.val}</div>
            <div className="text-[11px] text-emerald-400 font-medium">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue Source Breakdown */}
      <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieChart className="h-4 w-4 text-[#FBBF24]" />
            <span>Revenue Stream Allocation Breakdown</span>
          </h3>
          <Badge variant="outline" size="sm">100% Reconciled</Badge>
        </div>

        <div className="h-3.5 w-full rounded-full bg-[#111827] overflow-hidden flex">
          <div style={{ width: "68%" }} className="h-full bg-[#FBBF24]" title="Box Office Tickets (68%)" />
          <div style={{ width: "22%" }} className="h-full bg-[#38BDF8]" title="F&B Concessions (22%)" />
          <div style={{ width: "7%" }} className="h-full bg-purple-400" title="Convenience Fees (7%)" />
          <div style={{ width: "3%" }} className="h-full bg-emerald-400" title="Screen Advertising (3%)" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
            <div className="text-[#94A3B8] text-[10px]">Box Office Admissions</div>
            <div className="font-bold text-white mt-0.5">₹5.85 Cr (68%)</div>
          </div>
          <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
            <div className="text-[#94A3B8] text-[10px]">F&B Concessions</div>
            <div className="font-bold text-white mt-0.5">₹1.89 Cr (22%)</div>
          </div>
          <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
            <div className="text-[#94A3B8] text-[10px]">Convenience & Tech Fees</div>
            <div className="font-bold text-white mt-0.5">₹60.2 L (7%)</div>
          </div>
          <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
            <div className="text-[#94A3B8] text-[10px]">On-Screen Brand Ads</div>
            <div className="font-bold text-white mt-0.5">₹25.8 L (3%)</div>
          </div>
        </div>
      </div>

      {/* Distributor Splits Table */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden">
        <div className="p-5 border-b border-[#2A3445] flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">Major Studio & Distributor Royalty Accounts</h3>
          <Badge variant="success" size="sm">Automated Settlement</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-5">Distributor Partner</th>
                <th className="py-3.5 px-5">Licensed Theatrical Titles</th>
                <th className="py-3.5 px-5">Gross Box Office</th>
                <th className="py-3.5 px-5">Distributor Share</th>
                <th className="py-3.5 px-5">Theatre Retained</th>
                <th className="py-3.5 px-5">Statutory GST</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {DISTRIBUTOR_REVENUE_DATA.map((d, i) => (
                <tr key={i} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-white">{d.distributor}</td>
                  <td className="py-3.5 px-5 text-[#94A3B8]">{d.films}</td>
                  <td className="py-3.5 px-5 font-mono font-bold text-[#FBBF24]">{d.gross}</td>
                  <td className="py-3.5 px-5 font-mono text-white">{d.distributorShare}</td>
                  <td className="py-3.5 px-5 font-mono text-emerald-400 font-bold">{d.theatreShare}</td>
                  <td className="py-3.5 px-5 font-mono text-[#64748B]">{d.tax}</td>
                  <td className="py-3.5 px-5">
                    <Badge variant={d.status === "Settled" ? "success" : "warning"} size="sm">
                      {d.status}
                    </Badge>
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
