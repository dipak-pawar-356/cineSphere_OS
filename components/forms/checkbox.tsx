"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, checked, disabled, onChange, ...props }, ref) => {
    return (
      <label
        className={cn(
          "inline-flex items-start gap-3 select-none cursor-pointer group",
          disabled && "opacity-40 cursor-not-allowed pointer-events-none",
          className
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-4.5 w-4.5 rounded border transition-all duration-150 flex items-center justify-center",
              "bg-[#111827] border-[#2A3445] group-hover:border-[#FBBF24]/60",
              "peer-checked:bg-[#FBBF24] peer-checked:border-[#FBBF24]",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-[#FBBF24]/50"
            )}
          >
            <Check
              className={cn(
                "h-3 w-3 text-[#070B12] stroke-[3] transition-opacity",
                checked ? "opacity-100" : "opacity-0"
              )}
            />
          </div>
        </div>

        {(label || description) && (
          <div className="text-left text-xs">
            {label && <div className="font-medium text-[#F9FAFB]">{label}</div>}
            {description && (
              <p className="text-[#94A3B8] text-[11px] mt-0.5">{description}</p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
