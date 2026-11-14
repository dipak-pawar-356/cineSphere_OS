"use client";

import React, { useState } from "react";
import { Modal } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import type {
  StaffMemberWithRoles,
  TheatreRoleWithPermissions,
  AssignRoleInput,
} from "@/types/theatre-staff.types";
import { ShieldCheck, AlertCircle } from "lucide-react";

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  theatreId: string;
  staff: StaffMemberWithRoles | null;
  roles: TheatreRoleWithPermissions[];
  onAssignRole: (input: AssignRoleInput) => Promise<void>;
}

export function AssignRoleModal({
  isOpen,
  onClose,
  theatreId,
  staff,
  roles,
  onAssignRole,
}: AssignRoleModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState(
    staff?.primaryRole?.id || roles[0]?.id || ""
  );
  const [isPrimary, setIsPrimary] = useState(true);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!staff) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) return;
    setError(null);
    setIsSubmitting(true);

    try {
      await onAssignRole({
        theatreId,
        staffId: staff.id,
        roleId: selectedRoleId,
        isPrimary,
        reason: reason.trim() || undefined,
      });
      onClose();
      setReason("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to assign role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Operational Role"
      description={`Update role assignments and access privileges for ${staff.displayName} (${staff.employeeCode}).`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-lg border border-[#2A3445]/60 bg-[#0F172A] p-3 text-xs text-slate-300">
          <p className="font-semibold text-white">{staff.displayName}</p>
          <p className="text-slate-400">
            {staff.designation} • {staff.department?.name || "General Crew"}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-slate-400">Current Role(s):</span>
            {staff.roles.map((r) => (
              <span
                key={r.id}
                className="rounded bg-[#1E293B] px-1.5 py-0.5 text-[11px] font-medium text-emerald-400"
              >
                {r.name}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">
            Select Role to Assign <span className="text-red-400">*</span>
          </label>
          <select
            required
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="w-full rounded-lg border border-[#2A3445] bg-[#0F172A] px-3 py-2 text-sm text-white focus:border-[#F59E0B] focus:outline-none"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.roleCode}) • Level {r.hierarchyLevel}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPrimary"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="h-4 w-4 rounded border-[#2A3445] bg-[#0F172A] text-[#F59E0B] focus:ring-0"
          />
          <label htmlFor="isPrimary" className="text-xs font-medium text-slate-300">
            Set as Primary Role for this crew member
          </label>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">
            Reason for Assignment / Promotion <span className="text-slate-500">(Logged to audit trail)</span>
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Promotion to Hall Supervisor following safety certifications..."
            className="w-full rounded-lg border border-[#2A3445] bg-[#0F172A] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-[#F59E0B] focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="gap-2 bg-[#F59E0B] font-medium text-slate-950 hover:bg-[#F59E0B]/90"
          >
            <ShieldCheck className="h-4 w-4" />
            {isSubmitting ? "Assigning..." : "Assign Role"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
