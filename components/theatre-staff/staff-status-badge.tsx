"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import type { StaffEmploymentStatus, TheatreRoleStatus } from "@/types/theatre-staff.types";

interface StaffStatusBadgeProps {
  status: StaffEmploymentStatus;
  size?: "sm" | "md" | "lg";
}

export function StaffStatusBadge({ status, size = "sm" }: StaffStatusBadgeProps) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="success" size={size}>
          Active Crew
        </Badge>
      );
    case "INVITED":
      return (
        <Badge variant="warning" size={size}>
          Invited
        </Badge>
      );
    case "INACTIVE":
      return (
        <Badge variant="secondary" size={size}>
          Inactive
        </Badge>
      );
    case "SUSPENDED":
      return (
        <Badge variant="danger" size={size}>
          Suspended
        </Badge>
      );
    case "RESIGNED":
      return (
        <Badge variant="outline" size={size}>
          Resigned
        </Badge>
      );
    case "ARCHIVED":
      return (
        <Badge variant="secondary" size={size}>
          Archived
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" size={size}>
          {status}
        </Badge>
      );
  }
}

interface RoleStatusBadgeProps {
  status: TheatreRoleStatus;
  isCustom?: boolean;
  size?: "sm" | "md";
}

export function RoleStatusBadge({ status, isCustom, size = "sm" }: RoleStatusBadgeProps) {
  return (
    <div className="flex items-center gap-1.5">
      {status === "ACTIVE" ? (
        <Badge variant="success" size={size}>
          Active
        </Badge>
      ) : (
        <Badge variant="secondary" size={size}>
          {status}
        </Badge>
      )}
      {isCustom ? (
        <Badge variant="outline" size={size} className="border-indigo-500/40 text-indigo-400">
          Custom Role
        </Badge>
      ) : (
        <Badge variant="outline" size={size} className="border-emerald-500/40 text-emerald-400">
          Template
        </Badge>
      )}
    </div>
  );
}
