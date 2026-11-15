import {
  SeatTemplate,
  SeatCoordinates,
  SeatMetadata,
  SeatAccessibility,
  SeatGenerationConfig,
  SeatValidationResult,
  SeatCollisionPair,
  SeatAccessibilityType,
  SeatTemplateStatus,
  SeatNumberingStyle,
  BulkSeatGenerationResult,
} from "@/types/seat-generator.types";

/**
 * ==============================================================================
 * CineSphere OS — Automatic Seat Generator Engine
 * Phase 4 – Part 5: Pure Mathematical Calculation & Generation Engine
 * ==============================================================================
 * Architectural Invariants:
 * 1. Immutable Seat Identity: Every generated seat receives a permanent internal UUID.
 * 2. Decoupled Pricing: Seats define classification and spatial geometry ONLY.
 *    Ticket prices are NEVER stored in seat templates.
 * 3. Deterministic Coordinates: Precision calculation for Straight, Curved,
 *    Arc, and Angled seating topologies.
 * ==============================================================================
 */

export class SeatGeneratorEngine {
  /**
   * Converts a positive integer to Roman numerals.
   */
  public static toRoman(num: number): string {
    if (num <= 0) return num.toString();
    const lookup: Record<string, number> = {
      M: 1000,
      CM: 900,
      D: 500,
      CD: 400,
      C: 100,
      XC: 90,
      L: 50,
      XL: 40,
      X: 10,
      IX: 9,
      V: 5,
      IV: 4,
      I: 1,
    };
    let roman = "";
    for (const key in lookup) {
      while (num >= lookup[key]) {
        roman += key;
        num -= lookup[key];
      }
    }
    return roman;
  }

  /**
   * Converts a 1-based index to Excel-style alphabetical format:
   * 1 -> A, 26 -> Z, 27 -> AA, 28 -> AB.
   */
  public static toAlphabetical(num: number): string {
    let result = "";
    let n = num;
    while (n > 0) {
      const rem = (n - 1) % 26;
      result = String.fromCharCode(65 + rem) + result;
      n = Math.floor((n - 1) / 26);
    }
    return result || "A";
  }

  /**
   * Generates formatted seat number presentation label based on style, prefix,
   * suffix, reverse flag, and skipped numbers.
   */
  public static formatSeatNumber(
    columnIndex: number, // 1-based index
    totalSeats: number,
    config: SeatGenerationConfig
  ): { seatNumber: string; displaySeatNumber: string } {
    const { numbering } = config;
    const startNum = numbering.startNumber ?? 1;
    const skipSet = new Set(numbering.skipNumbers ?? []);

    // Effective sequence index calculation
    let effectiveCol = columnIndex;
    if (numbering.isReversed) {
      effectiveCol = totalSeats - columnIndex + 1;
    }

    // Account for skipped numbers
    let currentNumber = startNum + effectiveCol - 1;
    for (const skipped of skipSet) {
      if (currentNumber >= skipped) {
        currentNumber += 1;
      }
    }

    let rawVal: string;
    switch (numbering.style) {
      case "NUMERIC":
        rawVal = currentNumber.toString();
        break;
      case "ALPHABETIC":
        rawVal = this.toAlphabetical(currentNumber);
        break;
      case "ROMAN":
        rawVal = this.toRoman(currentNumber);
        break;
      case "CUSTOM":
        if (
          numbering.customNames &&
          numbering.customNames[effectiveCol - 1]
        ) {
          rawVal = numbering.customNames[effectiveCol - 1];
        } else {
          rawVal = `${currentNumber}`;
        }
        break;
      case "ALPHANUMERIC":
      default:
        rawVal = `${currentNumber}`;
        break;
    }

    const prefix = numbering.prefix ?? "";
    const suffix = numbering.suffix ?? "";
    const seatNumber = `${prefix}${rawVal}${suffix}`;
    const displaySeatNumber = seatNumber;

    return { seatNumber, displaySeatNumber };
  }

