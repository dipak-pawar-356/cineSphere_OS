"use client";

import React from "react";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import {
  TheatreLifecycleState,
  TheatreApprovalState,
} from "@/types/theatre-lifecycle.types";

const LIFECYCLE_BADGE_MAP: Record<
  TheatreLifecycleState,
  { label: string; variant: BadgeVariant }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  PENDING_APPROVAL: { label: "Pending Approval", variant: "warning" },
  APPROVED: { label: "Approved", variant: "primary" },
  ACTIVE: { label: "Active", variant: "success" },
  INACTIVE: { label: "Inactive", variant: "outline" },
  SUSPENDED: { label: "Suspended", variant: "danger" },
  ARCHIVED: { label: "Archived (Read-Only)", variant: "secondary" },
  SOFT_DELETED: { label: "Soft Deleted", variant: "danger" },
};

const APPROVAL_BADGE_MAP: Record<
  TheatreApprovalState,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: "Pending Review", variant: "warning" },
  APPROVED: { label: "KYC Approved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "danger" },
  REVISION_REQUESTED: { label: "Revision Requested", variant: "warning" },
};

export function LifecycleStatusBadge({
  status,
  size = "sm",
}: {
  status: TheatreLifecycleState;
  size?: "sm" | "md" | "lg";
}) {
  const cfg = LIFECYCLE_BADGE_MAP[status] || { label: status, variant: "outline" as const };
  return (
    <Badge variant={cfg.variant} size={size} aria-label={`Theatre lifecycle status: ${cfg.label}`}>
      {cfg.label}
    </Badge>
  );
}

export function ApprovalStatusBadge({
  status,
  size = "sm",
}: {
  status: TheatreApprovalState;
  size?: "sm" | "md" | "lg";
}) {
  const cfg = APPROVAL_BADGE_MAP[status] || { label: status, variant: "outline" as const };
  return (
    <Badge variant={cfg.variant} size={size} aria-label={`Approval status: ${cfg.label}`}>
      {cfg.label}
    </Badge>
  );
}
