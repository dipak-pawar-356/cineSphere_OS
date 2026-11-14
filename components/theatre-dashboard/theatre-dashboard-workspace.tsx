"use client";

import React, { useState } from "react";
import {
  RevenueMetricCard,
  BookingMetricCard,
  OccupancyMetricCard,
  CustomersMetricCard,
} from "./metric-card-widget";
import { ShowsStatusWidget } from "./shows-status-widget";
import { HallsStatusWidget } from "./halls-status-widget";
import { PaymentsStatusWidget } from "./payments-status-widget";
import { AlertsStatusWidget } from "./alerts-status-widget";
import { ActivityFeedWidget } from "./activity-feed-widget";
import { QuickActionsWidget } from "./quick-actions-widget";
import { SystemHealthWidget } from "./system-health-widget";
import { WidgetCustomizerModal } from "./widget-customizer-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  RotateCw,
  SlidersHorizontal,
  Clock,
  MapPin,
  Building2,
  Filter,
} from "lucide-react";
import {
  TheatreDashboardBundle,
  DashboardTimeFilterPreset,
  UserDashboardPreferences,
  DashboardFilterInput,
} from "@/types/theatre-dashboard.types";

interface TheatreDashboardWorkspaceProps {
  bundle: TheatreDashboardBundle;
  onRefresh: (filter?: Partial<DashboardFilterInput>) => Promise<void>;
  onSavePreferences: (prefs: Partial<UserDashboardPreferences>) => Promise<void>;
  isRefreshing?: boolean;
}

export function TheatreDashboardWorkspace({
  bundle,
  onRefresh,
  onSavePreferences,
  isRefreshing = false,
}: TheatreDashboardWorkspaceProps) {
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [selectedHall, setSelectedHall] = useState<string>(bundle.filter.hallId || "");
  const [selectedMovie, setSelectedMovie] = useState<string>(bundle.filter.movieId || "");

  const activePeriod = bundle.filter.periodPreset;
  const visibleIds = bundle.userPreferences?.visibleWidgetIds || bundle.registeredWidgets.map((w) => w.id);

  const handlePeriodChange = async (period: DashboardTimeFilterPreset) => {
    await onRefresh({
      theatreId: bundle.theatreId,
      periodPreset: period,
      hallId: selectedHall || undefined,
      movieId: selectedMovie || undefined,
    });
  };

  const handleHallChange = async (hallId: string) => {
    setSelectedHall(hallId);
    await onRefresh({
      theatreId: bundle.theatreId,
      periodPreset: activePeriod,
      hallId: hallId || undefined,
      movieId: selectedMovie || undefined,
    });
  };

  const isWidgetVisible = (widgetId: string) => visibleIds.includes(widgetId);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP OPERATIONAL TOOLBAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D1525] border border-[#2A3445] shadow-xl">
        {/* Left: Theatre Venue Info & Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#F59E0B]">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-base">{bundle.theatreName}</span>
              <Badge variant="warning" size="sm" className="font-mono">
                {bundle.theatreCode}
              </Badge>
              <Badge variant="success" size="sm" dot>
                Live Metrics
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-[#F59E0B]" />
                {bundle.timezone} ({bundle.timeFormat})
              </span>
              <span>•</span>
              <span className="font-mono text-zinc-300">
                Currency: <strong className="text-white">{bundle.currency}</strong> ({bundle.currencySymbol})
              </span>
            </div>
          </div>
        </div>

        {/* Right: Period Presets, Dimension Filters & Refresh Button */}
        <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
          {/* Period Presets */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111827] border border-[#2A3445]">
            {(["TODAY", "YESTERDAY", "THIS_WEEK", "THIS_MONTH"] as DashboardTimeFilterPreset[]).map(
              (period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  disabled={isRefreshing}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activePeriod === period
                      ? "bg-[#F59E0B] text-black font-bold shadow"
                      : "text-zinc-400 hover:text-white hover:bg-[#1E293B]"
                  }`}
                >
                  {period === "THIS_WEEK" ? "Week" : period === "THIS_MONTH" ? "Month" : period.charAt(0) + period.slice(1).toLowerCase()}
                </button>
              )
            )}
          </div>

          {/* Hall Filter Dropdown */}
          {bundle.availableFilters.halls.length > 0 && (
            <select
              value={selectedHall}
              onChange={(e) => handleHallChange(e.target.value)}
              disabled={isRefreshing}
              className="py-1.5 px-2.5 rounded-xl text-xs bg-[#111827] border border-[#2A3445] text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">All Auditoriums ({bundle.availableFilters.halls.length})</option>
              {bundle.availableFilters.halls.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          )}

          {/* Actions: Refresh & Customize */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRefresh(bundle.filter)}
              disabled={isRefreshing}
              className="border-[#2A3445] gap-1.5 text-zinc-300 hover:text-white"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-[#F59E0B]" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCustomizerOpen(true)}
              className="border-[#2A3445] gap-1.5 text-zinc-300 hover:text-white"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#F59E0B]" />
              <span className="hidden sm:inline">Customize</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY OPERATIONAL METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isWidgetVisible("widget-revenue-metric") && (
          <RevenueMetricCard
            revenue={bundle.revenue}
            currencySymbol={bundle.currencySymbol}
            numberFormat={bundle.numberFormat}
          />
        )}
        {isWidgetVisible("widget-booking-metric") && (
          <BookingMetricCard bookings={bundle.bookings} />
        )}
        {isWidgetVisible("widget-occupancy-metric") && (
          <OccupancyMetricCard occupancy={bundle.occupancy} />
        )}
        {isWidgetVisible("widget-booking-metric") && (
          <CustomersMetricCard bookings={bundle.bookings} />
        )}
      </div>

      {/* 3. SHOWS & AUDITORIUM STATUS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {isWidgetVisible("widget-shows-overview") && (
            <ShowsStatusWidget shows={bundle.shows} currencySymbol={bundle.currencySymbol} />
          )}

          {isWidgetVisible("widget-halls-status") && (
            <HallsStatusWidget halls={bundle.halls} />
          )}

          {isWidgetVisible("widget-payments-overview") && (
            <PaymentsStatusWidget
              payments={bundle.payments}
              revenue={bundle.revenue}
              currencySymbol={bundle.currencySymbol}
            />
          )}
        </div>

        {/* 4. SIDEBAR ALERTS, FEED & ACTIONS */}
        <div className="space-y-6">
          {isWidgetVisible("widget-quick-actions") && <QuickActionsWidget />}

          {isWidgetVisible("widget-operational-alerts") && (
            <AlertsStatusWidget alerts={bundle.alerts} />
          )}

          {isWidgetVisible("widget-activity-feed") && (
            <ActivityFeedWidget activities={bundle.activities} />
          )}

          {isWidgetVisible("widget-system-health") && (
            <SystemHealthWidget
              health={bundle.alerts.systemHealth}
              theatreCode={bundle.theatreCode}
            />
          )}
        </div>
      </div>

      {/* 5. WIDGET CUSTOMIZER MODAL */}
      <WidgetCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        registeredWidgets={bundle.registeredWidgets}
        currentPreferences={bundle.userPreferences}
        onSavePreferences={onSavePreferences}
      />
    </div>
  );
}
