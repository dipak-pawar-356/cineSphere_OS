"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/utils";

export interface OtpInputProps {
  length?: number;
  value?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
  className?: string;
}

export function OtpInput({
  length = 6,
  value = "",
  onChange,
  disabled = false,
  className,
}: OtpInputProps) {
  const [internalVal, setInternalVal] = useState<string[]>(
    Array.from({ length }, (_, i) => value[i] || "")
  );
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const char = e.target.value.slice(-1);
    const updated = [...internalVal];
    updated[idx] = char;
    setInternalVal(updated);
    onChange?.(updated.join(""));

    if (char && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !internalVal[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  return (
    <div className={cn("flex items-center gap-2 sm:gap-3", className)}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputsRef.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={internalVal[idx] || ""}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          className="h-12 w-10 sm:w-12 text-center text-lg font-mono font-bold rounded-lg bg-[#111827] text-white border border-[#2A3445] focus:border-[#FBBF24] focus:ring-1 focus:ring-[#FBBF24]/50 outline-none transition-all disabled:opacity-40"
        />
      ))}
    </div>
  );
}
