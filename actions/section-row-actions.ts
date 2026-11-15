"use server";

import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { sectionRowDesignerService } from "@/lib/services/section-row-designer.service";
import {
  CreateSectionSchema,
  GetSectionSchema,
  ListSectionsSchema,
  UpdateSectionSchema,
  DeleteSectionSchema,
  DuplicateSectionSchema,
  ReorderSectionsSchema,
  ValidateSectionsSchema,
  CreateRowSchema,
  GetRowSchema,
  ListRowsSchema,
  UpdateRowSchema,
  DeleteRowSchema,
  DuplicateRowSchema,
  ReorderRowsSchema,
  ValidateRowsSchema,
} from "@/lib/validation/section-row.validation";
import {
  HallSection,
  HallRow,
  SectionValidationResult,
  RowValidationResult,
} from "@/types/section-row-designer.types";

/**
 * ==============================================================================
 * CineSphere OS — Section & Row Designer Server Actions (Phase 4 – Parts 3 & 4)
 * ==============================================================================
 * Protected server actions enforcing multi-tenant isolation, role-based access
 * control, rate limiting, and audit trail for:
 * 1. Part 3: Section Designer (Geometry, Priority, Labels, Ordering, Capacity)
 * 2. Part 4: Row Designer (Geometry, Numbering Strategy, Spacing, Accessibility)
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Section Designer Actions (Part 3)
// ------------------------------------------------------------------------------

export const createSectionAction = createProtectedAction<
  z.input<typeof CreateSectionSchema>,
  HallSection
>(
  {
    actionName: "createSectionAction",
    schema: CreateSectionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SECTION_DESIGNER",
    auditAction: "CREATE_SECTION",
  },
  async (input, context) => {
    return sectionRowDesignerService.createSection(
      context.actor,
      input as unknown as Omit<HallSection, "id" | "rows" | "createdAt" | "updatedAt">
    );
  }
);

export const getSectionAction = createProtectedAction<
  z.input<typeof GetSectionSchema>,
  HallSection
>(
  {
    actionName: "getSectionAction",
    schema: GetSectionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SECTION_DESIGNER",
    auditAction: "GET_SECTION",
  },
  async (input, context) => {
    return sectionRowDesignerService.getSection(
      context.actor,
      input.sectionId,
      input.theatreId
    );
  }
);

export const listSectionsAction = createProtectedAction<
  z.input<typeof ListSectionsSchema>,
  HallSection[]
>(
  {
    actionName: "listSectionsAction",
    schema: ListSectionsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SECTION_DESIGNER",
    auditAction: "LIST_SECTIONS",
  },
  async (input, context) => {
    return sectionRowDesignerService.listSections(
      context.actor,
      input.layoutVersionId,
      input.theatreId
    );
  }
);

export const updateSectionAction = createProtectedAction<
  z.input<typeof UpdateSectionSchema>,
  HallSection
>(
  {
    actionName: "updateSectionAction",
    schema: UpdateSectionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SECTION_DESIGNER",
    auditAction: "UPDATE_SECTION",
  },
  async (input, context) => {
    return sectionRowDesignerService.updateSection(
      context.actor,
      input.sectionId,
      input.updates as unknown as Partial<Omit<HallSection, "id" | "layoutVersionId" | "theatreId" | "rows">>,
      input.theatreId
    );
  }
);

export const deleteSectionAction = createProtectedAction<
  z.input<typeof DeleteSectionSchema>,
  boolean
>(
  {
    actionName: "deleteSectionAction",
    schema: DeleteSectionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SECTION_DESIGNER",
    auditAction: "DELETE_SECTION",
  },
  async (input, context) => {
    return sectionRowDesignerService.deleteSection(
      context.actor,
      input.sectionId,
      input.theatreId
    );
  }
);

export const duplicateSectionAction = createProtectedAction<
  z.input<typeof DuplicateSectionSchema>,
  HallSection
>(
  {
    actionName: "duplicateSectionAction",
    schema: DuplicateSectionSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SECTION_DESIGNER",
    auditAction: "DUPLICATE_SECTION",
  },
  async (input, context) => {
    return sectionRowDesignerService.duplicateSection(
      context.actor,
      input.sectionId,
      input.theatreId
    );
  }
);

export const reorderSectionsAction = createProtectedAction<
  z.input<typeof ReorderSectionsSchema>,
  HallSection[]
>(
  {
    actionName: "reorderSectionsAction",
    schema: ReorderSectionsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SECTION_DESIGNER",
    auditAction: "REORDER_SECTIONS",
  },
  async (input, context) => {
    return sectionRowDesignerService.reorderSections(
      context.actor,
      input.layoutVersionId,
      input.sectionId,
      input.direction,
      input.theatreId
    );
  }
);

export const validateSectionsAction = createProtectedAction<
  z.input<typeof ValidateSectionsSchema>,
  SectionValidationResult
>(
  {
    actionName: "validateSectionsAction",
    schema: ValidateSectionsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SECTION_DESIGNER",
    auditAction: "VALIDATE_SECTIONS",
  },
  async (input, context) => {
    return sectionRowDesignerService.validateSections(
      context.actor,
      input.layoutVersionId,
      input.theatreId
    );
  }
);

// ------------------------------------------------------------------------------
// 2. Row Designer Actions (Part 4)
// ------------------------------------------------------------------------------

export const createRowAction = createProtectedAction<
  z.input<typeof CreateRowSchema>,
  HallRow
>(
  {
    actionName: "createRowAction",
    schema: CreateRowSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ROW_DESIGNER",
    auditAction: "CREATE_ROW",
  },
  async (input, context) => {
    return sectionRowDesignerService.createRow(
      context.actor,
      input as unknown as Omit<HallRow, "id" | "seats" | "createdAt" | "updatedAt">
    );
  }
);

export const getRowAction = createProtectedAction<
  z.input<typeof GetRowSchema>,
  HallRow
>(
  {
    actionName: "getRowAction",
    schema: GetRowSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ROW_DESIGNER",
    auditAction: "GET_ROW",
  },
  async (input, context) => {
    return sectionRowDesignerService.getRow(
      context.actor,
      input.rowId,
      input.theatreId
    );
  }
);

export const listRowsAction = createProtectedAction<
  z.input<typeof ListRowsSchema>,
  HallRow[]
>(
  {
    actionName: "listRowsAction",
    schema: ListRowsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ROW_DESIGNER",
    auditAction: "LIST_ROWS",
  },
  async (input, context) => {
    return sectionRowDesignerService.listRows(
      context.actor,
      input.sectionId,
      input.theatreId
    );
  }
);

export const updateRowAction = createProtectedAction<
  z.input<typeof UpdateRowSchema>,
  HallRow
>(
  {
    actionName: "updateRowAction",
    schema: UpdateRowSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ROW_DESIGNER",
    auditAction: "UPDATE_ROW",
  },
  async (input, context) => {
    return sectionRowDesignerService.updateRow(
      context.actor,
      input.rowId,
      input.updates as unknown as Partial<Omit<HallRow, "id" | "sectionId" | "theatreId">>,
      input.theatreId
    );
  }
);

export const deleteRowAction = createProtectedAction<
  z.input<typeof DeleteRowSchema>,
  boolean
>(
  {
    actionName: "deleteRowAction",
    schema: DeleteRowSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ROW_DESIGNER",
    auditAction: "DELETE_ROW",
  },
  async (input, context) => {
    return sectionRowDesignerService.deleteRow(
      context.actor,
      input.rowId,
      input.theatreId
    );
  }
);

export const duplicateRowAction = createProtectedAction<
  z.input<typeof DuplicateRowSchema>,
  HallRow
>(
  {
    actionName: "duplicateRowAction",
    schema: DuplicateRowSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ROW_DESIGNER",
    auditAction: "DUPLICATE_ROW",
  },
  async (input, context) => {
    return sectionRowDesignerService.duplicateRow(
      context.actor,
      input.rowId,
      input.theatreId
    );
  }
);

export const reorderRowsAction = createProtectedAction<
  z.input<typeof ReorderRowsSchema>,
  HallRow[]
>(
  {
    actionName: "reorderRowsAction",
    schema: ReorderRowsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ROW_DESIGNER",
    auditAction: "REORDER_ROWS",
  },
  async (input, context) => {
    return sectionRowDesignerService.reorderRows(
      context.actor,
      input.sectionId,
      input.rowId,
      input.direction,
      input.theatreId
    );
  }
);

export const validateRowsAction = createProtectedAction<
  z.input<typeof ValidateRowsSchema>,
  RowValidationResult
>(
  {
    actionName: "validateRowsAction",
    schema: ValidateRowsSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ROW_DESIGNER",
    auditAction: "VALIDATE_ROWS",
  },
  async (input, context) => {
    return sectionRowDesignerService.validateRows(
      context.actor,
      input.sectionId,
      input.theatreId
    );
  }
);

// Semantic aliases
export const loadSectionsAction = listSectionsAction;
export const loadRowsAction = listRowsAction;
