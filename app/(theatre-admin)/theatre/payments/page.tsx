import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle2, ArrowLeft, RefreshCw, Zap } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Payment Reconciliation | CineSphere OS",
};

export default function TheatrePaymentsPage() {
  const methods = [
    { name: "UPI Auto-Split Gateway (Razorpay/HDFC)", status: "Active", dailyVolume: "₹3,10,500", count: "1,140 Tx", fee: "0% UPI Mdr" },
    { name: "Counter Credit/Debit Card POS (Pine Labs)", status: "Active", dailyVolume: "₹1,35,800", count: "480 Tx", fee: "0.95% Blend" },
    { name: "Cash Counter Drawer #01 & #02", status: "Balanced", dailyVolume: "₹38,950", count: "98 Tx", fee: "Physical Audit OK" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-2">
        <Link href={ROUTES.THEATRE_ADMIN.REVENUE}>
          <Button variant="ghost" size="xs" className="gap-1 text-xs text-[#94A3B8]">
            <ArrowLeft className="h-3 w-3" /> Back to Revenue Overview
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Payment Gateways & Daily Settlement"
        subtitle="Multi-Rail Payment Reconciliation for Phoenix Marketcity Box Office"
        badge="Reconciled Today"
        badgeVariant="success"
        actions={
          <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
            <RefreshCw className="h-4 w-4" /> Trigger Mid-Day Settlement (Phase 2)
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {methods.map((m, i) => (
          <Card key={i} variant="elevated" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] truncate">{m.name}</span>
              <Badge variant="success" size="sm" dot>{m.status}</Badge>
            </div>

            <div>
              <span className="text-xs text-[#64748B]">Settled Today</span>
              <div className="text-2xl font-black font-mono text-white mt-0.5">{m.dailyVolume}</div>
              <span className="text-[10px] text-[#FBBF24] font-mono">{m.count}</span>
            </div>

            <div className="pt-3 border-t border-[#2A3445] text-xs flex justify-between text-[#94A3B8]">
              <span>MDR / Processing:</span>
              <span className="font-semibold text-white">{m.fee}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

