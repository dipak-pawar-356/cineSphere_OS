import React from "react";
import Link from "next/link";
import { Film, Home, Search, Compass, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Premium Illustration Placeholder */}
        <div className="relative mx-auto h-24 w-24 rounded-3xl bg-[#161F2E] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] shadow-[0_0_40px_rgba(251,191,36,0.15)]">
          <Film className="h-12 w-12 stroke-[1.4]" />
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-rose-400 font-mono text-[10px] font-bold">
            !
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FBBF24]">
            Error 404 • Missing Film Reel
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Off-Screen Projector
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            The auditorium, movie reel, or circuit module you requested does not exist or has been shifted to a different screen.
          </p>
        </div>

        {/* Search Placeholder */}
        <div className="relative max-w-sm mx-auto">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search movie title, cinema complex..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
            disabled
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button variant="primary" size="md" className="w-full sm:w-auto gap-2 font-bold">
              <Home className="h-4 w-4" />
              <span>Go to Home</span>
            </Button>
          </Link>
          <Link href="/movies">
            <Button variant="outline" size="md" className="w-full sm:w-auto gap-2">
              <Film className="h-4 w-4 text-[#FBBF24]" />
              <span>Explore Movies</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
