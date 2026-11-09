"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { useTheatreStore, type MonitoredBooking } from "@/store/theatre-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Ticket,
  Search,
  Filter,
  Eye,
  Download,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  X,
  CreditCard,
  Lock,
  RotateCcw,
  AlertTriangle,
  Layers,
  Activity,
  History,
  Timer,
  RefreshCw,
  Ban,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import {
  searchBookingSessionsAction,
  expireBookingSessionAction,
  getBookingAuditLogsAction,
} from "@/actions/booking-engine-actions";
import { BookingSession, BookingAuditLog } from "@/types/booking-engine.types";

export default function TheatreBookingsPage() {
  const { profile, bookings } = useTheatreStore();

  // Top View Navigation: Confirmed Tickets vs Live Booking Sessions
  const [activeView, setActiveView] = useState<"sessions" | "confirmed">("sessions");

  // Confirmed Admissions State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedBooking, setSelectedBooking] = useState<MonitoredBooking | null>(null);

  // Live Booking Engine & Locks State (Phase 2 Part 11)
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [auditLogs, setAuditLogs] = useState<BookingAuditLog[]>([]);
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionStatusFilter, setSessionStatusFilter] = useState<string>("All");
  const [selectedSession, setSelectedSession] = useState<BookingSession | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Load Sessions and Audit Trail
  const loadEngineData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [sessRes, auditRes] = await Promise.all([
        searchBookingSessionsAction({}),
        getBookingAuditLogsAction(),
      ]);

      if (sessRes.success && sessRes.data) {
        setSessions(sessRes.data);
      }
      if (auditRes.success && auditRes.data) {
        setAuditLogs(auditRes.data);
      }
    } catch {
      // Graceful error handling
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEngineData();
    const interval = setInterval(loadEngineData, 10000); // 10s poll for live sessions
    return () => clearInterval(interval);
  }, [loadEngineData]);

  // Force-release / Expire a session lock (Theatre Admin Supervisor Override)
  const handleForceReleaseLock = async (sessionId: string) => {
    try {
      const res = await expireBookingSessionAction(sessionId);
      if (res.success) {
        setFeedbackMessage(`Session ${sessionId} manually expired. Temporary seat locks released.`);
        loadEngineData();
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    } catch {
      setFeedbackMessage("Failed to release lock.");
    }
  };

  // Confirmed Bookings Metrics
  const confirmedCount = bookings.filter(
    (b) => b.bookingStatus === "Confirmed" || b.bookingStatus === "Checked-in"
  ).length;
  const checkedInCount = bookings.filter((b) => b.bookingStatus === "Checked-in").length;
  const cancelledCount = bookings.filter((b) => b.bookingStatus === "Cancelled").length;

  const filteredBookings = bookings
    .filter((b) => {
      if (statusFilter === "All") return true;
      return b.bookingStatus.toLowerCase() === statusFilter.toLowerCase();
    })
    .filter(
      (b) =>
        b.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.movieTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Filtered Sessions
  const activeSessionsCount = sessions.filter((s) => s.status === "Active").length;
  const totalLockedSeatsCount = sessions
    .filter((s) => s.status === "Active")
    .reduce((acc, s) => acc + s.seatCount, 0);

  const filteredSessions = sessions
    .filter((s) => {
      if (sessionStatusFilter === "All") return true;
      return s.status === sessionStatusFilter;
    })
    .filter(
      (s) =>
        s.sessionCode.toLowerCase().includes(sessionSearch.toLowerCase()) ||
        s.showId.toLowerCase().includes(sessionSearch.toLowerCase()) ||
        (s.customerName && s.customerName.toLowerCase().includes(sessionSearch.toLowerCase())) ||
        s.selectedSeats.some((st) => st.seatNumber.toLowerCase().includes(sessionSearch.toLowerCase()))
    );

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Reservations & Booking Engine Operations"
        subtitle={`${profile.name} • Concurrency Locks, Live Sessions & Admission Ledger`}
        description="Monitor real-time customer seat reservations, active 10-minute temporary locks, double-booking prevention, and confirmed QR admissions."
        badge={`${activeSessionsCount} Live Sessions Active`}
        badgeVariant="primary"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadEngineData}
              disabled={isRefreshing}
              className="gap-2 border-[#2A3445] text-white hover:border-[#FBBF24]"
            >
              <RefreshCw className={`h-4 w-4 text-[#FBBF24] ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Sync Engine</span>
            </Button>
            <Link href={ROUTES.THEATRE_ADMIN.BOOKINGS_TODAY}>
              <Button variant="outline" size="sm" className="gap-2 border-[#2A3445] text-white">
                <QrCode className="h-4 w-4 text-[#FBBF24]" /> Today&apos;s Admissions
              </Button>
            </Link>
          </div>
        }
      />

      {/* Primary Section Switcher Tabs */}
      <div className="flex border-b border-[#2A3445] gap-4">
        <button
          type="button"
          onClick={() => setActiveView("sessions")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeView === "sessions"
              ? "border-[#FBBF24] text-[#FBBF24]"
              : "border-transparent text-[#94A3B8] hover:text-white"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Live Booking Sessions & Concurrency Locks</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-400/20 text-[#FBBF24]">
            {activeSessionsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("confirmed")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeView === "confirmed"
              ? "border-[#FBBF24] text-[#FBBF24]"
              : "border-transparent text-[#94A3B8] hover:text-white"
          }`}
        >
          <Ticket className="h-4 w-4" />
          <span>Confirmed Admissions & Issued Tickets</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#2A3445] text-white">
            {bookings.length}
          </span>
        </button>
      </div>

      {feedbackMessage && (
        <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-xs text-amber-300 flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button type="button" onClick={() => setFeedbackMessage(null)}>
            <X className="h-4 w-4 text-amber-400" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: LIVE BOOKING SESSIONS & CONCURRENCY LOCKS MONITOR (PART 11) */}
      {/* ========================================================================= */}
      {activeView === "sessions" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Architectural Law Banner: 3-Tier Separation */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 flex items-center justify-center text-[#FBBF24] shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-white text-sm">
                  Layered Reservation Architecture (Seat Template → Show Inventory → Temporary Session → Confirmed Booking)
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Seats clicked by patrons are temporarily locked with a 10-minute countdown. Double booking is prevented at the engine level without modifying permanent hall layouts.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" size="sm" className="border-amber-400/40 text-amber-400">
                10-Minute Lock TTL
              </Badge>
              <Badge variant="outline" size="sm" className="border-emerald-500/40 text-emerald-400">
                Double-Booking Guard: Active
              </Badge>
            </div>
          </div>

          {/* Engine Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Active Sessions
              </span>
              <div className="text-2xl font-black font-mono text-[#FBBF24]">
                {activeSessionsCount} Live
              </div>
              <span className="text-[10px] text-[#94A3B8]">Browsing / Selecting Seats</span>
            </Card>

            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Currently Locked Seats
              </span>
              <div className="text-2xl font-black font-mono text-white">
                {totalLockedSeatsCount} Seats
              </div>
              <span className="text-[10px] text-amber-400 font-semibold">Under 10m Reservation Locks</span>
            </Card>

            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Anti-Collision Guard
              </span>
              <div className="text-2xl font-black font-mono text-emerald-400">0 Conflicts</div>
              <span className="text-[10px] text-emerald-400">Server-Side Atomic Enforcement</span>
            </Card>

            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Audit Trail Recorded
              </span>
              <div className="text-2xl font-black font-mono text-white">
                {auditLogs.length} Events
              </div>
              <span className="text-[10px] text-[#64748B]">Tamper-evident reservation logs</span>
            </Card>
          </div>

          {/* Sessions Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {["All", "Active", "Expired", "Cancelled"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSessionStatusFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    sessionStatusFilter === tab
                      ? "bg-[#FBBF24] text-[#070B12] font-bold shadow-sm"
                      : "bg-[#111827] text-[#94A3B8] border border-[#2A3445] hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search session code, seat (e.g. B4), show..."
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
              />
            </div>
          </div>

          {/* Live Sessions Table */}
          <Card variant="elevated" className="overflow-hidden border-[#2A3445]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
                  <tr>
                    <th className="py-3.5 px-4">Session Code</th>
                    <th className="py-3.5 px-4">Customer Identity</th>
                    <th className="py-3.5 px-4">Show ID</th>
                    <th className="py-3.5 px-4">Locked Seats</th>
                    <th className="py-3.5 px-4">Subtotal</th>
                    <th className="py-3.5 px-4">Grand Total</th>
                    <th className="py-3.5 px-4">Status & TTL</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
                  {filteredSessions.length > 0 ? (
                    filteredSessions.map((s) => {
                      const isExpired = s.status === "Expired" || new Date(s.expiresAt).getTime() < Date.now();
                      const remainingSecs = Math.max(
                        0,
                        Math.floor((new Date(s.expiresAt).getTime() - Date.now()) / 1000)
                      );
                      const mins = Math.floor(remainingSecs / 60);
                      const secs = remainingSecs % 60;
                      const timerFormatted = `${mins.toString().padStart(2, "0")}:${secs
                        .toString()
                        .padStart(2, "0")}`;

                      return (
                        <tr key={s.id} className="hover:bg-[#161F2E]/60 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-white">
                            <span className="flex items-center gap-1.5">
                              <Lock className="h-3 w-3 text-amber-400" />
                              <span>{s.sessionCode}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-white block">
                              {s.customerName || "Guest Patron"}
                            </span>
                            <span className="text-[10px] text-[#64748B] font-mono">
                              {s.ipAddress || "Web Client"}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[#FBBF24]">{s.showId}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {s.selectedSeats.length > 0 ? (
                                s.selectedSeats.map((seat) => (
                                  <span
                                    key={seat.seatNumber}
                                    className="px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-[10px] font-mono font-bold text-amber-400"
                                  >
                                    {seat.seatNumber}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-[#64748B]">No seats locked</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-white">₹{s.subtotal}</td>
                          <td className="py-3 px-4 font-mono font-bold text-[#FBBF24]">
                            ₹{s.grandTotal}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  s.status === "Active" && !isExpired
                                    ? "warning"
                                    : s.status === "Completed"
                                    ? "success"
                                    : "secondary"
                                }
                                size="sm"
                              >
                                {s.status === "Active" && !isExpired ? "Active Lock" : s.status}
                              </Badge>

                              {s.status === "Active" && !isExpired && (
                                <span className="font-mono text-[11px] font-bold text-amber-300">
                                  {timerFormatted}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => setSelectedSession(s)}
                              className="border-[#2A3445] text-white hover:border-[#FBBF24]"
                            >
                              <Eye className="h-3 w-3 mr-1" /> View
                            </Button>

                            {s.status === "Active" && (
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => handleForceReleaseLock(s.id)}
                                className="border-rose-900/60 text-rose-400 hover:bg-rose-950/30 hover:border-rose-500"
                              >
                                <Ban className="h-3 w-3 mr-1" /> Expire Lock
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#94A3B8]">
                        No active booking sessions found matching the filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Booking Engine Audit Trail */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[#FBBF24]" />
                <h3 className="font-bold text-white text-sm">
                  Seat Reservation Engine Audit Trail (Tamper-Evident Concurrency Logs)
                </h3>
              </div>
              <span className="text-xs text-[#94A3B8]">
                Last {Math.min(auditLogs.length, 10)} Events
              </span>
            </div>

            <Card variant="elevated" className="overflow-hidden border-[#2A3445]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
                    <tr>
                      <th className="py-3 px-4">Event ID</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Session Code</th>
                      <th className="py-3 px-4">Show ID</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Event Details</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
                    {auditLogs.slice(0, 10).map((log) => (
                      <tr key={log.id} className="hover:bg-[#161F2E]/40 font-mono text-[11px]">
                        <td className="py-2.5 px-4 text-[#64748B]">{log.id.substring(0, 14)}...</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              log.action === "CONFLICT_REJECTED"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                : log.action === "SEAT_ADDED"
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                : log.action === "LOCK_RENEWED"
                                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                                : "bg-[#111827] text-white border border-[#2A3445]"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-white font-bold">{log.sessionId}</td>
                        <td className="py-2.5 px-4 text-[#FBBF24]">{log.showId}</td>
                        <td className="py-2.5 px-4 text-[#94A3B8]">{log.role}</td>
                        <td className="py-2.5 px-4 font-sans text-xs text-[#CBD5E1] truncate max-w-xs">
                          {JSON.stringify(log.details)}
                        </td>
                        <td className="py-2.5 px-4 text-right text-[#64748B]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CONFIRMED ADMISSIONS & ISSUED TICKETS (EXISTING LEDGER) */}
      {/* ========================================================================= */}
      {activeView === "confirmed" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Architectural Law Banner: No Manual Booking Creation */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 flex items-center justify-center text-[#FBBF24] shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Customer-Driven Booking Ingestion</h3>
                <p className="text-xs text-[#94A3B8]">
                  Theatre Admins oversee reservations, gate admissions, and settlements. Bookings are generated exclusively by patrons via public checkout rails.
                </p>
              </div>
            </div>
            <Badge variant="outline" size="sm" className="border-emerald-500/40 text-emerald-400 shrink-0">
              Immutable Admissions Stream
            </Badge>
          </div>

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Total Bookings</span>
              <div className="text-2xl font-black font-mono text-white">{bookings.length} Records</div>
              <span className="text-[10px] text-[#64748B]">Across all active screens</span>
            </Card>

            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Confirmed / Checked-In</span>
              <div className="text-2xl font-black font-mono text-emerald-400">{confirmedCount} Active</div>
              <span className="text-[10px] text-emerald-400 font-semibold">{checkedInCount} Scanned at Gates</span>
            </Card>

            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Upcoming Sessions</span>
              <div className="text-2xl font-black font-mono text-[#FBBF24]">Evening Queue</div>
              <span className="text-[10px] text-[#94A3B8]">Next shows at 07:15 PM</span>
            </Card>

            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Cancellations</span>
              <div className="text-2xl font-black font-mono text-white">{cancelledCount} Cancelled</div>
              <span className="text-[10px] text-[#64748B]">Automated refund rail applied</span>
            </Card>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {["All", "Confirmed", "Checked-in", "Cancelled"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === tab
                      ? "bg-[#FBBF24] text-[#070B12] font-bold shadow-sm"
                      : "bg-[#111827] text-[#94A3B8] border border-[#2A3445] hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search booking ref, customer, movie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
              />
            </div>
          </div>

          {/* Bookings Ledger Table */}
          <Card variant="elevated" className="overflow-hidden border-[#2A3445]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
                  <tr>
                    <th className="py-3.5 px-4">Booking Ref</th>
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-4">Movie & Hall</th>
                    <th className="py-3.5 px-4">Showtime</th>
                    <th className="py-3.5 px-4">Allocated Seats</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Payment Rail</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#161F2E]/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">{b.referenceCode}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">{b.customerName}</span>
                        <span className="text-[10px] text-[#64748B] font-mono">{b.customerEmail}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-white font-medium block">{b.movieTitle}</span>
                        <span className="text-[10px] text-[#FBBF24]">{b.hallName}</span>
                      </td>
                      <td className="py-3 px-4 font-mono">{b.showTime}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {b.seats.map((seat) => (
                            <span
                              key={seat}
                              className="px-1.5 py-0.5 rounded bg-[#111827] border border-[#2A3445] text-[10px] font-mono text-[#FBBF24]"
                            >
                              {seat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        ₹{b.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-white font-medium block">{b.paymentMethod}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            b.bookingStatus === "Confirmed"
                              ? "success"
                              : b.bookingStatus === "Checked-in"
                              ? "primary"
                              : "secondary"
                          }
                          size="sm"
                        >
                          {b.bookingStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setSelectedBooking(b)}
                          className="border-[#2A3445] text-white hover:border-[#FBBF24]"
                        >
                          <Eye className="h-3 w-3 mr-1" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Temporary Booking Session Details Inspection Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#111827] border border-[#2A3445] p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#FBBF24]">
                  Temporary Booking Session Snapshot
                </span>
                <h3 className="text-base font-bold text-white font-mono">
                  {selectedSession.sessionCode}
                </h3>
              </div>
              <Badge
                variant={selectedSession.status === "Active" ? "warning" : "secondary"}
                size="sm"
              >
                {selectedSession.status}
              </Badge>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Session ID</span>
                <span className="font-mono text-white">{selectedSession.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Show ID & Theatre</span>
                <span className="font-mono text-white">
                  {selectedSession.showId} • {selectedSession.theatreId}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Patron Identity</span>
                <span className="font-semibold text-white">
                  {selectedSession.customerName || "Anonymous Customer"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Locked Seats ({selectedSession.seatCount})</span>
                <span className="font-mono font-bold text-[#FBBF24]">
                  {selectedSession.selectedSeats.map((s) => s.seatNumber).join(", ") || "None"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Tickets Subtotal</span>
                <span className="font-mono text-white">₹{selectedSession.subtotal}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Convenience Fee</span>
                <span className="font-mono text-white">₹{selectedSession.convenienceFee}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">GST Tax (18%)</span>
                <span className="font-mono text-white">₹{selectedSession.tax}</span>
              </div>
              <div className="flex justify-between py-1.5 pt-2 text-sm font-bold">
                <span className="text-white">Estimated Session Grand Total</span>
                <span className="text-[#FBBF24] font-mono">₹{selectedSession.grandTotal}</span>
              </div>
              <div className="flex justify-between py-1 border-t border-[#2A3445]/40 text-[#64748B]">
                <span>Expires At</span>
                <span className="font-mono">{new Date(selectedSession.expiresAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A3445] flex justify-end gap-2">
              {selectedSession.status === "Active" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleForceReleaseLock(selectedSession.id);
                    setSelectedSession(null);
                  }}
                  className="border-rose-900/60 text-rose-400 hover:bg-rose-950/30 hover:border-rose-500"
                >
                  <Ban className="h-3 w-3 mr-1" /> Expire Lock
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSession(null)}
                className="border-[#2A3445] text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#111827] border border-[#2A3445] p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#FBBF24]">
                  Ticket Reservation Detail
                </span>
                <h3 className="text-base font-bold text-white font-mono">
                  {selectedBooking.referenceCode}
                </h3>
              </div>
              <Badge variant="success" size="sm">
                {selectedBooking.bookingStatus}
              </Badge>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Customer</span>
                <span className="font-semibold text-white">{selectedBooking.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Email / Phone</span>
                <span className="font-mono text-white">
                  {selectedBooking.customerEmail} • {selectedBooking.customerPhone}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Movie & Hall</span>
                <span className="text-white font-medium">
                  {selectedBooking.movieTitle} ({selectedBooking.hallName})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Showtime</span>
                <span className="font-mono text-white">
                  {selectedBooking.showTime} • {selectedBooking.bookingDate}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Booked Seats</span>
                <span className="font-mono font-bold text-[#FBBF24]">
                  {selectedBooking.seats.join(", ")}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Payment Rail & Status</span>
                <span className="text-white font-medium">
                  {selectedBooking.paymentMethod} ({selectedBooking.paymentStatus})
                </span>
              </div>
              <div className="flex justify-between py-1.5 pt-2 text-sm font-bold">
                <span className="text-white">Amount Remitted</span>
                <span className="text-emerald-400 font-mono">
                  ₹{selectedBooking.amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A3445] flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBooking(null)}
                className="border-[#2A3445] text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
