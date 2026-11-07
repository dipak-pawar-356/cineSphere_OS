"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CUSTOMER_NAV_ITEMS } from "@/config/navigation";
import { Avatar } from "@/components/media";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Award, Ticket, Heart } from "lucide-react";
import { cn } from "@/utils";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col w-full bg-[#070B12] text-[#F9FAFB]">
      <Navbar />

      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Customer Profile Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#161F2E] via-[#111827] to-[#161F2E] border border-[#2A3445] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-5">
            <Avatar name="David Miller" size="xl" />
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  David Miller
                </h2>
                <Badge variant="primary" size="sm" dot>
                  Gold CineClub Tier
                </Badge>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Member since October 2024 • 1,450 CineSphere Loyalty Credits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-[#070B12]/60 border border-[#2A3445] text-center">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Tickets Booked</div>
              <div className="text-lg font-mono font-bold text-[#FBBF24]">24</div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-[#070B12]/60 border border-[#2A3445] text-center">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Loyalty Tier</div>
              <div className="text-lg font-mono font-bold text-emerald-400">VIP</div>
            </div>
          </div>
        </div>

        {/* Customer Sub-Navigation Tabs */}
        <div className="border-b border-[#2A3445] overflow-x-auto scrollbar-none">
          <nav aria-label="Customer Navigation Tabs" className="flex items-center gap-2 min-w-max pb-1">
            {CUSTOMER_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all select-none",
                    isActive
                      ? "bg-[#161F2E] text-[#FBBF24] border border-[#2A3445] shadow-sm"
                      : "text-[#94A3B8] hover:text-white hover:bg-[#111827]"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="primary" size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Child Pages Slot */}
        <div className="w-full">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
