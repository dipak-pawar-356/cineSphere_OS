import React from "react";
import Link from "next/link";
import { THEATRE_BOOKINGS } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  QrCode,
  Ticket,
  User,
  Film,
  Calendar,
  Clock,
  CreditCard,
  Printer,
  CheckCircle2,
} from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Booking Inspection | CineSphere OS",
};

export default async function TheatreBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const booking = THEATRE_BOOKINGS.find((b) => b.id === resolvedParams.id) || THEATRE_BOOKINGS[0];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-2">
        <Link href={ROUTES.THEATRE_ADMIN.BOOKINGS}>
          <Button variant="ghost" size="xs" className="gap-1 text-xs text-[#94A3B8]">
            <ArrowLeft className="h-3 w-3" /> Back to Bookings
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`Booking Record: ${booking.referenceCode}`}
        subtitle={`${booking.movieTitle} • ${booking.hallName}`}
        description="Comprehensive reservation manifest including patron contact, allocated seat coordinates, split payment ledger, and digital turnstile QR pass."
        badge={booking.bookingStatus}
        badgeVariant={booking.bookingStatus === "Checked-in" ? "success" : "primary"}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
              <Printer className="h-4 w-4" /> Re-Print Thermal Pass (Phase 2)
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Financial Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
              <Film className="h-4 w-4 text-[#FBBF24]" /> Screening & Seating Particulars
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <span className="text-[#64748B]">Film Title</span>
                <p className="font-bold text-white text-sm mt-0.5">{booking.movieTitle}</p>
              </div>

              <div>
                <span className="text-[#64748B]">Auditorium</span>
                <p className="font-bold text-white text-sm mt-0.5">{booking.hallName}</p>
              </div>

              <div>
                <span className="text-[#64748B]">Showtime</span>
                <p className="font-mono font-bold text-[#FBBF24] mt-0.5">{booking.bookingDate} • {booking.showTime}</p>
              </div>

              <div>
                <span className="text-[#64748B]">Allocated Seat Numbers</span>
                <div className="flex gap-1.5 mt-1">
                  {booking.seats.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-[#111827] border border-[#2A3445] text-white font-mono font-bold text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
              <User className="h-4 w-4 text-[#FBBF24]" /> Patron Identity & Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
              <div>
                <span className="text-[#64748B]">Customer Name</span>
                <p className="font-bold text-white text-sm mt-0.5">{booking.customerName}</p>
              </div>

              <div>
                <span className="text-[#64748B]">Email Address</span>
                <p className="font-mono text-[#CBD5E1] mt-0.5">{booking.customerEmail}</p>
              </div>

              <div>
                <span className="text-[#64748B]">Phone Number</span>
                <p className="font-mono font-semibold text-white mt-0.5">{booking.customerPhone}</p>
              </div>
            </div>
          </Card>

          {/* Payment Split */}
          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#FBBF24]" /> Payment Breakdown
            </h3>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#2A3445]/60">
                <span className="text-[#94A3B8]">Base Ticket Price ({booking.seats.length} Tickets)</span>
                <span className="font-mono font-semibold text-white">₹{(booking.amount * 0.82).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2A3445]/60">
                <span className="text-[#94A3B8]">GST (18% Entertainment Levy)</span>
                <span className="font-mono font-semibold text-white">₹{(booking.amount * 0.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold">
                <span className="text-white">Total Amount Paid</span>
                <span className="font-mono text-[#FBBF24]">₹{booking.amount.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Digital Pass QR Mockup */}
        <div className="space-y-6">
          <Card variant="elevated" className="p-6 text-center space-y-4 bg-gradient-to-b from-[#111827] to-[#161F2E] border-[#2A3445]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FBBF24]">
              CineSphere Mobile Pass
            </span>

            <div className="p-4 rounded-2xl bg-white text-black inline-block mx-auto shadow-2xl">
              <QrCode className="h-36 w-36" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-white block">{booking.referenceCode}</span>
              <p className="text-[10px] text-[#94A3B8]">Scan at Phoenix Marketcity Turnstiles 1-4</p>
            </div>

            <div className="pt-2">
              <Badge variant={booking.bookingStatus === "Checked-in" ? "success" : "primary"} size="sm">
                {booking.bookingStatus === "Checked-in" ? "Admitted at 07:18 PM" : "Ready for Turnstile Scan"}
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

