import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComingSoonButton } from "@/components/buttons/coming-soon-button";

export function CtaBannerSection() {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#161F2E] via-[#111827] to-[#161F2E] border border-amber-400/25 p-8 sm:p-14 lg:p-16 shadow-2xl overflow-hidden text-center">
          {/* Subtle glow lights */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Enterprise Early Access</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to Upgrade Your <br className="hidden sm:inline" />
              Cinema Circuit to CineSphere OS?
            </h2>

            <p className="text-sm sm:text-base text-[#9CA3AF] max-w-xl mx-auto leading-relaxed">
              Join leading global multiplex circuits leveraging automated scheduling, 3D spatial acoustics, and high-velocity ticketing.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-sm group">
                  <span>Enter Executive Console</span>
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <ComingSoonButton
                featureName="Schedule Enterprise Product Tour"
                description="Our cinema technology architecture team will schedule a customized live demonstration during Phase 2 onboarding."
                size="lg"
                variant="secondary"
                label="Request Enterprise Demo"
                className="w-full sm:w-auto text-sm"
              />
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#9CA3AF]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-400" />
                Sub-second synchronization
              </span>
              <span>154+ Locations Live</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
