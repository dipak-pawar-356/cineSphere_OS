import React from "react";
import { Badge } from "@/components/ui/badge";
import type {
  AmenityStatus,
  AmenityAvailabilityMode,
  AmenityPriority,
  AmenityVisibility,
} from "@/types/theatre-amenity.types";

/**
 * ==============================================================================
 * CineSphere OS — Amenity Status & Priority Badges
 * ==============================================================================
 */

export function AmenityStatusBadge({ status }: { status: AmenityStatus }) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="success" size="sm" dot>
          Active
        </Badge>
      );
    case "INACTIVE":
      return (
        <Badge variant="outline" size="sm">
          Inactive
        </Badge>
      );
    case "DRAFT":
      return (
        <Badge variant="warning" size="sm">
          Draft
        </Badge>
      );
    case "ARCHIVED":
      return (
        <Badge variant="outline" size="sm" className="text-zinc-500 border-zinc-700">
          Archived
        </Badge>
      );
    default:
      return <Badge variant="outline" size="sm">{status}</Badge>;
  }
}

export function AmenityAvailabilityBadge({ availability }: { availability: AmenityAvailabilityMode }) {
  switch (availability) {
    case "AVAILABLE":
      return (
        <Badge variant="success" size="sm" dot>
          Available
        </Badge>
      );
    case "TEMPORARILY_UNAVAILABLE":
      return (
        <Badge variant="warning" size="sm" dot>
          Temporarily Unavailable
        </Badge>
      );
    case "SEASONAL":
      return (
        <Badge variant="primary" size="sm" dot>
          Seasonal
        </Badge>
      );
    case "UNDER_MAINTENANCE":
      return (
        <Badge variant="danger" size="sm" dot>
          Under Maintenance
        </Badge>
      );
    default:
      return <Badge variant="outline" size="sm">{availability}</Badge>;
  }
}

export function AmenityPriorityBadge({ priority }: { priority: AmenityPriority }) {
  switch (priority) {
    case "CRITICAL":
      return (
        <Badge variant="danger" size="sm">
          Critical
        </Badge>
      );
    case "FEATURED":
      return (
        <Badge variant="primary" size="sm">
          ★ Featured
        </Badge>
      );
    case "HIGH":
      return (
        <Badge variant="warning" size="sm">
          High
        </Badge>
      );
    case "MEDIUM":
      return (
        <Badge variant="outline" size="sm" className="text-sky-400 border-sky-800">
          Medium
        </Badge>
      );
    case "STANDARD":
      return (
        <Badge variant="outline" size="sm" className="text-zinc-400 border-zinc-700">
          Standard
        </Badge>
      );
    case "LOW":
      return (
        <Badge variant="outline" size="sm" className="text-zinc-500 border-zinc-800">
          Low
        </Badge>
      );
    default:
      return <Badge variant="outline" size="sm">{priority}</Badge>;
  }
}

export function AmenityVisibilityBadge({ visibility }: { visibility: AmenityVisibility }) {
  switch (visibility) {
    case "PUBLIC":
      return (
        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
          Public
        </span>
      );
    case "HIDDEN":
      return (
        <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full">
          Hidden
        </span>
      );
    case "INTERNAL":
      return (
        <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded-full">
          Internal Only
        </span>
      );
    default:
      return null;
  }
}
