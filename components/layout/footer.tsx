import React from "react";
import Link from "next/link";
import { FOOTER_SECTIONS } from "@/config/navigation";
import { ROUTES } from "@/config/routes";
import { Twitter, Linkedin, Github, Youtube, ShieldCheck, Film, Globe, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer aria-label="Site Footer" className="w-full bg-[#070B12] border-t border-[#2A3445] pt-16 pb-12 text-xs text-[#94A3B8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-10 pb-12 border-b border-[#2A3445]">
          {/* Brand & Mission Column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] flex items-center justify-center font-black text-[#070B12] text-sm shadow-md shadow-[#FBBF24]/20">
                CS
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-base tracking-tight">
                    CineSphere
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30">
                    OS
                  </span>
                </div>
                <span className="text-[9px] text-[#94A3B8] tracking-wider uppercase font-medium">
                  Modern Cinema OS
                </span>
              </div>
            </Link>

            <p className="text-xs text-[#94A3B8] max-w-sm leading-relaxed">
              The operating system for modern cinemas. Built to orchestrate multiplex circuits, 3D hall acoustics, automated scheduling, and omnichannel ticketing worldwide.
            </p>

            {/* System Status Telemetry */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational (99.99% Uptime)</span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-lg bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#94A3B8] hover:text-[#FBBF24] hover:border-[#FBBF24]/40 transition-colors"
                aria-label="Twitter / X"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-lg bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#94A3B8] hover:text-[#FBBF24] hover:border-[#FBBF24]/40 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-lg bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#94A3B8] hover:text-[#FBBF24] hover:border-[#FBBF24]/40 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-lg bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#94A3B8] hover:text-[#FBBF24] hover:border-[#FBBF24]/40 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navigation Columns (Platform, Solutions, Company, Legal) */}
          {FOOTER_SECTIONS.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.items.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="text-[#94A3B8] hover:text-[#FBBF24] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#64748B]">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} CineSphere OS Inc. Enterprise Architecture.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href={ROUTES.PUBLIC.PRIVACY_POLICY} className="hover:text-white transition-colors">
              Privacy Notice
            </Link>
            <Link href={ROUTES.PUBLIC.TERMS_AND_CONDITIONS} className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href={ROUTES.PUBLIC.COOKIES_POLICY} className="hover:text-white transition-colors">
              Cookies Policy
            </Link>
            <span className="text-[#FBBF24] font-mono">
              Build 1.2.0-PROD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
