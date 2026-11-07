"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { NOTIFICATIONS_CENTER_DATA, NotificationItem } from "@/lib/constants/super-admin";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  Filter,
  Check,
  Trash2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminNotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<
    "all" | "unread" | "read" | "warning" | "success" | "info" | "error"
  >("all");

  const filteredNotifications = NOTIFICATIONS_CENTER_DATA.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.isRead;
    if (activeFilter === "read") return n.isRead;
    return n.category === activeFilter;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Central Notification Center"
        subtitle="System Alerts, Hardware Warnings, Distributor KDM Advisories & Security Incidents"
        description="Review critical operational events, laser projector SNMP traps, settlement notices, and firewall alerts."
        badge="3 Unread Alerts"
        badgeVariant="danger"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="gap-2 border-[#2A3445]"
            >
              <Check className="h-4 w-4" /> Mark All Read (Disabled)
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="gap-2 border-[#2A3445] text-rose-400"
            >
              <Trash2 className="h-4 w-4" /> Clear Resolved
            </Button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {[
            { id: "all", label: "All (6)" },
            { id: "unread", label: "Unread (3)" },
            { id: "read", label: "Read (3)" },
            { id: "warning", label: "Warnings" },
            { id: "error", label: "Errors" },
            { id: "success", label: "Success" },
            { id: "info", label: "Info" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium capitalize ${
                activeFilter === tab.id
                  ? "bg-[#FBBF24] text-[#070B12] font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#64748B] font-mono">
          Showing {filteredNotifications.length} notifications
        </div>
      </div>

      {/* Notification Cards List */}
      <div className="space-y-3">
        {filteredNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-5 rounded-2xl border transition-colors flex items-start gap-4 ${
              !notif.isRead
                ? "bg-[#161F2E] border-[#FBBF24]/40 shadow-lg shadow-black/20"
                : "bg-[#111827] border-[#2A3445]"
            }`}
          >
            {/* Category Icon */}
            <div className="shrink-0 mt-0.5">
              {notif.category === "warning" && (
                <div className="h-9 w-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              )}
              {notif.category === "error" && (
                <div className="h-9 w-9 rounded-xl bg-rose-400/10 border border-rose-400/30 flex items-center justify-center text-rose-400">
                  <XCircle className="h-5 w-5" />
                </div>
              )}
              {notif.category === "success" && (
                <div className="h-9 w-9 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              )}
              {notif.category === "info" && (
                <div className="h-9 w-9 rounded-xl bg-sky-400/10 border border-sky-400/30 flex items-center justify-center text-sky-400">
                  <Info className="h-5 w-5" />
                </div>
              )}
            </div>

            {/* Notification Body */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{notif.title}</h4>
                  {!notif.isRead && (
                    <Badge variant="warning" size="sm">New</Badge>
                  )}
                </div>
                <span className="text-[11px] font-mono text-[#64748B] shrink-0">{notif.time}</span>
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {notif.message}
              </p>

              {notif.linkText && (
                <div className="pt-2">
                  <button
                    onClick={() => alert(`Action "${notif.linkText}" placeholder triggered.`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#FBBF24] hover:underline"
                  >
                    <span>{notif.linkText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
