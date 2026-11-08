"use client";

import React, { Suspense } from "react";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";
import { ModalProvider } from "./modal-provider";
import { SmoothScrollProvider } from "@/components/motion/lenis-provider";
import { ClerkSafeProvider, AuthProvider, TenantProvider } from "@/auth/providers";

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkSafeProvider>
      <AuthProvider>
        <TenantProvider>
          <ThemeProvider>
            <ToastProvider>
              <ModalProvider>
                <SmoothScrollProvider>
                  <Suspense fallback={null}>{children}</Suspense>
                </SmoothScrollProvider>
              </ModalProvider>
            </ToastProvider>
          </ThemeProvider>
        </TenantProvider>
      </AuthProvider>
    </ClerkSafeProvider>
  );
}

