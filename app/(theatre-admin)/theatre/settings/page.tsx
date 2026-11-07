import React from "react";
import Link from "next/link";
import { CURRENT_THEATRE } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings,
  Save,
  Building2,
  Clock,
  Shield,
  CreditCard,
  Bell,
  Sliders,
} from "lucide-react";

export const metadata = {
  title: "Theatre Configuration & Preferences | CineSphere OS",
};

export default function TheatreSettingsPage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Theatre Configuration & Operational Preferences"
        subtitle="Turnstile Protocols, Laser Warning Limits, Default Pricing Ratios & Notification Rules"
        badge="Multi-Tenant Config"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <Save className="h-4 w-4" /> Save Preferences (Phase 2)
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar for Settings Categories */}
        <div className="space-y-1">
          {[
            { label: "General & Operating Hours", icon: Clock, active: true },
            { label: "Hall & Screen Preferences", icon: Sliders },
            { label: "Booking & Cancellation Policies", icon: Settings },
            { label: "Payment Gateway Routing", icon: CreditCard },
            { label: "Telemetry & Alert Thresholds", icon: Bell },
            { label: "Role-Based Access & Security", icon: Shield },
          ].map((cat, idx) => (
            <button
              key={cat.label}
              type="button"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                cat.active
                  ? "bg-[#161F2E] text-white border border-[#2A3445] shadow-lg shadow-black/20"
                  : "text-[#94A3B8] hover:text-white hover:bg-[#111827]"
              }`}
            >
              <cat.icon className="h-4 w-4 text-[#FBBF24] shrink-0" />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Forms */}
        <div className="lg:col-span-3 space-y-6">
          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#FBBF24]" /> Operating Schedule & Box Office Timers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#CBD5E1]">Daily Complex Opening Time</label>
                <Input defaultValue={CURRENT_THEATRE.openingTime} readOnly />
                <span className="text-[10px] text-[#64748B]">When automated mall entrance turnstiles power up</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#CBD5E1]">Daily Complex Closing Time</label>
                <Input defaultValue={CURRENT_THEATRE.closingTime} readOnly />
                <span className="text-[10px] text-[#64748B]">Post-midnight screening egress buffer</span>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#FBBF24]" /> Default Pricing Tiers & Clean Turnaround
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#CBD5E1]">Intermission Window</label>
                <Input defaultValue="15 minutes" readOnly />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#CBD5E1]">Cleaning & Sweep Buffer</label>
                <Input defaultValue="20 minutes" readOnly />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#CBD5E1]">Trailer Pre-Roll Duration</label>
                <Input defaultValue="12 minutes" readOnly />
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#FBBF24]" /> Cancellation & Instant Refund Matrix
            </h3>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
                <div>
                  <span className="font-bold text-white block">Cut-Off Before Showtime</span>
                  <span className="text-[10px] text-[#64748B]">Full refund allowed up to 2 hours before film begins</span>
                </div>
                <Badge variant="success" size="sm">120 Mins</Badge>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
                <div>
                  <span className="font-bold text-white block">Convenience Fee Refundability</span>
                  <span className="text-[10px] text-[#64748B]">Governed by cinema distributor agreement</span>
                </div>
                <Badge variant="outline" size="sm">Non-Refundable</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
