import React from "react";
import Link from "next/link";
import { THEATRE_TRANSACTIONS } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History, Download, Search } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Transactions Ledger | CineSphere OS",
};

export default function TheatreTransactionsPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-2">
        <Link href={ROUTES.THEATRE_ADMIN.REVENUE}>
          <Button variant="ghost" size="xs" className="gap-1 text-xs text-[#94A3B8]">
            <ArrowLeft className="h-3 w-3" /> Back to Revenue
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Transactions Ledger & Audit Records"
        subtitle="Immutable Log of Box Office and Concessions Ticket Payments • Phoenix Marketcity"
        badge="Real-Time Ledger"
        badgeVariant="primary"
        actions={
          <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
            <Download className="h-4 w-4" /> Export Ledger CSV (Phase 2)
          </Button>
        }
      />

      <Card variant="elevated" className="overflow-hidden border-[#2A3445]">
        <div className="p-4 border-b border-[#2A3445] flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] w-full sm:w-80">
            <Search className="h-4 w-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search transaction ID or gateway ref..."
              className="bg-transparent text-xs text-white placeholder-[#64748B] focus:outline-none w-full"
              readOnly
            />
          </div>
          <span className="text-xs text-[#94A3B8] font-mono">{THEATRE_TRANSACTIONS.length} Transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Patron Name</th>
                <th className="py-3.5 px-4">Gateway Reference</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60">
              {THEATRE_TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#161F2E]/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{tx.id}</td>
                  <td className="py-3.5 px-4 font-mono text-[#FBBF24]">{tx.bookingRef}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{tx.customer}</td>
                  <td className="py-3.5 px-4 font-mono text-[#64748B]">{tx.gatewayRef}</td>
                  <td className="py-3.5 px-4 text-[#CBD5E1]">{tx.paymentMethod}</td>
                  <td className="py-3.5 px-4 font-mono text-[#64748B]">{tx.timestamp}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">₹{tx.amount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right">
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

