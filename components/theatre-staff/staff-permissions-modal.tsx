"use client";

import React, { useState } from "react";
import { Modal } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import type {
  TheatreRoleWithPermissions,
  UpdateRolePermissionsInput,
} from "@/types/theatre-staff.types";
import { PLATFORM_PERMISSION_CATALOG } from "@/lib/repositories/theatre-staff.repository";
import { KeyRound, Shield, AlertCircle } from "lucide-react";

interface StaffPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theatreId: string;
  role: TheatreRoleWithPermissions | null;
  onUpdatePermissions: (input: UpdateRolePermissionsInput) => Promise<void>;
}

export function StaffPermissionsModal({
  isOpen,
  onClose,
  theatreId,
  role,
  onUpdatePermissions,
}: StaffPermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    role?.permissions.map((p) => p.permissionKey) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!role) return null;

  // Group permission catalog by module
  const groupedPermissions = PLATFORM_PERMISSION_CATALOG.reduce<Record<string, typeof PLATFORM_PERMISSION_CATALOG>>(
    (acc, p) => {
      if (!acc[p.module]) acc[p.module] = [];
      acc[p.module].push(p);
      return acc;
    },
    {}
  );

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: UpdateRolePermissionsInput["permissions"] = selectedPermissions.map((key) => {
        const item = PLATFORM_PERMISSION_CATALOG.find((p) => p.key === key);
        return {
          permissionKey: key,
          module: item?.module || "CUSTOM",
          isGranted: true,
        };
      });

      await onUpdatePermissions({
        theatreId,
        roleId: role.id,
        permissions: payload.length > 0 ? payload : [{ permissionKey: "dashboard:view", module: "DASHBOARD", isGranted: true }],
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Access Permissions: ${role.name}`}
      description={`Configure granular operational privileges for ${role.name} (${role.roleCode}). All crew members assigned to this role inherit these capabilities.`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border border-[#2A3445]/60 bg-[#0F172A] p-3 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#F59E0B]" />
            <span className="font-semibold text-white">{role.name}</span>
            <span className="text-slate-400">({role.roleCode}) • Level {role.hierarchyLevel}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedPermissions(PLATFORM_PERMISSION_CATALOG.map((p) => p.key))}
              className="text-xs text-[#F59E0B] hover:underline"
            >
              Select All
            </button>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={() => setSelectedPermissions([])}
              className="text-xs text-slate-400 hover:underline"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="max-h-72 space-y-4 overflow-y-auto rounded-lg border border-[#2A3445] bg-[#0F172A] p-3 text-xs">
          {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
            <div key={moduleName} className="space-y-2">
              <span className="font-semibold uppercase tracking-wider text-slate-400">
                {moduleName} Module
              </span>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {perms.map((p) => {
                  const isChecked = selectedPermissions.includes(p.key);
                  return (
                    <label
                      key={p.key}
                      className={`flex items-start gap-2 rounded-md border p-2 transition-colors cursor-pointer ${
                        isChecked
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : "border-[#2A3445]/60 bg-[#1E293B]/40 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(p.key)}
                        className="mt-0.5 h-3.5 w-3.5 rounded border-[#2A3445] bg-[#0F172A] text-emerald-500 focus:ring-0"
                      />
                      <div className="leading-tight">
                        <p className="font-medium text-white">{p.label}</p>
                        <p className="text-[10px] text-slate-500">{p.key}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
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
            <KeyRound className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Role Permissions"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
