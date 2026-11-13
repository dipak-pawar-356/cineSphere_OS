"use client";

import React, { useState } from "react";
import { Modal } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type {
  RefundConfigurationRecord,
  UpdateRefundConfigInput,
  ConfigRefundMethod,
} from "@/types/theatre-configuration.types";

interface RefundConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  theatreId: string;
  initialData?: RefundConfigurationRecord | null;
  onSave: (data: UpdateRefundConfigInput) => Promise<void>;
}

export function RefundConfigModal({
  isOpen,
  onClose,
  theatreId,
  initialData,
  onSave,
}: RefundConfigModalProps) {
  const [refundWindowHours, setRefundWindowHours] = useState(
    initialData?.refundWindowHours ?? 24
  );
  const [refundPercentage, setRefundPercentage] = useState(
    initialData?.refundPercentage ?? "85.00"
  );
  const [refundMethod, setRefundMethod] = useState<ConfigRefundMethod>(
    initialData?.refundMethod ?? "ORIGINAL_PAYMENT"
  );
  const [processingTimeDays, setProcessingTimeDays] = useState(
    initialData?.processingTimeDays ?? 5
  );
  const [gatewayAutoRefund, setGatewayAutoRefund] = useState(
    initialData?.gatewayAutoRefund ?? true
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await onSave({
        theatreId,
        refundWindowHours: Number(refundWindowHours),
        refundPercentage: String(refundPercentage),
        refundMethod,
        processingTimeDays: Number(processingTimeDays),
        gatewayAutoRefund,
      });

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update refund configuration");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Refund Processing & Gateway Rules"
      description="Configure settlement methods, refund eligibility windows, processing turnaround times, and automated gateway refunds."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Refund Window (Hours before show)</label>
            <Input
              type="number"
              min={1}
              max={720}
              value={refundWindowHours}
              onChange={(e) => setRefundWindowHours(parseInt(e.target.value) || 1)}
              className="bg-[#070B12] border-[#1E293B] text-white font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Eligible Refund Payout (%)</label>
            <Input
              type="number"
              step="0.01"
              min={0}
              max={100}
              value={refundPercentage}
              onChange={(e) => setRefundPercentage(e.target.value)}
              className="bg-[#070B12] border-[#1E293B] text-white font-mono"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Payout Destination</label>
            <select
              value={refundMethod}
              onChange={(e) => setRefundMethod(e.target.value as ConfigRefundMethod)}
              className="w-full h-10 px-3 rounded-md bg-[#070B12] border border-[#1E293B] text-white text-sm focus:outline-none focus:border-[#FBBF24]"
            >
              <option value="ORIGINAL_PAYMENT">Original Payment Source</option>
              <option value="WALLET">CineSphere In-App Wallet</option>
              <option value="STORE_CREDIT">Store Credit Voucher</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Est. Processing Time (Days)</label>
            <Input
              type="number"
              min={0}
              max={30}
              value={processingTimeDays}
              onChange={(e) => setProcessingTimeDays(parseInt(e.target.value) || 0)}
              className="bg-[#070B12] border-[#1E293B] text-white font-mono"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#070B12] border border-[#1E293B]">
          <div>
            <div className="text-sm font-semibold text-white">Automated Payment Gateway Refund</div>
            <div className="text-xs text-[#94A3B8]">
              Directly trigger Razorpay/Stripe API reversal without manual finance team intervention.
            </div>
          </div>
          <input
            type="checkbox"
            checked={gatewayAutoRefund}
            onChange={(e) => setGatewayAutoRefund(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#FBBF24] focus:ring-[#FBBF24]"
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
              "Save Refund Rules"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
