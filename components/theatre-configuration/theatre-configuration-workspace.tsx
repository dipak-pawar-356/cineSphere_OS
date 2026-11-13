"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sliders,
  Globe,
  Ticket,
  XCircle,
  DollarSign,
  ShieldCheck,
  Sparkles,
  FileText,
  History,
  CheckCircle2,
  AlertCircle,
  Send,
  RotateCcw,
  Clock,
  Layers,
} from "lucide-react";
import type {
  TheatreConfigurationBundle,
  UpdateLocalizationConfigInput,
  UpdateBookingConfigInput,
  UpdateCancellationConfigInput,
  UpdateRefundConfigInput,
  UpdateAgeRestrictionConfigInput,
  UpdateFeatureFlagsInput,
  UpdateConfigurationTermsInput,
  PublishTheatreConfigurationInput,
  RestoreConfigurationVersionInput,
} from "@/types/theatre-configuration.types";
import {
  ConfigurationStatusBadge,
  FeatureToggleBadge,
} from "./configuration-status-badge";
import { LocalizationConfigModal } from "./localization-config-modal";
import { BookingConfigModal } from "./booking-config-modal";
import { CancellationConfigModal } from "./cancellation-config-modal";
import { RefundConfigModal } from "./refund-config-modal";
import { AgeRestrictionModal } from "./age-restriction-modal";
import { FeatureFlagsModal } from "./feature-flags-modal";
import { ConfigurationTermsModal } from "./configuration-terms-modal";

interface ConfigurationWorkspaceProps {
  theatreId: string;
  initialBundle: TheatreConfigurationBundle;
  isSuperAdmin?: boolean;
  onUpdateLocalization: (data: UpdateLocalizationConfigInput) => Promise<void>;
  onUpdateBooking: (data: UpdateBookingConfigInput) => Promise<void>;
  onUpdateCancellation: (data: UpdateCancellationConfigInput) => Promise<void>;
  onUpdateRefund: (data: UpdateRefundConfigInput) => Promise<void>;
  onUpdateAgeRestriction: (data: UpdateAgeRestrictionConfigInput) => Promise<void>;
  onUpdateFeatureFlags: (data: UpdateFeatureFlagsInput) => Promise<void>;
  onUpdateTerms: (data: UpdateConfigurationTermsInput) => Promise<void>;
  onPublish: (data: PublishTheatreConfigurationInput) => Promise<void>;
  onRestoreVersion: (data: RestoreConfigurationVersionInput) => Promise<void>;
}

