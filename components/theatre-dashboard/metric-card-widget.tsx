"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Ticket,
  Users,
  Percent,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import {
  RevenueMetricsBundle,
  BookingMetricsBundle,
  OccupancyMetricsBundle,
} from "@/types/theatre-dashboard.types";

interface MetricWidgetsProps {
  revenue: RevenueMetricsBundle;
  bookings: BookingMetricsBundle;
  occupancy: OccupancyMetricsBundle;
  currencySymbol: string;
  numberFormat: "INDIAN" | "INTERNATIONAL";
}

function formatAmount(amount: number, symbol: string, format: "INDIAN" | "INTERNATIONAL"): string {
  if (format === "INDIAN") {
    return `${symbol}${amount.toLocaleString("en-IN")}`;
  }
  return `${symbol}${amount.toLocaleString("en-US")}`;
}

export function RevenueMetricCard({
  revenue,
  currencySymbol,
  numberFormat,
}: {
  revenue: RevenueMetricsBundle;
  currencySymbol: string;
  numberFormat: "INDIAN" | "INTERNATIONAL";
}) {
  const isPositive = revenue.revenueGrowthPercent >= 0;

  return (
    <Card variant="elevated" className="p-5 relative overflow-hidden bg-gradient-to-br from-[#111827] via-[#161F2E] to-[#0D1525] border border-[#2A3445]">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Today&apos;s Gross Revenue
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {formatAmount(revenue.todayRevenue, currencySymbol, numberFormat)}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#F59E0B]">
          <DollarSign className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#2A3445]/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Badge
            variant={isPositive ? "success" : "danger"}
            size="sm"
            className="gap-1 font-mono font-semibold"
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? `+${revenue.revenueGrowthPercent}%` : `${revenue.revenueGrowthPercent}%`}
          </Badge>
          <span className="text-[#94A3B8] text-[11px]">vs yesterday</span>
        </div>
        <div className="text-[#94A3B8] text-[11px]">
          Avg Ticket: <strong className="text-white font-mono">{formatAmount(revenue.averageTicketValue, currencySymbol, numberFormat)}</strong>
        </div>
      </div>
    </Card>
  );
}

export function BookingMetricCard({
  bookings,
}: {
  bookings: BookingMetricsBundle;
}) {
  const isPositive = bookings.bookingGrowthPercent >= 0;

  return (
    <Card variant="elevated" className="p-5 relative overflow-hidden bg-gradient-to-br from-[#111827] via-[#161F2E] to-[#0D1525] border border-[#2A3445]">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Total Bookings
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {bookings.todayBookings.toLocaleString()}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <Ticket className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#2A3445]/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Badge
            variant={isPositive ? "success" : "danger"}
            size="sm"
            className="gap-1 font-mono font-semibold"
          >
            {isPositive ? `+${bookings.bookingGrowthPercent}%` : `${bookings.bookingGrowthPercent}%`}
          </Badge>
          <span className="text-[#94A3B8] text-[11px]">{bookings.todayTicketsSold} tickets</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-emerald-400 flex items-center gap-0.5">
            <CheckCircle2 className="h-3 w-3" /> {bookings.confirmedBookings}
          </span>
          <span className="text-amber-400 flex items-center gap-0.5">
            <Clock className="h-3 w-3" /> {bookings.pendingBookings}
          </span>
          <span className="text-rose-400 flex items-center gap-0.5">
            <XCircle className="h-3 w-3" /> {bookings.cancelledBookings}
          </span>
        </div>
      </div>
    </Card>
  );
}

export function OccupancyMetricCard({
  occupancy,
}: {
  occupancy: OccupancyMetricsBundle;
}) {
  return (
    <Card variant="elevated" className="p-5 relative overflow-hidden bg-gradient-to-br from-[#111827] via-[#161F2E] to-[#0D1525] border border-[#2A3445]">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Live Seat Occupancy
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
            {occupancy.currentOccupancyPercent.toFixed(1)}%
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Percent className="h-5 w-5" />
        </div>
      </div>

      {/* Mini Progress Bar */}
      <div className="w-full bg-[#1F2937] rounded-full h-1.5 mt-2 overflow-hidden">
        <div
          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, occupancy.currentOccupancyPercent)}%` }}
        />
      </div>

      <div className="mt-4 pt-3 border-t border-[#2A3445]/60 flex items-center justify-between text-xs">
        <span className="text-[#94A3B8] text-[11px]">
          Daily Avg: <strong className="text-white font-mono">{occupancy.dailyOccupancyPercent.toFixed(1)}%</strong>
        </span>
        <span className="text-[#94A3B8] text-[11px]">
          Peak: <strong className="text-amber-400 font-mono">{occupancy.peakOccupancyHour} ({occupancy.peakOccupancyPercent}%)</strong>
        </span>
      </div>
    </Card>
  );
}

export function CustomersMetricCard({
  bookings,
}: {
  bookings: BookingMetricsBundle;
}) {
  return (
    <Card variant="elevated" className="p-5 relative overflow-hidden bg-gradient-to-br from-[#111827] via-[#161F2E] to-[#0D1525] border border-[#2A3445]">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Patrons & Footfall
          </span>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono tracking-tight">
            {bookings.todayCustomersCount.toLocaleString()}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <Users className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#2A3445]/60 flex items-center justify-between text-xs">
        <span className="text-[#94A3B8] text-[11px]">
          Tickets Issued: <strong className="text-white font-mono">{bookings.todayTicketsSold}</strong>
        </span>
        <span className="text-emerald-400 text-[11px] font-semibold">
          98.2% Checked-In
        </span>
      </div>
    </Card>
  );
}
