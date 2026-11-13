"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmenityIconResolver } from "./amenity-icon-resolver";
import type {
  AmenityCatalogRecord,
  AssignAmenityToTheatreInput,
  AmenityAvailabilityMode,
  AmenityVisibility,
} from "@/types/theatre-amenity.types";

interface TheatreAmenityAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssignAmenityToTheatreInput) => Promise<void>;
  theatreId: string;
  unassignedCatalog: AmenityCatalogRecord[];
}

export function TheatreAmenityAssignModal({
  isOpen,
  onClose,
  onSubmit,
  theatreId,
  unassignedCatalog,
}: TheatreAmenityAssignModalProps) {
  const [selectedAmenityId, setSelectedAmenityId] = useState("");
  const [availability, setAvailability] = useState<AmenityAvailabilityMode>("AVAILABLE");
  const [notes, setNotes] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [visibility, setVisibility] = useState<AmenityVisibility>("PUBLIC");
  const [isFeatured, setIsFeatured] = useState(false);

  // Facility Metadata
  const [parkingCapacity, setParkingCapacity] = useState("");
  const [evChargerCount, setEvChargerCount] = useState("");
  const [wifiSsid, setWifiSsid] = useState("");
  const [accessibilityNotes, setAccessibilityNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedItem = unassignedCatalog.find((c) => c.id === selectedAmenityId);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmenityId) {
      setError("Please select an amenity from the master catalog.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        theatreId,
        amenityId: selectedAmenityId,
        availability,
        notes: notes.trim() || undefined,
        displayOrder: Number(displayOrder) || 1,
        visibility,
        isFeatured,
        metadata: {
          parkingCapacity: parkingCapacity ? parseInt(parkingCapacity, 10) : null,
          evChargerCount: evChargerCount ? parseInt(evChargerCount, 10) : null,
          wifiSsid: wifiSsid.trim() || null,
          accessibilityNotes: accessibilityNotes.trim() || null,
        },
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to assign amenity.");
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
        aria-labelledby="assign-modal-title"
      >
        <div className="p-6 border-b border-[#1E293B] flex items-center justify-between">
          <div>
            <h2 id="assign-modal-title" className="text-lg font-bold text-white">
              Enable Theatre Amenity / Facility
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Select an amenity from the global catalog to enable for this cinema complex.
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

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Select Catalog Amenity <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedAmenityId}
              onChange={(e) => setSelectedAmenityId(e.target.value)}
              className="w-full h-11 px-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 focus:outline-none focus:border-red-500"
              required
            >
              <option value="">-- Choose from Master Catalog ({unassignedCatalog.length} available) --</option>
              {unassignedCatalog.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName} ({c.categoryCode}) — {c.priority} Priority
                </option>
              ))}
            </select>
          </div>

          {selectedItem && (
            <div className="p-3.5 rounded-xl bg-[#111827] border border-[#26334D] flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#161F2E] border border-[#2A3445] text-amber-400 shrink-0">
                <AmenityIconResolver iconName={selectedItem.defaultIcon} className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">{selectedItem.displayName}</h4>
                <p className="text-[11px] text-zinc-400">{selectedItem.description}</p>
              </div>
            </div>
          )}

          {/* Availability Mode (Capability #1) & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Availability Status <span className="text-red-500">*</span>
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as AmenityAvailabilityMode)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 focus:outline-none focus:border-red-500"
              >
                <option value="AVAILABLE">Available</option>
                <option value="TEMPORARILY_UNAVAILABLE">Temporarily Unavailable</option>
                <option value="SEASONAL">Seasonal</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Public Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as AmenityVisibility)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 focus:outline-none focus:border-red-500"
              >
                <option value="PUBLIC">Publicly Visible</option>
                <option value="HIDDEN">Hidden from Public</option>
                <option value="INTERNAL">Internal Operations Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Display Sequence
              </label>
              <Input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
                min={1}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Operational Notes / Local Instructions
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Screen 02 only, Valet drop-off at West Gate"
            />
          </div>

          {/* Facility Specific Metadata (Optional) */}
          <div className="p-3.5 rounded-xl bg-[#0A0E1A] border border-[#1E293B] space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Facility Specifications & Capacity (Optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Parking Capacity (Bays)</label>
                <Input
                  type="number"
                  value={parkingCapacity}
                  onChange={(e) => setParkingCapacity(e.target.value)}
                  placeholder="e.g. 450"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">EV Fast Chargers Count</label>
                <Input
                  type="number"
                  value={evChargerCount}
                  onChange={(e) => setEvChargerCount(e.target.value)}
                  placeholder="e.g. 6"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Guest Wi-Fi Network Name (SSID)</label>
                <Input
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="e.g. CineSphere-Phoenix-Guest"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Accessibility Pathway Notes</label>
                <Input
                  value={accessibilityNotes}
                  onChange={(e) => setAccessibilityNotes(e.target.value)}
                  placeholder="e.g. Ramp via West Lobby elevator core"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={loading || !selectedAmenityId}>
              {loading ? "Assigning..." : "Enable Amenity for Theatre"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
