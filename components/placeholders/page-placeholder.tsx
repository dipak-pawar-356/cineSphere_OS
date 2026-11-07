import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Layers, LucideIcon, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PagePlaceholderProps {
  title: string;
  description: string;
  badge?: string;
  icon?: LucideIcon;
  targetRole?: string;
  phase?: string;
  futureFeatures?: string[];
}

export function PagePlaceholder({
  title,
  description,
  badge = "Architecture Module",
  icon: Icon = Sparkles,
  targetRole,
  phase = "Phase 2 Roadmap",
  futureFeatures = [
    "Enterprise Multi-Tenant Isolation",
    "Real-time Distributed Event Bus",
    "High-Concurrency Telemetry Streaming",
    "Role-Based Access Control (RBAC)",
  ],
}: PagePlaceholderProps) {
  return (
    <div className="py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl bg-gradient-to-b from-[#161F2E]/90 to-[#111827]/90 border border-[#2A3445] p-8 sm:p-12 md:p-16 shadow-2xl overflow-hidden text-center">
        {/* Ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-400 text-xs font-semibold">
            <Icon className="h-3.5 w-3.5" />
            <span>{badge}</span>
            {targetRole && (
              <>
                <span className="text-[#9CA3AF]">•</span>
                <span className="text-white font-mono">{targetRole}</span>
              </>
            )}
          </div>

          {/* Page Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {title}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-[#9CA3AF] leading-relaxed">
            {description}
          </p>

          {/* Coming Soon Section */}
          <div className="mt-8 pt-8 border-t border-[#2A3445] space-y-4 text-left bg-[#070B12]/60 p-6 rounded-2xl border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                Coming Soon — {phase}
              </span>
              <span className="text-[11px] text-[#9CA3AF]">Zero Business Logic Implemented</span>
            </div>

            <p className="text-xs text-[#9CA3AF]">
              This route foundation is reserved and architecturally scaffolded. Functional services, data contracts, and domain models will attach in subsequent phases without layout restructuring.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {futureFeatures.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-white/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation action */}
          <div className="pt-6 flex justify-center">
            <Link href="/">
              <Button variant="secondary" size="md">
                <Home className="h-4 w-4 mr-2 text-amber-400" />
                Return to Public Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

