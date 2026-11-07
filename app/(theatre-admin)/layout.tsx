"use client";

import React from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { THEATRE_ADMIN_NAV_SECTIONS } from "@/config/navigation";
import { CURRENT_THEATRE } from "@/lib/constants/theatre-admin";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { ProfileMenu, NotificationMenu } from "@/components/navigation/dropdown-menu";
import { Building2, ChevronDown, ExternalLink, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TheatreAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex w-full bg-[#070B12] text-[#F9FAFB]">
      {/* Theatre Operator Sidebar */}
      <Sidebar
        sections={THEATRE_ADMIN_NAV_SECTIONS}
        roleName="Theatre Admin"
        roleBadge="Operator"
        workspaceName={CURRENT_THEATRE.name}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Theatre Header */}
        <header
          aria-label="Theatre Admin Header"
          className="sticky top-0 z-20 h-16 bg-[#0B1220]/95 backdrop-blur-md border-b border-[#2A3445] px-4 sm:px-8 flex items-center justify-between gap-4 select-none"
        >
          {/* Left: Theatre Selector & Breadcrumbs */}
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs font-semibold text-white hover:border-[#FBBF24]/40 transition-colors cursor-pointer">
              <Building2 className="h-4 w-4 text-[#FBBF24]" />
              <div className="flex flex-col text-left">
                <span className="truncate max-w-[180px] font-bold">{CURRENT_THEATRE.name}</span>
                <span className="text-[10px] text-[#94A3B8] font-normal flex items-center gap-0.5">
                  <MapPin className="h-2.5 w-2.5 text-[#FBBF24]" /> {CURRENT_THEATRE.city}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-[#64748B] ml-1" />
            </div>

            <div className="overflow-hidden">
              <Breadcrumb showHome={true} />
            </div>
          </div>

          {/* Right: Operational Status & Menus */}
          <div className="flex items-center gap-3 shrink-0">
            <Badge variant="success" size="sm" dot className="hidden md:inline-flex">
              5/5 Laser Screens Active
            </Badge>

            <Link
              href="/"
              target="_blank"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-[#161F2E] border border-[#2A3445] text-xs text-[#CBD5E1] transition-colors"
            >
              <span>Patron View</span>
              <ExternalLink className="h-3 w-3 text-[#64748B]" />
            </Link>

            <NotificationMenu />

            <ProfileMenu
              user={{
                name: "Rajesh Kulkarni",
                email: CURRENT_THEATRE.email,
                role: "General Manager (#CS-PUN-042)",
              }}
            />
          </div>
        </header>

        {/* Content Container */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl w-full mx-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

