"use client";

import React, { useState, useEffect } from "react";
import { useTheatreStore } from "@/store/theatre-store";
import { Modal } from "@/components/dialogs/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tag,
  Calendar,
  Clock,
  Sparkles,
  Percent,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sliders,
  DollarSign,
  Plus,
  Trash2,
} from "lucide-react";
import {
  DynamicPricingProfile,
  PricingDayType,
  PricingSlotType,
  PricingProfileStatus,
} from "@/types/pricing-engine.types";
import { validatePricingProfileInput } from "@/lib/validation/pricing-validation";

const STANDARD_TIERS = [
  "Silver",
  "Gold",
  "Platinum",
  "VIP",
  "Recliner",
  "Wheelchair",
  "Royal Suite",
];

interface PricingProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProfile?: DynamicPricingProfile | null;
  onSuccess?: (message: string) => void;
}

export function PricingProfileModal({
  isOpen,
  onClose,
  editingProfile,
  onSuccess,
}: PricingProfileModalProps) {
  const { activeTheatreId, addPricingProfile, updatePricingProfile } =
    useTheatreStore();

  // Form Fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<PricingProfileStatus>("Active");
  const [isDefault, setIsDefault] = useState(false);
  const [dayType, setDayType] = useState<PricingDayType>("Weekday");
  const [slotType, setSlotType] = useState<PricingSlotType>("All");

  // Tier Rates Map
  const [tierPricing, setTierPricing] = useState<Record<string, number>>({
    Silver: 200,
    Gold: 280,
    Platinum: 380,
    VIP: 550,
    Recliner: 700,
    Wheelchair: 200,
    "Royal Suite": 1100,
  });

  const [convenienceFee, setConvenienceFee] = useState(35);
  const [gstPercent, setGstPercent] = useState(18);
  const [minPrice, setMinPrice] = useState(150);
  const [maxPrice, setMaxPrice] = useState(2500);

  // New Custom Tier Input
  const [customTierName, setCustomTierName] = useState("");
  const [customTierPrice, setCustomTierPrice] = useState(300);
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when editingProfile changes or modal opens
  useEffect(() => {
    if (editingProfile) {
      setName(editingProfile.name);
      setCode(editingProfile.code || "");
      setDescription(editingProfile.description || "");
      setStatus(editingProfile.status || "Active");
      setIsDefault(editingProfile.isDefault || false);
      setDayType(editingProfile.dayType || "Weekday");
      setSlotType(editingProfile.slotType || "All");
      setTierPricing({ ...editingProfile.tierPricing });
      setConvenienceFee(editingProfile.convenienceFee ?? 35);
      setGstPercent(editingProfile.gstPercent ?? 18);
      setMinPrice(editingProfile.minPrice ?? 150);
      setMaxPrice(editingProfile.maxPrice ?? 2500);
    } else {
      setName("");
      setCode("");
      setDescription("");
      setStatus("Active");
      setIsDefault(false);
      setDayType("Weekday");
      setSlotType("All");
      setTierPricing({
        Silver: 200,
        Gold: 280,
        Platinum: 380,
        VIP: 550,
        Recliner: 700,
        Wheelchair: 200,
        "Royal Suite": 1100,
      });
      setConvenienceFee(35);
      setGstPercent(18);
      setMinPrice(150);
      setMaxPrice(2500);
    }
    setErrors({});
    setShowAddCustom(false);
    setCustomTierName("");
  }, [editingProfile, isOpen]);

  const handleTierRateChange = (tier: string, value: number) => {
    setTierPricing((prev) => ({
      ...prev,
      [tier]: Math.max(0, value),
    }));
  };

  const handleAddCustomTier = () => {
    const trimmed = customTierName.trim();
    if (!trimmed) return;
    setTierPricing((prev) => ({
      ...prev,
      [trimmed]: customTierPrice > 0 ? customTierPrice : 300,
    }));
    setCustomTierName("");
    setCustomTierPrice(300);
    setShowAddCustom(false);
  };

  const handleRemoveTier = (tier: string) => {
    setTierPricing((prev) => {
      const copy = { ...prev };
      delete copy[tier];
      return copy;
    });
  };

  // Live Sample Calculation (2 Gold tickets)
  const sampleTier = tierPricing["Gold"] ? "Gold" : Object.keys(tierPricing)[0] || "Silver";
  const sampleTicketPrice = tierPricing[sampleTier] || 250;
  const sampleSeats = 2;
  const sampleSubtotal = sampleTicketPrice * sampleSeats;
  const sampleConvFee = convenienceFee * sampleSeats;
  const sampleGst = Math.round((sampleConvFee * gstPercent) / 100);
  const sampleGrandTotal = sampleSubtotal + sampleConvFee + sampleGst;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const inputData = {
      name,
      code: code.trim() || undefined,
      description,
      theatreId: activeTheatreId || "th-pun-001",
      status,
      isDefault,
      dayType,
      slotType,
      tierPricing,
      convenienceFee: Number(convenienceFee),
      gstPercent: Number(gstPercent),
      currency: "INR",
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
    };

    const validation = validatePricingProfileInput(inputData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingProfile) {
        const res = updatePricingProfile(editingProfile.id, inputData);
        if (!res.success) {
          setErrors({ form: res.error || "Failed to update pricing profile" });
          setIsSubmitting(false);
          return;
        }
        onSuccess?.(`Pricing Profile "${name}" updated successfully.`);
      } else {
        const res = addPricingProfile(inputData);
        if (!res.success) {
          setErrors({ form: res.error || "Failed to create pricing profile" });
          setIsSubmitting(false);
          return;
        }
        onSuccess?.(`Pricing Profile "${name}" created successfully.`);
      }

      onClose();
    } catch {
      setErrors({ form: "An unexpected error occurred while saving profile." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={editingProfile ? "Edit Dynamic Pricing Profile" : "Create Dynamic Pricing Profile"}
      description="Configure section-based tariff profiles. Shows inherit these prices dynamically; movie and hall layout records never store permanent prices."
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1 pr-2">
        {errors.form && (
          <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-lg text-sm text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Section 1: Profile Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Tag className="w-3.5 h-3.5" />
            <span>Profile Identity & Scope</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Profile Name <span className="text-amber-400">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Weekend Blockbuster Prime"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={errors.name ? "border-red-500" : ""}
                required
              />
              {errors.name && <p className="text-[11px] text-red-400">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Profile Code</label>
              <Input
                type="text"
                placeholder="e.g. PRF-WBP-05 (Auto)"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              <p className="text-[10px] text-slate-500">Auto-generated if left blank</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Operational Description</label>
            <textarea
              className="w-full bg-[#0B0F17] border border-[#2A3445] rounded-lg p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/60 transition-colors"
              rows={2}
              placeholder="e.g. Peak weekend evening tariff applicable for Friday evenings, Saturdays, and Sundays."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Day Classification</label>
              <select
                className="w-full bg-[#0B0F17] border border-[#2A3445] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400/60"
                value={dayType}
                onChange={(e) => setDayType(e.target.value as PricingDayType)}
              >
                <option value="Weekday">Weekday (Mon - Thu)</option>
                <option value="Weekend">Weekend (Fri - Sun)</option>
                <option value="Holiday">National Holiday / Festival</option>
                <option value="All">All Days (Universal)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Time Slot Window</label>
              <select
                className="w-full bg-[#0B0F17] border border-[#2A3445] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400/60"
                value={slotType}
                onChange={(e) => setSlotType(e.target.value as PricingSlotType)}
              >
                <option value="All">All Time Slots (Full Day)</option>
                <option value="Morning">Morning (&lt; 13:00)</option>
                <option value="Matinee">Matinee (13:00 - 17:00)</option>
                <option value="Evening">Evening (17:00 - 23:00)</option>
                <option value="Night">Late Night (&gt; 23:00)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Status</label>
              <select
                className="w-full bg-[#0B0F17] border border-[#2A3445] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400/60"
                value={status}
                onChange={(e) => setStatus(e.target.value as PricingProfileStatus)}
              >
                <option value="Active">Active (Available for Shows)</option>
                <option value="Draft">Draft (In Review)</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 p-2.5 bg-[#0F172A]/50 border border-[#2A3445] rounded-lg cursor-pointer hover:border-amber-400/40 transition-colors">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-amber-400 rounded bg-[#0B0F17] border-slate-600 focus:ring-0"
            />
            <div>
              <p className="text-xs font-medium text-slate-200">
                Set as Theatre Default Pricing Profile
              </p>
              <p className="text-[11px] text-slate-400">
                New shows will automatically inherit this profile unless explicitly overridden.
              </p>
            </div>
          </label>
        </div>

        {/* Section 2: Section / Tier Pricing Grid */}
        <div className="space-y-3 pt-2 border-t border-[#2A3445]/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Sliders className="w-3.5 h-3.5" />
              <span>Section Tier Rates (INR ₹)</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => setShowAddCustom(!showAddCustom)}
              iconLeft={<Plus className="w-3.5 h-3.5" />}
            >
              {showAddCustom ? "Cancel Custom Tier" : "Add Custom Tier"}
            </Button>
          </div>

          {errors.tierPricing && (
            <p className="text-xs text-red-400">{errors.tierPricing}</p>
          )}

          {showAddCustom && (
            <div className="p-3 bg-[#111827] border border-amber-400/30 rounded-lg flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[150px]">
                <Input
                  type="text"
                  placeholder="Tier Name (e.g. Balcony Club)"
                  value={customTierName}
                  onChange={(e) => setCustomTierName(e.target.value)}
                />
              </div>
              <div className="w-28">
                <Input
                  type="number"
                  min={1}
                  placeholder="₹ Rate"
                  value={customTierPrice}
                  onChange={(e) => setCustomTierPrice(Number(e.target.value))}
                />
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAddCustomTier}
                disabled={!customTierName.trim()}
              >
                Add Tier
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(tierPricing).map(([tier, rate]) => {
              const isStandard = STANDARD_TIERS.includes(tier);
              return (
                <div
                  key={tier}
                  className="p-2.5 bg-[#0B0F17] border border-[#2A3445] rounded-lg hover:border-slate-600 transition-colors relative group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-300 truncate" title={tier}>
                      {tier}
                    </span>
                    {!isStandard && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTier(tier)}
                        className="text-red-400 hover:text-red-300 p-0.5"
                        title="Remove custom tier"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-amber-400">
                      ₹
                    </span>
                    <Input
                      type="number"
                      min={0}
                      max={15000}
                      step={10}
                      value={rate}
                      onChange={(e) => handleTierRateChange(tier, Number(e.target.value))}
                      className="pl-6 h-8 text-xs font-semibold text-slate-100 bg-[#161F2E]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Fees, Taxes & Safety Guardrails */}
        <div className="space-y-3 pt-2 border-t border-[#2A3445]/60">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Percent className="w-3.5 h-3.5" />
            <span>Fees, GST & Price Safety Guardrails</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Convenience Fee / Seat</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-amber-400">
                  ₹
                </span>
                <Input
                  type="number"
                  min={0}
                  max={500}
                  value={convenienceFee}
                  onChange={(e) => setConvenienceFee(Number(e.target.value))}
                  className="pl-6 h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">GST Rate (%)</label>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={28}
                  step={0.5}
                  value={gstPercent}
                  onChange={(e) => setGstPercent(Number(e.target.value))}
                  className="pr-6 h-8 text-xs"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  %
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Min Price Floor (₹)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-amber-400">
                  ₹
                </span>
                <Input
                  type="number"
                  min={0}
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="pl-6 h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Max Price Ceiling (₹)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-amber-400">
                  ₹
                </span>
                <Input
                  type="number"
                  min={0}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="pl-6 h-8 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Live Price Calculation Preview Card */}
        <div className="p-3.5 bg-gradient-to-r from-[#111827] to-[#1E293B] border border-[#2A3445] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-xs font-semibold text-slate-200">
                Sample Checkout Preview (2 × {sampleTier} Seats)
              </p>
            </div>
            <p className="text-[11px] text-slate-400">
              Base: ₹{sampleSubtotal} (₹{sampleTicketPrice}/seat) + Fee: ₹{sampleConvFee} + GST ({gstPercent}%): ₹{sampleGst}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase text-slate-400 font-medium block">
              Grand Total
            </span>
            <span className="text-base font-bold text-emerald-400">
              ₹{sampleGrandTotal.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A3445]">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            iconLeft={<CheckCircle2 className="w-4 h-4" />}
          >
            {editingProfile ? "Save Profile Changes" : "Create Pricing Profile"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

