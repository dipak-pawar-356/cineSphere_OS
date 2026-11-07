import React from "react";
import { PricingSummary } from "@/types";
import { cn } from "@/utils";
import { ShieldCheck, Info } from "lucide-react";

export interface PriceSummaryProps {
  pricing: PricingSummary;
  className?: string;
}

export function PriceSummary({ pricing, className }: PriceSummaryProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4 sm:p-5 space-y-4 text-xs select-none",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <span className="font-semibold text-zinc-300">Live Price Breakdown</span>
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
          {pricing.seatCount} {pricing.seatCount === 1 ? "Ticket" : "Tickets"}
        </span>
      </div>

      <div className="space-y-2 text-zinc-400">
        <div className="flex justify-between items-center">
          <span>Tickets Subtotal</span>
          <span className="font-mono text-white font-medium">
            {pricing.formattedSubtotal}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            Convenience Fee
            <span title="Ticketing infrastructure & seat reservation processing" className="cursor-help">
              <Info className="h-3 w-3 text-zinc-500" />
            </span>
          </span>
          <span className="font-mono text-zinc-300">
            {pricing.formattedConvenienceFee}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>Integrated GST (18%)</span>
          <span className="font-mono text-zinc-300">
            {pricing.formattedTax}
          </span>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-3 flex justify-between items-center text-sm font-bold">
        <span className="text-white">Grand Total</span>
        <span className="font-mono text-amber-400 text-lg">
          {pricing.formattedTotal}
        </span>
      </div>

      <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-2.5 flex items-center gap-2 text-[11px] text-zinc-400">
        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
        <span>100% Secure Checkout with Theatre Direct UPI Settlement</span>
      </div>
    </div>
  );
}
