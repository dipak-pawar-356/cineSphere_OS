import React from "react";
import { cn } from "@/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  errorMessage?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, errorMessage, disabled, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        <textarea
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full rounded-lg bg-[#111827] text-[#F9FAFB] placeholder:text-[#94A3B8]/60 p-3 text-xs sm:text-sm border transition-all duration-150 outline-none resize-y min-h-[90px]",
            error
              ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]/40"
              : "border-[#2A3445] focus:border-[#FBBF24]/60 focus:ring-1 focus:ring-[#FBBF24]/30",
            disabled && "opacity-40 cursor-not-allowed bg-[#0B1220]",
            className
          )}
          {...props}
        />
        {error && errorMessage && (
          <p className="text-[11px] text-[#EF4444] font-medium pl-1">{errorMessage}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
