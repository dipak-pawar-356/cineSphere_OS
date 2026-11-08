"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Lock, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { validatePassword } from "@/auth/services";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordValidation = useMemo(() => {
    return validatePassword(newPassword);
  }, [newPassword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token || !newPassword || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0] || "Password does not meet requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 700);
  };

  return (
    <Card variant="elevated" className="border-[#2A3445] shadow-2xl bg-[#0B1220]/95 backdrop-blur-xl">
      <CardHeader className="text-center space-y-2 pb-4">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mb-1 shadow-md">
          <Lock className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-black text-white tracking-tight">
          Set New Password
        </CardTitle>
        <CardDescription className="text-xs text-[#94A3B8]">
          Choose a hardened enterprise password for your terminal access.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isSuccess ? (
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Password Updated</h4>
              <p className="text-xs text-[#94A3B8]">
                Your password credentials have been successfully updated. All active sessions have been invalidated.
              </p>
            </div>
            <div className="pt-2">
              <Link href={ROUTES.AUTH.LOGIN}>
                <Button variant="primary" size="sm" className="w-full text-xs font-bold">
                  Proceed to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#CBD5E1]">
                Security Reset Token
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="6-digit recovery code or token"
                className="w-full bg-[#111827] border border-[#2A3445] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#64748B] focus:outline-hidden focus:border-[#FBBF24] font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#CBD5E1]">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters with numbers & symbols"
                  className="w-full bg-[#111827] border border-[#2A3445] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#64748B] focus:outline-hidden focus:border-[#FBBF24] pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#64748B] hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword.length > 0 && (
                <div className="pt-1 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#64748B]">Strength</span>
                    <span style={{ color: passwordValidation.color }} className="font-bold">
                      {passwordValidation.strength}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-[#111827] rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className="h-full flex-1 rounded-full transition-all"
                        style={{
                          backgroundColor:
                            step <= passwordValidation.score ? passwordValidation.color : "#1E293B",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#CBD5E1]">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-[#111827] border border-[#2A3445] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#64748B] focus:outline-hidden focus:border-[#FBBF24]"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={isLoading}
              className="font-bold shadow-xl shadow-amber-400/20 gap-2 text-xs mt-2"
            >
              {isLoading ? (
                <span>Re-keying Credentials...</span>
              ) : (
                <>
                  <span>Save New Password</span>
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
