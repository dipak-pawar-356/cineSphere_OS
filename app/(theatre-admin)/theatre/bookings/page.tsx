"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function TheatreBookingsPage() {
  const { profile, bookings } = useTheatreStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedBooking, setSelectedBooking] = useState<MonitoredBooking | null>(null);

  const confirmedCount = bookings.filter((b) => b.bookingStatus === "Confirmed" || b.bookingStatus === "Checked-in").length;
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

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Patron Ticket Bookings & Admissions Stream"
        subtitle={`${profile.name} • Live Box Office Reservations & QR Verifications`}
        description="Monitor automated customer ticket purchases, QR turnstile scans, seat allocations, and payment reconciliation for your cinema."
        badge={`${bookings.length} Bookings Stream`}
        badgeVariant="primary"
        actions={
          <div className="flex gap-2">
            <Link href={ROUTES.THEATRE_ADMIN.BOOKINGS_TODAY}>
              <Button variant="outline" size="sm" className="gap-2 border-[#2A3445] text-white">
                <QrCode className="h-4 w-4 text-[#FBBF24]" /> Today&apos;s Admissions
              </Button>
            </Link>
          </div>
        }
      />

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
                        <span key={seat} className="px-1.5 py-0.5 rounded bg-[#111827] border border-[#2A3445] text-[10px] font-mono text-[#FBBF24]">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">₹{b.amount.toLocaleString("en-IN")}</td>
                  <td className="py-3 px-4">
                    <span className="text-white font-medium block">{b.paymentMethod}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">{b.paymentStatus}</span>
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

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#111827] border border-[#2A3445] p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#FBBF24]">Ticket Reservation Detail</span>
                <h3 className="text-base font-bold text-white font-mono">{selectedBooking.referenceCode}</h3>
              </div>
              <Badge variant="success" size="sm">{selectedBooking.bookingStatus}</Badge>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Customer</span>
                <span className="font-semibold text-white">{selectedBooking.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Email / Phone</span>
                <span className="font-mono text-white">{selectedBooking.customerEmail} • {selectedBooking.customerPhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Movie & Hall</span>
                <span className="text-white font-medium">{selectedBooking.movieTitle} ({selectedBooking.hallName})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Showtime</span>
                <span className="font-mono text-white">{selectedBooking.showTime} • {selectedBooking.bookingDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Booked Seats</span>
                <span className="font-mono font-bold text-[#FBBF24]">{selectedBooking.seats.join(", ")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Payment Rail & Status</span>
                <span className="text-white font-medium">{selectedBooking.paymentMethod} ({selectedBooking.paymentStatus})</span>
              </div>
              <div className="flex justify-between py-1.5 pt-2 text-sm font-bold">
                <span className="text-white">Amount Remitted</span>
                <span className="text-emerald-400 font-mono">₹{selectedBooking.amount.toLocaleString("en-IN")}</span>
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
