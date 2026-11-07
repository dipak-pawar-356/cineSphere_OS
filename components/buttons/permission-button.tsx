"use client";

import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { cn } from "@/utils";

export interface PermissionButtonProps extends ButtonProps {
  requiredRole?: string | string[];
  requiredPermission?: string | string[];
  userRole?: string;
  userPermissions?: string[];
  fallbackTooltip?: string;
}

/**
 * Enterprise Permission Button
 * Wraps action execution with role/permission gating.
 * Renders disabled state with lock icon if unauthorized.
 */
export const PermissionButton = React.forwardRef<HTMLButtonElement, PermissionButtonProps>(
  (
    {
      requiredRole,
      requiredPermission,
      userRole = "Super Admin",
      userPermissions = ["*"],
      fallbackTooltip = "Permission required to execute this action",
      children,
      disabled,
      className,
      iconLeft,
      ...props
    },
    ref
  ) => {
    const hasRole = !requiredRole
      ? true
      : Array.isArray(requiredRole)
      ? requiredRole.includes(userRole)
      : requiredRole === userRole || userRole === "Super Admin";

    const hasPermission = !requiredPermission
      ? true
      : userPermissions.includes("*") ||
        (Array.isArray(requiredPermission)
          ? requiredPermission.some((p) => userPermissions.includes(p))
          : userPermissions.includes(requiredPermission));

    const isPermitted = hasRole && hasPermission;

    return (
      <Button
        ref={ref}
        disabled={disabled || !isPermitted}
        title={!isPermitted ? fallbackTooltip : undefined}
        iconLeft={!isPermitted ? <Lock className="h-3.5 w-3.5 opacity-70" /> : iconLeft}
        className={cn(!isPermitted && "opacity-60 cursor-not-allowed", className)}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

PermissionButton.displayName = "PermissionButton";

