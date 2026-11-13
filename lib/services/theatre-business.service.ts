import { createLogger } from "@/lib/observability/structured-logger";
import { securityAuditService } from "@/lib/services/security-audit.service";
import { tenantService } from "@/lib/services/tenant.service";
import { theatreBusinessRepository } from "@/lib/repositories/theatre-business.repository";
import { theatreLifecycleRepository } from "@/lib/repositories/theatre-lifecycle.repository";
import { invalidateCacheByTag, CACHE_TAGS, type PaginatedResult } from "@/lib/performance/cache-strategy";
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
  ConflictError,
  BusinessRuleError,
} from "@/lib/errors/app-error";
import { sanitizeString, sanitizeUrl, stripHtml } from "@/lib/security/input-sanitizer";
import {
  CreateTheatreBusinessProfileSchema,
  UpdateTheatreBusinessProfileSchema,
  UpdateTheatreTaxConfigurationSchema,
  UpdateTheatreInvoiceConfigurationSchema,
  VerifyTheatreBusinessProfileSchema,
  ArchiveTheatreBusinessProfileSchema,
  AddTheatreBusinessDocumentSchema,
  DeleteTheatreBusinessDocumentSchema,
  SearchTheatreBusinessFiltersSchema,
} from "@/lib/validation/theatre-business.validation";
import type {
  TheatreBusinessProfileRecord,
  TheatreBusinessRegistrationRecord,
  TheatreBusinessOwnerRecord,
  TheatreTaxConfigurationRecord,
  TheatreInvoiceConfigurationRecord,
  TheatreBusinessComplianceRecord,
  TheatreBusinessDocumentRecord,
  TheatreBusinessVersionRecord,
  TheatreBusinessBundle,
  TheatreBusinessProfileWithDetails,
  CreateTheatreBusinessProfileInput,
  UpdateTheatreBusinessProfileInput,
  UpdateTheatreTaxConfigurationInput,
  UpdateTheatreInvoiceConfigurationInput,
  VerifyTheatreBusinessProfileInput,
  ArchiveTheatreBusinessProfileInput,
  AddTheatreBusinessDocumentInput,
  DeleteTheatreBusinessDocumentInput,
  SearchTheatreBusinessFilters,
} from "@/types/theatre-business.types";
import type { SecurityActorContext } from "@/types/security-hardening.types";
import type { ZodIssue } from "zod";

const logger = createLogger("TheatreBusinessService");

function formatZodIssues(issues: ZodIssue[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const issue of issues) {
    const path = issue.path.join(".") || "root";
    if (!result[path]) result[path] = [];
    result[path].push(issue.message);
  }
  return result;
}

/**
 * ==============================================================================
 * CineSphere OS — Theatre Business Service (Phase 3 – Part 7)
 * ==============================================================================
 * Enterprise domain service governing corporate legal identity, registration
 * certifications, country-aware tax configuration, invoice sequencing/layout,
 * Super Admin compliance verification, and decoupled document attachment vault.
 * ==============================================================================
 */
export class TheatreBusinessService {
  private invalidateBusinessCache(theatreId: string): void {
    invalidateCacheByTag(CACHE_TAGS.THEATRE_BUSINESS(theatreId));
    invalidateCacheByTag(CACHE_TAGS.PUBLIC_THEATRE_BUSINESS(theatreId));
  }

