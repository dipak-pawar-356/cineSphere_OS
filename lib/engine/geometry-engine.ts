/**
 * ==============================================================================
 * CineSphere OS — Geometry & Advanced Layout Engine (Phase 4 – Part 8)
 * ==============================================================================
 * Comprehensive computational geometry engine:
 * 1. Affine Transformations (Translate, Rotate, Scale, Mirror, Matrix).
 * 2. Parametric Arc & Curved Row Mathematics (Sagitta, Chord, Curvature).
 * 3. Spatial Alignment, Equal Distribution & Polygon Offset Generators.
 * 4. Preflight Validation Engine before Publication (Unified Object Model).
 * ==============================================================================
 */

import {
  Point2D,
  BoundingBox,
  CurveControls,
  SymmetryAxis,
  AlignType,
  DistributeType,
  GeometryTransformCommand,
  BaseLayoutObject,
  LayoutPublishPreflightResult,
} from "@/types/geometry-layout.types";
import { LayoutVersion } from "@/types/hall-designer.types";
import { HallSection } from "@/types/section-row-designer.types";
import { SeatTemplate } from "@/types/seat-generator.types";
import { StructuralObject } from "@/types/structural-objects.types";
import { StructuralObjectEngine } from "./structural-object-engine";

export class GeometryEngine {
  /**
   * Angle conversion utilities.
   */
  public static degToRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  public static radToDeg(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  // ----------------------------------------------------------------------------
  // 1. Point Transformations (Translate, Rotate, Scale, Mirror, Matrix)
  // ----------------------------------------------------------------------------

  public static translatePoint(point: Point2D, dx: number, dy: number): Point2D {
    return {
      x: Math.round(point.x + dx),
      y: Math.round(point.y + dy),
    };
  }

  public static rotatePoint(point: Point2D, angleDeg: number, pivot: Point2D = { x: 0, y: 0 }): Point2D {
    const rad = this.degToRad(angleDeg);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const relX = point.x - pivot.x;
    const relY = point.y - pivot.y;

    return {
      x: Math.round(pivot.x + relX * cos - relY * sin),
      y: Math.round(pivot.y + relX * sin + relY * cos),
    };
  }

  public static scalePoint(point: Point2D, scaleX: number, scaleY: number, anchor: Point2D = { x: 0, y: 0 }): Point2D {
    return {
      x: Math.round(anchor.x + (point.x - anchor.x) * scaleX),
      y: Math.round(anchor.y + (point.y - anchor.y) * scaleY),
    };
  }

  public static mirrorPoint(point: Point2D, axis: SymmetryAxis, axisCoord: number): Point2D {
    if (axis === "HORIZONTAL") {
      // Mirror across vertical axis (x reflects across axisCoord)
      return {
        x: Math.round(2 * axisCoord - point.x),
        y: point.y,
      };
    } else if (axis === "VERTICAL") {
      // Mirror across horizontal axis (y reflects across axisCoord)
      return {
        x: point.x,
        y: Math.round(2 * axisCoord - point.y),
      };
    } else {
      // Radial inversion around center
      return {
        x: Math.round(2 * axisCoord - point.x),
        y: Math.round(2 * axisCoord - point.y),
      };
    }
  }

  public static applyAffineMatrix(
    point: Point2D,
    matrix: [number, number, number, number, number, number] // [a, b, c, d, tx, ty]
  ): Point2D {
    const [a, b, c, d, tx, ty] = matrix;
    return {
      x: Math.round(a * point.x + c * point.y + tx),
      y: Math.round(b * point.x + d * point.y + ty),
    };
  }

  // ----------------------------------------------------------------------------
  // 2. Arc & Curve Mathematics
  // ----------------------------------------------------------------------------

  /**
   * Calculate sagitta (arc height/depth): s = R * (1 - cos(theta / 2))
   */
  public static calculateSagitta(radius: number, arcAngleDeg: number): number {
    if (radius <= 0) return 0;
    const halfAngleRad = this.degToRad(arcAngleDeg / 2);
    return Math.round(radius * (1 - Math.cos(halfAngleRad)));
  }

  /**
   * Calculate curvature radius given chord width (W) and sagitta (s):
   * R = (s / 2) + (W^2 / (8 * s))
   */
  public static calculateRadiusFromSagitta(chordWidth: number, sagitta: number): number {
    if (sagitta <= 0 || chordWidth <= 0) return 0;
    return Math.round(sagitta / 2 + (chordWidth * chordWidth) / (8 * sagitta));
  }

  /**
   * Generate points along a circular arc.
   */
  public static generateArcPoints(
    center: Point2D,
    radius: number,
    startAngleDeg: number,
    endAngleDeg: number,
    steps: number
  ): Point2D[] {
    const points: Point2D[] = [];
    if (steps < 2) return points;

    const angleStep = (endAngleDeg - startAngleDeg) / (steps - 1);
    for (let i = 0; i < steps; i++) {
      const currentAngle = startAngleDeg + i * angleStep;
      const rad = this.degToRad(currentAngle);
      points.push({
        x: Math.round(center.x + radius * Math.cos(rad)),
        y: Math.round(center.y + radius * Math.sin(rad)),
      });
    }

    return points;
  }

  /**
   * Calculate arc coordinates for seats along a curved row.
   */
  public static calculateArcRowCoordinates(
    rowOrigin: Point2D,
    seatCount: number,
    spacing: number,
    radius: number,
    arcAngleDeg: number
  ): Array<{ x: number; y: number; rotation: number }> {
    const coords: Array<{ x: number; y: number; rotation: number }> = [];
    if (seatCount <= 0) return coords;

    if (seatCount === 1) {
      coords.push({ x: rowOrigin.x, y: rowOrigin.y, rotation: 0 });
      return coords;
    }

    const angleStep = arcAngleDeg / (seatCount - 1);
    const startAngle = -arcAngleDeg / 2;

    for (let i = 0; i < seatCount; i++) {
      const theta = startAngle + i * angleStep;
      const thetaRad = this.degToRad(theta);
      const sagittaOffset = radius * (1 - Math.cos(thetaRad));

      const x = Math.round(rowOrigin.x + (i - (seatCount - 1) / 2) * spacing);
      const y = Math.round(rowOrigin.y + sagittaOffset);
      const rotation = Math.round(theta);

      coords.push({ x, y, rotation });
    }

    return coords;
  }

  // ----------------------------------------------------------------------------
  // 3. Bounding Boxes, Polygons & Offsets
  // ----------------------------------------------------------------------------

  public static getBoundingBox(points: Point2D[]): BoundingBox {
    if (points.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, centerX: 0, centerY: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }

    const width = maxX - minX;
    const height = maxY - minY;

    return {
      minX,
      minY,
      maxX,
      maxY,
      width,
      height,
      centerX: Math.round(minX + width / 2),
      centerY: Math.round(minY + height / 2),
    };
  }

  /**
   * Calculate polygon area using Shoelace formula.
   */
  public static calculatePolygonArea(points: Point2D[]): number {
    const n = points.length;
    if (n < 3) return 0;

    let area = 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }

    return Math.abs(area / 2);
  }

