"use client";

import React, { useState } from "react";
import {
  TheatreLifecycleDetailBundle,
  TheatreLifecycleState,
} from "@/types/theatre-lifecycle.types";
import {
  LifecycleStatusBadge,
  ApprovalStatusBadge,
} from "./lifecycle-status-badge";
import {
  ShieldAlert,
  Clock,
  Globe,
  History,
  FileCheck2,
  GitBranch,
  Lock,
  Unlock,
} from "lucide-react";

const LIFECYCLE_STEPS: { state: TheatreLifecycleState; label: string }[] = [
  { state: "DRAFT", label: "Draft" },
  { state: "PENDING_APPROVAL", label: "Pending Approval" },
  { state: "APPROVED", label: "Approved" },
  { state: "ACTIVE", label: "Active" },
  { state: "SUSPENDED", label: "Suspended" },
  { state: "ARCHIVED", label: "Archived" },
  { state: "SOFT_DELETED", label: "Soft Deleted" },
];

export function TheatreLifecyclePanel({
  detail,
}: {
  detail: TheatreLifecycleDetailBundle;
}) {
  const { theatre, statusHistory, approvals, slugHistory, auditLogs } = detail;
  const [subTab, setSubTab] = useState<"history" | "approvals" | "slugs" | "audits">("history");

  return (
    <div className="space-y-6">
      {/* State Machine Pipeline Visualization */}
      <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24] flex items-center gap-2">
              <GitBranch className="h-4 w-4" /> Theatre Lifecycle State Machine
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Public ID: <span className="font-mono text-white">{theatre.publicId}</span> · Version:{" "}
              <span className="font-mono text-[#FBBF24]">v{theatre.version}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LifecycleStatusBadge status={theatre.status} size="md" />
            <ApprovalStatusBadge status={theatre.approvalStatus} size="md" />
          </div>
        </div>

        {/* Horizontal State Progression Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
          {LIFECYCLE_STEPS.map((step) => {
            const isCurrent = theatre.status === step.state;
            return (
              <div
                key={step.state}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isCurrent
                    ? "bg-[#FBBF24]/15 border-[#FBBF24] text-white shadow-lg"
                    : "bg-[#111827] border-[#2A3445] text-[#64748B]"
                }`}
              >
                <div className="text-[10px] font-mono uppercase font-bold">{step.state}</div>
                <div className={`text-xs font-bold mt-1 ${isCurrent ? "text-[#FBBF24]" : "text-[#94A3B8]"}`}>
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Operational Lockouts & Capabilities Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#2A3445]">
          {[
            {
              label: "Patron Bookings",
              enabled: theatre.capabilities.allowBookings,
            },
            {
              label: "Show Scheduling",
              enabled: theatre.capabilities.allowShows,
            },
            {
              label: "Payment Processing",
              enabled: theatre.capabilities.allowPayments,
            },
            {
              label: "Write Access",
              enabled: !theatre.capabilities.isReadOnly,
            },
          ].map((cap, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-[#111827] border border-[#2A3445] flex items-center justify-between text-xs"
            >
              <span className="text-[#94A3B8] font-medium">{cap.label}</span>
              {cap.enabled ? (
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Unlock className="h-3.5 w-3.5" /> Enabled
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-400 font-bold">
                  <Lock className="h-3.5 w-3.5" /> Locked
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Active Conditional State Notices */}
        {theatre.suspension && (
          <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 space-y-1">
            <div className="font-bold text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" /> Operational Suspension Active
            </div>
            <div>Reason: {theatre.suspension.reason}</div>
            <div className="text-[11px] text-rose-300/80 font-mono">
              Suspended At: {theatre.suspension.suspendedAt} · By: {theatre.suspension.suspendedBy}
              {theatre.suspension.endTimePlaceholder && ` · Target Resume: ${theatre.suspension.endTimePlaceholder}`}
            </div>
          </div>
        )}

        {theatre.archival && (
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-500/40 text-xs text-slate-200 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-[#FBBF24]" /> Archived Read-Only Mode
            </div>
            <div>{theatre.archival.reason}</div>
            <div className="text-[11px] text-[#94A3B8] font-mono">
              Archived At: {theatre.archival.archivedAt} · Historical Reports Available
            </div>
          </div>
        )}

        {theatre.softDelete.isDeleted && (
          <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-600/50 text-xs text-rose-200 space-y-1">
            <div className="font-bold text-rose-400">Soft Deleted Record (Tombstoned)</div>
            <div>Delete Reason: {theatre.softDelete.deleteReason}</div>
            <div className="text-[11px] font-mono text-rose-300">
              Deleted By: {theatre.softDelete.deletedBy} · At: {theatre.softDelete.deletedAt}
            </div>
          </div>
        )}
      </div>

      {/* Sub-ledger Tabs */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] p-6 space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-[#2A3445] pb-3">
          {[
            { id: "history", label: `Status History (${statusHistory.length})`, icon: Clock },
            { id: "approvals", label: `Approval History (${approvals.length})`, icon: FileCheck2 },
            { id: "slugs", label: `Slug & Redirects (${slugHistory.length})`, icon: Globe },
            { id: "audits", label: `Compliance Audits (${auditLogs.length})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as typeof subTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  subTab === tab.id
                    ? "bg-[#FBBF24] text-[#070B12] font-bold"
                    : "bg-[#111827] text-[#94A3B8] hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status History */}
        {subTab === "history" && (
          <div className="divide-y divide-[#2A3445]/60 text-xs">
            {statusHistory.length === 0 ? (
              <div className="py-6 text-center text-[#94A3B8]">No state transitions recorded yet.</div>
            ) : (
              statusHistory.map((h) => (
                <div key={h.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 font-mono font-bold text-white">
                      <span className="text-[#94A3B8]">{h.fromStatus || "NEW"}</span>
                      <span>→</span>
                      <span className="text-[#FBBF24]">{h.toStatus}</span>
                    </div>
                    {h.reason && <div className="text-[#CBD5E1] mt-0.5">{h.reason}</div>}
                  </div>
                  <div className="text-right font-mono text-[10px] text-[#64748B]">
                    <div>{h.timestamp}</div>
                    <div>
                      By: {h.changedBy} ({h.changedByRole})
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Approval Decisions */}
        {subTab === "approvals" && (
          <div className="divide-y divide-[#2A3445]/60 text-xs">
            {approvals.length === 0 ? (
              <div className="py-6 text-center text-[#94A3B8]">No approval submissions recorded.</div>
            ) : (
              approvals.map((a) => (
                <div key={a.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ApprovalStatusBadge status={a.status} size="sm" />
                      {a.approverName && (
                        <span className="text-white font-semibold">Reviewer: {a.approverName}</span>
                      )}
                    </div>
                    {a.comments && <div className="text-[#CBD5E1]">{a.comments}</div>}
                  </div>
                  <div className="text-right font-mono text-[10px] text-[#64748B]">
                    <div>{a.reviewedAt || a.createdAt}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Slug History */}
        {subTab === "slugs" && (
          <div className="divide-y divide-[#2A3445]/60 text-xs">
            {slugHistory.length === 0 ? (
              <div className="py-6 text-center text-[#94A3B8]">
                Active slug <span className="font-mono text-white">/{theatre.slug}</span> has zero historical redirects.
              </div>
            ) : (
              slugHistory.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between">
                  <div className="font-mono">
                    <span className="text-rose-400 line-through">/{s.oldSlug}</span>
                    <span className="mx-2 text-[#94A3B8]">→</span>
                    <span className="text-emerald-400 font-bold">/{s.newSlug}</span>
                  </div>
                  <div className="text-right text-[10px] font-mono text-[#64748B]">
                    <div>301 Redirect: {s.redirectEnabled ? "Enabled Placeholder" : "Disabled"}</div>
                    <div>{s.createdAt}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Audits */}
        {subTab === "audits" && (
          <div className="divide-y divide-[#2A3445]/60 text-xs">
            {auditLogs.length === 0 ? (
              <div className="py-6 text-center text-[#94A3B8]">No lifecycle audit events recorded yet.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-white font-mono">{log.action}</div>
                    {log.reason && <div className="text-[#94A3B8]">{log.reason}</div>}
                  </div>
                  <div className="text-right font-mono text-[10px] text-[#64748B]">
                    <div>{log.timestamp}</div>
                    <div>
                      Actor: {log.actorId} ({log.actorRole})
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
