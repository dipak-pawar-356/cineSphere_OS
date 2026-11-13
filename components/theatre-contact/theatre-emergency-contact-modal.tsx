"use client";

import React, { useState, useEffect } from "react";
import { X, AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  TheatreContactWithDetails,
  CreateTheatreContactInput,
  UpdateTheatreContactInput,
  ContactVisibility,
} from "@/types/theatre-contact.types";

interface TheatreEmergencyContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTheatreContactInput | UpdateTheatreContactInput) => Promise<void>;
  theatreId: string;
  initialData?: TheatreContactWithDetails | null;
}

export function TheatreEmergencyContactModal({
  isOpen,
  onClose,
  onSubmit,
  theatreId,
  initialData,
}: TheatreEmergencyContactModalProps) {
  const isEditing = Boolean(initialData);

  const [title, setTitle] = useState("24/7 Fire & Medical Emergency Control Desk");
  const [contactPersonName, setContactPersonName] = useState("");
  const [roleOrDesignation, setRoleOrDesignation] = useState("Chief Safety & Fire Evacuation Officer");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [availabilityHours, setAvailabilityHours] = useState("24/7 Priority Emergency Line");
  const [emergencyType, setEmergencyType] = useState("MEDICAL_FIRE_SAFETY");
  const [operatingProcedures, setOperatingProcedures] = useState("");
  const [visibility, setVisibility] = useState<ContactVisibility>("PUBLIC");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setVisibility(initialData.visibility);
      const emg = initialData.emergencyContact;
      if (emg) {
        setContactPersonName(emg.contactPersonName);
        setRoleOrDesignation(emg.roleOrDesignation);
        setPrimaryPhone(emg.primaryPhone);
        setAlternatePhone(emg.alternatePhone || "");
        setAvailabilityHours(emg.availabilityHours || "24/7 Priority Emergency Line");
        setEmergencyType(emg.emergencyType || "MEDICAL_FIRE_SAFETY");
        setOperatingProcedures(emg.operatingProcedures || "");
      }
    } else {
      setTitle("24/7 Fire & Medical Emergency Control Desk");
      setContactPersonName("");
      setRoleOrDesignation("Chief Safety & Fire Evacuation Officer");
      setPrimaryPhone("");
      setAlternatePhone("");
      setAvailabilityHours("24/7 Priority Emergency Line");
      setEmergencyType("MEDICAL_FIRE_SAFETY");
      setOperatingProcedures("Emergency muster point: West Plaza Car Park. First aid defibrillator: Screen 01 corridor.");
      setVisibility("PUBLIC");
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPersonName.trim()) {
      setError("Contact person name is required.");
      return;
    }
    if (!primaryPhone.trim()) {
      setError("Primary emergency phone is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing && initialData) {
        await onSubmit({
          contactId: initialData.id,
          theatreId,
          expectedVersion: initialData.version,
          title: title.trim(),
          contactRole: "EMERGENCY_DESK",
          visibility,
          availabilityMode: "EMERGENCY_ONLY",
          emergencyContact: {
            contactPersonName: contactPersonName.trim(),
            roleOrDesignation: roleOrDesignation.trim(),
            primaryPhone: primaryPhone.trim(),
            alternatePhone: alternatePhone.trim() || null,
            availabilityHours: availabilityHours.trim(),
            emergencyType: emergencyType.trim(),
            operatingProcedures: operatingProcedures.trim() || null,
          },
        });
      } else {
        await onSubmit({
          theatreId,
          channelType: "EMERGENCY",
          contactRole: "EMERGENCY_DESK",
          title: title.trim(),
          visibility,
          availabilityMode: "EMERGENCY_ONLY",
          businessHours: availabilityHours.trim(),
          emergencyContact: {
            contactPersonName: contactPersonName.trim(),
            roleOrDesignation: roleOrDesignation.trim(),
            primaryPhone: primaryPhone.trim(),
            alternatePhone: alternatePhone.trim() || null,
            availabilityHours: availabilityHours.trim(),
            emergencyType: emergencyType.trim(),
            operatingProcedures: operatingProcedures.trim() || null,
          },
        });
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save emergency contact.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0F172A] border border-red-500/30 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-modal-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#1E293B] flex items-center justify-between bg-red-950/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 id="emergency-modal-title" className="text-lg font-bold text-white">
                {isEditing ? "Configure Emergency Contact" : "Register Emergency Response Desk"}
              </h2>
              <p className="text-xs text-[#94A3B8]">
                24/7 medical, fire evacuation, and urgent safety escalation directory.
              </p>
            </div>
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
              Desk Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 24/7 Fire & Medical Emergency Control Desk"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Responsible Officer Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={contactPersonName}
                onChange={(e) => setContactPersonName(e.target.value)}
                placeholder="e.g. Rajesh Kulkarni"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Designation / Incident Role <span className="text-red-500">*</span>
              </label>
              <Input
                value={roleOrDesignation}
                onChange={(e) => setRoleOrDesignation(e.target.value)}
                placeholder="e.g. Chief Safety & Fire Evacuation Officer"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Priority Emergency Phone <span className="text-red-500">*</span>
              </label>
              <Input
                value={primaryPhone}
                onChange={(e) => setPrimaryPhone(e.target.value)}
                placeholder="e.g. +91 98200 99999"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Alternate / Control Room Phone
              </label>
              <Input
                value={alternatePhone}
                onChange={(e) => setAlternatePhone(e.target.value)}
                placeholder="e.g. 020-66451101"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Availability Standard
              </label>
              <Input
                value={availabilityHours}
                onChange={(e) => setAvailabilityHours(e.target.value)}
                placeholder="e.g. 24/7 Priority Emergency Line"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Incident Classification
              </label>
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 focus:outline-none focus:border-red-500"
              >
                <option value="MEDICAL_FIRE_SAFETY">Medical, Fire & Evacuation</option>
                <option value="SECURITY_LAW_ORDER">Security & Crowd Control</option>
                <option value="ELECTRICAL_FACILITY">Electrical & Structural Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Operating Procedures & Muster Guidance (Optional)
            </label>
            <textarea
              value={operatingProcedures}
              onChange={(e) => setOperatingProcedures(e.target.value)}
              rows={2}
              className="w-full p-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-red-500"
              placeholder="e.g. Emergency muster point: West Plaza Car Park. First aid kit & defibrillator: Screen 01 corridor."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Directory Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as ContactVisibility)}
              className="w-full h-10 px-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 focus:outline-none focus:border-red-500"
            >
              <option value="PUBLIC">Publicly Visible on Theatre Profile</option>
              <option value="INTERNAL_ONLY">Internal Operations & Floor Ushers Only</option>
              <option value="HIDDEN">Hidden</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={loading} className="bg-red-600 hover:bg-red-500 text-white">
              {loading ? "Saving..." : isEditing ? "Save Emergency Contact" : "Register Emergency Desk"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
