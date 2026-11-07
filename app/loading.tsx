import React from "react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <div className="relative flex items-center justify-center">
        {/* Outer pulsating ring */}
        <div className="h-20 w-20 rounded-2xl border-2 border-amber-400/20 animate-ping absolute" />

        {/* Center Logo Box */}
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center font-black text-black text-xl shadow-xl shadow-amber-500/20 animate-pulse">
          CS
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center space-y-2">
        <span className="text-sm font-semibold tracking-wider uppercase text-amber-400">
          CineSphere OS
        </span>
        <span className="text-xs text-[#9CA3AF]">
          Synchronizing Cinema Core Services...
        </span>
      </div>
    </div>
  );
}