  // ----------------------------------------------------------------------------
  // 1. GET BUSINESS PROFILE / BUNDLE
  // ----------------------------------------------------------------------------
  public async getBusinessBundle(
    theatreId: string,
    actor?: SecurityActorContext
  ): Promise<TheatreBusinessBundle> {
    const correlationId = actor?.correlationId || `corr-biz-bundle-${Date.now()}`;
    logger.info("API", "Fetching theatre business bundle", {
      correlationId,
      theatreId,
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }

    return await theatreBusinessRepository.findBundle(theatreId);
  }

  public async getBusinessProfile(
    theatreId: string,
    actor?: SecurityActorContext
  ): Promise<TheatreBusinessProfileWithDetails | null> {
    const correlationId = actor?.correlationId || `corr-biz-profile-${Date.now()}`;
    logger.info("API", "Fetching theatre business profile with details", {
      correlationId,
      theatreId,
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }

    return await theatreBusinessRepository.findWithDetails(theatreId);
  }

  // ----------------------------------------------------------------------------
  // 2. CREATE BUSINESS PROFILE
  // ----------------------------------------------------------------------------
  public async createBusinessProfile(
    input: CreateTheatreBusinessProfileInput,
    actor?: SecurityActorContext
  ): Promise<TheatreBusinessProfileWithDetails> {
    const correlationId = actor?.correlationId || `corr-biz-create-${Date.now()}`;
    logger.info("API", "Creating theatre business profile", {
      correlationId,
      theatreId: input.theatreId,
      metadata: {
        legalName: input.legalBusinessName,
        category: input.businessCategory,
      },
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = CreateTheatreBusinessProfileSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid theatre business profile payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const data = parsed.data;

    // Check if theatre exists
    const theatre = await theatreLifecycleRepository.findById(data.theatreId);
    if (!theatre) {
      throw new NotFoundError(
        `Theatre with ID '${data.theatreId}' does not exist.`,
        correlationId
      );
    }

    // Check if profile already exists
    const existing = await theatreBusinessRepository.findByTheatreId(data.theatreId);
    if (existing) {
      throw new ConflictError(
        `A business profile already exists for theatre '${data.theatreId}'.`,
        { correlationId }
      );
    }

    // Sanitize text inputs
    const sanitizedInput: CreateTheatreBusinessProfileInput = {
      theatreId: data.theatreId,
      legalBusinessName: stripHtml(sanitizeString(data.legalBusinessName)),
      registeredEntityName: data.registeredEntityName
        ? stripHtml(sanitizeString(data.registeredEntityName))
        : null,
      businessCategory: data.businessCategory || "PRIVATE_LIMITED",
      customCategory: data.customCategory ? stripHtml(sanitizeString(data.customCategory)) : null,
      businessType: stripHtml(sanitizeString(data.businessType || "CINEMA_EXHIBITION")),
      businessDescription: data.businessDescription
        ? stripHtml(sanitizeString(data.businessDescription))
        : null,
      industry: stripHtml(sanitizeString(data.industry || "Media & Entertainment / Cinema Exhibition")),
      registration: data.registration
        ? {
            gstNumber: data.registration.gstNumber?.toUpperCase() || null,
            panNumber: data.registration.panNumber?.toUpperCase() || null,
            cinNumber: data.registration.cinNumber?.toUpperCase() || null,
            businessRegistrationNumber: data.registration.businessRegistrationNumber
              ? stripHtml(sanitizeString(data.registration.businessRegistrationNumber))
              : null,
            registrationDate: data.registration.registrationDate || null,
            registrationAuthority: data.registration.registrationAuthority
              ? stripHtml(sanitizeString(data.registration.registrationAuthority))
              : null,
            certificateUrl: data.registration.certificateUrl
              ? sanitizeUrl(data.registration.certificateUrl)
              : null,
          }
        : undefined,
      owner: data.owner
        ? {
            ownerName: stripHtml(sanitizeString(data.owner.ownerName)),
            ownershipType: data.owner.ownershipType,
            businessContactPhone: data.owner.businessContactPhone
              ? stripHtml(sanitizeString(data.owner.businessContactPhone))
              : null,
            businessEmail: data.owner.businessEmail
              ? stripHtml(sanitizeString(data.owner.businessEmail))
              : null,
            managingDirector: data.owner.managingDirector
              ? stripHtml(sanitizeString(data.owner.managingDirector))
              : null,
            authorizedSignatory: data.owner.authorizedSignatory
              ? stripHtml(sanitizeString(data.owner.authorizedSignatory))
              : null,
          }
        : undefined,
      taxConfiguration: data.taxConfiguration
        ? {
            taxSystemType: data.taxConfiguration.taxSystemType,
            taxJurisdictionCountry: data.taxConfiguration.taxJurisdictionCountry,
            taxPercentage: data.taxConfiguration.taxPercentage || "18.00",
            pricingTaxModel: data.taxConfiguration.pricingTaxModel,
            isTaxExempt: data.taxConfiguration.isTaxExempt,
            exemptionReason: data.taxConfiguration.exemptionReason
              ? stripHtml(sanitizeString(data.taxConfiguration.exemptionReason))
              : null,
            regionalTaxCode: data.taxConfiguration.regionalTaxCode
              ? stripHtml(sanitizeString(data.taxConfiguration.regionalTaxCode))
              : null,
            internationalTaxNumber: data.taxConfiguration.internationalTaxNumber
              ? stripHtml(sanitizeString(data.taxConfiguration.internationalTaxNumber))
              : null,
            taxStatus: data.taxConfiguration.taxStatus,
            notes: data.taxConfiguration.notes
              ? stripHtml(sanitizeString(data.taxConfiguration.notes))
              : null,
          }
        : undefined,
      invoiceConfiguration: data.invoiceConfiguration
        ? {
            invoicePrefix: data.invoiceConfiguration.invoicePrefix,
            invoiceSequenceNext: data.invoiceConfiguration.invoiceSequenceNext,
            invoiceHeader: stripHtml(sanitizeString(data.invoiceConfiguration.invoiceHeader)),
            invoiceFooter: data.invoiceConfiguration.invoiceFooter
              ? stripHtml(sanitizeString(data.invoiceConfiguration.invoiceFooter))
              : null,
            invoiceNotes: data.invoiceConfiguration.invoiceNotes
              ? stripHtml(sanitizeString(data.invoiceConfiguration.invoiceNotes))
              : null,
            invoiceLogoUrl: data.invoiceConfiguration.invoiceLogoUrl
              ? sanitizeUrl(data.invoiceConfiguration.invoiceLogoUrl)
              : null,
            enableEInvoice: data.invoiceConfiguration.enableEInvoice,
            enablePdfInvoice: data.invoiceConfiguration.enablePdfInvoice,
            enableCreditNotes: data.invoiceConfiguration.enableCreditNotes,
          }
        : undefined,
    };

    const created = await theatreBusinessRepository.createBusinessProfile(
      data.theatreId,
      sanitizedInput,
      actor?.userId || "system"
    );

    this.invalidateBusinessCache(data.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_BUSINESS",
        action: "CREATE",
        description: `Created business profile for ${created.legalBusinessName}`,
        metadata: {
          entityId: created.id,
          theatreId: data.theatreId,
          legalBusinessName: created.legalBusinessName,
          category: created.businessCategory,
          taxSystem: created.taxConfiguration?.taxSystemType,
        },
      });
    }

    return created;
  }

  // ----------------------------------------------------------------------------
  // 3. UPDATE BUSINESS PROFILE
  // ----------------------------------------------------------------------------
  public async updateBusinessProfile(
    input: UpdateTheatreBusinessProfileInput,
    actor?: SecurityActorContext
  ): Promise<TheatreBusinessProfileWithDetails> {
    const correlationId = actor?.correlationId || `corr-biz-update-${Date.now()}`;
    logger.info("API", "Updating theatre business profile", {
      correlationId,
      theatreId: input.theatreId,
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = UpdateTheatreBusinessProfileSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid theatre business profile update payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const data = parsed.data;

    const current = await theatreBusinessRepository.findByTheatreId(data.theatreId);
    if (!current) {
      throw new NotFoundError(
        `Business profile not found for theatre '${data.theatreId}'.`,
        correlationId
      );
    }

    // Check version
    if (data.expectedVersion !== undefined && current.version !== data.expectedVersion) {
      throw new BusinessRuleError(
        `Optimistic lock failure: Record has been modified by another transaction. Expected version ${data.expectedVersion}, found ${current.version}`,
        correlationId
      );
    }

    // Sanitize inputs
    const sanitizedUpdate: UpdateTheatreBusinessProfileInput = {
      theatreId: data.theatreId,
      expectedVersion: data.expectedVersion,
      legalBusinessName: data.legalBusinessName
        ? stripHtml(sanitizeString(data.legalBusinessName))
        : undefined,
      registeredEntityName:
        data.registeredEntityName !== undefined
          ? data.registeredEntityName
            ? stripHtml(sanitizeString(data.registeredEntityName))
            : null
          : undefined,
      businessCategory: data.businessCategory,
      customCategory:
        data.customCategory !== undefined
          ? data.customCategory
            ? stripHtml(sanitizeString(data.customCategory))
            : null
          : undefined,
      businessType: data.businessType ? stripHtml(sanitizeString(data.businessType)) : undefined,
      businessDescription:
        data.businessDescription !== undefined
          ? data.businessDescription
            ? stripHtml(sanitizeString(data.businessDescription))
            : null
          : undefined,
      industry: data.industry ? stripHtml(sanitizeString(data.industry)) : undefined,
      registration: data.registration
        ? {
            gstNumber: data.registration.gstNumber?.toUpperCase() || null,
            panNumber: data.registration.panNumber?.toUpperCase() || null,
            cinNumber: data.registration.cinNumber?.toUpperCase() || null,
            businessRegistrationNumber: data.registration.businessRegistrationNumber
              ? stripHtml(sanitizeString(data.registration.businessRegistrationNumber))
              : null,
            registrationDate: data.registration.registrationDate || null,
            registrationAuthority: data.registration.registrationAuthority
              ? stripHtml(sanitizeString(data.registration.registrationAuthority))
              : null,
            certificateUrl: data.registration.certificateUrl
              ? sanitizeUrl(data.registration.certificateUrl)
              : null,
            isGstVerified: data.registration.isGstVerified,
            isPanVerified: data.registration.isPanVerified,
          }
        : undefined,
      owner: data.owner
        ? {
            ownerName: data.owner.ownerName ? stripHtml(sanitizeString(data.owner.ownerName)) : undefined,
            ownershipType: data.owner.ownershipType,
            businessContactPhone:
              data.owner.businessContactPhone !== undefined
                ? data.owner.businessContactPhone
                  ? stripHtml(sanitizeString(data.owner.businessContactPhone))
                  : null
                : undefined,
            businessEmail:
              data.owner.businessEmail !== undefined
                ? data.owner.businessEmail
                  ? stripHtml(sanitizeString(data.owner.businessEmail))
                  : null
                : undefined,
            managingDirector:
              data.owner.managingDirector !== undefined
                ? data.owner.managingDirector
                  ? stripHtml(sanitizeString(data.owner.managingDirector))
                  : null
                : undefined,
            authorizedSignatory:
              data.owner.authorizedSignatory !== undefined
                ? data.owner.authorizedSignatory
                  ? stripHtml(sanitizeString(data.owner.authorizedSignatory))
                  : null
                : undefined,
          }
        : undefined,
    };

    const updated = await theatreBusinessRepository.updateBusinessProfile(
      data.theatreId,
      sanitizedUpdate,
      actor?.userId || "system"
    );

    this.invalidateBusinessCache(data.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_BUSINESS",
        action: "UPDATE",
        description: `Updated business profile for ${updated.legalBusinessName}`,
        metadata: {
          entityId: updated.id,
          theatreId: data.theatreId,
          legalBusinessName: updated.legalBusinessName,
          category: updated.businessCategory,
          newVersion: updated.version,
        },
      });
    }

    return updated;
  }

  // ----------------------------------------------------------------------------
  // 4. UPDATE TAX CONFIGURATION
  // ----------------------------------------------------------------------------
  public async updateTaxConfiguration(
    input: UpdateTheatreTaxConfigurationInput,
    actor?: SecurityActorContext
  ): Promise<TheatreTaxConfigurationRecord> {
    const correlationId = actor?.correlationId || `corr-biz-tax-${Date.now()}`;
    logger.info("API", "Updating theatre tax configuration", {
      correlationId,
      theatreId: input.theatreId,
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = UpdateTheatreTaxConfigurationSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid tax configuration payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const data = parsed.data;

    const profile = await theatreBusinessRepository.findByTheatreId(data.theatreId);
    if (!profile) {
      throw new NotFoundError(
        `Business profile not found for theatre '${data.theatreId}'.`,
        correlationId
      );
    }

    const sanitizedTax: UpdateTheatreTaxConfigurationInput = {
      theatreId: data.theatreId,
      taxSystemType: data.taxSystemType,
      taxJurisdictionCountry: data.taxJurisdictionCountry,
      taxPercentage: data.taxPercentage !== undefined ? data.taxPercentage : undefined,
      pricingTaxModel: data.pricingTaxModel,
      isTaxExempt: data.isTaxExempt,
      exemptionReason:
        data.exemptionReason !== undefined
          ? data.exemptionReason
            ? stripHtml(sanitizeString(data.exemptionReason))
            : null
          : undefined,
      regionalTaxCode:
        data.regionalTaxCode !== undefined
          ? data.regionalTaxCode
            ? stripHtml(sanitizeString(data.regionalTaxCode))
            : null
          : undefined,
      internationalTaxNumber:
        data.internationalTaxNumber !== undefined
          ? data.internationalTaxNumber
            ? stripHtml(sanitizeString(data.internationalTaxNumber))
            : null
          : undefined,
      taxStatus: data.taxStatus,
      notes:
        data.notes !== undefined
          ? data.notes
            ? stripHtml(sanitizeString(data.notes))
            : null
          : undefined,
    };

    const updated = await theatreBusinessRepository.updateTaxConfiguration(
      data.theatreId,
      sanitizedTax,
      actor?.userId || "system"
    );

    this.invalidateBusinessCache(data.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_TAX_CONFIGURATION",
        action: "UPDATE",
        description: `Updated tax configuration for theatre ${data.theatreId}`,
        metadata: {
          entityId: updated.id,
          theatreId: data.theatreId,
          taxSystemType: updated.taxSystemType,
          taxPercentage: updated.taxPercentage,
          pricingTaxModel: updated.pricingTaxModel,
        },
      });
    }

    return updated;
  }

  // ----------------------------------------------------------------------------
  // 5. UPDATE INVOICE CONFIGURATION
  // ----------------------------------------------------------------------------
  public async updateInvoiceConfiguration(
    input: UpdateTheatreInvoiceConfigurationInput,
    actor?: SecurityActorContext
  ): Promise<TheatreInvoiceConfigurationRecord> {
    const correlationId = actor?.correlationId || `corr-biz-invoice-${Date.now()}`;
    logger.info("API", "Updating theatre invoice configuration", {
      correlationId,
      theatreId: input.theatreId,
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = UpdateTheatreInvoiceConfigurationSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid invoice configuration payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const data = parsed.data;

    const profile = await theatreBusinessRepository.findByTheatreId(data.theatreId);
    if (!profile) {
      throw new NotFoundError(
        `Business profile not found for theatre '${data.theatreId}'.`,
        correlationId
      );
    }

    const sanitizedInv: UpdateTheatreInvoiceConfigurationInput = {
      theatreId: data.theatreId,
      invoicePrefix: data.invoicePrefix,
      invoiceSequenceNext: data.invoiceSequenceNext,
      invoiceHeader: data.invoiceHeader ? stripHtml(sanitizeString(data.invoiceHeader)) : undefined,
      invoiceFooter:
        data.invoiceFooter !== undefined
          ? data.invoiceFooter
            ? stripHtml(sanitizeString(data.invoiceFooter))
            : null
          : undefined,
      invoiceNotes:
        data.invoiceNotes !== undefined
          ? data.invoiceNotes
            ? stripHtml(sanitizeString(data.invoiceNotes))
            : null
          : undefined,
      invoiceLogoUrl:
        data.invoiceLogoUrl !== undefined
          ? data.invoiceLogoUrl
            ? sanitizeUrl(data.invoiceLogoUrl)
            : null
          : undefined,
      enableEInvoice: data.enableEInvoice,
      enablePdfInvoice: data.enablePdfInvoice,
      enableCreditNotes: data.enableCreditNotes,
    };

    const updated = await theatreBusinessRepository.updateInvoiceConfiguration(
      data.theatreId,
      sanitizedInv,
      actor?.userId || "system"
    );

    this.invalidateBusinessCache(data.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_INVOICE_CONFIGURATION",
        action: "UPDATE",
        description: `Updated invoice configuration for theatre ${data.theatreId}`,
        metadata: {
          entityId: updated.id,
          theatreId: data.theatreId,
          invoicePrefix: updated.invoicePrefix,
          invoiceSequenceNext: updated.invoiceSequenceNext,
          enableEInvoice: updated.enableEInvoice,
        },
      });
    }

    return updated;
  }

  // ----------------------------------------------------------------------------
  // 6. VERIFY BUSINESS PROFILE (Super Admin Authority)
  // ----------------------------------------------------------------------------
  public async verifyBusinessProfile(
    input: VerifyTheatreBusinessProfileInput,
    actor?: SecurityActorContext
  ): Promise<TheatreBusinessComplianceRecord> {
    const correlationId = actor?.correlationId || `corr-biz-verify-${Date.now()}`;
    logger.info("API", "Processing theatre business compliance verification", {
      correlationId,
      theatreId: input.theatreId,
      metadata: {
        status: input.verificationStatus,
      },
    });

    // STRICT ROLE CHECK: Only SUPER_ADMIN can execute compliance transitions
    if (actor && actor.role !== "SUPER_ADMIN") {
      throw new AuthorizationError(
        "Only Super Administrators have authority to verify or reject theatre legal compliance profiles.",
        correlationId
      );
    }

    const parsed = VerifyTheatreBusinessProfileSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid compliance verification payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const data = parsed.data;

    const profile = await theatreBusinessRepository.findByTheatreId(data.theatreId);
    if (!profile) {
      throw new NotFoundError(
        `Business profile not found for theatre '${data.theatreId}'.`,
        correlationId
      );
    }

    const remarks = data.verificationRemarks
      ? stripHtml(sanitizeString(data.verificationRemarks))
      : null;

    const compliance = await theatreBusinessRepository.verifyBusinessProfile(
      data.theatreId,
      data.verificationStatus,
      remarks,
      data.riskScore || "LOW",
      actor?.userId || "usr-super-admin"
    );

    this.invalidateBusinessCache(data.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_BUSINESS_COMPLIANCE",
        action: "VERIFY",
        description: `Super Admin transitioned compliance status to ${compliance.verificationStatus}`,
        metadata: {
          entityId: compliance.id,
          theatreId: data.theatreId,
          verificationStatus: compliance.verificationStatus,
          riskScore: compliance.riskScore,
          remarks,
        },
      });
    }

    return compliance;
  }

