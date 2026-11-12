"use client";

import React from "react";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import {
  TheatreMediaStatus,
  TheatreMediaType,
} from "@/types/theatre-media.types";

const MEDIA_STATUS_MAP: Record<
  TheatreMediaStatus,
  { label: string; variant: BadgeVariant }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  ACTIVE: { label: "Active", variant: "success" },
  HIDDEN: { label: "Hidden", variant: "warning" },
  ARCHIVED: { label: "Archived", variant: "outline" },
  DELETED: { label: "Deleted", variant: "danger" },
};

const MEDIA_TYPE_MAP: Record<
  TheatreMediaType,
  { label: string; variant: BadgeVariant }
> = {
  LOGO: { label: "Logo (1:1)", variant: "primary" },
  BANNER: { label: "Banner", variant: "info" },
  COVER_IMAGE: { label: "Cover Image", variant: "secondary" },
  HERO_IMAGE: { label: "Hero Showcase", variant: "primary" },
  THUMBNAIL: { label: "Thumbnail", variant: "outline" },
  GALLERY_IMAGE: { label: "Gallery", variant: "success" },
  FUTURE_VIDEO_PLACEHOLDER: { label: "Future Video", variant: "warning" },
  FUTURE_PANORAMA_PLACEHOLDER: { label: "360° Panorama Stub", variant: "warning" },
};

export function MediaStatusBadge({
  status,
  size = "sm",
}: {
  status: TheatreMediaStatus;
  size?: "sm" | "md" | "lg";
}) {
  const cfg = MEDIA_STATUS_MAP[status] || { label: status, variant: "outline" as const };
  return (
    <Badge variant={cfg.variant} size={size} aria-label={`Media status: ${cfg.label}`}>
      {cfg.label}
    </Badge>
  );
}

export function MediaTypeBadge({
  mediaType,
  size = "sm",
}: {
  mediaType: TheatreMediaType;
  size?: "sm" | "md" | "lg";
}) {
  const cfg = MEDIA_TYPE_MAP[mediaType] || { label: mediaType, variant: "outline" as const };
  return (
    <Badge variant={cfg.variant} size={size} aria-label={`Media type: ${cfg.label}`}>
      {cfg.label}
    </Badge>
  );
}

