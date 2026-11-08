"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheatreStore } from "@/store/theatre-store";
import {
  Building2,
  Layers,
  Film,
  Ticket,
  Users,
  Plus,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  SlidersHorizontal,
  MapPin,
  QrCode,
  Image as ImageIcon,
  CreditCard,
  Eye,
} from "lucide-react";
import { MetricCard, MiniChartCard, SystemStatusCard, ActivityCard } from "@/components/dashboard/dashboard-widgets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";

export default function TheatreAdminDashboardPage() {
  const { profile, halls, movies, shows, bookings, staff, paymentConfig, activeTheatreId, switchTenant } = useTheatreStore();

  const activeHallsCount = halls.filter((h) => h.status === "Active" || h.status === "Show Running").length;
  const activeMoviesCount = movies.filter((m) => m.status === "Now Showing").length;
  const upcomingMoviesCount = movies.filter((m) => m.status === "Upcoming").length;
  const totalHallsCount = halls.length;
  const todayShowsCount = shows.length;
  const todayBookingsCount = bookings.length;

  // Selected booking for preview modal
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. WELCOME HERO SECTION (TENANT SCOPED) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111827] via-[#161F2E] to-[#0B1220] border border-[#2A3445] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-[#FBBF24]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="warning" size="sm" className="font-bold">
                {profile.code}
              </Badge>
              <Badge variant="success" size="sm" dot>
                {profile.status} Operations
              </Badge>
              <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[#FBBF24]" />
                {profile.address}, {profile.city}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Good Morning, {profile.name}
              </h1>
              <p className="text-sm text-[#94A3B8] max-w-2xl mt-1">
                You are managing the isolated tenant workspace for <span className="text-white font-semibold">{profile.name}</span>.
                All {totalHallsCount} auditoriums are synchronized with dedicated UPI rail <strong className="text-[#FBBF24] font-mono">{paymentConfig.upiId}</strong>.
              </p>
            </div>
          </div>

          {/* Quick Primary Actions & Tenant Isolation Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
            {/* Quick tenant simulator switch for verification */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#070B12] border border-[#2A3445] text-xs">
              <span className="text-[10px] text-[#64748B] uppercase px-1.5 font-bold">Venue:</span>
              <button
                onClick={() => switchTenant("th-pun-001")}
                className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                  activeTheatreId === "th-pun-001" ? "bg-[#FBBF24] text-[#070B12] font-bold" : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Pune
              </button>
              <button
                onClick={() => switchTenant("th-mum-001")}
                className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                  activeTheatreId === "th-mum-001" ? "bg-[#FBBF24] text-[#070B12] font-bold" : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Mumbai
              </button>
            </div>

            <Link href={ROUTES.THEATRE_ADMIN.SHOWS}>
              <Button variant="primary" size="sm" className="gap-1.5 font-bold bg-[#E50914] text-white hover:bg-[#b80710]">
                <Plus className="h-4 w-4" /> Program Showtime
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. OPERATIONAL QUICK SUMMARY ROW (TODAY'S METRICS) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#2A3445]/60">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Today&apos;s Shows</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-white">{todayShowsCount} Scheduled</div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> 100% on-time dispatch
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Today&apos;s Bookings</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-white">1,842 Tickets</div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Customer purchases active
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Seat Occupancy Rate</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-[#FBBF24]">92.4% Average</div>
            <div className="text-[10px] text-[#94A3B8]">Across all {totalHallsCount} auditoriums</div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Today&apos;s Revenue</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-white">₹4,85,250</div>
            <div className="text-[10px] text-emerald-400 font-semibold">Credited to {paymentConfig.bankName.split(",")[0]}</div>
          </div>
        </div>
      </div>

      {/* 3. POPULAR MOVIE BANNER & OCCUPANCY HIGHLIGHT */}
      <div className="p-5 rounded-2xl bg-[#111827] border border-[#2A3445] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#E50914] to-amber-600 flex items-center justify-center text-white shrink-0 shadow-lg">
            <Film className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="sm">#1 Popular Movie</Badge>
              <span className="text-xs text-[#94A3B8]">Peak Weekend Attraction</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              Pushpa 2: The Rule — 98.2% Weekend Seat Occupancy
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Grossing ₹2,84,000 today across Hall 1 (IMAX) and Hall 2 (Dolby Cinema).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href={ROUTES.THEATRE_ADMIN.SHOWS}>
            <Button variant="outline" size="sm" className="border-[#2A3445] text-white hover:border-[#FBBF24]">
              View All Showtimes →
            </Button>
          </Link>
        </div>
      </div>

      {/* 4. OPERATIONS QUICK ACTIONS (NO MANUAL BOOKING CREATION) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
            Operations Quick Actions
          </h2>
          <span className="text-xs text-[#64748B]">Automated Customer Bookings • Admin Management Console</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: "Manage Movies", icon: Film, href: ROUTES.THEATRE_ADMIN.MOVIES },
            { label: "Program Show", icon: Calendar, href: ROUTES.THEATRE_ADMIN.SHOWS },
            { label: "Manage Halls", icon: Layers, href: ROUTES.THEATRE_ADMIN.HALLS },
            { label: "Monitor Bookings", icon: Ticket, href: ROUTES.THEATRE_ADMIN.BOOKINGS },
            { label: "Manage Staff", icon: Users, href: ROUTES.THEATRE_ADMIN.STAFF },
            { label: "Media Vault", icon: ImageIcon, href: ROUTES.THEATRE_ADMIN.MEDIA },
            { label: "UPI & Rail", icon: QrCode, href: ROUTES.THEATRE_ADMIN.UPI },
            { label: "View Reports", icon: FileText, href: ROUTES.THEATRE_ADMIN.REPORTS },
          ].map((act, i) => (
            <Link key={i} href={act.href}>
              <Card
                variant="interactive"
                className="p-3.5 text-center flex flex-col items-center justify-center gap-2 h-full hover:border-[#FBBF24]/50 group"
              >
                <div className="h-9 w-9 rounded-xl bg-[#111827] border border-[#2A3445] group-hover:border-[#FBBF24]/40 flex items-center justify-center text-[#FBBF24] transition-colors">
                  <act.icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-white leading-tight group-hover:text-[#FBBF24] transition-colors">
                  {act.label}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* 5. THEATRE STATISTICS (7 PRIMARY METRIC CARDS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
            Key Theatre Statistics & Telemetry
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B]">Live {profile.city} Telemetry</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
          <MetricCard
            label="Total Halls"
            value={`${totalHallsCount} Auditoriums`}
            subtitle="Laser Optic Fleet"
            icon={<Layers className="h-4 w-4" />}
          />
          <MetricCard
            label="Active Movies"
            value={`${activeMoviesCount} Titles`}
            subtitle={`${upcomingMoviesCount} Upcoming`}
            icon={<Film className="h-4 w-4" />}
          />
          <MetricCard
            label="Upcoming Movies"
            value={`${upcomingMoviesCount} Titles`}
            subtitle="DCP Ingestion Queue"
            icon={<Film className="h-4 w-4" />}
          />
          <MetricCard
            label="Today's Shows"
            value={`${todayShowsCount} Scheduled`}
            subtitle="Prime Time Active"
            icon={<Clock className="h-4 w-4" />}
          />
          <MetricCard
            label="Today's Bookings"
            value="1,842 Tix"
            delta="+18.4% vs Avg"
            deltaType="positive"
            icon={<Ticket className="h-4 w-4" />}
          />
          <MetricCard
            label="Today's Revenue"
            value="₹4,85,250"
            delta="104% of Target"
            deltaType="positive"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <MetricCard
            label="Seat Occupancy"
            value="92.4%"
            delta="Peak 98% Screen 1"
            deltaType="positive"
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* 6. RECENT BOOKINGS MONITORING (READ-ONLY ADMISSIONS STREAM) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
              <Ticket className="h-4 w-4 text-[#FBBF24]" /> Recent Bookings Stream (Customer Checkouts)
            </h2>
            <p className="text-xs text-[#64748B]">
              Bookings originate automatically from customer purchases. Admins monitor admissions, QR check-ins, and settlements.
            </p>
          </div>
          <Link href={ROUTES.THEATRE_ADMIN.BOOKINGS} className="text-xs font-bold text-[#FBBF24] hover:underline">
            View All {bookings.length} Bookings →
          </Link>
        </div>

        <Card variant="elevated" className="overflow-hidden border-[#2A3445]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Movie & Hall</th>
                  <th className="py-3 px-4">Showtime</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="hover:bg-[#161F2E]/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">{b.referenceCode}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{b.customerName}</div>
                      <div className="text-[10px] text-[#64748B]">{b.customerEmail}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{b.movieTitle}</div>
                      <div className="text-[10px] text-[#FBBF24]">{b.hallName}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">{b.showTime}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {b.seats.map((seat) => (
                          <span key={seat} className="px-1.5 py-0.5 rounded bg-[#111827] border border-[#2A3445] text-[10px] font-mono">
                            {seat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">₹{b.amount.toLocaleString("en-IN")}</td>
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
                        className="border-[#2A3445] text-[#CBD5E1] hover:text-white"
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

      {/* 7. LIVE AUDITORIUM OCCUPANCY & SNAPSHOT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
              Live Auditorium Fleet ({halls.length} Screens)
            </h2>
            <p className="text-xs text-[#64748B]">Real-time projection and seating status</p>
          </div>
          <Link href={ROUTES.THEATRE_ADMIN.HALLS} className="text-xs font-bold text-[#FBBF24] hover:underline">
            Manage Auditoriums →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {halls.map((hall) => (
            <Card key={hall.id} variant="elevated" className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={hall.status === "Active" || hall.status === "Show Running" ? "success" : "warning"} size="sm" dot>
                  {hall.status}
                </Badge>
                <span className="text-[10px] font-mono text-[#94A3B8]">{hall.capacity} Seats</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white truncate">{hall.name}</h3>
                <span className="text-xs text-[#FBBF24] font-medium">{hall.screenType}</span>
              </div>

              <div className="space-y-1 pt-1 border-t border-[#2A3445]/60 text-xs">
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Occupancy</span>
                  <span className="font-mono font-bold text-white">{hall.occupancyPercent}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#111827] overflow-hidden">
                  <div
                    style={{ width: `${hall.occupancyPercent}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#FBBF24]"
                  />
                </div>
              </div>

              <div className="text-[11px] text-[#94A3B8] truncate">
                Now: <span className="text-white font-medium">{hall.currentMovie || "Scheduled Maintenance"}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#111827] border border-[#2A3445] p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#FBBF24]">Customer Ticket Receipt</span>
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
                <span className="font-mono text-white">{selectedBooking.customerEmail}</span>
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
                <span className="text-[#94A3B8]">Allocated Seats</span>
                <span className="font-mono font-bold text-[#FBBF24]">{selectedBooking.seats.join(", ")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A3445]/40">
                <span className="text-[#94A3B8]">Payment Method & Status</span>
                <span className="text-white font-medium">{selectedBooking.paymentMethod} ({selectedBooking.paymentStatus})</span>
              </div>
              <div className="flex justify-between py-1.5 pt-2 text-sm font-bold">
                <span className="text-white">Total Amount</span>
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
                Close Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
