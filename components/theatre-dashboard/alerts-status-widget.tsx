"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Ticket,
  CreditCard,
  Film,
  Wrench,
  Users,
  ShieldAlert,
} from "lucide-react";
import { OperationalAlertsBundle } from "@/types/theatre-dashboard.types";

interface AlertsStatusWidgetProps {
  alerts: OperationalAlertsBundle;
}

export function AlertsStatusWidget({ alerts }: AlertsStatusWidgetProps) {
  const alertItems = [
    { label: "New Bookings", count: alerts.newBookingsCount, icon: Ticket, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Payment Reconciliations", count: alerts.paymentUpdatesCount, icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Show Approaching", count: alerts.showUpdatesCount, icon: Film, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Hardware Maintenance", count: alerts.maintenanceAlertsCount, icon: Wrench, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
    { label: "Staff On Duty", count: alerts.staffOnlineCount, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  ];

  return (
    <Card variant="elevated" className="p-6 space-y-4 bg-[#0D1525] border border-[#2A3445]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2A3445]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#F59E0B]">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Operational Alerts</h3>
            <p className="text-xs text-[#94A3B8]">Active incidents and live threshold telemetry</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {alertItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${item.bg}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className={`h-4 w-4 shrink-0 ${item.color}`} />
                <span className="text-xs text-zinc-300 truncate">{item.label}</span>
              </div>
              <span className={`font-mono font-bold text-sm ${item.color}`}>
                {item.count}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
