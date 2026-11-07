"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { SUPER_ADMIN_NAV_SECTIONS } from "@/config/navigation";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { ProfileMenu, NotificationMenu } from "@/components/navigation/dropdown-menu";
import {
  Search,
  Globe,
  Shield,
  Sparkles,
  ExternalLink,
  Menu,
  X,
  MapPin,
  Plus,
  MessageSquare,
  Moon,
  ChevronDown,
  Building2,
  Film,
  CalendarDays,
  FileText,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-[#070B12] text-[#F9FAFB]">
      {/* 1. DESKTOP STICKY SIDEBAR (Hidden on mobile/tablet drawer mode) */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar
          sections={SUPER_ADMIN_NAV_SECTIONS}
          roleName="Super Admin"
          roleBadge="HQ Root"
          workspaceName="CineSphere Global Circuit"
        />
      </div>

      {/* 2. MOBILE & TABLET DRAWER SIDEBAR */}
      {mobileSidebarOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0B1220] z-10 border-r border-[#2A3445]">
            <div className="p-4 border-b border-[#2A3445] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] flex items-center justify-center text-[#070B12] font-black text-xs">
                  CS
                </div>
                <div>
                  <div className="font-bold text-white text-xs">CineSphere HQ</div>
                  <div className="text-[10px] text-[#FBBF24] font-mono">Super Admin Root</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#161F2E]"
                aria-label="Close navigation drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <Sidebar
                sections={SUPER_ADMIN_NAV_SECTIONS}
                roleName="Super Admin"
                roleBadge="HQ Root"
                workspaceName="CineSphere Circuit"
                className="w-full border-r-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Enterprise Top Navigation Bar */}
        <header
          aria-label="Super Admin Command Header"
          className="sticky top-0 z-20 h-16 bg-[#0B1220]/95 backdrop-blur-md border-b border-[#2A3445] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 select-none"
        >
          {/* Left: Mobile Toggle & Hierarchy */}
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#111827] border border-[#2A3445] text-[#94A3B8] hover:text-white"
              aria-label="Open sidebar drawer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-[#2A3445] text-xs font-mono text-[#FBBF24]">
              <Shield className="h-4 w-4" />
              <span className="font-bold">HQ ROOT</span>
            </div>

            <div className="hidden md:block overflow-hidden">
              <Breadcrumb showHome={true} />
            </div>
          </div>

          {/* Center: Global Search Input Placeholder */}
          <div className="flex-1 max-w-md mx-2 hidden sm:block">
            <div
              onClick={() => alert("Global Search: Press ⌘K to search across 25 Theatres, 48 Movies, and 124.8K Bookings (Placeholder)")}
              className="group flex items-center justify-between w-full px-3.5 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] hover:border-[#FBBF24]/50 cursor-pointer transition-colors text-xs text-[#64748B]"
            >
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-[#64748B] group-hover:text-[#FBBF24]" />
                <span className="text-xs text-[#94A3B8]">Search theatres, movies, bookings, audits...</span>
              </div>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#070B12] border border-[#2A3445] text-[10px] font-mono text-[#94A3B8]">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right: Actions, Location, Messages, Notifications & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Location Selector Placeholder */}
            <div
              onClick={() => alert("Location Circuit: All 12 Metro Regions Active (Mumbai, Delhi, Bengaluru, Hyderabad, Pune, Kolkata, Chennai, Ahmedabad, etc.)")}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#111827] border border-[#2A3445] text-[11px] text-[#CBD5E1] hover:border-[#FBBF24]/40 cursor-pointer transition-colors"
              title="Filter by City / Metro Region"
            >
              <MapPin className="h-3.5 w-3.5 text-[#FBBF24]" />
              <span className="font-medium">12 Cities Circuit</span>
              <ChevronDown className="h-3 w-3 text-[#64748B]" />
            </div>

            {/* Quick Actions Dropdown Placeholder */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setQuickActionsOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FBBF24] hover:bg-[#FACC15] text-[#070B12] font-bold text-xs shadow-md shadow-[#FBBF24]/10 transition-colors"
                title="Super Admin Quick Actions"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Actions</span>
              </button>

              {quickActionsOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#111827] border border-[#2A3445] shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in"
                  onClick={() => setQuickActionsOpen(false)}
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    Super Admin Actions
                  </div>
                  <button
                    onClick={() => alert("Action: Create Theatre Wizard (Placeholder in this phase)")}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-white hover:bg-[#161F2E] transition-colors"
                  >
                    <Building2 className="h-3.5 w-3.5 text-[#FBBF24]" />
                    <span>Create New Theatre</span>
                  </button>
                  <button
                    onClick={() => alert("Action: Add Global Movie Print (Placeholder in this phase)")}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-white hover:bg-[#161F2E] transition-colors"
                  >
                    <Film className="h-3.5 w-3.5 text-[#38BDF8]" />
                    <span>Deploy Movie Print</span>
                  </button>
                  <button
                    onClick={() => alert("Action: Create Live Stadium Event (Placeholder in this phase)")}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-white hover:bg-[#161F2E] transition-colors"
                  >
                    <CalendarDays className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Schedule Event</span>
                  </button>
                  <button
                    onClick={() => alert("Action: Generate Box Office Settlement (Placeholder in this phase)")}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-white hover:bg-[#161F2E] transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 text-amber-400" />
                    <span>Generate Reports</span>
                  </button>
                </div>
              )}
            </div>

            {/* Messages / Concierge Placeholder */}
            <button
              type="button"
              onClick={() => alert("Internal Exhibitor Comm Channel: 2 unread messages from PVR & IMAX field ops.")}
              className="relative p-2 rounded-xl bg-[#111827] hover:bg-[#161F2E] border border-[#2A3445] text-[#94A3B8] hover:text-white transition-colors"
              title="Exhibitor Internal Messages"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#2563EB] text-[9px] font-bold text-white flex items-center justify-center">
                2
              </span>
            </button>

            {/* Notifications Popover */}
            <NotificationMenu />

            {/* Theme Toggle Placeholder */}
            <button
              type="button"
              onClick={() => alert("Theme: CineSphere Dark Luxury theme is locked for cinema operations.")}
              className="p-2 rounded-xl bg-[#111827] hover:bg-[#161F2E] border border-[#2A3445] text-[#94A3B8] hover:text-[#FBBF24] transition-colors"
              title="Theme: Dark Luxury (Locked)"
            >
              <Moon className="h-4 w-4" />
            </button>

            {/* Public Portal Preview Link */}
            <Link
              href="/"
              target="_blank"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#111827] hover:bg-[#161F2E] border border-[#2A3445] text-xs text-[#CBD5E1] transition-colors"
              title="Open Customer Front-End Portal"
            >
              <Globe className="h-3.5 w-3.5 text-[#FBBF24]" />
              <span className="text-[11px] font-semibold">Storefront</span>
              <ExternalLink className="h-3 w-3 text-[#64748B]" />
            </Link>

            {/* Admin Profile Dropdown */}
            <ProfileMenu
              user={{
                name: "Marcus Vance",
                email: "marcus.vance@cinesphere.io",
                role: "Super Admin (HQ Director)",
              }}
            />
          </div>
        </header>

        {/* Page Content Container */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
