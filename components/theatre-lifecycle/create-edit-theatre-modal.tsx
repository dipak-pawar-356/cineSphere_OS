"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Building2,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe,
  Palette,
  Sliders,
} from "lucide-react";
import {
  CreateTheatreInput,
  ManagedTheatreEntity,
  UpdateTheatreInput,
} from "@/types/theatre-lifecycle.types";
import {
  generateTheatreSlugAction,
  validateTheatreSlugAction,
} from "@/actions/theatre-lifecycle-actions";

interface CreateEditTheatreModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialTheatre?: ManagedTheatreEntity | null;
  actorRole?: "SUPER_ADMIN" | "THEATRE_ADMIN";
  onClose: () => void;
  onSaveCreate?: (input: CreateTheatreInput) => Promise<{ success: boolean; error?: string }>;
  onSaveEdit?: (
    theatreId: string,
    input: UpdateTheatreInput
  ) => Promise<{ success: boolean; error?: string }>;
}

export function CreateEditTheatreModal({
  isOpen,
  mode,
  initialTheatre,
  actorRole = "SUPER_ADMIN",
  onClose,
  onSaveCreate,
  onSaveEdit,
}: CreateEditTheatreModalProps) {
  const isTheatreAdmin = actorRole === "THEATRE_ADMIN";

  const [name, setName] = useState("");
  const [chain, setChain] = useState("CineSphere Partner");
  const [slug, setSlug] = useState("");
  const [manualSlugOverride, setManualSlugOverride] = useState(false);
  const [slugCheckMsg, setSlugCheckMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [pricingTier, setPricingTier] = useState<"LUXURY" | "PREMIUM" | "STANDARD" | "BUDGET">("STANDARD");
  const [subscriptionPlan, setSubscriptionPlan] = useState<"Free" | "Starter" | "Professional" | "Enterprise">("Professional");

  const [contactEmail, setContactEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [country, setCountry] = useState("India");

  const [primaryColor, setPrimaryColor] = useState("#E50914");
  const [accentColor, setAccentColor] = useState("#F59E0B");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [openingTime, setOpeningTime] = useState("09:00 AM");
  const [closingTime, setClosingTime] = useState("01:00 AM");
  const [submitImmediately, setSubmitImmediately] = useState(false);

  const [activeSection, setActiveSection] = useState<"basic" | "business" | "location" | "branding">("basic");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      setSlugCheckMsg(null);
      setActiveSection("basic");

      if (mode === "edit" && initialTheatre) {
        setName(initialTheatre.name);
        setChain(initialTheatre.chain);
        setSlug(initialTheatre.slug);
        setManualSlugOverride(true);
        setTagline(initialTheatre.tagline || "");
        setDescription(initialTheatre.description || "");
        setGstNumber(initialTheatre.gstNumber || "");
        setPricingTier(initialTheatre.pricingTier);
        setSubscriptionPlan(initialTheatre.subscriptionPlan);
        setContactEmail(initialTheatre.contactEmail);
        setContactNumber(initialTheatre.contactNumber);
        setAdminName(initialTheatre.adminName);
        setAdminEmail(initialTheatre.adminEmail);
        setAddress(initialTheatre.address);
        setCity(initialTheatre.city);
        setState(initialTheatre.state);
        setPinCode(initialTheatre.pinCode || "");
        setCountry(initialTheatre.country);
        setPrimaryColor(initialTheatre.branding.primaryColor);
        setAccentColor(initialTheatre.branding.accentColor);
        setTimezone(initialTheatre.defaultConfig.timezone);
        setOpeningTime(initialTheatre.defaultConfig.openingTime);
        setClosingTime(initialTheatre.defaultConfig.closingTime);
      } else {
        setName("");
        setChain("CineSphere Partner");
        setSlug("");
        setManualSlugOverride(false);
        setTagline("");
        setDescription("");
        setGstNumber("");
        setPricingTier("STANDARD");
        setSubscriptionPlan("Professional");
        setContactEmail("");
        setContactNumber("+91 ");
        setAdminName("");
        setAdminEmail("");
        setAddress("");
        setCity("");
        setState("");
        setPinCode("");
        setCountry("India");
        setPrimaryColor("#E50914");
        setAccentColor("#F59E0B");
        setTimezone("Asia/Kolkata");
        setOpeningTime("09:00 AM");
        setClosingTime("01:00 AM");
        setSubmitImmediately(false);
      }
    }
  }, [isOpen, mode, initialTheatre]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAutoSlug = async () => {
    if (!name.trim()) return;
    const res = await generateTheatreSlugAction(
      { name: name.trim(), city: city.trim() || undefined, excludeTheatreId: initialTheatre?.id },
      { userId: "usr-super-1", role: actorRole }
    );
    if (res.success && res.data?.slug) {
      setSlug(res.data.slug);
      setSlugCheckMsg({ ok: true, text: `Unique slug generated: /${res.data.slug}` });
    }
  };

  const handleValidateSlug = async (candidate: string) => {
    setSlug(candidate);
    if (!candidate.trim()) {
      setSlugCheckMsg(null);
      return;
    }
    const res = await validateTheatreSlugAction(
      { slug: candidate.trim(), excludeTheatreId: initialTheatre?.id },
      { userId: "usr-super-1", role: actorRole }
    );
    if (res.success && res.data) {
      if (res.data.isValid && res.data.isAvailable) {
        setSlugCheckMsg({ ok: true, text: "Slug is valid and available." });
      } else {
        setSlugCheckMsg({ ok: false, text: res.data.error || "Slug is unavailable." });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (mode === "create" && onSaveCreate) {
        const res = await onSaveCreate({
          name,
          chain,
          slug: slug.trim() || undefined,
          tagline: tagline || undefined,
          description: description || undefined,
          gstNumber: gstNumber || undefined,
          pricingTier,
          subscriptionPlan,
          contactEmail,
          contactNumber,
          adminName,
          adminEmail,
          address,
          city,
          state,
          pinCode: pinCode || undefined,
          country,
          submitImmediately,
          branding: { primaryColor, accentColor },
          defaultConfig: { timezone, openingTime, closingTime },
        });
        if (!res.success) {
          setFormError(res.error || "Failed to create theatre.");
        } else {
          onClose();
        }
      } else if (mode === "edit" && initialTheatre && onSaveEdit) {
        const payload: UpdateTheatreInput = isTheatreAdmin
          ? {
              expectedVersion: initialTheatre.version,
              tagline,
              description,
              contactEmail,
              contactNumber,
              address,
              pinCode,
              branding: { primaryColor, accentColor },
              defaultConfig: { timezone, openingTime, closingTime },
            }
          : {
              expectedVersion: initialTheatre.version,
              name,
              chain,
              slug,
              tagline,
              description,
              gstNumber,
              pricingTier,
              subscriptionPlan,
              contactEmail,
              contactNumber,
              adminName,
              adminEmail,
              address,
              city,
              state,
              pinCode,
              country,
              branding: { primaryColor, accentColor },
              defaultConfig: { timezone, openingTime, closingTime },
            };

        const res = await onSaveEdit(initialTheatre.id, payload);
        if (!res.success) {
          setFormError(res.error || "Failed to update theatre.");
        } else {
          onClose();
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
      aria-labelledby="create-edit-theatre-title"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-3xl bg-[#0B1220] border border-[#2A3445] p-6 space-y-5 shadow-2xl my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
          <div>
            <h3
              id="create-edit-theatre-title"
              className="text-base font-bold text-white flex items-center gap-2"
            >
              <Building2 className="h-5 w-5 text-[#FBBF24]" />
              <span>
                {mode === "create"
                  ? "Onboard New Multi-Tenant Theatre"
                  : `Edit Theatre: ${initialTheatre?.name} (v${initialTheatre?.version})`}
              </span>
            </h3>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              {mode === "create"
                ? "Initializes tenant partition, unique SEO slug, public ID & default cinema configuration."
                : "Updates are version-checked using Optimistic Locking and recorded in audit logs."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close theatre form modal"
            className="text-[#94A3B8] hover:text-white rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {[
            { id: "basic", label: "1. Basic & Slug", icon: Globe },
            { id: "business", label: "2. Business & Admin", icon: Lock },
            { id: "location", label: "3. Location", icon: Building2 },
            { id: "branding", label: "4. Branding & Config", icon: Sliders },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeSection === tab.id
                  ? "bg-[#FBBF24] text-[#070B12] font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Section 1: Basic & Slug */}
        {activeSection === "basic" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Theatre Name *</label>
                <input
                  required
                  disabled={isTheatreAdmin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. INOX Royal Kolhapur"
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white disabled:opacity-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Cinema Chain</label>
                <input
                  disabled={isTheatreAdmin}
                  value={chain}
                  onChange={(e) => setChain(e.target.value)}
                  placeholder="e.g. CineSphere Signature"
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#111827] border border-[#2A3445]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-[#FBBF24]" /> Tenant URL Slug
                </label>
                {!isTheatreAdmin && (
                  <button
                    type="button"
                    onClick={handleAutoSlug}
                    className="text-[11px] text-[#FBBF24] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="h-3 w-3" /> Auto-Generate Unique Slug
                  </button>
                )}
              </div>
              <input
                disabled={isTheatreAdmin}
                value={slug}
                onChange={(e) => {
                  setManualSlugOverride(true);
                  void handleValidateSlug(e.target.value);
                }}
                placeholder={
                  manualSlugOverride
                    ? "inox-kolhapur"
                    : "Leave blank to auto-generate unique slug from name + city"
                }
                className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-[#2A3445] font-mono text-xs text-white disabled:opacity-50"
              />
              {slugCheckMsg && (
                <div
                  className={`text-[11px] flex items-center gap-1.5 ${
                    slugCheckMsg.ok ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {slugCheckMsg.ok ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  <span>{slugCheckMsg.text}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white">Tagline</label>
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Experience Luxury Cinema in 4K Laser"
                className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white">Property Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Architectural highlights, laser projection systems & acoustic specs..."
                className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white"
              />
            </div>
          </div>
        )}

        {/* Section 2: Business & Admin */}
        {activeSection === "business" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Contact Email *</label>
                <input
                  required
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="desk@cinema.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Contact Phone *</label>
                <input
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+91 20 6689 4500"
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Primary Operator Name *</label>
                <input
                  required
                  disabled={isTheatreAdmin}
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Sanket Joshi"
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white disabled:opacity-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Primary Operator Email *</label>
                <input
                  required
                  disabled={isTheatreAdmin}
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="gm@cinema.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white disabled:opacity-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">GSTIN Placeholder</label>
                <input
                  disabled={isTheatreAdmin}
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="27AABCP1000C1Z5"
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] font-mono text-xs text-white disabled:opacity-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Luxury Pricing Tier</label>
                <select
                  disabled={isTheatreAdmin}
                  value={pricingTier}
                  onChange={(e) => setPricingTier(e.target.value as typeof pricingTier)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white disabled:opacity-50"
                >
                  <option value="LUXURY">LUXURY</option>
                  <option value="PREMIUM">PREMIUM</option>
                  <option value="STANDARD">STANDARD</option>
                  <option value="BUDGET">BUDGET</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Location */}
        {activeSection === "location" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white">Street Address *</label>
              <input
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Level 4, Phoenix Marketcity, Nagar Road"
                className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">City *</label>
                <input
                  required
                  disabled={isTheatreAdmin}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Pune"
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white disabled:opacity-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">State *</label>
                <input
                  required
                  disabled={isTheatreAdmin}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white disabled:opacity-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">PIN Code</label>
                <input
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="411014"
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Country *</label>
                <input
                  required
                  disabled={isTheatreAdmin}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Branding & Configuration Placeholders */}
        {activeSection === "branding" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-[#FBBF24]" /> Brand Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-9 w-12 rounded-lg bg-[#111827] border border-[#2A3445] cursor-pointer"
                  />
                  <input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] font-mono text-xs text-white"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-9 w-12 rounded-lg bg-[#111827] border border-[#2A3445] cursor-pointer"
                  />
                  <input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] font-mono text-xs text-white"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Timezone</label>
                <input
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white">Opening</label>
                  <input
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white">Closing</label>
                  <input
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {mode === "create" && !isTheatreAdmin && (
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#111827] border border-[#2A3445] cursor-pointer">
                <input
                  type="checkbox"
                  checked={submitImmediately}
                  onChange={(e) => setSubmitImmediately(e.target.checked)}
                  className="rounded border-[#2A3445]"
                />
                <span className="text-xs text-white font-medium">
                  Submit directly into <span className="text-[#FBBF24] font-bold">Pending Approval</span> (otherwise initialize as Draft)
                </span>
              </label>
            )}
          </div>
        )}

        {formError && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#2A3445] pt-4">
          <div className="text-[11px] text-[#94A3B8]">
            {isTheatreAdmin
              ? "Role Scope: Theatre Admin (Governance fields locked)"
              : "Role Scope: Super Admin Full Access"}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
              className="border-[#2A3445] text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
              className="text-xs font-bold"
            >
              {submitting
                ? "Saving..."
                : mode === "create"
                ? "Create Theatre Entity"
                : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

