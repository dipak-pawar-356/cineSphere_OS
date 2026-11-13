"use client";

import React, { useState } from "react";
import { Modal } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import type { AddMaintenanceScheduleInput } from "@/types/theatre-operating-hours.types";

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  theatreId: string;
  onSave: (input: AddMaintenanceScheduleInput) => Promise<void>;
}

export function MaintenanceScheduleModal({
  isOpen,
  onClose,
  theatreId,
  onSave,
}: MaintenanceModalProps) {
  const [maintenanceDate, setMaintenanceDate] = useState("");
  const [startTime, setStartTime] = useState("02:00");
  const [endTime, setEndTime] = useState("06:00");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSave({
        theatreId,
        maintenanceDate,
        startTime,
        endTime,
        affectedHalls: ["ALL"],
        reason,
        status: "SCHEDULED",
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to schedule maintenance");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Technical Maintenance Window"
      description="Plan projector optical alignments, audio tuning, or seat upkeep during non-peak hours."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
            Maintenance Date (YYYY-MM-DD)
          </label>
          <input
            type="date"
            value={maintenanceDate}
            onChange={(e) => setMaintenanceDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Start Time (HH:mm)
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              End Time (HH:mm)
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
            Reason & Technical Description
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Barco 4K Laser Lamp replacement, Dolby Atmos speaker calibration..."
            rows={3}
            className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none resize-none"
            required
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-[#2A3445]">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Scheduling..." : "Schedule Maintenance"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
