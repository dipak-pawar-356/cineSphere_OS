"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { LATEST_BOOKINGS_DATA } from "@/lib/constants/super-admin";
import {
  Ticket,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  Building2,
  Film,
  Shield,
  Layers,
  History,
  QrCode,
  Eye,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { searchTickets, getTicketAuditLogs } from "@/lib/engine/ticket-engine";
import { DigitalTicket, TicketAuditLog } from "@/types/ticket.types";

export default function SuperAdminBookingsPage() {
  const [activeTab, setActiveTab] = useState<"bookings" | "tickets" | "audit">("bookings");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Bookings filter
  const filteredBookings = useMemo(() => {
    return LATEST_BOOKINGS_DATA.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mRef = b.ref.toLowerCase().includes(q);
        const mCust = b.customer.toLowerCase().includes(q);
        const mMov = b.movie.toLowerCase().includes(q);
        const mTh = b.theatre.toLowerCase().includes(q);
        if (!mRef && !mCust && !mMov && !mTh) return false;
      }
      if (statusFilter !== "all" && b.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [statusFilter, searchQuery]);

  // Digital Tickets query
  const platformTickets = useMemo(() => {
    const res = searchTickets({
      query: searchQuery,
      status: statusFilter === "all" ? "ALL" : (statusFilter.toUpperCase() as any),
    });
    return res.tickets;
  }, [searchQuery, statusFilter, activeTab]);

  // Ticket Audit Logs
  const auditLogs = useMemo(() => {
    return getTicketAuditLogs();
  }, [activeTab]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
  const paginated = filteredBookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cross-Circuit Global Bookings & Digital Tickets Registry"
        subtitle="124,850 Monthly Transactions Across 25 Flagship Multiplexes"
        description="Audit all ticket reservations, digital QR turnstile passes, payment gateway settlements, and cryptographic access logs platform-wide."
        badge="Super Admin Audit Plane"
        badgeVariant="success"
      />

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#2A3445]">
        <button
          type="button"
          onClick={() => {
            setActiveTab("bookings");
            setSearchQuery("");
            setStatusFilter("all");
          }}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "bookings"
              ? "border-[#FBBF24] text-[#FBBF24]"
              : "border-transparent text-[#94A3B8] hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Global Bookings Ledger</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#1E2E48] text-white">
            {LATEST_BOOKINGS_DATA.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("tickets");
            setSearchQuery("");
            setStatusFilter("all");
          }}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "tickets"
              ? "border-[#FBBF24] text-[#FBBF24]"
              : "border-transparent text-[#94A3B8] hover:text-white"
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Issued Digital Tickets (Part 13)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-400/20 text-[#FBBF24]">
            {platformTickets.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("audit");
            setSearchQuery("");
          }}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "audit"
              ? "border-[#FBBF24] text-[#FBBF24]"
              : "border-transparent text-[#94A3B8] hover:text-white"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Ticket Audit Trail</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Today's Volume", val: "4,820 Tix", sub: "+14.2% vs Yesterday" },
          { label: "Monthly Volume", val: "124,850 Tix", sub: "+18.6% MoM" },
          { label: "Gross Box Office", val: "₹8.6 Cr", sub: "100% Settled" },
          { label: "Active Digital Passes", val: `${platformTickets.length} Issued`, sub: "QR Dynamic Verification Active" },
        ].map((m, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">{m.label}</div>
            <div className="text-xl font-extrabold font-mono text-white">{m.val}</div>
            <div className="text-[11px] text-emerald-400">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* TAB 1: BOOKINGS LEDGER */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
              {["all", "confirmed", "processing", "refunded"].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-medium capitalize ${
                    statusFilter === st
                      ? "bg-[#FBBF24] text-[#070B12] font-bold"
                      : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search ref, customer, movie, theatre..."
                className="w-full bg-[#111827] border border-[#2A3445] rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
              />
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-[#161F2E] border border-[#2A3445] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
                  <tr>
                    <th className="p-3.5">Ref Code</th>
                    <th className="p-3.5">Movie</th>
                    <th className="p-3.5">Theatre & Screen</th>
                    <th className="p-3.5">Patron</th>
                    <th className="p-3.5">Seats</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#64748B]">
                        No bookings matching filters.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((b) => (
                      <tr key={b.id} className="hover:bg-[#111827]/40 transition-colors">
                        <td className="p-3.5 font-mono text-[#FBBF24] font-bold">{b.ref}</td>
                        <td className="p-3.5 font-medium text-white">{b.movie}</td>
                        <td className="p-3.5">
                          <span className="text-white block">{b.theatre}</span>
                        </td>
                        <td className="p-3.5">{b.customer}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-[#111827] border border-[#2A3445] font-mono text-[11px] text-white">
                            {b.seats}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-white">₹{b.amount}</td>
                        <td className="p-3.5 font-mono text-[11px] text-[#94A3B8]">{b.time}</td>
                        <td className="p-3.5">
                          <Badge
                            variant={
                              b.status === "Confirmed"
                                ? "success"
                                : b.status === "Refunded"
                                ? "danger"
                                : "warning"
                            }
                            size="sm"
                          >
                            {b.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#111827]/60 border-t border-[#2A3445] flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-mono text-[11px]">
                Showing {filteredBookings.length} Bookings
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs border-[#2A3445]"
                >
                  Previous
                </Button>
                <span className="font-mono text-white px-2">Page {currentPage} of {totalPages}</span>
                <Button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs border-[#2A3445]"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ISSUED DIGITAL TICKETS (PART 13) */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
              {["all", "active", "used", "cancelled"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-medium uppercase text-[11px] ${
                    statusFilter === st
                      ? "bg-[#FBBF24] text-[#070B12] font-bold"
                      : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket # (TK-...), booking ref (BK-...), movie, patron..."
                className="w-full bg-[#111827] border border-[#2A3445] rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
              />
            </div>
          </div>

          <div className="bg-[#161F2E] border border-[#2A3445] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
                  <tr>
                    <th className="p-3.5">Ticket #</th>
                    <th className="p-3.5">Booking Ref</th>
                    <th className="p-3.5">Movie & Specs</th>
                    <th className="p-3.5">Theatre & Auditorium</th>
                    <th className="p-3.5">Show Date & Time</th>
                    <th className="p-3.5">Seats</th>
                    <th className="p-3.5">Patron</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Pass View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
                  {platformTickets.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-[#64748B]">
                        No digital tickets matching filters.
                      </td>
                    </tr>
                  ) : (
                    platformTickets.map((t) => (
                      <tr key={t.id} className="hover:bg-[#111827]/40 transition-colors">
                        <td className="p-3.5 font-mono text-[#FBBF24] font-bold">{t.ticketNumber}</td>
                        <td className="p-3.5 font-mono text-white">{t.bookingReference}</td>
                        <td className="p-3.5">
                          <span className="font-semibold text-white block">{t.movieTitle}</span>
                          <span className="text-[10px] text-[#94A3B8]">{t.format} • {t.duration}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-white block">{t.theatreName}</span>
                          <span className="text-[10px] text-[#FBBF24]">{t.hallName}</span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">
                          {t.showDate} • {t.showTime}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-[#111827] border border-[#2A3445] font-mono text-white text-[11px]">
                            {t.seatNumber}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-white block">{t.customerName}</span>
                          <span className="text-[10px] text-[#64748B]">{t.customerEmail}</span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              t.status === "ACTIVE"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : t.status === "USED"
                                ? "bg-[#64748B]/20 text-[#94A3B8]"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <Link
                            href={`/tickets/${t.secureId}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#111C2E] border border-[#2A3445] hover:border-[#FBBF24] text-xs text-[#94A3B8] hover:text-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#FBBF24]" />
                            <span>View Pass</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IMMUTABLE AUDIT TRAIL */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex items-center justify-between text-xs text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Immutable Cryptographic Event Stream (Append-Only)</span>
            </div>
            <span className="font-mono text-[11px]">{auditLogs.length} Logged Audit Events</span>
          </div>

          <div className="bg-[#161F2E] border border-[#2A3445] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Event Action</th>
                    <th className="p-3.5">Actor Role</th>
                    <th className="p-3.5">Ticket #</th>
                    <th className="p-3.5">Booking Ref</th>
                    <th className="p-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1] font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#111827]/40 transition-colors">
                      <td className="p-3.5 text-[#94A3B8]">{log.timestamp}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.action === "TICKET_GENERATED"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : log.action === "TICKET_VIEWED"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-white">{log.actor.role}</td>
                      <td className="p-3.5 text-[#FBBF24] font-bold">{log.ticketNumber}</td>
                      <td className="p-3.5 text-white">{log.bookingReference}</td>
                      <td className="p-3.5 text-[#94A3B8] max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
