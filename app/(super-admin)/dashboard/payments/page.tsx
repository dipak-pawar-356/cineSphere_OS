"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  QrCode,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Power,
  Lock,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { PaymentConfiguration, PaymentProvider } from "@/types/payment-config.types";
import {
  searchPaymentConfigurations,
  activatePaymentConfiguration,
  deactivatePaymentConfiguration,
} from "@/lib/engine/payment-config-engine";

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
  { id: "pay-01", txRef: "TXN-CS-991204", theatreName: "CineSphere Grand Cinemas, Pune", customerName: "Aarav Sharma", customerEmail: "aarav.s@gmail.com", amount: 760.0, convenienceFee: 70.0, gstAmount: 25.2, status: "Paid", method: "UPI", gateway: "NPCI UPI Rail", timestamp: "2026-11-08 19:12:45" },
  { id: "pay-02", txRef: "TXN-CS-991205", theatreName: "CineSphere Royale Palladium, Mumbai", customerName: "Pooja Hegde", customerEmail: "pooja.h@yahoo.com", amount: 1240.0, convenienceFee: 105.0, gstAmount: 37.8, status: "Paid", method: "Credit Card", gateway: "Razorpay", timestamp: "2026-11-08 19:04:12" },
  { id: "pay-03", txRef: "TXN-CS-991206", theatreName: "CineSphere Nexus, Bengaluru", customerName: "Kiran Kumar", customerEmail: "kiran.k@outlook.com", amount: 480.0, convenienceFee: 35.0, gstAmount: 12.6, status: "Pending", method: "UPI", gateway: "PhonePe", timestamp: "2026-11-08 18:59:30" },
  { id: "pay-04", txRef: "TXN-CS-991207", theatreName: "CineSphere Grand Cinemas, Pune", customerName: "Sanjay Singhania", customerEmail: "sanjay.s@gmail.com", amount: 950.0, convenienceFee: 70.0, gstAmount: 25.2, status: "Refunded", method: "UPI", gateway: "NPCI UPI Rail", timestamp: "2026-11-08 18:40:15" },
  { id: "pay-05", txRef: "TXN-CS-991208", theatreName: "CineSphere Royale Palladium, Mumbai", customerName: "Neha Kapoor", customerEmail: "neha.k@gmail.com", amount: 2400.0, convenienceFee: 140.0, gstAmount: 50.4, status: "Paid", method: "Credit Card", gateway: "Stripe", timestamp: "2026-11-08 18:22:00" },
  { id: "pay-06", txRef: "TXN-CS-991209", theatreName: "CineSphere Nexus, Bengaluru", customerName: "Rahul Varma", customerEmail: "rahul.v@gmail.com", amount: 620.0, convenienceFee: 35.0, gstAmount: 12.6, status: "Failed", method: "Debit Card", gateway: "Razorpay", timestamp: "2026-11-08 17:55:10" },
  { id: "pay-07", txRef: "TXN-CS-991210", theatreName: "CineSphere Grand Cinemas, Pune", customerName: "Hardik Patel", customerEmail: "hardik.p@gmail.com", amount: 500.0, convenienceFee: 35.0, gstAmount: 12.6, status: "Paid", method: "UPI", gateway: "NPCI UPI Rail", timestamp: "2026-11-08 17:30:22" },
];

