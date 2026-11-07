"use client";

import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  User,
  Shield,
  Key,
  Mail,
  Phone,
  MapPin,
  Laptop,
  CheckCircle2,
  Clock,
  Lock,
  Bell,
  Sliders,
  Save,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SuperAdminProfilePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Super Admin Profile & Security Identity"
        subtitle="Root Credentials, Hardware FIDO2 Keys, 2FA Tokens & Telemetry Preferences"
        description="Manage your centralized platform executive identity, session tokens, cryptographic audit keys, and alert preferences."
        badge="HQ Executive Root"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <Save className="h-4 w-4" /> Save Profile (Disabled)
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Avatar & Executive Card */}
        <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-6 text-center">
          <div className="relative inline-block mx-auto">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-[#FBBF24] via-[#F59E0B] to-[#D97706] flex items-center justify-center text-[#070B12] font-black text-3xl shadow-xl shadow-[#FBBF24]/20 mx-auto">
              MV
            </div>
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-[#111827] border-2 border-[#161F2E]">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Marcus Vance</h2>
            <p className="text-xs text-[#FBBF24] font-semibold">Chief Operating Officer & Super Admin</p>
            <p className="text-[11px] text-[#94A3B8]">CineSphere Global Circuit Headquarters</p>
          </div>

          <div className="pt-4 border-t border-[#2A3445] space-y-2.5 text-xs text-left">
            <div className="flex items-center gap-2.5 text-[#CBD5E1]">
              <Mail className="h-4 w-4 text-[#FBBF24] shrink-0" />
              <span className="truncate">marcus.vance@cinesphere.io</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#CBD5E1]">
              <Phone className="h-4 w-4 text-[#FBBF24] shrink-0" />
              <span>+1 (555) 948-2019</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#CBD5E1]">
              <MapPin className="h-4 w-4 text-[#FBBF24] shrink-0" />
              <span>New York, NY (Circuit HQ)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2A3445] text-left space-y-1 text-xs">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Security Clearance</span>
              <Badge variant="success" size="sm">Level 5 Root</Badge>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Full cryptographic write permissions across all 25 cinema chains and payment ledgers.
            </p>
          </div>
        </div>

        {/* Right Column: Identity Details, Security Placeholder & Preferences Placeholder */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Identity & Contact Details */}
          <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="h-4 w-4 text-[#FBBF24]" />
                <span>Identity & Contact Information</span>
              </h3>
              <Badge variant="outline" size="sm">Read Only Shell</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name" defaultValue="Marcus" disabled />
              <Input label="Last Name" defaultValue="Vance" disabled />
              <Input label="Corporate Email" defaultValue="marcus.vance@cinesphere.io" disabled />
              <Input label="Phone Number" defaultValue="+1 (555) 948-2019" disabled />
              <Input label="Platform Role" defaultValue="Super Admin (Root Director)" disabled />
              <Input label="Department" defaultValue="Executive Circuit Operations" disabled />
            </div>
          </div>

          {/* 2. Security Placeholder */}
          <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Security & Hardware Keys (Placeholder)</span>
              </h3>
              <Badge variant="success" size="sm">2FA Enforced</Badge>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <Key className="h-3.5 w-3.5 text-[#FBBF24]" />
                    <span>FIDO2 Hardware Security Key (YubiKey 5C NFC)</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">Last verified 18 minutes ago • Key ID: YB-94821</div>
                </div>
                <Badge variant="success" size="sm">Connected</Badge>
              </div>

              <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-[#38BDF8]" />
                    <span>Time-Based One-Time Password (TOTP)</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">Google Authenticator / 1Password registered</div>
                </div>
                <Badge variant="outline" size="sm">Active</Badge>
              </div>

              <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <Laptop className="h-3.5 w-3.5 text-[#CBD5E1]" />
                    <span>Active Session (macOS 15.1 • Chrome 130)</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">IP Address: 157.240.21.35 (HQ Verified VPN)</div>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">Current Session</span>
              </div>
            </div>
          </div>

          {/* 3. Preferences Placeholder */}
          <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#FBBF24]" />
                <span>Console Preferences (Placeholder)</span>
              </h3>
              <Badge variant="outline" size="sm">Preferences</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Telemetry Auto-Refresh Rate" defaultValue="Every 5 Seconds" disabled />
              <Input label="Default Dashboard Time Horizon" defaultValue="Rolling 30 Days" disabled />
              <Input label="Critical Alert SMS Channel" defaultValue="+1 (555) 948-2019" disabled />
              <Input label="Date & Time Standard" defaultValue="ISO 8601 (24-Hour Format)" disabled />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
