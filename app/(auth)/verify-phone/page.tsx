"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Smartphone, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function VerifyPhonePage() {
  const [phone, setPhone] = useState("+91 98200 12345");
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsVerified(true);
    }, 600);
  };

  return (
    <Card variant="elevated" className="border-[#2A3445] shadow-2xl bg-[#0B1220]/95 backdrop-blur-xl">
      <CardHeader className="text-center space-y-2 pb-4">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mb-1 shadow-md">
          <Smartphone className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-black text-white tracking-tight">
          Mobile OTP Verification
        </CardTitle>
        <CardDescription className="text-xs text-[#94A3B8]">
          Multi-Factor Authentication & SMS Box Office Ticket Alerts
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isVerified ? (
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Mobile Device Authenticated</h4>
              <p className="text-xs text-[#94A3B8]">
                Your device has been enrolled into 2FA hardware authorization for rapid ticket dispatch.
              </p>
            </div>
            <div className="pt-2">
              <Link href={ROUTES.AUTH.LOGIN}>
                <Button variant="primary" size="sm" className="w-full text-xs font-bold">
                  Continue to Terminal
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#CBD5E1]">Mobile Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#111827] border border-[#2A3445] rounded-xl px-3.5 py-2 text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#CBD5E1]">SMS Verification Token</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit SMS code"
                className="w-full bg-[#111827] border border-[#2A3445] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#64748B] focus:outline-hidden focus:border-[#FBBF24] font-mono tracking-widest text-center text-sm"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={isLoading || !code}
              className="font-bold shadow-xl shadow-amber-400/20 gap-2 text-xs"
            >
              {isLoading ? (
                <span>Validating SMS Token...</span>
              ) : (
                <>
                  <span>Authenticate Phone Number</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="pt-2 text-center border-t border-[#1E293B] justify-center">
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="text-xs text-[#94A3B8] hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Return to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