  /**
   * Offset an outward or inward polygon boundary.
   */
  public static offsetPolygon(points: Point2D[], distance: number): Point2D[] {
    const bbox = this.getBoundingBox(points);
    if (bbox.width === 0 || bbox.height === 0) return points;

    return points.map((p) => {
      const dirX = p.x >= bbox.centerX ? 1 : -1;
      const dirY = p.y >= bbox.centerY ? 1 : -1;
      return {
        x: Math.round(p.x + dirX * distance),
        y: Math.round(p.y + dirY * distance),
      };
    });
  }

  // ----------------------------------------------------------------------------
  // 4. Alignment & Equal Distribution
  // ----------------------------------------------------------------------------

  public static alignObjects<T extends { position: { x: number; y: number }; width: number; height: number }>(
    objects: T[],
    alignType: AlignType
  ): T[] {
    if (objects.length <= 1) return objects;

    let targetCoord = 0;
    switch (alignType) {
      case "LEFT":
        targetCoord = Math.min(...objects.map((o) => o.position.x));
        return objects.map((o) => ({ ...o, position: { ...o.position, x: targetCoord } }));
      case "RIGHT":
        targetCoord = Math.max(...objects.map((o) => o.position.x + o.width));
        return objects.map((o) => ({ ...o, position: { ...o.position, x: targetCoord - o.width } }));
      case "TOP":
        targetCoord = Math.min(...objects.map((o) => o.position.y));
        return objects.map((o) => ({ ...o, position: { ...o.position, y: targetCoord } }));
      case "BOTTOM":
        targetCoord = Math.max(...objects.map((o) => o.position.y + o.height));
        return objects.map((o) => ({ ...o, position: { ...o.position, y: targetCoord - o.height } }));
      case "CENTER_X": {
        const minX = Math.min(...objects.map((o) => o.position.x));
        const maxX = Math.max(...objects.map((o) => o.position.x + o.width));
        const center = (minX + maxX) / 2;
        return objects.map((o) => ({
          ...o,
          position: { ...o.position, x: Math.round(center - o.width / 2) },
        }));
      }
      case "CENTER_Y": {
        const minY = Math.min(...objects.map((o) => o.position.y));
        const maxY = Math.max(...objects.map((o) => o.position.y + o.height));
        const center = (minY + maxY) / 2;
        return objects.map((o) => ({
          ...o,
          position: { ...o.position, y: Math.round(center - o.height / 2) },
        }));
      }
      default:
        return objects;
    }
  }

