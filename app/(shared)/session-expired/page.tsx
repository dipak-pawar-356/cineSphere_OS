import React from "react";
import Link from "next/link";
import { Clock, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Session Expired | CineSphere OS",
};

export default function SessionExpiredPage() {
  return (
    <div className="text-center space-y-6 max-w-md mx-auto">
      <div className="h-20 w-20 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-[#FBBF24] mx-auto shadow-xl">
        <Clock className="h-10 w-10 animate-pulse" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FBBF24]">
          401 • Idle Timeout Reached
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Session Expired
        </h1>
        <p className="text-sm text-[#94A3B8] leading-relaxed">
          Your active security session has timed out due to inactivity or token expiration. Please re-authenticate to resume cinema operations.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Link href={ROUTES.AUTH.LOGIN}>
          <Button variant="primary" size="md" className="gap-2 font-bold shadow-lg shadow-amber-400/20">
            <span>Sign In Again</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="md" className="border-[#2A3445]">
            <Home className="h-4 w-4" /> Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

