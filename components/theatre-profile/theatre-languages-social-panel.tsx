"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  SOCIAL_PLATFORM_LABELS,
  SUPPORTED_PROFILE_LANGUAGES,
} from "@/lib/validation/theatre-profile.validation";
import {
  TheatreLanguageInput,
  TheatreLanguageRecord,
  TheatreSocialLinkInput,
  TheatreSocialLinkRecord,
  TheatreSocialPlatform,
} from "@/types/theatre-profile.types";
import { Globe, Languages, Plus, Save, Share2, Star, Trash2 } from "lucide-react";

interface TheatreLanguagesSocialPanelProps {
  languages: TheatreLanguageRecord[];
  socialLinks: TheatreSocialLinkRecord[];
  readOnly?: boolean;
  onSaveLanguages: (langs: TheatreLanguageInput[]) => Promise<{ success: boolean; error?: string }>;
  onSaveSocialLinks: (links: TheatreSocialLinkInput[]) => Promise<{ success: boolean; error?: string }>;
}

const ALL_PLATFORMS = Object.keys(SOCIAL_PLATFORM_LABELS) as TheatreSocialPlatform[];

export function TheatreLanguagesSocialPanel({
  languages,
  socialLinks,
  readOnly = false,
  onSaveLanguages,
  onSaveSocialLinks,
}: TheatreLanguagesSocialPanelProps) {
  const [draftLangs, setDraftLangs] = useState<TheatreLanguageInput[]>([]);
  const [customLangCode, setCustomLangCode] = useState("");
  const [customLangName, setCustomLangName] = useState("");
  const [savingLangs, setSavingLangs] = useState(false);

  const [draftSocials, setDraftSocials] = useState<TheatreSocialLinkInput[]>([]);
  const [newPlatform, setNewPlatform] = useState<TheatreSocialPlatform>("INSTAGRAM");
  const [newCustomPlatform, setNewCustomPlatform] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [savingSocials, setSavingSocials] = useState(false);
  const [panelFeedback, setPanelFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  useEffect(() => {
    setDraftLangs(
      languages.map((l) => ({
        languageCode: l.languageCode,
        displayName: l.displayName,
        isPrimary: l.isPrimary,
      }))
    );
  }, [languages]);

  useEffect(() => {
    setDraftSocials(
      socialLinks.map((s) => ({
        platform: s.platform,
        customPlatformName: s.customPlatformName,
        label: s.label,
        url: s.url,
        isActive: s.isActive,
        displayOrder: s.displayOrder,
      }))
    );
  }, [socialLinks]);

  const togglePresetLang = (code: string, displayName: string) => {
    if (readOnly) return;
    const exists = draftLangs.some((l) => l.languageCode === code);
    if (exists) {
      if (draftLangs.length === 1) return; // keep at least 1 language
      const filtered = draftLangs.filter((l) => l.languageCode !== code);
      if (!filtered.some((l) => l.isPrimary)) {
        filtered[0] = { ...filtered[0], isPrimary: true };
      }
      setDraftLangs(filtered);
    } else {
      setDraftLangs([...draftLangs, { languageCode: code, displayName, isPrimary: false }]);
    }
  };

  const setPrimaryLang = (code: string) => {
    if (readOnly) return;
    setDraftLangs(draftLangs.map((l) => ({ ...l, isPrimary: l.languageCode === code })));
  };

  const handleAddCustomLanguage = () => {
    const code = customLangCode.trim().toLowerCase();
    const name = customLangName.trim();
    if (code.length < 2 || name.length < 2) return;
    if (draftLangs.some((l) => l.languageCode === code)) return;
    setDraftLangs([...draftLangs, { languageCode: code, displayName: name, isPrimary: false }]);
    setCustomLangCode("");
    setCustomLangName("");
  };

  const handleCommitLanguages = async () => {
    setSavingLangs(true);
    setPanelFeedback(null);
    try {
      const res = await onSaveLanguages(draftLangs);
      setPanelFeedback({
        ok: res.success,
        text: res.success ? "Supported languages updated & versioned." : res.error || "Save failed.",
      });
    } finally {
      setSavingLangs(false);
    }
  };

  const handleAddSocialRow = () => {
    if (!newUrl.trim()) return;
    setDraftSocials([
      ...draftSocials,
      {
        platform: newPlatform,
        customPlatformName: newPlatform === "CUSTOM" ? newCustomPlatform.trim() : undefined,
        label: newLabel.trim() || SOCIAL_PLATFORM_LABELS[newPlatform],
        url: newUrl.trim(),
        isActive: true,
        displayOrder: draftSocials.length + 1,
      },
    ]);
    setNewLabel("");
    setNewUrl("");
    setNewCustomPlatform("");
  };

  const handleRemoveSocialRow = (idx: number) => {
    if (readOnly) return;
    setDraftSocials(
      draftSocials
        .filter((_, i) => i !== idx)
        .map((item, nextIdx) => ({ ...item, displayOrder: nextIdx + 1 }))
    );
  };

  const handleCommitSocials = async () => {
    setSavingSocials(true);
    setPanelFeedback(null);
    try {
      const res = await onSaveSocialLinks(draftSocials);
      setPanelFeedback({
        ok: res.success,
        text: res.success ? "Social media links validated & saved." : res.error || "Save failed.",
      });
    } finally {
      setSavingSocials(false);
    }
  };

  return (
    <div className="space-y-6">
      {panelFeedback && (
        <div
          role="status"
          className={`p-3 rounded-xl border text-xs font-medium ${
            panelFeedback.ok
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/60 border-rose-500/40 text-rose-200"
          }`}
        >
          {panelFeedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Languages Manager */}
        <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Languages className="h-4 w-4 text-[#FBBF24]" />
                <span>Supported Exhibition Languages</span>
              </h3>
              <p className="text-[11px] text-[#94A3B8]">
                Configure regional languages and select one Primary language.
              </p>
            </div>
            {!readOnly && (
              <Button
                type="button"
                variant="primary"
                size="xs"
                disabled={savingLangs}
                onClick={() => void handleCommitLanguages()}
                className="gap-1.5 font-bold"
              >
                <Save className="h-3.5 w-3.5" /> Save Languages
              </Button>
            )}
          </div>

          {/* Preset toggle pills */}
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_PROFILE_LANGUAGES.map((lang) => {
              const selected = draftLangs.find((d) => d.languageCode === lang.code);
              return (
                <button
                  key={lang.code}
                  type="button"
                  disabled={readOnly}
                  onClick={() => togglePresetLang(lang.code, lang.displayName)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    selected
                      ? "bg-[#FBBF24]/15 border-[#FBBF24]/60 text-[#FBBF24]"
                      : "bg-[#111827] border-[#2A3445] text-[#94A3B8] hover:text-white"
                  }`}
                >
                  {lang.displayName} ({lang.code})
                </button>
              );
            })}
          </div>

          {/* Active Language List with Primary Selection */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Configured Languages ({draftLangs.length})
            </span>
            <div className="space-y-2">
              {draftLangs.map((lang) => (
                <div
                  key={lang.languageCode}
                  className="p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono px-1.5 py-0.5 rounded bg-[#070B12] text-[#FBBF24]">
                      {lang.languageCode}
                    </span>
                    <span className="font-semibold text-white">{lang.displayName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={readOnly}
                      onClick={() => setPrimaryLang(lang.languageCode)}
                      aria-label={`Set ${lang.displayName} as primary language`}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border ${
                        lang.isPrimary
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                          : "bg-[#070B12] border-[#2A3445] text-[#94A3B8] hover:text-white"
                      }`}
                    >
                      <Star className="h-3 w-3" />
                      {lang.isPrimary ? "Primary" : "Set Primary"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Language Add */}
          {!readOnly && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#2A3445] text-xs">
              <input
                aria-label="Custom language code"
                value={customLangCode}
                onChange={(e) => setCustomLangCode(e.target.value)}
                placeholder="Code (e.g. fr)"
                className="w-24 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white font-mono"
              />
              <input
                aria-label="Custom language display name"
                value={customLangName}
                onChange={(e) => setCustomLangName(e.target.value)}
                placeholder="Language Name (e.g. French)"
                className="flex-1 min-w-[140px] px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
              />
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleAddCustomLanguage}
                className="border-[#2A3445] gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          )}
        </div>

        {/* Social Links Manager */}
        <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="h-4 w-4 text-[#38BDF8]" />
                <span>Social Presence & Website Channels</span>
              </h3>
              <p className="text-[11px] text-[#94A3B8]">
                Manage Website, Facebook, Instagram, X, YouTube, LinkedIn & Threads links.
              </p>
            </div>
            {!readOnly && (
              <Button
                type="button"
                variant="primary"
                size="xs"
                disabled={savingSocials}
                onClick={() => void handleCommitSocials()}
                className="gap-1.5 font-bold"
              >
                <Save className="h-3.5 w-3.5" /> Save Links
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {draftSocials.map((link, idx) => (
              <div
                key={`${link.platform}-${idx}`}
                className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-[#38BDF8] shrink-0" />
                    <span>
                      {link.platform === "CUSTOM"
                        ? link.customPlatformName
                        : SOCIAL_PLATFORM_LABELS[link.platform]}
                    </span>
                    {link.label && (
                      <span className="text-[10px] font-normal text-[#94A3B8]">
                        ({link.label})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-[#38BDF8] truncate mt-0.5">
                    {link.url}
                  </div>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSocialRow(idx)}
                    aria-label={`Remove ${link.platform} link`}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            {draftSocials.length === 0 && (
              <div className="p-4 rounded-xl bg-[#111827] border border-dashed border-[#2A3445] text-center text-xs text-[#64748B]">
                No social channels configured yet.
              </div>
            )}
          </div>

          {!readOnly && (
            <div className="space-y-2 pt-2 border-t border-[#2A3445] text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  aria-label="Social platform type"
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value as TheatreSocialPlatform)}
                  className="px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
                >
                  {ALL_PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {SOCIAL_PLATFORM_LABELS[p]}
                    </option>
                  ))}
                </select>
                <input
                  aria-label="Social channel handle or label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Display Handle (e.g. @cinespherepune)"
                  className="px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
                />
              </div>

              {newPlatform === "CUSTOM" && (
                <input
                  aria-label="Custom social platform name"
                  value={newCustomPlatform}
                  onChange={(e) => setNewCustomPlatform(e.target.value)}
                  placeholder="Custom Platform Name (e.g. WhatsApp Channel)"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
                />
              )}

              <div className="flex gap-2">
                <input
                  type="url"
                  aria-label="Social profile URL"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={handleAddSocialRow}
                  className="border-[#2A3445] gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Channel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

