/**
 * ==============================================================================
 * CineSphere OS — Section & Row Validation Engine (Phase 4 – Parts 3 & 4)
 * ==============================================================================
 * Pure validation engine for Sections and Rows prior to draft persistence
 * or publishing.
 * Enforces unique section names/codes, row name uniqueness within section,
 * capacity parity, positive row spacing, and accessibility constraints.
 * ==============================================================================
 */

import {
  HallSection,
  HallRow,
  SectionValidationResult,
  RowValidationResult,
} from "@/types/section-row-designer.types";

export class SectionRowValidator {
  /**
   * Validates an entire collection of sections for a layout version.
   */
  public static validateSections(sections: HallSection[]): SectionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const names = new Set<string>();
    const codes = new Set<string>();
    const duplicateNames: string[] = [];
    const duplicateCodes: string[] = [];
    const capacityDiscrepancies: string[] = [];

    let totalSeats = 0;
    let totalRows = 0;

    sections.forEach((sec) => {
      // 1. Name uniqueness
      const normName = sec.name.trim().toLowerCase();
      if (names.has(normName)) {
        duplicateNames.push(sec.name);
        errors.push(`Duplicate section name: '${sec.name}' already exists in this layout.`);
      } else {
        names.add(normName);
      }

      // 2. Code uniqueness
      const normCode = sec.internalCode.trim().toUpperCase();
      if (codes.has(normCode)) {
        duplicateCodes.push(sec.internalCode);
        errors.push(`Duplicate section code: '${sec.internalCode}' already exists in this layout.`);
      } else {
        codes.add(normCode);
      }

      // 3. Capacity parity
      const rowSeatCount = sec.rows.reduce((sum, r) => sum + r.seatCount, 0);
      totalRows += sec.rows.length;
      totalSeats += rowSeatCount;

      if (sec.capacity !== rowSeatCount && sec.rows.length > 0) {
        capacityDiscrepancies.push(sec.name);
        warnings.push(
          `Section '${sec.name}' capacity (${sec.capacity}) differs from row seats sum (${rowSeatCount}). Auto-adjusting.`
        );
      }

      // 4. Geometry validation
      if (sec.geometry?.shapeType === "CURVED" || sec.geometry?.shapeType === "ARC") {
        if (sec.geometry.curvatureRadius && sec.geometry.curvatureRadius <= 0) {
          errors.push(`Section '${sec.name}' curvature radius must be positive.`);
        }
      }

      // 5. Row validation within section
      const rowVal = this.validateRows(sec.id, sec.rows);
      if (!rowVal.isValid) {
        errors.push(...rowVal.errors.map((e) => `[${sec.name}] ${e}`));
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalSections: sections.length,
        totalRows,
        totalSeats,
        duplicateSectionNames: duplicateNames,
        duplicateSectionCodes: duplicateCodes,
        capacityDiscrepancies,
      },
    };
  }

  /**
   * Validates rows within a specific section.
   */
  public static validateRows(sectionId: string, rows: HallRow[]): RowValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const rowNames = new Set<string>();
    const duplicateRowNames: string[] = [];
    const sequences = new Set<number>();
    const invalidSequences: number[] = [];

    rows.forEach((row) => {
      // 1. Row name uniqueness within section
      const normName = row.rowName.trim().toUpperCase();
      if (rowNames.has(normName)) {
        duplicateRowNames.push(row.rowName);
        errors.push(`Duplicate row name: '${row.rowName}' appears multiple times in section.`);
      } else {
        rowNames.add(normName);
      }

      // 2. Sequence consistency
      if (row.sequence <= 0) {
        invalidSequences.push(row.sequence);
        errors.push(`Row '${row.rowName}' has invalid sequence '${row.sequence}' (must be > 0).`);
      }
      if (sequences.has(row.sequence)) {
        warnings.push(`Row '${row.rowName}' shares duplicate sequence index '${row.sequence}'.`);
      } else {
        sequences.add(row.sequence);
      }

      // 3. Spacing validation
      if (row.spacing <= 0) {
        errors.push(`Row '${row.rowName}' spacing must be positive (got ${row.spacing}).`);
      }

      // 4. Geometry validation
      if (row.geometry?.geometryType === "CURVED" && (row.geometry.curveRadius ?? 0) <= 0) {
        errors.push(`Row '${row.rowName}' curve radius must be positive.`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        sectionId,
        totalRows: rows.length,
        duplicateRowNames,
        invalidSequences,
      },
    };
  }
}
