import React from "react";
import Link from "next/link";
import { THEATRE_NOTIFICATIONS } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Notification Center | CineSphere OS",
};

export default function TheatreNotificationsPage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Notification Center & Operational Dispatch"
        subtitle="Hardware Sensor Telemetry, Box Office Milestones & Turnstile Alerts"
        badge="3 Unread"
        badgeVariant="danger"
        actions={
          <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
            <CheckCheck className="h-4 w-4" /> Mark All as Read
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {["All Alerts (3)", "Auditorium Telemetry", "Showtime Alerts", "Box Office"].map((tab, i) => (
          <button
            key={tab}
            type="button"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              i === 0
                ? "bg-[#FBBF24] text-[#070B12]"
                : "bg-[#111827] text-[#94A3B8] border border-[#2A3445] hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {THEATRE_NOTIFICATIONS.map((notif) => (
          <Card key={notif.id} variant="elevated" className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center shrink-0">
                {notif.severity === "danger" || notif.severity === "warning" ? (
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                ) : notif.severity === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Info className="h-5 w-5 text-[#38BDF8]" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{notif.title}</h4>
                  <Badge variant={notif.state === "unread" ? "danger" : "secondary"} size="sm">
                    {notif.state}
                  </Badge>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed max-w-2xl">{notif.message}</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-[#64748B] font-mono block">{notif.time}</span>
              <Button variant="ghost" size="xs" disabled className="text-xs text-[#94A3B8] mt-1">
                Acknowledge
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

