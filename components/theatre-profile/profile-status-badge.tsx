"use client";

import React from "react";
import { TheatreCategoryType, TheatreProfileStatus } from "@/types/theatre-profile.types";
import { THEATRE_CATEGORY_LABELS } from "@/lib/validation/theatre-profile.validation";

const PROFILE_STATUS_STYLES: Record<
  TheatreProfileStatus,
  { label: string; classes: string; dot: string }
> = {
  PUBLISHED: {
    label: "Published",
    classes: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    dot: "bg-emerald-400",
  },
  DRAFT: {
    label: "Draft",
    classes: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    dot: "bg-amber-400",
  },
  HIDDEN: {
    label: "Hidden",
    classes: "bg-sky-500/15 text-sky-300 border-sky-500/40",
    dot: "bg-sky-400",
  },
  ARCHIVED: {
    label: "Archived",
    classes: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    dot: "bg-slate-400",
  },
};

export function ProfileStatusBadge({
  status,
  size = "sm",
}: {
  status: TheatreProfileStatus;
  size?: "xs" | "sm";
}) {
  const cfg = PROFILE_STATUS_STYLES[status] || PROFILE_STATUS_STYLES.DRAFT;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-semibold ${
        size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
      } ${cfg.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
      <span>{cfg.label}</span>
    </span>
  );
}

export function TheatreCategoryBadge({
  theatreType,
  customLabel,
}: {
  theatreType: TheatreCategoryType;
  customLabel?: string;
}) {
  const label =
    theatreType === "CUSTOM" && customLabel
      ? customLabel
      : THEATRE_CATEGORY_LABELS[theatreType] || theatreType;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#111827] border border-[#2A3445] text-[11px] font-medium text-[#CBD5E1]">
      {label}
    </span>
  );
}

export function ProfileCompletionMeter({
  score,
  compact = false,
}: {
  score: number;
  compact?: boolean;
}) {
  const safeScore = Math.max(0, Math.min(100, score));
  const tone =
    safeScore >= 90
      ? "bg-emerald-400 text-emerald-300"
      : safeScore >= 60
      ? "bg-[#FBBF24] text-[#FBBF24]"
      : "bg-rose-400 text-rose-300";

  const barColor = tone.split(" ")[0];
  const textColor = tone.split(" ")[1];

  return (
    <div className={compact ? "space-y-1 min-w-[110px]" : "space-y-1.5 w-full"}>
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-[#94A3B8]">Completion</span>
        <span className={`font-bold ${textColor}`}>{safeScore}%</span>
      </div>
      <div
        className="h-2 w-full rounded-full bg-[#070B12] border border-[#2A3445] overflow-hidden"
        role="progressbar"
        aria-valuenow={safeScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Profile completion score ${safeScore} percent`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
}

