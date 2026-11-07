import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/dashboard-widgets";
import { QrCode, Coffee, Clock, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Floor Staff Terminal | CineSphere OS",
};

export default function StaffTerminalPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Hall Manager & Usher Floor POS"
        subtitle="Times Square Complex • Terminal POS #08 (Active Shift)"
        description="Fast-lane gate ticket scanning, rapid offline QR validation, concession pickup fulfillment, and cleaning schedule dispatch."
        badge="Terminal POS #08"
        badgeVariant="warning"
      />

      {/* Floor Shift Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Tickets Scanned Today"
          value="482 Patrons"
          delta="Average scan time: 0.8s"
          deltaType="positive"
          icon={<QrCode className="h-4 w-4" />}
        />
        <MetricCard
          label="Concession Combos Dispatched"
          value="128 Orders"
          delta="Express pickup ready"
          deltaType="positive"
          icon={<Coffee className="h-4 w-4" />}
        />
        <MetricCard
          label="Next Screening Influx"
          value="IMAX Laser Hall 1"
          delta="Door opens in 12m"
          deltaType="neutral"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      {/* Quick POS Operations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href={ROUTES.STAFF.TICKETS} className="group">
          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] hover:border-[#FBBF24]/50 transition-all space-y-4">
            <div className="h-12 w-12 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] group-hover:scale-105 transition-transform">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#FBBF24] transition-colors">
                Gate QR Scanner
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                High-speed camera & laser barcode scan mode with offline dynamic key verification.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-[#FBBF24] gap-1">
              <span>Launch Scanner</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </Link>

        <Link href={ROUTES.STAFF.CONCESSIONS} className="group">
          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] hover:border-[#FBBF24]/50 transition-all space-y-4">
            <div className="h-12 w-12 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#38BDF8] group-hover:scale-105 transition-transform">
              <Coffee className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                Concession Fulfillment
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Order prep screen for mobile order pick-up counter and seat delivery orders.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-[#38BDF8] gap-1">
              <span>Open F&B Terminal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </Link>

        <Link href={ROUTES.STAFF.SCHEDULE} className="group">
          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] hover:border-[#FBBF24]/50 transition-all space-y-4">
            <div className="h-12 w-12 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Floor Roster & Schedule
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Hall cleaning sweep assignments, usher station rotations, and break schedule.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-emerald-400 gap-1">
              <span>View Roster</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

