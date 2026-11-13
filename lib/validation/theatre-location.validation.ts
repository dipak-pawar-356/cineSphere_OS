/**
 * ==============================================================================
 * CineSphere OS — Theatre Address & Location Validation Rules (Phase 3 – Part 4)
 * ==============================================================================
 * Strict server-side Zod validation & geographic business rule guards for theatre
 * addresses, coordinates, navigation links, and verification governance.
 * ==============================================================================
 */

import { z } from "zod";
import {
  TheatreCoordinateSource,
  TheatreLocationStatus,
  TheatreLocationVerificationStatus,
} from "@/types/theatre-location.types";

export const TheatreLocationStatusSchema = z.enum(["DRAFT", "VERIFIED", "PUBLISHED", "ARCHIVED"]);

export const TheatreLocationVerificationStatusSchema = z.enum([
  "UNVERIFIED",
  "PENDING_REVIEW",
  "VERIFIED",
  "REJECTED",
]);

export const TheatreCoordinateSourceSchema = z.enum([
  "MANUAL",
  "GEOCODED",
  "GPS",
  "SYSTEM",
  "MAP_PIN",
]);

export function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim());
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      Boolean(parsed.hostname) &&
      parsed.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

export function isValidGoogleMapsUrl(value: string): boolean {
  if (!isValidHttpUrl(value)) return false;
  try {
    const parsed = new URL(value.trim());
    const host = parsed.hostname.toLowerCase();
    const isGoogleHost =
      host === "maps.google.com" ||
      host === "goo.gl" ||
      host.endsWith(".google.com") ||
      host === "maps.app.goo.gl";
    return isGoogleHost || parsed.pathname.includes("/maps");
  } catch {
    return false;
  }
}

export const HttpUrlSchema = z
  .string()
  .trim()
  .min(8, "URL must be at least 8 characters")
  .max(1000, "URL cannot exceed 1000 characters")
  .refine(isValidHttpUrl, {
    message: "Must be a valid http:// or https:// URL",
  });

export const GoogleMapsUrlSchema = z
  .string()
  .trim()
  .min(8, "Google Maps URL must be at least 8 characters")
  .max(1000, "URL cannot exceed 1000 characters")
  .refine(isValidHttpUrl, {
    message: "Must be a valid web URL (e.g. https://maps.google.com/...) with no dangerous protocols",
  });

export const PostalCodeSchema = z
  .string()
  .trim()
  .min(3, "Postal code must be at least 3 characters")
  .max(20, "Postal code cannot exceed 20 characters")
  .regex(/^[A-Za-z0-9\s-]{3,20}$/, "Postal code contains invalid characters");

export const LatitudeSchema = z
  .number({ invalid_type_error: "Latitude must be a valid number" })
  .min(-90, "Latitude must be between -90 and 90 degrees")
  .max(90, "Latitude must be between -90 and 90 degrees");

export const LongitudeSchema = z
  .number({ invalid_type_error: "Longitude must be a valid number" })
  .min(-180, "Longitude must be between -180 and 180 degrees")
  .max(180, "Longitude must be between -180 and 180 degrees");

// Address standard formatting helper
export function formatStandardAddress(params: {
  addressLine1: string;
  addressLine2?: string | null;
  area?: string | null;
  city: string;
  district?: string | null;
  state: string;
  country: string;
  postalCode: string;
  landmark?: string | null;
}): string {
  const parts: string[] = [];
  if (params.addressLine1) parts.push(params.addressLine1.trim());
  if (params.addressLine2) parts.push(params.addressLine2.trim());
  if (params.area) parts.push(params.area.trim());
  if (params.landmark) parts.push(`Near ${params.landmark.trim()}`);
  if (params.city) {
    const cityState = `${params.city.trim()}, ${params.state.trim()} - ${params.postalCode.trim()}`;
    parts.push(cityState);
  }
  if (params.country) parts.push(params.country.trim());
  return parts.filter(Boolean).join(", ");
}

export function generateDisplayAddress(params: {
  area?: string | null;
  city: string;
  state: string;
  landmark?: string | null;
}): string {
  const segments: string[] = [];
  if (params.landmark) segments.push(params.landmark.trim());
  if (params.area) segments.push(params.area.trim());
  segments.push(params.city.trim());
  segments.push(params.state.trim());
  return segments.filter(Boolean).join(", ");
}

