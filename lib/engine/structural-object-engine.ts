/**
 * ==============================================================================
 * CineSphere OS — Structural Object Pure Calculation Engine (Phase 4 – Part 7)
 * ==============================================================================
 * High-performance spatial math engine for structural infrastructure:
 * 1. Rotated 2D bounding boxes and geometric vertices calculation.
 * 2. Collision detection (AABB & Separating Axis Theorem) between obstacles
 *    (pillars, walls, stairs) and seat templates / rows.
 * 3. Egress compliance, screen visibility, emergency exit presence, and
 *    accessible path clearance verification.
 * ==============================================================================
 */

import {
  StructuralObject,
  StructuralCollision,
  StructuralObjectValidationResult,
  StructuralObjectType,
} from "@/types/structural-objects.types";
import { SeatTemplate } from "@/types/seat-generator.types";

export interface Point2D {
  x: number;
  y: number;
}

export interface RotatedRect {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  rotationDeg: number;
  corners: Point2D[];
}

export class StructuralObjectEngine {
  /**
   * Convert angle in degrees to radians.
   */
  public static degToRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Calculate 4 corner vertices of a rotated rectangle.
   */
  public static getRotatedCorners(
    x: number,
    y: number,
    width: number,
    height: number,
    rotationDeg: number
  ): Point2D[] {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const rad = this.degToRad(rotationDeg);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const halfW = width / 2;
    const halfH = height / 2;

    const localCorners = [
      { x: -halfW, y: -halfH }, // Top-Left
      { x: halfW, y: -halfH },  // Top-Right
      { x: halfW, y: halfH },   // Bottom-Right
      { x: -halfW, y: halfH },  // Bottom-Left
    ];

    return localCorners.map((pt) => ({
      x: Math.round(cx + pt.x * cos - pt.y * sin),
      y: Math.round(cy + pt.x * sin + pt.y * cos),
    }));
  }

  /**
   * Calculate axis-aligned bounding box for a rotated rectangle.
   */
  public static getAABB(corners: Point2D[]): { minX: number; minY: number; maxX: number; maxY: number } {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const pt of corners) {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }

