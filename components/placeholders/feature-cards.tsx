"use client";

import React from "react";
import { Lock, Sparkles, Clock, ArrowRight, ShieldAlert, LayoutDashboard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

// 1. FUTURE MODULE CARD
export function FutureModuleCard({
  moduleName,
  version = "v2.0",
  description,
  className,
}: {
  moduleName: string;
  version?: string;
  description: string;
  className?: string;
}) {
  return (
    <Card variant="elevated" className={cn("p-6 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Badge variant="warning" size="sm">{version}</Badge>
        <span className="text-[10px] font-mono text-[#64748B]">Scheduled Module</span>
      </div>
      <h3 className="text-base font-bold text-white">{moduleName}</h3>
      <p className="text-xs text-[#94A3B8] leading-relaxed">{description}</p>
    </Card>
  );
}

// 2. COMING SOON CARD
export function ComingSoonCard({
  title,
  tagline,
  targetDate = "Phase 2",
  className,
}: {
  title: string;
  tagline: string;
  targetDate?: string;
  className?: string;
}) {
  return (
    <Card variant="basic" className={cn("p-6 text-center space-y-3 border-dashed", className)}>
      <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mx-auto">
        <Clock className="h-5 w-5" />
      </div>
      <h4 className="font-bold text-white text-sm">{title}</h4>
      <p className="text-xs text-[#94A3B8] max-w-xs mx-auto">{tagline}</p>
      <div className="pt-2">
        <Badge variant="outline" size="sm">Launching in {targetDate}</Badge>
      </div>
    </Card>
  );
}

// 3. FEATURE LOCKED CARD
export function FeatureLockedCard({
  featureTitle,
  requiredTier = "Enterprise Plan",
  description = "This capability is reserved for enterprise tier cinema chains.",
  className,
}: {
  featureTitle: string;
  requiredTier?: string;
  description?: string;
  className?: string;
}) {
  return (
    <Card variant="elevated" className={cn("p-6 space-y-3 relative overflow-hidden", className)}>
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <Lock className="h-4 w-4" />
        </div>
        <Badge variant="danger" size="sm">{requiredTier}</Badge>
      </div>
      <h4 className="font-bold text-white text-sm">{featureTitle}</h4>
      <p className="text-xs text-[#94A3B8]">{description}</p>
      <Button variant="outline" size="xs" disabled className="w-full text-xs mt-2 border-[#2A3445]">
        Request License Upgrade
      </Button>
    </Card>
  );
}

// 4. PREMIUM FEATURE CARD
export function PremiumFeatureCard({
  featureTitle,
  tagline,
  perks = [],
  className,
}: {
  featureTitle: string;
  tagline: string;
  perks?: string[];
  className?: string;
}) {
  return (
    <Card variant="elevated" className={cn("p-6 space-y-4 border-[#FBBF24]/50 shadow-xl shadow-[#FBBF24]/5", className)}>
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 rounded-xl bg-[#FBBF24] text-[#070B12] flex items-center justify-center font-bold">
          <Sparkles className="h-5 w-5" />
        </div>
        <Badge variant="solid" size="sm">VIP Perk</Badge>
      </div>
      <div>
        <h4 className="text-base font-bold text-white">{featureTitle}</h4>
        <p className="text-xs text-[#94A3B8] mt-1">{tagline}</p>
      </div>
      {perks.length > 0 && (
        <ul className="space-y-1 text-xs text-[#CBD5E1] pt-2 border-t border-[#2A3445]">
          {perks.map((p, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FBBF24]" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// 5. EMPTY DASHBOARD
export function EmptyDashboard({
  circuitName = "New Cinema Circuit",
  onSetup,
  className,
}: {
  circuitName?: string;
  onSetup?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("p-12 rounded-3xl bg-[#161F2E] border border-dashed border-[#2A3445] text-center space-y-4", className)}>
      <div className="h-14 w-14 rounded-2xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mx-auto">
        <LayoutDashboard className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white">No Telemetry Recorded for {circuitName}</h3>
        <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
          Connect your first Christie or Barco laser projector and auditorium seating map to populate this dashboard.
        </p>
      </div>
      <Button variant="primary" size="sm" onClick={onSetup} className="font-bold">
        Begin Circuit Setup
      </Button>
    </div>
  );
}
