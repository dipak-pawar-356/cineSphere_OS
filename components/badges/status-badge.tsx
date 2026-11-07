import React from "react";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: "Confirmed" | "Processing" | "Refunded" | "Optimal" | "Attention" | "Live" | "Coming Soon";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = {
    Confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    Optimal: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    Processing: "bg-amber-400/10 text-amber-400 border-amber-400/30",
    Live: "bg-amber-400/10 text-amber-400 border-amber-400/30",
    Refunded: "bg-red-500/10 text-red-400 border-red-500/30",
    Attention: "bg-red-500/10 text-red-400 border-red-500/30",
    "Coming Soon": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  };

  const dots = {
    Confirmed: "bg-emerald-400",
    Optimal: "bg-emerald-400",
    Processing: "bg-amber-400",
    Live: "bg-amber-400 animate-ping",
    Refunded: "bg-red-400",
    Attention: "bg-red-400",
    "Coming Soon": "bg-blue-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border select-none",
        styles[status],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[status])} />
      {status}
    </span>
  );
}
