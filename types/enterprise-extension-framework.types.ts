/**
 * ==============================================================================
 * CineSphere OS — Enterprise Extension Framework Types (Phase 3 – Part 16)
 * ==============================================================================
 * Enterprise architecture, domain models, extension points, feature flag hierarchy,
 * domain event bus, and SDK abstractions enabling future enterprise capabilities
 * to plug in modularly without modifying the platform core.
 * ==============================================================================
 */

import { UserRole } from "@/auth/types/role.types";
import { SecurityActorContext } from "@/types/security-hardening.types";

// ------------------------------------------------------------------------------
// 1. Enterprise Module Identity & Lifecycle Contracts
// ------------------------------------------------------------------------------

export type EnterprisePlatformKey =
  | "ORGANIZATION_PLATFORM"
  | "CUSTOMER_EXPERIENCE_PLATFORM"
  | "PRICING_PLATFORM"
  | "DEVICE_PLATFORM"
  | "AI_PLATFORM"
  | "INTEGRATION_PLATFORM"
  | "REGIONAL_PLATFORM"
  | "EXTENSION_SDK";

export type EnterpriseModuleId =
  | "ORG_MANAGEMENT"
  | "FRANCHISE_MANAGEMENT"
  | "CORPORATE_ACCOUNTS"
  | "MEMBERSHIPS"
  | "GIFT_CARDS"
  | "LOYALTY_PROGRAMS"
  | "DYNAMIC_PRICING_RULES"
  | "AI_RECOMMENDATIONS"
  | "IOT_DEVICE_PLATFORM"
  | "DIGITAL_SIGNAGE"
  | "SMART_KIOSKS"
  | "FACIAL_RECOGNITION_STUB"
  | "ENTERPRISE_APIS"
  | "MULTI_REGION_DEPLOYMENT";

export type ExtensionLifecycleState =
  | "UNINSTALLED"
  | "INSTALLED"
  | "ENABLED"
  | "DISABLED"
  | "ERROR";

export interface ExtensionRouteDefinition {
  path: string;
  label: string;
  iconName: string;
  requiredRoles: UserRole[];
  requiredPermissions: string[];
  portalScope: "SUPER_ADMIN" | "THEATRE_ADMIN" | "PUBLIC";
}

export interface ExtensionPermissionDefinition {
  permissionKey: string;
  label: string;
  description: string;
  category: string;
  defaultRoles: UserRole[];
}

export interface ExtensionBackgroundJobDefinition {
  jobName: string;
  cronSchedule: string;
  concurrencyLimit: number;
  timeoutSeconds: number;
  handlerStub: string;
}

export interface ExtensionLifecycleHooks {
  onInstall?: (context: SecurityActorContext) => Promise<boolean>;
  onEnable?: (context: SecurityActorContext) => Promise<boolean>;
  onDisable?: (context: SecurityActorContext) => Promise<boolean>;
  onUpgrade?: (fromVersion: string, toVersion: string, context: SecurityActorContext) => Promise<boolean>;
  registerRoutes?: () => ExtensionRouteDefinition[];
  registerPermissions?: () => ExtensionPermissionDefinition[];
  registerBackgroundJobs?: () => ExtensionBackgroundJobDefinition[];
}

export interface ExtensionManifest {
  moduleId: EnterpriseModuleId;
  platformKey: EnterprisePlatformKey;
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies: EnterpriseModuleId[];
  minPlatformCoreVersion: string;
  isExperimental?: boolean;
  configurationSchema?: Record<string, unknown>;
}

export interface EnterpriseModuleDefinition extends ExtensionLifecycleHooks {
  manifest: ExtensionManifest;
}

// ------------------------------------------------------------------------------
// 2. 4-Tier Feature Flag Hierarchy
// ------------------------------------------------------------------------------

export type FeatureFlagLevel = "PLATFORM" | "ORGANIZATION" | "THEATRE" | "USER";

export type FeatureFlagValueType = "BOOLEAN" | "STRING" | "NUMBER" | "JSON";

export interface FeatureFlagScope {
  organizationId?: string;
  theatreId?: string;
  userId?: string;
}

export interface EnterpriseFeatureFlag {
  flagKey: string;
  name: string;
  description: string;
  valueType: FeatureFlagValueType;
  defaultValue: boolean | string | number | Record<string, unknown>;
  platformEnabled: boolean;
  organizationOverrides: Record<string, boolean | string | number | Record<string, unknown>>;
  theatreOverrides: Record<string, boolean | string | number | Record<string, unknown>>;
  userOverrides: Record<string, boolean | string | number | Record<string, unknown>>;
  rolloutPercentage?: number; // 0 to 100 for canary/staged deployments
  moduleId?: EnterpriseModuleId;
}

