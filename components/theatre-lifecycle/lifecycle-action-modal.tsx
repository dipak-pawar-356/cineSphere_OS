"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PauseCircle,
  Archive,
  RotateCcw,
  Trash2,
  X,
  MessageSquare,
} from "lucide-react";

export type LifecycleModalActionType =
  | "APPROVE"
  | "REJECT"
  | "REQUEST_REVISION"
  | "SUSPEND"
  | "ARCHIVE"
  | "RESTORE"
  | "SOFT_DELETE";

interface LifecycleActionModalProps {
  isOpen: boolean;
  actionType: LifecycleModalActionType | null;
  theatreName: string;
  onClose: () => void;
  onConfirm: (payload: { reason?: string; endTimePlaceholder?: string }) => Promise<void>;
  isSubmitting?: boolean;
}

const ACTION_CONFIG: Record<
  LifecycleModalActionType,
  {
    title: string;
    description: string;
    requireReason: boolean;
    reasonLabel: string;
    placeholder: string;
    confirmLabel: string;
    tone: "emerald" | "rose" | "amber" | "slate";
    showEndTime?: boolean;
  }
> = {
  APPROVE: {
    title: "Approve Cinema Application",
    description:
      "Approving grants exhibition license readiness. You may then activate the theatre for live bookings and payments.",
    requireReason: false,
    reasonLabel: "Approval Notes (Optional)",
    placeholder: "e.g. Verified GSTIN, Fire NOC & DCI projection clearance...",
    confirmLabel: "Confirm Approval",
    tone: "emerald",
  },
  REJECT: {
    title: "Reject Theatre Application",
    description:
      "Rejecting returns the property to DRAFT state with a formal compliance notice recorded in approval history.",
    requireReason: true,
    reasonLabel: "Mandatory Rejection Reason",
    placeholder: "e.g. Fire NOC expired or bank settlement verification failed...",
    confirmLabel: "Confirm Rejection",
    tone: "rose",
  },
  REQUEST_REVISION: {
    title: "Request Compliance Revision",
    description:
      "Returns the theatre application to DRAFT so the operator can address missing documentation or configuration.",
    requireReason: true,
    reasonLabel: "Mandatory Revision Instructions",
    placeholder: "e.g. Please attach updated state exhibition tax registration...",
    confirmLabel: "Send Revision Request",
    tone: "amber",
  },
  SUSPEND: {
    title: "Suspend Theatre Operations",
    description:
      "Suspending immediately locks new bookings, show creation, and payment processing while keeping historical reports accessible.",
    requireReason: true,
    reasonLabel: "Mandatory Suspension Reason",
    placeholder: "e.g. Temporary municipal safety audit or HVAC maintenance lockout...",
    confirmLabel: "Suspend Complex",
    tone: "rose",
    showEndTime: true,
  },
  ARCHIVE: {
    title: "Archive Theatre (Read-Only)",
    description:
      "Archiving preserves historical financial & booking ledgers in a strict read-only state.",
    requireReason: false,
    reasonLabel: "Archival Note (Optional)",
    placeholder: "e.g. Lease term completed; retained for statutory GST audits...",
    confirmLabel: "Confirm Archive",
    tone: "slate",
  },
  RESTORE: {
    title: "Restore Archived Theatre",
    description:
      "Restores the theatre out of read-only archival storage so operations can be configured or resumed.",
    requireReason: false,
    reasonLabel: "Restoration Note (Optional)",
    placeholder: "e.g. Lease renewed for FY 2027...",
    confirmLabel: "Restore Property",
    tone: "emerald",
  },
  SOFT_DELETE: {
    title: "Soft Delete Theatre",
    description:
      "Soft delete tombstones this property from active operations while preserving immutable audit history. Active theatres must be suspended or archived first.",
    requireReason: true,
    reasonLabel: "Mandatory Compliance Delete Reason",
    placeholder: "e.g. Multiplex permanently closed and decommissioned...",
    confirmLabel: "Confirm Soft Delete",
    tone: "rose",
  },
};

export function LifecycleActionModal({
  isOpen,
  actionType,
  theatreName,
  onClose,
  onConfirm,
  isSubmitting = false,
}: LifecycleActionModalProps) {
  const [reason, setReason] = useState("");
  const [endTimePlaceholder, setEndTimePlaceholder] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setEndTimePlaceholder("");
      setError(null);
    }
  }, [isOpen, actionType]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !actionType) return null;

  const cfg = ACTION_CONFIG[actionType];

  const renderIcon = () => {
    switch (actionType) {
      case "APPROVE":
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case "REJECT":
        return <XCircle className="h-5 w-5 text-rose-500" />;
      case "REQUEST_REVISION":
        return <MessageSquare className="h-5 w-5 text-amber-400" />;
      case "SUSPEND":
        return <PauseCircle className="h-5 w-5 text-rose-400" />;
      case "ARCHIVE":
        return <Archive className="h-5 w-5 text-[#94A3B8]" />;
      case "RESTORE":
        return <RotateCcw className="h-5 w-5 text-emerald-400" />;
      case "SOFT_DELETE":
        return <Trash2 className="h-5 w-5 text-rose-500" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cfg.requireReason && reason.trim().length < 5) {
      setError("Please enter at least 5 characters explaining this governance action.");
      return;
    }
    setError(null);
    await onConfirm({
      reason: reason.trim() || undefined,
      endTimePlaceholder: endTimePlaceholder.trim() || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lifecycle-action-modal-title"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-[#0B1220] border border-[#2A3445] p-6 space-y-5 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
          <h3
            id="lifecycle-action-modal-title"
            className="text-base font-bold text-white flex items-center gap-2"
          >
            {renderIcon()}
            <span>{cfg.title}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close lifecycle action dialog"
            className="text-[#94A3B8] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#FBBF24] rounded-lg p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          <div className="text-[#94A3B8] text-[10px] uppercase font-bold">Target Theatre</div>
          <div className="text-white font-semibold mt-0.5">{theatreName}</div>
        </div>

        <p className="text-xs text-[#94A3B8] leading-relaxed">{cfg.description}</p>

        <div className="space-y-2">
          <label
            htmlFor="lifecycle-reason-input"
            className="block text-xs font-semibold text-white"
          >
            {cfg.reasonLabel}
          </label>
          <textarea
            id="lifecycle-reason-input"
            rows={3}
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={cfg.placeholder}
            className="w-full p-3 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
          />
        </div>

        {cfg.showEndTime && (
          <div className="space-y-1.5">
            <label
              htmlFor="suspension-end-time"
              className="block text-xs font-semibold text-white"
            >
              Scheduled Resume / End Time Placeholder (Optional)
            </label>
            <input
              id="suspension-end-time"
              type="datetime-local"
              value={endTimePlaceholder}
              onChange={(e) => setEndTimePlaceholder(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white focus:outline-none focus:border-[#FBBF24]"
            />
          </div>
        )}

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-[#2A3445] text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            className={`text-xs font-bold border-0 ${
              cfg.tone === "rose"
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : cfg.tone === "emerald"
                ? "bg-emerald-500 hover:bg-emerald-600 text-black"
                : cfg.tone === "amber"
                ? "bg-[#FBBF24] hover:bg-amber-400 text-black"
                : "bg-slate-600 hover:bg-slate-700 text-white"
            }`}
          >
            {isSubmitting ? "Processing..." : cfg.confirmLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}

