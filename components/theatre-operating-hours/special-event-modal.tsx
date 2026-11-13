"use client";

import React, { useState } from "react";
import { Modal } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import type {
  AddSpecialOperatingEventInput,
  SpecialOperatingEventType,
} from "@/types/theatre-operating-hours.types";

interface SpecialEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  theatreId: string;
  onSave: (input: AddSpecialOperatingEventInput) => Promise<void>;
}

export function SpecialEventModal({
  isOpen,
  onClose,
  theatreId,
  onSave,
}: SpecialEventModalProps) {
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState<SpecialOperatingEventType>("MOVIE_PREMIERE");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openTime, setOpenTime] = useState("23:00");
  const [closeTime, setCloseTime] = useState("04:00");
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
        eventName,
        eventType,
        startDate,
        endDate: endDate || startDate,
        openTime,
        closeTime,
        notes: notes || null,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save special event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Special Operating Event"
      description="Configure extended operational hours for fan premieres, film festivals, or corporate rentals."
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
            Event Name
          </label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="e.g. Midnight Marvel Premiere, International Film Gala"
            className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
            Event Classification
          </label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value as SpecialOperatingEventType)}
            className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none"
          >
            <option value="MOVIE_PREMIERE">Movie Premiere / Midnight Screening</option>
            <option value="FESTIVAL">Cultural / Film Festival</option>
            <option value="PRIVATE_SHOW">Private Screening Event</option>
            <option value="CORPORATE_BOOKING">Corporate Auditorium Booking</option>
            <option value="CUSTOM">Custom Operating Hours</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Special Open Time
            </label>
            <input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Special Close Time
            </label>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
            Notes & Guidelines
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Red carpet setup, security personnel allocation..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-[#2A3445] text-white text-sm focus:border-[#FBBF24] outline-none resize-none"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-[#2A3445]">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add Special Event"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
