"use client";

import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/utils";

export interface IconButtonProps extends Omit<ButtonProps, "iconLeft" | "iconRight" | "fullWidth"> {
  icon: React.ReactNode;
  "aria-label": string;
}

/**
 * Enterprise Icon Button
 * Compact, square or rounded icon button with strict accessibility aria-label.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, "aria-label": ariaLabel, size = "md", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        square
        size={size}
        aria-label={ariaLabel}
        title={ariaLabel}
        className={cn("shrink-0", className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";

