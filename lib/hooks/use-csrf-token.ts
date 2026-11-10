"use client";

import { useState, useEffect, useCallback } from "react";
import { CSRF_CONFIG } from "@/lib/security/csrf-protection";

/**
 * Reusable Client CSRF Protection Hook
 * Obtains a cryptographic Double-Submit CSRF token from `/api/security/csrf`
 * and injects `x-csrf-token` into API requests cleanly without reading HttpOnly cookies.
 */
export function useCsrfToken(autoFetch = false) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/security/csrf", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { token?: string };
      const token = json.token || null;
      setCsrfToken(token);
      return token;
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch && !csrfToken) {
      void refreshToken();
    }
  }, [autoFetch, csrfToken, refreshToken]);

  const getCsrfHeaders = useCallback((): Record<string, string> => {
    if (!csrfToken) return {};
    return {
      [CSRF_CONFIG.HEADER_NAME]: csrfToken,
    };
  }, [csrfToken]);

  return {
    csrfToken,
    headerName: CSRF_CONFIG.HEADER_NAME,
    isLoading,
    refreshToken,
    getCsrfHeaders,
  };
}

