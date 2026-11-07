import React from "react";
import Link from "next/link";
import { Wrench, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Scheduled Maintenance | CineSphere OS",
};

export default function MaintenancePage() {
  return (
    <div className="text-center space-y-6 max-w-md mx-auto">
      <div className="h-20 w-20 rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] mx-auto shadow-xl">
        <Wrench className="h-10 w-10 animate-bounce" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#38BDF8]">
          Scheduled Maintenance Window
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Upgrading Projector Cluster
        </h1>
        <p className="text-sm text-[#94A3B8] leading-relaxed">
          CineSphere OS is undergoing a planned firmware rollout and database migration. All showtimes and booked tickets remain secure.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-[#CBD5E1] space-y-1">
        <div className="font-bold text-white flex items-center justify-center gap-1.5">
          <Clock className="h-4 w-4 text-[#FBBF24]" /> Estimated Window: 30 Minutes
        </div>
        <p className="text-[#94A3B8]">Target Completion: 04:00 AM EST</p>
      </div>

      <div className="pt-2">
        <Link href="/">
          <Button variant="outline" size="md">
            Check Status Again
          </Button>
        </Link>
      </div>
    </div>
  );
}
