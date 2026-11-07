import React from "react";
import { TrendingUp, Activity, Zap, CheckCircle2, AlertTriangle, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

export interface MiniChartPlaceholderProps {
  dataPoints?: number[];
  label: string;
  value: string;
  trend?: string;
  className?: string;
}

export function MiniChartCard({
  dataPoints = [35, 45, 60, 50, 75, 80, 95],
  label,
  value,
  trend = "+18.4%",
  className,
}: MiniChartPlaceholderProps) {
  return (
    <Card variant="elevated" className={cn("p-5 space-y-3", className)}>
      <div className="flex items-center justify-between text-xs text-[#94A3B8]">
        <span className="font-semibold uppercase tracking-wider">{label}</span>
        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
          <TrendingUp className="h-3 w-3" /> {trend}
        </span>
      </div>

      <div className="text-2xl font-bold font-mono text-white">{value}</div>

      {/* Mini sparkline visualization */}
      <div className="h-10 flex items-end gap-1.5 pt-2">
        {dataPoints.map((val, i) => (
          <div
            key={i}
            style={{ height: `${val}%` }}
            className="flex-1 rounded-t bg-[#FBBF24]/30 hover:bg-[#FBBF24] transition-colors"
          />
        ))}
      </div>
    </Card>
  );
}

export interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionLabel: string;
  onAction?: () => void;
  className?: string;
}

export function QuickActionCard({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: QuickActionCardProps) {
  return (
    <Card variant="interactive" className={cn("p-5 flex flex-col justify-between", className)}>
      <div className="space-y-3">
        <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
          {icon}
        </div>
        <h4 className="font-bold text-white text-sm">{title}</h4>
        <p className="text-xs text-[#94A3B8] leading-relaxed">{description}</p>
      </div>

      <div className="pt-4 mt-4 border-t border-[#2A3445] flex items-center justify-between text-xs font-semibold text-[#FBBF24] group">
        <span>{actionLabel}</span>
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Card>
  );
}

export interface SystemStatusCardProps {
  clusterName?: string;
  uptime?: string;
  latency?: string;
  activeNodes?: number;
  className?: string;
}

export function SystemStatusCard({
  clusterName = "US-East Production Circuit",
  uptime = "99.99%",
  latency = "24ms",
  activeNodes = 154,
  className,
}: SystemStatusCardProps) {
  return (
    <Card variant="elevated" className={cn("p-5 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white text-xs">{clusterName}</span>
        </div>
        <Badge variant="success" size="sm">
          Healthy
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#2A3445]/60 text-xs">
        <div className="p-2 rounded-lg bg-[#111827]">
          <div className="text-[10px] text-[#94A3B8] uppercase">Uptime</div>
          <div className="font-mono font-bold text-white mt-0.5">{uptime}</div>
        </div>
        <div className="p-2 rounded-lg bg-[#111827]">
          <div className="text-[10px] text-[#94A3B8] uppercase">Latency</div>
          <div className="font-mono font-bold text-[#FBBF24] mt-0.5">{latency}</div>
        </div>
        <div className="p-2 rounded-lg bg-[#111827]">
          <div className="text-[10px] text-[#94A3B8] uppercase">Nodes</div>
          <div className="font-mono font-bold text-white mt-0.5">{activeNodes}</div>
        </div>
      </div>
    </Card>
  );
}

export interface RevenueCardProps {
  amount: string;
  period?: string;
  changePercent?: string;
  isPositive?: boolean;
  breakdown?: { label: string; amount: string }[];
  className?: string;
}

export function RevenueCard({
  amount,
  period = "This Month",
  changePercent = "+24.8%",
  isPositive = true,
  breakdown = [
    { label: "Box Office", amount: "72%" },
    { label: "F&B Concessions", amount: "21%" },
    { label: "Add-ons", amount: "7%" },
  ],
  className,
}: RevenueCardProps) {
  return (
    <Card variant="elevated" className={cn("p-5 space-y-4", className)}>
      <div className="flex items-center justify-between text-xs text-[#94A3B8]">
        <span className="font-semibold uppercase tracking-wider">Gross Revenue</span>
        <span className="text-[11px]">{period}</span>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
          {amount}
        </div>
        <Badge variant={isPositive ? "success" : "danger"} size="sm">
          {changePercent}
        </Badge>
      </div>

      {breakdown && breakdown.length > 0 && (
        <div className="pt-3 border-t border-[#2A3445] space-y-2">
          {breakdown.map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs">
              <span className="text-[#94A3B8]">{item.label}</span>
              <span className="font-mono font-semibold text-white">{item.amount}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  delta,
  deltaType = "positive",
  icon,
  subtitle,
  className,
}: MetricCardProps) {
  return (
    <Card variant="elevated" className={cn("p-5 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="h-8 w-8 rounded-lg bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
            {icon}
          </div>
        )}
      </div>

      <div className="text-2xl font-bold font-mono text-white">{value}</div>

      {(delta || subtitle) && (
        <div className="flex items-center gap-2 text-xs">
          {delta && (
            <span
              className={cn(
                "font-bold",
                deltaType === "positive"
                  ? "text-emerald-400"
                  : deltaType === "negative"
                  ? "text-rose-400"
                  : "text-[#94A3B8]"
              )}
            >
              {delta}
            </span>
          )}
          {subtitle && <span className="text-[#94A3B8]">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
}

export interface ActivityCardProps {
  title?: string;
  activities: { id: string; user: string; action: string; time: string }[];
  className?: string;
}

export function ActivityCard({
  title = "Live Audit Trail",
  activities,
  className,
}: ActivityCardProps) {
  return (
    <Card variant="elevated" className={cn("p-5 space-y-3", className)}>
      <div className="flex items-center justify-between text-xs pb-2 border-b border-[#2A3445]">
        <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#FBBF24]" /> {title}
        </span>
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      <div className="space-y-2.5">
        {activities.map((act) => (
          <div key={act.id} className="text-xs flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-white">{act.user}</span>{" "}
              <span className="text-[#94A3B8]">{act.action}</span>
            </div>
            <span className="text-[10px] text-[#64748B] shrink-0 font-mono">{act.time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
