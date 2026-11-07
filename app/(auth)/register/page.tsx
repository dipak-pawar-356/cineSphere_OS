import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { UserPlus, ArrowRight } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Register Account | CineSphere OS",
};

export default function RegisterPage() {
  return (
    <Card variant="elevated" className="border-[#2A3445] shadow-2xl">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mb-1">
          <UserPlus className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold">Create CineSphere Account</CardTitle>
        <CardDescription>
          Join CineClub VIP or request enterprise cinema exhibitor credentials.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Input label="Full Name" placeholder="David Miller" disabled />
        <Input type="email" label="Email Address" placeholder="name@example.com" disabled />
        <Input type="password" label="Create Password" placeholder="••••••••••••" disabled />

        <div className="pt-2">
          <Button variant="primary" size="md" fullWidth disabled className="gap-2">
            <span>Create Account</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-3 rounded-xl bg-[#070B12]/60 border border-[#2A3445] text-center text-xs text-[#94A3B8]">
          <span className="text-[#FBBF24] font-semibold">Phase 1 Route Shell:</span> User registration and email verification dispatch activate in Phase 2.
        </div>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-[#2A3445]/60 text-xs text-[#94A3B8]">
        Already have an account?{" "}
        <Link href={ROUTES.AUTH.LOGIN} className="text-[#FBBF24] font-semibold ml-1 hover:underline">
          Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
