import { createLogger } from "@/lib/observability/structured-logger";
import { securityAuditService } from "@/lib/services/security-audit.service";
import { tenantService } from "@/lib/services/tenant.service";
import { theatreConfigurationRepository } from "@/lib/repositories/theatre-configuration.repository";
import { invalidateCacheByTag, CACHE_TAGS } from "@/lib/performance/cache-strategy";
import {
  ValidationError,
  NotFoundError,
} from "@/lib/errors/app-error";
import { sanitizeString } from "@/lib/security/input-sanitizer";
import {
  CreateTheatreConfigurationSchema,
  UpdateLocalizationConfigSchema,
  UpdateBookingConfigSchema,
  UpdateCancellationConfigSchema,
  UpdateRefundConfigSchema,
  UpdateAgeRestrictionConfigSchema,
  UpdateFeatureFlagsSchema,
  UpdateConfigurationTermsSchema,
  PublishTheatreConfigurationSchema,
  RestoreConfigurationVersionSchema,
} from "@/lib/validation/theatre-configuration.validation";
import type {
  TheatreConfigurationRecord,
  LocalizationConfigurationRecord,
  BookingConfigurationRecord,
  CancellationConfigurationRecord,
  RefundConfigurationRecord,
  AgeRestrictionConfigurationRecord,
  FeatureFlagConfigurationRecord,
  ConfigurationTermsRecord,
  ConfigurationVersionRecord,
  TheatreConfigurationBundle,
  CreateTheatreConfigurationInput,
  UpdateLocalizationConfigInput,
  UpdateBookingConfigInput,
  UpdateCancellationConfigInput,
  UpdateRefundConfigInput,
  UpdateAgeRestrictionConfigInput,
  UpdateFeatureFlagsInput,
  UpdateConfigurationTermsInput,
  PublishTheatreConfigurationInput,
  RestoreConfigurationVersionInput,
} from "@/types/theatre-configuration.types";
import type { SecurityActorContext } from "@/types/security-hardening.types";
import type { ZodIssue } from "zod";

const logger = createLogger("TheatreConfigurationService");

function formatZodIssues(issues: ZodIssue[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const issue of issues) {
    const path = issue.path.join(".") || "root";
    if (!result[path]) result[path] = [];
    result[path].push(issue.message);
  }
  return result;
}

export class TheatreConfigurationService {
  private invalidateConfigCache(theatreId: string): void {
    invalidateCacheByTag(CACHE_TAGS.THEATRE_CONFIGURATION(theatreId));
    invalidateCacheByTag(CACHE_TAGS.PUBLIC_THEATRE_CONFIGURATION(theatreId));
  }

  // ----------------------------------------------------------------------------
  // Query Bundle
  // ----------------------------------------------------------------------------
  public async getConfigurationBundle(
    theatreId: string,
    actor?: SecurityActorContext
  ): Promise<TheatreConfigurationBundle> {
    const correlationId = actor?.correlationId || `corr-cfg-bundle-${Date.now()}`;
    logger.info("API", "Fetching theatre configuration bundle", {
      correlationId,
      theatreId,
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }

    return await theatreConfigurationRepository.findBundle(theatreId);
  }

  // ----------------------------------------------------------------------------
  // Upsert Master Configuration
  // ----------------------------------------------------------------------------
  public async upsertConfiguration(
    input: CreateTheatreConfigurationInput,
    actor?: SecurityActorContext
  ): Promise<TheatreConfigurationBundle> {
    const correlationId = actor?.correlationId || `corr-cfg-upsert-${Date.now()}`;
    logger.info("API", "Upserting theatre configuration profile", {
      correlationId,
      theatreId: input.theatreId,
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = CreateTheatreConfigurationSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid configuration creation payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const bundle = await theatreConfigurationRepository.upsertConfiguration(
      parsed.data,
      actor?.userId || "system",
      actor?.role || "THEATRE_ADMIN"
    );

    this.invalidateConfigCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_CONFIGURATION",
        action: "CREATE",
        description: `Created or ensured configuration profile for theatre ${input.theatreId}`,
        metadata: {
          theatreId: input.theatreId,
          status: bundle.configuration?.status,
        },
      });
    }

    return bundle;
  }

