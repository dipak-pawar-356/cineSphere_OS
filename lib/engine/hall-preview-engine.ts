/**
 * ==============================================================================
 * CineSphere OS — Hall Preview Engine
 * Phase 4 – Part 9: Multi-Mode Production-Ready Hall Preview & Simulation
 * ==============================================================================
 */

import {
  PreviewMode,
  PreviewViewport,
  PreviewConfiguration,
  BookingSimulationState,
  SimulatedSelectedSeat,
  PreviewStatistics,
} from "@/types/hall-preview.types";
import { HallSection } from "@/types/section-row-designer.types";
import { HallRow } from "@/types/section-row-designer.types";
import { SeatTemplate } from "@/types/seat-generator.types";
import { StructuralObject } from "@/types/structural-objects.types";

export class HallPreviewEngine {
  /**
   * Viewport Dimensions Reference
   */
  public static readonly VIEWPORT_SPECS: Record<
    PreviewViewport,
    { width: number; height: number; name: string }
  > = {
    DESKTOP: { width: 1600, height: 1000, name: "Desktop (Ultra-Wide)" },
    LAPTOP: { width: 1280, height: 800, name: "Laptop (13-15 Inch)" },
    TABLET: { width: 1024, height: 768, name: "Tablet (iPad / Touch)" },
    MOBILE: { width: 390, height: 844, name: "Mobile (iPhone / Responsive)" },
  };

  /**
   * 1. Viewport Fit & Scale Calculator
   */
  public static computeViewportTransform(
    viewport: PreviewViewport,
    containerBounds: { width: number; height: number },
    canvasBounds: { width: number; height: number } = { width: 1600, height: 1200 }
  ): {
    scaleFactor: number;
    fitZoom: number;
    panOffset: { x: number; y: number };
  } {
    const spec = this.VIEWPORT_SPECS[viewport] || this.VIEWPORT_SPECS.DESKTOP;
    const targetW = Math.min(containerBounds.width, spec.width);
    const targetH = Math.min(containerBounds.height, spec.height);

    const scaleX = (targetW * 0.9) / canvasBounds.width;
    const scaleY = (targetH * 0.9) / canvasBounds.height;
    const fitZoom = Math.max(0.2, Math.min(1.5, Math.min(scaleX, scaleY)));

    const scaledW = canvasBounds.width * fitZoom;
    const scaledH = canvasBounds.height * fitZoom;

    const panOffset = {
      x: Math.round((targetW - scaledW) / 2),
      y: Math.round((targetH - scaledH) / 2),
    };

    return {
      scaleFactor: fitZoom,
      fitZoom: Math.round(fitZoom * 100) / 100,
      panOffset,
    };
  }

