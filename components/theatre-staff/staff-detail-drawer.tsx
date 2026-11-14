"use client";

import React, { useState } from "react";
import { Modal } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import { StaffStatusBadge } from "./staff-status-badge";
import type {
  StaffMemberWithRoles,
  SuspendStaffInput,
  ArchiveStaffInput,
} from "@/types/theatre-staff.types";
import {
  User,
  Mail,
  Phone,
  Shield,
  Building,
  Calendar,
  AlertTriangle,
  Archive,
  ShieldAlert,
  KeyRound,
  FileText,
} from "lucide-react";

interface StaffDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMemberWithRoles | null;
  theatreId: string;
  onOpenAssignRole: (staff: StaffMemberWithRoles) => void;
  onSuspend: (input: SuspendStaffInput) => Promise<void>;
  onArchive: (input: ArchiveStaffInput) => Promise<void>;
}

export function StaffDetailDrawer({
  isOpen,
  onClose,
  staff,
  theatreId,
  onOpenAssignRole,
  onSuspend,
  onArchive,
}: StaffDetailDrawerProps) {
  const [suspendReason, setSuspendReason] = useState("");
  const [showSuspendInput, setShowSuspendInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!staff) return null;

  const handleSuspendSubmit = async () => {
    if (!suspendReason.trim()) {
      setError("Please provide a suspension reason for audit tracking.");
      return;
    }
    setError(null);
    setIsProcessing(true);
    try {
      await onSuspend({
        id: staff.id,
        theatreId,
        reason: suspendReason.trim(),
      });
      setShowSuspendInput(false);
      setSuspendReason("");
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to suspend staff member.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchiveSubmit = async () => {
    if (!confirm(`Are you sure you want to archive crew member ${staff.displayName}?`)) {
      return;
    }
    setError(null);
    setIsProcessing(true);
    try {
      await onArchive({
        id: staff.id,
        theatreId,
        reason: "Archived from staff management drawer",
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to archive staff member.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Staff Profile & Security Dossier"
      description={`Employee Code: ${staff.employeeCode} • Managed within theatre tenant`}
      size="lg"
    >
      <div className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="flex items-start gap-4 rounded-xl border border-[#2A3445] bg-[#0F172A] p-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300 border border-[#2A3445]">
            {staff.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={staff.avatarUrl}
                alt={staff.displayName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <User className="h-7 w-7 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white truncate">{staff.displayName}</h3>
              <StaffStatusBadge status={staff.employmentStatus} size="sm" />
            </div>
            <p className="text-xs text-[#F59E0B] font-medium mt-0.5">{staff.designation}</p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-slate-500" />
              {staff.department?.name || "General Floor Operations"} ({staff.department?.code || "GEN"})
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-lg border border-[#2A3445]/60 bg-[#0F172A]/60 p-3 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-indigo-400" /> Email Address
            </span>
            <p className="text-white font-medium break-all">{staff.email}</p>
          </div>
          <div className="rounded-lg border border-[#2A3445]/60 bg-[#0F172A]/60 p-3 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-emerald-400" /> Direct Phone
            </span>
            <p className="text-white font-medium">{staff.phone}</p>
          </div>
          <div className="rounded-lg border border-[#2A3445]/60 bg-[#0F172A]/60 p-3 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-400" /> Joining Date
            </span>
            <p className="text-white font-medium">
              {staff.joiningDate
                ? new Date(staff.joiningDate).toLocaleDateString()
                : "Pending First Shift"}
            </p>
          </div>
          <div className="rounded-lg border border-[#2A3445]/60 bg-[#0F172A]/60 p-3 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-400" /> Emergency Contact
            </span>
            <p className="text-white font-medium">
              {staff.emergencyContact?.name
                ? `${staff.emergencyContact.name} (${staff.emergencyContact.phone || "No phone"})`
                : "Not Provided"}
            </p>
          </div>
        </div>

        {/* Roles & Permissions */}
        <div className="rounded-lg border border-[#2A3445] bg-[#0F172A] p-3 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-[#F59E0B]" /> Assigned Roles ({staff.roles.length})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onOpenAssignRole(staff);
              }}
              className="h-7 text-[11px] gap-1"
            >
              <KeyRound className="h-3 w-3" /> Reassign Role
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {staff.roles.map((r) => (
              <span
                key={r.id}
                className={`rounded-md px-2 py-1 text-xs font-medium border ${
                  staff.primaryRole?.id === r.id
                    ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
                    : "border-slate-700 bg-slate-800 text-slate-300"
                }`}
              >
                {r.name} {staff.primaryRole?.id === r.id && "★ (Primary)"}
              </span>
            ))}
          </div>

          <div className="pt-2 border-t border-[#2A3445]/60">
            <span className="text-slate-400 block mb-1">
              Active Capability Privileges ({staff.permissions.length} Granted):
            </span>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {staff.permissions.map((p) => (
                <span
                  key={p}
                  className="rounded bg-[#1E293B] px-1.5 py-0.5 text-[10px] text-emerald-400 font-mono"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* HR Notes */}
        {staff.notes && (
          <div className="rounded-lg border border-[#2A3445]/60 bg-[#0F172A]/40 p-3 text-xs">
            <span className="font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
              <FileText className="h-3.5 w-3.5 text-slate-500" /> Operational & HR Notes
            </span>
            <p className="text-slate-300 whitespace-pre-line">{staff.notes}</p>
          </div>
        )}

        {/* Suspension Input Panel */}
        {showSuspendInput && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs space-y-2">
            <span className="font-semibold text-rose-300 block">
              Confirm Crew Suspension
            </span>
            <input
              type="text"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Mandatory reason for suspension (e.g. Conduct review, unexcused absence)..."
              className="w-full rounded-md border border-rose-500/40 bg-[#0F172A] px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSuspendInput(false)}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSuspendSubmit}
                disabled={isProcessing}
                className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isProcessing ? "Suspending..." : "Confirm Suspend"}
              </Button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#2A3445]">
          <div className="flex gap-2">
            {staff.employmentStatus === "ACTIVE" && !showSuspendInput && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSuspendInput(true)}
                className="text-xs border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
              >
                Suspend
              </Button>
            )}
            {staff.employmentStatus !== "ARCHIVED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleArchiveSubmit}
                disabled={isProcessing}
                className="text-xs border-slate-700 text-slate-400 hover:text-white"
              >
                <Archive className="h-3.5 w-3.5 mr-1" /> Archive
              </Button>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
