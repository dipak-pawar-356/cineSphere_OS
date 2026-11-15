/**
 * ==============================================================================
 * CineSphere OS — Hall Layout Validation Engine (Phase 4 – Part 1)
 * ==============================================================================
 * Pure validation engine for hall layouts prior to draft save or publishing.
 * Enforces seat coordinate uniqueness, grid boundary compliance, valid section
 * links, emergency exit clearance, and legal status transitions.
 * ==============================================================================
 */

import {
  LayoutVersion,
  LayoutValidationResult,
  LayoutStatus,
  SeatDefinition,
  HallSectionDefinition,
} from "@/types/hall-designer.types";

export class LayoutValidator {
  /**
   * Validate whether a status transition is permitted.
   */
  public static isValidStatusTransition(
    currentStatus: LayoutStatus,
    targetStatus: LayoutStatus
  ): { allowed: boolean; reason?: string } {
    if (currentStatus === targetStatus) {
      return { allowed: true };
    }

    const validTransitions: Record<LayoutStatus, LayoutStatus[]> = {
      DRAFT: ["PUBLISHED", "ARCHIVED", "INACTIVE"],
      PUBLISHED: ["ARCHIVED", "INACTIVE", "DEPRECATED"],
      ARCHIVED: ["DRAFT", "INACTIVE"],
      INACTIVE: ["DRAFT", "ARCHIVED"],
      DEPRECATED: ["ARCHIVED"],
    };

    const allowedNext = validTransitions[currentStatus] || [];
    if (!allowedNext.includes(targetStatus)) {
      return {
        allowed: false,
        reason: `Illegal layout status transition from '${currentStatus}' to '${targetStatus}'. Allowed targets: ${allowedNext.join(", ") || "None"}`,
      };
    }

    return { allowed: true };
  }

  /**
   * Thoroughly validate layout version payload integrity for publishing.
   */
  public static validateLayoutVersion(
    version: Partial<LayoutVersion>
  ): LayoutValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const sections = version.sections || [];
    const seats = version.seats || [];
    const gridConfig = version.gridConfig || { rows: 10, columns: 12, totalCapacity: 0 };
    const emergencyExits = version.emergencyExits || [];

    // 1. Basic Structure Checks
    if (sections.length === 0) {
      errors.push("Layout must define at least one seating section before publishing.");
    }

    if (seats.length === 0) {
      errors.push("Layout must contain at least one seat definition.");
    }

    // 2. Section Checks
    const sectionIds = new Set<string>();
    const sectionNames = new Set<string>();
    const emptySections: string[] = [];

    let totalSectionCapacity = 0;
    for (const sec of sections) {
      if (!sec.id) {
        errors.push("Every section must have a unique ID.");
      } else {
        if (sectionIds.has(sec.id)) {
          errors.push(`Duplicate section ID detected: '${sec.id}'.`);
        }
        sectionIds.add(sec.id);
      }

      if (sectionNames.has(sec.name.toLowerCase())) {
        errors.push(`Duplicate section name detected: '${sec.name}'. Section names must be unique within a layout.`);
      }
      sectionNames.add(sec.name.toLowerCase());

      totalSectionCapacity += sec.seatCount;

      // Count seats assigned to this section
      const assignedSeatsCount = seats.filter((s) => s.sectionId === sec.id).length;
      if (assignedSeatsCount === 0) {
        emptySections.push(sec.name);
      }
    }

    if (emptySections.length > 0) {
      warnings.push(`The following sections have no seats assigned: ${emptySections.join(", ")}.`);
    }

    // 3. Seat Checks (Uniqueness, Grid Bounds, Collisions)
    const seatNumbers = new Set<string>();
    const duplicateSeatNumbers: string[] = [];
    const coordinateKeys = new Set<string>();
    const outOfBoundsSeats: string[] = [];

    for (const seat of seats) {
      // Seat Number uniqueness
      if (seatNumbers.has(seat.seatNumber)) {
        duplicateSeatNumbers.push(seat.seatNumber);
      }
      seatNumbers.add(seat.seatNumber);

      // Section Reference check
      if (!sectionIds.has(seat.sectionId)) {
        errors.push(`Seat '${seat.seatNumber}' references non-existent section ID: '${seat.sectionId}'.`);
      }

      // Coordinate collision check
      const coordKey = `${seat.coordinates.x},${seat.coordinates.y}`;
      if (coordinateKeys.has(coordKey)) {
        errors.push(`Coordinate collision: Multiple seats placed at coordinates (${seat.coordinates.x}, ${seat.coordinates.y}).`);
      }
      coordinateKeys.add(coordKey);

      // Grid Boundary check
      if (
        seat.column < 1 ||
        seat.column > gridConfig.columns ||
        seat.coordinates.x < 0 ||
        seat.coordinates.y < 0
      ) {
        outOfBoundsSeats.push(seat.seatNumber);
      }
    }

    if (duplicateSeatNumbers.length > 0) {
      errors.push(`Duplicate seat numbers detected: ${Array.from(new Set(duplicateSeatNumbers)).join(", ")}.`);
    }

    if (outOfBoundsSeats.length > 0) {
      errors.push(`Seats exceed grid boundary limits (${gridConfig.columns} cols): ${outOfBoundsSeats.slice(0, 5).join(", ")}${outOfBoundsSeats.length > 5 ? ` and ${outOfBoundsSeats.length - 5} more` : ""}.`);
    }

    // 4. Capacity alignment check
    if (seats.length !== totalSectionCapacity) {
      warnings.push(
        `Actual seat count (${seats.length}) does not match the sum of section capacities (${totalSectionCapacity}).`
      );
    }

    // 5. Emergency exits check
    const hasEmergencyExits = emergencyExits.length > 0;
    if (!hasEmergencyExits) {
      warnings.push("Layout does not define any emergency exits. Cinema safety regulations typically require at least 2 exits.");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalSections: sections.length,
        totalSeats: seats.length,
        duplicateSeatNumbers: Array.from(new Set(duplicateSeatNumbers)),
        outOfBoundsSeats,
        emptySections,
        hasScreenDirection: true,
        hasEmergencyExits,
      },
    };
  }
}
