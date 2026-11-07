import React from "react";
import Link from "next/link";
import { THEATRE_TRANSACTIONS, THEATRE_HALLS, THEATRE_MOVIES } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  History,
  ArrowRight,
  Download,
  PieChart,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/dashboard-widgets";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Revenue & Concessions Yield | CineSphere OS",
};

export default function TheatreRevenuePage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Revenue Intelligence & Financial Settlement"
        subtitle="Gross Box Office, Concession Splits, Merchant Gateways & Distributor Shares"
        badge="₹4.85L Today"
        badgeVariant="success"
        actions={
          <div className="flex gap-2">
            <Link href={ROUTES.THEATRE_ADMIN.TRANSACTIONS}>
              <Button variant="outline" size="sm" className="gap-2 border-[#2A3445]">
                <History className="h-4 w-4 text-[#FBBF24]" /> Transactions Ledger
              </Button>
            </Link>
            <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
              <Download className="h-4 w-4" /> Download Statement (Phase 2)
            </Button>
          </div>
        }
      />

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="Today's Total Gross"
          value="₹4,85,250"
          delta="+18.4% vs Last Friday"
          deltaType="positive"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          label="Weekly Box Office"
          value="₹28,40,000"
          delta="96% of Weekly Goal"
          deltaType="positive"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          label="Monthly Revenue"
          value="₹1.12 Cr"
          delta="+22% MoM Growth"
          deltaType="positive"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          label="Avg Booking Value (ABV)"
          value="₹1,240"
          subtitle="2.2 Tickets + F&B per order"
          icon={<CreditCard className="h-4 w-4" />}
        />
      </div>

      {/* Revenue Breakdown by Stream & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="elevated" className="p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
            Revenue Stream Split
          </h3>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <div className="flex justify-between text-[#CBD5E1] pb-1">
                <span>Box Office Admissions (74%)</span>
                <span className="font-mono font-bold text-white">₹3,59,000</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#111827] overflow-hidden">
                <div style={{ width: "74%" }} className="h-full rounded-full bg-[#FBBF24]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#CBD5E1] pb-1">
                <span>Gourmet F&B Concessions (19%)</span>
                <span className="font-mono font-bold text-white">₹92,200</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#111827] overflow-hidden">
                <div style={{ width: "19%" }} className="h-full rounded-full bg-emerald-400" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#CBD5E1] pb-1">
                <span>Add-ons, 3D Glasses & VIP Parking (7%)</span>
                <span className="font-mono font-bold text-white">₹34,050</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#111827] overflow-hidden">
                <div style={{ width: "7%" }} className="h-full rounded-full bg-[#38BDF8]" />
              </div>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
            Payment Method Breakdown
          </h3>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
              <span className="font-semibold text-white">UPI (PhonePe, GPay, Paytm)</span>
              <span className="font-mono font-bold text-emerald-400">64% (₹3,10,500)</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
              <span className="font-semibold text-white">Credit / Debit Cards</span>
              <span className="font-mono font-bold text-[#FBBF24]">28% (₹1,35,800)</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
              <span className="font-semibold text-white">Cash at Box Office Counter</span>
              <span className="font-mono font-bold text-[#CBD5E1]">8% (₹38,950)</span>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
            Distributor Share Reserve
          </h3>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
              <span className="text-[#64748B]">Studio Split Reserve (Est. 52.5%)</span>
              <p className="text-xl font-bold font-mono text-[#FBBF24]">₹1,88,475</p>
              <p className="text-[10px] text-[#94A3B8]">Automated weekly remittance escrow</p>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
              <span className="text-[#64748B]">Exhibitor Net Retention</span>
              <p className="text-xl font-bold font-mono text-emerald-400">₹2,96,775</p>
              <p className="text-[10px] text-[#94A3B8]">Retained before multiplex operating costs</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions Table Preview */}
      <Card variant="elevated" className="overflow-hidden border-[#2A3445]">
        <div className="p-4 border-b border-[#2A3445] flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
            Recent Box Office Transactions
          </h3>
          <Link href={ROUTES.THEATRE_ADMIN.TRANSACTIONS} className="text-xs font-bold text-[#FBBF24] hover:underline">
            View All Transactions →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
              <tr>
                <th className="py-3 px-4">Tx ID</th>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60">
              {THEATRE_TRANSACTIONS.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-[#161F2E]/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white">{tx.id}</td>
                  <td className="py-3 px-4 font-mono text-[#FBBF24]">{tx.bookingRef}</td>
                  <td className="py-3 px-4 font-bold text-white">{tx.customer}</td>
                  <td className="py-3 px-4 text-[#CBD5E1]">{tx.paymentMethod}</td>
                  <td className="py-3 px-4 font-mono text-[#64748B]">{tx.timestamp}</td>
                  <td className="py-3 px-4 font-mono font-bold text-white">₹{tx.amount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <Badge variant="success" size="sm">{tx.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