  /**
   * Calculates 2D spatial coordinates for a seat based on geometry configuration.
   */
  public static calculateCoordinates(
    columnIndex: number, // 1-based index
    totalSeats: number,
    config: SeatGenerationConfig
  ): {
    x: number;
    y: number;
    rotation: number;
    width: number;
    height: number;
    spacing: number;
    curvedPosition?: { radius: number; angle: number; sagitta: number };
    isMirrored: boolean;
  } {
    const width = config.seatWidth || 40;
    const height = config.seatHeight || 40;
    const spacing = config.spacing || 10;
    const pitch = width + spacing;
    const startX = config.startX || 100;
    const startY = config.startY || 100;
    const geomType = config.geometry?.type || "STRAIGHT";
    const baseRotation = config.rotation || 0;
    const isMirrored = config.geometry?.isMirrored ?? false;

    let x = startX + (columnIndex - 1) * pitch;
    let y = startY;
    let rotation = baseRotation;
    let curvedPosition:
      | { radius: number; angle: number; sagitta: number }
      | undefined = undefined;

    if (geomType === "CURVED" || geomType === "ARC") {
      const radius = config.geometry?.radius || 600;
      const arcAngle = config.geometry?.arcAngle || 30;
      const midpoint = (totalSeats - 1) / 2;

      // Arc theta in degrees for this seat relative to row center
      const thetaDeg =
        totalSeats > 1 ? (columnIndex - 1 - midpoint) * (arcAngle / (totalSeats - 1)) : 0;
      const thetaRad = (thetaDeg * Math.PI) / 180;

      // Arc Sagitta displacement: R * (1 - cos(theta))
      const sagitta = radius * (1 - Math.cos(thetaRad));
      y = startY + Math.round(sagitta);
      rotation = Math.round(baseRotation + thetaDeg);

      curvedPosition = {
        radius,
        angle: Math.round(thetaDeg * 100) / 100,
        sagitta: Math.round(sagitta * 100) / 100,
      };
    } else if (geomType === "ANGLED") {
      const angleDeg = config.geometry?.angle || config.rotation || 15;
      const angleRad = (angleDeg * Math.PI) / 180;

      x = Math.round(startX + (columnIndex - 1) * pitch * Math.cos(angleRad));
      y = Math.round(startY + (columnIndex - 1) * pitch * Math.sin(angleRad));
      rotation = angleDeg;
    }

    if (config.geometry?.offsetX) x += config.geometry.offsetX;
    if (config.geometry?.offsetY) y += config.geometry.offsetY;

    return {
      x,
      y,
      rotation,
      width,
      height,
      spacing,
      curvedPosition,
      isMirrored,
    };
  }

  /**
   * Resolves accessibility tier for a seat based on configuration indices.
   */
  public static resolveAccessibility(
    columnIndex: number,
    config: SeatGenerationConfig
  ): {
    accessibilityType: SeatAccessibilityType;
    isWheelchairAccessible: boolean;
    hasCompanionSeat: boolean;
    hasAccessibleRoute: boolean;
    notes?: string;
  } {
    const acc = config.accessibility;
    if (!acc) {
      return {
        accessibilityType: "STANDARD",
        isWheelchairAccessible: false,
        hasCompanionSeat: false,
        hasAccessibleRoute: false,
      };
    }

    if (acc.wheelchairSeatIndices?.includes(columnIndex)) {
      return {
        accessibilityType: "WHEELCHAIR",
        isWheelchairAccessible: true,
        hasCompanionSeat: false,
        hasAccessibleRoute: true,
        notes: "ADA compliant wheelchair roll-in berth",
      };
    }

    if (acc.companionSeatIndices?.includes(columnIndex)) {
      return {
        accessibilityType: "COMPANION",
        isWheelchairAccessible: false,
        hasCompanionSeat: true,
        hasAccessibleRoute: true,
        notes: "Designated companion seat",
      };
    }

    if (acc.accessibleRouteIndices?.includes(columnIndex)) {
      return {
        accessibilityType: "ACCESSIBLE_ROUTE",
        isWheelchairAccessible: false,
        hasCompanionSeat: false,
        hasAccessibleRoute: true,
        notes: "Seat directly adjacent to ramp access",
      };
    }

    if (acc.reservedSeatIndices?.includes(columnIndex)) {
      return {
        accessibilityType: "RESERVED",
        isWheelchairAccessible: false,
        hasCompanionSeat: false,
        hasAccessibleRoute: false,
        notes: "Held management or VIP reservation",
      };
    }

    if (acc.hiddenSeatIndices?.includes(columnIndex)) {
      return {
        accessibilityType: "HIDDEN",
        isWheelchairAccessible: false,
        hasCompanionSeat: false,
        hasAccessibleRoute: false,
        notes: "Hidden technical seat",
      };
    }

    return {
      accessibilityType: "STANDARD",
      isWheelchairAccessible: false,
      hasCompanionSeat: false,
      hasAccessibleRoute: false,
    };
  }

