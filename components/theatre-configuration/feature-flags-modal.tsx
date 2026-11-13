"use client";

import React, { useState } from "react";
import { Modal } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import { Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import type {
  FeatureFlagConfigurationRecord,
  UpdateFeatureFlagsInput,
} from "@/types/theatre-configuration.types";

interface FeatureFlagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theatreId: string;
  initialData?: FeatureFlagConfigurationRecord | null;
  onSave: (data: UpdateFeatureFlagsInput) => Promise<void>;
}

export function FeatureFlagsModal({
  isOpen,
  onClose,
  theatreId,
  initialData,
  onSave,
}: FeatureFlagsModalProps) {
  const [enableLoyalty, setEnableLoyalty] = useState(initialData?.enableLoyalty ?? true);
  const [enableCoupons, setEnableCoupons] = useState(initialData?.enableCoupons ?? true);
  const [enableGiftCards, setEnableGiftCards] = useState(initialData?.enableGiftCards ?? true);
  const [enableMemberships, setEnableMemberships] = useState(initialData?.enableMemberships ?? false);
  const [enableDynamicPricing, setEnableDynamicPricing] = useState(
    initialData?.enableDynamicPricing ?? false
  );
  const [enableAiRecommendations, setEnableAiRecommendations] = useState(
    initialData?.enableAiRecommendations ?? true
  );
  const [enableWaitlist, setEnableWaitlist] = useState(initialData?.enableWaitlist ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await onSave({
        theatreId,
        enableLoyalty,
        enableCoupons,
        enableGiftCards,
        enableMemberships,
        enableDynamicPricing,
        enableAiRecommendations,
        enableWaitlist,
      });

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update feature flags");
    } finally {
      setSubmitting(false);
    }
  };

  const flags = [
    {
      id: "loyalty",
      name: "Loyalty Points & Rewards",
      desc: "Allow customers to earn and redeem CineSphere loyalty coins.",
      value: enableLoyalty,
      setter: setEnableLoyalty,
    },
    {
      id: "coupons",
      name: "Promo Codes & Discount Coupons",
      desc: "Enable checkout coupon code redemption input.",
      value: enableCoupons,
      setter: setEnableCoupons,
    },
    {
      id: "giftCards",
      name: "Digital Gift Cards",
      desc: "Support electronic gift card purchases and redemptions.",
      value: enableGiftCards,
      setter: setEnableGiftCards,
    },
    {
      id: "memberships",
      name: "VIP Memberships & Subscriptions",
      desc: "Offer tiered recurring patron membership perks.",
      value: enableMemberships,
      setter: setEnableMemberships,
    },
    {
      id: "dynamicPricing",
      name: "Demand-Based Dynamic Pricing",
      desc: "Surge pricing automation based on real-time occupancy and booking velocity.",
      value: enableDynamicPricing,
      setter: setEnableDynamicPricing,
    },
    {
      id: "aiRecs",
      name: "AI Personalized Recommendations",
      desc: "Display predictive movie and snack combo recommendations.",
      value: enableAiRecommendations,
      setter: setEnableAiRecommendations,
    },
    {
      id: "waitlist",
      name: "Sold-Out Show Waitlisting",
      desc: "Allow customers to queue for cancelled seat notifications.",
      value: enableWaitlist,
      setter: setEnableWaitlist,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Feature Flags & Capabilities"
      description="Toggle commercial modules, algorithmic pricing, loyalty programs, and promotional engines without redeploying code."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs">
            {error}
          </div>
        )}

        <div className="space-y-2">
          {flags.map((flag) => (
            <div
              key={flag.id}
              onClick={() => flag.setter(!flag.value)}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                flag.value
                  ? "bg-[#10B981]/10 border-[#10B981]/30 text-white"
                  : "bg-[#070B12] border-[#1E293B] text-[#94A3B8] hover:border-[#2A3445]"
              }`}
            >
              <div className="pr-4">
                <div className="text-sm font-semibold text-white">{flag.name}</div>
                <div className="text-xs opacity-80">{flag.desc}</div>
              </div>
              <div>
                {flag.value ? (
                  <ToggleRight className="w-6 h-6 text-[#10B981] flex-shrink-0" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-[#64748B] flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
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
              "Save Feature Flags"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