// 1. Create Location Schema
export const CreateTheatreLocationSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  locationName: z
    .string()
    .trim()
    .min(2, "Location name must be at least 2 characters")
    .max(150, "Location name cannot exceed 150 characters")
    .default("Main Complex"),
  isPrimary: z.boolean().default(true),
  addressLine1: z
    .string()
    .trim()
    .min(3, "Address line 1 must be at least 3 characters")
    .max(255, "Address line 1 cannot exceed 255 characters"),
  addressLine2: z.string().trim().max(255).optional(),
  area: z.string().trim().max(120).optional(),
  city: z
    .string()
    .trim()
    .min(2, "City name must be at least 2 characters")
    .max(100, "City name cannot exceed 100 characters"),
  district: z.string().trim().max(100).optional(),
  state: z
    .string()
    .trim()
    .min(2, "State name must be at least 2 characters")
    .max(100, "State name cannot exceed 100 characters"),
  country: z
    .string()
    .trim()
    .min(2, "Country name must be at least 2 characters")
    .max(100, "Country name cannot exceed 100 characters")
    .default("India"),
  postalCode: PostalCodeSchema,
  landmark: z.string().trim().max(200).optional(),
  locality: z.string().trim().max(120).optional(),
  neighbourhood: z.string().trim().max(120).optional(),
  googleMapsUrl: GoogleMapsUrlSchema.optional(),
  placeId: z.string().trim().max(120).optional(),
  navigationLink: HttpUrlSchema.optional(),
  latitude: LatitudeSchema.optional(),
  longitude: LongitudeSchema.optional(),
  coordinateSource: TheatreCoordinateSourceSchema.optional(),
});

// 2. Update Location Schema
export const UpdateTheatreLocationSchema = z.object({
  locationId: z.string().min(1, "Location ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  expectedVersion: z.number().int().positive().optional(),
  locationName: z.string().trim().min(2).max(150).optional(),
  isPrimary: z.boolean().optional(),
  addressLine1: z.string().trim().min(3).max(255).optional(),
  addressLine2: z.string().trim().max(255).optional(),
  area: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2).max(100).optional(),
  district: z.string().trim().max(100).optional(),
  state: z.string().trim().min(2).max(100).optional(),
  country: z.string().trim().min(2).max(100).optional(),
  postalCode: PostalCodeSchema.optional(),
  landmark: z.string().trim().max(200).optional(),
  locality: z.string().trim().max(120).optional(),
  neighbourhood: z.string().trim().max(120).optional(),
  googleMapsUrl: GoogleMapsUrlSchema.optional(),
  placeId: z.string().trim().max(120).optional(),
  mapEmbedUrl: HttpUrlSchema.optional(),
  mapShareLink: HttpUrlSchema.optional(),
  navigationLink: HttpUrlSchema.optional(),
  drivingDirectionsUrl: HttpUrlSchema.optional(),
  walkingDirectionsUrl: HttpUrlSchema.optional(),
  transitDirectionsUrl: HttpUrlSchema.optional(),
  rideBookingUrl: HttpUrlSchema.optional(),
  serviceRadiusKm: z.number().positive().max(200).optional(),
  servedPostalCodes: z.array(z.string().trim().min(3).max(20)).max(100).optional(),
});

// 3. Update Coordinates Schema
export const UpdateCoordinatesSchema = z.object({
  locationId: z.string().min(1, "Location ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
  coordinateSource: TheatreCoordinateSourceSchema.default("MANUAL"),
  accuracyMeters: z.number().nonnegative().max(10000).optional(),
  elevationMeters: z.number().min(-500).max(9000).optional(),
});

// 4. Verify Location Schema (Super Admin only)
export const VerifyLocationSchema = z.object({
  locationId: z.string().min(1, "Location ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  decision: z.enum(["VERIFY", "REJECT"]),
  notes: z.string().trim().max(1000).optional(),
  reason: z.string().trim().max(1000).optional(),
});

// 5. Status Transition Schema
export const LocationStatusTransitionSchema = z.object({
  locationId: z.string().min(1, "Location ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  targetStatus: TheatreLocationStatusSchema,
  reason: z.string().trim().max(500).optional(),
});

// 6. Validate Address Schema
export const ValidateAddressInputSchema = z.object({
  addressLine1: z.string().trim().min(3, "Address line 1 is required").max(255),
  addressLine2: z.string().trim().max(255).optional(),
  city: z.string().trim().min(2, "City is required").max(100),
  state: z.string().trim().min(2, "State is required").max(100),
  country: z.string().trim().min(2).max(100).default("India"),
  postalCode: PostalCodeSchema,
});

// 7. Retrieve / Search Schema
export const RetrieveTheatreLocationSchema = z.object({
  theatreId: z.string().optional(),
  query: z.string().trim().max(100).optional(),
  country: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  area: z.string().trim().max(120).optional(),
  postalCode: z.string().trim().max(20).optional(),
  landmark: z.string().trim().max(200).optional(),
  status: TheatreLocationStatusSchema.optional(),
  verificationStatus: TheatreLocationVerificationStatusSchema.optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});
