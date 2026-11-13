/**
 * ==============================================================================
 * CineSphere OS — Dynamic Theatre Configuration Types (Phase 3 – Part 9)
 * ==============================================================================
 * Enterprise SaaS decoupled configuration domain: Localization, Booking Rules,
 * Cancellation, Refund Policies, Age Restrictions, Feature Flags, and Terms.
 * Modeled as strongly typed individual domain entities.
 * ==============================================================================
 */

export type TheatreConfigStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ConfigTimeFormat = "12H" | "24H";
export type ConfigNumberFormat = "INDIAN" | "INTERNATIONAL";
export type ConfigMeasurementUnits = "METRIC" | "IMPERIAL";
export type ConfigRefundMethod = "ORIGINAL_PAYMENT" | "WALLET" | "STORE_CREDIT";

// ------------------------------------------------------------------------------
// Domain Database Records
// ------------------------------------------------------------------------------

export interface TheatreConfigurationRecord {
  id: string;
  theatreId: string;
  status: TheatreConfigStatus;
  version: number;
  publishedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocalizationConfigurationRecord {
  id: string;
  configurationId: string;
  theatreId: string;
  currency: string;
  timezone: string;
  primaryLanguage: string;
  supportedLanguages: string[];
  dateFormat: string;
  timeFormat: ConfigTimeFormat;
  numberFormat: ConfigNumberFormat;
  measurementUnits: ConfigMeasurementUnits;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingConfigurationRecord {
  id: string;
  configurationId: string;
  theatreId: string;
  maxSeatsPerBooking: number;
  minSeatsPerBooking: number;
  advanceBookingDays: number;
  bookingCutoffMinutes: number;
  maxConcurrentBookingsPerUser: number;
  seatHoldDurationSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CancellationConfigurationRecord {
  id: string;
  configurationId: string;
  theatreId: string;
  cancellationAllowed: boolean;
  cancellationDeadlineMinutes: number;
  cancellationFeePercent: string;
  autoCancellationEnabled: boolean;
  autoCancellationTimeoutMinutes: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefundConfigurationRecord {
  id: string;
  configurationId: string;
  theatreId: string;
  refundWindowHours: number;
  refundPercentage: string;
  refundMethod: ConfigRefundMethod;
  processingTimeDays: number;
  gatewayAutoRefund: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgeRestrictionConfigurationRecord {
  id: string;
  configurationId: string;
  theatreId: string;
  minAgeU: number;
  minAgeUA: number;
  minAgeA: number;
  minAgeS: number;
  customAgeRules: string | null;
  guardianRequiredUnderAge: number | null;
  requireAgeVerificationAtGate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFlagConfigurationRecord {
  id: string;
  configurationId: string;
  theatreId: string;
  enableLoyalty: boolean;
  enableCoupons: boolean;
  enableGiftCards: boolean;
  enableMemberships: boolean;
  enableDynamicPricing: boolean;
  enableAiRecommendations: boolean;
  enableWaitlist: boolean;
  customFlags: Record<string, boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfigurationTermsRecord {
  id: string;
  configurationId: string;
  theatreId: string;
  bookingTerms: string;
  refundTerms: string;
  privacyNotice: string | null;
  customerAgreement: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfigurationVersionRecord {
  id: string;
  configurationId: string;
  theatreId: string;
  versionNumber: number;
  snapshot: Record<string, unknown>;
  changeSummary: string | null;
  changedBy: string | null;
  changedRole: string | null;
  createdAt: Date;
}

// ------------------------------------------------------------------------------
// Semantic Domain Entity Type Aliases
// ------------------------------------------------------------------------------
export type TheatreConfiguration = TheatreConfigurationRecord;
export type LocalizationConfiguration = LocalizationConfigurationRecord;
export type BookingConfiguration = BookingConfigurationRecord;
export type CancellationConfiguration = CancellationConfigurationRecord;
export type RefundConfiguration = RefundConfigurationRecord;
export type AgeRestrictionConfiguration = AgeRestrictionConfigurationRecord;
export type FeatureFlagConfiguration = FeatureFlagConfigurationRecord;
export type ConfigurationTerms = ConfigurationTermsRecord;
export type ConfigurationVersion = ConfigurationVersionRecord;

// ------------------------------------------------------------------------------
// Composite Aggregated Bundle
// ------------------------------------------------------------------------------

export interface TheatreConfigurationBundle {
  configuration: TheatreConfigurationRecord | null;
  localization: LocalizationConfigurationRecord | null;
  booking: BookingConfigurationRecord | null;
  cancellation: CancellationConfigurationRecord | null;
  refund: RefundConfigurationRecord | null;
  ageRestriction: AgeRestrictionConfigurationRecord | null;
  featureFlags: FeatureFlagConfigurationRecord | null;
  terms: ConfigurationTermsRecord | null;
  versions?: ConfigurationVersionRecord[];
}

// ------------------------------------------------------------------------------
// Mutation Input DTOs
// ------------------------------------------------------------------------------

export interface CreateTheatreConfigurationInput {
  theatreId: string;
  status?: TheatreConfigStatus;
  localization?: Partial<Omit<LocalizationConfigurationRecord, "id" | "configurationId" | "theatreId" | "createdAt" | "updatedAt">>;
  booking?: Partial<Omit<BookingConfigurationRecord, "id" | "configurationId" | "theatreId" | "createdAt" | "updatedAt">>;
  cancellation?: Partial<Omit<CancellationConfigurationRecord, "id" | "configurationId" | "theatreId" | "createdAt" | "updatedAt">>;
  refund?: Partial<Omit<RefundConfigurationRecord, "id" | "configurationId" | "theatreId" | "createdAt" | "updatedAt">>;
  ageRestriction?: Partial<Omit<AgeRestrictionConfigurationRecord, "id" | "configurationId" | "theatreId" | "createdAt" | "updatedAt">>;
  featureFlags?: Partial<Omit<FeatureFlagConfigurationRecord, "id" | "configurationId" | "theatreId" | "createdAt" | "updatedAt">>;
  terms?: Partial<Omit<ConfigurationTermsRecord, "id" | "configurationId" | "theatreId" | "createdAt" | "updatedAt">>;
}

export interface UpdateLocalizationConfigInput {
  theatreId: string;
  currency?: string;
  timezone?: string;
  primaryLanguage?: string;
  supportedLanguages?: string[];
  dateFormat?: string;
  timeFormat?: ConfigTimeFormat;
  numberFormat?: ConfigNumberFormat;
  measurementUnits?: ConfigMeasurementUnits;
}

export interface UpdateBookingConfigInput {
  theatreId: string;
  maxSeatsPerBooking?: number;
  minSeatsPerBooking?: number;
  advanceBookingDays?: number;
  bookingCutoffMinutes?: number;
  maxConcurrentBookingsPerUser?: number;
  seatHoldDurationSeconds?: number;
}

export interface UpdateCancellationConfigInput {
  theatreId: string;
  cancellationAllowed?: boolean;
  cancellationDeadlineMinutes?: number;
  cancellationFeePercent?: string;
  autoCancellationEnabled?: boolean;
  autoCancellationTimeoutMinutes?: number | null;
  notes?: string | null;
}

export interface UpdateRefundConfigInput {
  theatreId: string;
  refundWindowHours?: number;
  refundPercentage?: string;
  refundMethod?: ConfigRefundMethod;
  processingTimeDays?: number;
  gatewayAutoRefund?: boolean;
}

export interface UpdateAgeRestrictionConfigInput {
  theatreId: string;
  minAgeU?: number;
  minAgeUA?: number;
  minAgeA?: number;
  minAgeS?: number;
  customAgeRules?: string | null;
  guardianRequiredUnderAge?: number | null;
  requireAgeVerificationAtGate?: boolean;
}

export interface UpdateFeatureFlagsInput {
  theatreId: string;
  enableLoyalty?: boolean;
  enableCoupons?: boolean;
  enableGiftCards?: boolean;
  enableMemberships?: boolean;
  enableDynamicPricing?: boolean;
  enableAiRecommendations?: boolean;
  enableWaitlist?: boolean;
  customFlags?: Record<string, boolean>;
}

export interface UpdateConfigurationTermsInput {
  theatreId: string;
  bookingTerms?: string;
  refundTerms?: string;
  privacyNotice?: string | null;
  customerAgreement?: string;
}

export interface PublishTheatreConfigurationInput {
  theatreId: string;
  expectedVersion?: number;
  summary?: string;
}

export interface RestoreConfigurationVersionInput {
  theatreId: string;
  versionNumber: number;
}
