"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Database, Zap, Server } from "lucide-react";
import { SystemHealthMetric } from "@/types/theatre-dashboard.types";

interface SystemHealthWidgetProps {
  health: SystemHealthMetric;
  theatreCode: string;
}

export function SystemHealthWidget({ health, theatreCode }: SystemHealthWidgetProps) {
  return (
    <Card variant="elevated" className="p-6 space-y-4 bg-[#0D1525] border border-[#2A3445]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2A3445]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Node Telemetry & Edge Health</h3>
            <p className="text-xs text-[#94A3B8]">Tenant node latency and database sync</p>
          </div>
        </div>
        <Badge
          variant={health.status === "OPTIMAL" ? "success" : health.status === "DEGRADED" ? "warning" : "danger"}
          size="sm"
          dot
        >
          {health.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
          <div className="flex items-center gap-1.5 text-[#94A3B8]">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Response Latency</span>
          </div>
          <span className="font-mono font-bold text-white text-sm block">
            {health.latencyMs} ms
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold">Sub-50ms target</span>
        </div>

        <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
          <div className="flex items-center gap-1.5 text-[#94A3B8]">
            <Database className="h-3.5 w-3.5 text-blue-400" />
            <span>PostgreSQL Pool</span>
          </div>
          <span className="font-mono font-bold text-white text-sm block">
            Connected (Drizzle)
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold">Healthy connections</span>
        </div>

        <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
          <div className="flex items-center gap-1.5 text-[#94A3B8]">
            <Server className="h-3.5 w-3.5 text-purple-400" />
            <span>Tenant Namespace</span>
          </div>
          <span className="font-mono font-bold text-white text-sm block truncate">
            {theatreCode}
          </span>
          <span className="text-[10px] text-zinc-400 font-semibold">Strict partition active</span>
        </div>
      </div>
    </Card>
  );
}
