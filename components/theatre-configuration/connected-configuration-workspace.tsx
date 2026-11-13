"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { TheatreConfigurationWorkspace } from "./theatre-configuration-workspace";
import {
  getTheatreConfigurationBundleAction,
  updateLocalizationConfigAction,
  updateBookingConfigAction,
  updateCancellationConfigAction,
  updateRefundConfigAction,
  updateAgeRestrictionConfigAction,
  updateFeatureFlagsAction,
  updateConfigurationTermsAction,
  publishTheatreConfigurationAction,
  restoreConfigurationVersionAction,
} from "@/actions/theatre-configuration-actions";
import type {
  TheatreConfigurationBundle,
  UpdateLocalizationConfigInput,
  UpdateBookingConfigInput,
  UpdateCancellationConfigInput,
  UpdateRefundConfigInput,
  UpdateAgeRestrictionConfigInput,
  UpdateFeatureFlagsInput,
  UpdateConfigurationTermsInput,
  PublishTheatreConfigurationInput,
  RestoreConfigurationVersionInput,
} from "@/types/theatre-configuration.types";

interface ConnectedConfigurationWorkspaceProps {
  theatreId: string;
  isSuperAdmin?: boolean;
  initialBundle?: TheatreConfigurationBundle;
}

export function ConnectedConfigurationWorkspace({
  theatreId,
  isSuperAdmin = false,
  initialBundle,
}: ConnectedConfigurationWorkspaceProps) {
  const [loading, setLoading] = useState(!initialBundle);
  const [bundle, setBundle] = useState<TheatreConfigurationBundle | null>(initialBundle || null);
  const [error, setError] = useState<string | null>(null);

  const fetchBundle = useCallback(async () => {
    try {
      const res = await getTheatreConfigurationBundleAction({ theatreId });
      if (res.success && res.data) {
        setBundle(res.data);
      } else if (!res.success) {
        setError(res.error?.message || "Failed to load theatre configuration bundle");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load configuration");
    } finally {
      setLoading(false);
    }
  }, [theatreId]);

  useEffect(() => {
    if (!initialBundle) {
      void fetchBundle();
    }
  }, [fetchBundle, initialBundle]);

  const handleUpdateLocalization = async (data: UpdateLocalizationConfigInput) => {
    const res = await updateLocalizationConfigAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to update localization rules");
    }
    await fetchBundle();
  };

  const handleUpdateBooking = async (data: UpdateBookingConfigInput) => {
    const res = await updateBookingConfigAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to update booking rules");
    }
    await fetchBundle();
  };

  const handleUpdateCancellation = async (data: UpdateCancellationConfigInput) => {
    const res = await updateCancellationConfigAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to update cancellation policies");
    }
    await fetchBundle();
  };

  const handleUpdateRefund = async (data: UpdateRefundConfigInput) => {
    const res = await updateRefundConfigAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to update refund configuration");
    }
    await fetchBundle();
  };

  const handleUpdateAgeRestriction = async (data: UpdateAgeRestrictionConfigInput) => {
    const res = await updateAgeRestrictionConfigAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to update age restriction rules");
    }
    await fetchBundle();
  };

  const handleUpdateFeatureFlags = async (data: UpdateFeatureFlagsInput) => {
    const res = await updateFeatureFlagsAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to update feature flags");
    }
    await fetchBundle();
  };

  const handleUpdateTerms = async (data: UpdateConfigurationTermsInput) => {
    const res = await updateConfigurationTermsAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to update terms & conditions");
    }
    await fetchBundle();
  };

  const handlePublish = async (data: PublishTheatreConfigurationInput) => {
    const res = await publishTheatreConfigurationAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to publish configuration snapshot");
    }
    await fetchBundle();
  };

  const handleRestoreVersion = async (data: RestoreConfigurationVersionInput) => {
    const res = await restoreConfigurationVersionAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to restore prior configuration version");
    }
    await fetchBundle();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-[#94A3B8]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FBBF24] mb-3" />
        <p className="text-sm">Loading dynamic theatre configuration & rules...</p>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="p-6 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Error Loading Configuration</h4>
          <p className="text-xs opacity-90">{error || "No configuration parameters available."}</p>
        </div>
      </div>
    );
  }

  return (
    <TheatreConfigurationWorkspace
      theatreId={theatreId}
      initialBundle={bundle}
      isSuperAdmin={isSuperAdmin}
      onUpdateLocalization={handleUpdateLocalization}
      onUpdateBooking={handleUpdateBooking}
      onUpdateCancellation={handleUpdateCancellation}
      onUpdateRefund={handleUpdateRefund}
      onUpdateAgeRestriction={handleUpdateAgeRestriction}
      onUpdateFeatureFlags={handleUpdateFeatureFlags}
      onUpdateTerms={handleUpdateTerms}
      onPublish={handlePublish}
      onRestoreVersion={handleRestoreVersion}
    />
  );
}
