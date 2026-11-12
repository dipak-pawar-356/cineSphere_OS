/**
 * ==============================================================================
 * CineSphere OS — Theatre Branding & Media Validation Rules (Phase 3 – Part 2)
 * ==============================================================================
 * Server-side Zod validation & Digital Asset Management (DAM) policy matrix:
 * MIME types, byte ceilings, dimension minimums, aspect ratio checks,
 * corrupted signature detection placeholder & duplicate checksum hooks.
 * Never trusts client-side file metadata without server verification.
 * ==============================================================================
 */

import { z } from "zod";
import { TheatreMediaType } from "@/types/theatre-media.types";

export interface MediaTypePolicyRule {
  allowedMimeTypes: readonly string[];
  maxSizeBytes: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  recommendedAspectRatio: string;
  minAspectRatio: number;
  maxAspectRatio: number;
  singleActiveOnly: boolean;
  description: string;
}

export const MEDIA_TYPE_POLICIES: Record<TheatreMediaType, MediaTypePolicyRule> = {
  LOGO: {
    allowedMimeTypes: ["image/png", "image/webp", "image/svg+xml", "image/jpeg", "image/avif"],
    maxSizeBytes: 2 * 1024 * 1024, // 2 MB
    minWidth: 120,
    minHeight: 120,
    maxWidth: 4096,
    maxHeight: 4096,
    recommendedAspectRatio: "1:1 or 4:1",
    minAspectRatio: 0.5,
    maxAspectRatio: 4.5,
    singleActiveOnly: true,
    description: "Primary cinema circuit / multiplex emblem (single active logo enforced).",
  },
  BANNER: {
    allowedMimeTypes: ["image/webp", "image/jpeg", "image/png", "image/avif"],
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    minWidth: 1000,
    minHeight: 300,
    maxWidth: 7680,
    maxHeight: 4320,
    recommendedAspectRatio: "16:9 / 21:9",
    minAspectRatio: 1.5,
    maxAspectRatio: 4.0,
    singleActiveOnly: true,
    description: "Wide multiplex exhibition banner (single active banner enforced).",
  },
  COVER_IMAGE: {
    allowedMimeTypes: ["image/webp", "image/jpeg", "image/png", "image/avif"],
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    minWidth: 800,
    minHeight: 400,
    maxWidth: 7680,
    maxHeight: 4320,
    recommendedAspectRatio: "16:9",
    minAspectRatio: 1.3,
    maxAspectRatio: 3.0,
    singleActiveOnly: true,
    description: "Editorial cover photograph for complex profile cards (single active).",
  },
  HERO_IMAGE: {
    allowedMimeTypes: ["image/webp", "image/jpeg", "image/png", "image/avif"],
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    minWidth: 1200,
    minHeight: 500,
    maxWidth: 7680,
    maxHeight: 4320,
    recommendedAspectRatio: "16:9 / 2.39:1",
    minAspectRatio: 1.4,
    maxAspectRatio: 3.5,
    singleActiveOnly: true,
    description: "High-resolution public theatre hero showcase (single active hero).",
  },
  THUMBNAIL: {
    allowedMimeTypes: ["image/webp", "image/jpeg", "image/png", "image/avif"],
    maxSizeBytes: 3 * 1024 * 1024, // 3 MB
    minWidth: 320,
    minHeight: 200,
    maxWidth: 4096,
    maxHeight: 4096,
    recommendedAspectRatio: "16:10 or 4:3",
    minAspectRatio: 0.75,
    maxAspectRatio: 2.2,
    singleActiveOnly: true,
    description: "Compact thumbnail displayed across listings & search cards (single active).",
  },
  GALLERY_IMAGE: {
    allowedMimeTypes: ["image/webp", "image/jpeg", "image/png", "image/avif"],
    maxSizeBytes: 8 * 1024 * 1024, // 8 MB
    minWidth: 600,
    minHeight: 400,
    maxWidth: 7680,
    maxHeight: 4320,
    recommendedAspectRatio: "16:9 or 3:2",
    minAspectRatio: 0.7,
    maxAspectRatio: 3.0,
    singleActiveOnly: false,
    description: "Ordered unlimited venue, auditorium, lounge, and concession photographs.",
  },
  FUTURE_VIDEO_PLACEHOLDER: {
    allowedMimeTypes: ["image/webp", "image/jpeg", "image/png"], // Thumbnail poster stub only
    maxSizeBytes: 5 * 1024 * 1024,
    minWidth: 320,
    minHeight: 180,
    maxWidth: 4096,
    maxHeight: 4096,
    recommendedAspectRatio: "16:9",
    minAspectRatio: 1.2,
    maxAspectRatio: 2.5,
    singleActiveOnly: false,
    description: "Architecture placeholder for future Promotional Videos, Walkthroughs & 360 Video.",
  },
  FUTURE_PANORAMA_PLACEHOLDER: {
    allowedMimeTypes: ["image/webp", "image/jpeg", "image/png"],
    maxSizeBytes: 12 * 1024 * 1024,
    minWidth: 1000,
    minHeight: 500,
    maxWidth: 8192,
    maxHeight: 4096,
    recommendedAspectRatio: "2:1 Equirectangular",
    minAspectRatio: 1.5,
    maxAspectRatio: 2.5,
    singleActiveOnly: false,
    description: "Architecture placeholder for future 360° auditorium panorama virtual tours.",
  },
};