export interface ResolvedFeatureFlag {
  flagKey: string;
  effectiveValue: boolean | string | number | Record<string, unknown>;
  resolvedLevel: FeatureFlagLevel | "DEFAULT";
  scope: FeatureFlagScope;
  isOverridden: boolean;
}

// ------------------------------------------------------------------------------
// 3. Domain Event Bus (Event-Driven Architecture)
// ------------------------------------------------------------------------------

export type EnterpriseDomainEventType =
  | "BOOKING_CREATED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "PAYMENT_COMPLETED"
  | "PAYMENT_REFUNDED"
  | "SHOW_CREATED"
  | "SHOW_CANCELLED"
  | "THEATRE_REGISTERED"
  | "THEATRE_ACTIVATED"
  | "CUSTOMER_REGISTERED"
  | "TICKET_SCANNED"
  | "KIOSK_SESSION_STARTED"
  | "DEVICE_TELEMETRY_RECORDED"
  | "PRICING_SURGE_TRIGGERED"
  | "ENTERPRISE_MODULE_ENABLED";

type DomainEventType = EnterpriseDomainEventType;

export interface DomainEventPayload<T = unknown> {
  eventId: string;
  eventType: EnterpriseDomainEventType;
  timestamp: string;
  correlationId: string;
  tenantId?: string; // theatreId
  organizationId?: string;
  actor?: SecurityActorContext;
  data: T;
  metadata?: Record<string, unknown>;
}

export type DomainEventHandler<T = unknown> = (
  event: DomainEventPayload<T>
) => Promise<void> | void;

export interface DomainEventSubscription {
  subscriptionId: string;
  subscriberModuleId: string;
  eventTypes: EnterpriseDomainEventType[];
  priority: number; // Higher number executed first
  filterPredicate?: (event: DomainEventPayload) => boolean;
  handler: DomainEventHandler;
}

// ------------------------------------------------------------------------------
// 4. Sub-Platform 1: Organization Management (Multi-Branch Chains & Franchises)
// ------------------------------------------------------------------------------

export type OrganizationTier = "STANDARD_CHAIN" | "ENTERPRISE_CIRCUIT" | "GLOBAL_NETWORK";

export interface Organization {
  id: string;
  legalName: string;
  brandName: string;
  code: string;
  tier: OrganizationTier;
  corporateHqAddress: {
    city: string;
    state: string;
    country: string;
    postalCode: string;
    street: string;
  };
  primaryContact: {
    name: string;
    email: string;
    phone: string;
  };
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
}

export interface RegionalOffice {
  id: string;
  organizationId: string;
  name: string;
  regionCode: string;
  territoryCovered: string[];
}

export interface BranchGroup {
  id: string;
  organizationId: string;
  groupName: string;
  theatreIds: string[];
}

export interface Branch {
  id: string;
  organizationId: string;
  theatreId: string; // Links to existing CineSphere OS Theatre
  branchCode: string;
  branchName: string;
  regionalOfficeId?: string;
  branchGroupId?: string;
  sharedBrandingEnabled: boolean;
  sharedConfigurationEnabled: boolean;
  status: "ACTIVE" | "INACTIVE";
}

// Franchise Management Domain Models
export interface FranchiseOwner {
  id: string;
  organizationId: string;
  ownerName: string;
  companyName: string;
  taxRegistrationNumber: string;
  email: string;
  phone: string;
}

export interface FranchiseAgreement {
  id: string;
  organizationId: string;
  franchiseOwnerId: string;
  theatreId: string;
  agreementNumber: string;
  revenueSharingPercent: number; // e.g. 12.5%
  startDate: string;
  endDate: string;
  complianceStatus: "COMPLIANT" | "AUDIT_REQUIRED" | "NON_COMPLIANT";
}

// Corporate Accounts Domain Models
export interface CorporateAccount {
  id: string;
  organizationId?: string;
  theatreId?: string;
  corporateName: string;
  contractNumber: string;
  creditLimit: number;
  currentBalance: number;
  billingCycle: "MONTHLY" | "QUARTERLY" | "PREPAID";
  discountPercent: number;
  status: "ACTIVE" | "ON_HOLD" | "EXPIRED";
}

// ------------------------------------------------------------------------------
// 5. Sub-Platform 2: Customer Experience (Memberships, Gift Cards, Loyalty)
// ------------------------------------------------------------------------------

