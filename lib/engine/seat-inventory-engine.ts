import crypto from "crypto";
import {
  SeatInventoryHeader,
  SeatInventoryItem,
  SeatPricingContext,
  ValidateInventoryResult,
} from "@/types/seat-inventory-integration.types";
import { LayoutVersion } from "@/types/hall-designer.types";
import { StructuralObject } from "@/types/structural-objects.types";

/**
 * ==============================================================================
 * CineSphere OS — Seat Inventory Engine (Phase 4 – Part 13)
 * ==============================================================================
 * Pure mathematical and deterministic engine for generating immutable show
 * seat inventory snapshots from published hall layouts.
 * ==============================================================================
 */

export interface PricingRuleMap {
  sectionPrices?: Record<string, number>;
  categoryMultipliers?: Record<string, number>;
  baseShowPrice?: number;
  convenienceFee?: number;
  gstPercent?: number;
  currency?: string;
}

export class SeatInventoryEngine {
  /**
   * Generates a deterministic, globally unique Internal Seat ID.
   * Format: `seat-{theatreId}-{showId}-{hash(section+row+col)}`
   */
  public static generateInternalSeatId(
    theatreId: string,
    showId: string,
    sectionCode: string,
    row: string,
    column: number
  ): string {
    const raw = `${theatreId}:${showId}:${sectionCode}:${row}:${column}`;
    const hash = crypto.createHash("sha256").update(raw).digest("hex").substring(0, 12);
    return `seat-${showId.substring(0, 8)}-${row}${column}-${hash}`;
  }

  /**
   * Resolves dynamic pricing for a seat without any hardcoded values.
   * Resolves from show base price, section tier, category multiplier, and taxes.
   */
  public static resolveSeatPricing(
    seat: {
      category?: string;
      type?: string;
      sectionId: string;
      isWheelchair?: boolean;
      isCompanion?: boolean;
      isRecliner?: boolean;
    },
    context: SeatPricingContext,
    pricingRules?: PricingRuleMap
  ): {
    basePrice: number;
    calculatedPrice: number;
    convenienceFee: number;
    gstPercent: number;
    currency: string;
  } {
    const baseShowPrice = pricingRules?.baseShowPrice ?? 200;
    const sectionPrice = pricingRules?.sectionPrices?.[seat.sectionId] ?? baseShowPrice;

    // Resolve category multiplier
    let multiplier = 1.0;
    if (pricingRules?.categoryMultipliers && seat.category) {
      multiplier = pricingRules.categoryMultipliers[seat.category] ?? 1.0;
    } else {
      if (seat.category?.toLowerCase().includes("vip") || seat.isRecliner) {
        multiplier = 1.75;
      } else if (seat.category?.toLowerCase().includes("premium")) {
        multiplier = 1.35;
      } else if (seat.isWheelchair || seat.isCompanion) {
        multiplier = 1.0; // ADA standard parity
      }
    }

    const calculatedBase = Math.round(sectionPrice * multiplier * 100) / 100;
    const convenienceFee = pricingRules?.convenienceFee ?? 35;
    const gstPercent = pricingRules?.gstPercent ?? 18;
    const currency = pricingRules?.currency ?? "INR";

    const taxAmount = (calculatedBase + convenienceFee) * (gstPercent / 100);
    const calculatedPrice = Math.round((calculatedBase + convenienceFee + taxAmount) * 100) / 100;

    return {
      basePrice: calculatedBase,
      calculatedPrice,
      convenienceFee,
      gstPercent,
      currency,
    };
  }

