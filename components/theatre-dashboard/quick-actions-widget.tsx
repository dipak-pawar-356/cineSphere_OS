"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarPlus,
  Wrench,
  Users,
  Ticket,
  SlidersHorizontal,
  Zap,
} from "lucide-react";
import { ROUTES } from "@/config/routes";

export function QuickActionsWidget() {
  const actions = [
    { label: "Program Show", href: "/theatre/shows/create", icon: CalendarPlus, color: "text-amber-400 hover:text-amber-300" },
    { label: "Calibrate Halls", href: "/theatre/halls", icon: Wrench, color: "text-indigo-400 hover:text-indigo-300" },
    { label: "Staff Roster", href: "/theatre/staff", icon: Users, color: "text-purple-400 hover:text-purple-300" },
    { label: "Live Bookings", href: "/theatre/bookings", icon: Ticket, color: "text-blue-400 hover:text-blue-300" },
    { label: "Venue Config", href: "/theatre/configuration", icon: SlidersHorizontal, color: "text-emerald-400 hover:text-emerald-300" },
  ];

  return (
    <Card variant="elevated" className="p-6 space-y-4 bg-[#0D1525] border border-[#2A3445]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2A3445]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#F59E0B]">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Quick Operator Actions</h3>
            <p className="text-xs text-[#94A3B8]">Frequently used operational workflows</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link key={act.label} href={act.href} className="block">
              <Button
                variant="outline"
                className="w-full h-auto py-3 px-2 flex flex-col items-center justify-center gap-2 border-[#2A3445] bg-[#111827] hover:bg-[#161F2E] text-xs transition-all"
              >
                <Icon className={`h-5 w-5 ${act.color}`} />
                <span className="font-semibold text-zinc-300 text-[11px] truncate">{act.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
