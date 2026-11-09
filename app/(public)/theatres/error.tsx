"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, Building2, RefreshCw, Home } from "lucide-react";

export default function TheatresError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Theatres Discovery Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-[#111827] border border-[#2A3445] rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="h-16 w-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
          <Building2 className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Complexes Temporarily Unavailable</h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            We couldn&apos;t load the registered cinema complexes. Please try reloading or returning home.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => reset()}
            className="w-full font-bold gap-2 shadow-lg"
          >
            <RefreshCw className="h-4 w-4" /> Reload Complexes
          </Button>

          <Link href="/" className="w-full">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs text-[#94A3B8] border-[#2A3445] gap-2"
            >
              <Home className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

