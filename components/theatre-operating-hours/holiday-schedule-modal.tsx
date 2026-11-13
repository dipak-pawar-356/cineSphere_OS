"use client";

import React, { useState } from "react";
import { Modal } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import type { AddHolidayScheduleInput } from "@/types/theatre-operating-hours.types";

interface HolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  theatreId: string;
  onSave: (input: AddHolidayScheduleInput) => Promise<void>;
}

export function HolidayScheduleModal({
  isOpen,
  onClose,
  theatreId,
  onSave,
}: HolidayModalProps) {
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [isClosed, setIsClosed] = useState(false);
  const [partialOpenTime, setPartialOpenTime] = useState("10:00");
  const [partialCloseTime, setPartialCloseTime] = useState("23:00");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSave({
        theatreId,
        holidayName,
        holidayDate,
        isClosed,
        partialOpenTime: isClosed ? null : partialOpenTime,
        partialCloseTime: isClosed ? null : partialCloseTime,
        notes: notes || null,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record holiday schedule");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Holiday or Cultural Calendar Event"
      description="Configure festive holiday operating schedules or complete venue closures."
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
            Holiday / Festival Name
          </label>
          <input
            type="text"
            value={holidayName}
            onChange={(e) => setHolidayName(e.target.value)}
            placeholder="e.g. Diwali Festive Weekend, Christmas Eve"
            className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
            Holiday Date (YYYY-MM-DD)
          </label>
          <input
            type="date"
            value={holidayDate}
            onChange={(e) => setHolidayDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none"
            required
          />
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer py-1">
            <input
              type="checkbox"
              checked={isClosed}
              onChange={(e) => setIsClosed(e.target.checked)}
              className="w-4 h-4 rounded text-[#FBBF24] bg-[#0F172A] border-[#2A3445]"
            />
            <div>
              <div className="text-xs font-bold text-white">Full Venue Closure</div>
              <div className="text-[11px] text-[#94A3B8]">
                All screens, concessions, and ticket desks closed all day.
              </div>
            </div>
          </label>
        </div>

        {!isClosed && (
          <div className="grid grid-cols-2 gap-4 p-3 rounded-2xl bg-[#070B12] border border-[#2A3445]">
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                Partial Open Time
              </label>
              <input
                type="time"
                value={partialOpenTime}
                onChange={(e) => setPartialOpenTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                Partial Close Time
              </label>
              <input
                type="time"
                value={partialCloseTime}
                onChange={(e) => setPartialCloseTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
            Operational Remarks
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special staffing notes, cleaning rotations, or parking protocols..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none resize-none"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-[#2A3445]">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Holiday"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
