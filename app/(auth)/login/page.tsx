import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Sign In | CineSphere OS",
};

export default function LoginPage() {
  return (
    <Card variant="elevated" className="border-[#2A3445] shadow-2xl">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mb-1">
          <Lock className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold">Sign In to CineSphere</CardTitle>
        <CardDescription>
          Access your patron bookings or enterprise cinema administration terminal.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Input
            type="email"
            label="Corporate Email or Patron ID"
            placeholder="name@cinema-circuit.com"
            disabled
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#CBD5E1] font-medium">Password</span>
            <Link
              href={ROUTES.AUTH.FORGOT_PASSWORD}
              className="text-[#FBBF24] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••••••"
            disabled
          />
        </div>

        <div className="pt-2">
          <Button variant="primary" size="md" fullWidth disabled className="gap-2">
            <span>Sign In to Terminal</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-3 rounded-xl bg-[#070B12]/60 border border-[#2A3445] text-center text-xs text-[#94A3B8]">
          <span className="text-[#FBBF24] font-semibold">Phase 1 Route Shell:</span> Authentication logic, JWT session generation, and OAuth providers will connect in Phase 2.
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-0 text-center border-t border-[#2A3445]/60">
        <div className="text-xs text-[#94A3B8]">
          Don&apos;t have an account?{" "}
          <Link href={ROUTES.AUTH.REGISTER} className="text-[#FBBF24] font-semibold hover:underline">
            Register now
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 text-[11px] text-[#64748B]">
          <Link href={ROUTES.AUTH.VERIFY_EMAIL} className="hover:text-[#CBD5E1]">
            Verify Email
          </Link>
          <span>•</span>
          <Link href={ROUTES.AUTH.VERIFY_PHONE} className="hover:text-[#CBD5E1]">
            Verify Phone
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
