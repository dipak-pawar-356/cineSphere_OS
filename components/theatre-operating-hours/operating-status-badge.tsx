"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import type {
  OperatingProfileStatus,
  SpecialOperatingEventType,
  MaintenanceWindowStatus,
} from "@/types/theatre-operating-hours.types";

interface StatusBadgeProps {
  status: OperatingProfileStatus;
  size?: "sm" | "md" | "lg";
}

export function OperatingStatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="success" size={size}>
          Active Operational
        </Badge>
      );
    case "INACTIVE":
      return (
        <Badge variant="secondary" size={size}>
          Inactive
        </Badge>
      );
    case "DRAFT":
      return (
        <Badge variant="warning" size={size}>
          Draft Hours
        </Badge>
      );
    case "SUSPENDED":
      return (
        <Badge variant="danger" size={size}>
          Suspended
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

export function MaintenanceStatusBadge({ status }: { status: MaintenanceWindowStatus }) {
  switch (status) {
    case "SCHEDULED":
      return <Badge variant="warning" size="sm">Scheduled</Badge>;
    case "IN_PROGRESS":
      return <Badge variant="primary" size="sm">In Progress</Badge>;
    case "COMPLETED":
      return <Badge variant="success" size="sm">Completed</Badge>;
    case "CANCELLED":
      return <Badge variant="secondary" size="sm">Cancelled</Badge>;
    default:
      return <Badge variant="outline" size="sm">{status}</Badge>;
  }
}

export function SpecialEventTypeBadge({ type }: { type: SpecialOperatingEventType }) {
  switch (type) {
    case "MOVIE_PREMIERE":
      return <Badge variant="primary" size="sm">Movie Premiere</Badge>;
    case "FESTIVAL":
      return <Badge variant="warning" size="sm">Festival Hours</Badge>;
    case "PRIVATE_SHOW":
      return <Badge variant="info" size="sm">Private Screening</Badge>;
    case "CORPORATE_BOOKING":
      return <Badge variant="secondary" size="sm">Corporate</Badge>;
    default:
      return <Badge variant="outline" size="sm">Custom Event</Badge>;
  }
}
