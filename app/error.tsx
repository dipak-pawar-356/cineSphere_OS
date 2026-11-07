"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to observability pipeline placeholder
    console.error("CineSphere Runtime Exception:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 rounded-2xl bg-[#111827] border border-red-500/20 p-8 shadow-2xl">
        <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto shadow-lg">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-red-400">
            System Exception Captured
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Unexpected Exhibition Glitch
          </h2>
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            An isolated runtime error occurred. Telemetry has been flagged for core engineering review.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="primary" size="sm" onClick={() => reset()}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Retry Action
          </Button>
          <Link href="/">
            <Button variant="secondary" size="sm">
              <Home className="h-3.5 w-3.5 mr-1.5" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

