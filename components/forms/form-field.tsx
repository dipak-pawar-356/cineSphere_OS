import React from "react";
import { cn } from "@/utils";

export interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5 text-left", className)}>
      <label className="block text-xs font-semibold text-[#F9FAFB]">
        {label}
        {required && <span className="text-amber-400 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-[#9CA3AF]">{hint}</p>}
      {error && <p className="text-[11px] text-red-400 font-medium">{error}</p>}
    </div>
  );
}
