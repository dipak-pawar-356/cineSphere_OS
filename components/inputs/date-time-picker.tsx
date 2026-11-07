"use client";

import React from "react";
import { Input, InputProps } from "@/components/ui/input";
import { Calendar, Clock } from "lucide-react";

export interface DatePickerProps extends Omit<InputProps, "type"> {
  mode?: "date" | "time" | "datetime-local";
}

/**
 * Enterprise Date & Time Input
 * Standardized calendar and time selectors with dark theme styling.
 */
export const DateTimePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ mode = "date", leftIcon, ...props }, ref) => {
    const defaultIcon =
      mode === "time" ? (
        <Clock className="h-3.5 w-3.5 text-[#FBBF24]" />
      ) : (
        <Calendar className="h-3.5 w-3.5 text-[#FBBF24]" />
      );

    return (
      <Input
        ref={ref}
        type={mode}
        leftIcon={leftIcon || defaultIcon}
        className="[color-scheme:dark]"
        {...props}
      />
    );
  }
);

DateTimePicker.displayName = "DateTimePicker";

