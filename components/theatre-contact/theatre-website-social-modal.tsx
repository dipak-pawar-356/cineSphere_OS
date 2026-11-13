"use client";

import React, { useState, useEffect } from "react";
import { X, Globe, Share2, Plus, Trash2, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  TheatreContactWithDetails,
  UpdateTheatreWebsiteInput,
  UpdateTheatreContactSocialLinksInput,
} from "@/types/theatre-contact.types";
import type { TheatreSocialPlatform } from "@/types/theatre-profile.types";

interface SocialLinkItem {
  id?: string;
  platform: TheatreSocialPlatform;
  customPlatform?: string | null;
  url: string;
  handle?: string | null;
  displayOrder: number;
}

interface TheatreWebsiteSocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  theatreId: string;
  initialWebsiteContact?: TheatreContactWithDetails | null;
  initialSocialContacts?: TheatreContactWithDetails[];
  onUpdateWebsite: (data: UpdateTheatreWebsiteInput) => Promise<void>;
  onUpdateSocialLinks: (data: UpdateTheatreContactSocialLinksInput) => Promise<void>;
}

const PLATFORM_OPTIONS: { label: string; value: TheatreSocialPlatform }[] = [
  { label: "Instagram", value: "INSTAGRAM" },
  { label: "Facebook", value: "FACEBOOK" },
  { label: "X (Twitter)", value: "X_TWITTER" },
  { label: "YouTube", value: "YOUTUBE" },
  { label: "LinkedIn", value: "LINKEDIN" },
  { label: "Threads", value: "THREADS" },
  { label: "Custom Platform", value: "CUSTOM" },
];