export interface MembershipPlan {
  id: string;
  planCode: string;
  name: string;
  tierLevel: "SILVER" | "GOLD" | "PLATINUM" | "VIP_BLACK";
  theatreId?: string; // Optional venue-specific, null for organization-wide
  organizationId?: string;
  priceAmount: number;
  currency: string;
  billingPeriodMonths: number;
  benefits: {
    complimentaryTicketsPerMonth: number;
    discountPercentOnConcessions: number;
    waiverBookingFee: boolean;
    priorityLoungeAccess: boolean;
  };
  expiryRules: {
    gracePeriodDays: number;
    autoRenewEnabled: boolean;
  };
  status: "ACTIVE" | "RETIRED";
}

export interface GiftCard {
  id: string;
  cardCodeMasked: string; // e.g. "GC-••••-••••-8942"
  cardType: "DIGITAL" | "PHYSICAL";
  theatreId?: string;
  organizationId?: string;
  initialAmount: number;
  currentBalance: number;
  currency: string;
  issuedAt: string;
  expiresAt: string;
  status: "ISSUED" | "ACTIVE" | "DEPLETED" | "EXPIRED" | "BLOCKED";
}

export interface LoyaltyProgram {
  id: string;
  programName: string;
  theatreId?: string;
  organizationId?: string;
  pointsEarnRatePerCurrencyUnit: number; // e.g. 1 point per 10 INR/USD spent
  pointsToCurrencyRedemptionRatio: number; // e.g. 100 points = 10 currency units
  tiers: Array<{
    tierName: string;
    minPointsRequired: number;
    pointsMultiplier: number;
  }>;
  pointExpiryMonths: number;
  status: "ACTIVE" | "INACTIVE";
}

export interface RewardPointsLedger {
  id: string;
  customerId: string;
  programId: string;
  pointsDelta: number; // positive for earn, negative for burn
  balanceAfter: number;
  reason: "TICKET_PURCHASE" | "CONCESSION_PURCHASE" | "REDEMPTION" | "PROMOTION" | "EXPIRY";
  referenceId?: string;
  timestamp: string;
}

// ------------------------------------------------------------------------------
// 6. Sub-Platform 3: Pricing Platform (Dynamic Pricing Rules)
// ------------------------------------------------------------------------------

export type PricingRuleType =
  | "DEMAND_SURGE"
  | "HOLIDAY_MULTIPLIER"
  | "FESTIVAL_SPECIAL"
  | "OCCUPANCY_THRESHOLD"
  | "CAMPAIGN_DISCOUNT"
  | "EARLY_BIRD_DISCOUNT";

export interface DynamicPricingRule {
  id: string;
  ruleCode: string;
  name: string;
  ruleType: PricingRuleType;
  theatreId?: string;
  organizationId?: string;
  priority: number; // 1 to 100 (100 highest)
  priceMultiplier: number; // e.g. 1.25 for +25% surge, 0.85 for 15% discount
  absoluteAdjustment?: number;
  conditions: {
    minOccupancyPercent?: number;
    maxOccupancyPercent?: number;
    daysOfWeek?: number[]; // 0=Sun, 6=Sat
    timeSlotFrom?: string; // "18:00"
    timeSlotTo?: string; // "22:00"
    applicableFormat?: string; // "IMAX", "DOLBY_ATMOS"
  };
  isActive: boolean;
}

export interface IPricingRuleEngine {
  evaluatePricing(context: {
    basePrice: number;
    theatreId: string;
    showTime: string;
    currentOccupancyPercent: number;
    format: string;
  }): {
    effectivePrice: number;
    appliedRuleIds: string[];
    priceMultiplier: number;
  };
}

// ------------------------------------------------------------------------------
// 7. Sub-Platform 4: AI Platform Extension Interfaces (Stubs)
// ------------------------------------------------------------------------------

export interface MovieRecommendationContext {
  customerId: string;
  theatreId: string;
  recentBookingGenres: string[];
  preferredLanguage?: string;
  limit: number;
}

export interface MovieRecommendationResult {
  movieId: string;
  confidenceScore: number;
  reasoningPlaceholder: string;
}

export interface IMovieRecommendationEngine {
  recommendMovies(context: MovieRecommendationContext): Promise<MovieRecommendationResult[]>;
}

export interface ISeatRecommendationEngine {
  recommendOptimalSeats(context: {
    showId: string;
    hallId: string;
    ticketsCount: number;
    userPreference?: "CENTER" | "AISLE" | "VIP_BALCONY";
  }): Promise<string[]>; // Returns recommended seat numbers
}

