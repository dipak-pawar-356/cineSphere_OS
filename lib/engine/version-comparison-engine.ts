/**
 * ==============================================================================
 * CineSphere OS — Version Comparison Engine (Phase 4 – Part 11)
 * ==============================================================================
 * Pure comparison engine computing deep structural differences between two
 * layout versions: Sections, Rows, Seats, Structural Objects, Geometry, and
 * Metadata diffs.
 * ==============================================================================
 */

import { LayoutVersion } from "@/types/hall-designer.types";
import { StructuralObject } from "@/types/structural-objects.types";
import {
  VersionComparisonDiff,
  SectionDiffItem,
  SeatDiffItem,
  StructuralObjectDiffItem,
} from "@/types/layout-versioning.types";

export class VersionComparisonEngine {
  /**
   * Compute comprehensive diff between source version and target version.
   */
  public static compareVersions(
    sourceVer: LayoutVersion,
    targetVer: LayoutVersion,
    sourceStructuralObjects: StructuralObject[] = [],
    targetStructuralObjects: StructuralObject[] = []
  ): VersionComparisonDiff {
    const sectionDiffs = this.compareSections(sourceVer, targetVer);
    const seatDiffs = this.compareSeats(sourceVer, targetVer);
    const structuralDiffs = this.compareStructuralObjects(
      sourceStructuralObjects,
      targetStructuralObjects
    );

    const sectionsAdded = sectionDiffs.filter((d) => d.diffType === "ADDED").length;
    const sectionsRemoved = sectionDiffs.filter((d) => d.diffType === "REMOVED").length;
    const sectionsModified = sectionDiffs.filter((d) => d.diffType === "MODIFIED").length;

    const seatsAdded = seatDiffs.filter((d) => d.diffType === "ADDED").length;
    const seatsRemoved = seatDiffs.filter((d) => d.diffType === "REMOVED").length;
    const seatsModified = seatDiffs.filter((d) => d.diffType === "MODIFIED").length;

    const structuralAdded = structuralDiffs.filter((d) => d.diffType === "ADDED").length;
    const structuralRemoved = structuralDiffs.filter((d) => d.diffType === "REMOVED").length;
    const structuralModified = structuralDiffs.filter((d) => d.diffType === "MODIFIED").length;

    const capacityDelta =
      (targetVer.seats?.length || 0) - (sourceVer.seats?.length || 0);
    const hasBreakingChanges = seatsRemoved > 0 || sectionsRemoved > 0;

    return {
      sourceVersionId: sourceVer.id,
      sourceVersionNumber: sourceVer.versionNumber,
      targetVersionId: targetVer.id,
      targetVersionNumber: targetVer.versionNumber,
      theatreId: targetVer.theatreId,
      calculatedAt: new Date().toISOString(),
      summary: {
        sectionsAdded,
        sectionsRemoved,
        sectionsModified,
        seatsAdded,
        seatsRemoved,
        seatsModified,
        structuralAdded,
        structuralRemoved,
        structuralModified,
        capacityDelta,
        hasBreakingChanges,
      },
      sectionDiffs,
      seatDiffs,
      structuralDiffs,
      geometrySummary: {
        sourceGrid: sourceVer.gridConfig || { rows: 0, columns: 0, totalCapacity: 0 },
        targetGrid: targetVer.gridConfig || { rows: 0, columns: 0, totalCapacity: 0 },
      },
      metadataDiff: {
        sourceNotes: sourceVer.versionNotes,
        targetNotes: targetVer.versionNotes,
        sourceStatus: sourceVer.status as any,
        targetStatus: targetVer.status as any,
      },
    };
  }

  // ----------------------------------------------------------------------------
  // Internal Diff Helpers
  // ----------------------------------------------------------------------------

  private static compareSections(
    sourceVer: LayoutVersion,
    targetVer: LayoutVersion
  ): SectionDiffItem[] {
    const diffs: SectionDiffItem[] = [];
    const sourceSections = sourceVer.sections || [];
    const targetSections = targetVer.sections || [];
    const sourceMap = new Map(sourceSections.map((s) => [s.id, s]));
    const targetMap = new Map(targetSections.map((s) => [s.id, s]));

    // Check added and modified
    for (const [id, targetSec] of targetMap.entries()) {
      const sourceSec = sourceMap.get(id);
      if (!sourceSec) {
        diffs.push({
          sectionId: id,
          name: targetSec.name,
          diffType: "ADDED",
          changes: {},
        });
      } else {
        const changes: SectionDiffItem["changes"] = {};
        let modified = false;

        if (sourceSec.name !== targetSec.name) {
          changes.name = { before: sourceSec.name, after: targetSec.name };
          modified = true;
        }
        if (sourceSec.seatCount !== targetSec.seatCount) {
          changes.seatCount = { before: sourceSec.seatCount, after: targetSec.seatCount };
          modified = true;
        }
        if (sourceSec.displayColor !== targetSec.displayColor) {
          changes.color = { before: sourceSec.displayColor, after: targetSec.displayColor };
          modified = true;
        }

        diffs.push({
          sectionId: id,
          name: targetSec.name,
          diffType: modified ? "MODIFIED" : "UNCHANGED",
          changes,
        });
      }
    }

    // Check removed
    for (const [id, sourceSec] of sourceMap.entries()) {
      if (!targetMap.has(id)) {
        diffs.push({
          sectionId: id,
          name: sourceSec.name,
          diffType: "REMOVED",
          changes: {},
        });
      }
    }

    return diffs;
  }

