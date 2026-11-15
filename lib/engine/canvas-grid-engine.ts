/**
 * ==============================================================================
 * CineSphere OS — Canvas & Grid Engine (Phase 4 – Part 2)
 * ==============================================================================
 * Pure mathematical engine supporting infinite canvas coordinate transforms,
 * multi-density snap-to-grid calculations, unit conversions, alignment operations,
 * and smart guides detection.
 * ==============================================================================
 */

import {
  MeasurementUnit,
  AlignmentOperation,
  SeatDefinition,
  CanvasTransform,
  SmartGuide,
} from "@/types/hall-designer.types";

export class CanvasGridEngine {
  /**
   * Unit conversion ratios relative to base unit (Pixels at 96 DPI).
   * 1 inch = 96 px = 2.54 cm
   * 1 foot = 12 inches = 1152 px
   * 1 meter = 100 cm = 3779.5 px
   */
  private static readonly PIXELS_PER_CM = 37.795;
  private static readonly PIXELS_PER_FT = 1152 / 10; // scaled cinema architectural foot
  private static readonly PIXELS_PER_M = 377.95;

  /**
   * Snaps a 1D coordinate to the nearest grid step if within snapStrength threshold.
   */
  public static snapCoordinate(
    val: number,
    gridSize: number,
    snapStrength: number = 8
  ): number {
    if (gridSize <= 0) return val;
    const nearest = Math.round(val / gridSize) * gridSize;
    const distance = Math.abs(val - nearest);
    return distance <= snapStrength ? nearest : val;
  }

  /**
   * Snaps a 2D position (x, y) to the grid.
   */
  public static snapPosition(
    x: number,
    y: number,
    gridSize: number,
    snapStrength: number = 8
  ): { x: number; y: number } {
    return {
      x: this.snapCoordinate(x, gridSize, snapStrength),
      y: this.snapCoordinate(y, gridSize, snapStrength),
    };
  }

  /**
   * Convert measurement values between PX, CM, FT, and M.
   */
  public static convertUnit(
    value: number,
    from: MeasurementUnit,
    to: MeasurementUnit
  ): number {
    if (from === to) return value;

    // Convert from source to pixels
    let inPx = value;
    switch (from) {
      case "CM":
        inPx = value * this.PIXELS_PER_CM;
        break;
      case "FT":
        inPx = value * this.PIXELS_PER_FT;
        break;
      case "M":
        inPx = value * this.PIXELS_PER_M;
        break;
      case "PX":
      default:
        inPx = value;
    }

    // Convert from pixels to destination unit
    switch (to) {
      case "CM":
        return Number((inPx / this.PIXELS_PER_CM).toFixed(2));
      case "FT":
        return Number((inPx / this.PIXELS_PER_FT).toFixed(2));
      case "M":
        return Number((inPx / this.PIXELS_PER_M).toFixed(2));
      case "PX":
      default:
        return Math.round(inPx);
    }
  }

  /**
   * Computes zoom and pan coordinates to fit canvas dimensions into the viewport.
   */
  public static calculateFitToScreen(
    canvasWidth: number,
    canvasHeight: number,
    viewportWidth: number,
    viewportHeight: number,
    padding: number = 40
  ): CanvasTransform {
    if (viewportWidth <= 0 || viewportHeight <= 0) {
      return { zoom: 1.0, panX: 0, panY: 0 };
    }

    const availableWidth = viewportWidth - padding * 2;
    const availableHeight = viewportHeight - padding * 2;

    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;

    // Constrain zoom between 0.25 and 1.5 for fit-to-screen
    const zoom = Math.max(0.25, Math.min(1.5, Math.min(scaleX, scaleY)));

    const scaledWidth = canvasWidth * zoom;
    const scaledHeight = canvasHeight * zoom;

    const panX = Math.round((viewportWidth - scaledWidth) / 2);
    const panY = Math.round((viewportHeight - scaledHeight) / 2);

    return { zoom: Number(zoom.toFixed(2)), panX, panY };
  }

  /**
   * Executes geometric alignment across a selection of seats.
   */
  public static alignSeats(
    seats: SeatDefinition[],
    operation: AlignmentOperation
  ): SeatDefinition[] {
    if (seats.length <= 1) return [...seats];

    const minX = Math.min(...seats.map((s) => s.coordinates.x));
    const maxX = Math.max(...seats.map((s) => s.coordinates.x));
    const minY = Math.min(...seats.map((s) => s.coordinates.y));
    const maxY = Math.max(...seats.map((s) => s.coordinates.y));

    const centerX = Math.round((minX + maxX) / 2);
    const centerY = Math.round((minY + maxY) / 2);

    return seats.map((seat) => {
      const updated = { ...seat, coordinates: { ...seat.coordinates } };

      switch (operation) {
        case "ALIGN_LEFT":
          updated.coordinates.x = minX;
          break;
        case "ALIGN_RIGHT":
          updated.coordinates.x = maxX;
          break;
        case "ALIGN_TOP":
          updated.coordinates.y = minY;
          break;
        case "ALIGN_BOTTOM":
          updated.coordinates.y = maxY;
          break;
        case "CENTER_HORIZONTAL":
          updated.coordinates.x = centerX;
          break;
        case "CENTER_VERTICAL":
          updated.coordinates.y = centerY;
          break;
        case "DISTRIBUTE_HORIZONTALLY": {
          // Sort by x and distribute evenly
          const sorted = [...seats].sort((a, b) => a.coordinates.x - b.coordinates.x);
          const index = sorted.findIndex((s) => s.id === seat.id);
          const step = (maxX - minX) / (seats.length - 1);
          updated.coordinates.x = Math.round(minX + index * step);
          break;
        }
        case "DISTRIBUTE_VERTICALLY": {
          const sorted = [...seats].sort((a, b) => a.coordinates.y - b.coordinates.y);
          const index = sorted.findIndex((s) => s.id === seat.id);
          const step = (maxY - minY) / (seats.length - 1);
          updated.coordinates.y = Math.round(minY + index * step);
          break;
        }
      }

      return updated;
    });
  }

  /**
   * Identifies smart alignment guides when an item is moved close to other items.
   */
  public static calculateSmartGuides(
    existingSeats: SeatDefinition[],
    draggedSeat: SeatDefinition,
    threshold: number = 6
  ): SmartGuide[] {
    const guides: SmartGuide[] = [];

    for (const seat of existingSeats) {
      if (seat.id === draggedSeat.id) continue;

      // Vertical alignment guide (shared X)
      if (Math.abs(seat.coordinates.x - draggedSeat.coordinates.x) <= threshold) {
        guides.push({
          type: "VERTICAL",
          coordinate: seat.coordinates.x,
          label: `X: ${seat.coordinates.x}px`,
        });
      }

      // Horizontal alignment guide (shared Y)
      if (Math.abs(seat.coordinates.y - draggedSeat.coordinates.y) <= threshold) {
        guides.push({
          type: "HORIZONTAL",
          coordinate: seat.coordinates.y,
          label: `Y: ${seat.coordinates.y}px`,
        });
      }
    }

    return guides;
  }
}
