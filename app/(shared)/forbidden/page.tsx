import React from "react";
import Link from "next/link";
import { ShieldX, Home, UserCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "403 Forbidden Access | CineSphere OS",
};

export default async function ForbiddenPage({
  searchParams,
}: {
  searchParams?: Promise<{ attemptedPath?: string; userRole?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const attemptedPath = resolvedParams.attemptedPath;
  const userRole = resolvedParams.userRole;

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

        {attemptedPath && (
          <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] text-left text-xs font-mono space-y-1 mt-4">
            <div className="text-[10px] text-[#64748B] uppercase">Restricted Target</div>
            <div className="text-white truncate">{attemptedPath}</div>
            {userRole && (
              <div className="text-[10px] text-amber-400 pt-1">
                Active Session Role: <strong>{userRole}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Link href={ROUTES.AUTH.LOGIN}>
          <Button variant="primary" size="md" className="gap-2 font-bold shadow-lg shadow-amber-400/20">
            <UserCheck className="h-4 w-4" /> Switch Identity
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
