"use client";

import React, { useState } from "react";
import { Modal } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type {
  ConfigurationTermsRecord,
  UpdateConfigurationTermsInput,
} from "@/types/theatre-configuration.types";

interface ConfigurationTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theatreId: string;
  initialData?: ConfigurationTermsRecord | null;
  onSave: (data: UpdateConfigurationTermsInput) => Promise<void>;
}

export function ConfigurationTermsModal({
  isOpen,
  onClose,
  theatreId,
  initialData,
  onSave,
}: ConfigurationTermsModalProps) {
  const [bookingTerms, setBookingTerms] = useState(
    initialData?.bookingTerms ||
      "Tickets once booked cannot be exchanged. Outside food and beverages are strictly prohibited inside the auditorium."
  );
  const [refundTerms, setRefundTerms] = useState(
    initialData?.refundTerms ||
      "Eligible refunds are calculated after deducting standard statutory cancellation fees and will be credited to original payment method within 5-7 working days."
  );
  const [privacyNotice, setPrivacyNotice] = useState(
    initialData?.privacyNotice ||
      "Customer contact numbers and email addresses are collected solely for dispatching digital M-Tickets and critical booking advisory messages."
  );
  const [customerAgreement, setCustomerAgreement] = useState(
    initialData?.customerAgreement ||
      "By proceeding with this reservation, patron agrees to comply with CineSphere House Rules, audio-video recording bans, and local administrative guidelines."
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
        bookingTerms: bookingTerms.trim(),
        refundTerms: refundTerms.trim(),
        privacyNotice: privacyNotice.trim() || null,
        customerAgreement: customerAgreement.trim(),
      });

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update terms and agreements");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Terms & Legal Agreements"
      description="Maintain legally binding booking conditions, refund caveats, privacy covenants, and terms of service displayed to patrons during checkout."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs text-[#94A3B8] font-medium block">General Booking Terms & Conditions</label>
          <textarea
            value={bookingTerms}
            onChange={(e) => setBookingTerms(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-md bg-[#070B12] border border-[#1E293B] text-white text-xs focus:outline-none focus:border-[#FBBF24]"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-[#94A3B8] font-medium block">Refund & Cancellation Disclaimer</label>
          <textarea
            value={refundTerms}
            onChange={(e) => setRefundTerms(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-md bg-[#070B12] border border-[#1E293B] text-white text-xs focus:outline-none focus:border-[#FBBF24]"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-[#94A3B8] font-medium block">Privacy & Data Advisory</label>
          <textarea
            value={privacyNotice}
            onChange={(e) => setPrivacyNotice(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-md bg-[#070B12] border border-[#1E293B] text-white text-xs focus:outline-none focus:border-[#FBBF24]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-[#94A3B8] font-medium block">Customer Checkout Agreement</label>
          <textarea
            value={customerAgreement}
            onChange={(e) => setCustomerAgreement(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-md bg-[#070B12] border border-[#1E293B] text-white text-xs focus:outline-none focus:border-[#FBBF24]"
            required
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
              "Save Customer Terms"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
