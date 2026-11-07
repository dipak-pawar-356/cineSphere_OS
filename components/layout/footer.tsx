import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#070B12] border-t border-white/5 pt-16 pb-12 text-xs text-[#9CA3AF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-white/5">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center font-black text-black text-xs shadow-md shadow-amber-500/20">
                CS
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                CineSphere <span className="text-amber-400 font-mono text-xs">OS</span>
              </span>
            </div>

            <p className="text-xs text-[#9CA3AF] max-w-sm leading-relaxed">
              The operating system for modern cinemas. Built to orchestrate multiplex chains, 3D hall acoustics, automated scheduling, and omnichannel ticketing worldwide.
            </p>

            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational (99.99% Uptime)</span>
            </div>
          </div>

          {/* Links Col 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/movies" className="hover:text-amber-400 transition-colors">
                  Movie Programming
                </Link>
              </li>
              <li>
                <Link href="/theatres" className="hover:text-amber-400 transition-colors">
                  Theatre Management
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-amber-400 transition-colors">
                  Executive Dashboard
                </Link>
              </li>
              <li>
                <span className="text-[#9CA3AF]/60 cursor-not-allowed">
                  3D Hall Architect <span className="text-[9px] text-amber-400 font-mono">P2</span>
                </span>
              </li>
              <li>
                <span className="text-[#9CA3AF]/60 cursor-not-allowed">
                  AI Yield Optimizer <span className="text-[9px] text-amber-400 font-mono">P2</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Links Col 2: Solutions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Solutions</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/theatres" className="hover:text-amber-400 transition-colors">
                  Multiplex Chains
                </Link>
              </li>
              <li>
                <Link href="/theatres" className="hover:text-amber-400 transition-colors">
                  Boutique Cinemas
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-amber-400 transition-colors">
                  Concert Simulcasts
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-amber-400 transition-colors">
                  Loyalty & Passes
                </Link>
              </li>
              <li>
                <span className="text-[#9CA3AF]/60 cursor-not-allowed">
                  Film Festivals <span className="text-[9px] text-amber-400 font-mono">P2</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Links Col 3: Enterprise */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Enterprise</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-[#9CA3AF]/80">SOC 2 Type II Certified</span>
              </li>
              <li>
                <span className="text-[#9CA3AF]/80">PCI-DSS Level 1 Ready</span>
              </li>
              <li>
                <span className="text-[#9CA3AF]/80">Dolby Atmos Compliant</span>
              </li>
              <li>
                <span className="text-[#9CA3AF]/80">IMAX Laser Validated</span>
              </li>
              <li>
                <span className="text-amber-400 font-medium">Phase 1 Architecture</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#9CA3AF]/70">
          <div>
            &copy; {new Date().getFullYear()} CineSphere OS Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">
              Privacy Notice
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Terms of Service
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Security Architecture
            </span>
            <span className="text-amber-400/80 font-mono">
              Build 1.0.0-rc1
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
