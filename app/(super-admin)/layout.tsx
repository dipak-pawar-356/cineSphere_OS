import React from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { SUPER_ADMIN_NAV_SECTIONS } from "@/config/navigation";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { ProfileMenu, NotificationMenu } from "@/components/navigation/dropdown-menu";
import { Search, Globe, Shield, Sparkles, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex w-full bg-[#070B12] text-[#F9FAFB]">
      {/* Enterprise Multi-Section Sidebar */}
      <Sidebar
        sections={SUPER_ADMIN_NAV_SECTIONS}
        roleName="Super Admin"
        roleBadge="HQ Root"
        workspaceName="CineSphere Global Circuit"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin Top Navigation Bar */}
        <header
          aria-label="Super Admin Command Header"
          className="sticky top-0 z-20 h-16 bg-[#0B1220]/90 backdrop-blur-md border-b border-[#2A3445] px-4 sm:px-8 flex items-center justify-between gap-4 select-none"
        >
          {/* Left: Breadcrumbs & Hierarchy indicator */}
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-[#2A3445] text-xs font-mono text-[#FBBF24]">
              <Shield className="h-4 w-4" />
              <span className="font-bold">HQ</span>
            </div>
            <div className="overflow-hidden">
              <Breadcrumb showHome={true} />
            </div>
          </div>

          {/* Right: Quick Telemetry, Notifications & Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Multi-Tenant Status Badge */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#111827] border border-[#2A3445] text-[11px] text-[#94A3B8]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-medium">150 Theatres Online</span>
            </div>

            {/* View Public Portal Link */}
            <Link
              href="/"
              target="_blank"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-[#161F2E] border border-[#2A3445] text-xs text-[#CBD5E1] transition-colors"
              title="Open Customer Front-End"
            >
              <Globe className="h-3.5 w-3.5 text-[#FBBF24]" />
              <span>Public Site</span>
              <ExternalLink className="h-3 w-3 text-[#64748B]" />
            </Link>

            {/* Notifications Popover */}
            <NotificationMenu />

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
          className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl w-full mx-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
