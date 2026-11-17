/**
 * ==============================================================================
 * CineSphere OS — Hall Templates Domain Types (Phase 4 – Part 14)
 * ==============================================================================
 * Reusable Hall Template Engine: Templates are blueprints that generate new
 * independent Layout Definitions. Modifying a generated layout never alters
 * the underlying template blueprint.
 * ==============================================================================
 */

import {
  HallSectionDefinition,
  SeatDefinition,
} from "./hall-designer.types";
import { StructuralObject } from "./structural-objects.types";

export interface TemplateCanvasSettings {
  width: number;
  height: number;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  showLabels: boolean;
  theme: "dark" | "light";
}

export interface TemplateGridConfig {
  rows: number;
  columns: number;
  seatWidth: number;
  seatHeight: number;
  seatSpacingX: number;
  seatSpacingY: number;
  rowSpacing: number;
  totalCapacity: number;
}

// ------------------------------------------------------------------------------
// 1. Template Categories & Classifications
// ------------------------------------------------------------------------------

export type HallTemplateCategory =
  | "SMALL_THEATRE"
  | "MULTIPLEX"
  | "PREMIUM"
  | "IMAX"
  | "4DX"
  | "OPEN_AIR"
  | "MINI_THEATRE"
  | "AUDITORIUM"
  | "CUSTOM";

export type TemplateVisibility = "PLATFORM" | "THEATRE";

export type TemplateStatus = "ACTIVE" | "ARCHIVED" | "DRAFT";

export type TemplateType = "BUILT_IN" | "CUSTOM";

// ------------------------------------------------------------------------------
// 2. Hall Template Definition Model
// ------------------------------------------------------------------------------

export interface HallTemplateDefinition {
  id: string;
  theatreId?: string;             // Undefined / null for platform-wide templates
  name: string;
  code: string;
  category: HallTemplateCategory;
  description: string;
  isBuiltIn: boolean;
  parentTemplateId?: string;       // For Template Inheritance
  versionNumber: number;
  canvasSettings: TemplateCanvasSettings;
  gridConfig: TemplateGridConfig;
  sections: HallSectionDefinition[];
  seats: SeatDefinition[];
  structuralObjects: StructuralObject[];
  validationRules?: Record<string, unknown>;
  defaultConfiguration?: Record<string, unknown>;
  status: TemplateStatus;
  visibility: TemplateVisibility;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// 3. Template Registry & Metadata Models
// ------------------------------------------------------------------------------

export interface TemplateRegistryItem {
  id: string;
  templateId: string;
  theatreId?: string;
  name: string;
  code: string;
  templateType: TemplateType;
  category: HallTemplateCategory;
  versionNumber: number;
  visibility: TemplateVisibility;
  status: TemplateStatus;
  totalSeats: number;
  totalSections: number;
  totalStructuralObjects: number;
  tags: string[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateMetadataItem {
  id: string;
  templateId: string;
  theatreId?: string;
  tags: string[];
  recommendedAuditoriumTypes: string[];
  aspectRatio: string;            // e.g. "2.39:1", "1.90:1", "16:9"
  screenCurvatureSupported: boolean;
  accessibilityTier: "STANDARD" | "ENHANCED" | "PREMIUM";
  acousticRating: "THX_CERTIFIED" | "DOLBY_ATMOS_TUNED" | "STANDARD";
  authorNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// 4. Per-Theatre Template Governance
// ------------------------------------------------------------------------------

export interface TemplateConfiguration {
  theatreId: string;
  allowCustomTemplates: boolean;
  maxCustomTemplates: number;     // e.g. 20 (Pune), 10 (Mumbai), unlimited (0)
  defaultBaseTemplateId?: string;
  autoInheritPlatformUpdates: boolean;
  restrictedCategories: HallTemplateCategory[];
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// 5. Payloads & Operation Models
// ------------------------------------------------------------------------------

export interface CreateTemplatePayload {
  theatreId?: string;
  name: string;
  code: string;
  category: HallTemplateCategory;
  description: string;
  parentTemplateId?: string;
  canvasSettings: TemplateCanvasSettings;
  gridConfig: TemplateGridConfig;
  sections: HallSectionDefinition[];
  seats: SeatDefinition[];
  structuralObjects: StructuralObject[];
  tags?: string[];
  metadata?: Partial<TemplateMetadataItem>;
}

export interface UpdateTemplatePayload {
  templateId: string;
  theatreId?: string;
  name?: string;
  description?: string;
  category?: HallTemplateCategory;
  canvasSettings?: Partial<TemplateCanvasSettings>;
  gridConfig?: Partial<TemplateGridConfig>;
  sections?: HallSectionDefinition[];
  seats?: SeatDefinition[];
  structuralObjects?: StructuralObject[];
  tags?: string[];
  metadata?: Partial<TemplateMetadataItem>;
}

export interface DuplicateTemplatePayload {
  sourceTemplateId: string;
  theatreId: string;
  newName: string;
  newCode: string;
  customNotes?: string;
}

export interface GenerateLayoutFromTemplatePayload {
  templateId: string;
  theatreId: string;
  targetHallId: string;
  layoutName: string;
  layoutDescription?: string;
}

export interface GenerateLayoutFromTemplateResult {
  success: boolean;
  layoutDefinitionId: string;
  layoutVersionId: string;
  hallId: string;
  theatreId: string;
  totalSeats: number;
  totalSections: number;
  totalStructuralObjects: number;
  sourceTemplateId: string;
  message: string;
}

// ------------------------------------------------------------------------------
// 6. Preview, Import/Export & Explicit Inheritance Sync Contracts
// ------------------------------------------------------------------------------

export interface TemplatePreviewResult {
  templateId: string;
  name: string;
  code: string;
  category: HallTemplateCategory;
  isBuiltIn: boolean;
  parentTemplateId?: string;
  versionNumber: number;
  canvasDimensions: { width: number; height: number; gridSize: number };
  totalSeats: number;
  totalSections: number;
  totalStructuralObjects: number;
  accessibleSeatsCount: number;
  seatBreakdownByType: Record<string, number>;
  sectionSummaries: Array<{
    id: string;
    name: string;
    seatType: string;
    seatCount: number;
    displayColor: string;
  }>;
  structuralObjectTypes: Record<string, number>;
}

export interface TemplateExportEnvelope {
  schemaVersion: "1.0";
  exportedAt: string;
  exportedBy: string;
  template: {
    name: string;
    code: string;
    category: HallTemplateCategory;
    description: string;
    versionNumber: number;
    canvasSettings: TemplateCanvasSettings;
    gridConfig: TemplateGridConfig;
    sections: HallSectionDefinition[];
    seats: SeatDefinition[];
    structuralObjects: StructuralObject[];
    validationRules?: Record<string, unknown>;
    defaultConfiguration?: Record<string, unknown>;
  };
  metadata?: Partial<TemplateMetadataItem>;
}

export interface ImportTemplatePayload {
  theatreId: string;
  envelope: TemplateExportEnvelope;
  overrideName?: string;
  overrideCode?: string;
}

export interface SyncInheritedTemplatePayload {
  templateId: string;
  theatreId: string;
  preserveCanvasOverrides?: boolean;
  preserveSectionColors?: boolean;
}

export interface SyncInheritedTemplateResult {
  template: HallTemplateDefinition;
  parentTemplateId: string;
  parentVersionNumber: number;
  newVersionNumber: number;
  preservedOverrides: string[];
  syncedAt: string;
}
