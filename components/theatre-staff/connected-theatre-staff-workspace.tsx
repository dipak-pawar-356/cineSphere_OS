"use client";

import React, { useState } from "react";
import { TheatreStaffWorkspace } from "./theatre-staff-workspace";
import { OnboardStaffModal } from "./onboard-staff-modal";
import { AssignRoleModal } from "./assign-role-modal";
import { CustomRoleModal } from "./custom-role-modal";
import { StaffPermissionsModal } from "./staff-permissions-modal";
import { StaffDetailDrawer } from "./staff-detail-drawer";
import type {
  TheatreStaffOrganizationBundle,
  StaffMemberWithRoles,
  TheatreRoleWithPermissions,
  CreateStaffInput,
  InviteStaffInput,
  AssignRoleInput,
  SuspendStaffInput,
  ArchiveStaffInput,
  CreateTheatreRoleInput,
  InstantiateRoleFromTemplateInput,
  UpdateRolePermissionsInput,
} from "@/types/theatre-staff.types";
import {
  createStaffAction,
  inviteStaffAction,
  suspendStaffAction,
  archiveStaffAction,
  assignRoleAction,
  updateRolePermissionsAction,
  createTheatreRoleAction,
  instantiateRoleFromTemplateAction,
  getTheatreStaffBundleAction,
} from "@/actions/theatre-staff-actions";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

interface ConnectedTheatreStaffWorkspaceProps {
  initialBundle: TheatreStaffOrganizationBundle;
  theatreId: string;
  theatreName: string;
}

export function ConnectedTheatreStaffWorkspace({
  initialBundle,
  theatreId,
  theatreName,
}: ConnectedTheatreStaffWorkspaceProps) {
  const [bundle, setBundle] = useState<TheatreStaffOrganizationBundle>(initialBundle);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isCustomRoleModalOpen, setIsCustomRoleModalOpen] = useState(false);
  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  // Selected Entities
  const [selectedStaff, setSelectedStaff] = useState<StaffMemberWithRoles | null>(null);
  const [selectedRole, setSelectedRole] = useState<TheatreRoleWithPermissions | null>(null);

  const showNotice = (type: "success" | "error", message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 5000);
  };

  const refreshBundle = async () => {
    try {
      const res = await getTheatreStaffBundleAction({ theatreId });
      if (res.success && res.data) {
        setBundle(res.data);
      }
    } catch {
      // ignore in local background
    }
  };

  // Handlers
  const handleOnboard = async (input: CreateStaffInput) => {
    const res = await createStaffAction(input);
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to onboard crew member.");
    }
    showNotice("success", `Crew member '${res.data?.displayName}' onboarded with code ${res.data?.employeeCode}.`);
    await refreshBundle();
  };

  const handleInvite = async (input: InviteStaffInput) => {
    const res = await inviteStaffAction(input);
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to send staff invitation.");
    }
    showNotice("success", `Staff invitation successfully dispatched to ${input.email}.`);
    await refreshBundle();
  };

  const handleAssignRole = async (input: AssignRoleInput) => {
    const res = await assignRoleAction(input);
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to assign role.");
    }
    showNotice("success", `Role successfully updated for ${selectedStaff?.displayName}.`);
    await refreshBundle();
  };

  const handleSuspendStaff = async (input: SuspendStaffInput) => {
    const res = await suspendStaffAction(input);
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to suspend staff member.");
    }
    showNotice("success", `Crew member suspended. Action logged to audit trail.`);
    await refreshBundle();
  };

  const handleArchiveStaff = async (input: ArchiveStaffInput) => {
    const res = await archiveStaffAction(input);
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to archive staff member.");
    }
    showNotice("success", `Crew member profile archived.`);
    await refreshBundle();
  };

  const handleCreateCustomRole = async (input: CreateTheatreRoleInput) => {
    const res = await createTheatreRoleAction(input);
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to create custom role.");
    }
    showNotice("success", `Custom role '${res.data?.name}' created successfully.`);
    await refreshBundle();
  };

  const handleInstantiateTemplate = async (input: InstantiateRoleFromTemplateInput) => {
    const res = await instantiateRoleFromTemplateAction(input);
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to instantiate role from template.");
    }
    showNotice("success", `Role '${res.data?.name}' created from platform template.`);
    await refreshBundle();
  };

  const handleUpdatePermissions = async (input: UpdateRolePermissionsInput) => {
    const res = await updateRolePermissionsAction(input);
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to update role permissions.");
    }
    showNotice("success", `Access permissions updated successfully.`);
    await refreshBundle();
  };

  return (
    <div className="space-y-4">
      {notice && (
        <div
          className={`flex items-center justify-between rounded-lg border p-3 text-sm transition-all ${
            notice.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/20 bg-red-500/10 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <TheatreStaffWorkspace
        bundle={bundle}
        theatreName={theatreName}
        onOpenOnboardModal={() => setIsOnboardModalOpen(true)}
        onOpenCustomRoleModal={() => setIsCustomRoleModalOpen(true)}
        onOpenAssignRoleModal={(staff) => {
          setSelectedStaff(staff);
          setIsAssignRoleModalOpen(true);
        }}
        onOpenPermissionsModal={(role) => {
          setSelectedRole(role);
          setIsPermissionsModalOpen(true);
        }}
        onOpenStaffDetail={(staff) => {
          setSelectedStaff(staff);
          setIsDetailDrawerOpen(true);
        }}
      />

      {/* Onboard Modal */}
      <OnboardStaffModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        theatreId={theatreId}
        departments={bundle.departments}
        roles={bundle.roles}
        onOnboard={handleOnboard}
        onInvite={handleInvite}
      />

      {/* Assign Role Modal */}
      <AssignRoleModal
        isOpen={isAssignRoleModalOpen}
        onClose={() => {
          setIsAssignRoleModalOpen(false);
          setSelectedStaff(null);
        }}
        theatreId={theatreId}
        staff={selectedStaff}
        roles={bundle.roles}
        onAssignRole={handleAssignRole}
      />

      {/* Custom Role / Template Modal */}
      <CustomRoleModal
        isOpen={isCustomRoleModalOpen}
        onClose={() => setIsCustomRoleModalOpen(false)}
        theatreId={theatreId}
        templates={bundle.templates}
        onCreateCustomRole={handleCreateCustomRole}
        onInstantiateTemplate={handleInstantiateTemplate}
      />

      {/* Permissions Modal */}
      <StaffPermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          setSelectedRole(null);
        }}
        theatreId={theatreId}
        role={selectedRole}
        onUpdatePermissions={handleUpdatePermissions}
      />

      {/* Staff Detail Drawer */}
      <StaffDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => {
          setIsDetailDrawerOpen(false);
          setSelectedStaff(null);
        }}
        staff={selectedStaff}
        theatreId={theatreId}
        onOpenAssignRole={(staff) => {
          setSelectedStaff(staff);
          setIsAssignRoleModalOpen(true);
        }}
        onSuspend={handleSuspendStaff}
        onArchive={handleArchiveStaff}
      />
    </div>
  );
}
