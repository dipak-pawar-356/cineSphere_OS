import { createLogger } from "@/lib/observability/structured-logger";
import { securityAuditService } from "@/lib/services/security-audit.service";
import { tenantService } from "@/lib/services/tenant.service";
import { theatreContactRepository } from "@/lib/repositories/theatre-contact.repository";
import { theatreLifecycleRepository } from "@/lib/repositories/theatre-lifecycle.repository";
import { invalidateCacheByTag, CACHE_TAGS } from "@/lib/performance/cache-strategy";
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
  ConflictError,
  BusinessRuleError,
} from "@/lib/errors/app-error";
import { sanitizeString, sanitizeUrl, stripHtml } from "@/lib/security/input-sanitizer";
import {
  CreateTheatreContactSchema,
  UpdateTheatreContactSchema,
  UpdateTheatreWebsiteSchema,
  UpdateTheatreSocialLinksSchema,
  ReorderTheatreContactsSchema,
  DeleteTheatreContactSchema,
} from "@/lib/validation/theatre-contact.validation";
import type {
  TheatreContactRecord,
  TheatrePhoneRecord,
  TheatreEmailRecord,
  TheatreWebsiteRecord,
  TheatreContactSocialLinkRecord,
  TheatreEmergencyContactRecord,
  TheatreManagerContactRecord,
  TheatreContactWithDetails,
  TheatreContactFilterParams,
  TheatreContactDirectoryBundle,
  PublicTheatreContactDTO,
  PublicTheatreContactDirectoryBundle,
  CreateTheatreContactInput,
  UpdateTheatreContactInput,
  UpdateTheatreWebsiteInput,
  UpdateTheatreContactSocialLinksInput,
  ReorderTheatreContactsInput,
} from "@/types/theatre-contact.types";
import type { SecurityActorContext } from "@/types/security-hardening.types";
import type { ZodIssue } from "zod";

const logger = createLogger("TheatreContactService");

function formatZodIssues(issues: ZodIssue[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const issue of issues) {
    const path = issue.path.join(".") || "root";
    if (!result[path]) result[path] = [];
    result[path].push(issue.message);
  }
  return result;
}

export class TheatreContactService {
  private invalidateContactCache(theatreId: string, slug?: string | null): void {
    invalidateCacheByTag(CACHE_TAGS.THEATRE_CONTACTS(theatreId));
    invalidateCacheByTag(CACHE_TAGS.PUBLIC_THEATRE_CONTACTS(theatreId));
    if (slug) {
      invalidateCacheByTag(CACHE_TAGS.PUBLIC_THEATRE_CONTACTS(slug));
    }
  }