  // ----------------------------------------------------------------------------
  // Localization Configuration
  // ----------------------------------------------------------------------------
  public async updateLocalization(
    input: UpdateLocalizationConfigInput,
    actor?: SecurityActorContext
  ): Promise<LocalizationConfigurationRecord> {
    const correlationId = actor?.correlationId || `corr-cfg-loc-${Date.now()}`;
    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = UpdateLocalizationConfigSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid localization configuration payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const updated = await theatreConfigurationRepository.updateLocalization(
      parsed.data,
      actor?.userId || "system",
      actor?.role || "THEATRE_ADMIN"
    );

    this.invalidateConfigCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_CONFIGURATION",
        action: "UPDATE",
        description: `Updated localization: Currency ${updated.currency}, Timezone ${updated.timezone}`,
        metadata: {
          theatreId: input.theatreId,
          currency: updated.currency,
          timezone: updated.timezone,
          primaryLanguage: updated.primaryLanguage,
        },
      });
    }

    return updated;
  }

  // ----------------------------------------------------------------------------
  // Booking Rules Configuration
  // ----------------------------------------------------------------------------
  public async updateBooking(
    input: UpdateBookingConfigInput,
    actor?: SecurityActorContext
  ): Promise<BookingConfigurationRecord> {
    const correlationId = actor?.correlationId || `corr-cfg-bk-${Date.now()}`;
    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = UpdateBookingConfigSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid booking configuration payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const updated = await theatreConfigurationRepository.updateBooking(
      parsed.data,
      actor?.userId || "system",
      actor?.role || "THEATRE_ADMIN"
    );

    this.invalidateConfigCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_CONFIGURATION",
        action: "UPDATE",
        description: `Updated booking rules: Window ${updated.advanceBookingDays} days, Max ${updated.maxSeatsPerBooking} seats`,
        metadata: {
          theatreId: input.theatreId,
          maxSeats: updated.maxSeatsPerBooking,
          minSeats: updated.minSeatsPerBooking,
          advanceDays: updated.advanceBookingDays,
        },
      });
    }

    return updated;
  }

  // ----------------------------------------------------------------------------
  // Cancellation Configuration
  // ----------------------------------------------------------------------------
  public async updateCancellation(
    input: UpdateCancellationConfigInput,
    actor?: SecurityActorContext
  ): Promise<CancellationConfigurationRecord> {
    const correlationId = actor?.correlationId || `corr-cfg-cnc-${Date.now()}`;
    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = UpdateCancellationConfigSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid cancellation configuration payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const updated = await theatreConfigurationRepository.updateCancellation(
      {
        ...parsed.data,
        notes: parsed.data.notes ? sanitizeString(parsed.data.notes) : undefined,
      },
      actor?.userId || "system",
      actor?.role || "THEATRE_ADMIN"
    );

    this.invalidateConfigCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_CONFIGURATION",
        action: "UPDATE",
        description: `Updated cancellation rules: Allowed ${updated.cancellationAllowed}, Fee ${updated.cancellationFeePercent}%`,
        metadata: {
          theatreId: input.theatreId,
          cancellationAllowed: updated.cancellationAllowed,
          feePercent: updated.cancellationFeePercent,
        },
      });
    }

    return updated;
  }

  // ----------------------------------------------------------------------------
  // Refund Configuration
  // ----------------------------------------------------------------------------
  public async updateRefund(
    input: UpdateRefundConfigInput,
    actor?: SecurityActorContext
  ): Promise<RefundConfigurationRecord> {
    const correlationId = actor?.correlationId || `corr-cfg-ref-${Date.now()}`;
    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = UpdateRefundConfigSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid refund configuration payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const updated = await theatreConfigurationRepository.updateRefund(
      parsed.data,
      actor?.userId || "system",
      actor?.role || "THEATRE_ADMIN"
    );

    this.invalidateConfigCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_CONFIGURATION",
        action: "UPDATE",
        description: `Updated refund rules: Window ${updated.refundWindowHours}h, Refund ${updated.refundPercentage}%`,
        metadata: {
          theatreId: input.theatreId,
          refundWindowHours: updated.refundWindowHours,
          refundPercentage: updated.refundPercentage,
          method: updated.refundMethod,
        },
      });
    }

    return updated;
  }

  // ----------------------------------------------------------------------------
  // Age Restriction Configuration
  // ----------------------------------------------------------------------------
  public async updateAgeRestriction(
    input: UpdateAgeRestrictionConfigInput,
    actor?: SecurityActorContext
  ): Promise<AgeRestrictionConfigurationRecord> {
    const correlationId = actor?.correlationId || `corr-cfg-age-${Date.now()}`;
    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = UpdateAgeRestrictionConfigSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid age restriction configuration payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const updated = await theatreConfigurationRepository.updateAgeRestriction(
      {
        ...parsed.data,
        customAgeRules: parsed.data.customAgeRules ? sanitizeString(parsed.data.customAgeRules) : undefined,
      },
      actor?.userId || "system",
      actor?.role || "THEATRE_ADMIN"
    );

    this.invalidateConfigCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_CONFIGURATION",
        action: "UPDATE",
        description: `Updated age restrictions: U:${updated.minAgeU}, UA:${updated.minAgeUA}, A:${updated.minAgeA}`,
        metadata: {
          theatreId: input.theatreId,
          minAgeU: updated.minAgeU,
          minAgeUA: updated.minAgeUA,
          minAgeA: updated.minAgeA,
        },
      });
    }

    return updated;
  }

  // ----------------------------------------------------------------------------
  // Feature Flags Configuration
  // ----------------------------------------------------------------------------
  public async updateFeatureFlags(
    input: UpdateFeatureFlagsInput,
    actor?: SecurityActorContext
  ): Promise<FeatureFlagConfigurationRecord> {
    const correlationId = actor?.correlationId || `corr-cfg-ff-${Date.now()}`;
    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = UpdateFeatureFlagsSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid feature flag configuration payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const updated = await theatreConfigurationRepository.updateFeatureFlags(
      parsed.data,
      actor?.userId || "system",
      actor?.role || "THEATRE_ADMIN"
    );

    this.invalidateConfigCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_CONFIGURATION",
        action: "UPDATE",
        description: "Updated theatre feature flags and module capabilities",
        metadata: {
          theatreId: input.theatreId,
          enableLoyalty: updated.enableLoyalty,
          enableDynamicPricing: updated.enableDynamicPricing,
        },
      });
    }

    return updated;
  }

  // ----------------------------------------------------------------------------
  // Configuration Terms
  // ----------------------------------------------------------------------------
  public async updateTerms(
    input: UpdateConfigurationTermsInput,
    actor?: SecurityActorContext
  ): Promise<ConfigurationTermsRecord> {
    const correlationId = actor?.correlationId || `corr-cfg-trm-${Date.now()}`;
    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = UpdateConfigurationTermsSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid configuration terms payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const updated = await theatreConfigurationRepository.updateTerms(
      {
        ...parsed.data,
        bookingTerms: parsed.data.bookingTerms ? sanitizeString(parsed.data.bookingTerms) : undefined,
        refundTerms: parsed.data.refundTerms ? sanitizeString(parsed.data.refundTerms) : undefined,
        privacyNotice: parsed.data.privacyNotice !== undefined ? (parsed.data.privacyNotice ? sanitizeString(parsed.data.privacyNotice) : null) : undefined,
        customerAgreement: parsed.data.customerAgreement ? sanitizeString(parsed.data.customerAgreement) : undefined,
      },
      actor?.userId || "system",
      actor?.role || "THEATRE_ADMIN"
    );

    this.invalidateConfigCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_CONFIGURATION",
        action: "UPDATE",
        description: `Updated configuration terms and customer agreements (v${updated.version})`,
        metadata: {
          theatreId: input.theatreId,
          version: updated.version,
        },
      });
    }

    return updated;
  }

  // ----------------------------------------------------------------------------
  // Publish & Restore Configuration
  // ----------------------------------------------------------------------------
  public async publishConfiguration(
    input: PublishTheatreConfigurationInput,
    actor?: SecurityActorContext
  ): Promise<TheatreConfigurationRecord> {
    const correlationId = actor?.correlationId || `corr-cfg-pub-${Date.now()}`;
    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = PublishTheatreConfigurationSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid publish configuration payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const published = await theatreConfigurationRepository.publishConfiguration(
      parsed.data,
      actor?.userId || "system",
      actor?.role || "THEATRE_ADMIN"
    );

    this.invalidateConfigCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_CONFIGURATION",
        action: "UPDATE",
        description: `Published configuration profile version v${published.version}`,
        metadata: {
          theatreId: input.theatreId,
          version: published.version,
          status: published.status,
        },
      });
    }

    return published;
  }

  public async restoreVersion(
    input: RestoreConfigurationVersionInput,
    actor?: SecurityActorContext
  ): Promise<TheatreConfigurationBundle> {
    const correlationId = actor?.correlationId || `corr-cfg-rst-${Date.now()}`;
    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = RestoreConfigurationVersionSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid configuration restore payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const restoredBundle = await theatreConfigurationRepository.restoreVersion(
      parsed.data,
      actor?.userId || "system",
      actor?.role || "THEATRE_ADMIN"
    );

    this.invalidateConfigCache(input.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_CONFIGURATION",
        action: "UPDATE",
        description: `Restored configuration profile snapshot from version v${parsed.data.versionNumber}`,
        metadata: {
          theatreId: input.theatreId,
          restoredVersion: parsed.data.versionNumber,
          newVersion: restoredBundle.configuration?.version,
        },
      });
    }

    return restoredBundle;
  }

  // ----------------------------------------------------------------------------
  // Versions
  // ----------------------------------------------------------------------------
  public async getVersions(
    theatreId: string,
    actor?: SecurityActorContext
  ): Promise<ConfigurationVersionRecord[]> {
    if (actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }
    return await theatreConfigurationRepository.getVersions(theatreId);
  }

  // Convenient Aliases
  public updateLocalizationConfig = this.updateLocalization;
  public updateBookingConfig = this.updateBooking;
  public updateCancellationConfig = this.updateCancellation;
  public updateRefundConfig = this.updateRefund;
  public updateAgeRestrictionConfig = this.updateAgeRestriction;
  public updateConfigurationTerms = this.updateTerms;
  public restoreConfigurationVersion = this.restoreVersion;
}

export const theatreConfigurationService = new TheatreConfigurationService();
