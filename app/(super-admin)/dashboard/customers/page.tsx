"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Users,
  Search,
  Filter,
  Sparkles,
  Download,
  Star,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminCustomersPage() {
  const [tierFilter, setTierFilter] = useState("all");

  const CUSTOMERS_DATA = [
    {
      id: "cst-1",
      name: "Arjun Mehta",
      email: "arjun.mehta@gmail.com",
      phone: "+91 98201 48291",
      city: "Mumbai",
      tier: "Platinum VIP",
      totalBookings: 34,
      lifetimeSpend: "₹24,800",
      lastActive: "10 min ago",
      status: "Active",
    },
    {
      id: "cst-2",
      name: "Priya Sharma",
      email: "priya.sharma@outlook.com",
      phone: "+91 98402 19482",
      city: "Bengaluru",
      tier: "Platinum VIP",
      totalBookings: 28,
      lifetimeSpend: "₹18,400",
      lastActive: "2 hours ago",
      status: "Active",
    },
    {
      id: "cst-3",
      name: "Rohan Varma",
      email: "rohan.v@techcorp.in",
      phone: "+91 98112 39481",
      city: "Delhi NCR",
      tier: "Gold VIP",
      totalBookings: 19,
      lifetimeSpend: "₹12,200",
      lastActive: "Yesterday",
      status: "Active",
    },
    {
      id: "cst-4",
      name: "Sneha Nair",
      email: "sneha.nair@icloud.com",
      phone: "+91 97401 29482",
      city: "Kochi",
      tier: "Gold VIP",
      totalBookings: 14,
      lifetimeSpend: "₹8,900",
      lastActive: "3 days ago",
      status: "Active",
    },
    {
      id: "cst-5",
      name: "Vikram Das",
      email: "vikram.das@yahoo.com",
      phone: "+91 98301 94821",
      city: "Kolkata",
      tier: "Standard",
      totalBookings: 6,
      lifetimeSpend: "₹3,450",
      lastActive: "1 week ago",
      status: "Active",
    },
  ];

  const filteredCustomers = CUSTOMERS_DATA.filter((c) => {
    if (tierFilter === "all") return true;
    return c.tier.toLowerCase().includes(tierFilter.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Patron Registry & Loyalty Intelligence"
        subtitle="385,000 Registered Cinema Customers & CineClub VIP Tiers"
        description="Unified patron registry across all 25 cinema circuits tracking booking frequency, concession habits, loyalty points, and support history."
        badge="385,000 Patrons"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <Download className="h-4 w-4" /> Export Patron Registry (Disabled)
          </Button>
        }
      />

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Patrons", val: "385,000", sub: "+12.4K this month" },
          { label: "CineClub VIPs", val: "42,800 Members", sub: "Platinum & Gold" },
          { label: "Avg Annual Spend", val: "₹14,200 / Patron", sub: "+18.2% YoY" },
          { label: "Account Health", val: "99.8%", sub: "Verified Phone & SSO" },
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
            { id: "all", label: "All Patrons (5)" },
            { id: "platinum", label: "Platinum VIP" },
            { id: "gold", label: "Gold VIP" },
            { id: "standard", label: "Standard" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTierFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium capitalize ${
                tierFilter === t.id
                  ? "bg-[#FBBF24] text-[#070B12] font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search patron name or email... (disabled)"
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
            disabled
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-5">Patron Name</th>
                <th className="py-3.5 px-5">Contact Details</th>
                <th className="py-3.5 px-5">Metro Hub</th>
                <th className="py-3.5 px-5">VIP Loyalty Tier</th>
                <th className="py-3.5 px-5">Bookings</th>
                <th className="py-3.5 px-5">Lifetime Yield</th>
                <th className="py-3.5 px-5">Last Activity</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#FBBF24]" />
                    <span>{c.name}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="text-white font-mono">{c.email}</div>
                    <div className="text-[10px] text-[#64748B] font-mono">{c.phone}</div>
                  </td>
                  <td className="py-3.5 px-5 text-[#94A3B8]">{c.city}</td>
                  <td className="py-3.5 px-5">
                    <Badge
                      variant={
                        c.tier === "Platinum VIP"
                          ? "warning"
                          : c.tier === "Gold VIP"
                          ? "primary"
                          : "outline"
                      }
                      size="sm"
                    >
                      {c.tier}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-white font-bold">{c.totalBookings} Carts</td>
                  <td className="py-3.5 px-5 font-mono font-bold text-[#FBBF24]">{c.lifetimeSpend}</td>
                  <td className="py-3.5 px-5 text-[#64748B] font-mono">{c.lastActive}</td>
                  <td className="py-3.5 px-5">
                    <Badge variant="success" size="sm">{c.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#111827]/60 border-t border-[#2A3445] flex items-center justify-between text-xs text-[#94A3B8]">
          <span className="font-mono text-[11px]">Showing 5 of 385,000 Registered Patrons</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs border-[#2A3445]">Previous</Button>
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs border-[#2A3445]">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
