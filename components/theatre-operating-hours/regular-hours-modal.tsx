"use client";

import React, { useState } from "react";
import { Modal } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import type {
  TheatreOperatingProfileRecord,
  UpsertTheatreOperatingProfileInput,
} from "@/types/theatre-operating-hours.types";

interface RegularHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  theatreId: string;
  profile: TheatreOperatingProfileRecord | null;
  onSave: (input: UpsertTheatreOperatingProfileInput) => Promise<void>;
}

export function RegularHoursModal({
  isOpen,
  onClose,
  theatreId,
  profile,
  onSave,
}: RegularHoursModalProps) {
  const [openingTime, setOpeningTime] = useState(profile?.regularOpeningTime || "09:00");
  const [closingTime, setClosingTime] = useState(profile?.regularClosingTime || "23:30");
  const [timezone, setTimezone] = useState(profile?.timezone || "Asia/Kolkata");
  const [is24x7, setIs24x7] = useState(profile?.is24x7 || false);
  const [lateNightClosing, setLateNightClosing] = useState(profile?.lateNightClosing || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSave({
        theatreId,
        regularOpeningTime: openingTime,
        regularClosingTime: closingTime,
        timezone,
        is24x7,
        lateNightClosing,
        expectedVersion: profile?.version,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update regular hours");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Regular Operating Hours & Timezone"
      description="Set default daily opening and closing hours for box office, gates, and auditoriums."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Regular Opening Time (HH:mm)
            </label>
            <input
              type="time"
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Regular Closing Time (HH:mm)
            </label>
            <input
              type="time"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
            Cinema Regional Timezone (IANA)
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
            <option value="America/New_York">America/New_York (EST - UTC-05:00)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST - UTC-08:00)</option>
            <option value="Europe/London">Europe/London (GMT/BST - UTC+00:00)</option>
            <option value="Europe/Paris">Europe/Paris (CET - UTC+01:00)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST - UTC+04:00)</option>
            <option value="Asia/Singapore">Asia/Singapore (SGT - UTC+08:00)</option>
            <option value="Australia/Sydney">Australia/Sydney (AEST - UTC+10:00)</option>
          </select>
        </div>

        <div className="pt-2 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={lateNightClosing}
              onChange={(e) => setLateNightClosing(e.target.checked)}
              className="w-4 h-4 rounded text-[#FBBF24] bg-[#0F172A] border-[#2A3445]"
            />
            <div>
              <div className="text-xs font-bold text-white">Late Night Closing Buffer</div>
              <div className="text-[11px] text-[#94A3B8]">
                Allows closing past midnight (e.g. 01:00 AM) for extended late shows.
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={is24x7}
              onChange={(e) => setIs24x7(e.target.checked)}
              className="w-4 h-4 rounded text-[#FBBF24] bg-[#0F172A] border-[#2A3445]"
            />
            <div>
              <div className="text-xs font-bold text-white">24x7 Cinema Operations</div>
              <div className="text-[11px] text-[#94A3B8]">
                Auditoriums run continuous non-stop rotations across day and night.
              </div>
            </div>
          </label>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-[#2A3445]">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving Hours..." : "Save Operating Hours"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
