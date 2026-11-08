"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { usePlatformStore } from "@/store/platform-store";
import {
  CreditCard,
  Search,
  Filter,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  User,
  DollarSign,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PaymentRecord {
  id: string;
  txRef: string;
  theatreName: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  convenienceFee: number;
  gstAmount: number;
  status: "Paid" | "Pending" | "Refunded" | "Failed";
  method: "UPI" | "Credit Card" | "Debit Card" | "Net Banking";
  gateway: "NPCI UPI Rail" | "Razorpay" | "PhonePe" | "Stripe";
  timestamp: string;
}

const SEED_PAYMENTS: PaymentRecord[] = [
  { id: "pay-01", txRef: "TXN-CS-991204", theatreName: "PVR Phoenix Marketcity, Pune", customerName: "Aarav Sharma", customerEmail: "aarav.s@gmail.com", amount: 760.0, convenienceFee: 70.0, gstAmount: 25.2, status: "Paid", method: "UPI", gateway: "NPCI UPI Rail", timestamp: "2026-11-08 19:12:45" },
  { id: "pay-02", txRef: "TXN-CS-991205", theatreName: "INOX Megaplex, Malad, Mumbai", customerName: "Pooja Hegde", customerEmail: "pooja.h@yahoo.com", amount: 1240.0, convenienceFee: 105.0, gstAmount: 37.8, status: "Paid", method: "Credit Card", gateway: "Razorpay", timestamp: "2026-11-08 19:04:12" },
  { id: "pay-03", txRef: "TXN-CS-991206", theatreName: "Miraj IMAX Cinema, Bengaluru", customerName: "Kiran Kumar", customerEmail: "kiran.k@outlook.com", amount: 480.0, convenienceFee: 35.0, gstAmount: 12.6, status: "Pending", method: "UPI", gateway: "PhonePe", timestamp: "2026-11-08 18:59:30" },
  { id: "pay-04", txRef: "TXN-CS-991207", theatreName: "Cinepolis Nexus Shantiniketan, Bengaluru", customerName: "Sanjay Singhania", customerEmail: "sanjay.s@gmail.com", amount: 950.0, convenienceFee: 70.0, gstAmount: 25.2, status: "Refunded", method: "UPI", gateway: "NPCI UPI Rail", timestamp: "2026-11-08 18:40:15" },
  { id: "pay-05", txRef: "TXN-CS-991208", theatreName: "PVR Directors Cut, Ambience Mall, Delhi", customerName: "Neha Kapoor", customerEmail: "neha.k@gmail.com", amount: 2400.0, convenienceFee: 140.0, gstAmount: 50.4, status: "Paid", method: "Credit Card", gateway: "Stripe", timestamp: "2026-11-08 18:22:00" },
  { id: "pay-06", txRef: "TXN-CS-991209", theatreName: "Prasads Large Screen IMAX, Hyderabad", customerName: "Rahul Varma", customerEmail: "rahul.v@gmail.com", amount: 620.0, convenienceFee: 35.0, gstAmount: 12.6, status: "Failed", method: "Debit Card", gateway: "Razorpay", timestamp: "2026-11-08 17:55:10" },
  { id: "pay-07", txRef: "TXN-CS-991210", theatreName: "CineWave Diamond City, Surat", customerName: "Hardik Patel", customerEmail: "hardik.p@gmail.com", amount: 500.0, convenienceFee: 35.0, gstAmount: 12.6, status: "Paid", method: "UPI", gateway: "NPCI UPI Rail", timestamp: "2026-11-08 17:30:22" },
];

export default function SuperAdminPaymentsPage() {
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>(SEED_PAYMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [refundNotice, setRefundNotice] = useState<string | null>(null);

  const filteredPayments = useMemo(() => {
    return paymentsList.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTx = p.txRef.toLowerCase().includes(q);
        const mTh = p.theatreName.toLowerCase().includes(q);
        const mCust = p.customerName.toLowerCase().includes(q);
        if (!mTx && !mTh && !mCust) return false;
      }
      if (filterStatus !== "all" && p.status.toLowerCase() !== filterStatus.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [paymentsList, searchQuery, filterStatus]);

  const handleSimulateRefund = (txRef: string) => {
    setPaymentsList((prev) =>
      prev.map((p) => (p.txRef === txRef ? { ...p, status: "Refunded" as const } : p))
    );
    setRefundNotice(`Processed nodal refund reversal for transaction ${txRef}.`);
    setTimeout(() => setRefundNotice(null), 4000);
  };

  const totalGross = paymentsList
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cross-Tenant Payments Ledger & Settlement Clearing"
        subtitle="Live Audit of UPI Nodal Rails, Customer Gateway Transactions & Chargeback Reversals"
        badge="Nodal Active"
        badgeVariant="success"
        actions={
          <Button variant="outline" size="sm" className="gap-2 border-[#2A3445] text-xs font-semibold">
            <Download className="h-3.5 w-3.5" /> Export Ledger (CSV)
          </Button>
        }
      />

      {refundNotice && (
        <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-amber-400" />
            <span>{refundNotice}</span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Gross Cleared Volume</div>
          <div className="text-2xl font-black font-mono text-emerald-400">₹{totalGross.toLocaleString("en-IN")}</div>
          <div className="text-[11px] text-emerald-300">Live Today</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Platform Commission Share</div>
          <div className="text-2xl font-black font-mono text-[#FBBF24]">₹{(totalGross * 0.018).toFixed(2)}</div>
          <div className="text-[11px] text-[#94A3B8]">1.8% Blended Yield</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Convenience Fee Ingress</div>
          <div className="text-2xl font-black font-mono text-white">₹35.00 / Seat</div>
          <div className="text-[11px] text-emerald-400">Zero Chargeback Rate</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Gateway Success Ratio</div>
          <div className="text-2xl font-black font-mono text-emerald-400">98.9%</div>
          <div className="text-[11px] text-[#94A3B8]">NPCI Direct Rail</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {["all", "paid", "pending", "refunded", "failed"].map((st) => (
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
            placeholder="Search TXN ref, theatre, customer..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-5">Transaction Ref</th>
                <th className="py-3.5 px-5">Hosting Theatre</th>
                <th className="py-3.5 px-5">Customer Patron</th>
                <th className="py-3.5 px-5">Gross Amount</th>
                <th className="py-3.5 px-5">Payment Method</th>
                <th className="py-3.5 px-5">Gateway Rail</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-white">
                    {p.txRef}
                    <div className="text-[10px] text-[#64748B]">{p.timestamp}</div>
                  </td>
                  <td className="py-3.5 px-5 font-medium text-white">{p.theatreName}</td>
                  <td className="py-3.5 px-5">
                    <div className="text-white font-medium">{p.customerName}</div>
                    <div className="text-[10px] text-[#94A3B8] font-mono">{p.customerEmail}</div>
                  </td>
                  <td className="py-3.5 px-5 font-mono font-black text-emerald-400">
                    ₹{p.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-5">{p.method}</td>
                  <td className="py-3.5 px-5 text-[#94A3B8] font-mono text-[11px]">{p.gateway}</td>
                  <td className="py-3.5 px-5">
                    <Badge
                      variant={
                        p.status === "Paid"
                          ? "success"
                          : p.status === "Pending"
                          ? "warning"
                          : p.status === "Refunded"
                          ? "info"
                          : "danger"
                      }
                      size="sm"
                    >
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    {p.status === "Paid" && (
                      <Button
                        onClick={() => handleSimulateRefund(p.txRef)}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs border-amber-500/40 text-amber-400 hover:bg-amber-500/10 gap-1"
                      >
                        <RotateCcw className="h-3 w-3" /> Refund
                      </Button>
                    )}
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