  /**
   * 2. Object Filtering & Decoration by Preview Mode
   */
  public static filterAndDecorateSeats(
    seats: SeatTemplate[],
    mode: PreviewMode,
    config: PreviewConfiguration,
    simulationState?: BookingSimulationState
  ): Array<
    SeatTemplate & {
      renderColor: string;
      displayLabel: string;
      isHighlighted: boolean;
      isSelected: boolean;
      isDisabled: boolean;
      accessibilityBadge?: string;
    }
  > {
    const selectedSet = new Set(simulationState?.selectedSeatIds || []);

    return seats.map((seat) => {
      let renderColor = seat.categoryColor || "#3B82F6";
      let displayLabel = config.showLabels ? seat.seatNumber : "";
      let isHighlighted = false;
      let isDisabled = seat.status !== "ACTIVE";
      const isSelected = selectedSet.has(seat.id);

      // Mode-specific rendering behavior
      switch (mode) {
        case "CUSTOMER": {
          // Customer sees category color or active status
          if (config.seatColorMode === "CATEGORY") {
            renderColor = seat.categoryColor || "#3B82F6";
          } else if (config.seatColorMode === "STATUS") {
            renderColor = seat.status === "ACTIVE" ? "#10B981" : "#64748B";
          }
          break;
        }

        case "THEATRE": {
          // Theatre staff view: operational badges & row labels
          displayLabel = `${seat.metadata.rowName || ""}${seat.seatNumber}`;
          break;
        }

        case "ADMIN": {
          // Admin view: reveals debug metadata and color mapping
          if (config.seatColorMode === "SECTION") {
            renderColor = "#8B5CF6"; // Section tint
          }
          break;
        }

        case "ACCESSIBILITY": {
          // Accessibility view: highlight wheelchair & companion seats
          if (seat.accessibility.isWheelchairAccessible) {
            renderColor = "#06B6D4"; // Cyan
            isHighlighted = true;
          } else if (seat.accessibility.hasCompanionSeat) {
            renderColor = "#F59E0B"; // Amber
            isHighlighted = true;
          } else {
            // De-emphasize standard seats in accessibility view
            renderColor = "rgba(100, 116, 139, 0.4)";
          }
          break;
        }

        case "BOOKING_SIMULATION": {
          // Booking simulator: selected seats turn bright rose/emerald
          if (isSelected) {
            renderColor = "#E11D48"; // CineSphere Rose
            isHighlighted = true;
          }
          break;
        }

        default:
          break;
      }

      // Accessibility badge glyph
      let accessibilityBadge: string | undefined = undefined;
      if (seat.accessibility.isWheelchairAccessible) {
        accessibilityBadge = "♿";
      } else if (seat.accessibility.hasCompanionSeat) {
        accessibilityBadge = "★";
      }

      return {
        ...seat,
        renderColor,
        displayLabel,
        isHighlighted,
        isSelected,
        isDisabled,
        accessibilityBadge,
      };
    });
  }

  /**
   * 3. Filter Structural Objects by Preview Mode
   */
  public static filterStructuralObjects(
    objects: StructuralObject[],
    mode: PreviewMode,
    config: PreviewConfiguration
  ): StructuralObject[] {
    return objects.filter((obj) => {
      if (obj.visibility === "HIDDEN") return false;

      // In Customer mode, only display major customer-visible landmarks
      if (mode === "CUSTOMER") {
        return [
          "SCREEN",
          "STAGE",
          "ENTRANCE",
          "EXIT",
          "EMERGENCY_EXIT",
          "AISLE",
          "ACCESSIBLE_PATH",
          "BALCONY",
        ].includes(obj.objectType);
      }

      // In Accessibility mode, prioritize egress and accessible paths
      if (mode === "ACCESSIBILITY") {
        return [
          "SCREEN",
          "ACCESSIBLE_PATH",
          "EMERGENCY_EXIT",
          "ENTRANCE",
          "EXIT",
          "AISLE",
          "STAIRS",
          "PILLAR",
        ].includes(obj.objectType);
      }

      return true;
    });
  }

  /**
   * 4. Interactive Booking Simulation Handler
   */
  public static simulateSeatToggle(
    currentState: BookingSimulationState,
    seat: SeatTemplate,
    categoryPriceMap: Record<string, number> = {
      VIP: 450,
      RECLINER: 350,
      PREMIUM: 280,
      STANDARD: 200,
      WHEELCHAIR: 180,
    }
  ): BookingSimulationState {
    const isAlreadySelected = currentState.selectedSeatIds.includes(seat.id);
    let updatedSeatIds: string[];
    let updatedSeats: SimulatedSelectedSeat[];

    if (isAlreadySelected) {
      updatedSeatIds = currentState.selectedSeatIds.filter((id) => id !== seat.id);
      updatedSeats = currentState.selectedSeats.filter((s) => s.id !== seat.id);
    } else {
      if (currentState.selectedSeatIds.length >= currentState.maxSeatsAllowed) {
        return currentState; // Reached maximum limit (e.g. 10 seats)
      }

      const price =
        categoryPriceMap[seat.categoryCode.toUpperCase()] ||
        categoryPriceMap.STANDARD ||
        200;

      const newSimSeat: SimulatedSelectedSeat = {
        id: seat.id,
        seatNumber: seat.seatNumber,
        rowName: seat.metadata.rowName || "Row",
        sectionName: seat.metadata.sectionName || "General",
        categoryCode: seat.categoryCode,
        categoryName: seat.categoryName,
        categoryColor: seat.categoryColor,
        pricePlaceholder: price,
        isWheelchair: seat.accessibility.isWheelchairAccessible,
      };

      updatedSeatIds = [...currentState.selectedSeatIds, seat.id];
      updatedSeats = [...currentState.selectedSeats, newSimSeat];
    }

    // Calculate subtotal & category breakdown
    let totalPrice = 0;
    const categoryBreakdown: Record<string, { count: number; subtotal: number }> = {};

    for (const s of updatedSeats) {
      totalPrice += s.pricePlaceholder;
      if (!categoryBreakdown[s.categoryName]) {
        categoryBreakdown[s.categoryName] = { count: 0, subtotal: 0 };
      }
      categoryBreakdown[s.categoryName].count += 1;
      categoryBreakdown[s.categoryName].subtotal += s.pricePlaceholder;
    }

    return {
      ...currentState,
      selectedSeatIds: updatedSeatIds,
      selectedSeats: updatedSeats,
      totalPrice,
      categoryBreakdown,
      simulatedHoldExpiresAt:
        updatedSeatIds.length > 0
          ? new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min hold
          : undefined,
    };
  }

