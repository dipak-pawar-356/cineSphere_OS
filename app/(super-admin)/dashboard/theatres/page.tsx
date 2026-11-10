"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import {
  Building2,
  Plus,
  MapPin,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PauseCircle,
  PlayCircle,
  Trash2,
  Edit,
  Eye,
  CreditCard,
  Archive,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ManagedTheatreEntity,
  TheatreLifecycleState,
  TheatreApprovalState,
  CreateTheatreInput,
  UpdateTheatreInput,
  PaginatedTheatresResult,
} from "@/types/theatre-lifecycle.types";
import {
  searchTheatresLifecycleAction,
  createTheatreLifecycleAction,
  updateTheatreLifecycleAction,
  submitTheatreForApprovalAction,
  approveTheatreLifecycleAction,
  rejectTheatreLifecycleAction,
  requestTheatreRevisionAction,
  activateTheatreLifecycleAction,
  suspendTheatreLifecycleAction,
  resumeTheatreLifecycleAction,
  archiveTheatreLifecycleAction,
  restoreTheatreLifecycleAction,
  softDeleteTheatreLifecycleAction,
} from "@/actions/theatre-lifecycle-actions";
import {
  LifecycleStatusBadge,
  ApprovalStatusBadge,
  type LifecycleModalActionType,
} from "@/components/theatre-lifecycle";

const LazyCreateEditTheatreModal = dynamic(
  () => import("@/components/theatre-lifecycle/create-edit-theatre-modal").then((m) => m.CreateEditTheatreModal),
  { ssr: false }
);
const LazyLifecycleActionModal = dynamic(
  () => import("@/components/theatre-lifecycle/lifecycle-action-modal").then((m) => m.LifecycleActionModal),
  { ssr: false }
);

const SUPER_ADMIN_ACTOR = {
  userId: "usr-super-1",
  name: "Vikram Singhania",
  role: "SUPER_ADMIN" as const,
};

