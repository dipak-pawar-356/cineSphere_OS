"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { usePlatformStore, type ManagedTheatre, type TheatreApprovalStatus } from "@/store/platform-store";
import {
  Building2,
  Plus,
  MapPin,
  Layers,
  Search,
  Filter,
  Star,
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
  UserCheck,
  Calendar,
  X,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminTheatresManagementPage() {
  const {
    theatres,
    approveTheatre,
    rejectTheatre,
    suspendTheatre,
    activateTheatre,
    deleteTheatre,
  } = usePlatformStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "halls" | "revenue" | "date">("name");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedTheatreId, setSelectedTheatreId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Feedback banner state
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Filter & Search Logic
  const filteredTheatres = useMemo(() => {
    return theatres
      .filter((th) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = th.name.toLowerCase().includes(q);
          const matchChain = th.chain.toLowerCase().includes(q);
          const matchCity = th.city.toLowerCase().includes(q);
          const matchAdmin = th.adminName.toLowerCase().includes(q);
          if (!matchName && !matchChain && !matchCity && !matchAdmin) return false;
        }

        // Status filter
        if (filterStatus !== "all") {
          if (filterStatus === "pending" && th.status !== "Pending Approval") return false;
          if (filterStatus === "active" && th.status !== "Active") return false;
          if (filterStatus === "suspended" && th.status !== "Suspended") return false;
          if (filterStatus === "rejected" && th.status !== "Rejected") return false;
        }

        // Tier filter
        if (filterTier !== "all") {
          if (th.pricingTier.toLowerCase() !== filterTier.toLowerCase()) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "halls") return b.hallCount - a.hallCount;
        if (sortBy === "revenue") return b.grossRevenueMonthly - a.grossRevenueMonthly;
        if (sortBy === "date") return b.registeredDate.localeCompare(a.registeredDate);
        return 0;
      });
  }, [theatres, searchQuery, filterStatus, filterTier, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredTheatres.length / pageSize) || 1;
  const paginatedTheatres = filteredTheatres.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleApprove = (id: string, name: string) => {
    approveTheatre(id);
    showNotice(`Operational license approved for "${name}". Operator credentials active.`);
  };

  const handleOpenReject = (id: string) => {
    setSelectedTheatreId(id);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (selectedTheatreId) {
      rejectTheatre(selectedTheatreId, rejectionReason);
      setRejectModalOpen(false);
      showNotice("Theatre registration rejected. Formal notification logged.");
    }
  };

  const handleSuspend = (id: string, name: string) => {
    suspendTheatre(id);
    showNotice(`Ticketing suspended for "${name}". Booking ingress locked.`);
  };

  const handleActivate = (id: string, name: string) => {
    activateTheatre(id);
    showNotice(`Restored active booking state for "${name}".`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to completely de-register and remove "${name}" from CineSphere OS?`)) {
      deleteTheatre(id);
      showNotice(`Theatre "${name}" removed from platform.`);
    }
  };

  // Metrics summary
  const totalCount = theatres.length;
  const pendingCount = theatres.filter((t) => t.status === "Pending Approval").length;
  const activeCount = theatres.filter((t) => t.status === "Active").length;
  const suspendedCount = theatres.filter((t) => t.status === "Suspended").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Multi-Tenant Cinema Theatres Management"
        subtitle="Full Operational Governance, KYC Validation, Approval Workflows & Tenant Partitions"
        badge={`${totalCount} Total Chains`}
        badgeVariant="primary"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/dashboard/subscriptions">
              <Button variant="outline" size="sm" className="gap-2 border-[#2A3445] text-xs font-semibold">
                <CreditCard className="h-3.5 w-3.5" /> Subscription Tiers
              </Button>
            </Link>
            <Link href="/dashboard/cities">
              <Button variant="primary" size="sm" className="gap-2 text-xs font-bold">
                <MapPin className="h-3.5 w-3.5" /> Metro Jurisdictions
              </Button>
            </Link>
          </div>
        }
      />

      {/* Action Notification Toast Banner */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setFilterStatus("all")}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            filterStatus === "all" ? "bg-[#1E293B] border-[#FBBF24]" : "bg-[#161F2E] border-[#2A3445] hover:border-[#64748B]"
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Total Theatres</div>
          <div className="text-2xl font-extrabold font-mono text-white mt-1">{totalCount}</div>
          <div className="text-[11px] text-[#94A3B8] mt-0.5">Global Fleet</div>
        </div>

        <div
          onClick={() => setFilterStatus("pending")}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            filterStatus === "pending" ? "bg-amber-950/50 border-amber-500" : "bg-[#161F2E] border-[#2A3445] hover:border-amber-500/50"
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3" /> Pending Approvals
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-amber-300/80 mt-0.5">Requires KYC Review</div>
        </div>

        <div
          onClick={() => setFilterStatus("active")}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            filterStatus === "active" ? "bg-emerald-950/50 border-emerald-500" : "bg-[#161F2E] border-[#2A3445] hover:border-emerald-500/50"
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3" /> Active Circuits
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">{activeCount}</div>
          <div className="text-[11px] text-emerald-300/80 mt-0.5">Live Ticketing Allowed</div>
        </div>

        <div
          onClick={() => setFilterStatus("suspended")}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            filterStatus === "suspended" ? "bg-rose-950/50 border-rose-500" : "bg-[#161F2E] border-[#2A3445] hover:border-rose-500/50"
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1.5">
            <PauseCircle className="h-3 w-3" /> Suspended
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-400 mt-1">{suspendedCount}</div>
          <div className="text-[11px] text-rose-300/80 mt-0.5">Lockout Active</div>
        </div>
      </div>

      {/* Filter, Search & Sorting Bar */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {[
            { id: "all", label: "All" },
            { id: "pending", label: `Pending (${pendingCount})` },
            { id: "active", label: `Active (${activeCount})` },
            { id: "suspended", label: "Suspended" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setFilterStatus(item.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                filterStatus === item.id
                  ? "bg-[#FBBF24] text-[#070B12] font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search theatre, chain, city..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
            />
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="name">Sort by Name</option>
            <option value="halls">Sort by Screens</option>
            <option value="revenue">Sort by Revenue</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
      </div>

      {/* Theatres Data Table */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-4 px-5">Theatre / Complex</th>
                <th className="py-4 px-5">City & State</th>
                <th className="py-4 px-5">Screens</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">SaaS Plan</th>
                <th className="py-4 px-5">Operator Admin</th>
                <th className="py-4 px-5">Registration</th>
                <th className="py-4 px-5 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {paginatedTheatres.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#94A3B8]">
                    No cinema theatres matching your current search and filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedTheatres.map((th) => (
                  <tr key={th.id} className="hover:bg-[#111827]/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-white flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] font-black shrink-0">
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
                          <div className="text-[10px] text-[#64748B] font-mono">{th.chain} · {th.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="text-white font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#FBBF24]" />
                        <span>{th.city}</span>
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">{th.state}</div>
                    </td>

                    <td className="py-4 px-5 font-mono text-white font-bold">
                      {th.hallCount} Screens
                    </td>

                    <td className="py-4 px-5">
                      <Badge
                        variant={
                          th.status === "Active"
                            ? "success"
                            : th.status === "Pending Approval"
                            ? "warning"
                            : th.status === "Suspended"
                            ? "danger"
                            : "secondary"
                        }
                        size="sm"
                      >
                        {th.status}
                      </Badge>
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-bold text-white text-[11px]">{th.subscriptionPlan}</span>
                      <div className="text-[10px] text-[#64748B]">Renews: {th.subscriptionRenewal}</div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="text-white font-medium">{th.adminName}</div>
                      <div className="text-[10px] text-[#94A3B8]">{th.adminEmail}</div>
                    </td>

                    <td className="py-4 px-5 font-mono text-[#94A3B8] text-[11px]">
                      {th.registeredDate}
                    </td>

                    {/* Operational Action Controls */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/dashboard/theatres/${th.id}`}>
                          <Button variant="outline" size="sm" className="h-7 px-2 border-[#2A3445] text-xs gap-1 hover:text-[#FBBF24]">
                            <Eye className="h-3 w-3" /> View
                          </Button>
                        </Link>

                        {th.status === "Pending Approval" && (
                          <>
                            <Button
                              onClick={() => handleApprove(th.id, th.name)}
                              variant="primary"
                              size="sm"
                              className="h-7 px-2.5 text-xs font-bold gap-1 bg-emerald-500 hover:bg-emerald-600 text-black border-0"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button
                              onClick={() => handleOpenReject(th.id)}
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs font-bold gap-1 border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </Button>
                          </>
                        )}

                        {th.status === "Active" && (
                          <Button
                            onClick={() => handleSuspend(th.id, th.name)}
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs border-[#2A3445] text-rose-400 hover:bg-rose-500/10 gap-1"
                          >
                            <PauseCircle className="h-3.5 w-3.5" /> Suspend
                          </Button>
                        )}

                        {th.status === "Suspended" && (
                          <Button
                            onClick={() => handleActivate(th.id, th.name)}
                            variant="primary"
                            size="sm"
                            className="h-7 px-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-black border-0 gap-1"
                          >
                            <PlayCircle className="h-3.5 w-3.5" /> Activate
                          </Button>
                        )}

                        <Button
                          onClick={() => handleDelete(th.id, th.name)}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-[#64748B] hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredTheatres.length)} of {filteredTheatres.length} filtered theatres
          </span>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs border-[#2A3445]"
            >
              Previous
            </Button>
            <span className="font-mono font-bold text-white">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs border-[#2A3445]"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Formal Rejection Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0B1220] border border-[#2A3445] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <XCircle className="h-5 w-5 text-rose-500" /> Reject Theatre Application
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-[#94A3B8] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[#94A3B8]">
              State the regulatory, safety, or documentation reason for rejecting this cinema operator application. The applicant will be formally notified.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Fire NOC certificate missing or GSTIN state code mismatch..."
              className="w-full p-3 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
                className="border-[#2A3445] text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmReject}
                className="bg-rose-600 hover:bg-rose-700 text-white border-0 text-xs font-bold"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
