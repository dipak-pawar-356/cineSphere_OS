import React from "react";
import Link from "next/link";
import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Verify Email | CineSphere OS",
};

export default function VerifyEmailPage() {
  return (
    <Card variant="elevated" className="border-[#2A3445] shadow-2xl">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mb-1">
          <Mail className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
        <CardDescription>
          Enter the 6-digit confirmation code dispatched to your registered address.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 text-center">
        <div className="flex justify-center">
          <OtpInput length={6} value="482910" disabled />
        </div>

        <Button variant="primary" size="md" fullWidth disabled>
          Confirm Email Address
        </Button>

        <div className="p-3 rounded-xl bg-[#070B12]/60 border border-[#2A3445] text-center text-xs text-[#94A3B8]">
          <span className="text-[#FBBF24] font-semibold">Phase 1 Route Shell:</span> Email verification code verification logic connects in Phase 2.
        </div>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-[#2A3445]/60 text-xs">
        <Link href={ROUTES.AUTH.LOGIN} className="text-[#94A3B8] hover:text-[#FBBF24] flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}

