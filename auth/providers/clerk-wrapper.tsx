"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function ClerkSafeProvider({ children }: { children: React.ReactNode }) {
  if (publishableKey && publishableKey.startsWith("pk_")) {
    return (
      <ClerkProvider
        publishableKey={publishableKey}
        signInUrl="/login"
        signUpUrl="/register"
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/profile"
      >
        {children}
      </ClerkProvider>
    );
  }

  return <>{children}</>;
}

