"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmenityIconResolver } from "./amenity-icon-resolver";
import type {
  AmenityCatalogRecord,
  AmenityCategoryRecord,
  CreateAmenityCatalogInput,
  UpdateAmenityCatalogInput,
  AmenityPriority,
  AmenityStatus,
} from "@/types/theatre-amenity.types";

interface AmenityCatalogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAmenityCatalogInput | UpdateAmenityCatalogInput) => Promise<void>;
  categories: AmenityCategoryRecord[];
  initialData?: AmenityCatalogRecord | null;
}

const COMMON_ICONS = [
  "Sparkles",
  "Car",
  "Accessibility",
  "ArrowUpDown",
  "MoveUpRight",
  "Utensils",
  "Coffee",
  "Armchair",
  "Volume2",
  "Film",
  "Zap",
  "Tv",
  "Smile",
  "BatteryCharging",
  "Building",
  "DoorClosed",
  "GlassWater",
  "Wifi",
  "ConciergeBell",
  "ShieldCheck",
];

export function AmenityCatalogFormModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData,
}: AmenityCatalogFormModalProps) {
  const isEditing = Boolean(initialData);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [defaultIcon, setDefaultIcon] = useState("Sparkles");
  const [priority, setPriority] = useState<AmenityPriority>("STANDARD");
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [status, setStatus] = useState<AmenityStatus>("ACTIVE");
  const [nameHindi, setNameHindi] = useState("");
  const [nameMarathi, setNameMarathi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setName(initialData.name);
      setDisplayName(initialData.displayName);
      setDescription(initialData.description || "");
      setCategoryId(initialData.categoryId);
      setDefaultIcon(initialData.defaultIcon || "Sparkles");
      setPriority(initialData.priority);
      setIsFeatured(initialData.isFeatured);
      setDisplayOrder(initialData.displayOrder);
      setStatus(initialData.status);
      setNameHindi(initialData.localizedNames?.hi || "");
      setNameMarathi(initialData.localizedNames?.mr || "");
    } else {
      setCode("");
      setName("");
      setDisplayName("");
      setDescription("");
      setCategoryId(categories[0]?.id || "");
      setDefaultIcon("Sparkles");
      setPriority("STANDARD");
      setIsFeatured(false);
      setDisplayOrder(0);
      setStatus("ACTIVE");
      setNameHindi("");
      setNameMarathi("");
    }
    setError(null);
  }, [initialData, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Amenity name is required.");
      return;
    }
    if (!code.trim()) {
      setError("Amenity code is required.");
      return;
    }
    if (!categoryId) {
      setError("Please select an amenity category.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const localizedNames: Record<string, string> = {};
      if (nameHindi.trim()) localizedNames.hi = nameHindi.trim();
      if (nameMarathi.trim()) localizedNames.mr = nameMarathi.trim();

      if (isEditing && initialData) {
        await onSubmit({
          id: initialData.id,
          expectedVersion: initialData.version,
          code: code.trim(),
          name: name.trim(),
          displayName: displayName.trim() || name.trim(),
          description: description.trim() || undefined,
          categoryId,
          defaultIcon,
          priority,
          isFeatured,
          displayOrder: Number(displayOrder),
          status,
          localizedNames,
        });
      } else {
        await onSubmit({
          code: code.trim(),
          name: name.trim(),
          displayName: displayName.trim() || name.trim(),
          description: description.trim() || undefined,
          categoryId,
          defaultIcon,
          priority,
          isFeatured,
          displayOrder: Number(displayOrder),
          status,
          localizedNames,
        });
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save catalog amenity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0F172A] border border-[#1E293B] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-modal-title"
      >
        <div className="p-6 border-b border-[#1E293B] flex items-center justify-between">
          <div>
            <h2 id="catalog-modal-title" className="text-lg font-bold text-white">
              {isEditing ? `Edit Master Amenity: ${initialData?.name}` : "Create Master Catalog Amenity"}
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Define global cinema amenities and facilities available across the entire circuit.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-[#94A3B8] hover:text-white rounded-xl hover:bg-[#1E293B] transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-red-950/60 border border-red-800 text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Amenity Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!isEditing && !code) {
                    setCode(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }
                }}
                placeholder="e.g. Dolby Atmos Spatial Audio"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                System Code (Slug) <span className="text-red-500">*</span>
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="e.g. dolby-atmos"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Public Display Name
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Defaults to Amenity Name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 focus:outline-none focus:border-red-500"
                required
              >
                <option value="">Select a Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.displayName} ({c.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full p-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-red-500"
              placeholder="Detailed description of hardware, audio, seating, or hospitality specification..."
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              Default Icon
            </label>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 rounded-xl bg-[#0A0E1A] border border-[#1E293B]">
              {COMMON_ICONS.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  onClick={() => setDefaultIcon(icon)}
                  className={`p-2 rounded-lg border flex items-center gap-1.5 text-xs transition-all ${
                    defaultIcon === icon
                      ? "bg-red-950/70 border-red-500 text-red-300"
                      : "bg-[#161F2E] border-[#2A3445] text-zinc-400 hover:text-white"
                  }`}
                >
                  <AmenityIconResolver iconName={icon} className="h-4 w-4" />
                  <span>{icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority & Featured Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as AmenityPriority)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 focus:outline-none focus:border-red-500"
              >
                <option value="CRITICAL">Critical (ADA / Safety)</option>
                <option value="FEATURED">Featured (Hero Showcase)</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="STANDARD">Standard</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AmenityStatus)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 focus:outline-none focus:border-red-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Display Order
              </label>
              <Input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                min={0}
              />
            </div>
          </div>

          {/* Multilingual Localization (Capability #2) */}
          <div className="p-3 rounded-xl bg-[#0A0E1A] border border-[#1E293B] space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Multilingual Localization Readiness
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Hindi (हिंदी)</label>
                <Input
                  value={nameHindi}
                  onChange={(e) => setNameHindi(e.target.value)}
                  placeholder="उदा. डॉल्बी एटमॉस"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Marathi (मराठी)</label>
                <Input
                  value={nameMarathi}
                  onChange={(e) => setNameMarathi(e.target.value)}
                  placeholder="उदा. डॉल्बी अ‍ॅटमॉस"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update Master Amenity" : "Create Master Amenity"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