export interface IUpsellEngine {
  suggestConcessionUpsells(context: {
    customerId: string;
    cartTotal: number;
    showTime: string;
  }): Promise<Array<{ itemId: string; itemName: string; promotionalDiscountPercent: number }>>;
}

// ------------------------------------------------------------------------------
// 8. Sub-Platform 5: Device Platform (IoT, Digital Signage, Smart Kiosks)
// ------------------------------------------------------------------------------

export type DeviceType =
  | "SEAT_SENSOR"
  | "OCCUPANCY_SENSOR"
  | "ENVIRONMENTAL_SENSOR"
  | "PROJECTOR_MONITOR"
  | "ENERGY_MONITOR"
  | "LOBBY_DISPLAY"
  | "SHOW_BOARD"
  | "KIOSK"
  | "TURNSTILE";

export interface DeviceRegistry {
  deviceId: string;
  theatreId: string;
  hallId?: string;
  deviceType: DeviceType;
  model: string;
  ipAddress?: string;
  macAddress?: string;
  status: "ONLINE" | "OFFLINE" | "MAINTENANCE" | "DEGRADED";
  lastHeartbeat: string;
  firmwareVersion: string;
  meta?: Record<string, unknown>;
}

export interface DeviceTelemetry {
  deviceId: string;
  timestamp: string;
  metrics: {
    temperatureCelsius?: number;
    humidityPercent?: number;
    powerWatts?: number;
    lampHoursRemaining?: number;
    luxBrightness?: number;
    occupancyDetected?: boolean;
  };
}

export interface IDigitalSignageController {
  updateSignagePlaylist(theatreId: string, screenId: string, playlistItems: string[]): Promise<boolean>;
}

export interface ISmartKioskController {
  initiateKioskSession(theatreId: string, kioskId: string): Promise<{ sessionId: string }>;
  validateTicketQr(sessionId: string, qrCode: string): Promise<{ isValid: boolean; bookingSummary?: unknown }>;
}

// ------------------------------------------------------------------------------
// 9. Sub-Platform 6: Facial Recognition & Privacy Consent (Placeholder)
// ------------------------------------------------------------------------------

export interface IFacialVerificationEngine {
  verifyConsent(customerId: string): Promise<boolean>;
  validatePatronFaceTokenStub(faceToken: string): Promise<{ matchedCustomerId?: string; confidence: number }>;
}

export interface ConsentRecord {
  id: string;
  customerId: string;
  consentType: "BIOMETRIC_CHECKIN" | "VIP_RECOGNITION" | "MARKETING_PROFILING";
  status: "GRANTED" | "REVOKED" | "EXPIRED";
  grantedAt: string;
  revokedAt?: string;
  retentionExpiryDate: string;
}

// ------------------------------------------------------------------------------
// 10. Sub-Platform 7: Integration Platform (Enterprise APIs & Webhooks)
// ------------------------------------------------------------------------------

export type ApiScope =
  | "SHOWS_READ"
  | "SHOWS_WRITE"
  | "BOOKINGS_READ"
  | "BOOKINGS_WRITE"
  | "REPORTS_READ"
  | "MEMBERSHIPS_READ"
  | "ORGANIZATION_ADMIN";

export interface APIClient {
  clientId: string;
  clientName: string;
  organizationId?: string;
  theatreId?: string;
  keyPrefix: string;
  hashedSecret: string;
  allowedScopes: ApiScope[];
  rateLimitTier: "STANDARD" | "HIGH_VOLUME" | "UNLIMITED";
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export interface WebhookSubscription {
  id: string;
  name: string;
  organizationId?: string;
  theatreId?: string;
  targetUrl: string;
  subscribedEvents: DomainEventType[];
  secretSignatureKey: string;
  retryPolicy: {
    maxAttempts: number;
    backoffMultiplierSec: number;
  };
  isActive: boolean;
}

// ------------------------------------------------------------------------------
// 11. Sub-Platform 8: Regional Platform (Multi-Region Deployments)
// ------------------------------------------------------------------------------

export interface RegionalDeploymentConfig {
  regionId: string;
  regionName: string;
  countryCode: string;
  currencies: string[];
  defaultCurrency: string;
  languages: string[];
  defaultLanguage: string;
  dataResidencyJurisdiction: "IN_MUMBAI" | "US_EAST" | "EU_FRANKFURT" | "ME_DUBAI";
  statutoryTaxFramework: "GST_INDIA" | "VAT_GCC" | "SALES_TAX_US" | "GDPR_EU";
  timezoneStrategy: "AUTO_PER_VENUE" | "REGION_LOCKED";
  isActive: boolean;
}
