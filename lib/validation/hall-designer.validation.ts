/**
 * ==============================================================================
 * CineSphere OS — Hall Designer Validation Schemas (Phase 4 – Parts 1 & 2)
 * ==============================================================================
 * Zod validation schemas for Layout Definitions, Layout Versions, validation
 * triggers, publishing operations, and Canvas Preferences.
 * ==============================================================================
 */

import { z } from "zod";

// ------------------------------------------------------------------------------
// 1. Layout Definition Schemas
// ------------------------------------------------------------------------------

export const CreateLayoutDefinitionSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  hallId: z.string().min(1, "Hall ID is required"),
  name: z.string().min(1, "Layout name is required").max(100),
  description: z.string().max(500).optional(),
});

export const GetLayoutDefinitionSchema = z.object({
  theatreId: z.string().optional(),
  layoutDefinitionId: z.string().min(1, "Layout Definition ID is required"),
});

export const ListLayoutDefinitionsSchema = z.object({
  theatreId: z.string().optional(),
  hallId: z.string().optional(),
});

export const GetLayoutVersionSchema = z.object({
  theatreId: z.string().optional(),
  versionId: z.string().min(1, "Version ID is required"),
});

export const ListLayoutVersionsSchema = z.object({
  theatreId: z.string().optional(),
  layoutDefinitionId: z.string().min(1, "Layout Definition ID is required"),
});

// ------------------------------------------------------------------------------
// 2. Draft & Version Management Schemas
// ------------------------------------------------------------------------------

export const CreateDraftVersionSchema = z.object({
  theatreId: z.string().optional(),
  layoutDefinitionId: z.string().min(1, "Layout Definition ID is required"),
  notes: z.string().max(500).default("New draft version"),
});

export const UpdateDraftLayoutSchema = z.object({
  theatreId: z.string().optional(),
  versionId: z.string().min(1, "Version ID is required"),
  payload: z.object({
    sections: z.array(z.any()).optional(),
    seats: z.array(z.any()).optional(),
    walkways: z.array(z.any()).optional(),
    emergencyExits: z.array(z.any()).optional(),
    gridConfig: z
      .object({
        rows: z.number().int().min(1).max(100),
        columns: z.number().int().min(1).max(100),
        totalCapacity: z.number().int().min(0),
      })
      .optional(),
    versionNotes: z.string().max(500).optional(),
  }),
});

export const ValidateLayoutVersionSchema = z.object({
  theatreId: z.string().optional(),
  versionId: z.string().min(1, "Version ID is required"),
});

export const PublishLayoutVersionSchema = z.object({
  theatreId: z.string().optional(),
  layoutDefinitionId: z.string().min(1, "Layout Definition ID is required"),
  versionId: z.string().min(1, "Version ID is required"),
});

export const ArchiveLayoutSchema = z.object({
  theatreId: z.string().optional(),
  layoutDefinitionId: z.string().min(1, "Layout Definition ID is required"),
});

export const RestoreLayoutSchema = z.object({
  theatreId: z.string().optional(),
  layoutDefinitionId: z.string().min(1, "Layout Definition ID is required"),
  versionId: z.string().min(1, "Version ID is required"),
});

export const DuplicateLayoutSchema = z.object({
  theatreId: z.string().optional(),
  layoutDefinitionId: z.string().min(1, "Layout Definition ID is required"),
  newName: z.string().min(1, "New layout name is required").max(100),
});

export const GetPublishedLayoutForHallSchema = z.object({
  theatreId: z.string().optional(),
  hallId: z.string().min(1, "Hall ID is required"),
});

// ------------------------------------------------------------------------------
// 3. Canvas Preferences Schemas (Part 2)
// ------------------------------------------------------------------------------

export const LoadCanvasPreferencesSchema = z.object({
  theatreId: z.string().optional(),
});

export const SaveCanvasPreferencesSchema = z.object({
  theatreId: z.string().optional(),
  preferences: z.object({
    gridSize: z.number().min(5).max(100).optional(),
    gridDensity: z.enum(["SMALL", "MEDIUM", "LARGE"]).optional(),
    gridVisible: z.boolean().optional(),
    gridColor: z.string().optional(),
    gridOpacity: z.number().min(0).max(1).optional(),
    snapEnabled: z.boolean().optional(),
    snapStrength: z.number().min(1).max(50).optional(),
    defaultZoom: z.number().min(0.2).max(4.0).optional(),
    measurementUnit: z.enum(["PX", "CM", "FT", "M"]).optional(),
    canvasWidth: z.number().min(800).max(10000).optional(),
    canvasHeight: z.number().min(600).max(10000).optional(),
    backgroundColor: z.string().optional(),
    showMiniMap: z.boolean().optional(),
    showSmartGuides: z.boolean().optional(),
  }),
});

export const ResetCanvasPreferencesSchema = z.object({
  theatreId: z.string().optional(),
});
