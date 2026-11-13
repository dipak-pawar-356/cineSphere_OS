"use client";

import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { TheatreContactDirectoryWorkspace } from "./theatre-contact-directory-workspace";
import {
  createTheatreContactAction,
  updateTheatreContactAction,
  deleteTheatreContactAction,
  archiveTheatreContactAction,
  updateTheatreWebsiteAction,
  updateTheatreContactSocialLinksAction,
  reorderTheatreContactsAction,
  getTheatreContactBundleAction,
} from "@/actions/theatre-contact-actions";
import type {
  TheatreContactWithDetails,
  TheatreContactDirectoryBundle,
  CreateTheatreContactInput,
  UpdateTheatreContactInput,
  UpdateTheatreWebsiteInput,
  UpdateTheatreContactSocialLinksInput,
} from "@/types/theatre-contact.types";

interface ConnectedContactWorkspaceProps {
  theatreId: string;
  theatreName?: string;
  isSuperAdmin?: boolean;
  initialBundle?: TheatreContactDirectoryBundle;
}

export function ConnectedContactWorkspace({
  theatreId,
  theatreName = "Cinema Complex",
  isSuperAdmin = false,
  initialBundle,
}: ConnectedContactWorkspaceProps) {
  const [loading, setLoading] = useState(!initialBundle);
  const [contacts, setContacts] = useState<TheatreContactWithDetails[]>(
    initialBundle?.contacts || []
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const bundleRes = await getTheatreContactBundleAction({ theatreId });
        if (bundleRes.success && bundleRes.data && mounted) {
          setContacts(bundleRes.data.contacts);
        } else if (!bundleRes.success && mounted) {
          setError(bundleRes.error?.message || "Failed to load theatre contact directory");
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load contact directory");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (!initialBundle) {
      load();
    }
    return () => {
      mounted = false;
    };
  }, [theatreId, initialBundle]);

  const handleCreateContact = async (data: CreateTheatreContactInput) => {
    const res = await createTheatreContactAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to create contact");
    }
    return res.data;
  };

  const handleUpdateContact = async (data: UpdateTheatreContactInput) => {
    const res = await updateTheatreContactAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to update contact");
    }
    return res.data;
  };

  const handleDeleteContact = async (contactId: string, thId: string) => {
    const res = await deleteTheatreContactAction({ contactId, theatreId: thId });
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to delete contact");
    }
    return true;
  };

  const handleArchiveContact = async (contactId: string, thId: string) => {
    const res = await archiveTheatreContactAction({ contactId, theatreId: thId });
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to archive contact");
    }
    return true;
  };

  const handleUpdateWebsite = async (data: UpdateTheatreWebsiteInput) => {
    const res = await updateTheatreWebsiteAction(data);
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to update website");
    }
    // Refresh directory
    const bundleRes = await getTheatreContactBundleAction({ theatreId });
    if (bundleRes.success && bundleRes.data) {
      setContacts(bundleRes.data.contacts);
    }
  };

  const handleUpdateSocialLinks = async (data: UpdateTheatreContactSocialLinksInput) => {
    const res = await updateTheatreContactSocialLinksAction(data);
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to update social channels");
    }
    // Refresh directory
    const bundleRes = await getTheatreContactBundleAction({ theatreId });
    if (bundleRes.success && bundleRes.data) {
      setContacts(bundleRes.data.contacts);
    }
  };

  const handleReorderContacts = async (thId: string, orderedContactIds: string[]) => {
    const res = await reorderTheatreContactsAction({
      theatreId: thId,
      orderedContactIds,
    });
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to reorder contact channels");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs text-zinc-400">Loading theatre contact directory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold">Error Loading Contacts</h3>
          <p className="text-xs text-rose-300 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <TheatreContactDirectoryWorkspace
      theatreId={theatreId}
      theatreName={theatreName}
      isSuperAdmin={isSuperAdmin}
      contacts={contacts}
      onCreateContact={handleCreateContact}
      onUpdateContact={handleUpdateContact}
      onDeleteContact={handleDeleteContact}
      onArchiveContact={handleArchiveContact}
      onUpdateWebsite={handleUpdateWebsite}
      onUpdateSocialLinks={handleUpdateSocialLinks}
      onReorderContacts={handleReorderContacts}
    />
  );
}
