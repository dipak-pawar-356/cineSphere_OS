import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { KeyRound, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Forgot Password | CineSphere OS",
};

export default function ForgotPasswordPage() {
  return (
    <Card variant="elevated" className="border-[#2A3445] shadow-2xl">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mb-1">
          <KeyRound className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
        <CardDescription>
          Enter your registered email address and we&apos;ll send you a secure verification link.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Input type="email" label="Account Email" placeholder="name@example.com" disabled />

        <div className="pt-2">
          <Button variant="primary" size="md" fullWidth disabled>
            Send Reset Instructions
          </Button>
        </div>

        <div className="p-3 rounded-xl bg-[#070B12]/60 border border-[#2A3445] text-center text-xs text-[#94A3B8]">
          <span className="text-[#FBBF24] font-semibold">Phase 1 Route Shell:</span> Automated password recovery tokens will link in Phase 2.
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

