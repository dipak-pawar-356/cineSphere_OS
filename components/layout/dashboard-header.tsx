"use client";

import React from "react";
import { Sparkles, Calendar, Plus, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComingSoonButton } from "@/components/buttons/coming-soon-button";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({
  title = "Welcome back, Executive Director",
  subtitle = "CineSphere OS is orchestrating 154 multiplex locations across 25 metropolitan territories.",
}: DashboardHeaderProps) {
  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-[#161F2E] via-[#111827] to-[#161F2E] border border-amber-400/20 p-6 sm:p-8 shadow-2xl overflow-hidden mb-8">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-400 text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Super Admin Headquarters • Production Cluster</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {title}
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-[#9CA3AF] max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ComingSoonButton
            featureName="Add New Theatre Complex"
            description="Multiplex onboarding wizard and automated hardware diagnostic setup will be operational in Phase 2."
            size="md"
            variant="primary"
            showSparkle
            label="Add Complex"
          />

          <ComingSoonButton
            featureName="Export Financial Audit Report"
            description="Automated automated distributor royalty splits and IRS/tax ledger export will generate in Phase 2."
            size="md"
            variant="secondary"
            label="Export Data"
          />
        </div>
      </div>
    </div>
  );
}
