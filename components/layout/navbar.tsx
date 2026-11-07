"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, Menu, Sparkles, User, Shield } from "lucide-react";
import { MAIN_NAV_ITEMS } from "@/lib/constants/navigation";
import { LocationSelector } from "@/components/navigation/location-selector";
import { SearchDialog } from "@/components/navigation/search-dialog";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ComingSoonModal } from "@/components/modals/coming-soon-modal";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          scrolled
            ? "bg-[#070B12]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3"
            : "bg-transparent border-b border-white/5 py-4"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Brand Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5 group">
                {/* Modern Brand Mark */}
                <div className="relative h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-300 flex items-center justify-center font-black text-black text-sm shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-all">
                  <span className="tracking-tighter">CS</span>
                  {/* Subtle orbit ring */}
                  <span className="absolute -inset-1 rounded-xl border border-amber-400/40 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                      CineSphere
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30">
                      OS
                    </span>
                  </div>
                  <span className="text-[9px] text-[#9CA3AF] tracking-wider uppercase hidden sm:inline">
                    Modern Cinema OS
                  </span>
                </div>
              </Link>

              {/* Location Selector (Desktop) */}
              <div className="hidden lg:block border-l border-white/10 pl-4">
                <LocationSelector />
              </div>
            </div>

            {/* Middle: Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-[#111827]/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-inner">
              {MAIN_NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 select-none",
                      isActive
                        ? "text-black bg-amber-400 shadow-md shadow-amber-500/20"
                        : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span>{item.label}</span>
                    {item.badge && !isActive && (
                      <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/15 text-amber-400 font-bold border border-amber-400/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions (Search, Notification, Profile, Mobile Menu) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#9CA3AF] hover:text-white bg-[#111827]/60 hover:bg-[#111827] border border-white/10 transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search className="h-4 w-4 text-amber-400" />
                <span className="hidden xl:inline text-[11px] pr-2">Search...</span>
                <kbd className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#9CA3AF]">
                  ⌘K
                </kbd>
              </button>

              {/* Notification Icon */}
              <button
                type="button"
                onClick={() => setNotificationModalOpen(true)}
                className="relative p-2 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              </button>

              {/* Profile Placeholder */}
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer group"
                aria-label="Account Profile"
              >
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-900 border border-white/15 flex items-center justify-center text-amber-400 text-xs font-bold group-hover:border-amber-400/40">
                  <User className="h-4 w-4 text-amber-400" />
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    Admin
                  </span>
                  <span className="text-[10px] text-[#9CA3AF]">HQ Portal</span>
                </div>
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenSearch={() => {
          setMobileMenuOpen(false);
          setSearchOpen(true);
        }}
      />

      {/* Notification Preview Modal */}
      <ComingSoonModal
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        featureName="Real-time Operational Alerts"
        description="Live notifications for screen technical alerts, box office milestone triggers, and staff incident tickets will be active in Phase 2."
      />

      {/* Profile Modal */}
      <ComingSoonModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        featureName="Enterprise SSO & RBAC"
        description="Multi-factor authentication, Okta/SAML single sign-on, and role-based permissions (Director, Manager, Projectionist, Cashier) will arrive in Phase 2."
      />
    </>
  );
}