  // ----------------------------------------------------------------------------
  // 7. ARCHIVE BUSINESS PROFILE
  // ----------------------------------------------------------------------------
  public async archiveBusinessProfile(
    input: ArchiveTheatreBusinessProfileInput,
    actor?: SecurityActorContext
  ): Promise<TheatreBusinessProfileRecord> {
    const correlationId = actor?.correlationId || `corr-biz-archive-${Date.now()}`;
    logger.info("API", "Archiving theatre business profile", {
      correlationId,
      theatreId: input.theatreId,
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = ArchiveTheatreBusinessProfileSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid archive payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const data = parsed.data;
    const reason = data.reason ? stripHtml(sanitizeString(data.reason)) : undefined;

    const archived = await theatreBusinessRepository.archiveBusinessProfile(
      data.theatreId,
      reason,
      actor?.userId || "system"
    );

    this.invalidateBusinessCache(data.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_BUSINESS",
        action: "ARCHIVE",
        description: `Archived business profile for theatre ${data.theatreId}`,
        metadata: {
          entityId: archived.id,
          theatreId: data.theatreId,
          reason,
        },
      });
    }

    return archived;
  }

  // ----------------------------------------------------------------------------
  // 8. DOCUMENT ATTACHMENT VAULT
  // ----------------------------------------------------------------------------
  public async addDocument(
    input: AddTheatreBusinessDocumentInput,
    actor?: SecurityActorContext
  ): Promise<TheatreBusinessDocumentRecord> {
    const correlationId = actor?.correlationId || `corr-biz-doc-add-${Date.now()}`;
    logger.info("API", "Attaching compliance document", {
      correlationId,
      theatreId: input.theatreId,
      metadata: {
        docType: input.documentType,
      },
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = AddTheatreBusinessDocumentSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid document attachment payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const data = parsed.data;

    const profile = await theatreBusinessRepository.findByTheatreId(data.theatreId);
    if (!profile) {
      throw new NotFoundError(
        `Business profile not found for theatre '${data.theatreId}'.`,
        correlationId
      );
    }

    const docRecord = await theatreBusinessRepository.addDocument(data.theatreId, {
      businessProfileId: profile.id,
      theatreId: data.theatreId,
      documentType: data.documentType,
      documentTitle: stripHtml(sanitizeString(data.documentTitle)),
      documentNumber: data.documentNumber ? stripHtml(sanitizeString(data.documentNumber)) : null,
      fileUrl: sanitizeUrl(data.fileUrl),
      fileSize: data.fileSize || null,
      mimeType: data.mimeType || "application/pdf",
      verificationStatus: "PENDING",
      expiryDate: data.expiryDate || null,
      displayOrder: data.displayOrder || 0,
    });

    this.invalidateBusinessCache(data.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_BUSINESS_DOCUMENT",
        action: "CREATE",
        description: `Attached document '${docRecord.documentTitle}'`,
        metadata: {
          entityId: docRecord.id,
          theatreId: data.theatreId,
          documentType: docRecord.documentType,
          documentTitle: docRecord.documentTitle,
        },
      });
    }

    return docRecord;
  }

