import React from "react";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils";

export interface AnalyticsCardProps {
  title: string;
  value: string;
  change: string;
  isPositive?: boolean;
  benchmark?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function AnalyticsCard({
  title,
  value,
  change,
  isPositive = true,
  benchmark = "vs previous 30 days",
  icon,
  className,
}: AnalyticsCardProps) {
  return (
    <Card variant="elevated" className={cn("p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
          {title}
        </span>
        {icon && (
          <div className="h-9 w-9 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
            {icon}
          </div>
        )}
      </div>

      <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
        {value}
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#2A3445]/60">
        <div
          className={cn(
            "flex items-center gap-1 font-bold",
            isPositive ? "text-[#22C55E]" : "text-[#EF4444]"
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          <span>{change}</span>
        </div>
        <span className="text-[#94A3B8] text-[11px]">{benchmark}</span>
      </div>
    </Card>
  );
}

