"use client";

import React, { useState } from "react";
import { Modal } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type {
  BookingConfigurationRecord,
  UpdateBookingConfigInput,
} from "@/types/theatre-configuration.types";

interface BookingConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  theatreId: string;
  initialData?: BookingConfigurationRecord | null;
  onSave: (data: UpdateBookingConfigInput) => Promise<void>;
}

export function BookingConfigModal({
  isOpen,
  onClose,
  theatreId,
  initialData,
  onSave,
}: BookingConfigModalProps) {
  const [minSeats, setMinSeats] = useState(initialData?.minSeatsPerBooking ?? 1);
  const [maxSeats, setMaxSeats] = useState(initialData?.maxSeatsPerBooking ?? 10);
  const [advanceDays, setAdvanceDays] = useState(initialData?.advanceBookingDays ?? 30);
  const [cutoffMinutes, setCutoffMinutes] = useState(initialData?.bookingCutoffMinutes ?? 15);
  const [maxConcurrent, setMaxConcurrent] = useState(initialData?.maxConcurrentBookingsPerUser ?? 3);
  const [holdDurationSec, setHoldDurationSec] = useState(initialData?.seatHoldDurationSeconds ?? 600);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (minSeats > maxSeats) {
      setError("Minimum seats cannot exceed maximum seats per booking.");
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        theatreId,
        minSeatsPerBooking: Number(minSeats),
        maxSeatsPerBooking: Number(maxSeats),
        advanceBookingDays: Number(advanceDays),
        bookingCutoffMinutes: Number(cutoffMinutes),
        maxConcurrentBookingsPerUser: Number(maxConcurrent),
        seatHoldDurationSeconds: Number(holdDurationSec),
      });

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update booking rules");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Rules & Quotas"
      description="Enforce ticket limits, seat hold locks, advance booking windows, and gate cutoffs."
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
            <label className="text-xs text-[#94A3B8] font-medium block">Min Seats / Booking</label>
            <Input
              type="number"
              min={1}
              max={10}
              value={minSeats}
              onChange={(e) => setMinSeats(parseInt(e.target.value) || 1)}
              className="bg-[#070B12] border-[#1E293B] text-white font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Max Seats / Booking</label>
            <Input
              type="number"
              min={1}
              max={50}
              value={maxSeats}
              onChange={(e) => setMaxSeats(parseInt(e.target.value) || 10)}
              className="bg-[#070B12] border-[#1E293B] text-white font-mono"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Advance Booking Window (Days)</label>
            <Input
              type="number"
              min={1}
              max={365}
              value={advanceDays}
              onChange={(e) => setAdvanceDays(parseInt(e.target.value) || 30)}
              className="bg-[#070B12] border-[#1E293B] text-white font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Booking Cutoff (Minutes before show)</label>
            <Input
              type="number"
              min={0}
              max={1440}
              value={cutoffMinutes}
              onChange={(e) => setCutoffMinutes(parseInt(e.target.value) || 0)}
              className="bg-[#070B12] border-[#1E293B] text-white font-mono"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Max Concurrent Bookings / User</label>
            <Input
              type="number"
              min={1}
              max={20}
              value={maxConcurrent}
              onChange={(e) => setMaxConcurrent(parseInt(e.target.value) || 3)}
              className="bg-[#070B12] border-[#1E293B] text-white font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Seat Hold Duration (Seconds)</label>
            <Input
              type="number"
              min={30}
              max={3600}
              value={holdDurationSec}
              onChange={(e) => setHoldDurationSec(parseInt(e.target.value) || 600)}
              className="bg-[#070B12] border-[#1E293B] text-white font-mono"
              required
            />
            <span className="text-[10px] text-[#64748B]">e.g. 600s = 10 minutes temporary seat lock</span>
          </div>
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
              "Save Booking Rules"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
