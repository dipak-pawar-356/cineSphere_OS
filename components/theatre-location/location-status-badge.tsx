"use client";

import React from "react";
import {
  TheatreCoordinateSource,
  TheatreLocationStatus,
  TheatreLocationVerificationStatus,
} from "@/types/theatre-location.types";

const LOCATION_STATUS_STYLES: Record<
  TheatreLocationStatus,
  { label: string; classes: string; dot: string }
> = {
  PUBLISHED: {
    label: "Published",
    classes: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    dot: "bg-emerald-400",
  },
  VERIFIED: {
    label: "Verified",
    classes: "bg-teal-500/15 text-teal-300 border-teal-500/40",
    dot: "bg-teal-400",
  },
  DRAFT: {
    label: "Draft",
    classes: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    dot: "bg-amber-400",
  },
  ARCHIVED: {
    label: "Archived",
    classes: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    dot: "bg-slate-400",
  },
};

const VERIFICATION_STATUS_STYLES: Record<
  TheatreLocationVerificationStatus,
  { label: string; classes: string; dot: string }
> = {
  VERIFIED: {
    label: "Verified Premises",
    classes: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    dot: "bg-emerald-400",
  },
  PENDING_REVIEW: {
    label: "Review Pending",
    classes: "bg-indigo-500/15 text-indigo-300 border-indigo-500/40",
    dot: "bg-indigo-400",
  },
  UNVERIFIED: {
    label: "Unverified",
    classes: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    dot: "bg-amber-400",
  },
  REJECTED: {
    label: "Rejected",
    classes: "bg-rose-500/15 text-rose-300 border-rose-500/40",
    dot: "bg-rose-400",
  },
};

export function LocationStatusBadge({
  status,
  size = "sm",
}: {
  status: TheatreLocationStatus;
  size?: "xs" | "sm";
}) {
  const cfg = LOCATION_STATUS_STYLES[status] || LOCATION_STATUS_STYLES.DRAFT;
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

export function LocationVerificationBadge({
  status,
  size = "sm",
}: {
  status: TheatreLocationVerificationStatus;
  size?: "xs" | "sm";
}) {
  const cfg = VERIFICATION_STATUS_STYLES[status] || VERIFICATION_STATUS_STYLES.UNVERIFIED;
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

export function CoordinateSourceBadge({
  source,
}: {
  source: TheatreCoordinateSource;
}) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#1F2937] border border-[#374151] text-[#9CA3AF]">
      {source}
    </span>
  );
}
