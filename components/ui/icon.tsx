import React from "react";
import { cn } from "@/utils";
import { LucideIcon } from "lucide-react";

export type IconSize = "small" | "medium" | "large" | "extraLarge";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  size?: IconSize;
  className?: string;
  ariaLabel?: string;
}

const SIZE_MAP: Record<IconSize, string> = {
  small: "h-3.5 w-3.5",
  medium: "h-4.5 w-4.5",
  large: "h-6 w-6",
  extraLarge: "h-8 w-8",
};

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: IconComponent, size = "medium", className, ariaLabel, ...props }, ref) => {
    return (
      <span
        className={cn("inline-flex items-center justify-center shrink-0", className)}
        aria-hidden={!ariaLabel}
        aria-label={ariaLabel}
      >
        <IconComponent
          ref={ref as any}
          className={cn(SIZE_MAP[size])}
          {...(props as any)}
        />
      </span>
    );
  }
);

Icon.displayName = "Icon";
