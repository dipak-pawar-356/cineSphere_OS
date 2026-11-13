"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Archive, Shield, Sparkles } from "lucide-react";
import type { TheatreConfigStatus } from "@/types/theatre-configuration.types";

interface ConfigurationStatusBadgeProps {
  status: TheatreConfigStatus;
  size?: "sm" | "default";
}

export function ConfigurationStatusBadge({ status, size = "default" }: ConfigurationStatusBadgeProps) {
  switch (status) {
    case "PUBLISHED":
      return (
        <Badge
          variant="outline"
          className={`bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30 font-semibold flex items-center gap-1.5 ${
            size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          PUBLISHED
        </Badge>
      );
    case "DRAFT":
      return (
        <Badge
          variant="outline"
          className={`bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/30 font-semibold flex items-center gap-1.5 ${
            size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          DRAFT
        </Badge>
      );
    case "ARCHIVED":
      return (
        <Badge
          variant="outline"
          className={`bg-[#64748B]/10 text-[#64748B] border-[#64748B]/30 font-semibold flex items-center gap-1.5 ${
            size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          ARCHIVED
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

interface FeatureToggleBadgeProps {
  enabled: boolean;
  label: string;
}

export function FeatureToggleBadge({ enabled, label }: FeatureToggleBadgeProps) {
  return (
    <div
      className={`px-3 py-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
        enabled
          ? "bg-[#10B981]/10 border-[#10B981]/30 text-white"
          : "bg-[#070B12] border-[#1E293B] text-[#64748B]"
      }`}
    >
      <span className="font-medium">{label}</span>
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          enabled ? "bg-[#10B981] text-[#070B12]" : "bg-[#1E293B] text-[#94A3B8]"
        }`}
      >
        {enabled ? "Active" : "Disabled"}
      </span>
    </div>
  );
}
