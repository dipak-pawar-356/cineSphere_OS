"use client";

import { useState, useCallback, useMemo } from "react";
import { sanitizeString, sanitizeSearchQuery, sanitizeEmail } from "@/lib/security/input-sanitizer";

export type SanitizerMode = "text" | "search" | "email";

/**
 * Reusable Client Security Hook
 * Sanitizes user input in real-time before submitting payloads to Server Actions.
 */
export function useSanitizedInput(initialValue = "", mode: SanitizerMode = "text") {
  const [rawValue, setRawValue] = useState<string>(initialValue);

  const sanitizedValue = useMemo(() => {
    switch (mode) {
      case "search":
        return sanitizeSearchQuery(rawValue);
      case "email":
        return sanitizeEmail(rawValue);
      case "text":
      default:
        return sanitizeString(rawValue);
    }
  }, [rawValue, mode]);

  const handleChange = useCallback((nextValue: string) => {
    setRawValue(nextValue);
  }, []);

  const reset = useCallback(() => {
    setRawValue(initialValue);
  }, [initialValue]);

  return {
    value: rawValue,
    sanitizedValue,
    setValue: handleChange,
    reset,
    hasBlockedCharacters: rawValue.trim() !== sanitizedValue,
  };
}