export default function SuperAdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<"transactions" | "configurations">("transactions");
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>(SEED_PAYMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [refundNotice, setRefundNotice] = useState<string | null>(null);

  // Platform configurations state for Super Admin governance
  const [allConfigurations, setAllConfigurations] = useState<PaymentConfiguration[]>([]);
  const [configSearch, setConfigSearch] = useState("");
  const [configProviderFilter, setConfigProviderFilter] = useState("ALL");

  const loadPlatformConfigurations = () => {
    const configs = searchPaymentConfigurations({ role: "SUPER_ADMIN" });
    setAllConfigurations(configs);
  };

  useEffect(() => {
    loadPlatformConfigurations();
  }, []);

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

  const filteredConfigs = useMemo(() => {
    return allConfigurations.filter((c) => {
      if (configSearch.trim()) {
        const q = configSearch.toLowerCase();
        const mName = c.merchantDisplayName.toLowerCase().includes(q);
        const mTh = c.theatreId.toLowerCase().includes(q);
        const mUpi = c.upiId.toLowerCase().includes(q);
        const mProv = c.provider.toLowerCase().includes(q);
        if (!mName && !mTh && !mUpi && !mProv) return false;
      }
      if (configProviderFilter !== "ALL" && c.provider !== configProviderFilter) {
        return false;
      }
      return true;
    });
  }, [allConfigurations, configSearch, configProviderFilter]);

  const handleSimulateRefund = (txRef: string) => {
    setPaymentsList((prev) =>
      prev.map((p) => (p.txRef === txRef ? { ...p, status: "Refunded" as const } : p))
    );
    setRefundNotice(`Processed nodal refund reversal for transaction ${txRef}.`);
    setTimeout(() => setRefundNotice(null), 4000);
  };

  const handleToggleConfigStatus = (cfg: PaymentConfiguration) => {
    if (cfg.status === "ACTIVE") {
      deactivatePaymentConfiguration(cfg.id, undefined, { actorId: "super_admin_ops", role: "SUPER_ADMIN" });
      setRefundNotice(`Suspended payment rail '${cfg.merchantDisplayName}' on tenant '${cfg.theatreId}'.`);
    } else {
      activatePaymentConfiguration(cfg.id, undefined, { actorId: "super_admin_ops", role: "SUPER_ADMIN" });
      setRefundNotice(`Activated payment rail '${cfg.merchantDisplayName}' on tenant '${cfg.theatreId}'.`);
    }
    loadPlatformConfigurations();
    setTimeout(() => setRefundNotice(null), 4000);
  };

  const totalGross = paymentsList
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cross-Tenant Payments Ledger & Settlement Clearing"
        subtitle="Platform Governance • Multi-Tenant Payment Configurations & Settlement Clearing"
        description="Monitor multi-tenant payment rails, inspect merchant readiness, and audit cross-tenant transaction clearing. Payments strictly belong to hosting theatres."
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
          <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Tenant Rails Monitored</div>
          <div className="text-2xl font-black font-mono text-white">{allConfigurations.length} Rails</div>
          <div className="text-[11px] text-[#38BDF8]">Multi-Tenant Decoupled</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Gateway Success Ratio</div>
          <div className="text-2xl font-black font-mono text-emerald-400">98.9%</div>
          <div className="text-[11px] text-[#94A3B8]">NPCI Direct Rail</div>
        </div>
      </div>

      {/* Main Tab Controller */}
      <div className="flex items-center gap-2 border-b border-[#2A3445] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("transactions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "transactions"
              ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/20"
              : "text-[#94A3B8] hover:text-white hover:bg-[#111827]"
          }`}
        >
          <CreditCard className="h-4 w-4" /> Transactions & Clearing ({paymentsList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("configurations")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "configurations"
              ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/20"
              : "text-[#94A3B8] hover:text-white hover:bg-[#111827]"
          }`}
        >
          <Layers className="h-4 w-4" /> Platform Payment Rails Governance ({allConfigurations.length})
        </button>
      </div>

      {/* View 1: Transactions & Clearing */}
      {activeTab === "transactions" && (
        <div className="space-y-6">
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
      )}

      {/* View 2: Platform Payment Rails Governance */}
      {activeTab === "configurations" && (
        <div className="space-y-6">
          {/* Security Governance Notice */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">Super Admin Governance Guard</h4>
                <p className="text-[11px] text-[#94A3B8]">
                  Super Admins monitor platform readiness and can disable compromised rails. Private bank credentials remain strictly tenant-owned.
                </p>
              </div>
            </div>
            <Badge variant="outline" size="sm" className="border-purple-500/40 text-purple-400 shrink-0">
              Zero Intermediary Escrow
            </Badge>
          </div>

          {/* Search & Provider Filter */}
          <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
              <input
                type="text"
                value={configSearch}
                onChange={(e) => setConfigSearch(e.target.value)}
                placeholder="Search tenant ID, merchant name, VPA..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={configProviderFilter}
                onChange={(e) => setConfigProviderFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Rail Providers</option>
                <option value="UPI">Direct UPI</option>
                <option value="RAZORPAY">Razorpay</option>
                <option value="PHONEPE">PhonePe</option>
                <option value="STRIPE">Stripe</option>
                <option value="CASH_COUNTER">Cash Counter</option>
              </select>
            </div>
          </div>

          {/* Configurations Table */}
          <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
                  <tr>
                    <th className="py-3.5 px-5">Tenant ID</th>
                    <th className="py-3.5 px-5">Rail Display Name</th>
                    <th className="py-3.5 px-5">Provider</th>
                    <th className="py-3.5 px-5">Designated VPA</th>
                    <th className="py-3.5 px-5">Bank & Velocity</th>
                    <th className="py-3.5 px-5">Primary</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Super Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
                  {filteredConfigs.map((cfg) => (
                    <tr key={cfg.id} className="hover:bg-[#111827]/40 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#FBBF24]">
                        {cfg.theatreId}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-white">{cfg.merchantDisplayName}</div>
                        <div className="text-[10px] text-[#64748B] font-mono">{cfg.businessName}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
                          {cfg.provider}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 font-mono font-medium text-white truncate max-w-xs">
                        {cfg.upiId}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="text-[#CBD5E1] block">{cfg.bankName}</span>
                        <span className="text-[10px] text-emerald-400 font-mono">{cfg.settlementPeriod}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        {cfg.isPrimary ? (
                          <Badge variant="warning" size="sm" className="text-[10px]">
                            ★ Primary
                          </Badge>
                        ) : (
                          <span className="text-[#64748B] text-[11px]">Secondary</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge
                          variant={cfg.status === "ACTIVE" ? "success" : "secondary"}
                          size="sm"
                        >
                          {cfg.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Button
                          variant={cfg.status === "ACTIVE" ? "outline" : "primary"}
                          size="xs"
                          onClick={() => handleToggleConfigStatus(cfg)}
                          className={`text-xs gap-1 ${
                            cfg.status === "ACTIVE"
                              ? "border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          <Power className="h-3 w-3" />
                          {cfg.status === "ACTIVE" ? "Suspend Rail" : "Re-enable"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
