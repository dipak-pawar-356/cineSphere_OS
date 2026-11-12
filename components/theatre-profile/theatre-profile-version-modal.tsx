"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  TheatreProfileRecord,
  TheatreProfileVersionRecord,
} from "@/types/theatre-profile.types";
import { ProfileCompletionMeter } from "./profile-status-badge";
import { CheckCircle2, Circle, History, RotateCcw, X } from "lucide-react";

interface TheatreProfileVersionModalProps {
  isOpen: boolean;
  profile: TheatreProfileRecord | null;
  versions: TheatreProfileVersionRecord[];
  initialTab?: "versions" | "completion";
  onClose: () => void;
  onRollbackVersion?: (
    versionNumber: number
  ) => Promise<{ success: boolean; error?: string }>;
}

export function TheatreProfileVersionModal({
  isOpen,
  profile,
  versions,
  initialTab = "versions",
  onClose,
  onRollbackVersion,
}: TheatreProfileVersionModalProps) {
  const [tab, setTab] = useState<"versions" | "completion">(initialTab);
  const [restoringVersion, setRestoringVersion] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTab(initialTab);
    setFeedback(null);
  }, [isOpen, initialTab]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !profile) return null;

  const handleRestore = async (versionNumber: number) => {
    if (!onRollbackVersion) return;
    setRestoringVersion(versionNumber);
    setFeedback(null);
    try {
      const res = await onRollbackVersion(versionNumber);
      setFeedback(
        res.success
          ? `Restored snapshot pre-v${versionNumber} cleanly as a new forward version.`
          : res.error || "Rollback failed."
      );
    } finally {
      setRestoringVersion(null);
    }
  };

  const checklistItems = [
    {
      label: "Basic Identity & Legal Name",
      done: profile.completionSummary.checklist.hasBasicIdentity,
    },
    {
      label: "Tagline, Short Description & About Narrative",
      done: profile.completionSummary.checklist.hasDescriptions,
    },
    {
      label: "Active Theatre Logo Uploaded (Branding Module)",
      done: profile.completionSummary.checklist.hasLogoUploaded,
    },
    {
      label: "Active Theatre Banner Uploaded (Branding Module)",
      done: profile.completionSummary.checklist.hasBannerUploaded,
    },
    {
      label: "Official Website Configured",
      done: profile.completionSummary.checklist.hasWebsiteConfigured,
    },
    {
      label: "Active Social Media Links Connected",
      done: profile.completionSummary.checklist.hasSocialLinks,
    },
    {
      label: "Supported Languages & Primary Language Set",
      done: profile.completionSummary.checklist.hasLanguagesConfigured,
    },
    {
      label: "Screens Count & Seating Capacity Verified",
      done: profile.completionSummary.checklist.hasCapacitySpecs,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-version-modal-title"
    >
      <div className="w-full max-w-3xl rounded-3xl bg-[#0B1220] border border-[#2A3445] p-6 space-y-5 shadow-2xl my-8">
        <div className="flex items-start justify-between gap-3 border-b border-[#2A3445] pb-3">
          <div>
            <h3 id="profile-version-modal-title" className="text-base font-bold text-white flex items-center gap-2">
              <History className="h-4 w-4 text-[#FBBF24]" />
              <span>{profile.displayName} · Governance & History</span>
            </h3>
            <p className="text-[11px] font-mono text-[#94A3B8] mt-0.5">
              Profile ID: {profile.id} · Current v{profile.version} · Public Slug: /{profile.publicSlug}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile version modal"
            className="text-[#94A3B8] hover:text-white rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Profile history tabs"
          className="flex gap-2 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "versions"}
            onClick={() => setTab("versions")}
            className={`flex-1 py-1.5 px-3 rounded-lg font-medium ${
              tab === "versions"
                ? "bg-[#FBBF24] text-[#070B12] font-bold"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            Version History ({versions.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "completion"}
            onClick={() => setTab("completion")}
            className={`flex-1 py-1.5 px-3 rounded-lg font-medium ${
              tab === "completion"
                ? "bg-[#FBBF24] text-[#070B12] font-bold"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            Completion Score ({profile.completionScore}%)
          </button>
        </div>

        {feedback && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200">
            {feedback}
          </div>
        )}

        {tab === "versions" && (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 text-xs">
            {versions.map((ver) => (
              <div
                key={ver.id}
                className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#FBBF24]">
                      v{ver.versionNumber}
                    </span>
                    <span className="text-[11px] text-[#CBD5E1] font-semibold">
                      {ver.changeSummary || "Profile update"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#64748B]">
                      {new Date(ver.updatedAt).toLocaleString()} · {ver.updatedBy} ({ver.updatedByRole})
                    </span>
                    {onRollbackVersion &&
                      Object.keys(ver.previousValues).length > 0 &&
                      profile.status !== "ARCHIVED" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          disabled={restoringVersion === ver.versionNumber}
                          onClick={() => void handleRestore(ver.versionNumber)}
                          className="border-[#2A3445] gap-1 text-[10px]"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Rollback
                        </Button>
                      )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {ver.updatedFields.map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 rounded bg-[#070B12] border border-[#2A3445] font-mono text-[10px] text-[#38BDF8]"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "completion" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445]">
              <ProfileCompletionMeter score={profile.completionScore} />
              <p className="text-[11px] text-[#94A3B8] mt-2">
                {profile.completionSummary.completedSteps} of{" "}
                {profile.completionSummary.totalSteps} onboarding milestones satisfied across Profile & Branding Studio.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {checklistItems.map((item) => (
                <div
                  key={item.label}
                  className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center gap-2.5"
                >
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-[#64748B] shrink-0" />
                  )}
                  <span className={item.done ? "text-white font-medium" : "text-[#94A3B8]"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

