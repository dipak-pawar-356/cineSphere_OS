import React from "react";
import Link from "next/link";
import { THEATRE_CUSTOMERS, THEATRE_BOOKINGS } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Ticket,
  DollarSign,
  Heart,
  Award,
} from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Patron Profile & Loyalty | CineSphere OS",
};

export default async function TheatreCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const customer = THEATRE_CUSTOMERS.find((c) => c.id === resolvedParams.id) || THEATRE_CUSTOMERS[0];
  const customerBookings = THEATRE_BOOKINGS.filter((b) => b.customerName === customer.name);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-2">
        <Link href={ROUTES.THEATRE_ADMIN.CUSTOMERS}>
          <Button variant="ghost" size="xs" className="gap-1 text-xs text-[#94A3B8]">
            <ArrowLeft className="h-3 w-3" /> Back to Patron Registry
          </Button>
        </Link>
      </div>

      <PageHeader
        title={customer.name}
        subtitle={`${customer.loyaltyTier} • Registered on ${customer.registrationDate}`}
        description="Patron engagement history, lifetime concessions yield, favourite exhibition formats, and reservation logs."
        badge={customer.status}
        badgeVariant="success"
        actions={
          <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
            <Mail className="h-4 w-4" /> Send VIP Concession Offer (Phase 2)
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="space-y-6">
          <Card variant="elevated" className="p-6 text-center space-y-4">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-[#111827] border-2 border-[#FBBF24] mx-auto shadow-xl">
              <img
                src={customer.avatar}
                alt={customer.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">{customer.name}</h2>
              <span className="text-xs text-[#FBBF24] font-semibold">{customer.loyaltyTier}</span>
            </div>

            <div className="pt-3 border-t border-[#2A3445] space-y-2 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Email</span>
                <span className="font-mono text-white">{customer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Phone</span>
                <span className="font-mono text-white">{customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Taste Preference</span>
                <span className="text-[#FBBF24] font-medium">{customer.preferredGenre}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Lifetime Value & Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Total Visits</span>
              <div className="text-2xl font-black font-mono text-white">{customer.totalBookings}</div>
              <span className="text-[10px] text-[#64748B]">Phoenix Marketcity</span>
            </Card>

            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Lifetime Box Office</span>
              <div className="text-2xl font-black font-mono text-[#FBBF24]">₹{customer.totalSpent.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-400 font-semibold">Top 5% Spender</span>
            </Card>

            <Card variant="elevated" className="p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Loyalty Tier</span>
              <div className="text-lg font-black text-white mt-1">{customer.loyaltyTier}</div>
              <span className="text-[10px] text-[#FBBF24]">Complimentary Popcorn active</span>
            </Card>
          </div>

          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
              Recent Booking Activity at CineSphere Grand
            </h3>

            {customerBookings.length > 0 ? (
              <div className="space-y-3 text-xs">
                {customerBookings.map((b) => (
                  <div key={b.id} className="p-3.5 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[#FBBF24] font-bold block">{b.referenceCode}</span>
                      <span className="font-semibold text-white">{b.movieTitle}</span>
                      <span className="text-[10px] text-[#64748B] block">{b.hallName} • Seats {b.seats.join(", ")}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-white block">₹{b.amount}</span>
                      <Badge variant="success" size="sm">{b.bookingStatus}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8]">No past reservations found in local database snapshot.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

