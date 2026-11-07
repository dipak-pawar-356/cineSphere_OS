"use client";

import React from "react";
import { Input, InputProps } from "@/components/ui/input";
import { Phone } from "lucide-react";

export interface PhoneInputProps extends InputProps {
  countryCode?: string;
}

/**
 * Enterprise International Phone Input
 * Formats phone numbers with country dialing prefix code.
 */
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ countryCode = "+91", leftIcon, placeholder = "98201 48291", ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="tel"
        placeholder={placeholder}
        leftIcon={
          leftIcon || (
            <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
              <Phone className="h-3 w-3 text-[#FBBF24]" />
              <span className="font-mono text-[11px] text-[#CBD5E1] font-semibold">{countryCode}</span>
            </div>
          )
        }
        {...props}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";