export default function SuperAdminTheatresManagementPage() {
  const [data, setData] = useState<PaginatedTheatresResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter, Search & Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<TheatreLifecycleState | "ALL">("ALL");
  const [filterApproval, setFilterApproval] = useState<TheatreApprovalState | "ALL">("ALL");
  const [createdFrom, setCreatedFrom] = useState("");
  const [updatedFrom, setUpdatedFrom] = useState("");
  const [onlySuspended, setOnlySuspended] = useState(false);
  const [onlyArchived, setOnlyArchived] = useState(false);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "city" | "createdAt" | "status" | "hallCount">("name");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingTheatre, setEditingTheatre] = useState<ManagedTheatreEntity | null>(null);

  const [lifecycleModalOpen, setLifecycleModalOpen] = useState(false);
  const [lifecycleActionType, setLifecycleActionType] = useState<LifecycleModalActionType | null>(null);
  const [targetTheatre, setTargetTheatre] = useState<ManagedTheatreEntity | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  // Toast feedback banner
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotice = (text: string, type: "success" | "error" = "success") => {
    setActionNotice({ type, text });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const loadTheatres = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchTheatresLifecycleAction(
        {
          query: searchQuery.trim() || undefined,
          status: filterStatus,
          approvalStatus: filterApproval,
          onlySuspended,
          onlyArchived,
          includeDeleted,
          createdFrom: createdFrom || undefined,
          updatedFrom: updatedFrom || undefined,
          sortBy,
          page: currentPage,
          pageSize,
        },
        SUPER_ADMIN_ACTOR
      );
      if (res.success && res.data) {
        setData(res.data);
      } else if (!res.success && res.error) {
        showNotice(res.error.message, "error");
      }
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    filterStatus,
    filterApproval,
    onlySuspended,
    onlyArchived,
    includeDeleted,
    createdFrom,
    updatedFrom,
    sortBy,
    currentPage,
  ]);

  useEffect(() => {
    void loadTheatres();
  }, [loadTheatres]);

  const handleCreateTheatre = async (input: CreateTheatreInput) => {
    const res = await createTheatreLifecycleAction(input, SUPER_ADMIN_ACTOR);
    if (res.success && res.data) {
      showNotice(`Created multi-tenant cinema "${res.data.name}" (${res.data.status}) · Slug /${res.data.slug}`);
      await loadTheatres();
      return { success: true };
    }
    return { success: false, error: res.error?.message || "Failed to create theatre." };
  };

  const handleEditTheatre = async (theatreId: string, input: UpdateTheatreInput) => {
    const res = await updateTheatreLifecycleAction({ ...input, theatreId }, SUPER_ADMIN_ACTOR);
    if (res.success && res.data) {
      showNotice(`Updated "${res.data.name}" cleanly to version v${res.data.version}.`);
      await loadTheatres();
      return { success: true };
    }
    return { success: false, error: res.error?.message || "Failed to update theatre." };
  };

  const handleImmediateTransition = async (
    action: "submit" | "activate" | "resume",
    theatre: ManagedTheatreEntity
  ) => {
    setIsMutating(true);
    try {
      let res;
      if (action === "submit") {
        res = await submitTheatreForApprovalAction({ theatreId: theatre.id }, SUPER_ADMIN_ACTOR);
      } else if (action === "activate") {
        res = await activateTheatreLifecycleAction({ theatreId: theatre.id }, SUPER_ADMIN_ACTOR);
      } else {
        res = await resumeTheatreLifecycleAction({ theatreId: theatre.id }, SUPER_ADMIN_ACTOR);
      }

      if (res.success && res.data) {
        showNotice(`"${res.data.name}" transitioned cleanly to ${res.data.status}.`);
        await loadTheatres();
      } else {
        showNotice(res.error?.message || "State transition failed.", "error");
      }
    } finally {
      setIsMutating(false);
    }
  };

  const openActionModal = (type: LifecycleModalActionType, theatre: ManagedTheatreEntity) => {
    setLifecycleActionType(type);
    setTargetTheatre(theatre);
    setLifecycleModalOpen(true);
  };

  const handleConfirmLifecycleModal = async (payload: {
    reason?: string;
    endTimePlaceholder?: string;
  }) => {
    if (!targetTheatre || !lifecycleActionType) return;
    setIsMutating(true);

    try {
      let res;
      switch (lifecycleActionType) {
        case "APPROVE":
          res = await approveTheatreLifecycleAction(
            { theatreId: targetTheatre.id, comments: payload.reason },
            SUPER_ADMIN_ACTOR
          );
          break;
        case "REJECT":
          res = await rejectTheatreLifecycleAction(
            { theatreId: targetTheatre.id, comments: payload.reason || "Rejected by Super Admin" },
            SUPER_ADMIN_ACTOR
          );
          break;
        case "REQUEST_REVISION":
          res = await requestTheatreRevisionAction(
            { theatreId: targetTheatre.id, comments: payload.reason || "Compliance revision requested" },
            SUPER_ADMIN_ACTOR
          );
          break;
        case "SUSPEND":
          res = await suspendTheatreLifecycleAction(
            {
              theatreId: targetTheatre.id,
              reason: payload.reason || "Administrative suspension",
              endTimePlaceholder: payload.endTimePlaceholder,
            },
            SUPER_ADMIN_ACTOR
          );
          break;
        case "ARCHIVE":
          res = await archiveTheatreLifecycleAction(
            { theatreId: targetTheatre.id, reason: payload.reason },
            SUPER_ADMIN_ACTOR
          );
          break;
        case "RESTORE":
          res = await restoreTheatreLifecycleAction(
            { theatreId: targetTheatre.id },
            SUPER_ADMIN_ACTOR
          );
          break;
        case "SOFT_DELETE":
          res = await softDeleteTheatreLifecycleAction(
            { theatreId: targetTheatre.id, deleteReason: payload.reason || "Decommissioned" },
            SUPER_ADMIN_ACTOR
          );
          break;
      }

      if (res?.success && res.data) {
        showNotice(`Lifecycle transition completed: "${res.data.name}" is now ${res.data.status}.`);
        setLifecycleModalOpen(false);
        await loadTheatres();
      } else {
        showNotice(res?.error?.message || "Action failed due to business rule violation.", "error");
      }
    } finally {
      setIsMutating(false);
    }
  };

  const metrics = data?.summaryMetrics || {
    totalActiveFleets: 0,
    draftCount: 0,
    pendingApprovalCount: 0,
    approvedCount: 0,
    activeCount: 0,
    suspendedCount: 0,
    archivedCount: 0,
    softDeletedCount: 0,
  };

  const items = data?.items || [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Multi-Tenant Cinema Theatres Management"
        subtitle="Full Lifecycle Governance: Onboarding Drafts, KYC Approvals, Operational Lockouts, Archival & Soft Delete"
        badge={`${metrics.totalActiveFleets} Active Fleet Properties`}
        badgeVariant="primary"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                setFormMode("create");
                setEditingTheatre(null);
                setFormModalOpen(true);
              }}
              variant="primary"
              size="sm"
              className="gap-1.5 text-xs font-bold"
            >
              <Plus className="h-3.5 w-3.5" /> Onboard Theatre
            </Button>
            <Link href="/dashboard/subscriptions">
              <Button variant="outline" size="sm" className="gap-2 border-[#2A3445] text-xs font-semibold">
                <CreditCard className="h-3.5 w-3.5" /> Subscription Tiers
              </Button>
            </Link>
            <Link href="/dashboard/cities">
              <Button variant="outline" size="sm" className="gap-2 border-[#2A3445] text-xs font-semibold">
                <MapPin className="h-3.5 w-3.5" /> Metro Jurisdictions
              </Button>
            </Link>
          </div>
        }
      />

      {/* Action Feedback Banner */}
      {actionNotice && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-xl ${
            actionNotice.type === "error"
              ? "bg-rose-950/80 border-rose-500/40 text-rose-200"
              : "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === "error" ? (
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            )}
            <span>{actionNotice.text}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            aria-label="Dismiss notification banner"
            className="hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Lifecycle KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: "ALL", label: "All Theatres", count: metrics.totalActiveFleets, color: "text-white", tone: "border-[#2A3445]" },
          { key: "DRAFT", label: "Drafts", count: metrics.draftCount, color: "text-slate-300", tone: "border-slate-500/40" },
          { key: "PENDING_APPROVAL", label: "Pending Review", count: metrics.pendingApprovalCount, color: "text-amber-400", tone: "border-amber-500/40" },
          { key: "ACTIVE", label: "Active", count: metrics.activeCount, color: "text-emerald-400", tone: "border-emerald-500/40" },
          { key: "SUSPENDED", label: "Suspended", count: metrics.suspendedCount, color: "text-rose-400", tone: "border-rose-500/40" },
          { key: "ARCHIVED", label: "Archived", count: metrics.archivedCount, color: "text-[#94A3B8]", tone: "border-[#2A3445]" },
        ].map((kpi) => (
          <button
            key={kpi.key}
            onClick={() => {
              setFilterStatus(kpi.key as TheatreLifecycleState | "ALL");
              setOnlySuspended(false);
              setOnlyArchived(false);
              setCurrentPage(1);
            }}
            className={`text-left p-4 rounded-2xl border transition-all ${
              filterStatus === kpi.key
                ? "bg-[#1E293B] border-[#FBBF24]"
                : `bg-[#161F2E] ${kpi.tone} hover:border-[#64748B]`
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">{kpi.label}</div>
            <div className={`text-2xl font-extrabold font-mono mt-1 ${kpi.color}`}>{kpi.count}</div>
          </button>
        ))}
      </div>

      {/* Multi-Faceted Search, Date & Status Filters */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
            <input
              type="text"
              aria-label="Search theatres by name, slug, city, chain, or administrator"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Theatre Name, Slug (/inox-kolhapur), City, Status, or Admin..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Lifecycle Status Select */}
            <select
              aria-label="Filter by lifecycle status"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as TheatreLifecycleState | "ALL");
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white"
            >
              <option value="ALL">All Lifecycle States</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="ARCHIVED">Archived</option>
              <option value="SOFT_DELETED">Soft Deleted</option>
            </select>

            {/* Approval Filter */}
            <select
              aria-label="Filter by approval status"
              value={filterApproval}
              onChange={(e) => {
                setFilterApproval(e.target.value as TheatreApprovalState | "ALL");
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white"
            >
              <option value="ALL">All Approvals</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="REVISION_REQUESTED">Revision Requested</option>
            </select>

            {/* Created Date Filter */}
            <label className="flex items-center gap-1.5 text-[10px] text-[#94A3B8]">
              <span>Created ≥</span>
              <input
                type="date"
                aria-label="Created after date"
                value={createdFrom}
                onChange={(e) => {
                  setCreatedFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white"
              />
            </label>

            {/* Updated Date Filter */}
            <label className="flex items-center gap-1.5 text-[10px] text-[#94A3B8]">
              <span>Updated ≥</span>
              <input
                type="date"
                aria-label="Updated after date"
                value={updatedFrom}
                onChange={(e) => {
                  setUpdatedFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white"
              />
            </label>

            {/* Quick Suspended & Archived Toggles */}
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-rose-300 cursor-pointer">
              <input
                type="checkbox"
                aria-label="Only suspended theatres"
                checked={onlySuspended}
                onChange={(e) => {
                  setOnlySuspended(e.target.checked);
                  if (e.target.checked) setOnlyArchived(false);
                  setCurrentPage(1);
                }}
              />
              <span>Suspended Only</span>
            </label>

            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-[#CBD5E1] cursor-pointer">
              <input
                type="checkbox"
                aria-label="Only archived theatres"
                checked={onlyArchived}
                onChange={(e) => {
                  setOnlyArchived(e.target.checked);
                  if (e.target.checked) setOnlySuspended(false);
                  setCurrentPage(1);
                }}
              />
              <span>Archived Only</span>
            </label>

            {/* Sort By */}
            <select
              aria-label="Sort theatres"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white"
            >
              <option value="name">Sort: Name</option>
              <option value="city">Sort: City</option>
              <option value="status">Sort: Status</option>
              <option value="hallCount">Sort: Screens</option>
              <option value="createdAt">Sort: Created Date</option>
            </select>

            {/* Include Soft Deleted Toggle */}
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-[#CBD5E1] cursor-pointer">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => {
                  setIncludeDeleted(e.target.checked);
                  setCurrentPage(1);
                }}
              />
              <span>Show Deleted ({metrics.softDeletedCount})</span>
            </label>
          </div>
        </div>
      </div>

      {/* Theatres Lifecycle Table */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-4 px-5">Theatre / Slug</th>
                <th className="py-4 px-5">Location</th>
                <th className="py-4 px-5">Lifecycle Status</th>
                <th className="py-4 px-5">Approval</th>
                <th className="py-4 px-5">Operator Admin</th>
                <th className="py-4 px-5">Version</th>
                <th className="py-4 px-5 text-right">Governance Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#94A3B8]">
                    Loading multi-tenant theatre lifecycle registry...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#94A3B8]">
                    No cinema theatres match your current search and filter criteria.
                  </td>
                </tr>
              ) : (
                items.map((th) => (
                  <tr key={th.id} className="hover:bg-[#111827]/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-white flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <Link
                            href={`/dashboard/theatres/${th.id}`}
                            className="hover:text-[#FBBF24] transition-colors flex items-center gap-1"
                          >
                            <span>{th.name}</span>
                            <ExternalLink className="h-3 w-3 text-[#64748B]" />
                          </Link>
                          <div className="text-[10px] text-[#64748B] font-mono">
                            /{th.slug} · {th.publicId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="text-white font-medium">{th.city}</div>
                      <div className="text-[10px] text-[#94A3B8]">{th.state}, {th.country}</div>
                    </td>

                    <td className="py-4 px-5">
                      <LifecycleStatusBadge status={th.status} size="sm" />
                    </td>

                    <td className="py-4 px-5">
                      <ApprovalStatusBadge status={th.approvalStatus} size="sm" />
                    </td>

                    <td className="py-4 px-5">
                      <div className="text-white font-medium">{th.adminName}</div>
                      <div className="text-[10px] text-[#94A3B8]">{th.adminEmail}</div>
                    </td>

                    <td className="py-4 px-5 font-mono text-[#FBBF24] font-bold">
                      v{th.version}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <Link href={`/dashboard/theatres/${th.id}`}>
                          <Button variant="outline" size="sm" className="h-7 px-2 border-[#2A3445] text-xs gap-1 hover:text-[#FBBF24]">
                            <Eye className="h-3 w-3" /> Inspect
                          </Button>
                        </Link>

                        {!th.capabilities.isReadOnly && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFormMode("edit");
                              setEditingTheatre(th);
                              setFormModalOpen(true);
                            }}
                            className="h-7 px-2 border-[#2A3445] text-xs gap-1"
                          >
                            <Edit className="h-3 w-3" /> Edit
                          </Button>
                        )}

                        {th.status === "DRAFT" && (
                          <Button
                            disabled={isMutating}
                            onClick={() => void handleImmediateTransition("submit", th)}
                            variant="primary"
                            size="sm"
                            className="h-7 px-2.5 text-xs font-bold gap-1"
                          >
                            <Send className="h-3 w-3" /> Submit
                          </Button>
                        )}

                        {th.status === "PENDING_APPROVAL" && (
                          <>
                            <Button
                              disabled={isMutating}
                              onClick={() => openActionModal("APPROVE", th)}
                              variant="primary"
                              size="sm"
                              className="h-7 px-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-black border-0 gap-1"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button
                              disabled={isMutating}
                              onClick={() => openActionModal("REJECT", th)}
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs border-rose-500/40 text-rose-400 hover:bg-rose-500/10 gap-1"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </Button>
                          </>
                        )}

                        {(th.status === "APPROVED" || th.status === "INACTIVE") && (
                          <Button
                            disabled={isMutating}
                            onClick={() => void handleImmediateTransition("activate", th)}
                            variant="primary"
                            size="sm"
                            className="h-7 px-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-black border-0 gap-1"
                          >
                            <PlayCircle className="h-3.5 w-3.5" /> Activate
                          </Button>
                        )}

                        {th.status === "ACTIVE" && (
                          <Button
                            disabled={isMutating}
                            onClick={() => openActionModal("SUSPEND", th)}
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs border-[#2A3445] text-rose-400 hover:bg-rose-500/10 gap-1"
                          >
                            <PauseCircle className="h-3.5 w-3.5" /> Suspend
                          </Button>
                        )}

                        {th.status === "SUSPENDED" && (
                          <Button
                            disabled={isMutating}
                            onClick={() => void handleImmediateTransition("resume", th)}
                            variant="primary"
                            size="sm"
                            className="h-7 px-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-black border-0 gap-1"
                          >
                            <PlayCircle className="h-3.5 w-3.5" /> Resume
                          </Button>
                        )}

                        {th.status !== "ARCHIVED" && th.status !== "SOFT_DELETED" && (
                          <Button
                            disabled={isMutating}
                            onClick={() => openActionModal("ARCHIVE", th)}
                            variant="ghost"
                            size="sm"
                            title="Archive (Read-Only)"
                            className="h-7 w-7 p-0 text-[#94A3B8] hover:text-white"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {th.status === "ARCHIVED" && (
                          <Button
                            disabled={isMutating}
                            onClick={() => openActionModal("RESTORE", th)}
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs border-emerald-500/40 text-emerald-400 gap-1"
                          >
                            <RotateCcw className="h-3 w-3" /> Restore
                          </Button>
                        )}

                        {th.status !== "SOFT_DELETED" && (
                          <Button
                            disabled={isMutating}
                            onClick={() => openActionModal("SOFT_DELETE", th)}
                            variant="ghost"
                            size="sm"
                            title="Soft Delete"
                            className="h-7 w-7 p-0 text-[#64748B] hover:text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-[#111827]/70 border-t border-[#2A3445] flex items-center justify-between text-xs text-[#94A3B8]">
          <span className="font-mono text-[11px]">
            Showing {items.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
            {(currentPage - 1) * pageSize + items.length} of {data?.total || 0} properties
          </span>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!data?.hasPrev}
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs border-[#2A3445]"
            >
              Previous
            </Button>
            <span className="font-mono font-bold text-white">
              Page {currentPage} of {data?.totalPages || 1}
            </span>
            <Button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!data?.hasNext}
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs border-[#2A3445]"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Reusable Modals */}
      {formModalOpen && (
        <LazyCreateEditTheatreModal
          isOpen={formModalOpen}
          mode={formMode}
          initialTheatre={editingTheatre}
          actorRole="SUPER_ADMIN"
          onClose={() => setFormModalOpen(false)}
          onSaveCreate={handleCreateTheatre}
          onSaveEdit={handleEditTheatre}
        />
      )}

      {lifecycleModalOpen && (
        <LazyLifecycleActionModal
          isOpen={lifecycleModalOpen}
          actionType={lifecycleActionType}
          theatreName={targetTheatre?.name || ""}
          onClose={() => setLifecycleModalOpen(false)}
          onConfirm={handleConfirmLifecycleModal}
          isSubmitting={isMutating}
        />
      )}
    </div>
  );
}