  private static compareSeats(
    sourceVer: LayoutVersion,
    targetVer: LayoutVersion
  ): SeatDiffItem[] {
    const diffs: SeatDiffItem[] = [];
    const sourceSeats = sourceVer.seats || [];
    const targetSeats = targetVer.seats || [];
    const sourceMap = new Map(sourceSeats.map((s) => [s.seatNumber, s]));
    const targetMap = new Map(targetSeats.map((s) => [s.seatNumber, s]));

    for (const [seatNumber, targetSeat] of targetMap.entries()) {
      const sourceSeat = sourceMap.get(seatNumber);
      if (!sourceSeat) {
        diffs.push({
          seatId: targetSeat.id,
          seatNumber,
          diffType: "ADDED",
          changes: {},
        });
      } else {
        const changes: SeatDiffItem["changes"] = {};
        let modified = false;

        if (sourceSeat.seatType !== targetSeat.seatType) {
          changes.type = { before: sourceSeat.seatType, after: targetSeat.seatType };
          modified = true;
        }
        if (
          sourceSeat.coordinates.x !== targetSeat.coordinates.x ||
          sourceSeat.coordinates.y !== targetSeat.coordinates.y
        ) {
          changes.coordinates = {
            before: { x: sourceSeat.coordinates.x, y: sourceSeat.coordinates.y },
            after: { x: targetSeat.coordinates.x, y: targetSeat.coordinates.y },
          };
          modified = true;
        }
        if (Boolean(sourceSeat.isAccessible) !== Boolean(targetSeat.isAccessible)) {
          changes.accessibility = {
            before: Boolean(sourceSeat.isAccessible),
            after: Boolean(targetSeat.isAccessible),
          };
          modified = true;
        }

        diffs.push({
          seatId: targetSeat.id,
          seatNumber,
          diffType: modified ? "MODIFIED" : "UNCHANGED",
          changes,
        });
      }
    }

    for (const [seatNumber, sourceSeat] of sourceMap.entries()) {
      if (!targetMap.has(seatNumber)) {
        diffs.push({
          seatId: sourceSeat.id,
          seatNumber,
          diffType: "REMOVED",
          changes: {},
        });
      }
    }

    return diffs;
  }

  private static compareStructuralObjects(
    sourceObjects: StructuralObject[],
    targetObjects: StructuralObject[]
  ): StructuralObjectDiffItem[] {
    const diffs: StructuralObjectDiffItem[] = [];
    const sourceMap = new Map(sourceObjects.map((o) => [o.internalCode || o.id, o]));
    const targetMap = new Map(targetObjects.map((o) => [o.internalCode || o.id, o]));

    for (const [code, targetObj] of targetMap.entries()) {
      const sourceObj = sourceMap.get(code);
      if (!sourceObj) {
        diffs.push({
          objectId: targetObj.id,
          displayName: targetObj.displayName,
          objectType: targetObj.objectType,
          diffType: "ADDED",
          changes: {},
        });
      } else {
        const changes: StructuralObjectDiffItem["changes"] = {};
        let modified = false;

        if (sourceObj.displayName !== targetObj.displayName) {
          changes.displayName = { before: sourceObj.displayName, after: targetObj.displayName };
          modified = true;
        }
        if (
          sourceObj.position.x !== targetObj.position.x ||
          sourceObj.position.y !== targetObj.position.y
        ) {
          changes.position = {
            before: { x: sourceObj.position.x, y: sourceObj.position.y },
            after: { x: targetObj.position.x, y: targetObj.position.y },
          };
          modified = true;
        }
        if (
          sourceObj.width !== targetObj.width ||
          sourceObj.height !== targetObj.height
        ) {
          changes.dimensions = {
            before: { width: sourceObj.width, height: sourceObj.height },
            after: { width: targetObj.width, height: targetObj.height },
          };
          modified = true;
        }
        if (sourceObj.rotation !== targetObj.rotation) {
          changes.rotation = { before: sourceObj.rotation, after: targetObj.rotation };
          modified = true;
        }

        diffs.push({
          objectId: targetObj.id,
          displayName: targetObj.displayName,
          objectType: targetObj.objectType,
          diffType: modified ? "MODIFIED" : "UNCHANGED",
          changes,
        });
      }
    }

    for (const [code, sourceObj] of sourceMap.entries()) {
      if (!targetMap.has(code)) {
        diffs.push({
          objectId: sourceObj.id,
          displayName: sourceObj.displayName,
          objectType: sourceObj.objectType,
          diffType: "REMOVED",
          changes: {},
        });
      }
    }

    return diffs;
  }
}