export function TheatreWebsiteSocialModal({
  isOpen,
  onClose,
  theatreId,
  initialWebsiteContact,
  initialSocialContacts = [],
  onUpdateWebsite,
  onUpdateSocialLinks,
}: TheatreWebsiteSocialModalProps) {
  // Website state
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteTitle, setWebsiteTitle] = useState("");

  // Social Links state
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialWebsiteContact?.website) {
      setWebsiteUrl(initialWebsiteContact.website.url || "");
      setWebsiteTitle(initialWebsiteContact.website.title || initialWebsiteContact.title || "");
    } else {
      setWebsiteUrl("");
      setWebsiteTitle("");
    }

    if (initialSocialContacts && initialSocialContacts.length > 0) {
      const items: SocialLinkItem[] = initialSocialContacts
        .filter((c) => c.socialLink)
        .map((c, index) => ({
          id: c.id,
          platform: c.socialLink!.platform,
          customPlatform: c.socialLink!.customPlatform,
          url: c.socialLink!.url,
          handle: c.socialLink!.handle,
          displayOrder: c.socialLink!.displayOrder ?? index,
        }));
      setSocialLinks(items);
    } else {
      setSocialLinks([]);
    }
    setError(null);
  }, [initialWebsiteContact, initialSocialContacts, isOpen]);

  if (!isOpen) return null;

  const handleAddSocialLink = () => {
    setSocialLinks((prev) => [
      ...prev,
      {
        platform: "INSTAGRAM",
        url: "",
        handle: "",
        displayOrder: prev.length,
      },
    ]);
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSocialLinkField = (
    index: number,
    field: keyof SocialLinkItem,
    value: unknown
  ) => {
    setSocialLinks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Update Website if entered
      if (websiteUrl.trim()) {
        const cleanUrl = websiteUrl.trim();
        if (/^(javascript|data|vbscript):/i.test(cleanUrl)) {
          throw new Error("Invalid URL protocol detected.");
        }
        await onUpdateWebsite({
          theatreId,
          url: cleanUrl,
          title: websiteTitle.trim() || undefined,
          isPrimary: true,
          visibility: "PUBLIC",
        });
      }

      // 2. Update Social Links
      const validLinks = socialLinks
        .filter((s) => s.url.trim().length > 0)
        .map((s, idx) => {
          const cleanUrl = s.url.trim();
          if (/^(javascript|data|vbscript):/i.test(cleanUrl)) {
            throw new Error(`Invalid URL detected in ${s.platform}`);
          }
          return {
            platform: s.platform,
            customPlatform: s.platform === "CUSTOM" ? s.customPlatform || null : null,
            url: cleanUrl,
            handle: s.handle?.trim() || null,
            displayOrder: idx,
            status: "ACTIVE" as const,
          };
        });

      await onUpdateSocialLinks({
        theatreId,
        socialLinks: validLinks,
      });

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update digital web channels");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                Official Website & Social Channels
              </h2>
              <p className="text-xs text-zinc-400">
                Configure primary web portal and social media presence for patron discovery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          {/* Section 1: Official Website */}
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> Official Website
              </span>
              <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Sanitized & Encrypted
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Website URL
                </label>
                <div className="relative">
                  <Input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://examplecinema.com"
                    className="bg-zinc-900 border-zinc-800 text-xs text-zinc-200"
                  />
                  {websiteUrl && (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2 top-2.5 text-zinc-500 hover:text-zinc-300"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Display Title (Optional)
                </label>
                <Input
                  value={websiteTitle}
                  onChange={(e) => setWebsiteTitle(e.target.value)}
                  placeholder="Official Box Office Portal"
                  className="bg-zinc-900 border-zinc-800 text-xs text-zinc-200"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Social Media Presence */}
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-sky-400" /> Social Presence Channels
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSocialLink}
                className="h-7 text-xs bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Channel
              </Button>
            </div>

            {socialLinks.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-2 text-center">
                No social channels linked yet. Click &quot;Add Channel&quot; to connect Instagram, Facebook, X, etc.
              </p>
            ) : (
              <div className="space-y-3">
                {socialLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-2.5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                      {/* Platform Select */}
                      <div className="md:col-span-4">
                        <label className="block text-[10px] text-zinc-500 mb-1">
                          Platform
                        </label>
                        <select
                          value={link.platform}
                          onChange={(e) =>
                            handleUpdateSocialLinkField(
                              idx,
                              "platform",
                              e.target.value as TheatreSocialPlatform
                            )
                          }
                          className="w-full h-8 px-2 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                        >
                          {PLATFORM_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Custom Platform Name if applicable */}
                      {link.platform === "CUSTOM" && (
                        <div className="md:col-span-3">
                          <label className="block text-[10px] text-zinc-500 mb-1">
                            Platform Name
                          </label>
                          <Input
                            value={link.customPlatform || ""}
                            onChange={(e) =>
                              handleUpdateSocialLinkField(idx, "customPlatform", e.target.value)
                            }
                            placeholder="e.g. TikTok"
                            className="h-8 bg-zinc-900 border-zinc-800 text-xs text-zinc-200"
                          />
                        </div>
                      )}

                      {/* Handle */}
                      <div className={link.platform === "CUSTOM" ? "md:col-span-4" : "md:col-span-7"}>
                        <label className="block text-[10px] text-zinc-500 mb-1">
                          Handle / Username (Optional)
                        </label>
                        <Input
                          value={link.handle || ""}
                          onChange={(e) =>
                            handleUpdateSocialLinkField(idx, "handle", e.target.value)
                          }
                          placeholder="@cinesphere_official"
                          className="h-8 bg-zinc-900 border-zinc-800 text-xs text-zinc-200"
                        />
                      </div>

                      {/* Delete */}
                      <div className="md:col-span-1 flex justify-end pt-3 md:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveSocialLink(idx)}
                          className="p-1.5 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Remove Channel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* URL */}
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">
                        Profile URL
                      </label>
                      <Input
                        type="url"
                        value={link.url}
                        onChange={(e) =>
                          handleUpdateSocialLinkField(idx, "url", e.target.value)
                        }
                        placeholder="https://instagram.com/cinesphere"
                        className="h-8 bg-zinc-900 border-zinc-800 text-xs text-zinc-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-zinc-800 hover:bg-zinc-900 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
            >
              {loading ? "Saving Channels..." : "Save Digital Channels"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
