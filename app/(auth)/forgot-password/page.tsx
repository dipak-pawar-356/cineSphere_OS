"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { KeyRound, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <Card variant="elevated" className="border-[#2A3445] shadow-2xl bg-[#0B1220]/95 backdrop-blur-xl">
      <CardHeader className="text-center space-y-2 pb-4">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mb-1 shadow-md">
          <KeyRound className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-black text-white tracking-tight">
          Reset Password
        </CardTitle>
        <CardDescription className="text-xs text-[#94A3B8]">
          Enter your registered email address to receive an encrypted reset link.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isSubmitted ? (
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Reset Link Dispatched</h4>
              <p className="text-xs text-[#94A3B8]">
                We have transmitted recovery instructions to <strong className="text-white">{email}</strong>.
              </p>
            </div>
            <div className="pt-2">
              <Link href={ROUTES.AUTH.RESET_PASSWORD}>
                <Button variant="primary" size="sm" className="w-full text-xs font-bold">
                  Enter Reset Code Directly
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#CBD5E1]">Account Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cinema-circuit.com"
                  className="w-full bg-[#111827] border border-[#2A3445] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#64748B] focus:outline-hidden focus:border-[#FBBF24] pl-9"
                  required
                />
                <Mail className="h-4 w-4 text-[#64748B] absolute left-3 top-3" />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={isLoading}
              className="font-bold shadow-xl shadow-amber-400/20 gap-2 text-xs"
            >
              {isLoading ? (
                <span>Dispatching Recovery Token...</span>
              ) : (
                <>
                  <span>Send Recovery Instructions</span>
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
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
