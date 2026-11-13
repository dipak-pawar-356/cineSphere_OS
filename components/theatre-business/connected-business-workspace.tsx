"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { TheatreBusinessWorkspace } from "./theatre-business-workspace";
import {
  getTheatreBusinessBundleAction,
  updateTheatreBusinessProfileAction,
  updateTheatreTaxConfigurationAction,
  updateTheatreInvoiceConfigurationAction,
  verifyTheatreBusinessProfileAction,
  addTheatreBusinessDocumentAction,
  deleteTheatreBusinessDocumentAction,
} from "@/actions/theatre-business-actions";
import type {
  TheatreBusinessBundle,
  UpdateTheatreBusinessProfileInput,
  UpdateTheatreTaxConfigurationInput,
  UpdateTheatreInvoiceConfigurationInput,
  VerifyTheatreBusinessProfileInput,
  AddTheatreBusinessDocumentInput,
} from "@/types/theatre-business.types";

interface ConnectedBusinessWorkspaceProps {
  theatreId: string;
  isSuperAdmin?: boolean;
  initialBundle?: TheatreBusinessBundle;
}

export function ConnectedBusinessWorkspace({
  theatreId,
  isSuperAdmin = true,
  initialBundle,
}: ConnectedBusinessWorkspaceProps) {
  const [loading, setLoading] = useState(!initialBundle);
  const [bundle, setBundle] = useState<TheatreBusinessBundle | null>(initialBundle || null);
  const [error, setError] = useState<string | null>(null);

  const fetchBundle = useCallback(async () => {
    try {
      const res = await getTheatreBusinessBundleAction({ theatreId });
      if (res.success && res.data) {
        setBundle(res.data);
      } else if (!res.success) {
        setError(res.error?.message || "Failed to load theatre business profile");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load business profile");
    } finally {
      setLoading(false);
    }
  }, [theatreId]);

  useEffect(() => {
    if (!initialBundle) {
      void fetchBundle();
    }
  }, [fetchBundle, initialBundle]);

  const handleUpdateProfile = async (data: UpdateTheatreBusinessProfileInput) => {
    const res = await updateTheatreBusinessProfileAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to update business profile");
    }
    await fetchBundle();
  };

  const handleUpdateTaxConfig = async (data: UpdateTheatreTaxConfigurationInput) => {
    const res = await updateTheatreTaxConfigurationAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to update tax configuration");
    }
    await fetchBundle();
  };

  const handleUpdateInvoiceConfig = async (data: UpdateTheatreInvoiceConfigurationInput) => {
    const res = await updateTheatreInvoiceConfigurationAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to update invoice configuration");
    }
    await fetchBundle();
  };

  const handleVerifyProfile = async (data: VerifyTheatreBusinessProfileInput) => {
    const res = await verifyTheatreBusinessProfileAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to record compliance decision");
    }
    await fetchBundle();
  };

  const handleAddDocument = async (data: AddTheatreBusinessDocumentInput) => {
    const res = await addTheatreBusinessDocumentAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to attach document");
    }
    await fetchBundle();
  };

  const handleDeleteDocument = async (documentId: string) => {
    const res = await deleteTheatreBusinessDocumentAction({ theatreId, documentId });
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to delete document");
    }
    await fetchBundle();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        <p className="text-sm text-zinc-400 font-medium">Loading theatre business & legal credentials...</p>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-400" />
        <div className="space-y-1">
          <h3 className="text-sm font-bold">Failed to load Business Profile</h3>
          <p className="text-xs text-rose-200">{error || "Business profile data could not be retrieved."}</p>
        </div>
      </div>
    );
  }

  return (
    <TheatreBusinessWorkspace
      theatreId={theatreId}
      initialBundle={bundle}
      isSuperAdmin={isSuperAdmin}
      onUpdateProfile={handleUpdateProfile}
      onUpdateTaxConfig={handleUpdateTaxConfig}
      onUpdateInvoiceConfig={handleUpdateInvoiceConfig}
      onVerifyProfile={handleVerifyProfile}
      onAddDocument={handleAddDocument}
      onDeleteDocument={handleDeleteDocument}
    />
  );
}
