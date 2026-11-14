"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Ticket,
  CreditCard,
  Wrench,
  Film,
  Users,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { DashboardActivityItem } from "@/types/theatre-dashboard.types";

interface ActivityFeedWidgetProps {
  activities: DashboardActivityItem[];
}

export function ActivityFeedWidget({ activities }: ActivityFeedWidgetProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "NEW_BOOKING":
        return <Ticket className="h-4 w-4 text-blue-400" />;
      case "PAYMENT_RECEIVED":
        return <CreditCard className="h-4 w-4 text-emerald-400" />;
      case "MAINTENANCE_ALERT":
        return <Wrench className="h-4 w-4 text-amber-400" />;
      case "SHOW_STARTED":
      case "SHOW_COMPLETED":
        return <Film className="h-4 w-4 text-purple-400" />;
      case "STAFF_DUTY":
        return <Users className="h-4 w-4 text-indigo-400" />;
      default:
        return <Activity className="h-4 w-4 text-zinc-400" />;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(isoString).toLocaleDateString();
    } catch {
      return "Recent";
    }
  };

  return (
    <Card variant="elevated" className="p-6 space-y-4 bg-[#0D1525] border border-[#2A3445]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2A3445]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Operational Activity Stream</h3>
            <p className="text-xs text-[#94A3B8]">Audit logging and live venue event dispatches</p>
          </div>
        </div>
        <Badge variant="outline" size="sm" className="border-[#2A3445] text-zinc-400">
          Live Sync
        </Badge>
      </div>

      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            No recent activity recorded for this period.
          </div>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] flex items-start justify-between gap-3 text-xs hover:border-zinc-500/40 transition-colors"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#1E293B] shrink-0 mt-0.5">
                  {getIcon(item.activityType)}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="font-bold text-white block truncate">{item.title}</span>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">{item.description}</p>
                </div>
              </div>

              <span className="text-[10px] text-[#64748B] font-mono shrink-0 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(item.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
