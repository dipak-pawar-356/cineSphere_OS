"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070B12] text-[#F9FAFB] min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl bg-[#111827] border border-white/10 shadow-2xl">
          <div className="h-12 w-12 rounded-xl bg-amber-400 text-black font-black text-lg flex items-center justify-center mx-auto">
            CS
          </div>
          <h2 className="text-xl font-bold text-white">Critical Platform Exception</h2>
          <p className="text-xs text-[#9CA3AF]">
            A root-level layout disruption occurred. Click below to recover the core shell.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-lg bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-colors cursor-pointer"
          >
            Re-initialize Platform Shell
          </button>
        </div>
      </body>
    </html>
  );
}

