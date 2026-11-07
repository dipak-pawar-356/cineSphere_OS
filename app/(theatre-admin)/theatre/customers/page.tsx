import React from "react";
import Link from "next/link";
import { THEATRE_CUSTOMERS } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Eye, Search, Mail, Phone, Award } from "lucide-react";

export const metadata = {
  title: "Theatre Patrons & Loyalty Roster | CineSphere OS",
};

export default function TheatreCustomersPage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Patron Registry & Loyalty Analytics"
        subtitle="Frequent Visitors, VIP Subscribers & Box Office Spenders at Phoenix Marketcity"
        badge="Active Audience"
        badgeVariant="primary"
      />

      {/* Customer Registry Table */}
      <Card variant="elevated" className="overflow-hidden border-[#2A3445]">
        <div className="p-4 border-b border-[#2A3445] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] w-full sm:w-80">
            <Search className="h-4 w-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search patron by name, phone or email..."
              className="bg-transparent text-xs text-white placeholder-[#64748B] focus:outline-none w-full"
              readOnly
            />
          </div>

          <span className="text-xs text-[#94A3B8] font-mono">{THEATRE_CUSTOMERS.length} Registered Patrons</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-4">Patron & Avatar</th>
                <th className="py-3.5 px-4">Contact Coordinates</th>
                <th className="py-3.5 px-4">Loyalty Tier</th>
                <th className="py-3.5 px-4">Total Admissions</th>
                <th className="py-3.5 px-4">Lifetime Spend</th>
                <th className="py-3.5 px-4">Last Visit</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60">
              {THEATRE_CUSTOMERS.map((cust) => (
                <tr key={cust.id} className="hover:bg-[#161F2E]/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full overflow-hidden bg-[#111827] border border-[#2A3445] shrink-0">
                        <img
                          src={cust.avatar}
                          alt={cust.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-white block text-sm">{cust.name}</span>
                        <span className="text-[10px] text-[#64748B]">Member since {cust.registrationDate}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[#CBD5E1] block">{cust.email}</span>
                    <span className="font-mono text-[10px] text-[#64748B]">{cust.phone}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        cust.loyaltyTier === "CineSphere VIP"
                          ? "warning"
                          : cust.loyaltyTier === "Platinum"
                          ? "primary"
                          : "secondary"
                      }
                      size="sm"
                    >
                      {cust.loyaltyTier}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {cust.totalBookings} Visits
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#FBBF24]">
                    ₹{cust.totalSpent.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#CBD5E1]">
                    {cust.lastBooking}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link href={`/theatre/customers/${cust.id}`}>
                      <Button variant="outline" size="xs" className="gap-1 border-[#2A3445] text-xs">
                        <Eye className="h-3 w-3" /> Profile
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