  public async deleteDocument(
    input: DeleteTheatreBusinessDocumentInput,
    actor?: SecurityActorContext
  ): Promise<boolean> {
    const correlationId = actor?.correlationId || `corr-biz-doc-del-${Date.now()}`;
    logger.info("API", "Deleting compliance document", {
      correlationId,
      theatreId: input.theatreId,
      metadata: {
        documentId: input.documentId,
      },
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = DeleteTheatreBusinessDocumentSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid document deletion payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const data = parsed.data;

    const success = await theatreBusinessRepository.deleteDocument(data.theatreId, data.documentId);
    if (!success) {
      throw new NotFoundError(
        `Document with ID '${data.documentId}' not found for theatre '${data.theatreId}'.`,
        correlationId
      );
    }

    this.invalidateBusinessCache(data.theatreId);

    if (actor) {
      await securityAuditService.recordAudit({
        actor,
        module: "THEATRE_BUSINESS_DOCUMENT",
        action: "DELETE",
        description: `Deleted document ${data.documentId}`,
        metadata: {
          entityId: data.documentId,
          theatreId: data.theatreId,
        },
      });
    }

    return true;
  }

  // ----------------------------------------------------------------------------
  // 9. AUDIT VERSIONS & SEARCH
  // ----------------------------------------------------------------------------
  public async getVersions(
    theatreId: string,
    actor?: SecurityActorContext
  ): Promise<TheatreBusinessVersionRecord[]> {
    const correlationId = actor?.correlationId || `corr-biz-versions-${Date.now()}`;
    if (actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }
    return await theatreBusinessRepository.getVersions(theatreId);
  }

  public async searchBusinessProfiles(
    filters: SearchTheatreBusinessFilters,
    actor?: SecurityActorContext
  ): Promise<PaginatedResult<TheatreBusinessProfileRecord>> {
    const correlationId = actor?.correlationId || `corr-biz-search-${Date.now()}`;
    logger.info("API", "Executing multi-faceted business profile search", {
      correlationId,
      metadata: {
        filters: filters as unknown as Record<string, unknown>,
      },
    });

    // If theatreId is specified, assert access
    if (filters.theatreId && actor) {
      await tenantService.assertTenantAccess(actor, filters.theatreId);
    }

    const parsed = SearchTheatreBusinessFiltersSchema.safeParse(filters);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid business search filters.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    return await theatreBusinessRepository.searchProfiles(parsed.data);
  }
}

// Singleton Export
export const theatreBusinessService = new TheatreBusinessService();
