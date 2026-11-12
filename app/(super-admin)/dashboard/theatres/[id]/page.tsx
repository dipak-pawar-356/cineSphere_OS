"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  ArrowLeft,
  Archive,
  RotateCcw,
  Trash2,
  Edit,
  Send,
  AlertTriangle,
  MessageSquare,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TheatreLifecycleDetailBundle,
  UpdateTheatreInput,
} from "@/types/theatre-lifecycle.types";
import {
  getTheatreLifecycleDetailAction,
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

const LazyTheatreLifecyclePanel = dynamic(
  () => import("@/components/theatre-lifecycle/theatre-lifecycle-panel").then((m) => m.TheatreLifecyclePanel),
  { ssr: false }
);
const LazyCreateEditTheatreModal = dynamic(
  () => import("@/components/theatre-lifecycle/create-edit-theatre-modal").then((m) => m.CreateEditTheatreModal),
  { ssr: false }
);
const LazyLifecycleActionModal = dynamic(
  () => import("@/components/theatre-lifecycle/lifecycle-action-modal").then((m) => m.LifecycleActionModal),
  { ssr: false }
);
const LazyTheatreBrandingMediaWorkspace = dynamic(
  () => import("@/components/theatre-media/theatre-branding-media-workspace").then((m) => m.TheatreBrandingMediaWorkspace),
  { ssr: false }
);
const LazyTheatreProfileWorkspace = dynamic(
  () => import("@/components/theatre-profile/theatre-profile-workspace").then((m) => m.TheatreProfileWorkspace),
  { ssr: false }
);

const SUPER_ADMIN_ACTOR = {
  userId: "usr-super-1",
  name: "Vikram Singhania",
  role: "SUPER_ADMIN" as const,
};

export default function SuperAdminTheatreDetailPage() {
  const params = useParams();
  const theatreId = params?.id as string;

  const [detail, setDetail] = useState<TheatreLifecycleDetailBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "lifecycle" | "profile" | "media" | "general" | "admin" | "payment" | "subscription" | "metrics" | "audit"
  >("lifecycle");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<LifecycleModalActionType | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotice = (text: string, type: "success" | "error" = "success") => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  };

  const loadDetail = useCallback(async () => {
    if (!theatreId) return;
    setLoading(true);
    try {
      const res = await getTheatreLifecycleDetailAction({ theatreId }, SUPER_ADMIN_ACTOR);
      if (res.success && res.data) {
        setDetail(res.data);
      }
    } finally {
      setLoading(false);
    }
  }, [theatreId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#94A3B8]">
        Loading multi-tenant theatre lifecycle profile...
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Theatre Complex Not Found</h2>
        <p className="text-sm text-[#94A3B8]">The requested theatre ID does not exist in lifecycle registry.</p>
        <Link href="/dashboard/theatres">
          <Button variant="primary" size="sm">Back to Theatres List</Button>
        </Link>
      </div>
    );
  }

  const theatre = detail.theatre;

  const handleEditSave = async (id: string, input: UpdateTheatreInput) => {
    const res = await updateTheatreLifecycleAction({ ...input, theatreId: id }, SUPER_ADMIN_ACTOR);
    if (res.success && res.data) {
      showNotice(`Updated "${res.data.name}" to version v${res.data.version}.`);
      await loadDetail();
      return { success: true };
    }
    return { success: false, error: res.error?.message || "Update failed." };
  };

  const handleDirectTransition = async (action: "submit" | "activate" | "resume") => {
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
        showNotice(`Transitioned "${res.data.name}" to ${res.data.status}.`);
        await loadDetail();
      } else {
        showNotice(res.error?.message || "Transition blocked.", "error");
      }
    } finally {
      setIsMutating(false);
    }
  };

  const handleModalConfirm = async (payload: { reason?: string; endTimePlaceholder?: string }) => {
    if (!modalAction) return;
    setIsMutating(true);
    try {
      let res;
      switch (modalAction) {
        case "APPROVE":
          res = await approveTheatreLifecycleAction(
            { theatreId: theatre.id, comments: payload.reason },
            SUPER_ADMIN_ACTOR
          );
          break;
        case "REJECT":
          res = await rejectTheatreLifecycleAction(
            { theatreId: theatre.id, comments: payload.reason || "Rejected" },
            SUPER_ADMIN_ACTOR
          );
          break;
        case "REQUEST_REVISION":
          res = await requestTheatreRevisionAction(
            { theatreId: theatre.id, comments: payload.reason || "Revision requested" },
            SUPER_ADMIN_ACTOR
          );
          break;
        case "SUSPEND":
          res = await suspendTheatreLifecycleAction(
            {
              theatreId: theatre.id,
              reason: payload.reason || "Administrative suspension",
              endTimePlaceholder: payload.endTimePlaceholder,
            },
            SUPER_ADMIN_ACTOR
          );
          break;
        case "ARCHIVE":
          res = await archiveTheatreLifecycleAction(
            { theatreId: theatre.id, reason: payload.reason },
            SUPER_ADMIN_ACTOR
          );
          break;
        case "RESTORE":
          res = await restoreTheatreLifecycleAction({ theatreId: theatre.id }, SUPER_ADMIN_ACTOR);
          break;
        case "SOFT_DELETE":
          res = await softDeleteTheatreLifecycleAction(
            { theatreId: theatre.id, deleteReason: payload.reason || "Decommissioned" },
            SUPER_ADMIN_ACTOR
          );
          break;
      }

      if (res?.success && res.data) {
        showNotice(`Lifecycle updated to ${res.data.status}.`);
        setActionModalOpen(false);
        await loadDetail();
      } else {
        showNotice(res?.error?.message || "Operation rejected by lifecycle rules.", "error");
      }
    } finally {
      setIsMutating(false);
    }
  };

  const openModal = (type: LifecycleModalActionType) => {
    setModalAction(type);
    setActionModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Lifecycle Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/dashboard/theatres"
          className="text-xs text-[#94A3B8] hover:text-[#FBBF24] flex items-center gap-1.5 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Theatres
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {!theatre.capabilities.isReadOnly && (
            <Button
              onClick={() => setEditModalOpen(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 border-[#2A3445] text-xs font-semibold"
            >
              <Edit className="h-3.5 w-3.5" /> Edit Theatre
            </Button>
          )}

          {theatre.status === "DRAFT" && (
            <Button
              disabled={isMutating}
              onClick={() => void handleDirectTransition("submit")}
              variant="primary"
              size="sm"
              className="gap-1.5 text-xs font-bold"
            >
              <Send className="h-3.5 w-3.5" /> Submit For Approval
            </Button>
          )}

          {theatre.status === "PENDING_APPROVAL" && (
            <>
              <Button
                disabled={isMutating}
                onClick={() => openModal("APPROVE")}
                variant="primary"
                size="sm"
                className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs border-0"
              >
                <CheckCircle2 className="h-4 w-4" /> Approve Licence
              </Button>
              <Button
                disabled={isMutating}
                onClick={() => openModal("REQUEST_REVISION")}
                variant="outline"
                size="sm"
                className="gap-1.5 text-amber-400 border-amber-500/40 text-xs font-bold"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Request Revision
              </Button>
              <Button
                disabled={isMutating}
                onClick={() => openModal("REJECT")}
                variant="outline"
                size="sm"
                className="gap-1.5 text-rose-400 border-rose-500/40 text-xs font-bold hover:bg-rose-500/10"
              >
                <XCircle className="h-4 w-4" /> Reject
              </Button>
            </>
          )}

          {(theatre.status === "APPROVED" || theatre.status === "INACTIVE") && (
            <Button
              disabled={isMutating}
              onClick={() => void handleDirectTransition("activate")}
              variant="primary"
              size="sm"
              className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs border-0"
            >
              <PlayCircle className="h-4 w-4" /> Activate Complex
            </Button>
          )}

          {theatre.status === "ACTIVE" && (
            <Button
              disabled={isMutating}
              onClick={() => openModal("SUSPEND")}
              variant="outline"
              size="sm"
              className="gap-1.5 text-rose-400 border-rose-500/40 text-xs font-bold hover:bg-rose-500/10"
            >
              <PauseCircle className="h-4 w-4" /> Suspend Operations
            </Button>
          )}

          {theatre.status === "SUSPENDED" && (
            <Button
              disabled={isMutating}
              onClick={() => void handleDirectTransition("resume")}
              variant="primary"
              size="sm"
              className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs border-0"
            >
              <PlayCircle className="h-4 w-4" /> Resume Operations
            </Button>
          )}

          {theatre.status !== "ARCHIVED" && theatre.status !== "SOFT_DELETED" && (
            <Button
              disabled={isMutating}
              onClick={() => openModal("ARCHIVE")}
              variant="outline"
              size="sm"
              className="gap-1.5 border-[#2A3445] text-xs font-semibold"
            >
              <Archive className="h-3.5 w-3.5" /> Archive
            </Button>
          )}

          {theatre.status === "ARCHIVED" && (
            <Button
              disabled={isMutating}
              onClick={() => openModal("RESTORE")}
              variant="outline"
              size="sm"
              className="gap-1.5 border-emerald-500/40 text-emerald-400 text-xs font-bold"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restore
            </Button>
          )}

          {theatre.status !== "SOFT_DELETED" && (
            <Button
              disabled={isMutating}
              onClick={() => openModal("SOFT_DELETE")}
              variant="outline"
              size="sm"
              className="gap-1.5 border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-bold"
            >
              <Trash2 className="h-3.5 w-3.5" /> Soft Delete
            </Button>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {notice && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            notice.type === "error"
              ? "bg-rose-950/80 border-rose-500/40 text-rose-200"
              : "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === "error" ? (
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            )}
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} aria-label="Dismiss alert">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Hero Theatre Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#111827] via-[#161F2E] to-[#0B1220] border border-[#2A3445] space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] font-black text-2xl shadow-inner shrink-0">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">{theatre.name}</h1>
                <LifecycleStatusBadge status={theatre.status} size="sm" />
                <ApprovalStatusBadge status={theatre.approvalStatus} size="sm" />
              </div>
              <div className="text-xs text-[#94A3B8] flex flex-wrap items-center gap-2 mt-1">
                <span>{theatre.chain}</span>
                <span>•</span>
                <span className="font-mono text-[#FBBF24]">/{theatre.slug}</span>
                <span>•</span>
                <span className="font-mono text-white">{theatre.publicId}</span>
                <span>•</span>
                <span>{theatre.city}, {theatre.state}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-end gap-1">
            <div className="text-xs uppercase font-bold text-[#94A3B8]">Gross Monthly Revenue</div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              ₹{(theatre.grossRevenueMonthly / 100000).toFixed(2)} Lakh
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#2A3445]">
          {[
            { id: "lifecycle", label: "Lifecycle & State Machine" },
            { id: "profile", label: "Theatre Profile" },
            { id: "media", label: "Branding & Media" },
            { id: "general", label: "General & Hardware" },
            { id: "admin", label: "Admin & Operators" },
            { id: "payment", label: "Payment & UPI Rail" },
            { id: "subscription", label: "SaaS Licensing" },
            { id: "metrics", label: "Shows & Revenue" },
            { id: "audit", label: "Audit Trail" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-[#FBBF24] text-[#070B12] shadow-lg font-bold"
                  : "text-[#94A3B8] hover:text-white hover:bg-[#111827]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 0: Lifecycle & State Machine */}
      {activeTab === "lifecycle" && <LazyTheatreLifecyclePanel detail={detail} />}

      {/* Tab 0a: Dedicated Decoupled Theatre Profile Management (Phase 3 Part 3) */}
      {activeTab === "profile" && (
        <LazyTheatreProfileWorkspace
          theatreId={theatre.id}
          actorRole="SUPER_ADMIN"
          actorUserId="usr-super-1"
          actorName="Vikram Singhania"
          defaultView="overview"
        />
      )}

      {/* Tab 0b: Branding & Digital Media Vault */}
      {activeTab === "media" && (
        <LazyTheatreBrandingMediaWorkspace
          theatreId={theatre.id}
          actorRole="SUPER_ADMIN"
          actorUserId="usr-super-1"
          actorName="Vikram Singhania"
          defaultView="branding"
        />
      )}

      {/* Tab 1: General Information */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
              Corporate & Identity Credentials
            </h3>
            <div className="divide-y divide-[#2A3445]/60 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Cinema Chain Name</span>
                <span className="font-semibold text-white">{theatre.chain}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Tenant URL Slug</span>
                <span className="font-mono text-white">/{theatre.slug}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Commercial GSTIN</span>
                <span className="font-mono text-white">{theatre.gstNumber || "Pending"}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Physical Address</span>
                <span className="text-white text-right max-w-xs">{theatre.address}, {theatre.city} - {theatre.pinCode}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Jurisdiction</span>
                <span className="text-white">{theatre.state}, {theatre.country}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
              Hardware & Acoustic Formats
            </h3>
            <div className="divide-y divide-[#2A3445]/60 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Screen Count</span>
                <span className="font-mono font-bold text-white">{theatre.hallCount} Auditoriums</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Seating Luxury Tier</span>
                <Badge variant="warning" size="sm">{theatre.pricingTier}</Badge>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-[#94A3B8]">Screen Formats</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {theatre.screenTypes.map((fmt, i) => (
                    <Badge key={i} variant="outline" size="sm">{fmt}</Badge>
                  ))}
                </div>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Operating Hours</span>
                <span className="text-white font-mono">{theatre.defaultConfig.openingTime} – {theatre.defaultConfig.closingTime}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Admin Information */}
      {activeTab === "admin" && (
        <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
            Authorized Cinema Operator (General Manager)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Administrator Name</div>
              <div className="text-sm font-bold text-white">{theatre.adminName}</div>
              <div className="text-[11px] text-[#FBBF24]">General Manager (Role: THEATRE_ADMIN)</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Primary Email</div>
              <div className="text-sm font-mono text-white">{theatre.adminEmail}</div>
              <div className="text-[11px] text-emerald-400">Authenticated Operator</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Helpline Contact</div>
              <div className="text-sm font-mono text-white">{theatre.contactNumber}</div>
              <div className="text-[11px] text-[#94A3B8]">{theatre.contactEmail}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Payment & UPI Rail */}
      {activeTab === "payment" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
              Tenant-Isolated Payment Status
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Payment processing authorization is dynamically governed by Theatre Lifecycle status.
            </p>
            <div className="divide-y divide-[#2A3445]/60 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Payments Authorized</span>
                <span className={`font-bold ${theatre.capabilities.allowPayments ? "text-emerald-400" : "text-rose-400"}`}>
                  {theatre.capabilities.allowPayments ? "Yes (Live Checkout Allowed)" : "Locked by Lifecycle"}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Currency</span>
                <span className="font-mono text-white">{theatre.defaultConfig.currency}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Convenience Fee Default</span>
                <span className="font-mono text-white">₹{theatre.defaultConfig.convenienceFeeDefault} / seat</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
              Configured Payment Providers
            </h3>
            <div className="space-y-3 pt-2">
              {[
                { name: "UPI Auto-QR Rail", status: theatre.capabilities.allowPayments ? "Active" : "Locked", sub: "NPCI Instant Rail" },
                { name: "Razorpay Connect", status: theatre.capabilities.allowPayments ? "Configured" : "Locked", sub: "Cards & NetBanking" },
              ].map((g, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{g.name}</div>
                    <div className="text-[10px] text-[#64748B] font-mono">{g.sub}</div>
                  </div>
                  <Badge variant={theatre.capabilities.allowPayments ? "success" : "danger"} size="sm">{g.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: SaaS Subscription */}
      {activeTab === "subscription" && (
        <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
            Commercial SaaS Licensing Plan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Tier Plan</div>
              <div className="text-xl font-extrabold text-[#FBBF24] font-mono">{theatre.subscriptionPlan}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Approval Verification</div>
              <div className="mt-1"><ApprovalStatusBadge status={theatre.approvalStatus} /></div>
            </div>
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Concurrency Version</div>
              <div className="text-xl font-extrabold text-white font-mono">v{theatre.version}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Metrics & Shows */}
      {activeTab === "metrics" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Auditorium Halls</div>
            <div className="text-2xl font-black font-mono text-white">{theatre.hallCount} Screens</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">New Show Scheduling</div>
            <div className={`text-sm font-bold ${theatre.capabilities.allowShows ? "text-emerald-400" : "text-rose-400"}`}>
              {theatre.capabilities.allowShows ? "Permitted" : "Locked"}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Total Bookings</div>
            <div className="text-2xl font-black font-mono text-white">{theatre.totalBookings.toLocaleString("en-IN")}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Monthly Gross</div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              ₹{(theatre.grossRevenueMonthly / 100000).toFixed(2)}L
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Audit Trail */}
      {activeTab === "audit" && (
        <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
            Compliance & Lifecycle Audit Stream
          </h3>
          <div className="divide-y divide-[#2A3445]/60 text-xs">
            {detail.auditLogs.length === 0 ? (
              <div className="py-6 text-center text-[#94A3B8]">No lifecycle audit events yet.</div>
            ) : (
              detail.auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[#CBD5E1]">
                  <div>
                    <div className="font-bold text-white font-mono">{log.action}</div>
                    {log.reason && <div className="text-[11px] text-[#94A3B8]">{log.reason}</div>}
                  </div>
                  <div className="text-right text-[10px] font-mono text-[#64748B]">
                    <div>{log.timestamp}</div>
                    <div>Actor: {log.actorId} ({log.actorRole})</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {editModalOpen && (
        <LazyCreateEditTheatreModal
          isOpen={editModalOpen}
          mode="edit"
          initialTheatre={theatre}
          actorRole="SUPER_ADMIN"
          onClose={() => setEditModalOpen(false)}
          onSaveEdit={handleEditSave}
        />
      )}

      {actionModalOpen && (
        <LazyLifecycleActionModal
          isOpen={actionModalOpen}
          actionType={modalAction}
          theatreName={theatre.name}
          onClose={() => setActionModalOpen(false)}
          onConfirm={handleModalConfirm}
          isSubmitting={isMutating}
        />
      )}
    </div>
  );
}
