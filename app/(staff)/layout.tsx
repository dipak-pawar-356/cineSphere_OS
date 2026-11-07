"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { STAFF_NAV_ITEMS } from "@/config/navigation";
import { ROUTES } from "@/config/routes";
import { QrCode, Coffee, Clock, Shield, LogOut, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col w-full bg-[#070B12] text-[#F9FAFB]">
      {/* Staff Operational Header */}
      <header
        aria-label="Staff Terminal Header"
        className="sticky top-0 z-30 h-16 bg-[#0B1220] border-b border-[#2A3445] px-4 sm:px-8 flex items-center justify-between gap-4 select-none"
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-[#FBBF24] flex items-center justify-center font-black text-black text-xs">
              CS
            </div>
            <div>
              <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                <span>Staff Floor Terminal</span>
                <Badge variant="warning" size="sm">
                  POS #08
                </Badge>
              </div>
              <div className="text-[10px] text-[#94A3B8]">Hall Manager / Usher Mode</div>
            </div>
          </Link>
        </div>

        {/* Quick Tabs */}
        <nav className="hidden sm:flex items-center gap-1">
          {STAFF_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-[#161F2E] text-[#FBBF24] border border-[#2A3445]"
                    : "text-[#94A3B8] hover:text-white hover:bg-[#111827]"
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
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

        {/* Shift status & Exit */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#94A3B8] font-mono">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span>Shift: 04h 22m</span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111827] hover:bg-[#161F2E] border border-[#2A3445] text-xs text-[#CBD5E1] transition-colors"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-400" />
            <span className="hidden sm:inline">End Shift</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}

