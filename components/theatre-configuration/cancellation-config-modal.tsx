"use client";

import React, { useState } from "react";
import { Modal } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type {
  CancellationConfigurationRecord,
  UpdateCancellationConfigInput,
} from "@/types/theatre-configuration.types";

interface CancellationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  theatreId: string;
  initialData?: CancellationConfigurationRecord | null;
  onSave: (data: UpdateCancellationConfigInput) => Promise<void>;
}

export function CancellationConfigModal({
  isOpen,
  onClose,
  theatreId,
  initialData,
  onSave,
}: CancellationConfigModalProps) {
  const [cancellationAllowed, setCancellationAllowed] = useState(
    initialData?.cancellationAllowed ?? true
  );
  const [cancellationDeadlineMinutes, setCancellationDeadlineMinutes] = useState(
    initialData?.cancellationDeadlineMinutes ?? 120
  );
  const [cancellationFeePercent, setCancellationFeePercent] = useState(
    initialData?.cancellationFeePercent ?? "15.00"
  );
  const [autoCancellationEnabled, setAutoCancellationEnabled] = useState(
    initialData?.autoCancellationEnabled ?? true
  );
  const [autoCancellationTimeoutMinutes, setAutoCancellationTimeoutMinutes] = useState(
    initialData?.autoCancellationTimeoutMinutes ?? 15
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await onSave({
        theatreId,
        cancellationAllowed,
        cancellationDeadlineMinutes: Number(cancellationDeadlineMinutes),
        cancellationFeePercent: String(cancellationFeePercent),
        autoCancellationEnabled,
        autoCancellationTimeoutMinutes: autoCancellationEnabled
          ? Number(autoCancellationTimeoutMinutes)
          : null,
        notes: notes.trim() || null,
      });

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update cancellation policies");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancellation Rules & Penalties"
      description="Define customer cancellation permissions, notice deadlines, fee rates, and hold timeouts."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#070B12] border border-[#1E293B]">
          <div>
            <div className="text-sm font-semibold text-white">Allow Customer Ticket Cancellations</div>
            <div className="text-xs text-[#94A3B8]">
              Permit patrons to initiate self-service cancellations before showtime.
            </div>
          </div>
          <input
            type="checkbox"
            checked={cancellationAllowed}
            onChange={(e) => setCancellationAllowed(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#FBBF24] focus:ring-[#FBBF24]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Notice Deadline (Mins before show)</label>
            <Input
              type="number"
              min={0}
              max={10080}
              value={cancellationDeadlineMinutes}
              onChange={(e) => setCancellationDeadlineMinutes(parseInt(e.target.value) || 0)}
              disabled={!cancellationAllowed}
              className="bg-[#070B12] border-[#1E293B] text-white font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Cancellation Fee (%)</label>
            <Input
              type="number"
              step="0.01"
              min={0}
              max={100}
              value={cancellationFeePercent}
              onChange={(e) => setCancellationFeePercent(e.target.value)}
              disabled={!cancellationAllowed}
              className="bg-[#070B12] border-[#1E293B] text-white font-mono"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#070B12] border border-[#1E293B]">
          <div>
            <div className="text-sm font-semibold text-white">Unpaid Hold Auto-Cancellation</div>
            <div className="text-xs text-[#94A3B8]">
              Release unpaid reservation holds back to seat inventory.
            </div>
          </div>
          <input
            type="checkbox"
            checked={autoCancellationEnabled}
            onChange={(e) => setAutoCancellationEnabled(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#FBBF24] focus:ring-[#FBBF24]"
          />
        </div>

        {autoCancellationEnabled && (
          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Hold Timeout (Minutes)</label>
            <Input
              type="number"
              min={1}
              max={120}
              value={autoCancellationTimeoutMinutes}
              onChange={(e) => setAutoCancellationTimeoutMinutes(parseInt(e.target.value) || 15)}
              className="bg-[#070B12] border-[#1E293B] text-white font-mono"
              required
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs text-[#94A3B8] font-medium block">Cancellation Policy Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Convenience fees are non-refundable under all circumstances."
            rows={2}
            className="w-full px-3 py-2 rounded-md bg-[#070B12] border border-[#1E293B] text-white text-xs focus:outline-none focus:border-[#FBBF24]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#1E293B]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="border-[#2A3445] text-zinc-300 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-[#FBBF24] hover:bg-[#F59E0B] text-[#070B12] font-semibold"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              "Save Cancellation Policy"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
