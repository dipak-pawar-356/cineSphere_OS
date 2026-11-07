"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Play, Shield, Monitor, Layers, Cpu, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComingSoonButton } from "@/components/buttons/coming-soon-button";

export function HeroSection() {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-amber-500/10 via-amber-400/5 to-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="mesh-grid absolute inset-0 opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Innovation Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111827]/80 border border-amber-400/30 text-amber-400 text-xs font-semibold mb-8 backdrop-blur-md shadow-lg shadow-amber-500/5 hover:border-amber-400/50 transition-colors">
          <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
          <span className="tracking-wide uppercase text-[11px]">
            CineSphere OS 1.0 Enterprise
          </span>
          <span className="text-[#9CA3AF]">•</span>
          <span className="text-white font-normal">Next-Gen Cinema Architecture</span>
        </div>

        {/* Large Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          The Future of <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            Cinema Management
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-[#9CA3AF] max-w-2xl mx-auto leading-relaxed">
          One platform to manage theatres, halls, bookings and customers. Engineered for multiplex chains and modern cinematic venues.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/movies" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto text-sm group">
              Explore Movies
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm">
              <Monitor className="h-4 w-4 mr-2 text-amber-400" />
              Manage Theatre
            </Button>
          </Link>
        </div>

        {/* Large Illustration / Dashboard Preview Placeholder */}
        <div className="mt-14 lg:mt-20 relative max-w-5xl mx-auto">
          {/* Outer glow ring */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-400/30 via-white/10 to-blue-500/30 blur-xl opacity-50" />

          <div className="relative rounded-2xl bg-[#0F172A]/90 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden p-2 sm:p-4">
            {/* Window control dots */}
            <div className="flex items-center justify-between pb-3 px-2 border-b border-white/5 text-xs text-[#9CA3AF]">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 font-mono text-[11px] text-[#9CA3AF]/70 hidden sm:inline">
                  cinesphere-os.core.theatre-preview.terminal
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>650 Screens Active</span>
              </div>
            </div>

            {/* Illustration Graphic / Dashboard Mockup Screen */}
            <div className="mt-3 rounded-xl bg-[#070B12] border border-white/5 p-4 sm:p-8 text-left relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Metric 1 */}
                <div className="p-4 rounded-xl bg-[#161F2E]/80 border border-white/5">
                  <div className="text-[11px] uppercase font-bold text-[#9CA3AF]">
                    Multiplex Cluster
                  </div>
                  <div className="text-2xl font-black text-white mt-1">154 Locations</div>
                  <div className="text-[11px] text-emerald-400 mt-1">● 100% Online & Synced</div>
                </div>

                {/* Metric 2 */}
                <div className="p-4 rounded-xl bg-[#161F2E]/80 border border-white/5">
                  <div className="text-[11px] uppercase font-bold text-[#9CA3AF]">
                    Spatial 3D Engine
                  </div>
                  <div className="text-2xl font-black text-amber-400 mt-1">Laser IMAX & Atmos</div>
                  <div className="text-[11px] text-amber-400/80 mt-1">Acoustic Mapping v2.4</div>
                </div>

                {/* Metric 3 */}
                <div className="p-4 rounded-xl bg-[#161F2E]/80 border border-white/5">
                  <div className="text-[11px] uppercase font-bold text-[#9CA3AF]">
                    Checkout Pipeline
                  </div>
                  <div className="text-2xl font-black text-white mt-1">Sub-second Latency</div>
                  <div className="text-[11px] text-blue-400 mt-1">12K Transactions/sec</div>
                </div>
              </div>

              {/* Graphical Visualizer Strip */}
              <div className="h-36 sm:h-48 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#111827] to-blue-500/10 border border-white/10 p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-amber-400" />
                    Spatial Hall Acoustics & Seat Topology Simulation
                  </span>
                  <span className="text-amber-400 font-mono text-[11px]">
                    INTERACTIVE ARCHITECT PREVIEW
                  </span>
                </div>

                {/* Visualizer wireframe simulation */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-3 py-4">
                  {[40, 65, 80, 55, 90, 75, 100, 85, 70, 95, 60, 45, 85, 75, 90, 65].map(
                    (height, i) => (
                      <div
                        key={i}
                        style={{ height: `${height * 0.8}%` }}
                        className="w-2 sm:w-3 rounded-full bg-gradient-to-t from-amber-400/40 to-amber-300 transition-all duration-300"
                      />
                    )
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#9CA3AF]">
                  <span>Hall 01: 420 Seats • Curve Radius 18.4m</span>
                  <span className="text-emerald-400 font-medium">Dolby Atmos Calibrated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
