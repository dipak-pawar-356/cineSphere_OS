"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Sparkles, Building2, Film, Ticket, LayoutDashboard, Tag, Calendar, Compass, Search } from "lucide-react";
import { PUBLIC_NAV_ITEMS } from "@/config/navigation";
import { ROUTES } from "@/config/routes";
import { LocationSelector } from "@/components/navigation/location-selector";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

export function MobileNav({ isOpen, onClose, onOpenSearch }: MobileNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-between bg-[#070B12]/95 backdrop-blur-2xl animate-in fade-in-0 duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A3445]">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] flex items-center justify-center font-black text-[#070B12] text-sm shadow-md shadow-[#FBBF24]/20">
            CS
          </div>
          <span className="font-bold text-white text-base tracking-tight">
            CineSphere <span className="text-[#FBBF24] font-mono text-xs">OS</span>
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#161F2E] border border-transparent hover:border-[#2A3445] transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main navigation list */}
      <div className="px-6 py-6 flex-1 overflow-y-auto space-y-4">
        {/* Quick Search trigger in drawer */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-[#94A3B8]"
        >
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4 text-[#FBBF24]" />
            Search movies, theatres, events...
          </span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#161F2E] border border-[#2A3445]">
            ⌘K
          </span>
        </button>

        {/* Location Selector */}
        <div className="py-2 border-b border-[#2A3445]/60">
          <LocationSelector />
        </div>

        {/* Nav Links */}
        <div className="space-y-1 pt-1">
          {PUBLIC_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30"
                    : "text-[#94A3B8] hover:text-white hover:bg-[#161F2E]"
                )}
              >
                <span>{item.label}</span>

                {item.badge && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#161F2E] text-[#FBBF24] border border-[#2A3445]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Footer actions */}
      <div className="p-6 border-t border-[#2A3445] space-y-3 bg-[#111827]/80">
        <div className="text-xs text-[#94A3B8] text-center">
          The Operating System for Modern Cinemas
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link href={ROUTES.SUPER_ADMIN.ROOT} onClick={onClose}>
            <Button variant="primary" size="sm" className="w-full text-xs">
              Super Admin
            </Button>
          </Link>
          <Link href={ROUTES.THEATRE_ADMIN.ROOT} onClick={onClose}>
            <Button variant="outline" size="sm" className="w-full text-xs">
              Theatre Portal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
