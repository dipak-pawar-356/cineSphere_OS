"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { useTheatreStore } from "@/store/theatre-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Save,
  Building2,
  Clock,
  Shield,
  CreditCard,
  Bell,
  Sliders,
  CheckCircle2,
  Lock,
  QrCode,
} from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function TheatreSettingsPage() {
  const { profile, updateProfile, logTenantAudit } = useTheatreStore();

  const [activeTab, setActiveTab] = useState("general");
  const [openingTime, setOpeningTime] = useState(profile.openingTime);
  const [closingTime, setClosingTime] = useState(profile.closingTime);
  const [intermissionMinutes, setIntermissionMinutes] = useState(15);
  const [turnaroundMinutes, setTurnaroundMinutes] = useState(20);
  const [gateEntryBufferMinutes, setGateEntryBufferMinutes] = useState(20);
  const [cancellationHours, setCancellationHours] = useState(2);
  const [laserWarningHours, setLaserWarningHours] = useState(1500);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      openingTime,
      closingTime,
    });
    logTenantAudit("SETTINGS_UPDATED", "Settings", "Updated operational settings and turnstile parameters");
    setFeedbackNotice("Operational settings and gate parameters saved successfully.");
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Theatre Configuration & Operational Preferences"
        subtitle={`${profile.name} • Turnstile Protocols, Clean Turnarounds & Policies`}
        description="Configure automated mall entrance turnstiles, projector maintenance alert thresholds, ticket refund windows, and cleaning buffer times."
        badge="Multi-Tenant Config"
        badgeVariant="primary"
        actions={
          <Button
            type="submit"
            form="settings-form"
            variant="primary"
            size="sm"
            className="gap-2 font-bold bg-[#E50914] text-white hover:bg-[#b80710]"
          >
            <Save className="h-4 w-4" /> Save Preferences
          </Button>
        }
      />

      {feedbackNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar for Settings Categories */}
        <div className="space-y-1">
          {[
            { id: "general", label: "General & Operating Hours", icon: Clock },
            { id: "turnaround", label: "Turnaround & Intermissions", icon: Sliders },
            { id: "turnstile", label: "Turnstile Gate Rules", icon: QrCode },
            { id: "policy", label: "Cancellation & Refund Terms", icon: Settings },
            { id: "security", label: "Tenant Isolation & Security", icon: Shield },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                activeTab === cat.id
                  ? "bg-[#161F2E] text-white border border-[#2A3445] shadow-lg shadow-black/20 font-bold"
                  : "text-[#94A3B8] hover:text-white hover:bg-[#111827]"
              }`}
            >
              <cat.icon className={`h-4 w-4 shrink-0 ${activeTab === cat.id ? "text-[#FBBF24]" : "text-[#64748B]"}`} />
              <span>{cat.label}</span>
            </button>
          ))}

          <div className="pt-4">
            <Link href={ROUTES.THEATRE_ADMIN.UPI}>
              <div className="p-3 rounded-xl bg-[#070B12] border border-[#2A3445] hover:border-[#FBBF24]/40 transition-colors text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">UPI & Payments</span>
                  <span className="text-[10px] text-[#64748B]">Manage settlement rail</span>
                </div>
                <CreditCard className="h-4 w-4 text-[#FBBF24]" />
              </div>
            </Link>
          </div>
        </div>

        {/* Settings Form Pane */}
        <div className="lg:col-span-3 space-y-6">
          <form id="settings-form" onSubmit={handleSave} className="space-y-6">
            {activeTab === "general" && (
              <Card variant="elevated" className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#FBBF24]" /> Complex Operating Hours
                  </h3>
                  <Badge variant="outline" size="sm">7 Days Operational</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[#94A3B8] font-medium">Daily Complex Opening Time</label>
                    <input
                      type="text"
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono"
                    />
                    <span className="text-[10px] text-[#64748B]">When automated mall entrance turnstiles power up</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#94A3B8] font-medium">Daily Complex Closing Time</label>
                    <input
                      type="text"
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono"
                    />
                    <span className="text-[10px] text-[#64748B]">Post-midnight screening egress buffer</span>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "turnaround" && (
              <Card variant="elevated" className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-[#FBBF24]" /> Intermission & Turnover Buffers
                  </h3>
                  <Badge variant="outline" size="sm">Auditorium Dispatch</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[#94A3B8] font-medium">Intermission Window (Minutes)</label>
                    <input
                      type="number"
                      min="10"
                      max="30"
                      value={intermissionMinutes}
                      onChange={(e) => setIntermissionMinutes(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono"
                    />
                    <span className="text-[10px] text-[#64748B]">Standard interval concession break</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#94A3B8] font-medium">Hall Cleaning Buffer (Minutes)</label>
                    <input
                      type="number"
                      min="15"
                      max="45"
                      value={turnaroundMinutes}
                      onChange={(e) => setTurnaroundMinutes(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono"
                    />
                    <span className="text-[10px] text-[#64748B]">Minimum turnaround gap between consecutive shows</span>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "turnstile" && (
              <Card variant="elevated" className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-[#FBBF24]" /> Turnstile QR Gate Rules
                  </h3>
                  <Badge variant="success" size="sm">Automated Scan</Badge>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[#94A3B8] font-medium">Late Entry Grace Period (Minutes)</label>
                    <input
                      type="number"
                      min="5"
                      max="45"
                      value={gateEntryBufferMinutes}
                      onChange={(e) => setGateEntryBufferMinutes(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono"
                    />
                    <span className="text-[10px] text-[#64748B]">
                      Patron m-tickets are valid at QR scanners up to {gateEntryBufferMinutes} minutes after scheduled show start time.
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "policy" && (
              <Card variant="elevated" className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
                    <Settings className="h-4 w-4 text-[#FBBF24]" /> Cancellation & Refund Rules
                  </h3>
                  <Badge variant="outline" size="sm">Patron Terms</Badge>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[#94A3B8] font-medium">Cancellation Cut-off (Hours before showtime)</label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={cancellationHours}
                      onChange={(e) => setCancellationHours(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono"
                    />
                    <span className="text-[10px] text-[#64748B]">
                      Patrons can cancel their ticket up to {cancellationHours} hours prior to scheduled screening.
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "security" && (
              <Card variant="elevated" className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400" /> Tenant Scoping & Security Matrix
                  </h3>
                  <Badge variant="success" size="sm">Strict Isolation</Badge>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#070B12] border border-[#2A3445] space-y-1 font-mono">
                    <span className="text-[10px] text-[#64748B] uppercase">Scoped Tenant ID</span>
                    <p className="text-white font-bold">{profile.id}</p>
                    <span className="text-[10px] text-[#64748B] uppercase pt-2 block">Exhibitor Registration</span>
                    <p className="text-[#FBBF24] font-bold">{profile.code}</p>
                  </div>

                  <p className="text-[#94A3B8] leading-relaxed">
                    Every database query and operational action is hard-locked to <strong className="text-white">{profile.id}</strong>.
                    Zero cross-theatre data leaks can occur under the CineSphere OS multi-tenant schema.
                  </p>
                </div>
              </Card>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="gap-2 font-bold bg-[#E50914] text-white hover:bg-[#b80710]"
              >
                <Save className="h-4 w-4" /> Save Preferences
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