  // ----------------------------------------------------------------------------
  // 1. CREATE CONTACT RECORD
  // ----------------------------------------------------------------------------
  public async createContact(
    input: CreateTheatreContactInput,
    actor?: SecurityActorContext
  ): Promise<TheatreContactWithDetails> {
    const correlationId = actor?.correlationId || `corr-cnt-create-${Date.now()}`;
    logger.info("API", "Creating theatre contact record", {
      correlationId,
      theatreId: input.theatreId,
      metadata: {
        channelType: input.channelType,
        contactRole: input.contactRole,
      },
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = CreateTheatreContactSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid theatre contact payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const data = parsed.data;

    // Verify theatre exists
    const theatre = await theatreLifecycleRepository.findById(data.theatreId);
    if (!theatre) {
      throw new NotFoundError(`Theatre '${data.theatreId}' does not exist.`, correlationId);
    }

    // Channel specific validations
    if (data.channelType === "PHONE" && !data.phone) {
      throw new ValidationError("Phone number payload is required for PHONE contacts.", {}, correlationId);
    }
    if (data.channelType === "EMAIL" && !data.email) {
      throw new ValidationError("Email payload is required for EMAIL contacts.", {}, correlationId);
    }
    if (data.channelType === "WEBSITE" && !data.website) {
      throw new ValidationError("Website payload is required for WEBSITE contacts.", {}, correlationId);
    }
    if (data.channelType === "SOCIAL_LINK" && !data.socialLink) {
      throw new ValidationError("Social link payload is required for SOCIAL_LINK contacts.", {}, correlationId);
    }
    if (data.channelType === "EMERGENCY" && !data.emergencyContact) {
      throw new ValidationError("Emergency contact payload is required for EMERGENCY contacts.", {}, correlationId);
    }
    if (data.channelType === "MANAGER" && !data.managerContact) {
      throw new ValidationError("Duty manager contact payload is required for MANAGER contacts.", {}, correlationId);
    }

    // Single-Primary Enforcement: If this contact is marked primary, clear any existing primary for same channelType
    if (data.isPrimary) {
      await theatreContactRepository.clearPrimaryFlag(data.theatreId, data.channelType);
    }

    const contactId = `cnt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const contactRecord: TheatreContactRecord = {
      id: contactId,
      theatreId: data.theatreId,
      channelType: data.channelType,
      contactRole: data.contactRole,
      title: sanitizeString(data.title),
      description: data.description ? sanitizeString(stripHtml(data.description)) : null,
      isPrimary: Boolean(data.isPrimary),
      visibility: data.visibility,
      availabilityMode: data.availabilityMode,
      businessHours: data.businessHours ? sanitizeString(data.businessHours) : null,
      verificationStatus: actor?.role === "SUPER_ADMIN" ? "VERIFIED" : "UNVERIFIED",
      status: data.status,
      displayOrder: data.displayOrder ?? 1,
      entityType: data.entityType,
      entityId: data.entityId || data.theatreId,
      version: 1,
      createdBy: actor?.userId || "SYSTEM",
      updatedBy: actor?.userId || "SYSTEM",
      verifiedBy: actor?.role === "SUPER_ADMIN" ? actor.userId : null,
      verifiedAt: actor?.role === "SUPER_ADMIN" ? now : null,
      createdAt: now,
      updatedAt: now,
    };

    await theatreContactRepository.create(contactRecord);

    // Persist child channel details
    if (data.phone) {
      const phoneRecord: TheatrePhoneRecord = {
        id: `phn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        contactId,
        theatreId: data.theatreId,
        countryCode: data.phone.countryCode || "+91",
        phoneNumber: sanitizeString(data.phone.phoneNumber),
        extension: data.phone.extension ? sanitizeString(data.phone.extension) : null,
        phoneType: data.phone.phoneType || "MOBILE",
        isPrimary: Boolean(data.isPrimary),
        isSmsEnabled: Boolean(data.phone.isSmsEnabled),
        isWhatsappEnabled: Boolean(data.phone.isWhatsappEnabled),
        isVerified: actor?.role === "SUPER_ADMIN",
        verifiedAt: actor?.role === "SUPER_ADMIN" ? now : null,
        createdAt: now,
        updatedAt: now,
      };
      await theatreContactRepository.savePhone(phoneRecord);
    }

    if (data.email) {
      const emailRecord: TheatreEmailRecord = {
        id: `eml-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        contactId,
        theatreId: data.theatreId,
        email: data.email.email.trim().toLowerCase(),
        emailType: data.email.emailType || "SUPPORT",
        department: data.email.department ? sanitizeString(data.email.department) : null,
        isPrimary: Boolean(data.isPrimary),
        isVerified: actor?.role === "SUPER_ADMIN",
        verifiedAt: actor?.role === "SUPER_ADMIN" ? now : null,
        createdAt: now,
        updatedAt: now,
      };
      await theatreContactRepository.saveEmail(emailRecord);
    }

    if (data.website) {
      const websiteRecord: TheatreWebsiteRecord = {
        id: `web-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        contactId,
        theatreId: data.theatreId,
        url: sanitizeUrl(data.website.url),
        websiteType: data.website.websiteType || "OFFICIAL",
        title: data.website.title ? sanitizeString(data.website.title) : null,
        isPrimary: Boolean(data.isPrimary),
        isVerified: actor?.role === "SUPER_ADMIN",
        verifiedAt: actor?.role === "SUPER_ADMIN" ? now : null,
        createdAt: now,
        updatedAt: now,
      };
      await theatreContactRepository.saveWebsite(websiteRecord);
    }

    if (data.socialLink) {
      const socialRecord: TheatreContactSocialLinkRecord = {
        id: `soc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        contactId,
        theatreId: data.theatreId,
        platform: data.socialLink.platform,
        customPlatform: data.socialLink.customPlatform ? sanitizeString(data.socialLink.customPlatform) : null,
        url: sanitizeUrl(data.socialLink.url),
        handle: data.socialLink.handle ? sanitizeString(data.socialLink.handle) : null,
        displayOrder: data.displayOrder ?? 1,
        status: data.status,
        isVerified: actor?.role === "SUPER_ADMIN",
        createdAt: now,
        updatedAt: now,
      };
      await theatreContactRepository.saveSocialLink(socialRecord);
    }

    if (data.emergencyContact) {
      const emergencyRecord: TheatreEmergencyContactRecord = {
        id: `emg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        contactId,
        theatreId: data.theatreId,
        contactPersonName: sanitizeString(data.emergencyContact.contactPersonName),
        roleOrDesignation: sanitizeString(data.emergencyContact.roleOrDesignation),
        primaryPhone: sanitizeString(data.emergencyContact.primaryPhone),
        alternatePhone: data.emergencyContact.alternatePhone ? sanitizeString(data.emergencyContact.alternatePhone) : null,
        availabilityHours: sanitizeString(data.emergencyContact.availabilityHours || "24/7 Priority Emergency Line"),
        emergencyType: sanitizeString(data.emergencyContact.emergencyType || "MEDICAL_FIRE_SAFETY"),
        operatingProcedures: data.emergencyContact.operatingProcedures ? sanitizeString(data.emergencyContact.operatingProcedures) : null,
        createdAt: now,
        updatedAt: now,
      };
      await theatreContactRepository.saveEmergencyContact(emergencyRecord);
    }

    if (data.managerContact) {
      const managerRecord: TheatreManagerContactRecord = {
        id: `mgr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        contactId,
        theatreId: data.theatreId,
        managerName: sanitizeString(data.managerContact.managerName),
        designation: sanitizeString(data.managerContact.designation),
        phone: sanitizeString(data.managerContact.phone),
        email: data.managerContact.email.trim().toLowerCase(),
        department: sanitizeString(data.managerContact.department || "Operations"),
        shiftHours: data.managerContact.shiftHours ? sanitizeString(data.managerContact.shiftHours) : null,
        escalationTier: data.managerContact.escalationTier || 1,
        createdAt: now,
        updatedAt: now,
      };
      await theatreContactRepository.saveManagerContact(managerRecord);
    }

    // Immutable Version Ledger
    await theatreContactRepository.recordVersion({
      contactId,
      theatreId: data.theatreId,
      versionNumber: 1,
      changeType: "CONTACT_CREATED",
      changeSummary: `Created ${data.channelType} contact '${contactRecord.title}' (${data.contactRole})`,
      snapshot: contactRecord as unknown as Record<string, unknown>,
      changedBy: actor?.userId || "SYSTEM",
      changedRole: actor?.role || "THEATRE_ADMIN",
    });

    // Audit Event
    await securityAuditService.recordAudit({
      actor: actor || { userId: "SYSTEM", role: "THEATRE_ADMIN", permissions: [], correlationId },
      module: "THEATRE_CONTACT",
      action: "CREATE",
      description: `Created ${data.channelType} contact '${contactRecord.title}' for theatre '${theatre.name}'`,
      metadata: { theatreId: data.theatreId, contactId, channelType: data.channelType, contactRole: data.contactRole, isPrimary: data.isPrimary },
    });

    this.invalidateContactCache(data.theatreId, theatre.slug);

    const enriched = await theatreContactRepository.findWithDetails(contactId);
    return enriched!;
  }

  // ----------------------------------------------------------------------------
  // 2. UPDATE CONTACT RECORD
  // ----------------------------------------------------------------------------
  public async updateContact(
    input: UpdateTheatreContactInput,
    actor?: SecurityActorContext
  ): Promise<TheatreContactWithDetails> {
    const correlationId = actor?.correlationId || `corr-cnt-upd-${Date.now()}`;
    logger.info("API", "Updating theatre contact record", {
      correlationId,
      theatreId: input.theatreId,
      metadata: {
        contactId: input.contactId,
      },
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = UpdateTheatreContactSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid update payload for theatre contact.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const data = parsed.data;
    const current = await theatreContactRepository.findById(data.contactId);
    if (!current) {
      throw new NotFoundError(`Contact '${data.contactId}' does not exist.`, correlationId);
    }

    if (current.theatreId !== data.theatreId) {
      throw new AuthorizationError(
        "Cross-tenant violation: Contact does not belong to specified theatre.",
        correlationId
      );
    }

    // Single-Primary Enforcement
    if (data.isPrimary === true && !current.isPrimary) {
      await theatreContactRepository.clearPrimaryFlag(data.theatreId, current.channelType, data.contactId);
    }

    const updates: Partial<TheatreContactRecord> = {};
    if (data.title !== undefined) updates.title = sanitizeString(data.title);
    if (data.description !== undefined) updates.description = data.description ? sanitizeString(stripHtml(data.description)) : null;
    if (data.contactRole !== undefined) updates.contactRole = data.contactRole;
    if (data.isPrimary !== undefined) updates.isPrimary = Boolean(data.isPrimary);
    if (data.visibility !== undefined) updates.visibility = data.visibility;
    if (data.availabilityMode !== undefined) updates.availabilityMode = data.availabilityMode;
    if (data.businessHours !== undefined) updates.businessHours = data.businessHours ? sanitizeString(data.businessHours) : null;
    if (data.displayOrder !== undefined) updates.displayOrder = data.displayOrder;
    if (data.status !== undefined) updates.status = data.status;
    if (data.verificationStatus !== undefined && actor?.role === "SUPER_ADMIN") {
      updates.verificationStatus = data.verificationStatus;
      if (data.verificationStatus === "VERIFIED") {
        updates.verifiedBy = actor.userId;
        updates.verifiedAt = new Date().toISOString();
      }
    }
    updates.updatedBy = actor?.userId || "SYSTEM";

    let updatedContact: TheatreContactRecord;
    try {
      updatedContact = await theatreContactRepository.updateWithOptimisticLock({
        contactId: data.contactId,
        theatreId: data.theatreId,
        expectedVersion: data.expectedVersion,
        updates,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Optimistic lock collision")) {
        throw new ConflictError(msg, {
          entity: "TheatreContact",
          currentVersion: current.version,
          expectedVersion: data.expectedVersion,
          correlationId,
        });
      }
      throw err;
    }

    // Update child channel items if provided
    const now = new Date().toISOString();
    if (data.phone) {
      const currentPhone = theatreContactRepository.getPhone(data.contactId);
      if (currentPhone) {
        await theatreContactRepository.savePhone({
          ...currentPhone,
          countryCode: data.phone.countryCode || currentPhone.countryCode,
          phoneNumber: data.phone.phoneNumber ? sanitizeString(data.phone.phoneNumber) : currentPhone.phoneNumber,
          extension: data.phone.extension !== undefined ? (data.phone.extension ? sanitizeString(data.phone.extension) : null) : currentPhone.extension,
          phoneType: data.phone.phoneType || currentPhone.phoneType,
          isPrimary: data.isPrimary !== undefined ? Boolean(data.isPrimary) : currentPhone.isPrimary,
          isSmsEnabled: data.phone.isSmsEnabled !== undefined ? Boolean(data.phone.isSmsEnabled) : currentPhone.isSmsEnabled,
          isWhatsappEnabled: data.phone.isWhatsappEnabled !== undefined ? Boolean(data.phone.isWhatsappEnabled) : currentPhone.isWhatsappEnabled,
          updatedAt: now,
        });
      }
    }

    if (data.email) {
      const currentEmail = theatreContactRepository.getEmail(data.contactId);
      if (currentEmail) {
        await theatreContactRepository.saveEmail({
          ...currentEmail,
          email: data.email.email ? data.email.email.trim().toLowerCase() : currentEmail.email,
          emailType: data.email.emailType || currentEmail.emailType,
          department: data.email.department !== undefined ? (data.email.department ? sanitizeString(data.email.department) : null) : currentEmail.department,
          isPrimary: data.isPrimary !== undefined ? Boolean(data.isPrimary) : currentEmail.isPrimary,
          updatedAt: now,
        });
      }
    }

    if (data.website) {
      const currentWebsite = theatreContactRepository.getWebsite(data.contactId);
      if (currentWebsite) {
        await theatreContactRepository.saveWebsite({
          ...currentWebsite,
          url: data.website.url ? sanitizeUrl(data.website.url) : currentWebsite.url,
          websiteType: data.website.websiteType || currentWebsite.websiteType,
          title: data.website.title !== undefined ? (data.website.title ? sanitizeString(data.website.title) : null) : currentWebsite.title,
          isPrimary: data.isPrimary !== undefined ? Boolean(data.isPrimary) : currentWebsite.isPrimary,
          updatedAt: now,
        });
      }
    }

    if (data.emergencyContact) {
      const currentEmergency = (await theatreContactRepository.findWithDetails(data.contactId))?.emergencyContact;
      if (currentEmergency) {
        await theatreContactRepository.saveEmergencyContact({
          ...currentEmergency,
          contactPersonName: data.emergencyContact.contactPersonName ? sanitizeString(data.emergencyContact.contactPersonName) : currentEmergency.contactPersonName,
          roleOrDesignation: data.emergencyContact.roleOrDesignation ? sanitizeString(data.emergencyContact.roleOrDesignation) : currentEmergency.roleOrDesignation,
          primaryPhone: data.emergencyContact.primaryPhone ? sanitizeString(data.emergencyContact.primaryPhone) : currentEmergency.primaryPhone,
          alternatePhone: data.emergencyContact.alternatePhone !== undefined ? (data.emergencyContact.alternatePhone ? sanitizeString(data.emergencyContact.alternatePhone) : null) : currentEmergency.alternatePhone,
          availabilityHours: data.emergencyContact.availabilityHours ? sanitizeString(data.emergencyContact.availabilityHours) : currentEmergency.availabilityHours,
          emergencyType: data.emergencyContact.emergencyType ? sanitizeString(data.emergencyContact.emergencyType) : currentEmergency.emergencyType,
          operatingProcedures: data.emergencyContact.operatingProcedures !== undefined ? (data.emergencyContact.operatingProcedures ? sanitizeString(data.emergencyContact.operatingProcedures) : null) : currentEmergency.operatingProcedures,
          updatedAt: now,
        });
      }
    }

    if (data.managerContact) {
      const currentManager = (await theatreContactRepository.findWithDetails(data.contactId))?.managerContact;
      if (currentManager) {
        await theatreContactRepository.saveManagerContact({
          ...currentManager,
          managerName: data.managerContact.managerName ? sanitizeString(data.managerContact.managerName) : currentManager.managerName,
          designation: data.managerContact.designation ? sanitizeString(data.managerContact.designation) : currentManager.designation,
          phone: data.managerContact.phone ? sanitizeString(data.managerContact.phone) : currentManager.phone,
          email: data.managerContact.email ? data.managerContact.email.trim().toLowerCase() : currentManager.email,
          department: data.managerContact.department ? sanitizeString(data.managerContact.department) : currentManager.department,
          shiftHours: data.managerContact.shiftHours !== undefined ? (data.managerContact.shiftHours ? sanitizeString(data.managerContact.shiftHours) : null) : currentManager.shiftHours,
          escalationTier: data.managerContact.escalationTier || currentManager.escalationTier,
          updatedAt: now,
        });
      }
    }

    // Immutable Version Ledger
    await theatreContactRepository.recordVersion({
      contactId: data.contactId,
      theatreId: data.theatreId,
      versionNumber: updatedContact.version,
      changeType: "CONTACT_UPDATED",
      changeSummary: `Updated contact '${updatedContact.title}' to v${updatedContact.version}`,
      snapshot: updatedContact as unknown as Record<string, unknown>,
      changedBy: actor?.userId || "SYSTEM",
      changedRole: actor?.role || "THEATRE_ADMIN",
    });

    // Audit Event
    await securityAuditService.recordAudit({
      actor: actor || { userId: "SYSTEM", role: "THEATRE_ADMIN", permissions: [], correlationId },
      module: "THEATRE_CONTACT",
      action: "UPDATE",
      description: `Updated contact '${updatedContact.title}' for theatre '${data.theatreId}' to version v${updatedContact.version}`,
      metadata: { theatreId: data.theatreId, contactId: data.contactId, version: updatedContact.version },
    });

    const theatre = await theatreLifecycleRepository.findById(data.theatreId);
    this.invalidateContactCache(data.theatreId, theatre?.slug);

    const enriched = await theatreContactRepository.findWithDetails(data.contactId);
    return enriched!;
  }

  // ----------------------------------------------------------------------------
  // 3. DELETE / REMOVE CONTACT
  // ----------------------------------------------------------------------------
  public async deleteContact(
    contactId: string,
    theatreId: string,
    actor?: SecurityActorContext
  ): Promise<boolean> {
    const correlationId = actor?.correlationId || `corr-cnt-del-${Date.now()}`;
    logger.info("AUDIT", "Deleting theatre contact record", {
      correlationId,
      theatreId,
      metadata: {
        contactId,
      },
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }

    const current = await theatreContactRepository.findById(contactId);
    if (!current) {
      throw new NotFoundError(`Contact '${contactId}' does not exist.`, correlationId);
    }

    if (current.theatreId !== theatreId) {
      throw new AuthorizationError(
        "Cross-tenant violation: Contact does not belong to specified theatre.",
        correlationId
      );
    }

    await theatreContactRepository.recordVersion({
      contactId,
      theatreId,
      versionNumber: current.version + 1,
      changeType: "CONTACT_DELETED",
      changeSummary: `Deleted ${current.channelType} contact '${current.title}'`,
      snapshot: current as unknown as Record<string, unknown>,
      changedBy: actor?.userId || "SYSTEM",
      changedRole: actor?.role || "THEATRE_ADMIN",
    });

    const deleted = await theatreContactRepository.delete(contactId);

    await securityAuditService.recordAudit({
      actor: actor || { userId: "SYSTEM", role: "THEATRE_ADMIN", permissions: [], correlationId },
      module: "THEATRE_CONTACT",
      action: "DELETE",
      description: `Deleted contact '${current.title}' from theatre '${theatreId}'`,
      metadata: { theatreId, contactId, channelType: current.channelType },
    });

    const theatre = await theatreLifecycleRepository.findById(theatreId);
    this.invalidateContactCache(theatreId, theatre?.slug);

    return deleted;
  }

  // ----------------------------------------------------------------------------
  // 4. ARCHIVE CONTACT
  // ----------------------------------------------------------------------------
  public async archiveContact(
    contactId: string,
    theatreId: string,
    actor?: SecurityActorContext
  ): Promise<TheatreContactRecord> {
    return this.updateContact(
      {
        contactId,
        theatreId,
        status: "ARCHIVED",
        visibility: "HIDDEN",
      },
      actor
    );
  }

  // ----------------------------------------------------------------------------
  // 5. UPDATE OFFICIAL WEBSITE (Convenience Method)
  // ----------------------------------------------------------------------------
  public async updateWebsite(
    input: UpdateTheatreWebsiteInput,
    actor?: SecurityActorContext
  ): Promise<TheatreContactWithDetails> {
    const parsed = UpdateTheatreWebsiteSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid website payload.",
        formatZodIssues(parsed.error.issues),
        actor?.correlationId
      );
    }
    const data = parsed.data;

    if (actor) {
      await tenantService.assertTenantAccess(actor, data.theatreId);
    }

    // Check if website contact already exists
    const existing = await theatreContactRepository.findByTheatre(data.theatreId, {
      channelType: "WEBSITE",
    });

    if (existing.length > 0) {
      return this.updateContact(
        {
          contactId: existing[0].id,
          theatreId: data.theatreId,
          website: {
            url: data.url,
            title: data.title || existing[0].title,
            websiteType: data.websiteType,
            isPrimary: data.isPrimary,
          },
        },
        actor
      );
    } else {
      return this.createContact(
        {
          theatreId: data.theatreId,
          channelType: "WEBSITE",
          contactRole: "GENERAL_ENQUIRY",
          title: data.title || "Official Multiplex Website",
          isPrimary: data.isPrimary,
          website: {
            url: data.url,
            title: data.title || "Official Website",
            websiteType: data.websiteType,
          },
        },
        actor
      );
    }
  }

  // ----------------------------------------------------------------------------
  // 6. UPDATE SOCIAL LINKS DIRECTORY
  // ----------------------------------------------------------------------------
  public async updateSocialLinks(
    input: UpdateTheatreContactSocialLinksInput,
    actor?: SecurityActorContext
  ): Promise<TheatreContactWithDetails[]> {
    const parsed = UpdateTheatreSocialLinksSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid social links payload.",
        formatZodIssues(parsed.error.issues),
        actor?.correlationId
      );
    }
    const data = parsed.data;

    if (actor) {
      await tenantService.assertTenantAccess(actor, data.theatreId);
    }

    // Find existing social link contacts and update or create
    const existing = await theatreContactRepository.findByTheatre(data.theatreId, {
      channelType: "SOCIAL_LINK",
    });

    const results: TheatreContactWithDetails[] = [];

    for (const item of data.socialLinks) {
      const match = existing.find((e) => e.socialLink?.platform === item.platform);
      if (match) {
        const updated = await this.updateContact(
          {
            contactId: match.id,
            theatreId: data.theatreId,
            displayOrder: item.displayOrder,
            status: item.status,
            socialLink: {
              url: item.url,
              handle: item.handle,
              customPlatform: item.customPlatform,
              platform: item.platform,
            },
          },
          actor
        );
        results.push(updated);
      } else {
        const created = await this.createContact(
          {
            theatreId: data.theatreId,
            channelType: "SOCIAL_LINK",
            contactRole: "GENERAL_ENQUIRY",
            title: `Official ${item.platform} Presence`,
            displayOrder: item.displayOrder,
            status: item.status,
            socialLink: {
              platform: item.platform,
              url: item.url,
              handle: item.handle,
              customPlatform: item.customPlatform,
            },
          },
          actor
        );
        results.push(created);
      }
    }

    return results;
  }

  // ----------------------------------------------------------------------------
  // 7. REORDER CONTACTS
  // ----------------------------------------------------------------------------
  public async reorderContacts(
    input: ReorderTheatreContactsInput,
    actor?: SecurityActorContext
  ): Promise<TheatreContactRecord[]> {
    const correlationId = actor?.correlationId || `corr-cnt-reorder-${Date.now()}`;
    logger.info("API", "Reordering theatre contact directory", {
      correlationId,
      theatreId: input.theatreId,
      metadata: {
        count: input.orderedContactIds.length,
      },
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = ReorderTheatreContactsSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid reorder payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const reordered = await theatreContactRepository.reorderContacts(
      input.theatreId,
      input.orderedContactIds
    );

    await securityAuditService.recordAudit({
      actor: actor || { userId: "SYSTEM", role: "THEATRE_ADMIN", permissions: [], correlationId },
      module: "THEATRE_CONTACT",
      action: "UPDATE",
      description: `Reordered ${reordered.length} contacts for theatre '${input.theatreId}'`,
      metadata: { theatreId: input.theatreId, count: reordered.length },
    });

    const theatre = await theatreLifecycleRepository.findById(input.theatreId);
    this.invalidateContactCache(input.theatreId, theatre?.slug);

    return reordered;
  }

  // ----------------------------------------------------------------------------
  // 8. RETRIEVE CONTACTS (Tenant-Scoped Query)
  // ----------------------------------------------------------------------------
  public async getTheatreContacts(
    theatreId: string,
    filters?: TheatreContactFilterParams,
    actor?: SecurityActorContext
  ): Promise<TheatreContactWithDetails[]> {
    if (actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }
    return theatreContactRepository.findByTheatre(theatreId, filters);
  }

  // ----------------------------------------------------------------------------
  // 9. RETRIEVE DIRECTORY BUNDLE
  // ----------------------------------------------------------------------------
  public async getTheatreContactBundle(
    theatreId: string,
    actor?: SecurityActorContext
  ): Promise<TheatreContactDirectoryBundle> {
    if (actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }

    const contacts = await theatreContactRepository.findByTheatre(theatreId);
    const activeCount = contacts.filter((c) => c.status === "ACTIVE").length;
    const verifiedCount = contacts.filter((c) => c.verificationStatus === "VERIFIED").length;

    const primaryPhone = contacts.find((c) => c.channelType === "PHONE" && c.isPrimary) || null;
    const primaryEmail = contacts.find((c) => c.channelType === "EMAIL" && c.isPrimary) || null;
    const primaryWebsite = contacts.find((c) => c.channelType === "WEBSITE" && c.isPrimary) || null;

    return {
      theatreId,
      totalContacts: contacts.length,
      activeCount,
      verifiedCount,
      primaryPhone,
      primaryEmail,
      primaryWebsite,
      contacts,
    };
  }

  // ----------------------------------------------------------------------------
  // 10. PUBLIC PATRON PROJECTION
  // ----------------------------------------------------------------------------
  public async getPublicTheatreContacts(
    theatreIdOrSlug: string
  ): Promise<PublicTheatreContactDirectoryBundle | null> {
    // Resolve theatre tenant
    let theatre = await theatreLifecycleRepository.findById(theatreIdOrSlug);
    if (!theatre) {
      theatre = await theatreLifecycleRepository.findBySlug(theatreIdOrSlug);
    }
    if (!theatre || theatre.status !== "ACTIVE") {
      return null;
    }

    const allPublic = await theatreContactRepository.findPublicContacts(theatre.id);

    const primaryPhone = allPublic.find((c) => c.channelType === "PHONE" && c.isPrimary) || null;
    const supportEmail = allPublic.find((c) => c.channelType === "EMAIL" && c.isPrimary) || null;
    const officialWebsite = allPublic.find((c) => c.channelType === "WEBSITE" && c.isPrimary) || null;
    const emergencyDesk = allPublic.find((c) => c.channelType === "EMERGENCY") || null;
    const dutyManager = allPublic.find((c) => c.channelType === "MANAGER") || null;
    const socialLinks = allPublic.filter((c) => c.channelType === "SOCIAL_LINK");

    return {
      theatreId: theatre.id,
      theatreName: theatre.name,
      primaryPhone,
      supportEmail,
      officialWebsite,
      emergencyDesk,
      dutyManager,
      socialLinks,
      allPublicContacts: allPublic,
    };
  }
}

export const theatreContactService = new TheatreContactService();
