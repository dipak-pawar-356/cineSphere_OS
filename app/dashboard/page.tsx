"use client";

import React, { useState } from "react";
import { DASHBOARD_METRICS } from "@/lib/constants/dashboard-stats";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardMetricCard } from "@/components/cards/dashboard-metric-card";
import { RevenueChartPreview } from "@/components/charts/revenue-chart-preview";
import { OccupancyChartPreview } from "@/components/charts/occupancy-chart-preview";
import { RecentBookingsTable } from "@/components/tables/recent-bookings-table";
import { RecentTheatresTable } from "@/components/tables/recent-theatres-table";
import { RecentMoviesTable } from "@/components/tables/recent-movies-table";
import { ComingSoonModal } from "@/components/modals/coming-soon-modal";
import { Building2, Box, Film, Ticket, Users, BarChart3, Settings, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab);
    if (tab !== "dashboard") {
      setModalTitle(`${tab.charAt(0).toUpperCase() + tab.slice(1)} Management Console`);
    }
  };

  return (
    <div className="py-8 md:py-10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start gap-8">
          {/* Super Admin Sidebar (Desktop) */}
          <DashboardSidebar currentTab={activeTab} onSelectTab={handleTabSelect} />

          {/* Main Area */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Mobile Tab Pills for smaller screens */}
            <div className="flex lg:hidden overflow-x-auto pb-2 gap-2 scrollbar-none">
              {["dashboard", "theatres", "halls", "movies", "bookings", "users", "reports", "settings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabSelect(tab)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shrink-0",
                    activeTab === tab
                      ? "bg-amber-400 text-black"
                      : "bg-[#111827] text-[#9CA3AF] hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Welcome Banner */}
            <DashboardHeader />

            {/* Statistics Cards (Theatres, Movies, Bookings, Revenue) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              {DASHBOARD_METRICS.map((metric) => (
                <DashboardMetricCard key={metric.title} metric={metric} />
              ))}
            </div>

            {/* Charts Placeholder Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
              <div className="xl:col-span-2">
                <RevenueChartPreview />
              </div>
              <div className="xl:col-span-1">
                <OccupancyChartPreview />
              </div>
            </div>

            {/* Recent Activity Tables */}
            <div className="space-y-8 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Circuit Operations & Activity
                  </h2>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    Live telemetry across connected exhibition hardware, POS registers, and box office manifests
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-[#9CA3AF]">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Streaming 60s Polling</span>
                </div>
              </div>

              {/* 1. Latest Bookings Table */}
              <RecentBookingsTable />

              {/* 2. Latest Theatres Table */}
              <RecentTheatresTable />

              {/* 3. Latest Movies Table */}
              <RecentMoviesTable />
            </div>
          </div>
        </div>
      </div>

      {/* Submodule Placeholder Modal */}
      <ComingSoonModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        featureName={modalTitle}
        description="This deep management module will be integrated with database persistence, backend APIs, and hardware telemetry in Phase 2."
      />
    </div>
  );
}
