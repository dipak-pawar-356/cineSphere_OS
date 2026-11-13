"use client";

import React, { useState } from "react";
import { Modal } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type {
  AgeRestrictionConfigurationRecord,
  UpdateAgeRestrictionConfigInput,
} from "@/types/theatre-configuration.types";

interface AgeRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  theatreId: string;
  initialData?: AgeRestrictionConfigurationRecord | null;
  onSave: (data: UpdateAgeRestrictionConfigInput) => Promise<void>;
}

export function AgeRestrictionModal({
  isOpen,
  onClose,
  theatreId,
  initialData,
  onSave,
}: AgeRestrictionModalProps) {
  const [minAgeU, setMinAgeU] = useState(initialData?.minAgeU ?? 0);
  const [minAgeUA, setMinAgeUA] = useState(initialData?.minAgeUA ?? 12);
  const [minAgeA, setMinAgeA] = useState(initialData?.minAgeA ?? 18);
  const [minAgeS, setMinAgeS] = useState(initialData?.minAgeS ?? 18);
  const [guardianRequiredUnderAge, setGuardianRequiredUnderAge] = useState<number | "">(
    initialData?.guardianRequiredUnderAge ?? 12
  );
  const [requireAgeVerificationAtGate, setRequireAgeVerificationAtGate] = useState(
    initialData?.requireAgeVerificationAtGate ?? true
  );
  const [customAgeRules, setCustomAgeRules] = useState(initialData?.customAgeRules || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (minAgeU > minAgeUA || minAgeUA > minAgeA) {
      setError("Age classification hierarchy violation: Must satisfy U ≤ UA ≤ A.");
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        theatreId,
        minAgeU: Number(minAgeU),
        minAgeUA: Number(minAgeUA),
        minAgeA: Number(minAgeA),
        minAgeS: Number(minAgeS),
        guardianRequiredUnderAge: guardianRequiredUnderAge === "" ? null : Number(guardianRequiredUnderAge),
        requireAgeVerificationAtGate,
        customAgeRules: customAgeRules.trim() || null,
      });

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update age restrictions");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Censor Rating & Age Restriction Rules"
      description="Configure censor certifications (U, UA, A, S), minimum ages, guardian accompaniment, and gate verification requirements."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-4 gap-2">
          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Rating &quot;U&quot;</label>
            <Input
              type="number"
              min={0}
              max={25}
              value={minAgeU}
              onChange={(e) => setMinAgeU(parseInt(e.target.value) || 0)}
              className="bg-[#070B12] border-[#1E293B] text-white font-mono text-center"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Rating &quot;UA&quot;</label>
            <Input
              type="number"
              min={0}
              max={25}
              value={minAgeUA}
              onChange={(e) => setMinAgeUA(parseInt(e.target.value) || 0)}
              className="bg-[#070B12] border-[#1E293B] text-white font-mono text-center"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Rating &quot;A&quot;</label>
            <Input
              type="number"
              min={0}
              max={25}
              value={minAgeA}
              onChange={(e) => setMinAgeA(parseInt(e.target.value) || 0)}
              className="bg-[#070B12] border-[#1E293B] text-white font-mono text-center"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#94A3B8] font-medium block">Rating &quot;S&quot;</label>
            <Input
              type="number"
              min={0}
              max={25}
              value={minAgeS}
              onChange={(e) => setMinAgeS(parseInt(e.target.value) || 0)}
              className="bg-[#070B12] border-[#1E293B] text-white font-mono text-center"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-[#94A3B8] font-medium block">Guardian Accompaniment Required Below Age</label>
          <Input
            type="number"
            min={0}
            max={18}
            value={guardianRequiredUnderAge}
            onChange={(e) =>
              setGuardianRequiredUnderAge(e.target.value === "" ? "" : parseInt(e.target.value) || 0)
            }
            placeholder="e.g. 12 (leave empty if not applicable)"
            className="bg-[#070B12] border-[#1E293B] text-white font-mono"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#070B12] border border-[#1E293B]">
          <div>
            <div className="text-sm font-semibold text-white">Require Age Verification ID at Gate</div>
            <div className="text-xs text-[#94A3B8]">
              Enforce government photo ID checks by ushers for &apos;A&apos; rated movies.
            </div>
          </div>
          <input
            type="checkbox"
            checked={requireAgeVerificationAtGate}
            onChange={(e) => setRequireAgeVerificationAtGate(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#FBBF24] focus:ring-[#FBBF24]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-[#94A3B8] font-medium block">Custom Age Disclaimers & Notes (Optional)</label>
          <textarea
            value={customAgeRules}
            onChange={(e) => setCustomAgeRules(e.target.value)}
            placeholder="e.g. Children below 3 years are not permitted in 3D/IMAX auditoriums."
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
              "Save Age Restrictions"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