export function TheatreConfigurationWorkspace({
  theatreId,
  initialBundle,
  isSuperAdmin = false,
  onUpdateLocalization,
  onUpdateBooking,
  onUpdateCancellation,
  onUpdateRefund,
  onUpdateAgeRestriction,
  onUpdateFeatureFlags,
  onUpdateTerms,
  onPublish,
  onRestoreVersion,
}: ConfigurationWorkspaceProps) {
  const [bundle, setBundle] = useState<TheatreConfigurationBundle>(initialBundle);
  const [activeTab, setActiveTab] = useState<
    "overview" | "localization" | "booking" | "financial" | "compliance" | "features" | "versions"
  >("overview");

  // Modals state
  const [localizationModalOpen, setLocalizationModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [ageModalOpen, setAgeModalOpen] = useState(false);
  const [featuresModalOpen, setFeaturesModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  const config = bundle.configuration;
  const localization = bundle.localization;
  const booking = bundle.booking;
  const cancellation = bundle.cancellation;
  const refund = bundle.refund;
  const ageRestriction = bundle.ageRestriction;
  const featureFlags = bundle.featureFlags;
  const terms = bundle.terms;
  const versions = bundle.versions || [];

  const handlePublish = async () => {
    setPublishing(true);
    setPublishMessage(null);
    try {
      await onPublish({
        theatreId,
        expectedVersion: config?.version,
        summary: `Published configuration snapshot v${(config?.version || 0) + 1}`,
      });
      setPublishMessage("Configuration published successfully! Live booking engines updated.");
      setTimeout(() => setPublishMessage(null), 4000);
    } catch (err: unknown) {
      setPublishMessage(err instanceof Error ? err.message : "Failed to publish configuration.");
    } finally {
      setPublishing(false);
    }
  };

  const handleRestore = async (versionNumber: number) => {
    if (!confirm(`Are you sure you want to rollback to configuration v${versionNumber}?`)) {
      return;
    }
    try {
      await onRestoreVersion({ theatreId, versionNumber });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to restore version");
    }
  };

  // Count active feature flags
  const activeFlagsCount = featureFlags
    ? [
        featureFlags.enableLoyalty,
        featureFlags.enableCoupons,
        featureFlags.enableGiftCards,
        featureFlags.enableMemberships,
        featureFlags.enableDynamicPricing,
        featureFlags.enableAiRecommendations,
        featureFlags.enableWaitlist,
      ].filter(Boolean).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <Card className="p-6 bg-[#0B132B]/80 border-[#1E293B] backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#FBBF24]/10 text-[#FBBF24]">
                <Sliders className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Theatre Dynamic Configuration & Rules
              </h2>
              {config && <ConfigurationStatusBadge status={config.status} size="sm" />}
            </div>
            <p className="text-xs text-[#94A3B8]">
              Manage multi-tenant operational parameters: currency/localization, seat holding limits, cancellation penalties, age ratings, and feature flags.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-[#2A3445] text-zinc-300 font-mono text-xs px-2.5 py-1">
              Version {config ? `v${config.version}` : "v1"}
            </Badge>

            <Button
              onClick={handlePublish}
              disabled={publishing || config?.status === "PUBLISHED"}
              className="bg-[#FBBF24] hover:bg-[#F59E0B] text-[#070B12] font-semibold text-xs h-9 px-4"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {publishing ? "Publishing..." : config?.status === "PUBLISHED" ? "Published" : "Publish Changes"}
            </Button>
          </div>
        </div>

        {publishMessage && (
          <div className="mt-4 p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{publishMessage}</span>
          </div>
        )}

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#1E293B]">
          <div className="p-3 rounded-2xl bg-[#070B12] border border-[#1E293B]">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Currency & Locale</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              {localization?.currency || "INR"} ({localization?.primaryLanguage || "en"})
            </div>
            <div className="text-[10px] text-[#64748B] mt-0.5">{localization?.timezone || "Asia/Kolkata"}</div>
          </div>

          <div className="p-3 rounded-2xl bg-[#070B12] border border-[#1E293B]">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Booking Quotas</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              {booking?.minSeatsPerBooking || 1}–{booking?.maxSeatsPerBooking || 10} Seats
            </div>
            <div className="text-[10px] text-[#64748B] mt-0.5">Hold: {booking?.seatHoldDurationSeconds || 600}s</div>
          </div>

          <div className="p-3 rounded-2xl bg-[#070B12] border border-[#1E293B]">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Cancellation & Refund</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              {cancellation?.cancellationAllowed ? `${cancellation.cancellationFeePercent}% Fee` : "Non-Refundable"}
            </div>
            <div className="text-[10px] text-[#64748B] mt-0.5">
              Window: {refund?.refundWindowHours || 24}h before
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#070B12] border border-[#1E293B]">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Active Capabilities</div>
            <div className="text-sm font-bold text-[#FBBF24] font-mono mt-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {activeFlagsCount} of 7 Features
            </div>
            <div className="text-[10px] text-[#64748B] mt-0.5">
              {featureFlags?.enableDynamicPricing ? "Dynamic Surge Active" : "Fixed Pricing"}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-[#1E293B] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30"
              : "text-[#94A3B8] hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Overview Matrix
        </button>

        <button
          onClick={() => setActiveTab("localization")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "localization"
              ? "bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30"
              : "text-[#94A3B8] hover:text-white"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Localization
        </button>

        <button
          onClick={() => setActiveTab("booking")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "booking"
              ? "bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30"
              : "text-[#94A3B8] hover:text-white"
          }`}
        >
          <Ticket className="w-3.5 h-3.5" />
          Booking Rules
        </button>

        <button
          onClick={() => setActiveTab("financial")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "financial"
              ? "bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30"
              : "text-[#94A3B8] hover:text-white"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Cancellation & Refunds
        </button>

        <button
          onClick={() => setActiveTab("compliance")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "compliance"
              ? "bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30"
              : "text-[#94A3B8] hover:text-white"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Age & Legal Terms
        </button>

        <button
          onClick={() => setActiveTab("features")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "features"
              ? "bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30"
              : "text-[#94A3B8] hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Feature Flags
        </button>

        <button
          onClick={() => setActiveTab("versions")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "versions"
              ? "bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30"
              : "text-[#94A3B8] hover:text-white"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Version History ({versions.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW MATRIX */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Localization */}
          <Card className="p-5 bg-[#0B132B]/80 border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#FBBF24]/10 text-[#FBBF24]">
                  <Globe className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-white">Localization</h3>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setLocalizationModalOpen(true)}
                className="border-[#2A3445] text-xs text-zinc-300 hover:text-white"
              >
                Configure
              </Button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1E293B]">
                <span className="text-[#94A3B8]">Currency:</span>
                <span className="font-mono text-white font-semibold">{localization?.currency || "INR"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E293B]">
                <span className="text-[#94A3B8]">Timezone:</span>
                <span className="font-mono text-white">{localization?.timezone || "Asia/Kolkata"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E293B]">
                <span className="text-[#94A3B8]">Primary Language:</span>
                <span className="text-white uppercase font-semibold">{localization?.primaryLanguage || "en"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#94A3B8]">Clock Format:</span>
                <span className="text-white font-mono">{localization?.timeFormat || "12H"}</span>
              </div>
            </div>
          </Card>

          {/* Card 2: Booking Rules */}
          <Card className="p-5 bg-[#0B132B]/80 border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#FBBF24]/10 text-[#FBBF24]">
                  <Ticket className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-white">Booking Rules</h3>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setBookingModalOpen(true)}
                className="border-[#2A3445] text-xs text-zinc-300 hover:text-white"
              >
                Configure
              </Button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1E293B]">
                <span className="text-[#94A3B8]">Max Seats / Booking:</span>
                <span className="font-mono text-white font-semibold">{booking?.maxSeatsPerBooking || 10}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E293B]">
                <span className="text-[#94A3B8]">Advance Days:</span>
                <span className="font-mono text-white">{booking?.advanceBookingDays || 30} Days</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E293B]">
                <span className="text-[#94A3B8]">Seat Hold Lock:</span>
                <span className="font-mono text-white">{booking?.seatHoldDurationSeconds || 600} Seconds</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#94A3B8]">Gate Cutoff:</span>
                <span className="font-mono text-white">{booking?.bookingCutoffMinutes || 15} Mins</span>
              </div>
            </div>
          </Card>

          {/* Card 3: Cancellation & Refunds */}
          <Card className="p-5 bg-[#0B132B]/80 border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#FBBF24]/10 text-[#FBBF24]">
                  <DollarSign className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-white">Cancellation & Refund</h3>
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setCancellationModalOpen(true)}
                  className="border-[#2A3445] text-[10px] text-zinc-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setRefundModalOpen(true)}
                  className="border-[#2A3445] text-[10px] text-zinc-300 hover:text-white"
                >
                  Refund
                </Button>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1E293B]">
                <span className="text-[#94A3B8]">Cancellation Allowed:</span>
                <span className={`font-semibold ${cancellation?.cancellationAllowed ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                  {cancellation?.cancellationAllowed ? "YES" : "NO"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E293B]">
                <span className="text-[#94A3B8]">Cancellation Fee:</span>
                <span className="font-mono text-white">{cancellation?.cancellationFeePercent || "15.00"}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E293B]">
                <span className="text-[#94A3B8]">Refund Payout:</span>
                <span className="font-mono text-white">{refund?.refundPercentage || "85.00"}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#94A3B8]">Refund Target:</span>
                <span className="text-white font-mono text-[11px]">{refund?.refundMethod || "ORIGINAL_PAYMENT"}</span>
              </div>
            </div>
          </Card>

          {/* Card 4: Age Restrictions */}
          <Card className="p-5 bg-[#0B132B]/80 border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6]">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-white">Age Restrictions</h3>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setAgeModalOpen(true)}
                className="border-[#2A3445] text-xs text-zinc-300 hover:text-white"
              >
                Configure
              </Button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1E293B]">
                <span className="text-[#94A3B8]">Ratings Matrix (U / UA / A):</span>
                <span className="font-mono text-white font-semibold">
                  {ageRestriction?.minAgeU ?? 0} / {ageRestriction?.minAgeUA ?? 12} / {ageRestriction?.minAgeA ?? 18}+
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E293B]">
                <span className="text-[#94A3B8]">Guardian Under:</span>
                <span className="font-mono text-white">{ageRestriction?.guardianRequiredUnderAge || 12} Yrs</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#94A3B8]">Gate ID Check:</span>
                <span className={`font-semibold ${ageRestriction?.requireAgeVerificationAtGate ? "text-[#10B981]" : "text-[#94A3B8]"}`}>
                  {ageRestriction?.requireAgeVerificationAtGate ? "Enforced" : "Optional"}
                </span>
              </div>
            </div>
          </Card>

          {/* Card 5: Feature Flags */}
          <Card className="p-5 bg-[#0B132B]/80 border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#FBBF24]/10 text-[#FBBF24]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-white">Feature Flags</h3>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setFeaturesModalOpen(true)}
                className="border-[#2A3445] text-xs text-zinc-300 hover:text-white"
              >
                Configure
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className={`px-2 py-1.5 rounded border ${featureFlags?.enableLoyalty ? "border-[#10B981]/30 bg-[#10B981]/10 text-white" : "border-[#1E293B] text-[#64748B]"}`}>
                Loyalty: {featureFlags?.enableLoyalty ? "ON" : "OFF"}
              </div>
              <div className={`px-2 py-1.5 rounded border ${featureFlags?.enableCoupons ? "border-[#10B981]/30 bg-[#10B981]/10 text-white" : "border-[#1E293B] text-[#64748B]"}`}>
                Coupons: {featureFlags?.enableCoupons ? "ON" : "OFF"}
              </div>
              <div className={`px-2 py-1.5 rounded border ${featureFlags?.enableDynamicPricing ? "border-[#10B981]/30 bg-[#10B981]/10 text-white" : "border-[#1E293B] text-[#64748B]"}`}>
                Surge: {featureFlags?.enableDynamicPricing ? "ON" : "OFF"}
              </div>
              <div className={`px-2 py-1.5 rounded border ${featureFlags?.enableAiRecommendations ? "border-[#10B981]/30 bg-[#10B981]/10 text-white" : "border-[#1E293B] text-[#64748B]"}`}>
                AI Recs: {featureFlags?.enableAiRecommendations ? "ON" : "OFF"}
              </div>
            </div>
          </Card>

          {/* Card 6: Customer Terms */}
          <Card className="p-5 bg-[#0B132B]/80 border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#FBBF24]/10 text-[#FBBF24]">
                  <FileText className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-white">Legal Agreements</h3>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setTermsModalOpen(true)}
                className="border-[#2A3445] text-xs text-zinc-300 hover:text-white"
              >
                Configure
              </Button>
            </div>
            <div className="space-y-1.5 text-xs text-[#94A3B8]">
              <div className="line-clamp-2">
                <span className="text-white font-medium">Terms: </span>
                {terms?.bookingTerms || "Tickets once booked cannot be exchanged."}
              </div>
              <div className="line-clamp-2">
                <span className="text-white font-medium">Refund Policy: </span>
                {terms?.refundTerms || "Standard cancellation deductions apply."}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: LOCALIZATION */}
      {activeTab === "localization" && (
        <Card className="p-6 bg-[#0B132B]/80 border-[#1E293B] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#FBBF24]" />
                Localization & Regional Internationalization
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Enforces local currency symbolics, ISO language support, and localized date/time parsing.
              </p>
            </div>
            <Button
              onClick={() => setLocalizationModalOpen(true)}
              className="bg-[#FBBF24] hover:bg-[#F59E0B] text-[#070B12] font-semibold text-xs h-8"
            >
              Edit Localization
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#070B12] border border-[#1E293B] space-y-3">
              <div className="text-xs font-semibold text-[#FBBF24] uppercase tracking-wider">Currency & Timezone</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Transactional Currency:</span>
                  <span className="font-mono font-bold text-white">{localization?.currency || "INR"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Auditorium Timezone:</span>
                  <span className="font-mono text-white">{localization?.timezone || "Asia/Kolkata"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Number Formatting:</span>
                  <span className="font-mono text-white">{localization?.numberFormat || "INDIAN"}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#070B12] border border-[#1E293B] space-y-3">
              <div className="text-xs font-semibold text-[#FBBF24] uppercase tracking-wider">Language & Formats</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Default Interface Language:</span>
                  <span className="font-bold text-white uppercase">{localization?.primaryLanguage || "en"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Supported Languages:</span>
                  <span className="text-white">{(localization?.supportedLanguages || ["en", "hi", "mr"]).join(", ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Date / Time Format:</span>
                  <span className="font-mono text-white">
                    {localization?.dateFormat || "YYYY-MM-DD"} / {localization?.timeFormat || "12H"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: BOOKING RULES */}
      {activeTab === "booking" && (
        <Card className="p-6 bg-[#0B132B]/80 border-[#1E293B] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#FBBF24]" />
                Customer Booking Rules & Ticket Quotas
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Restricts ticket scalping, enforces seat lock expirations, and sets advance ticketing calendars.
              </p>
            </div>
            <Button
              onClick={() => setBookingModalOpen(true)}
              className="bg-[#FBBF24] hover:bg-[#F59E0B] text-[#070B12] font-semibold text-xs h-8"
            >
              Edit Booking Rules
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#070B12] border border-[#1E293B] space-y-1">
              <div className="text-xs text-[#94A3B8]">Max Seats / Booking</div>
              <div className="text-2xl font-bold font-mono text-white">{booking?.maxSeatsPerBooking || 10}</div>
              <div className="text-[11px] text-[#64748B]">Min seats allowed: {booking?.minSeatsPerBooking || 1}</div>
            </div>

            <div className="p-4 rounded-xl bg-[#070B12] border border-[#1E293B] space-y-1">
              <div className="text-xs text-[#94A3B8]">Advance Booking Window</div>
              <div className="text-2xl font-bold font-mono text-white">{booking?.advanceBookingDays || 30} Days</div>
              <div className="text-[11px] text-[#64748B]">Pre-booking horizon for scheduled showtimes</div>
            </div>

            <div className="p-4 rounded-xl bg-[#070B12] border border-[#1E293B] space-y-1">
              <div className="text-xs text-[#94A3B8]">Seat Hold Lock Duration</div>
              <div className="text-2xl font-bold font-mono text-[#FBBF24]">
                {booking?.seatHoldDurationSeconds || 600}s
              </div>
              <div className="text-[11px] text-[#64748B]">
                {Math.floor((booking?.seatHoldDurationSeconds || 600) / 60)} minutes during checkout
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: FINANCIAL (CANCELLATION & REFUNDS) */}
      {activeTab === "financial" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cancellation Rules */}
          <Card className="p-6 bg-[#0B132B]/80 border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-[#EF4444]" />
                  Cancellation Policy
                </h3>
                <p className="text-xs text-[#94A3B8]">Rules for customer-initiated cancellations.</p>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setCancellationModalOpen(true)}
                className="border-[#2A3445] text-zinc-300 hover:text-white"
              >
                Edit Policy
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#070B12] border border-[#1E293B] flex justify-between items-center">
                <span className="text-[#94A3B8]">Cancellation Status:</span>
                <span className={`font-semibold ${cancellation?.cancellationAllowed ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                  {cancellation?.cancellationAllowed ? "ENABLED" : "DISABLED"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#070B12] border border-[#1E293B] flex justify-between items-center">
                <span className="text-[#94A3B8]">Cancellation Deadline:</span>
                <span className="font-mono text-white">{cancellation?.cancellationDeadlineMinutes || 120} mins before show</span>
              </div>
              <div className="p-3 rounded-xl bg-[#070B12] border border-[#1E293B] flex justify-between items-center">
                <span className="text-[#94A3B8]">Standard Fee Deduction:</span>
                <span className="font-mono text-white font-bold">{cancellation?.cancellationFeePercent || "15.00"}%</span>
              </div>
            </div>
          </Card>

          {/* Refund Policy */}
          <Card className="p-6 bg-[#0B132B]/80 border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#10B981]" />
                  Refund Settlements
                </h3>
                <p className="text-xs text-[#94A3B8]">Financial settlement parameters and gateway routing.</p>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setRefundModalOpen(true)}
                className="border-[#2A3445] text-zinc-300 hover:text-white"
              >
                Edit Refunds
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#070B12] border border-[#1E293B] flex justify-between items-center">
                <span className="text-[#94A3B8]">Refund Calculation:</span>
                <span className="font-mono text-white font-bold">{refund?.refundPercentage || "85.00"}% of Ticket Price</span>
              </div>
              <div className="p-3 rounded-xl bg-[#070B12] border border-[#1E293B] flex justify-between items-center">
                <span className="text-[#94A3B8]">Settlement Destination:</span>
                <span className="font-mono text-white">{refund?.refundMethod || "ORIGINAL_PAYMENT"}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#070B12] border border-[#1E293B] flex justify-between items-center">
                <span className="text-[#94A3B8]">Automated Payment Gateway:</span>
                <span className={`font-semibold ${refund?.gatewayAutoRefund ? "text-[#10B981]" : "text-[#94A3B8]"}`}>
                  {refund?.gatewayAutoRefund ? "ACTIVE" : "MANUAL REVIEW"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: COMPLIANCE & LEGAL TERMS */}
      {activeTab === "compliance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Age Restrictions */}
            <Card className="p-6 bg-[#0B132B]/80 border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
                    Age Restrictions & Censor Rating
                  </h3>
                  <p className="text-xs text-[#94A3B8]">Certifications and minor entry protections.</p>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setAgeModalOpen(true)}
                  className="border-[#2A3445] text-zinc-300 hover:text-white"
                >
                  Configure
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#070B12] border border-[#1E293B]">
                  <div className="text-[#94A3B8]">Rating &quot;U&quot; (Universal)</div>
                  <div className="font-mono text-base font-bold text-white mt-1">{ageRestriction?.minAgeU ?? 0}+ Years</div>
                </div>
                <div className="p-3 rounded-xl bg-[#070B12] border border-[#1E293B]">
                  <div className="text-[#94A3B8]">Rating &quot;UA&quot; (Parental Guidance)</div>
                  <div className="font-mono text-base font-bold text-white mt-1">{ageRestriction?.minAgeUA ?? 12}+ Years</div>
                </div>
                <div className="p-3 rounded-xl bg-[#070B12] border border-[#1E293B]">
                  <div className="text-[#94A3B8]">Rating &quot;A&quot; (Adults Only)</div>
                  <div className="font-mono text-base font-bold text-white mt-1">{ageRestriction?.minAgeA ?? 18}+ Years</div>
                </div>
                <div className="p-3 rounded-xl bg-[#070B12] border border-[#1E293B]">
                  <div className="text-[#94A3B8]">Gate Verification ID</div>
                  <div className="text-xs font-semibold text-[#10B981] mt-1.5">
                    {ageRestriction?.requireAgeVerificationAtGate ? "MANDATORY" : "OPTIONAL"}
                  </div>
                </div>
              </div>
            </Card>

            {/* Terms and Conditions */}
            <Card className="p-6 bg-[#0B132B]/80 border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#FBBF24]" />
                    Customer Legal Disclaimers
                  </h3>
                  <p className="text-xs text-[#94A3B8]">Terms displayed on booking confirmation and tickets.</p>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setTermsModalOpen(true)}
                  className="border-[#2A3445] text-zinc-300 hover:text-white"
                >
                  Edit Terms
                </Button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#070B12] border border-[#1E293B]">
                  <div className="font-semibold text-white mb-1">General Booking Terms:</div>
                  <p className="text-[#94A3B8] leading-relaxed">
                    {terms?.bookingTerms || "Tickets once booked cannot be exchanged. Outside food is strictly prohibited."}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#070B12] border border-[#1E293B]">
                  <div className="font-semibold text-white mb-1">Refund Terms:</div>
                  <p className="text-[#94A3B8] leading-relaxed">
                    {terms?.refundTerms || "Standard cancellation deductions apply."}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 6: FEATURE FLAGS */}
      {activeTab === "features" && (
        <Card className="p-6 bg-[#0B132B]/80 border-[#1E293B] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FBBF24]" />
                Commercial Feature Flags & Engine Capabilities
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Enable or disable dynamic pricing algorithms, customer loyalty engines, and promotional checkout widgets per theatre.
              </p>
            </div>
            <Button
              onClick={() => setFeaturesModalOpen(true)}
              className="bg-[#FBBF24] hover:bg-[#F59E0B] text-[#070B12] font-semibold text-xs h-8"
            >
              Toggle Features
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <FeatureToggleBadge enabled={featureFlags?.enableLoyalty ?? true} label="Loyalty Points & Rewards" />
            <FeatureToggleBadge enabled={featureFlags?.enableCoupons ?? true} label="Promo Coupons & Codes" />
            <FeatureToggleBadge enabled={featureFlags?.enableGiftCards ?? true} label="Digital Gift Cards" />
            <FeatureToggleBadge enabled={featureFlags?.enableMemberships ?? false} label="VIP Memberships" />
            <FeatureToggleBadge enabled={featureFlags?.enableDynamicPricing ?? false} label="Demand Dynamic Pricing" />
            <FeatureToggleBadge enabled={featureFlags?.enableAiRecommendations ?? true} label="AI Recommendations" />
            <FeatureToggleBadge enabled={featureFlags?.enableWaitlist ?? false} label="Show Waitlisting" />
          </div>
        </Card>
      )}

      {/* TAB 7: VERSION HISTORY */}
      {activeTab === "versions" && (
        <Card className="p-6 bg-[#0B132B]/80 border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#FBBF24]" />
                Configuration Ledger & Version Snapshots
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Immutable audit trail of published configuration releases. You can rollback to any prior release instantly.
              </p>
            </div>
          </div>

          {versions.length === 0 ? (
            <div className="text-center py-12 text-[#94A3B8] text-xs">
              No configuration versions published yet. Changes will appear here once published.
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((ver) => (
                <div
                  key={ver.id}
                  className="p-4 rounded-xl bg-[#070B12] border border-[#1E293B] flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-[#FBBF24]/30 text-[#FBBF24] font-mono text-xs">
                        v{ver.versionNumber}
                      </Badge>
                      <span className="text-xs font-semibold text-white">
                        {ver.changeSummary || "Configuration snapshot"}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      Published by {ver.changedBy || "System Admin"} ({ver.changedRole || "ADMIN"}) on{" "}
                      {new Date(ver.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleRestore(ver.versionNumber)}
                    className="border-[#2A3445] text-zinc-300 hover:text-white gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Rollback to v{ver.versionNumber}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Modals */}
      <LocalizationConfigModal
        isOpen={localizationModalOpen}
        onClose={() => setLocalizationModalOpen(false)}
        theatreId={theatreId}
        initialData={localization}
        onSave={async (data) => {
          await onUpdateLocalization(data);
          setBundle((prev) => ({
            ...prev,
            localization: prev.localization ? { ...prev.localization, ...data } : null,
          }));
        }}
      />

      <BookingConfigModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        theatreId={theatreId}
        initialData={booking}
        onSave={async (data) => {
          await onUpdateBooking(data);
          setBundle((prev) => ({
            ...prev,
            booking: prev.booking ? { ...prev.booking, ...data } : null,
          }));
        }}
      />

      <CancellationConfigModal
        isOpen={cancellationModalOpen}
        onClose={() => setCancellationModalOpen(false)}
        theatreId={theatreId}
        initialData={cancellation}
        onSave={async (data) => {
          await onUpdateCancellation(data);
          setBundle((prev) => ({
            ...prev,
            cancellation: prev.cancellation ? { ...prev.cancellation, ...data } : null,
          }));
        }}
      />

      <RefundConfigModal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        theatreId={theatreId}
        initialData={refund}
        onSave={async (data) => {
          await onUpdateRefund(data);
          setBundle((prev) => ({
            ...prev,
            refund: prev.refund ? { ...prev.refund, ...data } : null,
          }));
        }}
      />

      <AgeRestrictionModal
        isOpen={ageModalOpen}
        onClose={() => setAgeModalOpen(false)}
        theatreId={theatreId}
        initialData={ageRestriction}
        onSave={async (data) => {
          await onUpdateAgeRestriction(data);
          setBundle((prev) => ({
            ...prev,
            ageRestriction: prev.ageRestriction ? { ...prev.ageRestriction, ...data } : null,
          }));
        }}
      />

      <FeatureFlagsModal
        isOpen={featuresModalOpen}
        onClose={() => setFeaturesModalOpen(false)}
        theatreId={theatreId}
        initialData={featureFlags}
        onSave={async (data) => {
          await onUpdateFeatureFlags(data);
          setBundle((prev) => ({
            ...prev,
            featureFlags: prev.featureFlags ? { ...prev.featureFlags, ...data } : null,
          }));
        }}
      />

      <ConfigurationTermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        theatreId={theatreId}
        initialData={terms}
        onSave={async (data) => {
          await onUpdateTerms(data);
          setBundle((prev) => ({
            ...prev,
            terms: prev.terms ? { ...prev.terms, ...data } : null,
          }));
        }}
      />
    </div>
  );
}
