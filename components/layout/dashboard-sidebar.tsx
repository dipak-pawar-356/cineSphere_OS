"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Box,
  Film,
  Ticket,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { DASHBOARD_NAV_ITEMS } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

const ICONS_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  Building2: <Building2 className="h-4 w-4" />,
  Box: <Box className="h-4 w-4" />,
  Film: <Film className="h-4 w-4" />,
  Ticket: <Ticket className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
};

interface DashboardSidebarProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
}

export function DashboardSidebar({ currentTab = "dashboard", onSelectTab }: DashboardSidebarProps) {
  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between rounded-2xl bg-[#111827]/80 border border-white/5 p-4 shadow-2xl h-[calc(100vh-7.5rem)] sticky top-24">
      <div className="space-y-6">
        {/* Workspace Title */}
        <div className="px-3 py-2 flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-amber-400 text-black font-black text-xs flex items-center justify-center">
              OS
            </div>
            <div>
              <div className="text-xs font-bold text-white">Central Command</div>
              <div className="text-[10px] text-[#9CA3AF]">Super Admin Role</div>
            </div>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-400" title="Online" />
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#9CA3AF]/60 mb-2">
            Main Management
          </div>
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const tabKey = item.label.toLowerCase();
            const isActive = currentTab === tabKey;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onSelectTab?.(tabKey)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left",
                  isActive
                    ? "bg-amber-400 text-black shadow-md shadow-amber-500/20 font-bold"
                    : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-black" : "text-[#9CA3AF]"}>
                    {ICONS_MAP[item.iconName]}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded font-bold",
                      isActive
                        ? "bg-black text-white"
                        : "bg-white/10 text-amber-400 border border-amber-400/20"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Switcher */}
      <div className="pt-4 border-t border-white/5 space-y-2">
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
            <span>Public Storefront</span>
          </span>
          <span className="text-[10px] font-mono text-[#9CA3AF]">↗</span>
        </Link>
      </div>
    </aside>
  );
}
