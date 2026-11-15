/**
 * ==============================================================================
 * CineSphere OS — Section & Row Layout Engine (Phase 4 – Parts 3 & 4)
 * ==============================================================================
 * Pure mathematical and procedural engine for:
 * 1. Generating seat coordinates based on row geometry (Straight, Curved, Arc, Angled).
 * 2. Generating seat numbers across naming strategies (Alphabetical, Numeric, Roman, Reverse).
 * 3. Section reordering (Up, Down, Bring Forward, Send Backward, Auto-sort).
 * 4. Row reordering and spacing calculations.
 * 5. Capacity aggregation across the Section -> Row -> Seat hierarchy.
 * ==============================================================================
 */

import {
  HallSection,
  HallRow,
  RowGeometryType,
  RowNumberingStrategy,
  SectionOrderingDirection,
} from "@/types/section-row-designer.types";
import { SeatDefinition } from "@/types/hall-designer.types";
import { SeatType } from "@/types/hall.types";

export class SectionRowEngine {
  private static readonly DEFAULT_SEAT_WIDTH = 36;
  private static readonly DEFAULT_SEAT_GAP = 12;

  /**
   * Generates Roman numeral string for an integer.
   */
  public static toRoman(num: number): string {
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
    for (const i in lookup) {
      while (num >= lookup[i]) {
        roman += i;
        num -= lookup[i];
      }
    }
    return roman || String(num);
  }

  /**
   * Generates alphabetical row label (1 -> A, 26 -> Z, 27 -> AA, 28 -> AB...).
   */
  public static toAlphabetical(index: number): string {
    let s = "";
    let n = index;
    while (n > 0) {
      const rem = (n - 1) % 26;
      s = String.fromCharCode(rem + 65) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s || "A";
  }

  /**
   * Generates formatted seat number string according to row configuration.
   */
  public static generateSeatNumber(
    rowName: string,
    seatColumnIndex: number, // 1-based index
    totalSeatsInRow: number,
    config: {
      numberingStrategy: RowNumberingStrategy;
      isReversed?: boolean;
      prefix?: string;
      suffix?: string;
      startIndex?: number;
      endIndex?: number;
    }
  ): string {
    const startIndex = config.startIndex ?? 1;
    let colNumber = config.isReversed
      ? startIndex + totalSeatsInRow - seatColumnIndex
      : startIndex + seatColumnIndex - 1;

    let colStr = String(colNumber);
    if (config.numberingStrategy === "ROMAN") {
      colStr = this.toRoman(colNumber);
    }

    const prefix = config.prefix || "";
    const suffix = config.suffix || "";

    if (config.numberingStrategy === "ALPHABETICAL") {
      return `${prefix}${rowName}${colStr}${suffix}`;
    }

    if (config.numberingStrategy === "NUMERIC") {
      return `${prefix}${rowName}-${colStr}${suffix}`;
    }

    return `${prefix}${rowName}${colStr}${suffix}`;
  }

  /**
   * Generates physical seat coordinates for a row according to its geometry.
   */
  public static calculateRowSeats(
    sectionId: string,
    row: HallRow,
    rowOrigin: { x: number; y: number },
    seatType: SeatType
  ): SeatDefinition[] {
    const seats: SeatDefinition[] = [];
    const pitch = this.DEFAULT_SEAT_WIDTH + this.DEFAULT_SEAT_GAP; // e.g. 48px
    const seatCount = row.seatCount;
    const geometry = row.geometry;

    for (let c = 1; c <= seatCount; c++) {
      let x = rowOrigin.x;
      let y = rowOrigin.y;

      switch (geometry.geometryType) {
        case "STRAIGHT": {
          x = rowOrigin.x + (c - 1) * pitch;
          y = rowOrigin.y;
          break;
        }

        case "CURVED":
        case "ARC": {
          // Circular arc geometry: center is offset downwards or upwards
          const radius = geometry.curveRadius || 600;
          const arcDegrees = 30; // 30 degree arc spread
          const angleStep = arcDegrees / Math.max(1, seatCount - 1);
          const angleRad = ((c - 1 - (seatCount - 1) / 2) * angleStep * Math.PI) / 180;

          // x = centerX + R * sin(angle)
          // y = rowY - R * (1 - cos(angle))
          x = Math.round(rowOrigin.x + (c - 1) * pitch);
          const sagitta = Math.round(radius * (1 - Math.cos(angleRad)));
          y = Math.round(rowOrigin.y + sagitta);
          break;
        }

        case "ANGLED": {
          const angle = geometry.angle || 15;
          const angleRad = (angle * Math.PI) / 180;
          x = Math.round(rowOrigin.x + (c - 1) * pitch * Math.cos(angleRad));
          y = Math.round(rowOrigin.y + (c - 1) * pitch * Math.sin(angleRad));
          break;
        }
      }

      if (geometry.offsetX) x += geometry.offsetX;
      if (geometry.offsetY) y += geometry.offsetY;

      const seatNum = this.generateSeatNumber(row.rowName, c, seatCount, row.configuration);
      const isWheelchair = row.accessibility === "WHEELCHAIR" || c === 1 && row.accessibility === "COMPANION";

      seats.push({
        id: `seat-${row.id}-${row.rowName}${c}`,
        seatNumber: seatNum,
        row: row.rowName,
        column: c,
        sectionId,
        seatType: row.categoryOverride || (isWheelchair ? "Wheelchair" : seatType),
        coordinates: { x, y },
        isActive: row.visibility === "VISIBLE",
        isAccessible: isWheelchair,
      });
    }

    return seats;
  }

  /**
   * Reorders an array of sections based on a direction command.
   */
  public static reorderSections(
    sections: HallSection[],
    targetSectionId: string,
    direction: SectionOrderingDirection
  ): HallSection[] {
    const list = [...sections].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = list.findIndex((s) => s.id === targetSectionId);
    if (index === -1) return sections;

    switch (direction) {
      case "UP": {
        if (index > 0) {
          const temp = list[index];
          list[index] = list[index - 1];
          list[index - 1] = temp;
        }
        break;
      }
      case "DOWN": {
        if (index < list.length - 1) {
          const temp = list[index];
          list[index] = list[index + 1];
          list[index + 1] = temp;
        }
        break;
      }
      case "TOP": {
        const [item] = list.splice(index, 1);
        list.unshift(item);
        break;
      }
      case "BOTTOM": {
        const [item] = list.splice(index, 1);
        list.push(item);
        break;
      }
      case "AUTO_SORT": {
        list.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
        break;
      }
    }

    // Reassign normalized display orders
    return list.map((sec, i) => ({
      ...sec,
      displayOrder: i + 1,
    }));
  }

  /**
   * Reorders rows within a section and normalizes sequences.
   */
  public static reorderRows(
    rows: HallRow[],
    targetRowId: string,
    direction: "UP" | "DOWN"
  ): HallRow[] {
    const list = [...rows].sort((a, b) => a.sequence - b.sequence);
    const index = list.findIndex((r) => r.id === targetRowId);
    if (index === -1) return rows;

    if (direction === "UP" && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === "DOWN" && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }

    return list.map((row, i) => ({
      ...row,
      sequence: i + 1,
    }));
  }

  /**
   * Recalculates total capacity of a section based on its rows.
   */
  public static calculateSectionCapacity(rows: HallRow[]): number {
    return rows.reduce((total, r) => total + r.seatCount, 0);
  }
}
