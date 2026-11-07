import React from "react";
import Link from "next/link";
import { THEATRE_BOOKINGS } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Ticket, Eye } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Upcoming Reservations | CineSphere OS",
};

export default function TheatreUpcomingBookingsPage() {
  const upcomingBookings = THEATRE_BOOKINGS.filter((b) => b.bookingStatus === "Confirmed");

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
        title="Upcoming & Advance Ticket Reservations"
        subtitle="Advance Weekend Bookings & Future Scheduled Showtimes • Phoenix Marketcity"
        badge={`${upcomingBookings.length} Active Reservations`}
        badgeVariant="primary"
      />

      <Card variant="elevated" className="overflow-hidden border-[#2A3445]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Patron</th>
                <th className="py-3.5 px-4">Film & Hall</th>
                <th className="py-3.5 px-4">Show Date & Time</th>
                <th className="py-3.5 px-4">Seats Reserved</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60">
              {upcomingBookings.map((bk) => (
                <tr key={bk.id} className="hover:bg-[#161F2E]/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#FBBF24]">{bk.referenceCode}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{bk.customerName}</td>
                  <td className="py-3.5 px-4 text-[#CBD5E1]">{bk.movieTitle}</td>
                  <td className="py-3.5 px-4 font-mono text-[#CBD5E1]">{bk.bookingDate} • {bk.showTime}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{bk.seats.join(", ")}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">₹{bk.amount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link href={`/theatre/bookings/${bk.id}`}>
                      <Button variant="outline" size="xs" className="gap-1 border-[#2A3445] text-xs">
                        <Eye className="h-3 w-3" /> View
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

