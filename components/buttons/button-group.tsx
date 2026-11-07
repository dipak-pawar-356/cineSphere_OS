import React from "react";
import { cn } from "@/utils";

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  attached?: boolean;
}

/**
 * Enterprise Button Group
 * Groups related buttons together with attached or detached borders.
 */
export function ButtonGroup({
  children,
  attached = true,
  className,
  ...props
}: ButtonGroupProps) {
  return (
    <div
      role="group"
      className={cn(
        "inline-flex items-center",
        attached
          ? "[&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg [&>button:not(:last-child)]:border-r-0"
          : "gap-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

