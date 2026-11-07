import React from "react";
import Link from "next/link";
import { THEATRE_BOOKINGS } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, QrCode, CheckCircle2, Search, Eye } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Today's Bookings & Turnstile Dispatch | CineSphere OS",
};

export default function TheatreTodayBookingsPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-2">
        <Link href={ROUTES.THEATRE_ADMIN.BOOKINGS}>
          <Button variant="ghost" size="xs" className="gap-1 text-xs text-[#94A3B8]">
            <ArrowLeft className="h-3 w-3" /> Back to All Bookings
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Today's Show Admissions & Gate Scanning Queue"
        subtitle="1,842 Admissions Scheduled Today Across 5 Auditoriums • Phoenix Marketcity"
        badge="Active Check-In"
        badgeVariant="success"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <QrCode className="h-4 w-4" /> Open Scanner Camera (Phase 2)
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Scanned at Gate</span>
          <div className="text-2xl font-black font-mono text-emerald-400">1,420 Checked In</div>
          <span className="text-[10px] text-emerald-400">77% Attendance Recorded</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">In Transit / Evening Queue</span>
          <div className="text-2xl font-black font-mono text-[#FBBF24]">422 Pending Scan</div>
          <span className="text-[10px] text-[#94A3B8]">Next Session Starts 07:30 PM</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Turnstile Status</span>
          <div className="text-2xl font-black font-mono text-white">4 / 4 Active</div>
          <span className="text-[10px] text-emerald-400">Zero scanner latency</span>
        </Card>
      </div>

      {/* Bookings List */}
      <Card variant="elevated" className="overflow-hidden border-[#2A3445]">
        <div className="p-4 border-b border-[#2A3445] flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Admissions Roster</h3>
          <span className="text-xs text-[#64748B] font-mono">Today, Nov 07</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
              <tr>
                <th className="py-3 px-4">Ref Code</th>
                <th className="py-3 px-4">Patron</th>
                <th className="py-3 px-4">Hall & Film</th>
                <th className="py-3 px-4">Showtime</th>
                <th className="py-3 px-4">Seats</th>
                <th className="py-3 px-4">Check-In Status</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60">
              {THEATRE_BOOKINGS.slice(0, 10).map((bk) => (
                <tr key={bk.id} className="hover:bg-[#161F2E]/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#FBBF24]">{bk.referenceCode}</td>
                  <td className="py-3 px-4 font-bold text-white">{bk.customerName}</td>
                  <td className="py-3 px-4 text-[#CBD5E1] truncate max-w-[150px]">{bk.movieTitle} ({bk.hallName.split("—")[0]})</td>
                  <td className="py-3 px-4 font-mono text-[#CBD5E1]">{bk.showTime}</td>
                  <td className="py-3 px-4 font-mono text-white">{bk.seats.join(", ")}</td>
                  <td className="py-3 px-4">
                    <Badge variant={bk.bookingStatus === "Checked-in" ? "success" : "secondary"} size="sm">
                      {bk.bookingStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/theatre/bookings/${bk.id}`}>
                      <Button variant="ghost" size="xs" className="h-7 w-7 p-0">
                        <Eye className="h-3.5 w-3.5 text-[#94A3B8]" />
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