    return { minX, minY, maxX, maxY };
  }

  /**
   * Axis-Aligned Bounding Box (AABB) intersection check.
   */
  public static isAABBIntersecting(
    boxA: { minX: number; minY: number; maxX: number; maxY: number },
    boxB: { minX: number; minY: number; maxX: number; maxY: number }
  ): boolean {
    return (
      boxA.minX <= boxB.maxX &&
      boxA.maxX >= boxB.minX &&
      boxA.minY <= boxB.maxY &&
      boxA.maxY >= boxB.minY
    );
  }

  /**
   * Check if a 2D point is inside a polygon using Ray-Casting algorithm.
   */
  public static isPointInPolygon(point: Point2D, polygon: Point2D[]): boolean {
    let inside = false;
    const { x, y } = point;
    const n = polygon.length;

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * Separating Axis Theorem (SAT) for convex polygons / rotated boxes.
   */
  public static arePolygonsIntersecting(polyA: Point2D[], polyB: Point2D[]): boolean {
    const polygons = [polyA, polyB];

    for (let i = 0; i < polygons.length; i++) {
      const polygon = polygons[i];
      for (let i1 = 0; i1 < polygon.length; i1++) {
        const i2 = (i1 + 1) % polygon.length;
        const p1 = polygon[i1];
        const p2 = polygon[i2];

        // Normal perpendicular vector to the edge
        const normal = { x: p2.y - p1.y, y: p1.x - p2.x };

        // Project both polygons onto the normal
        let minA = Infinity;
        let maxA = -Infinity;
        for (const p of polyA) {
          const projected = normal.x * p.x + normal.y * p.y;
          if (projected < minA) minA = projected;
          if (projected > maxA) maxA = projected;
        }

        let minB = Infinity;
        let maxB = -Infinity;
        for (const p of polyB) {
          const projected = normal.x * p.x + normal.y * p.y;
          if (projected < minB) minB = projected;
          if (projected > maxB) maxB = projected;
        }

        // Check if there is a gap between projections
        if (maxA < minB || maxB < minA) {
          return false; // Separating axis found!
        }
      }
    }

    return true; // No separating axis found; polygons intersect!
  }

  /**
   * Detect collisions between structural obstacles and seat templates.
   */
  public static detectObstacleSeatCollisions(
    obstacles: StructuralObject[],
    seats: SeatTemplate[]
  ): StructuralCollision[] {
    const collisions: StructuralCollision[] = [];

    // Filter only active collision obstacles
    const activeObstacles = obstacles.filter(
      (obj) => obj.visibility === "VISIBLE" && obj.metadata.isCollisionObstacle
    );

    for (const obstacle of activeObstacles) {
      const obstacleCorners = this.getRotatedCorners(
        obstacle.position.x,
        obstacle.position.y,
        obstacle.width,
        obstacle.height,
        obstacle.rotation
      );
      const obstacleAABB = this.getAABB(obstacleCorners);

      for (const seat of seats) {
        if (seat.status === "HIDDEN" || seat.status === "INACTIVE") continue;

        const seatW = seat.coordinates.width || 36;
        const seatH = seat.coordinates.height || 36;
        const seatCorners = this.getRotatedCorners(
          seat.coordinates.x,
          seat.coordinates.y,
          seatW,
          seatH,
          seat.coordinates.rotation || 0
        );
        const seatAABB = this.getAABB(seatCorners);

        // Quick AABB phase
        if (!this.isAABBIntersecting(obstacleAABB, seatAABB)) {
          continue;
        }

        // Precise SAT phase
        if (this.arePolygonsIntersecting(obstacleCorners, seatCorners)) {
          collisions.push({
            objectId: obstacle.id,
            objectName: obstacle.displayName || obstacle.objectName,
            collidingTargetId: seat.id,
            collidingTargetType: "SEAT",
            description: `Seat '${seat.metadata.displayName || seat.id}' physically collides with obstacle '${obstacle.displayName}'.`,
            coordinates: { x: seat.coordinates.x, y: seat.coordinates.y },
          });
        }
      }
    }

    return collisions;
  }

  /**
   * Validate full collection of structural objects for cinema hall regulatory compliance.
   */
  public static validateStructuralObjects(
    objects: StructuralObject[],
    seats: SeatTemplate[] = [],
    canvasBounds: { width: number; height: number } = { width: 1600, height: 1200 }
  ): StructuralObjectValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const codes = new Set<string>();
    const names = new Set<string>();

    let screenCount = 0;
    let emergencyExitCount = 0;
    let entranceCount = 0;
    let accessiblePathCount = 0;

    for (const obj of objects) {
      // 1. Unique Codes
      const normCode = obj.internalCode.trim().toUpperCase();
      if (codes.has(normCode)) {
        errors.push(`Duplicate structural object internal code: '${obj.internalCode}'. Codes must be unique.`);
      } else {
        codes.add(normCode);
      }

      // 2. Unique Names
      const normName = obj.objectName.trim().toLowerCase();
      if (names.has(normName)) {
        errors.push(`Duplicate structural object name: '${obj.objectName}'.`);
      } else {
        names.add(normName);
      }

      // 3. Positive Dimensions
      if (obj.width <= 0 || obj.height <= 0) {
        errors.push(`Structural object '${obj.displayName}' must have positive width and height.`);
      }

      // 4. Boundary Compliance
      if (
        obj.position.x < -100 ||
        obj.position.y < -100 ||
        obj.position.x + obj.width > canvasBounds.width + 100 ||
        obj.position.y + obj.height > canvasBounds.height + 100
      ) {
        warnings.push(
          `Structural object '${obj.displayName}' extends significantly beyond canvas boundaries (${canvasBounds.width}x${canvasBounds.height}).`
        );
      }

      // 5. Categorization count
      if (obj.visibility === "VISIBLE") {
        if (obj.objectType === "SCREEN") screenCount++;
        if (obj.objectType === "EMERGENCY_EXIT") emergencyExitCount++;
        if (obj.objectType === "ENTRANCE" || obj.objectType === "EXIT") entranceCount++;
        if (obj.objectType === "ACCESSIBLE_PATH") accessiblePathCount++;
      }
    }

    // 6. Regulatory Cinema Checks
    const hasScreen = screenCount > 0;
    if (!hasScreen) {
      errors.push("Cinema Hall layout must include at least one visible SCREEN structural object.");
    }

    const hasEmergencyExit = emergencyExitCount > 0;
    if (!hasEmergencyExit) {
      warnings.push("Layout has no visible Emergency Exits. Standard safety regulations require at least 1 emergency exit.");
    }

    const hasEntrance = entranceCount > 0;
    if (!hasEntrance) {
      warnings.push("Layout has no visible Entrance or Exit structural objects defined.");
    }

    // 7. Wheelchair Accessibility Route Check
    const wheelchairSeats = seats.filter((s) => s.accessibility.isWheelchairAccessible);
    const hasAccessibleRoute = accessiblePathCount > 0;
    if (wheelchairSeats.length > 0 && !hasAccessibleRoute) {
      warnings.push(
        `Layout includes ${wheelchairSeats.length} wheelchair seat(s), but no ACCESSIBLE_PATH structural object is defined.`
      );
    }

    // 8. Obstacle Collision Detection
    const collisions = this.detectObstacleSeatCollisions(objects, seats);
    if (collisions.length > 0) {
      errors.push(
        `Detected ${collisions.length} physical collision(s) between structural obstacles and seats: ${collisions.slice(0, 3).map((c) => c.description).join("; ")}${collisions.length > 3 ? "..." : ""}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalObjects: objects.length,
        screenCount,
        emergencyExitCount,
        entranceCount,
        accessiblePathCount,
        collisions,
        hasScreen,
        hasEmergencyExit,
        hasEntrance,
        hasAccessibleRoute,
      },
    };
  }
}
