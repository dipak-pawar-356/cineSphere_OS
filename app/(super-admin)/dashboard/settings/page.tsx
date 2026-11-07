"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Settings,
  Shield,
  Palette,
  Globe,
  Mail,
  MessageSquare,
  Key,
  HardDrive,
  Database,
  Terminal,
  Wrench,
  Cpu,
  Save,
  CheckCircle2,
  Lock,
  Moon,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SettingsTab =
  | "general"
  | "branding"
  | "platform"
  | "localization"
  | "theme"
  | "email"
  | "sms"
  | "security"
  | "storage"
  | "backup"
  | "logs"
  | "maintenance"
  | "integrations";

export default function SuperAdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const SETTINGS_TABS: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "general", label: "General", icon: Settings },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "platform", label: "Platform", icon: Cpu },
    { id: "localization", label: "Localization", icon: Globe },
    { id: "theme", label: "Theme", icon: Moon },
    { id: "email", label: "Email Dispatch", icon: Mail },
    { id: "sms", label: "SMS & WhatsApp", icon: MessageSquare },
    { id: "security", label: "Security & 2FA", icon: Shield },
    { id: "storage", label: "Storage & NVMe", icon: HardDrive },
    { id: "backup", label: "Database Backup", icon: Database },
    { id: "logs", label: "Audit & Logs", icon: Terminal },
    { id: "maintenance", label: "Maintenance", icon: Zap },
    { id: "integrations", label: "Integrations", icon: Key },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform & System Settings"
        subtitle="Multi-Tenant Boundaries, Security Keys, Edge Policies & Integrations"
        description="Fine-tune global parameters, distributor API keys, automated backup policies, and notification providers."
        badge="HQ Settings"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <Save className="h-4 w-4" /> Save Configuration (Disabled)
          </Button>
        }
      />

      {/* Tabs Layout: Vertical Navigation on desktop + Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Navigation Tabs List */}
        <div className="p-3 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            System Configuration
          </div>
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
                  isActive
                    ? "bg-[#FBBF24] text-[#070B12] font-bold shadow-md shadow-[#FBBF24]/10"
                    : "text-[#94A3B8] hover:text-white hover:bg-[#111827]"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#070B12]" : "text-[#64748B]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Tab Content Panels */}
        <div className="lg:col-span-3 p-6 sm:p-8 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-6">
          {/* GENERAL TAB */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="border-b border-[#2A3445] pb-4">
                <h3 className="text-lg font-bold text-white">General Platform Settings</h3>
                <p className="text-xs text-[#94A3B8]">Central corporate identity, platform name, and primary contact addresses.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Platform Name" defaultValue="CineSphere OS" disabled />
                <Input label="Global Tagline" defaultValue="The Operating System for Modern Cinemas" disabled />
                <Input label="Central Support Email" defaultValue="concierge@cinesphere.io" disabled />
                <Input label="HQ Helpline Phone" defaultValue="+1 (800) 555-CINE" disabled />
              </div>

              <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-2 text-xs">
                <div className="font-bold text-white">Multi-Tenant Routing Identifier</div>
                <p className="text-[#94A3B8]">All cinema chains resolve dynamically via `tenant.cinesphere.io` or custom vanity domains with SSL.</p>
              </div>
            </div>
          )}

          {/* BRANDING TAB */}
          {activeTab === "branding" && (
            <div className="space-y-6">
              <div className="border-b border-[#2A3445] pb-4">
                <h3 className="text-lg font-bold text-white">Global Brand Assets</h3>
                <p className="text-xs text-[#94A3B8]">Logotypes, favicons, watermarks, and cinema receipt headers.</p>
              </div>

              <div className="space-y-4">
                <Input label="Corporate Logo URL" defaultValue="https://assets.cinesphere.io/brand/logo.svg" disabled />
                <Input label="Light / Dark Favicon" defaultValue="https://assets.cinesphere.io/brand/favicon.ico" disabled />
                <Input label="Digital Ticket Watermark Text" defaultValue="CineSphere Certified Secure QR Ticket" disabled />
              </div>
            </div>
          )}

          {/* PLATFORM TAB */}
          {activeTab === "platform" && (
            <div className="space-y-6">
              <div className="border-b border-[#2A3445] pb-4">
                <h3 className="text-lg font-bold text-white">Platform Tenant Rules</h3>
                <p className="text-xs text-[#94A3B8]">Concurrency rate limits, seat hold timers, and booking limits.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Seat Lock Reservation TTL (Minutes)" defaultValue="10" disabled />
                <Input label="Max Tickets Per Cart Transaction" defaultValue="10" disabled />
                <Input label="API Rate Limit Per Tenant (Req / Min)" defaultValue="2500" disabled />
                <Input label="Turnstile Scanner Offline Cache (Hours)" defaultValue="12" disabled />
              </div>
            </div>
          )}

          {/* LOCALIZATION TAB */}
          {activeTab === "localization" && (
            <div className="space-y-6">
              <div className="border-b border-[#2A3445] pb-4">
                <h3 className="text-lg font-bold text-white">Localization & Multi-Currency</h3>
                <p className="text-xs text-[#94A3B8]">Default currencies, timezones, and multilingual content settings.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Default Circuit Currency" defaultValue="INR (₹)" disabled />
                <Input label="Timezone Standard" defaultValue="Asia/Kolkata (IST +5:30)" disabled />
                <Input label="Primary UI Language" defaultValue="English (US/UK/IN)" disabled />
                <Input label="Number Formatting" defaultValue="Lakhs & Crores (South Asia)" disabled />
              </div>
            </div>
          )}

          {/* THEME TAB */}
          {activeTab === "theme" && (
            <div className="space-y-6">
              <div className="border-b border-[#2A3445] pb-4">
                <h3 className="text-lg font-bold text-white">Theme & Cinema Color Palette</h3>
                <p className="text-xs text-[#94A3B8]">Strict enterprise dark luxury styling token assignments.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Background", color: "#070B12" },
                  { label: "Surface", color: "#111827" },
                  { label: "Card", color: "#161F2E" },
                  { label: "Primary Amber", color: "#FBBF24" },
                ].map((th, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1.5">
                    <div className="h-6 w-full rounded-lg" style={{ backgroundColor: th.color }} />
                    <div className="text-xs font-bold text-white">{th.label}</div>
                    <div className="text-[10px] font-mono text-[#64748B]">{th.color}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMAIL TAB */}
          {activeTab === "email" && (
            <div className="space-y-6">
              <div className="border-b border-[#2A3445] pb-4">
                <h3 className="text-lg font-bold text-white">Transactional Email Delivery</h3>
                <p className="text-xs text-[#94A3B8]">Amazon SES, Resend, and SendGrid mail servers.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="SMTP Provider" defaultValue="Amazon SES (us-east-1)" disabled />
                <Input label="Sender Email Address" defaultValue="tickets@cinesphere.io" disabled />
                <Input label="DKIM & SPF Authentication" defaultValue="Verified (100% Pass)" disabled />
                <Input label="Daily Email Quota" defaultValue="500,000 Messages" disabled />
              </div>
            </div>
          )}

          {/* SMS TAB */}
          {activeTab === "sms" && (
            <div className="space-y-6">
              <div className="border-b border-[#2A3445] pb-4">
                <h3 className="text-lg font-bold text-white">SMS & WhatsApp Gateway</h3>
                <p className="text-xs text-[#94A3B8]">Twilio, Gupshup, and Meta WhatsApp Business API.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="SMS Gateway Provider" defaultValue="Twilio Enterprise / Gupshup" disabled />
                <Input label="WhatsApp Business WABA ID" defaultValue="waba_8492019842" disabled />
                <Input label="DLT Entity Registration ID" defaultValue="1101482910482" disabled />
                <Input label="OTP Dispatch Timeout" defaultValue="45 Seconds" disabled />
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="border-b border-[#2A3445] pb-4">
                <h3 className="text-lg font-bold text-white">Security & Access Policies</h3>
                <p className="text-xs text-[#94A3B8]">Two-factor authentication, session limits, and IP whitelist rules.</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">Mandatory 2FA for All Admins</div>
                    <div className="text-[11px] text-[#94A3B8]">Enforce Google Authenticator / FIDO2 security keys</div>
                  </div>
                  <Badge variant="success" size="sm">Enforced</Badge>
                </div>

                <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">Session Inactivity Expiry</div>
                    <div className="text-[11px] text-[#94A3B8]">Auto-lock dashboard after 30 minutes of idle time</div>
                  </div>
                  <Badge variant="primary" size="sm">30 Minutes</Badge>
                </div>
              </div>
            </div>
          )}

          {/* STORAGE TAB */}
          {activeTab === "storage" && (
            <div className="space-y-6">
              <div className="border-b border-[#2A3445] pb-4">
                <h3 className="text-lg font-bold text-white">Storage & Media Clusters</h3>
                <p className="text-xs text-[#94A3B8]">AWS S3, Cloudflare R2, and NVMe edge clusters.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Storage Cluster Provider" defaultValue="Cloudflare R2 + AWS S3" disabled />
                <Input label="Storage Quota" defaultValue="4.2 TB / 10.0 TB" disabled />
                <Input label="Asset CDN Edge URL" defaultValue="https://media.cinesphere.io" disabled />
                <Input label="DCP Decryption Cache Limit" defaultValue="2.0 TB NVMe" disabled />
              </div>
            </div>
          )}

          {/* BACKUP TAB */}
          {activeTab === "backup" && (
            <div className="space-y-6">
              <div className="border-b border-[#2A3445] pb-4">
                <h3 className="text-lg font-bold text-white">Database Backup & Disaster Recovery</h3>
                <p className="text-xs text-[#94A3B8]">Point-in-time recovery, multi-region snapshots, and replication.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Automated Snapshot Frequency</div>
                    <div className="text-[#94A3B8]">Continuous WAL archiving with 1-second RPO</div>
                  </div>
                  <Badge variant="success" size="sm">Active (0s RPO)</Badge>
                </div>

                <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Cross-Region Cold Mirror</div>
                    <div className="text-[#94A3B8]">Encrypted mirror replica in eu-west-1 (Frankfurt)</div>
                  </div>
                  <Badge variant="outline" size="sm">Synchronized</Badge>
                </div>
              </div>
            </div>
          )}

          {/* LOGS TAB */}
          {activeTab === "logs" && (
            <div className="space-y-6">
              <div className="border-b border-[#2A3445] pb-4">
                <h3 className="text-lg font-bold text-white">Audit & Log Retention Policy</h3>
                <p className="text-xs text-[#94A3B8]">SOC-2 and ISO 27001 compliant retention schedules.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Financial Ledger Retention" defaultValue="7 Years (Statutory)" disabled />
                <Input label="Security Access Log Retention" defaultValue="365 Days" disabled />
                <Input label="Projector Telemetry Frequency" defaultValue="Every 60 Seconds" disabled />
                <Input label="Log Streaming Destination" defaultValue="Datadog / OpenTelemetry" disabled />
              </div>
            </div>
          )}

          {/* MAINTENANCE TAB */}
          {activeTab === "maintenance" && (
            <div className="space-y-6">
              <div className="border-b border-[#2A3445] pb-4">
                <h3 className="text-lg font-bold text-white">Maintenance & Upgrades</h3>
                <p className="text-xs text-[#94A3B8]">Zero-downtime rolling upgrades and circuit maintenance windows.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-2 text-xs">
                <div className="font-bold text-white">Upcoming Maintenance Window</div>
                <p className="text-[#94A3B8]">Scheduled for Nov 20, 2026 at 03:00 AM IST. Automatic traffic drains to read replicas with zero booking interruption.</p>
                <div className="pt-2">
                  <Badge variant="info" size="sm">Scheduled</Badge>
                </div>
              </div>
            </div>
          )}

          {/* INTEGRATIONS TAB */}
          {activeTab === "integrations" && (
            <div className="space-y-6">
              <div className="border-b border-[#2A3445] pb-4">
                <h3 className="text-lg font-bold text-white">Hardware & Cinema Integrations</h3>
                <p className="text-xs text-[#94A3B8]">Christie, Barco, Dolby Atmos, QSC, and Rentrak Comscore API keys.</p>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Christie Digital CineLife SNMP", status: "Connected", desc: "4K Laser Projector automation and lamp telemetry" },
                  { name: "Barco Alchemy Server API", status: "Connected", desc: "DCP ingestion, playlist cues and show synchronization" },
                  { name: "Dolby CP950 Audio Processor", status: "Connected", desc: "Atmos 128-ch spatial sound volume and fader presets" },
                  { name: "Comscore / Rentrak Box Office EDI", status: "Connected", desc: "Automated midnight box office reporting transmission" },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="text-[11px] text-[#94A3B8]">{item.desc}</div>
                    </div>
                    <Badge variant="success" size="sm">{item.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
