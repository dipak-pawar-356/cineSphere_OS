"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { THEATRE_CATEGORY_LABELS } from "@/lib/validation/theatre-profile.validation";
import {
  CreateTheatreProfileInput,
  TheatreCategoryType,
  TheatreOwnershipModel,
  TheatreProfileRecord,
  UpdateTheatreProfileInput,
} from "@/types/theatre-profile.types";
import { AlertTriangle, Building2, Globe, Languages, X } from "lucide-react";

interface TheatreProfileFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  theatreId: string;
  initialProfile?: TheatreProfileRecord | null;
  onClose: () => void;
  onCreate: (input: CreateTheatreProfileInput) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (input: UpdateTheatreProfileInput) => Promise<{ success: boolean; error?: string }>;
}

const ALL_CATEGORIES = Object.keys(THEATRE_CATEGORY_LABELS) as TheatreCategoryType[];

export function TheatreProfileFormModal({
  isOpen,
  mode,
  theatreId,
  initialProfile,
  onClose,
  onCreate,
  onUpdate,
}: TheatreProfileFormModalProps) {
  const [theatreName, setTheatreName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [publicSlug, setPublicSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [aboutTheatre, setAboutTheatre] = useState("");
  const [establishedYear, setEstablishedYear] = useState<string>("2018");
  const [theatreType, setTheatreType] = useState<TheatreCategoryType>("MULTIPLEX");
  const [customTheatreType, setCustomTheatreType] = useState("");
  const [ownershipModel, setOwnershipModel] = useState<TheatreOwnershipModel>("CHAIN");
  const [chainName, setChainName] = useState("");
  const [screensCount, setScreensCount] = useState<string>("6");
  const [totalSeatingCapacity, setTotalSeatingCapacity] = useState<string>("1200");
  const [website, setWebsite] = useState("");
  const [businessEmailPlaceholder, setBusinessEmailPlaceholder] = useState("");
  const [businessPhonePlaceholder, setBusinessPhonePlaceholder] = useState("");
  const [hindiDisplayName, setHindiDisplayName] = useState("");
  const [hindiTagline, setHindiTagline] = useState("");
  const [changeSummary, setChangeSummary] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    if (mode === "edit" && initialProfile) {
      setTheatreName(initialProfile.theatreName);
      setLegalName(initialProfile.legalName);
      setDisplayName(initialProfile.displayName);
      setPublicSlug(initialProfile.publicSlug);
      setTagline(initialProfile.tagline || "");
      setShortDescription(initialProfile.shortDescription || "");
      setFullDescription(initialProfile.fullDescription || "");
      setAboutTheatre(initialProfile.aboutTheatre || "");
      setEstablishedYear(
        initialProfile.establishedYear ? String(initialProfile.establishedYear) : ""
      );
      setTheatreType(initialProfile.theatreType);
      setCustomTheatreType(initialProfile.customTheatreType || "");
      setOwnershipModel(initialProfile.ownershipModel);
      setChainName(initialProfile.chainName || "");
      setScreensCount(String(initialProfile.screensCount));
      setTotalSeatingCapacity(String(initialProfile.totalSeatingCapacity));
      setWebsite(initialProfile.website || "");
      setBusinessEmailPlaceholder(initialProfile.businessEmailPlaceholder || "");
      setBusinessPhonePlaceholder(initialProfile.businessPhonePlaceholder || "");
      setHindiDisplayName(initialProfile.localizedFields?.hi?.displayName || "");
      setHindiTagline(initialProfile.localizedFields?.hi?.tagline || "");
      setChangeSummary("");
    } else {
      setTheatreName("");
      setLegalName("");
      setDisplayName("");
      setPublicSlug("");
      setTagline("");
      setShortDescription("");
      setFullDescription("");
      setAboutTheatre("");
      setEstablishedYear(String(new Date().getFullYear()));
      setTheatreType("MULTIPLEX");
      setCustomTheatreType("");
      setOwnershipModel("CHAIN");
      setChainName("");
      setScreensCount("6");
      setTotalSeatingCapacity("1200");
      setWebsite("");
      setBusinessEmailPlaceholder("");
      setBusinessPhonePlaceholder("");
      setHindiDisplayName("");
      setHindiTagline("");
      setChangeSummary("");
    }
  }, [isOpen, mode, initialProfile]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const parsedScreens = Math.max(1, Number(screensCount) || 1);
  const parsedCapacity = Math.max(0, Number(totalSeatingCapacity) || 0);
  const computedAverage = Math.round(parsedCapacity / parsedScreens);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const localizedFields =
      hindiDisplayName.trim() || hindiTagline.trim()
        ? {
            hi: {
              displayName: hindiDisplayName.trim() || undefined,
              tagline: hindiTagline.trim() || undefined,
            },
          }
        : undefined;

    try {
      if (mode === "create") {
        const res = await onCreate({
          theatreId,
          publicSlug: publicSlug.trim() || undefined,
          theatreName: theatreName.trim(),
          legalName: legalName.trim(),
          displayName: displayName.trim() || undefined,
          tagline: tagline.trim() || undefined,
          shortDescription: shortDescription.trim() || undefined,
          fullDescription: fullDescription.trim() || undefined,
          aboutTheatre: aboutTheatre.trim() || undefined,
          establishedYear: establishedYear ? Number(establishedYear) : undefined,
          theatreType,
          customTheatreType:
            theatreType === "CUSTOM" ? customTheatreType.trim() : undefined,
          ownershipModel,
          chainName: chainName.trim() || undefined,
          screensCount: Number(screensCount),
          totalSeatingCapacity: Number(totalSeatingCapacity),
          website: website.trim() || undefined,
          businessEmailPlaceholder: businessEmailPlaceholder.trim() || undefined,
          businessPhonePlaceholder: businessPhonePlaceholder.trim() || undefined,
          localizedFields,
        });
        if (res.success) {
          onClose();
        } else {
          setErrorMsg(res.error || "Unable to create theatre profile.");
        }
      } else if (initialProfile) {
        const res = await onUpdate({
          theatreId,
          expectedVersion: initialProfile.version,
          publicSlug: publicSlug.trim() || undefined,
          theatreName: theatreName.trim(),
          legalName: legalName.trim(),
          displayName: displayName.trim() || undefined,
          tagline: tagline.trim() || undefined,
          shortDescription: shortDescription.trim() || undefined,
          fullDescription: fullDescription.trim() || undefined,
          aboutTheatre: aboutTheatre.trim() || undefined,
          establishedYear: establishedYear ? Number(establishedYear) : undefined,
          theatreType,
          customTheatreType:
            theatreType === "CUSTOM" ? customTheatreType.trim() : undefined,
          ownershipModel,
          chainName: chainName.trim() || undefined,
          screensCount: Number(screensCount),
          totalSeatingCapacity: Number(totalSeatingCapacity),
          website: website.trim(),
          businessEmailPlaceholder: businessEmailPlaceholder.trim(),
          businessPhonePlaceholder: businessPhonePlaceholder.trim(),
          localizedFields,
          changeSummary: changeSummary.trim() || undefined,
        });
        if (res.success) {
          onClose();
        } else {
          setErrorMsg(res.error || "Unable to update theatre profile.");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-form-modal-title"
    >
      <div className="w-full max-w-3xl rounded-3xl bg-[#0B1220] border border-[#2A3445] p-6 space-y-5 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 border-b border-[#2A3445] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#FBBF24]/15 border border-[#FBBF24]/30 flex items-center justify-center text-[#FBBF24]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 id="profile-form-modal-title" className="text-base font-bold text-white">
                {mode === "create"
                  ? "Initialize Dedicated Theatre Profile"
                  : `Edit Profile · v${initialProfile?.version ?? 1}`}
              </h3>
              <p className="text-[11px] text-[#94A3B8]">
                Configure public branding copy, legal entity, category, screen capacity & localization.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close theatre profile form modal"
            className="text-[#94A3B8] hover:text-white rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-[#94A3B8] font-medium">Theatre Name *</span>
              <input
                required
                value={theatreName}
                onChange={(e) => setTheatreName(e.target.value)}
                placeholder="e.g., CineSphere Grand Cinemas"
                className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-[#94A3B8] font-medium">Registered Legal Name *</span>
              <input
                required
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g., CineSphere Grand Exhibition Pvt. Ltd."
                className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-[#94A3B8] font-medium">Public Display Name</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Defaults to Theatre Name"
                className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-[#94A3B8] font-medium">
                Public Profile Slug (Separate from internal tenant slug)
              </span>
              <input
                value={publicSlug}
                onChange={(e) => setPublicSlug(e.target.value.toLowerCase())}
                placeholder="e.g., cinesphere-grand-pune-official"
                className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-[#FBBF24] font-mono"
              />
            </label>
          </div>

          {/* Classification & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#111827]/70 border border-[#2A3445]">
            <label className="space-y-1.5">
              <span className="text-[#94A3B8] font-medium">Theatre Type *</span>
              <select
                value={theatreType}
                onChange={(e) => setTheatreType(e.target.value as TheatreCategoryType)}
                className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white"
              >
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {THEATRE_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-[#94A3B8] font-medium">Chain / Independent *</span>
              <select
                value={ownershipModel}
                onChange={(e) => setOwnershipModel(e.target.value as TheatreOwnershipModel)}
                className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white"
              >
                <option value="CHAIN">Chain Circuit</option>
                <option value="INDEPENDENT">Independent Exhibitor</option>
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-[#94A3B8] font-medium">Established Year</span>
              <input
                type="number"
                min={1895}
                max={new Date().getFullYear() + 1}
                value={establishedYear}
                onChange={(e) => setEstablishedYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono"
              />
            </label>

            {theatreType === "CUSTOM" && (
              <label className="space-y-1.5 sm:col-span-3">
                <span className="text-[#94A3B8] font-medium">Custom Category Label *</span>
                <input
                  required
                  value={customTheatreType}
                  onChange={(e) => setCustomTheatreType(e.target.value)}
                  placeholder="e.g., Rooftop Open-Air Amphitheatre"
                  className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white"
                />
              </label>
            )}

            <label className="space-y-1.5">
              <span className="text-[#94A3B8] font-medium">Screens Count *</span>
              <input
                type="number"
                required
                min={1}
                max={100}
                value={screensCount}
                onChange={(e) => setScreensCount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-[#94A3B8] font-medium">Total Seating Capacity *</span>
              <input
                type="number"
                required
                min={10}
                max={25000}
                value={totalSeatingCapacity}
                onChange={(e) => setTotalSeatingCapacity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono"
              />
            </label>

            <div className="space-y-1.5">
              <span className="text-[#94A3B8] font-medium">Avg. Capacity / Screen</span>
              <div className="px-3 py-2 rounded-xl bg-[#070B12]/70 border border-[#2A3445] text-emerald-400 font-mono font-bold">
                {computedAverage} seats / hall
              </div>
            </div>
          </div>

          {/* Copy & Descriptions */}
          <div className="space-y-3">
            <label className="block space-y-1.5">
              <span className="text-[#94A3B8] font-medium">Tagline</span>
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g., The Benchmark of Experiential Exhibition"
                className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[#94A3B8] font-medium">Short Description</span>
              <input
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                maxLength={400}
                placeholder="One-sentence discovery summary shown in venue cards"
                className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[#94A3B8] font-medium">About Theatre Narrative</span>
              <textarea
                rows={2}
                value={aboutTheatre}
                onChange={(e) => setAboutTheatre(e.target.value)}
                placeholder="Brand story, hospitality heritage & patron highlights"
                className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[#94A3B8] font-medium">Full Description</span>
              <textarea
                rows={3}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Detailed cinema complex overview, auditorium technologies & concessions overview"
                className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
              />
            </label>
          </div>

          {/* Website & Business Contact Placeholders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#111827]/70 border border-[#2A3445]">
            <label className="space-y-1.5">
              <span className="text-[#94A3B8] font-medium flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-[#38BDF8]" /> Official Website
              </span>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://cinesphere.os/..."
                className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-[#94A3B8] font-medium">Business Email (Placeholder)</span>
              <input
                type="email"
                value={businessEmailPlaceholder}
                onChange={(e) => setBusinessEmailPlaceholder(e.target.value)}
                placeholder="concierge@cinema.com"
                className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-[#94A3B8] font-medium">Business Phone (Placeholder)</span>
              <input
                value={businessPhonePlaceholder}
                onChange={(e) => setBusinessPhonePlaceholder(e.target.value)}
                placeholder="+91 20 6689 4500"
                className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono"
              />
            </label>
          </div>

          {/* Future Localization Hook (Hindi / Regional Copy) */}
          <div className="p-4 rounded-2xl bg-[#111827]/50 border border-dashed border-[#2A3445] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#FBBF24] flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5" /> Multi-Locale Copy Readiness (`hi` Sample Override)
              </span>
              <span className="text-[10px] font-mono text-[#64748B]">localizedFields.hi</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                aria-label="Hindi localized display name"
                value={hindiDisplayName}
                onChange={(e) => setHindiDisplayName(e.target.value)}
                placeholder="Localized Display Name (e.g., सिनेस्फीयर ग्रैंड)"
                className="px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white"
              />
              <input
                aria-label="Hindi localized tagline"
                value={hindiTagline}
                onChange={(e) => setHindiTagline(e.target.value)}
                placeholder="Localized Tagline"
                className="px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white"
              />
            </div>
          </div>

          {mode === "edit" && (
            <label className="block space-y-1.5">
              <span className="text-[#94A3B8] font-medium">Version Change Summary (Audit Ledger)</span>
              <input
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                placeholder="Reason for profile update (recorded in TheatreProfileVersion)"
                className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
              />
            </label>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2A3445]">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submitting}>
              {submitting
                ? "Saving..."
                : mode === "create"
                ? "Create Profile"
                : "Save New Version"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

