"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { MailCheck, ArrowRight, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/auth/providers";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError(null);

    // Auto-advance focus to next digit
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || "";
      }
      setDigits(newDigits);
      if (pasted.length === 6) {
        inputRefs.current[5]?.focus();
      }
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push(user?.role === "THEATRE_ADMIN" ? "/theatre" : "/profile");
      }, 1200);
    }, 700);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(60);
    setDigits(["", "", "", "", "", ""]);
    setError(null);
  };

  return (
    <Card variant="elevated" className="border-[#2A3445] shadow-2xl bg-[#0B1220]/95 backdrop-blur-xl">
      <CardHeader className="text-center space-y-2 pb-4">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mb-1 shadow-md">
          <MailCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-black text-white tracking-tight">
          Verify Your Email
        </CardTitle>
        <CardDescription className="text-xs text-[#94A3B8]">
          Enter the 6-digit confirmation token dispatched to{" "}
          <strong className="text-white">{user?.email || "your email address"}</strong>.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isSuccess ? (
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Email Address Verified</h4>
              <p className="text-xs text-[#94A3B8]">
                Identity state confirmed. Redirecting to your cinema dashboard terminal...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* 6-Digit Array Input */}
            <div className="flex justify-center items-center gap-2" onPaste={handlePaste}>
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-12 text-center text-lg font-mono font-bold bg-[#111827] border border-[#2A3445] focus:border-[#FBBF24] focus:outline-hidden rounded-xl text-white transition-all"
                />
              ))}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={isLoading || digits.join("").length < 6}
              className="font-bold shadow-xl shadow-amber-400/20 gap-2 text-xs"
            >
              {isLoading ? (
                <span>Validating Cryptographic Token...</span>
              ) : (
                <>
                  <span>Verify Email Address</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            {/* Resend Cooldown */}
            <div className="text-center text-xs">
              {countdown > 0 ? (
                <span className="text-[#64748B]">
                  Resend token in <strong className="text-white font-mono">{countdown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-[#FBBF24] hover:underline font-bold inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3 w-3" /> Resend Verification Code
                </button>
              )}
            </div>
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
