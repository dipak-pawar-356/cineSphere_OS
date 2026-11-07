"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Sparkles, Building2, Film, Ticket, LayoutDashboard, Tag, Calendar } from "lucide-react";
import { MAIN_NAV_ITEMS } from "@/lib/constants/navigation";
import { LocationSelector } from "@/components/navigation/location-selector";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Home: <Sparkles className="h-4 w-4" />,
  Movies: <Film className="h-4 w-4" />,
  Theatres: <Building2 className="h-4 w-4" />,
  Events: <Calendar className="h-4 w-4" />,
  Offers: <Tag className="h-4 w-4" />,
  Dashboard: <LayoutDashboard className="h-4 w-4" />,
};

export function MobileNav({ isOpen, onClose, onOpenSearch }: MobileNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-between bg-[#070B12]/95 backdrop-blur-2xl">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center font-black text-black text-sm shadow-md shadow-amber-500/20">
            CS
          </div>
          <span className="font-bold text-white text-base tracking-tight">
            CineSphere <span className="text-amber-400 font-mono text-xs">OS</span>
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Main navigation list */}
      <div className="px-6 py-6 flex-1 overflow-y-auto space-y-2">
        <div className="mb-4 pb-4 border-b border-white/5">
          <LocationSelector />
        </div>

        {MAIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                isActive
                  ? "bg-amber-400/15 text-amber-400 border border-amber-400/20"
                  : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? "text-amber-400" : "text-[#9CA3AF]"}>
                  {ICON_MAP[item.label]}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-400 text-black">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Mobile Footer actions */}
      <div className="p-6 border-t border-white/10 space-y-3 bg-[#111827]/60">
        <div className="text-xs text-[#9CA3AF] text-center">
          The Operating System for Modern Cinemas
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" onClick={onClose} className="w-full">
            <Button variant="primary" className="w-full text-xs">
              Open Admin Console
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