  /**
   * Pure Generation Function: Generates all Seat Templates for a row.
   * Produces permanent immutable UUIDs, coordinates, metadata, and accessibility.
   */
  public static generateRowSeats(
    config: SeatGenerationConfig,
    rowContext: {
      rowName: string;
      sectionName: string;
      categoryName?: string;
      categoryColor?: string;
    }
  ): BulkSeatGenerationResult {
    const seats: SeatTemplate[] = [];
    const totalSeats = config.seatCount;

    for (let col = 1; col <= totalSeats; col++) {
      const seatId = crypto.randomUUID();
      const coordId = crypto.randomUUID();
      const metaId = crypto.randomUUID();
      const accId = crypto.randomUUID();

      const { seatNumber, displaySeatNumber } = this.formatSeatNumber(
        col,
        totalSeats,
        config
      );
      const coordsCalculated = this.calculateCoordinates(col, totalSeats, config);
      const accessInfo = this.resolveAccessibility(col, config);

      let status: SeatTemplateStatus = "ACTIVE";
      if (accessInfo.accessibilityType === "HIDDEN") {
        status = "HIDDEN";
      } else if (accessInfo.accessibilityType === "RESERVED") {
        status = "RESERVED";
      }

      const coordinates: SeatCoordinates = {
        id: coordId,
        seatTemplateId: seatId,
        x: coordsCalculated.x,
        y: coordsCalculated.y,
        rotation: coordsCalculated.rotation,
        width: coordsCalculated.width,
        height: coordsCalculated.height,
        spacing: coordsCalculated.spacing,
        curvedPosition: coordsCalculated.curvedPosition,
        isMirrored: coordsCalculated.isMirrored,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const seatCode = `${config.sectionId.slice(0, 8)}-${rowContext.rowName}-${seatNumber}`;

      const metadata: SeatMetadata = {
        id: metaId,
        seatTemplateId: seatId,
        seatName: seatNumber,
        displayName: `${rowContext.rowName}${seatNumber}`,
        seatCode,
        rowId: config.rowId,
        rowName: rowContext.rowName,
        sectionId: config.sectionId,
        sectionName: rowContext.sectionName,
        categoryCode: config.categoryCode,
        status,
        sightlineQuality: "EXCELLENT",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const accessibility: SeatAccessibility = {
        id: accId,
        seatTemplateId: seatId,
        accessibilityType: accessInfo.accessibilityType,
        isWheelchairAccessible: accessInfo.isWheelchairAccessible,
        hasCompanionSeat: accessInfo.hasCompanionSeat,
        hasAccessibleRoute: accessInfo.hasAccessibleRoute,
        notes: accessInfo.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const seatTemplate: SeatTemplate = {
        id: seatId,
        theatreId: config.theatreId,
        layoutVersionId: config.layoutVersionId,
        sectionId: config.sectionId,
        rowId: config.rowId,
        seatNumber,
        columnNumber: col,
        categoryCode: config.categoryCode,
        categoryName: rowContext.categoryName || config.categoryCode,
        categoryColor: rowContext.categoryColor || "#38BDF8",
        coordinates,
        metadata,
        accessibility,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      seats.push(seatTemplate);
    }

    // Link companion seats to adjacent wheelchair seats if applicable
    for (let i = 0; i < seats.length; i++) {
      if (seats[i].accessibility.accessibilityType === "WHEELCHAIR") {
        if (i + 1 < seats.length && seats[i + 1].accessibility.accessibilityType === "COMPANION") {
          seats[i + 1].accessibility.companionSeatTemplateId = seats[i].id;
        } else if (i - 1 >= 0 && seats[i - 1].accessibility.accessibilityType === "COMPANION") {
          seats[i - 1].accessibility.companionSeatTemplateId = seats[i].id;
        }
      }
    }

    const validation = this.validateSeats(seats);

    return {
      rowId: config.rowId,
      generatedCount: seats.length,
      seats,
      validation,
    };
  }

  /**
   * Pure Validator: Verifies seat uniqueness, collision coordinates,
   * accessibility rules, and decoupled pricing invariants.
   */
  public static validateSeats(seats: SeatTemplate[]): SeatValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const collisionPairs: SeatCollisionPair[] = [];
    const duplicateCodes: string[] = [];

    const seenCodes = new Set<string>();
    const seenNumbers = new Set<string>();

    for (let i = 0; i < seats.length; i++) {
      const seat = seats[i];

      // 1. Decoupled Pricing Invariant: Assert no price attributes exist
      const rawObj = seat as unknown as Record<string, unknown>;
      if (
        rawObj.price !== undefined ||
        rawObj.basePrice !== undefined ||
        rawObj.ticketPrice !== undefined ||
        rawObj.finalPrice !== undefined
      ) {
        errors.push(
          `Security/Architecture Violation: Seat '${seat.seatNumber}' contains embedded pricing attributes. Pricing MUST remain decoupled.`
        );
      }

      // 2. Unique Seat Number & Code within row
      if (seenNumbers.has(seat.seatNumber)) {
        errors.push(`Duplicate seat number detected in row: '${seat.seatNumber}'`);
      }
      seenNumbers.add(seat.seatNumber);

      if (seenCodes.has(seat.metadata.seatCode)) {
        duplicateCodes.push(seat.metadata.seatCode);
        errors.push(`Duplicate seatCode detected: '${seat.metadata.seatCode}'`);
      }
      seenCodes.add(seat.metadata.seatCode);

      // 3. Coordinate collision detection with neighboring seats
      for (let j = i + 1; j < seats.length; j++) {
        const other = seats[j];
        const dx = seat.coordinates.x - other.coordinates.x;
        const dy = seat.coordinates.y - other.coordinates.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minSafeDist = Math.min(
          seat.coordinates.width,
          other.coordinates.width
        ) * 0.5;

        if (dist < minSafeDist) {
          collisionPairs.push({
            seatAId: seat.id,
            seatANumber: seat.seatNumber,
            seatBId: other.id,
            seatBNumber: other.seatNumber,
            distance: Math.round(dist * 10) / 10,
          });
          warnings.push(
            `Spatial coordinate collision warning: Seat '${seat.seatNumber}' and '${other.seatNumber}' overlap (distance: ${Math.round(dist)}px)`
          );
        }
      }

      // 4. Accessibility companion pairing check
      if (
        seat.accessibility.accessibilityType === "COMPANION" &&
        !seat.accessibility.hasCompanionSeat
      ) {
        warnings.push(
          `Seat '${seat.seatNumber}' is tagged as COMPANION but has no paired wheelchair anchor.`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      totalSeats: seats.length,
      errors,
      warnings,
      collisionPairs,
      duplicateCodes,
    };
  }
}
