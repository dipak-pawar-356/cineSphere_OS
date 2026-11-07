import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#070B12] text-[#F9FAFB] p-4 sm:p-8 relative overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#FBBF24]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header: Brand & Back Navigation */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] flex items-center justify-center font-black text-[#070B12] text-sm shadow-md shadow-[#FBBF24]/20 group-hover:scale-105 transition-transform">
            CS
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-base tracking-tight">
              CineSphere <span className="text-[#FBBF24] font-mono text-xs">OS</span>
            </span>
            <span className="text-[10px] text-[#94A3B8]">Security Gateway</span>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] hover:bg-[#161F2E] border border-[#2A3445] text-xs text-[#CBD5E1] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#FBBF24]" />
          <span>Back to CineSphere</span>
        </Link>
      </header>

      {/* Centered Auth Card Container */}
      <main id="main-content" className="w-full max-w-md mx-auto my-auto py-8 z-10">
        {children}
      </main>

      {/* Security Compliance Footer */}
      <footer className="w-full max-w-md mx-auto text-center space-y-2 text-xs text-[#64748B] z-10">
        <div className="flex items-center justify-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            SOC 2 Type II
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-[#FBBF24]" />
            256-Bit TLS End-to-End
          </span>
        </div>
        <div>
          &copy; {new Date().getFullYear()} CineSphere OS Inc. Identity Access Management Architecture.
        </div>
      </footer>
    </div>
  );
}