  public static distributeObjects<T extends { position: { x: number; y: number }; width: number; height: number }>(
    objects: T[],
    distributeType: DistributeType
  ): T[] {
    if (objects.length <= 2) return objects;

    if (distributeType === "HORIZONTAL") {
      const sorted = [...objects].sort((a, b) => a.position.x - b.position.x);
      const minX = sorted[0].position.x;
      const maxX = sorted[sorted.length - 1].position.x + sorted[sorted.length - 1].width;
      const totalWidthOccupied = sorted.reduce((sum, o) => sum + o.width, 0);
      const totalSpacing = maxX - minX - totalWidthOccupied;
      const stepSpacing = totalSpacing / (sorted.length - 1);

      let currentX = minX;
      return sorted.map((o, idx) => {
        if (idx === 0) {
          currentX += o.width + stepSpacing;
          return o;
        }
        const updated = { ...o, position: { ...o.position, x: Math.round(currentX) } };
        currentX += o.width + stepSpacing;
        return updated;
      });
    } else {
      const sorted = [...objects].sort((a, b) => a.position.y - b.position.y);
      const minY = sorted[0].position.y;
      const maxY = sorted[sorted.length - 1].position.y + sorted[sorted.length - 1].height;
      const totalHeightOccupied = sorted.reduce((sum, o) => sum + o.height, 0);
      const totalSpacing = maxY - minY - totalHeightOccupied;
      const stepSpacing = totalSpacing / (sorted.length - 1);

      let currentY = minY;
      return sorted.map((o, idx) => {
        if (idx === 0) {
          currentY += o.height + stepSpacing;
          return o;
        }
        const updated = { ...o, position: { ...o.position, y: Math.round(currentY) } };
        currentY += o.height + stepSpacing;
        return updated;
      });
    }
  }

  // ----------------------------------------------------------------------------
  // 5. Unified Layout Objects Transformation Pipeline (Invariant 2)
  // ----------------------------------------------------------------------------

  public static applyTransformationToObjects<T extends BaseLayoutObject>(
    objects: T[],
    command: GeometryTransformCommand
  ): T[] {
    const targetSet = new Set(command.targetObjectIds);
    const params = command.params;

    return objects.map((obj) => {
      if (!targetSet.has(obj.id)) return obj;
      if (obj.isLocked) return obj; // Locked objects cannot be transformed

      let updated = { ...obj };

      switch (command.type) {
        case "MOVE": {
          const dx = params.dx || 0;
          const dy = params.dy || 0;
          updated.position = {
            ...updated.position,
            x: updated.position.x + dx,
            y: updated.position.y + dy,
          };
          break;
        }
        case "ROTATE": {
          const angle = params.rotationAngleDeg || 0;
          const pivot = params.pivotPoint || {
            x: updated.position.x + updated.width / 2,
            y: updated.position.y + updated.height / 2,
          };
          const center = {
            x: updated.position.x + updated.width / 2,
            y: updated.position.y + updated.height / 2,
          };
          const rotatedCenter = this.rotatePoint(center, angle, pivot);
          updated.position = {
            ...updated.position,
            x: Math.round(rotatedCenter.x - updated.width / 2),
            y: Math.round(rotatedCenter.y - updated.height / 2),
          };
          updated.rotation = (updated.rotation + angle) % 360;
          break;
        }
        case "SCALE": {
          const sx = params.scaleX ?? 1;
          const sy = params.scaleY ?? 1;
          const anchor = params.scaleAnchor || {
            x: updated.position.x,
            y: updated.position.y,
          };
          const newPos = this.scalePoint(updated.position, sx, sy, anchor);
          updated.position = { ...updated.position, x: newPos.x, y: newPos.y };
          updated.width = Math.round(Math.max(10, updated.width * sx));
          updated.height = Math.round(Math.max(10, updated.height * sy));
          break;
        }
        case "MIRROR": {
          const axis = params.mirrorAxis || "HORIZONTAL";
          const axisCoord = params.mirrorAxisCoord ?? (axis === "HORIZONTAL" ? 800 : 600);
          const center = {
            x: updated.position.x + updated.width / 2,
            y: updated.position.y + updated.height / 2,
          };
          const mirroredCenter = this.mirrorPoint(center, axis, axisCoord);
          updated.position = {
            ...updated.position,
            x: Math.round(mirroredCenter.x - updated.width / 2),
            y: Math.round(mirroredCenter.y - updated.height / 2),
          };
          if (axis === "HORIZONTAL") {
            updated.rotation = (360 - updated.rotation) % 360;
          }
          break;
        }
        case "TRANSFORM_MATRIX": {
          if (params.matrix) {
            const newPos = this.applyAffineMatrix(updated.position, params.matrix);
            updated.position = { ...updated.position, x: newPos.x, y: newPos.y };
          }
          break;
        }
        default:
          break;
      }

      return updated;
    });
  }

