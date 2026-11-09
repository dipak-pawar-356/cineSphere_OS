import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Zap,
  QrCode,
  Banknote,
  ShieldCheck,
  Sliders,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Payment Reconciliation | CineSphere OS",
};

export default function TheatrePaymentsPage() {
  const settlementRails = [
    {
      name: "Direct NPCI UPI Rail (VPA Box Office)",
      provider: "UPI",
      status: "Active",
      isPrimary: true,
      dailyVolume: "₹3,42,850",
      count: "1,248 Tx",
      fee: "0.00% (Zero MDR)",
      velocity: "T+0 Real-Time Instant",
      bank: "ICICI Corporate Nodal",
    },
    {
      name: "Razorpay Multi-Rail PG (Cards / NetBanking)",
      provider: "RAZORPAY",
      status: "Active",
      isPrimary: false,
      dailyVolume: "₹1,48,200",
      count: "412 Tx",
      fee: "1.90% + GST",
      velocity: "T+1 Daily Sweep (09:00 AM)",
      bank: "HDFC Nodal Sweep",
    },
    {
      name: "Box Office Counter Cash Drawer #01 & #02",
      provider: "CASH_COUNTER",
      status: "Balanced",
      isPrimary: false,
      dailyVolume: "₹42,600",
      count: "115 Tx",
      fee: "0.00% (Physical Audit OK)",
      velocity: "End of Shift Safe Deposit",
      bank: "Vault Transfer",
    },
    {
      name: "Stripe International VIP Gateway",
      provider: "STRIPE",
      status: "Active",
      isPrimary: false,
      dailyVolume: "₹28,500",
      count: "18 Tx",
      fee: "2.90% + ₹3",
      velocity: "Weekly Consolidated Sweep",
      bank: "Cross-Border Remittance",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <Link href={ROUTES.THEATRE_ADMIN.REVENUE}>
          <Button variant="ghost" size="xs" className="gap-1 text-xs text-[#94A3B8]">
            <ArrowLeft className="h-3 w-3" /> Back to Revenue Overview
          </Button>
        </Link>
        <Link href={ROUTES.THEATRE_ADMIN.UPI}>
          <Button variant="outline" size="xs" className="gap-1.5 text-xs border-[#2A3445] text-[#FBBF24]">
            <Sliders className="h-3.5 w-3.5" /> Manage Payment Rails & VPAs
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Payment Gateways & Daily Settlement"
        subtitle="Multi-Rail Settlement Reconciliation • CineSphere OS Payment Architecture"
        description="Comprehensive ledger reconciliation across Direct UPI, Supplementary Gateways, and Physical Counter Drawers. All revenue settles to your designated corporate accounts."
        badge="Reconciled Today"
        badgeVariant="success"
        actions={
          <div className="flex items-center gap-2">
            <Link href={ROUTES.THEATRE_ADMIN.UPI}>
              <Button
                variant="primary"
                size="sm"
                className="gap-2 font-bold bg-[#E50914] hover:bg-[#b80710] text-white"
              >
                <QrCode className="h-4 w-4" /> Payment Rail Config Hub
              </Button>
            </Link>
          </div>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated" className="p-4 space-y-1.5">
          <span className="text-xs text-[#94A3B8]">Total Gross Settled Today</span>
          <div className="text-2xl font-black font-mono text-white">₹5,62,150</div>
          <span className="text-[11px] text-emerald-400 font-mono">1,793 Completed Transactions</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1.5">
          <span className="text-xs text-[#94A3B8]">Direct UPI Share</span>
          <div className="text-2xl font-black font-mono text-[#FBBF24]">61.0%</div>
          <span className="text-[11px] text-[#64748B]">Zero MDR commission friction</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1.5">
          <span className="text-xs text-[#94A3B8]">Cards & Net Banking Share</span>
          <div className="text-2xl font-black font-mono text-white">26.4%</div>
          <span className="text-[11px] text-[#64748B]">Razorpay & Stripe Gateway</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1.5">
          <span className="text-xs text-[#94A3B8]">Nodal Bank Settlement</span>
          <div className="text-2xl font-black font-mono text-emerald-400">T+0 Verified</div>
          <span className="text-[11px] text-[#64748B]">Direct NEFT/RTGS Cleared</span>
        </Card>
      </div>

      {/* Multi-Rail Reconciliation List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Multi-Rail Daily Volume Breakdown</h3>
          <Badge variant="outline" size="sm" className="border-[#2A3445] text-[#94A3B8]">
            Separated Config & Tx Layer
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settlementRails.map((rail, i) => (
            <Card key={i} variant="elevated" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">{rail.name}</span>
                  {rail.isPrimary && (
                    <Badge variant="warning" size="sm" className="text-[10px]">
                      Primary Rail
                    </Badge>
                  )}
                </div>
                <Badge variant="success" size="sm" dot>
                  {rail.status}
                </Badge>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-[#64748B]">Settled Volume Today</span>
                  <div className="text-2xl font-black font-mono text-white mt-0.5">{rail.dailyVolume}</div>
                </div>
                <span className="text-xs text-[#FBBF24] font-mono">{rail.count}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#070B12] border border-[#2A3445]/60 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#64748B] uppercase block">Processing / MDR</span>
                  <span className="text-emerald-400 font-semibold">{rail.fee}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] uppercase block">Settlement Nodal Bank</span>
                  <span className="text-[#CBD5E1] truncate block">{rail.bank}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-[#94A3B8]">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Clock className="h-3.5 w-3.5 text-[#38BDF8]" />
                  <span>{rail.velocity}</span>
                </span>
                <Link href={ROUTES.THEATRE_ADMIN.UPI}>
                  <Button variant="ghost" size="xs" className="text-xs text-[#FBBF24] hover:text-white gap-1">
                    Manage Rail <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
