"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";

export interface TrendMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  changePercent?: number; // e.g. +14.2 or -3.5
  changeLabel?: string;   // e.g. "vs last period"
  sparklineData?: number[];
  icon?: React.ReactNode;
  variant?: "basic" | "elevated" | "subtle-glass";
  className?: string;
}

export function TrendMetricCard({
  title,
  value,
  subtitle,
  changePercent,
  changeLabel = "vs prior period",
  sparklineData,
  icon,
  variant = "elevated",
  className,
}: TrendMetricCardProps) {
  const isPositive = changePercent !== undefined && changePercent > 0;
  const isNegative = changePercent !== undefined && changePercent < 0;
  const isNeutral = changePercent !== undefined && changePercent === 0;

  return (
    <Card variant={variant} className={cn("p-5 space-y-3 relative overflow-hidden", className)}>
      <div className="flex items-center justify-between text-xs text-[#94A3B8]">
        <span className="font-semibold uppercase tracking-wider font-mono">{title}</span>
        {icon && (
          <div className="h-8 w-8 rounded-lg bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold font-mono text-white tracking-tight">{value}</div>
        {subtitle && <div className="text-xs text-[#94A3B8]">{subtitle}</div>}
      </div>

      {/* Trend Indicator */}
      {changePercent !== undefined && (
        <div className="flex items-center gap-1.5 text-xs pt-1">
          <Badge
            variant={isPositive ? "primary" : isNegative ? "danger" : "secondary"}
            size="sm"
            className="gap-1 font-mono font-bold"
          >
            {isPositive && <TrendingUp className="h-3 w-3 text-emerald-400" />}
            {isNegative && <TrendingDown className="h-3 w-3 text-rose-400" />}
            {isNeutral && <Minus className="h-3 w-3 text-[#94A3B8]" />}
            <span>
              {isPositive ? "+" : ""}
              {changePercent}%
            </span>
          </Badge>
          <span className="text-[11px] text-[#64748B]">{changeLabel}</span>
        </div>
      )}

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="h-7 flex items-end gap-1 pt-2">
          {sparklineData.map((val, idx) => {
            const maxVal = Math.max(...sparklineData, 1);
            const heightPercent = Math.min(100, Math.max(15, (val / maxVal) * 100));
            return (
              <div
                key={idx}
                style={{ height: `${heightPercent}%` }}
                className={cn(
                  "flex-1 rounded-t transition-all",
                  isNegative
                    ? "bg-rose-500/30 hover:bg-rose-400"
                    : "bg-[#FBBF24]/30 hover:bg-[#FBBF24]"
                )}
                title={`Period ${idx + 1}: ${val}`}
              />
            );
          })}
        </div>
      )}
    </Card>
  );
}
