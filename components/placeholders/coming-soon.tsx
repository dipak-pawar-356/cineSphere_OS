import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Layers, ShieldCheck, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

export interface ComingSoonProps {
  moduleName: string;
  description: string;
  versionLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  plannedFeatures?: string[];
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function ComingSoon({
  moduleName,
  description,
  versionLabel = "v1.2 Platform Milestone",
  icon: Icon = Compass,
  plannedFeatures = [
    "Enterprise Multi-Tenant Data Isolation",
    "Real-Time WebSocket State Synchronization",
    "Comprehensive Audit Logging & Role Gateways",
    "Customizable SLA Dashboards & Export APIs",
  ],
  backHref,
  backLabel = "Back to Control Center",
  className,
}: ComingSoonProps) {
  return (
    <div
      className={cn(
        "relative rounded-3xl bg-gradient-to-b from-[#161F2E]/80 to-[#111827]/80 border border-[#2A3445] p-8 sm:p-14 text-center max-w-3xl mx-auto my-8 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
        className
      )}
    >
      {/* Decorative Background Grid/Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#2A3445_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />
      <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-80 h-40 bg-[#FBBF24]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Badges */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111827] border border-[#2A3445] text-xs font-mono">
          <Badge variant="primary" size="sm" dot>
            Roadmap In Progress
          </Badge>
          <span className="text-[#94A3B8]">•</span>
          <span className="text-[#FBBF24] font-semibold">{versionLabel}</span>
        </div>

        {/* Illustration Placeholder */}
        <div className="mx-auto h-24 w-24 rounded-2xl bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] shadow-[0_0_35px_rgba(251,191,36,0.12)]">
          <Icon className="h-12 w-12 stroke-[1.4]" />
        </div>

        {/* Feature Copy */}
        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F9FAFB] tracking-tight">
            {moduleName}
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            {description}
          </p>
        </div>

        {/* Planned Specs Checklist */}
        {plannedFeatures && plannedFeatures.length > 0 && (
          <div className="pt-4 max-w-md mx-auto text-left">
            <div className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#FBBF24]" />
              Architectural Specifications
            </div>
            <ul className="space-y-2">
              {plannedFeatures.map((spec, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-[#94A3B8] bg-[#070B12]/60 p-2.5 rounded-xl border border-[#2A3445]/60"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FBBF24] mt-1.5 shrink-0" />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Navigation */}
        {backHref && (
          <div className="pt-4">
            <Link href={backHref}>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

