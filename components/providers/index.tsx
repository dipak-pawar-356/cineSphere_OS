"use client";

import React, { Suspense } from "react";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";
import { ModalProvider } from "./modal-provider";

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ModalProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </ModalProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

