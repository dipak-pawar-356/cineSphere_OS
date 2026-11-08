"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { usePlatformStore } from "@/store/platform-store";
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
  Cpu,
  Save,
  CheckCircle2,
  Lock,
  Moon,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type SettingsTab =
  | "general"
  | "branding"
  | "localization"
  | "pricing"
  | "security"
  | "email"
  | "sms"
  | "maintenance"
  | "integrations";

export default function SuperAdminSettingsPage() {
  const { settings, updateSettings, logAuditEvent } = usePlatformStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [savedNotice, setSavedNotice] = useState(false);

  // Local form state initialized from store
  const [appName, setAppName] = useState(settings.appName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);
  const [defaultCurrency, setDefaultCurrency] = useState(settings.defaultCurrency);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [timezone, setTimezone] = useState(settings.timezone);
  const [convenienceFee, setConvenienceFee] = useState(settings.convenienceFeePerSeat.toString());
  const [gstPercent, setGstPercent] = useState(settings.gstPercent.toString());
  const [twoFactor, setTwoFactor] = useState(settings.twoFactorEnforced);
  const [sessionTimeout, setSessionTimeout] = useState(settings.sessionTimeoutMinutes.toString());
  const [smtpHost, setSmtpHost] = useState(settings.smtpHost);
  const [smsGateway, setSmsGateway] = useState(settings.smsGateway);
  const [apiKey, setApiKey] = useState(settings.apiKeyLive);

  const SETTINGS_TABS: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "general", label: "General & Branding", icon: Settings },
    { id: "localization", label: "Localization & Currency", icon: Globe },
    { id: "pricing", label: "Fee & Tax Slabs", icon: Key },
    { id: "security", label: "Security & 2FA Auth", icon: Shield },
    { id: "email", label: "Email Dispatch (SMTP)", icon: Mail },
    { id: "sms", label: "SMS & WhatsApp Rails", icon: MessageSquare },
    { id: "maintenance", label: "Maintenance Mode", icon: Zap },
    { id: "integrations", label: "Hardware & Gateways", icon: Cpu },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      appName,
      tagline,
      logoUrl,
      maintenanceMode,
      defaultCurrency,
      currencySymbol,
      timezone,
      convenienceFeePerSeat: parseFloat(convenienceFee) || 35.0,
      gstPercent: parseFloat(gstPercent) || 18.0,
      twoFactorEnforced: twoFactor,
      sessionTimeoutMinutes: parseInt(sessionTimeout, 10) || 60,
      smtpHost,
      smsGateway,
      apiKeyLive: apiKey,
    });

    logAuditEvent("PLATFORM_CONFIG_UPDATED", "Settings", "Updated global platform parameters and financial tariffs.");
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 4000);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Global Platform Settings & Governance"
        subtitle="Configure Multi-Tenant Parameters, Security Rails, Currency, Fee Slabs & Integrations"
        badge="HQ Settings"
        badgeVariant="primary"
        actions={
          <Button onClick={handleSave} variant="primary" size="sm" className="gap-2 font-bold text-xs">
            <Save className="h-4 w-4" /> Save Configuration
          </Button>
        }
      />

      {savedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Configuration saved successfully! All edge partitions and database parameters updated.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Vertical Tabs List */}
        <div className="p-3 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            System Parameters
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

        {/* Right Content Area */}
        <div className="lg:col-span-3 p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-6">
          {/* TAB 1: General & Branding */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="border-b border-[#2A3445] pb-3">
                <h3 className="text-base font-bold text-white">General Platform Identity</h3>
                <p className="text-xs text-[#94A3B8]">Application title, marketing tagline and visual assets</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Platform Application Name</label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Platform Brand Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[#94A3B8] font-bold mb-1">Vector Logo Asset URL</label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Localization */}
          {activeTab === "localization" && (
            <div className="space-y-4">
              <div className="border-b border-[#2A3445] pb-3">
                <h3 className="text-base font-bold text-white">Localization & Currency Rails</h3>
                <p className="text-xs text-[#94A3B8]">Default regional currency, symbol, and timezone</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Default Currency Code</label>
                  <input
                    type="text"
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Platform Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST - UTC+04:00)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Pricing & Tax */}
          {activeTab === "pricing" && (
            <div className="space-y-4">
              <div className="border-b border-[#2A3445] pb-3">
                <h3 className="text-base font-bold text-white">Convenience Fees & Tax Slabs</h3>
                <p className="text-xs text-[#94A3B8]">Configurable platform fee share and statutory GST percentages</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Platform Convenience Fee / Seat (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={convenienceFee}
                    onChange={(e) => setConvenienceFee(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-[#64748B]">Applied to customer online ticket bookings</span>
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Statutory Cinema GST Slab (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={gstPercent}
                    onChange={(e) => setGstPercent(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-[#64748B]">Calculated as 9% CGST + 9% SGST</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Security */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="border-b border-[#2A3445] pb-3">
                <h3 className="text-base font-bold text-white">Access Security & 2FA Enforcement</h3>
                <p className="text-xs text-[#94A3B8]">Session limits and mandatory authentication policies</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Enforce Two-Factor Authentication (2FA)</div>
                    <div className="text-[11px] text-[#94A3B8]">Requires SMS / Authenticator app OTP for all Super Admin and Theatre Admin logins</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTwoFactor(!twoFactor)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                      twoFactor ? "bg-emerald-500 text-black" : "bg-[#2A3445] text-[#94A3B8]"
                    }`}
                  >
                    {twoFactor ? "ENFORCED" : "OPTIONAL"}
                  </button>
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Idle Session Inactivity Timeout (Minutes)</label>
                  <input
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-48 p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Maintenance Mode */}
          {activeTab === "maintenance" && (
            <div className="space-y-4">
              <div className="border-b border-[#2A3445] pb-3">
                <h3 className="text-base font-bold text-white">Circuit-Wide Maintenance Switch</h3>
                <p className="text-xs text-[#94A3B8]">Emergency platform drain and scheduled upgrades</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#111827] border border-[#2A3445] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-white text-sm">Platform Maintenance Mode</div>
                  <p className="text-xs text-[#94A3B8] mt-1 max-w-md">
                    When engaged, all public portals and booking engines display a graceful maintenance screen. Admin dashboards remain accessible to Super Admins.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors shrink-0 ${
                    maintenanceMode
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                      : "bg-[#2A3445] text-[#94A3B8] hover:text-white"
                  }`}
                >
                  {maintenanceMode ? "MAINTENANCE ACTIVE" : "MAINTENANCE OFF"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: Email & SMS */}
          {(activeTab === "email" || activeTab === "sms" || activeTab === "integrations") && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-[#2A3445] pb-3">
                <h3 className="text-base font-bold text-white">Notification Rails & API Connectors</h3>
                <p className="text-xs text-[#94A3B8]">SMTP dispatchers, telecom SMS gateways, and production API credentials</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Corporate SMTP Host</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">High-Priority SMS Rail</label>
                  <input
                    type="text"
                    value={smsGateway}
                    onChange={(e) => setSmsGateway(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[#94A3B8] font-bold mb-1">Platform Production API Master Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#2A3445] flex justify-end">
            <Button onClick={handleSave} variant="primary" size="sm" className="font-bold text-xs gap-2">
              <Save className="h-4 w-4" /> Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
