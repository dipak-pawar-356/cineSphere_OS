import {
  HallTemplateDefinition,
  TemplateRegistryItem,
  TemplateMetadataItem,
  TemplateConfiguration,
  HallTemplateCategory,
} from "@/types/hall-templates.types";
import { HallTemplateEngine } from "@/lib/engine/hall-template-engine";
import { TenantAccessError, NotFoundError } from "@/lib/errors/app-error";

/**
 * ==============================================================================
 * CineSphere OS — Hall Templates Repository (Phase 4 – Part 14)
 * ==============================================================================
 * Multi-tenant repository storing platform-wide built-in templates and
 * tenant-isolated custom templates, metadata, and per-theatre governance.
 * ==============================================================================
 */

export class HallTemplatesRepository {
  private static instance: HallTemplatesRepository | null = null;

  // In-memory multi-tenant storage
  private templates: Map<string, HallTemplateDefinition> = new Map();
  private registryItems: Map<string, TemplateRegistryItem> = new Map();
  private metadataItems: Map<string, TemplateMetadataItem> = new Map();
  private configurations: Map<string, TemplateConfiguration> = new Map();

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): HallTemplatesRepository {
    if (!HallTemplatesRepository.instance) {
      HallTemplatesRepository.instance = new HallTemplatesRepository();
    }
    return HallTemplatesRepository.instance;
  }

  // ----------------------------------------------------------------------------
  // 1. Template Definitions
  // ----------------------------------------------------------------------------

  public getTemplates(theatreId: string, category?: HallTemplateCategory): HallTemplateDefinition[] {
    return Array.from(this.templates.values())
      .filter((t) => {
        // Platform templates visible to all; theatre templates visible only to owning tenant
        const isVisible = t.isBuiltIn || t.theatreId === theatreId;
        const matchesCategory = category ? t.category === category : true;
        const isActive = t.status === "ACTIVE";
        return isVisible && matchesCategory && isActive;
      })
      .sort((a, b) => (b.isBuiltIn ? 1 : 0) - (a.isBuiltIn ? 1 : 0));
  }

  public getTemplateById(templateId: string, theatreId: string): HallTemplateDefinition | undefined {
    const template = this.templates.get(templateId);
    if (!template) return undefined;
    if (!template.isBuiltIn && template.theatreId !== theatreId) {
      throw new TenantAccessError(
        `Template '${templateId}' is restricted to theatre '${template.theatreId}'.`
      );
    }
    return template;
  }

  public saveTemplate(
    template: HallTemplateDefinition,
    actorId: string
  ): HallTemplateDefinition {
    this.templates.set(template.id, template);

    // Update Registry
    const registryItem: TemplateRegistryItem = {
      id: `reg-${template.id}`,
      templateId: template.id,
      theatreId: template.theatreId,
      name: template.name,
      code: template.code,
      templateType: template.isBuiltIn ? "BUILT_IN" : "CUSTOM",
      category: template.category,
      versionNumber: template.versionNumber,
      visibility: template.visibility,
      status: template.status,
      totalSeats: template.seats.length,
      totalSections: template.sections.length,
      totalStructuralObjects: template.structuralObjects.length,
      tags: [template.category],
      createdBy: actorId,
      updatedBy: actorId,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
    this.registryItems.set(template.id, registryItem);

    return template;
  }

  public archiveTemplate(templateId: string, theatreId: string, actorId: string): HallTemplateDefinition {
    const template = this.getTemplateById(templateId, theatreId);
    if (!template) {
      throw new NotFoundError(`Template '${templateId}' not found.`);
    }
    if (template.isBuiltIn) {
      throw new TenantAccessError(`Platform built-in templates cannot be archived.`);
    }

    template.status = "ARCHIVED";
    template.updatedAt = new Date().toISOString();

    const reg = this.registryItems.get(templateId);
    if (reg) {
      reg.status = "ARCHIVED";
      reg.updatedBy = actorId;
      reg.updatedAt = template.updatedAt;
    }

    return template;
  }

  // ----------------------------------------------------------------------------
  // 2. Registry & Metadata
  // ----------------------------------------------------------------------------

  public getRegistryItem(templateId: string): TemplateRegistryItem | undefined {
    return this.registryItems.get(templateId);
  }

  public getMetadata(templateId: string): TemplateMetadataItem | undefined {
    return this.metadataItems.get(templateId);
  }

  public saveMetadata(metadata: TemplateMetadataItem): TemplateMetadataItem {
    this.metadataItems.set(metadata.templateId, metadata);
    return metadata;
  }

  // ----------------------------------------------------------------------------
  // 3. Configurations
  // ----------------------------------------------------------------------------

  public getConfiguration(theatreId: string): TemplateConfiguration {
    const existing = this.configurations.get(theatreId);
    if (!existing) {
      const standard: TemplateConfiguration = {
        theatreId,
        allowCustomTemplates: true,
        maxCustomTemplates: 20,
        defaultBaseTemplateId: "tpl-built-in-multiplex",
        autoInheritPlatformUpdates: false,
        restrictedCategories: [],
        updatedAt: new Date().toISOString(),
      };
      this.configurations.set(theatreId, standard);
      return standard;
    }
    return existing;
  }

  public updateConfiguration(
    theatreId: string,
    updates: Partial<TemplateConfiguration>
  ): TemplateConfiguration {
    const current = this.getConfiguration(theatreId);
    const updated: TemplateConfiguration = {
      ...current,
      ...updates,
      theatreId,
      updatedAt: new Date().toISOString(),
    };
    this.configurations.set(theatreId, updated);
    return updated;
  }

  // ----------------------------------------------------------------------------
  // Initial Seed Data
  // ----------------------------------------------------------------------------

  private seedInitialData(): void {
    const builtIns = HallTemplateEngine.getBuiltInTemplates();
    const now = "2026-11-16T00:00:00Z";

    for (const t of builtIns) {
      this.templates.set(t.id, t);
      this.registryItems.set(t.id, {
        id: `reg-${t.id}`,
        templateId: t.id,
        theatreId: undefined,
        name: t.name,
        code: t.code,
        templateType: "BUILT_IN",
        category: t.category,
        versionNumber: t.versionNumber,
        visibility: "PLATFORM",
        status: "ACTIVE",
        totalSeats: t.seats.length,
        totalSections: t.sections.length,
        totalStructuralObjects: t.structuralObjects.length,
        tags: [t.category, "BUILT_IN"],
        createdBy: "system",
        updatedBy: "system",
        createdAt: now,
        updatedAt: now,
      });

      this.metadataItems.set(t.id, {
        id: `meta-${t.id}`,
        templateId: t.id,
        theatreId: undefined,
        tags: [t.category],
        recommendedAuditoriumTypes: [t.category],
        aspectRatio: t.category === "IMAX" ? "1.90:1" : "2.39:1",
        screenCurvatureSupported: t.category === "IMAX" || t.category === "PREMIUM",
        accessibilityTier: "ENHANCED",
        acousticRating: t.category === "IMAX" ? "THX_CERTIFIED" : "DOLBY_ATMOS_TUNED",
        authorNotes: "Certified Cinema Foundation Blueprint",
        createdAt: now,
        updatedAt: now,
      });
    }

    // Per-theatre governance seed
    this.configurations.set("th-pun-001", {
      theatreId: "th-pun-001",
      allowCustomTemplates: true,
      maxCustomTemplates: 30,
      defaultBaseTemplateId: "tpl-built-in-multiplex",
      autoInheritPlatformUpdates: true,
      restrictedCategories: [],
      updatedAt: now,
    });

    this.configurations.set("th-mum-002", {
      theatreId: "th-mum-002",
      allowCustomTemplates: true,
      maxCustomTemplates: 15,
      defaultBaseTemplateId: "tpl-built-in-imax",
      autoInheritPlatformUpdates: false,
      restrictedCategories: ["OPEN_AIR"],
      updatedAt: now,
    });

    this.configurations.set("th-dxb-003", {
      theatreId: "th-dxb-003",
      allowCustomTemplates: true,
      maxCustomTemplates: 50,
      defaultBaseTemplateId: "tpl-built-in-premium",
      autoInheritPlatformUpdates: true,
      restrictedCategories: [],
      updatedAt: now,
    });
  }
}

export const hallTemplatesRepository = HallTemplatesRepository.getInstance();