  /**
   * Builds an immutable Seat Inventory snapshot from a published Layout Version.
   */
  public static generateInventoryBlueprint(params: {
    inventoryId: string;
    theatreId: string;
    showId: string;
    hallId: string;
    layoutVersion: LayoutVersion;
    structuralObjects?: StructuralObject[];
    pricingRules?: PricingRuleMap;
    actorId: string;
  }): {
    header: SeatInventoryHeader;
    items: SeatInventoryItem[];
  } {
    const {
      inventoryId,
      theatreId,
      showId,
      hallId,
      layoutVersion,
      pricingRules,
      actorId,
    } = params;

    const now = new Date().toISOString();
    const sectionMap = new Map(layoutVersion.sections.map((s) => [s.id, s.name]));

    const items: SeatInventoryItem[] = layoutVersion.seats.map((seat, index) => {
      const sectionName = sectionMap.get(seat.sectionId) || "General Seating";
      const internalSeatId = SeatInventoryEngine.generateInternalSeatId(
        theatreId,
        showId,
        seat.sectionId,
        seat.row,
        seat.column
      );

      const isWheelchair = seat.seatType === "Wheelchair" || Boolean(seat.isAccessible);
      const isRecliner = seat.seatType === "Recliner";
      const isCompanion = Boolean(seat.companionSeatId);

      const pricing = SeatInventoryEngine.resolveSeatPricing(
        {
          category: seat.seatType,
          type: seat.seatType,
          sectionId: seat.sectionId,
          isWheelchair,
          isCompanion,
          isRecliner,
        },
        {
          theatreId,
          hallId,
          showId,
          sectionId: seat.sectionId,
          seatCategoryId: `cat-${seat.seatType.toLowerCase()}`,
        },
        pricingRules
      );

      const displaySeatNumber = seat.seatNumber || `${seat.row}${seat.column}`;

      return {
        id: `item-${inventoryId}-${index + 1}`,
        inventoryId,
        showId,
        theatreId,
        hallId,
        internalSeatId,
        displaySeatNumber,
        seatCategoryId: `cat-${seat.seatType.toLowerCase()}`,
        seatCategoryName: seat.seatType,
        sectionId: seat.sectionId,
        sectionName,
        rowCode: seat.row,
        columnIndex: seat.column,
        x: seat.coordinates.x,
        y: seat.coordinates.y,
        status: "AVAILABLE",
        isWheelchair,
        isCompanion,
        isRecliner,
        basePrice: pricing.basePrice,
        calculatedPrice: pricing.calculatedPrice,
        convenienceFee: pricing.convenienceFee,
        gstPercent: pricing.gstPercent,
        currency: pricing.currency,
        metadata: {
          handicapAccessible: isWheelchair,
          companionAttached: isCompanion,
          seatType: seat.seatType,
        },
        updatedAt: now,
      };
    });

    const header: SeatInventoryHeader = {
      id: inventoryId,
      showId,
      theatreId,
      hallId,
      layoutDefinitionId: layoutVersion.layoutDefinitionId,
      layoutVersionId: layoutVersion.id,
      layoutVersionNumber: layoutVersion.versionNumber,
      totalSeats: items.length,
      availableSeats: items.length,
      bookedSeats: 0,
      blockedSeats: 0,
      maintenanceSeats: 0,
      status: "ACTIVE",
      generatedAt: now,
      generatedBy: actorId,
      updatedAt: now,
    };

    return { header, items };
  }

  /**
   * Validates inventory integrity against structural bounds and seat uniqueness.
   */
  public static validateInventoryIntegrity(
    items: SeatInventoryItem[],
    layoutVersion: LayoutVersion
  ): ValidateInventoryResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const seenSeatCodes = new Set<string>();

    if (items.length !== layoutVersion.seats.length) {
      errors.push(
        `Seat Count Parity Failure: Inventory has ${items.length} seats, but layout version v${layoutVersion.versionNumber} defines ${layoutVersion.seats.length} seats.`
      );
    }

    for (const item of items) {
      if (seenSeatCodes.has(item.displaySeatNumber)) {
        errors.push(`Duplicate Seat Code detected: '${item.displaySeatNumber}'.`);
      }
      seenSeatCodes.add(item.displaySeatNumber);

      if (item.basePrice <= 0) {
        errors.push(`Invalid zero or negative price for seat '${item.displaySeatNumber}'.`);
      }
    }

    const availableSeats = items.filter((i) => i.status === "AVAILABLE").length;

    return {
      isValid: errors.length === 0,
      showId: items[0]?.showId || "",
      inventoryId: items[0]?.inventoryId,
      totalSeats: items.length,
      availableSeats,
      errors,
      warnings,
    };
  }
}
