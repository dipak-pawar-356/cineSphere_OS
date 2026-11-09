"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, Menu, Sparkles, User, Sun, Moon } from "lucide-react";
import { PUBLIC_NAV_ITEMS } from "@/config/navigation";
import { ROUTES } from "@/config/routes";
import { LocationSelector } from "@/components/navigation/location-selector";
import { SearchDialog } from "@/components/navigation/search-dialog";
import { CitySelectorModal } from "@/components/navigation/city-selector-modal";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ProfileMenu, NotificationMenu } from "@/components/navigation/dropdown-menu";
import { cn } from "@/utils";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        aria-label="Global Application Header"
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300 select-none",
          scrolled
            ? "bg-[#070B12]/90 backdrop-blur-xl border-b border-[#2A3445] shadow-[0_12px_40px_rgba(0,0,0,0.5)] py-2.5"
            : "bg-transparent border-b border-[#2A3445]/60 py-3.5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Brand Logo & Circuit Location */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] flex items-center justify-center font-black text-[#070B12] text-sm shadow-md shadow-[#FBBF24]/20 group-hover:scale-105 transition-all">
                  <span className="tracking-tighter">CS</span>
                  <span className="absolute -inset-1 rounded-xl border border-[#FBBF24]/40 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                      CineSphere
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30">
                      OS
                    </span>
                  </div>
                  <span className="text-[9px] text-[#94A3B8] tracking-wider uppercase font-semibold hidden sm:inline">
                    Modern Cinema OS
                  </span>
                </div>
              </Link>

              {/* Location Selector (Desktop) */}
              <div className="hidden lg:block border-l border-[#2A3445] pl-4">
                <LocationSelector />
              </div>
            </div>

            {/* Middle: Navigation Links (Desktop & Tablet) */}
            <nav
              aria-label="Primary Navigation"
              className="hidden lg:flex items-center gap-1 bg-[#111827]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#2A3445] shadow-inner"
            >
              {PUBLIC_NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 select-none",
                      isActive
                        ? "text-[#070B12] bg-[#FBBF24] shadow-md shadow-[#FBBF24]/20 font-bold"
                        : "text-[#94A3B8] hover:text-[#F9FAFB] hover:bg-[#161F2E]"
                    )}
                  >
                    <span>{item.label}</span>
                    {item.badge && !isActive && (
                      <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded-full bg-[#161F2E] text-[#FBBF24] font-bold border border-[#2A3445]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Search, Notifications, Profile, Theme Placeholder, Mobile Menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Universal Search Trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-[#94A3B8] hover:text-white bg-[#111827]/80 hover:bg-[#161F2E] border border-[#2A3445] transition-colors cursor-pointer"
                aria-label="Open Search Dialog (Cmd + K)"
              >
                <Search className="h-4 w-4 text-[#FBBF24]" />
                <span className="hidden xl:inline text-[11px] pr-2">Search...</span>
                <kbd className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#070B12] border border-[#2A3445] text-[#94A3B8]">
                  ⌘K
                </kbd>
              </button>

              {/* Theme Placeholder (Cinema OLED Mode) */}
              <button
                type="button"
                title="Cinema Dark Theme (OLED Calibrated)"
                className="hidden sm:flex h-9 w-9 rounded-xl bg-[#111827] border border-[#2A3445] items-center justify-center text-[#94A3B8] hover:text-[#FBBF24] transition-colors"
                aria-label="Toggle theme mode"
              >
                <Moon className="h-4 w-4" />
              </button>

              {/* Notifications Popover Dropdown */}
              <NotificationMenu />

              {/* Profile Menu Dropdown */}
              <ProfileMenu />

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#161F2E] border border-transparent hover:border-[#2A3445] transition-colors"
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

      {/* Global City Selector Modal */}
      <CitySelectorModal />

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenSearch={() => {
          setMobileMenuOpen(false);
          setSearchOpen(true);
        }}
      />
    </>
  );
}
