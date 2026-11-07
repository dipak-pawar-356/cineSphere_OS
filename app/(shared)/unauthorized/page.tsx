import React from "react";
import Link from "next/link";
import { ShieldAlert, Home, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "401 Unauthorized Session | CineSphere OS",
};

export default function UnauthorizedPage() {
  return (
    <div className="text-center space-y-6 max-w-md mx-auto">
      <div className="h-20 w-20 rounded-2xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 flex items-center justify-center text-[#FBBF24] mx-auto shadow-xl">
        <Lock className="h-10 w-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FBBF24]">
          401 • Authentication Required
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Restricted Cinema Terminal
        </h1>
        <p className="text-sm text-[#94A3B8] leading-relaxed">
          This auditorium control console or executive dashboard requires an authenticated session key or valid SSO credential.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Link href={ROUTES.AUTH.LOGIN}>
          <Button variant="primary" size="md" className="gap-2">
            Sign In with Credentials
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="md">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

