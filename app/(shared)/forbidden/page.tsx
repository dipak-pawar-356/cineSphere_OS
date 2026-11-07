import React from "react";
import Link from "next/link";
import { ShieldX, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "403 Forbidden Access | CineSphere OS",
};

export default function ForbiddenPage() {
  return (
    <div className="text-center space-y-6 max-w-md mx-auto">
      <div className="h-20 w-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-xl">
        <ShieldX className="h-10 w-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400">
          403 • Insufficient Permission Scope
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Access Scope Denied
        </h1>
        <p className="text-sm text-[#94A3B8] leading-relaxed">
          Your active identity profile does not possess the RBAC scope required to access this tenant auditorium or financial split ledger.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Link href="/">
          <Button variant="primary" size="md">
            Return to Public Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

