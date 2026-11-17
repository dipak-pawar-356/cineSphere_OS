import { SecurityActorContext } from "@/types/security-hardening.types";
import {
  HallTemplateDefinition,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  DuplicateTemplatePayload,
  GenerateLayoutFromTemplatePayload,
  GenerateLayoutFromTemplateResult,
  TemplateConfiguration,
  HallTemplateCategory,
} from "@/types/hall-templates.types";
import { HallTemplatesRepository } from "@/lib/repositories/hall-templates.repository";
import { HallDesignerRepository } from "@/lib/repositories/hall-designer.repository";
import { structuralObjectRepository } from "@/lib/repositories/structural-object.repository";
import { HallTemplateEngine } from "@/lib/engine/hall-template-engine";
import { securityAuditService } from "@/lib/services/security-audit.service";
import {
  TenantAccessError,
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from "@/lib/errors/app-error";

/**
 * ==============================================================================
 * CineSphere OS — Hall Templates Domain Service (Phase 4 – Part 14)
 * ==============================================================================
 * Reusable Hall Template Engine service: Templates are blueprints that generate
 * new independent Layout Definitions. Modifying a generated layout never alters
 * the underlying template blueprint.
 * ==============================================================================
 */

export class HallTemplatesService {
  private static instance: HallTemplatesService | null = null;
  private templateRepo = HallTemplatesRepository.getInstance();
  private designerRepo = HallDesignerRepository.getInstance();
  private structuralRepo = structuralObjectRepository;
  private auditService = securityAuditService;

  private constructor() {}

  public static getInstance(): HallTemplatesService {
    if (!HallTemplatesService.instance) {
      HallTemplatesService.instance = new HallTemplatesService();
    }
    return HallTemplatesService.instance;
  }

  // ----------------------------------------------------------------------------
  // 1. Template Catalog & Queries
  // ----------------------------------------------------------------------------

  public async getTemplates(
    actor: SecurityActorContext,
    theatreId: string,
    category?: HallTemplateCategory
  ): Promise<HallTemplateDefinition[]> {
    this.assertTenantAccess(actor, theatreId);
    return this.templateRepo.getTemplates(theatreId, category);
  }

  public async getTemplateById(
    actor: SecurityActorContext,
    templateId: string,
    theatreId: string
  ): Promise<HallTemplateDefinition> {
    this.assertTenantAccess(actor, theatreId);
    const template = this.templateRepo.getTemplateById(templateId, theatreId);
    if (!template) {
      throw new NotFoundError(`Template '${templateId}' not found.`);
    }
    return template;
  }

  // ----------------------------------------------------------------------------
  // 2. Custom Template Authoring & Duplication
  // ----------------------------------------------------------------------------

  public async createTemplate(
    actor: SecurityActorContext,
    payload: CreateTemplatePayload
  ): Promise<HallTemplateDefinition> {
    const theatreId = payload.theatreId || actor.theatreId;
    if (!theatreId) {
      throw new ValidationError("Theatre ID is required to create a custom template.");
    }
    this.assertTenantAccess(actor, theatreId);
    this.assertAdminRole(actor);

    const config = this.templateRepo.getConfiguration(theatreId);
    if (!config.allowCustomTemplates) {
      throw new ValidationError(`Custom template creation is disabled by theatre policy for '${theatreId}'.`);
    }

    const existingTemplates = this.templateRepo.getTemplates(theatreId);
    const tenantTemplates = existingTemplates.filter((t) => !t.isBuiltIn && t.theatreId === theatreId);
    if (config.maxCustomTemplates > 0 && tenantTemplates.length >= config.maxCustomTemplates) {
      throw new ValidationError(
        `Template limit reached: Theatre '${theatreId}' can create at most ${config.maxCustomTemplates} custom templates.`
      );
    }

    const now = new Date().toISOString();
    const templateId = `tpl-${theatreId}-${payload.code.toLowerCase()}-${Date.now().toString(36)}`;

    let baseDefinition: HallTemplateDefinition = {
      id: templateId,
      theatreId,
      name: payload.name,
      code: payload.code,
      category: payload.category,
      description: payload.description,
      isBuiltIn: false,
      parentTemplateId: payload.parentTemplateId,
      versionNumber: 1,
      canvasSettings: payload.canvasSettings,
      gridConfig: payload.gridConfig,
      sections: payload.sections,
      seats: payload.seats,
      structuralObjects: payload.structuralObjects,
      status: "ACTIVE",
      visibility: "THEATRE",
      createdAt: now,
      updatedAt: now,
    };

    // Apply template inheritance if parent is specified
    if (payload.parentTemplateId) {
      const parent = this.templateRepo.getTemplateById(payload.parentTemplateId, theatreId);
      if (parent) {
        baseDefinition = HallTemplateEngine.applyTemplateInheritance(parent, payload);
      }
    }

    const saved = this.templateRepo.saveTemplate(baseDefinition, actor.userId);

    await this.auditService.recordAudit({
      actor,
      module: "HALL_TEMPLATES",
      action: "CREATE_TEMPLATE",
      description: `Created custom hall template '${saved.name}' (${saved.code})`,
      metadata: { templateId: saved.id, theatreId, category: saved.category },
    });

    return saved;
  }

  public async updateTemplate(
    actor: SecurityActorContext,
    payload: UpdateTemplatePayload
  ): Promise<HallTemplateDefinition> {
    const { templateId } = payload;
    const theatreId = payload.theatreId || actor.theatreId;
    if (!theatreId) throw new ValidationError("Theatre ID is required.");
    this.assertTenantAccess(actor, theatreId);
    this.assertAdminRole(actor);

    const existing = this.templateRepo.getTemplateById(templateId, theatreId);
    if (!existing) {
      throw new NotFoundError(`Template '${templateId}' not found.`);
    }

    if (existing.isBuiltIn) {
      throw new TenantAccessError(
        `Immutable Platform Template: Built-in template '${existing.name}' cannot be modified. Duplicate it as a custom template to make changes.`
      );
    }

    const updated: HallTemplateDefinition = {
      ...existing,
      name: payload.name ?? existing.name,
      description: payload.description ?? existing.description,
      category: payload.category ?? existing.category,
      canvasSettings: payload.canvasSettings
        ? { ...existing.canvasSettings, ...payload.canvasSettings }
        : existing.canvasSettings,
      gridConfig: payload.gridConfig
        ? { ...existing.gridConfig, ...payload.gridConfig }
        : existing.gridConfig,
      sections: payload.sections ?? existing.sections,
      seats: payload.seats ?? existing.seats,
      structuralObjects: payload.structuralObjects ?? existing.structuralObjects,
      versionNumber: existing.versionNumber + 1,
      updatedAt: new Date().toISOString(),
    };

    const saved = this.templateRepo.saveTemplate(updated, actor.userId);

    await this.auditService.recordAudit({
      actor,
      module: "HALL_TEMPLATES",
      action: "UPDATE_TEMPLATE",
      description: `Updated custom hall template '${saved.name}' to v${saved.versionNumber}`,
      metadata: { templateId: saved.id, versionNumber: saved.versionNumber },
    });

    return saved;
  }

  public async duplicateTemplate(
    actor: SecurityActorContext,
    payload: DuplicateTemplatePayload
  ): Promise<HallTemplateDefinition> {
    const { sourceTemplateId, theatreId, newName, newCode, customNotes } = payload;
    this.assertTenantAccess(actor, theatreId);
    this.assertAdminRole(actor);

    const source = this.templateRepo.getTemplateById(sourceTemplateId, theatreId);
    if (!source) {
      throw new NotFoundError(`Source template '${sourceTemplateId}' not found.`);
    }

    const now = new Date().toISOString();
    const newId = `tpl-${theatreId}-${newCode.toLowerCase()}-${Date.now().toString(36)}`;

    const duplicated: HallTemplateDefinition = {
      ...source,
      id: newId,
      theatreId,
      name: newName,
      code: newCode,
      description: customNotes || `Duplicated from '${source.name}'`,
      isBuiltIn: false,
      parentTemplateId: source.id,
      versionNumber: 1,
      visibility: "THEATRE",
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    };

    const saved = this.templateRepo.saveTemplate(duplicated, actor.userId);

    await this.auditService.recordAudit({
      actor,
      module: "HALL_TEMPLATES",
      action: "DUPLICATE_TEMPLATE",
      description: `Duplicated template '${source.name}' into new custom template '${saved.name}'`,
      metadata: { sourceTemplateId: source.id, newTemplateId: saved.id },
    });

    return saved;
  }

  public async archiveTemplate(
    actor: SecurityActorContext,
    templateId: string,
    theatreId: string
  ): Promise<HallTemplateDefinition> {
    this.assertTenantAccess(actor, theatreId);
    this.assertAdminRole(actor);

    const archived = this.templateRepo.archiveTemplate(templateId, theatreId, actor.userId);

    await this.auditService.recordAudit({
      actor,
      module: "HALL_TEMPLATES",
      action: "ARCHIVE_TEMPLATE",
      description: `Archived custom template '${archived.name}'`,
      metadata: { templateId },
    });

    return archived;
  }

  // ----------------------------------------------------------------------------
  // 3. Blueprint Layout Generation (Instantiate Layout Definition)
  // ----------------------------------------------------------------------------

  public async generateLayoutFromTemplate(
    actor: SecurityActorContext,
    payload: GenerateLayoutFromTemplatePayload
  ): Promise<GenerateLayoutFromTemplateResult> {
    const { templateId, theatreId, targetHallId, layoutName, layoutDescription } = payload;
    this.assertTenantAccess(actor, theatreId);

    const template = this.templateRepo.getTemplateById(templateId, theatreId);
    if (!template) {
      throw new NotFoundError(`Template '${templateId}' not found.`);
    }

    // 1. Create a fresh LayoutDefinition in the Hall Designer repository
    const definition = this.designerRepo.createLayoutDefinition(
      {
        theatreId,
        hallId: targetHallId,
        name: layoutName,
        description: layoutDescription || `Generated from template '${template.name}'`,
      },
      actor
    );

    const versionId = definition.activeDraftVersionId!;

    // 2. Map template sections and seats with fresh isolated IDs
    const sections = template.sections.map((s, idx) => ({
      ...s,
      id: `sec-${definition.id}-${idx + 1}`,
    }));

    const sectionIdOldToNew = new Map<string, string>();
    template.sections.forEach((s, idx) => {
      sectionIdOldToNew.set(s.id, sections[idx].id);
    });

    const seats = template.seats.map((seat, idx) => ({
      ...seat,
      id: `seat-${versionId}-${idx + 1}`,
      sectionId: sectionIdOldToNew.get(seat.sectionId) || sections[0].id,
    }));

    const updatedVer = this.designerRepo.updateDraftLayout(
      versionId,
      theatreId,
      {
        sections,
        seats,
        gridConfig: { ...template.gridConfig },
        versionNotes: `Generated from template '${template.name}' (${template.code})`,
      },
      actor
    );

    // 3. Persist Structural Objects for this layout version
    let structCount = 0;
    for (const obj of template.structuralObjects) {
      const code = `${obj.internalCode || "STR"}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      await this.structuralRepo.create(theatreId, {
        layoutVersionId: versionId,
        objectName: obj.objectName || obj.displayName,
        displayName: obj.displayName,
        objectType: obj.objectType,
        internalCode: code,
        position: obj.position || { x: 100, y: 100 },
        width: obj.width || 200,
        height: obj.height || 40,
        rotation: obj.rotation || 0,
        layer: obj.layer || 1,
        zIndex: obj.zIndex || 10,
        visibility: obj.visibility || "ALL",
        color: obj.color || "#38BDF8",
        isLocked: false,
        metadata: obj.metadata || {
          isStatic: true,
          isCollisionObstacle: obj.objectType !== "SCREEN" && obj.objectType !== "EMERGENCY_EXIT",
          isReservedArea: false,
        },
        geometry: obj.geometry || { shape: "RECTANGLE" },
      });
      structCount++;
    }

    // 4. Record Audit Log
    await this.auditService.recordAudit({
      actor,
      module: "HALL_TEMPLATES",
      action: "GENERATE_LAYOUT",
      description: `Generated layout definition '${definition.name}' (${definition.id}) from template '${template.name}'`,
      metadata: {
        templateId: template.id,
        layoutDefinitionId: definition.id,
        versionId,
        hallId: targetHallId,
      },
    });

    return {
      success: true,
      layoutDefinitionId: definition.id,
      layoutVersionId: versionId,
      hallId: targetHallId,
      theatreId,
      totalSeats: updatedVer.seats.length,
      totalSections: updatedVer.sections.length,
      totalStructuralObjects: structCount,
      sourceTemplateId: template.id,
      message: `Layout '${definition.name}' successfully generated from template '${template.name}'. Modifications to this layout will not affect the template.`,
    };
  }

  // ----------------------------------------------------------------------------
  // 4. Per-Theatre Template Governance Configurations
  // ----------------------------------------------------------------------------

  public async getConfiguration(
    actor: SecurityActorContext,
    theatreId: string
  ): Promise<TemplateConfiguration> {
    this.assertTenantAccess(actor, theatreId);
    return this.templateRepo.getConfiguration(theatreId);
  }

  public async updateConfiguration(
    actor: SecurityActorContext,
    theatreId: string,
    updates: Partial<TemplateConfiguration>
  ): Promise<TemplateConfiguration> {
    this.assertTenantAccess(actor, theatreId);
    this.assertAdminRole(actor);

    const updated = this.templateRepo.updateConfiguration(theatreId, updates);

    await this.auditService.recordAudit({
      actor,
      module: "HALL_TEMPLATES",
      action: "UPDATE_CONFIG",
      description: `Updated hall template configuration for theatre '${theatreId}'`,
      metadata: { theatreId },
    });

    return updated;
  }

  // ----------------------------------------------------------------------------
  // Security Checks
  // ----------------------------------------------------------------------------

  private assertTenantAccess(actor: SecurityActorContext, theatreId: string): void {
    if (actor.role === "SUPER_ADMIN") return;
    if (actor.theatreId !== theatreId) {
      throw new TenantAccessError(
        `Security Violation: User '${actor.userId}' cannot access templates for theatre '${theatreId}'.`
      );
    }
  }

  private assertAdminRole(actor: SecurityActorContext): void {
    if (actor.role !== "SUPER_ADMIN" && actor.role !== "THEATRE_ADMIN" && actor.role !== "HALL_MANAGER") {
      throw new AuthorizationError(
        `Action forbidden: Only administrators or hall managers can manage hall templates.`
      );
    }
  }
}

export const hallTemplatesService = HallTemplatesService.getInstance();
