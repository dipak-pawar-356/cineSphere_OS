"use client";

import React, { useState } from "react";
import { Modal } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import type {
  CreateStaffInput,
  InviteStaffInput,
  StaffDepartmentRecord,
  TheatreRoleWithPermissions,
} from "@/types/theatre-staff.types";
import { UserPlus, Mail, Shield, Building, Phone, AlertCircle } from "lucide-react";

interface OnboardStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  theatreId: string;
  departments: StaffDepartmentRecord[];
  roles: TheatreRoleWithPermissions[];
  onOnboard: (input: CreateStaffInput) => Promise<void>;
  onInvite: (input: InviteStaffInput) => Promise<void>;
}

export function OnboardStaffModal({
  isOpen,
  onClose,
  theatreId,
  departments,
  roles,
  onOnboard,
  onInvite,
}: OnboardStaffModalProps) {
  const [mode, setMode] = useState<"ONBOARD" | "INVITE">("ONBOARD");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || "");
  const [roleId, setRoleId] = useState(roles[0]?.id || "");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "INVITE") {
        await onInvite({
          theatreId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          designation: designation.trim() || "Crew Member",
          departmentId: departmentId || undefined,
          roleId,
          notes: notes.trim() || undefined,
        });
      } else {
        await onOnboard({
          theatreId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          designation: designation.trim() || "Crew Member",
          departmentId: departmentId || undefined,
          roleId,
          emergencyContact: emergencyName.trim()
            ? {
                name: emergencyName.trim(),
                relationship: "Next of Kin",
                phone: emergencyPhone.trim(),
              }
            : undefined,
          notes: notes.trim() || undefined,
        });
      }
      onClose();
      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setDesignation("");
      setNotes("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to onboard staff member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "ONBOARD" ? "Onboard Crew Member" : "Invite Staff Member"}
      description="Add team members to your theatre organization. Roles and permissions are completely isolated to this venue."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex rounded-lg border border-[#2A3445] bg-[#0F172A] p-1">
          <button
            type="button"
            onClick={() => setMode("ONBOARD")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition-colors ${
              mode === "ONBOARD"
                ? "bg-[#1E293B] text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5 text-[#F59E0B]" />
            Direct Onboard (Active)
          </button>
          <button
            type="button"
            onClick={() => setMode("INVITE")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition-colors ${
              mode === "INVITE"
                ? "bg-[#1E293B] text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Mail className="h-3.5 w-3.5 text-indigo-400" />
            Send Email Invitation
          </button>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              First Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Rahul"
              className="w-full rounded-lg border border-[#2A3445] bg-[#0F172A] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-[#F59E0B] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Last Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Kulkarni"
              className="w-full rounded-lg border border-[#2A3445] bg-[#0F172A] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-[#F59E0B] focus:outline-none"
            />
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Work Email <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@cinesphere.com"
                className="w-full rounded-lg border border-[#2A3445] bg-[#0F172A] py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Phone Number {mode === "ONBOARD" && <span className="text-red-400">*</span>}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                required={mode === "ONBOARD"}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98230 00000"
                className="w-full rounded-lg border border-[#2A3445] bg-[#0F172A] py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Designation, Department, Role */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Job Designation <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Floor Supervisor"
              className="w-full rounded-lg border border-[#2A3445] bg-[#0F172A] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-[#F59E0B] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Department <Building className="inline h-3 w-3 text-slate-400" />
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full rounded-lg border border-[#2A3445] bg-[#0F172A] px-3 py-2 text-sm text-white focus:border-[#F59E0B] focus:outline-none"
            >
              <option value="">No Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Assigned Role <Shield className="inline h-3 w-3 text-[#F59E0B]" />
            </label>
            <select
              required
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full rounded-lg border border-[#2A3445] bg-[#0F172A] px-3 py-2 text-sm text-white focus:border-[#F59E0B] focus:outline-none"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.roleCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Emergency Contact (Onboard Mode only) */}
        {mode === "ONBOARD" && (
          <div className="rounded-lg border border-[#2A3445]/60 bg-[#0F172A]/60 p-3">
            <span className="mb-2 block text-xs font-medium text-slate-300">
              Emergency Contact (Optional)
            </span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Contact Person Name"
                className="rounded-lg border border-[#2A3445] bg-[#0F172A] px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-[#F59E0B] focus:outline-none"
              />
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="Emergency Contact Phone"
                className="rounded-lg border border-[#2A3445] bg-[#0F172A] px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">
            Internal HR & Operations Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special certifications, hall allocations, or emergency instructions..."
            className="w-full rounded-lg border border-[#2A3445] bg-[#0F172A] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-[#F59E0B] focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="bg-[#F59E0B] font-medium text-slate-950 hover:bg-[#F59E0B]/90"
          >
            {isSubmitting ? "Processing..." : mode === "ONBOARD" ? "Complete Onboarding" : "Send Invitation"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
