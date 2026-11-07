import React from "react";
import { ArrowUpRight, ArrowDownRight, Building2, Film, Ticket, DollarSign, LucideIcon } from "lucide-react";
import { MetricCardData } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS_MAP: Record<string, LucideIcon> = {
  Building2,
  Film,
  Ticket,
  DollarSign,
};

export interface DashboardMetricCardProps {
  metric: MetricCardData;
  className?: string;
}

export function DashboardMetricCard({ metric, className }: DashboardMetricCardProps) {
  const IconComponent = ICONS_MAP[metric.iconName] || DollarSign;

  return (
    <div
      className={cn(
        "relative p-5 sm:p-6 rounded-2xl bg-[#161F2E]/90 border border-white/5 hover:border-amber-400/25 transition-all duration-300 shadow-xl overflow-hidden group hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
          {metric.title}
        </span>
        <div className="h-10 w-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition-colors">
          <IconComponent className="h-5 w-5" />
        </div>
      </div>

      <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
        {metric.value}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <div
          className={cn(
            "flex items-center font-medium",
            metric.isPositive ? "text-emerald-400" : "text-red-400"
          )}
        >
          {metric.isPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
          )}
          <span>{metric.change}</span>
        </div>

        <span className="text-[#9CA3AF]/70 truncate">{metric.description}</span>
      </div>
    </div>
  );
}
