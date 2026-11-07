"use client";

import React, { useState } from "react";
import { Sparkles, X, ArrowRight, Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  description?: string;
}

export function ComingSoonModal({
  isOpen,
  onClose,
  featureName = "This Feature",
  description = "This module is part of the CineSphere OS Enterprise Roadmap (Phase 2). Booking logic, seat selection, and payment gateways will be unlocked in upcoming releases.",
}: ComingSoonModalProps) {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-[#111827] border border-amber-400/30 p-6 sm:p-7 shadow-2xl z-10 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                Phase 1 Preview
              </span>
              <h3 className="text-lg font-bold text-white">{featureName}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
          {description}
        </p>

        <div className="mt-5 p-3.5 rounded-xl bg-[#161F2E] border border-white/5 text-xs text-[#9CA3AF] space-y-2">
          <div className="font-semibold text-white/90">Coming in Phase 2:</div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>Interactive 3D WebGL Seat Picker</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>Multi-currency Global Checkout & Digital Wallets</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>Live Sync with Box Office & Concessions POS</span>
          </div>
        </div>

        {subscribed ? (
          <div className="mt-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>You&apos;re on the priority notification list!</span>
          </div>
        ) : (
          <form onSubmit={handleNotify} className="mt-5 flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your enterprise email..."
              className="flex-1 h-9 px-3 text-xs rounded-lg bg-[#070B12] border border-white/10 text-white placeholder:text-[#9CA3AF]/60 focus:outline-none focus:border-amber-400/50"
              required
            />
            <Button type="submit" variant="primary" size="sm">
              <Bell className="h-3.5 w-3.5 mr-1" />
              Notify
            </Button>
          </form>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Got It
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
