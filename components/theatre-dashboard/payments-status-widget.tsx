"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2, Clock, XCircle, RotateCcw } from "lucide-react";
import { PaymentMetricsBundle, RevenueMetricsBundle } from "@/types/theatre-dashboard.types";

interface PaymentsStatusWidgetProps {
  payments: PaymentMetricsBundle;
  revenue: RevenueMetricsBundle;
  currencySymbol: string;
}

export function PaymentsStatusWidget({
  payments,
  revenue,
  currencySymbol,
}: PaymentsStatusWidgetProps) {
  return (
    <Card variant="elevated" className="p-6 space-y-6 bg-[#0D1525] border border-[#2A3445]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2A3445]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Payment Rail Reconciliation</h3>
            <p className="text-xs text-[#94A3B8]">Settlements, gateways, and transaction statuses</p>
          </div>
        </div>
      </div>

      {/* 4 Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#111827] border border-emerald-500/20 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Completed</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {currencySymbol}{payments.completedPaymentsAmount.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#94A3B8] block">{payments.completedPaymentsCount} success</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111827] border border-amber-500/20 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
            <Clock className="h-3.5 w-3.5" />
            <span>Pending</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {currencySymbol}{payments.pendingPaymentsAmount.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#94A3B8] block">{payments.pendingPaymentsCount} awaiting</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111827] border border-rose-500/20 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
            <XCircle className="h-3.5 w-3.5" />
            <span>Failed</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {currencySymbol}{payments.failedPaymentsAmount.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#94A3B8] block">{payments.failedPaymentsCount} dropped</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111827] border border-purple-500/20 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-semibold">
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Refunds</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {currencySymbol}{payments.refundsAmount.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#94A3B8] block">{payments.refundsCount} reversed</span>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      {revenue.revenueByPaymentMethod.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            Revenue Split by Gateway Rail
          </h4>
          <div className="space-y-2">
            {revenue.revenueByPaymentMethod.map((item) => (
              <div key={item.method} className="space-y-1 text-xs">
                <div className="flex justify-between text-zinc-300">
                  <span>{item.label}</span>
                  <span className="font-mono font-semibold text-white">
                    {currencySymbol}{item.amount.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-[#1F2937] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