  // ----------------------------------------------------------------------------
  // 6. Preflight Layout Validation Before Publication (Invariant 3)
  // ----------------------------------------------------------------------------

  public static validateLayoutBeforePublish(params: {
    layoutVersion: Partial<LayoutVersion>;
    sections: HallSection[];
    seats: SeatTemplate[];
    structuralObjects: StructuralObject[];
    canvasBounds?: { width: number; height: number };
  }): LayoutPublishPreflightResult {
    const {
      sections,
      seats,
      structuralObjects,
      canvasBounds = { width: 1600, height: 1200 },
    } = params;

    const blockingErrors: string[] = [];
    const complianceWarnings: string[] = [];

    // 1. Structural Objects Validation
    const structVal = StructuralObjectEngine.validateStructuralObjects(
      structuralObjects,
      seats,
      canvasBounds
    );
    blockingErrors.push(...structVal.errors);
    complianceWarnings.push(...structVal.warnings);

    // 2. Section and Row Integrity
    let totalRows = 0;
    let sectionRowSum = 0;
    let sectionRowParity = true;

    if (sections.length === 0) {
      blockingErrors.push("Layout must contain at least one seating section.");
    }

    for (const sec of sections) {
      totalRows += sec.rows.length;
      const rowSeats = sec.rows.reduce((sum, r) => sum + r.seatCount, 0);
      sectionRowSum += rowSeats;
      if (sec.capacity !== rowSeats && sec.rows.length > 0) {
        sectionRowParity = false;
        complianceWarnings.push(
          `Section '${sec.name}' capacity (${sec.capacity}) does not match sum of row seats (${rowSeats}).`
        );
      }
    }

    // 3. Seat Checks & Geometry Bounds
    let outOfBoundsCount = 0;
    let wheelchairCapacity = 0;
    let companionCapacity = 0;

    for (const s of seats) {
      if (s.accessibility.isWheelchairAccessible) wheelchairCapacity++;
      if (s.accessibility.hasCompanionSeat) companionCapacity++;

      if (
        s.coordinates.x < 0 ||
        s.coordinates.y < 0 ||
        s.coordinates.x > canvasBounds.width ||
        s.coordinates.y > canvasBounds.height
      ) {
        outOfBoundsCount++;
      }
    }

    if (outOfBoundsCount > 0) {
      blockingErrors.push(`${outOfBoundsCount} seat(s) placed outside legal canvas bounds.`);
    }

    // 4. Checklist status booleans
    const checklist = {
      hasScreen: structVal.summary.hasScreen,
      hasEmergencyExit: structVal.summary.hasEmergencyExit,
      hasEntrance: structVal.summary.hasEntrance,
      hasAccessiblePath: structVal.summary.hasAccessibleRoute || wheelchairCapacity === 0,
      hasNoStructuralCollisions: structVal.summary.collisions.length === 0,
      hasNoOutOfBounds: outOfBoundsCount === 0,
      hasValidGeometry: blockingErrors.length === 0,
      sectionRowParity,
    };

    const canPublish = blockingErrors.length === 0 && checklist.hasScreen;

    return {
      canPublish,
      blockingErrors,
      complianceWarnings,
      checklist,
      metrics: {
        totalSections: sections.length,
        totalRows,
        totalSeats: seats.length,
        totalStructuralObjects: structuralObjects.length,
        wheelchairCapacity,
        companionCapacity,
      },
      validatedAt: new Date().toISOString(),
    };
  }
}
