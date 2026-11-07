import React from "react";
import Link from "next/link";
import { THEATRE_BOOKINGS } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ticket, Search, Filter, Eye, Download, QrCode } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Ticket Booking Management | CineSphere OS",
};

export default function TheatreBookingsPage() {
  const confirmedCount = THEATRE_BOOKINGS.filter((b) => b.bookingStatus === "Confirmed" || b.bookingStatus === "Checked-in").length;
  const checkedInCount = THEATRE_BOOKINGS.filter((b) => b.bookingStatus === "Checked-in").length;
  const cancelledCount = THEATRE_BOOKINGS.filter((b) => b.bookingStatus === "Cancelled").length;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Patron Ticket Bookings & Reservations"
        subtitle="Live Box Office Reservations, QR Check-In Verifications & Transaction Status"
        badge="Active Roster"
        badgeVariant="primary"
        actions={
          <div className="flex gap-2">
            <Link href={ROUTES.THEATRE_ADMIN.BOOKINGS_TODAY}>
              <Button variant="outline" size="sm" className="gap-2 border-[#2A3445]">
                <QrCode className="h-4 w-4 text-[#FBBF24]" /> Today&apos;s Admissions
              </Button>
            </Link>
            <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
              <Download className="h-4 w-4" /> Export CSV (Phase 2)
            </Button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Total Bookings</span>
          <div className="text-2xl font-black font-mono text-white">1,842 Today</div>
          <span className="text-[10px] text-[#64748B]">Across 5 Screen Schedules</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Scanned & Checked-In</span>
          <div className="text-2xl font-black font-mono text-emerald-400">1,420 Checked</div>
          <span className="text-[10px] text-emerald-400 font-semibold">Turnstile scans active</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Upcoming Tonight</span>
          <div className="text-2xl font-black font-mono text-[#FBBF24]">422 In Queue</div>
          <span className="text-[10px] text-[#94A3B8]">Evening & Night shows</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Refund Requests</span>
          <div className="text-2xl font-black font-mono text-white">1 Cancelled</div>
          <span className="text-[10px] text-[#64748B]">Automated UPI settlement</span>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111827] p-3 rounded-2xl border border-[#2A3445]">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161F2E] border border-[#2A3445] w-full sm:w-80">
          <Search className="h-4 w-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search reference (e.g. BK-PUN), patron, seats..."
            className="bg-transparent text-xs text-white placeholder-[#64748B] focus:outline-none w-full"
            readOnly
          />
        </div>

        <div className="flex items-center gap-2">
          {["All Statuses", "Checked-in", "Confirmed", "Cancelled"].map((status, i) => (
            <button
              key={status}
              type="button"
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                i === 0
                  ? "bg-[#FBBF24] text-[#070B12]"
                  : "bg-[#161F2E] text-[#94A3B8] border border-[#2A3445] hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <Card variant="elevated" className="overflow-hidden border-[#2A3445]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Patron Name</th>
                <th className="py-3.5 px-4">Film & Hall</th>
                <th className="py-3.5 px-4">Showtime</th>
                <th className="py-3.5 px-4">Seats</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60">
              {THEATRE_BOOKINGS.map((bk) => (
                <tr key={bk.id} className="hover:bg-[#161F2E]/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#FBBF24]">
                    {bk.referenceCode}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">{bk.customerName}</span>
                    <span className="text-[10px] text-[#64748B]">{bk.customerPhone}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-white block truncate max-w-[150px]">{bk.movieTitle}</span>
                    <span className="text-[10px] text-[#94A3B8] truncate block max-w-[150px]">{bk.hallName}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#CBD5E1]">
                    {bk.showTime}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex gap-1">
                      {bk.seats.map((s) => (
                        <span key={s} className="px-1.5 py-0.2 rounded bg-[#111827] border border-[#2A3445] text-white font-mono text-[10px] font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    ₹{bk.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={bk.paymentStatus === "Paid" ? "success" : "danger"} size="sm">
                      {bk.paymentMethod}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        bk.bookingStatus === "Checked-in"
                          ? "success"
                          : bk.bookingStatus === "Confirmed"
                          ? "primary"
                          : "danger"
                      }
                      size="sm"
                      dot={bk.bookingStatus === "Checked-in"}
                    >
                      {bk.bookingStatus}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link href={`/theatre/bookings/${bk.id}`}>
                      <Button variant="outline" size="xs" className="gap-1 border-[#2A3445] text-xs">
                        <Eye className="h-3 w-3" /> View Ticket
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
