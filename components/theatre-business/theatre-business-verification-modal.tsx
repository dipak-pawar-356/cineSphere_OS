"use client";

import React, { useState } from "react";
import { X, ShieldCheck, AlertCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  VerifyTheatreBusinessProfileInput,
  BusinessComplianceStatus,
} from "@/types/theatre-business.types";

interface TheatreBusinessVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VerifyTheatreBusinessProfileInput) => Promise<void>;
  theatreId: string;
  currentStatus: BusinessComplianceStatus;
}

export function TheatreBusinessVerificationModal({
  isOpen,
  onClose,
  onSubmit,
  theatreId,
  currentStatus,
}: TheatreBusinessVerificationModalProps) {
  const [verificationStatus, setVerificationStatus] = useState<BusinessComplianceStatus>(
    currentStatus === "VERIFIED" ? "VERIFIED" : "VERIFIED"
  );
  const [riskScore, setRiskScore] = useState("LOW");
  const [verificationRemarks, setVerificationRemarks] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const payload: VerifyTheatreBusinessProfileInput = {
        theatreId,
        verificationStatus,
        riskScore,
        verificationRemarks: verificationRemarks.trim() || null,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record verification decision";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 text-zinc-100">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-zinc-100">Super Admin Compliance Decision</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="my-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <span>
              This decision immediately updates the theatre&apos;s legal standing across CineSphere OS,
              authorizing ticket tax settlement and invoice generation.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Compliance Verification Status</label>
            <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value as BusinessComplianceStatus)}
              className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="VERIFIED">VERIFIED (Full Regulatory Compliance Approved)</option>
              <option value="PENDING_VERIFICATION">PENDING_VERIFICATION (Under Legal Review)</option>
              <option value="REJECTED">REJECTED (Non-Compliant or Invalid Credentials)</option>
              <option value="DRAFT">DRAFT (Returned to Theatre Admin for Resubmission)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Assessed Entity Risk Score</label>
            <select
              value={riskScore}
              onChange={(e) => setRiskScore(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="LOW">LOW Risk (Official MCA & GST Match Verified)</option>
              <option value="MEDIUM">MEDIUM Risk (Requires Periodic Periodic Re-Audit)</option>
              <option value="HIGH">HIGH Risk (Pending Document Irregularity Notice)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">
              Audit Remarks & Reason <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={verificationRemarks}
              onChange={(e) => setVerificationRemarks(e.target.value)}
              rows={3}
              placeholder="e.g. Verified against official ROC corporate registry and GST portal. All documentation confirmed..."
              className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={`${
                verificationStatus === "REJECTED"
                  ? "bg-rose-600 hover:bg-rose-500"
                  : "bg-emerald-600 hover:bg-emerald-500"
              } text-white`}
            >
              {loading ? "Recording Decision..." : "Commit Decision"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
