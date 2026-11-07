import React from "react";
import Link from "next/link";
import { ArrowLeft, LifeBuoy } from "lucide-react";

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#070B12] text-[#F9FAFB] p-4 sm:p-8 relative">
      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-[#FBBF24] flex items-center justify-center font-black text-[#070B12] text-sm">
            CS
          </div>
          <span className="font-bold text-white text-base tracking-tight">
            CineSphere <span className="text-[#FBBF24] font-mono text-xs">OS</span>
          </span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] hover:bg-[#161F2E] border border-[#2A3445] text-xs text-[#CBD5E1] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#FBBF24]" />
          <span>Home</span>
        </Link>
      </header>

      {/* Main Body */}
      <main id="main-content" className="w-full max-w-2xl mx-auto my-auto py-8">
        {children}
      </main>

      {/* Status Footer */}
      <footer className="w-full max-w-2xl mx-auto text-center text-xs text-[#64748B]">
        CineSphere OS Telemetry & Status Infrastructure
      </footer>
    </div>
  );
}

