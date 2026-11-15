/**
 * ==============================================================================
 * CineSphere OS — Enterprise Extensions Validation Schemas (Phase 3 – Part 16)
 * ==============================================================================
 * Strict Zod validation schemas for feature flag resolution, level overrides,
 * extension module activation, IoT device registration, dynamic pricing, and
 * domain event bus dispatches.
 * ==============================================================================
 */

import { z } from "zod";

export const FeatureFlagScopeSchema = z.object({
  organizationId: z.string().optional(),
  theatreId: z.string().optional(),
  userId: z.string().optional(),
});

export const ResolveFeatureFlagInputSchema = z.object({
  flagKey: z.string().min(3, "Flag key must be at least 3 characters long"),
  scope: FeatureFlagScopeSchema.optional().default({}),
});

export const SetFeatureFlagOverrideInputSchema = z.object({
  flagKey: z.string().min(3, "Flag key must be at least 3 characters long"),
  level: z.enum(["PLATFORM", "ORGANIZATION", "THEATRE", "USER"]),
  targetId: z.string().min(1, "Target ID is required for scoped override"),
  value: z.union([z.boolean(), z.string(), z.number(), z.record(z.unknown())]),
});

export const ToggleExtensionModuleInputSchema = z.object({
  moduleId: z.enum([
    "ORG_MANAGEMENT",
    "FRANCHISE_MANAGEMENT",
    "CORPORATE_ACCOUNTS",
    "MEMBERSHIPS",
    "GIFT_CARDS",
    "LOYALTY_PROGRAMS",
    "DYNAMIC_PRICING_RULES",
    "AI_RECOMMENDATIONS",
    "IOT_DEVICE_PLATFORM",
    "DIGITAL_SIGNAGE",
    "SMART_KIOSKS",
    "FACIAL_RECOGNITION_STUB",
    "ENTERPRISE_APIS",
    "MULTI_REGION_DEPLOYMENT",
  ]),
  enable: z.boolean(),
});

export const DeviceTypeSchema = z.enum([
  "SEAT_SENSOR",
  "OCCUPANCY_SENSOR",
  "ENVIRONMENTAL_SENSOR",
  "PROJECTOR_MONITOR",
  "ENERGY_MONITOR",
  "LOBBY_DISPLAY",
  "SHOW_BOARD",
  "KIOSK",
  "TURNSTILE",
]);

export const RegisterDeviceInputSchema = z.object({
  deviceId: z.string().min(3, "Device ID must be at least 3 characters"),
  theatreId: z.string().min(3, "Theatre ID must be provided"),
  hallId: z.string().optional(),
  deviceType: DeviceTypeSchema,
  model: z.string().min(2, "Device model name is required"),
  ipAddress: z.string().ip().optional().or(z.literal("")),
  macAddress: z.string().optional(),
  status: z.enum(["ONLINE", "OFFLINE", "MAINTENANCE", "DEGRADED"]).default("ONLINE"),
  firmwareVersion: z.string().default("1.0.0"),
  meta: z.record(z.unknown()).optional(),
});

export const EvaluateDynamicPricingInputSchema = z.object({
  basePrice: z.number().min(0, "Base price cannot be negative"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  showTime: z.string().min(1, "Show time timestamp is required"),
  currentOccupancyPercent: z.number().min(0).max(100),
  format: z.string().default("2D"),
});

export const DispatchDomainEventInputSchema = z.object({
  eventType: z.enum([
    "BOOKING_CREATED",
    "BOOKING_CONFIRMED",
    "BOOKING_CANCELLED",
    "PAYMENT_COMPLETED",
    "PAYMENT_REFUNDED",
    "SHOW_CREATED",
    "SHOW_CANCELLED",
    "THEATRE_REGISTERED",
    "THEATRE_ACTIVATED",
    "CUSTOMER_REGISTERED",
    "TICKET_SCANNED",
    "KIOSK_SESSION_STARTED",
    "DEVICE_TELEMETRY_RECORDED",
    "PRICING_SURGE_TRIGGERED",
    "ENTERPRISE_MODULE_ENABLED",
  ]),
  data: z.record(z.unknown()).default({}),
  tenantId: z.string().optional(),
  organizationId: z.string().optional(),
  correlationId: z.string().optional(),
});