  /**
   * 5. Generate Preview Statistics
   */
  public static generateStatistics(
    sections: HallSection[],
    seats: SeatTemplate[],
    structuralObjects: StructuralObject[],
    categoryPriceMap: Record<string, number> = {
      VIP: 450,
      RECLINER: 350,
      PREMIUM: 280,
      STANDARD: 200,
      WHEELCHAIR: 180,
    }
  ): PreviewStatistics {
    const totalSeats = seats.length;
    const activeSeats = seats.filter((s) => s.status === "ACTIVE");
    let wheelchairCount = 0;
    let companionCount = 0;
    let estimatedFullGross = 0;

    const catCounts: Record<string, { name: string; count: number; color: string }> = {};

    for (const seat of seats) {
      if (seat.accessibility.isWheelchairAccessible) wheelchairCount++;
      if (seat.accessibility.hasCompanionSeat) companionCount++;

      const code = seat.categoryCode.toUpperCase();
      const price = categoryPriceMap[code] || 200;
      estimatedFullGross += price;

      if (!catCounts[code]) {
        catCounts[code] = {
          name: seat.categoryName || code,
          count: 0,
          color: seat.categoryColor || "#3B82F6",
        };
      }
      catCounts[code].count++;
    }

    const categoryDistribution: Record<
      string,
      { name: string; count: number; color: string; percentage: number }
    > = {};

    for (const [code, item] of Object.entries(catCounts)) {
      const percentage = totalSeats > 0 ? Math.round((item.count / totalSeats) * 100) : 0;
      categoryDistribution[code] = {
        ...item,
        percentage,
      };
    }

    const screenCount = structuralObjects.filter(
      (o) => o.objectType === "SCREEN" && o.visibility !== "HIDDEN"
    ).length;
    const emergencyExitCount = structuralObjects.filter(
      (o) => o.objectType === "EMERGENCY_EXIT" && o.visibility !== "HIDDEN"
    ).length;
    const accessiblePathCount = structuralObjects.filter(
      (o) => o.objectType === "ACCESSIBLE_PATH" && o.visibility !== "HIDDEN"
    ).length;

    const totalCapacity = sections.reduce((sum, s) => sum + (s.capacity || 0), 0) || totalSeats;

    return {
      totalSeats,
      totalCapacity,
      activeSeatsCount: activeSeats.length,
      wheelchairSeatsCount: wheelchairCount,
      companionSeatsCount: companionCount,
      categoryDistribution,
      sectionsCount: sections.length,
      rowsCount: sections.reduce((sum, s) => sum + s.rows.length, 0),
      structuralObjectsCount: structuralObjects.length,
      screenCount,
      emergencyExitCount,
      accessiblePathCount,
      estimatedFullGross,
    };
  }
}
