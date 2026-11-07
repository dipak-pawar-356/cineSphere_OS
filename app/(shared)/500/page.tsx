import React from "react";
import Link from "next/link";
import { ServerCrash, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "500 Internal Projection Error | CineSphere OS",
};

export default function ServerErrorPage() {
  return (
    <div className="text-center space-y-6 max-w-md mx-auto">
      <div className="h-20 w-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-xl shadow-rose-500/10">
        <ServerCrash className="h-10 w-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400">
          500 • Internal System Exception
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Projection Telemetry Interrupted
        </h1>
        <p className="text-sm text-[#94A3B8] leading-relaxed">
          The edge cluster encountered an unexpected hardware handshake delay. Our circuit operations team has been automatically dispatched.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Link href="/">
          <Button variant="primary" size="md" className="gap-2">
            <Home className="h-4 w-4" /> Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
