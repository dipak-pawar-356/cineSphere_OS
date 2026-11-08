"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  UserCheck,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/auth/providers";
import { UserRole } from "@/auth/types";
import { MOCK_USERS } from "@/auth/services";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirectUrl");

  const { signInWithRole, isAuthenticated, user, signOut } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both corporate email and password.");
      return;
    }

    setIsLoading(true);

    // Simulate authentication verification
    setTimeout(() => {
      setIsLoading(false);
      // Infer role from email or default to customer
      if (email.includes("superadmin")) {
        signInWithRole("SUPER_ADMIN");
      } else if (email.includes("mumbai")) {
        signInWithRole("THEATRE_ADMIN", "th-mum-001");
      } else if (email.includes("admin")) {
        signInWithRole("THEATRE_ADMIN", "th-pun-001");
      } else if (email.includes("mgr")) {
        signInWithRole("HALL_MANAGER");
      } else if (email.includes("staff")) {
        signInWithRole("STAFF");
      } else {
        signInWithRole("CUSTOMER");
      }

      if (redirectUrl) {
        router.push(redirectUrl);
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Active Session Notice if already logged in */}
      {isAuthenticated && user && (
        <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <span>Currently signed in as <strong>{user.displayName}</strong></span>
              <span className="ml-2 font-mono text-[10px] bg-amber-400/20 px-1.5 py-0.5 rounded font-bold">
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="text-[11px] font-bold text-amber-400 hover:underline"
          >
            Sign Out
          </button>
        </div>
      )}

      <Card variant="elevated" className="border-[#2A3445] shadow-2xl bg-[#0B1220]/95 backdrop-blur-xl">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mb-1 shadow-md">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-black text-white tracking-tight">
            Sign In to CineSphere
          </CardTitle>
          <CardDescription className="text-xs text-[#94A3B8]">
            Access your patron bookings or enterprise cinema administration terminal.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#CBD5E1]">
                Corporate Email or Patron ID
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cinema-circuit.com"
                  className="w-full bg-[#111827] border border-[#2A3445] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#64748B] focus:outline-hidden focus:border-[#FBBF24] transition-all pl-9"
                  required
                />
                <Mail className="h-4 w-4 text-[#64748B] absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-[#CBD5E1]">Password</label>
                <Link
                  href={ROUTES.AUTH.FORGOT_PASSWORD}
                  className="text-[#FBBF24] hover:underline text-[11px]"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#111827] border border-[#2A3445] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#64748B] focus:outline-hidden focus:border-[#FBBF24] transition-all pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#64748B] hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[#94A3B8]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#2A3445] bg-[#111827] text-[#FBBF24] focus:ring-[#FBBF24]"
                />
                <span>Remember this terminal</span>
              </label>
              <span className="text-[10px] text-[#64748B]">256-Bit Encrypted</span>
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
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* 2. FAST ENTERPRISE ROLE SWITCHER (DEVELOPER & ARCHITECT TEST SUITE) */}
          <div className="pt-2 border-t border-[#1E293B] space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#FBBF24] font-mono font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Instant Role Simulator
              </span>
              <span className="text-[10px] text-[#64748B]">1-Click Verification</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => signInWithRole("SUPER_ADMIN")}
                className="p-2 rounded-xl bg-[#111827] border border-[#2A3445] hover:border-amber-400/60 text-left transition-all"
              >
                <div className="text-[11px] font-bold text-white flex items-center justify-between">
                  <span>Super Admin</span>
                  <span className="text-[9px] font-mono text-amber-400">HQ</span>
                </div>
                <div className="text-[9px] text-[#64748B] truncate">Platform Governance</div>
              </button>

              <button
                type="button"
                onClick={() => signInWithRole("THEATRE_ADMIN", "th-pun-001")}
                className="p-2 rounded-xl bg-[#111827] border border-[#2A3445] hover:border-[#38BDF8]/60 text-left transition-all"
              >
                <div className="text-[11px] font-bold text-white flex items-center justify-between">
                  <span>Theatre Admin</span>
                  <span className="text-[9px] font-mono text-[#38BDF8]">Pune</span>
                </div>
                <div className="text-[9px] text-[#64748B] truncate">Galaxy Multiplex</div>
              </button>

              <button
                type="button"
                onClick={() => signInWithRole("THEATRE_ADMIN", "th-mum-001")}
                className="p-2 rounded-xl bg-[#111827] border border-[#2A3445] hover:border-[#38BDF8]/60 text-left transition-all"
              >
                <div className="text-[11px] font-bold text-white flex items-center justify-between">
                  <span>Theatre Admin</span>
                  <span className="text-[9px] font-mono text-[#38BDF8]">Mumbai</span>
                </div>
                <div className="text-[9px] text-[#64748B] truncate">Royale Palladium</div>
              </button>

              <button
                type="button"
                onClick={() => signInWithRole("HALL_MANAGER")}
                className="p-2 rounded-xl bg-[#111827] border border-[#2A3445] hover:border-purple-400/60 text-left transition-all"
              >
                <div className="text-[11px] font-bold text-white flex items-center justify-between">
                  <span>Hall Manager</span>
                  <span className="text-[9px] font-mono text-purple-400">Audio</span>
                </div>
                <div className="text-[9px] text-[#64748B] truncate">Auditorium Calibration</div>
              </button>

              <button
                type="button"
                onClick={() => signInWithRole("STAFF")}
                className="p-2 rounded-xl bg-[#111827] border border-[#2A3445] hover:border-emerald-400/60 text-left transition-all"
              >
                <div className="text-[11px] font-bold text-white flex items-center justify-between">
                  <span>Cinema Staff</span>
                  <span className="text-[9px] font-mono text-emerald-400">Gate</span>
                </div>
                <div className="text-[9px] text-[#64748B] truncate">QR Scanner & Turnstiles</div>
              </button>

              <button
                type="button"
                onClick={() => signInWithRole("CUSTOMER")}
                className="p-2 rounded-xl bg-[#111827] border border-[#2A3445] hover:border-indigo-400/60 text-left transition-all"
              >
                <div className="text-[11px] font-bold text-white flex items-center justify-between">
                  <span>Patron / Customer</span>
                  <span className="text-[9px] font-mono text-indigo-400">User</span>
                </div>
                <div className="text-[9px] text-[#64748B] truncate">Tickets & Profile</div>
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-3 text-center border-t border-[#1E293B]">
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
    </div>
  );
}