export const TheatreMediaTypeSchema = z.enum([
  "LOGO",
  "BANNER",
  "COVER_IMAGE",
  "HERO_IMAGE",
  "THUMBNAIL",
  "GALLERY_IMAGE",
  "FUTURE_VIDEO_PLACEHOLDER",
  "FUTURE_PANORAMA_PLACEHOLDER",
]);

export const TheatreMediaStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "HIDDEN",
  "ARCHIVED",
  "DELETED",
]);

export const FutureVideoSubtypeSchema = z.enum([
  "PROMOTIONAL_VIDEO",
  "THEATRE_WALKTHROUGH",
  "HALL_PREVIEW",
  "VIDEO_360",
  "VIRTUAL_TOUR",
]);

export const CropPlaceholderSchema = z
  .object({
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(["px", "%"]),
    aspectLock: z.string().max(20).optional(),
  })
  .optional();

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export const UploadTheatreMediaSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  mediaType: TheatreMediaTypeSchema,
  futureVideoSubtype: FutureVideoSubtypeSchema.optional(),
  title: z.string().min(2, "Media title must be at least 2 characters").max(200),
  url: z.string().min(5, "Valid media URL or placeholder path is required").max(2000),
  status: z.enum(["DRAFT", "ACTIVE", "HIDDEN"]).optional(),
  altText: z.string().min(3, "Accessible alt text (min 3 chars) is required").max(300),
  caption: z.string().max(1000).optional(),
  mimeType: z.string().min(3, "MIME type is required").max(100),
  fileSizeBytes: z.number().int().positive("File size must be greater than 0 bytes"),
  width: z.number().int().positive("Image width must be greater than 0px"),
  height: z.number().int().positive("Image height must be greater than 0px"),
  uploadSource: z.enum(["FILE_UPLOAD_PLACEHOLDER", "URL_REFERENCE", "BRAND_IMPORT"]).optional(),
  dominantColor: z.string().regex(HEX_COLOR_REGEX, "Dominant color must be 6-digit hex").optional(),
  displayPriority: z.number().int().min(1).max(9999).optional(),
  cropPlaceholder: CropPlaceholderSchema,
  rawSignatureCheck: z.string().max(256).optional(),
});

export const ReplaceTheatreMediaSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  mediaId: z.string().min(1, "Target Media ID is required"),
  expectedVersion: z.number().int().positive().optional(),
  title: z.string().min(2).max(200).optional(),
  url: z.string().min(5, "Replacement media URL is required").max(2000),
  altText: z.string().min(3, "Accessible alt text is required").max(300),
  caption: z.string().max(1000).optional(),
  mimeType: z.string().min(3).max(100),
  fileSizeBytes: z.number().int().positive("File size must be positive"),
  width: z.number().int().positive("Width must be positive"),
  height: z.number().int().positive("Height must be positive"),
  dominantColor: z.string().regex(HEX_COLOR_REGEX, "Dominant color must be 6-digit hex").optional(),
  changeReason: z.string().max(500).optional(),
  cropPlaceholder: CropPlaceholderSchema,
  rawSignatureCheck: z.string().max(256).optional(),
});

export const UpdateMediaMetadataSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  mediaId: z.string().min(1, "Media ID is required"),
  title: z.string().min(2).max(200).optional(),
  altText: z.string().min(3).max(300).optional(),
  caption: z.string().max(1000).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "HIDDEN", "ARCHIVED"]).optional(),
  displayPriority: z.number().int().min(1).max(9999).optional(),
  dominantColor: z.string().regex(HEX_COLOR_REGEX).optional(),
  cropPlaceholder: CropPlaceholderSchema,
});

export const ReorderGallerySchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  orderedMediaIds: z.array(z.string().min(1)).min(1, "Ordered gallery IDs cannot be empty"),
  mode: z.enum(["DRAG_DROP", "MANUAL", "AUTO_NORMALIZE"]).optional(),
});

export const DeleteMediaSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  mediaId: z.string().min(1, "Media ID is required"),
  reason: z.string().max(500).optional(),
});

export const RestoreMediaVersionSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  mediaId: z.string().min(1, "Media ID is required"),
  versionNumber: z.number().int().positive("Version number must be positive"),
  reason: z.string().max(500).optional(),
});

export const RetrieveTheatreMediaSchema = z.object({
  theatreId: z.string().optional(),
  query: z.string().max(120).optional(),
  mediaType: z
    .enum([
      "ALL",
      "LOGO",
      "BANNER",
      "COVER_IMAGE",
      "HERO_IMAGE",
      "THUMBNAIL",
      "GALLERY_IMAGE",
      "FUTURE_VIDEO_PLACEHOLDER",
      "FUTURE_PANORAMA_PLACEHOLDER",
    ])
    .optional(),
  status: z.enum(["ALL", "DRAFT", "ACTIVE", "HIDDEN", "ARCHIVED", "DELETED"]).optional(),
  includeDeleted: z.boolean().optional(),
  uploadedFrom: z.string().optional(),
  uploadedTo: z.string().optional(),
  updatedFrom: z.string().optional(),
  updatedTo: z.string().optional(),
  sortBy: z.enum(["displayOrder", "createdAt", "updatedAt", "title", "fileSizeBytes"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
});

