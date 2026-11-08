"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  UserPlus,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  User,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import { validatePassword } from "@/auth/services";
import { useAuth } from "@/auth/providers";
import { UserRole } from "@/auth/types";

export default function RegisterPage() {
  const router = useRouter();
  const { signInWithRole } = useAuth();

  const [role, setRole] = useState<UserRole>("CUSTOMER");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [theatreName, setTheatreName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordValidation = useMemo(() => {
    return validatePassword(password);
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName || !lastName || !email || !password) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (!passwordValidation.isValid) {
      setErrorMessage(passwordValidation.errors[0] || "Password does not meet security requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!acceptTerms) {
      setErrorMessage("Please accept the terms of service and privacy policy to continue.");
      return;
    }

    setIsLoading(true);

    // Simulate account provisioning
    setTimeout(() => {
      setIsLoading(false);
      // Fast sign in with created role
      signInWithRole(role);
      router.push(role === "THEATRE_ADMIN" ? "/theatre" : "/verify-email");
    }, 700);
  };

  return (
    <div className="space-y-6">
      <Card variant="elevated" className="border-[#2A3445] shadow-2xl bg-[#0B1220]/95 backdrop-blur-xl">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mb-1 shadow-md">
            <UserPlus className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-black text-white tracking-tight">
            Join CineSphere OS
          </CardTitle>
          <CardDescription className="text-xs text-[#94A3B8]">
            Create a patron account for ticket bookings or apply for an enterprise theatre admin tenant.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Role Selection Chips */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#111827] rounded-xl border border-[#2A3445]">
            <button
              type="button"
              onClick={() => setRole("CUSTOMER")}
              className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === "CUSTOMER"
                  ? "bg-[#FBBF24] text-black shadow-sm"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Movie Patron</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("THEATRE_ADMIN")}
              className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === "THEATRE_ADMIN"
                  ? "bg-[#38BDF8] text-black shadow-sm"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Theatre Operator</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#CBD5E1]">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Aarav"
                  className="w-full bg-[#111827] border border-[#2A3445] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#64748B] focus:outline-hidden focus:border-[#FBBF24]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#CBD5E1]">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Mehta"
                  className="w-full bg-[#111827] border border-[#2A3445] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#64748B] focus:outline-hidden focus:border-[#FBBF24]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#CBD5E1]">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav.mehta@example.com"
                  className="w-full bg-[#111827] border border-[#2A3445] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#64748B] focus:outline-hidden focus:border-[#FBBF24] pl-9"
                  required
                />
                <Mail className="h-3.5 w-3.5 text-[#64748B] absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Theatre Partner Fields if Operator selected */}
            {role === "THEATRE_ADMIN" && (
              <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] space-y-2.5">
                <div className="text-[11px] font-bold text-[#38BDF8] flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Theatre Circuit Details</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-[#64748B]">Theatre Complex Name</label>
                  <input
                    type="text"
                    value={theatreName}
                    onChange={(e) => setTheatreName(e.target.value)}
                    placeholder="e.g. CinePride Cinemas, Surat"
                    className="w-full bg-[#070B12] border border-[#2A3445] rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-[#64748B]">GST Number (Placeholder)</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="24AAACC1206M1ZT"
                    className="w-full bg-[#070B12] border border-[#2A3445] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#CBD5E1]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {password.length > 0 && (
                <div className="pt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#64748B]">Password Strength</span>
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

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#CBD5E1]">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className="w-full bg-[#111827] border border-[#2A3445] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#64748B] focus:outline-hidden focus:border-[#FBBF24]"
                required
              />
            </div>

            <div className="flex items-start gap-2 pt-1 text-xs text-[#94A3B8]">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="rounded border-[#2A3445] bg-[#111827] text-[#FBBF24] focus:ring-[#FBBF24] mt-0.5"
              />
              <label htmlFor="terms" className="text-[11px] leading-tight cursor-pointer">
                I agree to the{" "}
                <Link href={ROUTES.PUBLIC.TERMS_AND_CONDITIONS} className="text-[#FBBF24] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href={ROUTES.PUBLIC.PRIVACY_POLICY} className="text-[#FBBF24] hover:underline">
                  Privacy Policy
                </Link>
                .
              </label>
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
                <span>Provisioning Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2 text-center border-t border-[#1E293B]">
          <div className="text-xs text-[#94A3B8]">
            Already have an account?{" "}
            <Link href={ROUTES.AUTH.LOGIN} className="text-[#FBBF24] font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
