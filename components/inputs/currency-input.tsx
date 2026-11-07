"use client";

import React from "react";
import { Input, InputProps } from "@/components/ui/input";
import { DollarSign, IndianRupee } from "lucide-react";

export interface CurrencyInputProps extends Omit<InputProps, "type"> {
  currencyCode?: "INR" | "USD" | "EUR" | "GBP";
}

/**
 * Enterprise Currency Input
 * Pre-configured currency prefix icon with number formatting support.
 */
export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ currencyCode = "INR", leftIcon, placeholder = "0.00", ...props }, ref) => {
    const defaultIcon =
      currencyCode === "INR" ? (
        <span className="font-bold text-xs font-mono text-[#FBBF24]">₹</span>
      ) : (
        <DollarSign className="h-3.5 w-3.5 text-[#FBBF24]" />
      );

    return (
      <Input
        ref={ref}
        type="number"
        step="0.01"
        placeholder={placeholder}
        leftIcon={leftIcon || defaultIcon}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

