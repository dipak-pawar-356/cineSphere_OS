"use client";

import React, { useState, useEffect } from "react";
import { X, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  TheatreContactWithDetails,
  CreateTheatreContactInput,
  UpdateTheatreContactInput,
  ContactVisibility,
} from "@/types/theatre-contact.types";

interface TheatreManagerContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTheatreContactInput | UpdateTheatreContactInput) => Promise<void>;
  theatreId: string;
  initialData?: TheatreContactWithDetails | null;
}

export function TheatreManagerContactModal({
  isOpen,
  onClose,
  onSubmit,
  theatreId,
  initialData,
}: TheatreManagerContactModalProps) {
  const isEditing = Boolean(initialData);

  const [title, setTitle] = useState("General Manager Operations Desk");
  const [managerName, setManagerName] = useState("");
  const [designation, setDesignation] = useState("General Manager");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Operations");
  const [shiftHours, setShiftHours] = useState("10:00 AM - 11:30 PM (Operating Hours)");
  const [escalationTier, setEscalationTier] = useState(1);
  const [visibility, setVisibility] = useState<ContactVisibility>("PUBLIC");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setVisibility(initialData.visibility);
      const mgr = initialData.managerContact;
      if (mgr) {
        setManagerName(mgr.managerName);
        setDesignation(mgr.designation);
        setPhone(mgr.phone);
        setEmail(mgr.email);
        setDepartment(mgr.department);
        setShiftHours(mgr.shiftHours || "10:00 AM - 11:30 PM");
        setEscalationTier(mgr.escalationTier || 1);
      }
    } else {
      setTitle("General Manager Operations Desk");
      setManagerName("");
      setDesignation("General Manager");
      setPhone("");
      setEmail("");
      setDepartment("Operations");
      setShiftHours("10:00 AM - 11:30 PM (Operating Hours)");
      setEscalationTier(1);
      setVisibility("PUBLIC");
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerName.trim()) {
      setError("Manager name is required.");
      return;
    }
    if (!phone.trim()) {
      setError("Direct phone number is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email address is required.");
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
          contactRole: "DUTY_MANAGER",
          visibility,
          availabilityMode: "SHOWTIME_ONLY",
          managerContact: {
            managerName: managerName.trim(),
            designation: designation.trim(),
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            department: department.trim(),
            shiftHours: shiftHours.trim() || null,
            escalationTier: Number(escalationTier),
          },
        });
      } else {
        await onSubmit({
          theatreId,
          channelType: "MANAGER",
          contactRole: "DUTY_MANAGER",
          title: title.trim(),
          visibility,
          availabilityMode: "SHOWTIME_ONLY",
          businessHours: shiftHours.trim(),
          managerContact: {
            managerName: managerName.trim(),
            designation: designation.trim(),
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            department: department.trim(),
            shiftHours: shiftHours.trim() || null,
            escalationTier: Number(escalationTier),
          },
        });
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save manager contact.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0F172A] border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manager-modal-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#1E293B] flex items-center justify-between bg-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 id="manager-modal-title" className="text-lg font-bold text-white">
                {isEditing ? "Configure Duty Manager Contact" : "Assign Duty / General Manager"}
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Senior operational management and patron service escalations.
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
              Contact Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. General Manager Operations Desk"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Manager Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="e.g. Amit Deshmukh"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Official Designation <span className="text-red-500">*</span>
              </label>
              <Input
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. General Manager — Pune Complex"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Direct Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98221 44556"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Direct Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. amit.deshmukh@cinesphere.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Department
              </label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Operations"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Shift / Operating Hours
              </label>
              <Input
                value={shiftHours}
                onChange={(e) => setShiftHours(e.target.value)}
                placeholder="e.g. 10:00 AM - 11:30 PM"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Escalation Tier
              </label>
              <select
                value={escalationTier}
                onChange={(e) => setEscalationTier(parseInt(e.target.value, 10) || 1)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                <option value={1}>Tier 1: Shift Supervisor</option>
                <option value={2}>Tier 2: Assistant Duty Manager</option>
                <option value={3}>Tier 3: Complex General Manager</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Profile Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as ContactVisibility)}
              className="w-full h-10 px-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              <option value="PUBLIC">Publicly Visible on Cinema Profile</option>
              <option value="INTERNAL_ONLY">Internal Only (Staff Directory)</option>
              <option value="HIDDEN">Hidden</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Save Manager Contact" : "Assign Duty Manager"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
