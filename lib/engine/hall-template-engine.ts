import {
  HallTemplateDefinition,
  CreateTemplatePayload,
  GenerateLayoutFromTemplatePayload,
} from "@/types/hall-templates.types";
import {
  LayoutDefinition,
  LayoutVersion,
  HallSectionDefinition,
  SeatDefinition,
} from "@/types/hall-designer.types";
import { SeatType } from "@/types/hall.types";
import { StructuralObject, StructuralObjectType } from "@/types/structural-objects.types";

/**
 * ==============================================================================
 * CineSphere OS — Hall Template Engine (Phase 4 – Part 14)
 * ==============================================================================
 * Pure blueprint and layout generation engine.
 * Templates are blueprints that generate new, isolated Layout Definitions.
 * Editing a generated layout never alters the original template.
 * ==============================================================================
 */

export class HallTemplateEngine {
  /**
   * Helper to build strongly-typed structural objects for templates.
   */
  private static makeStructuralObj(params: {
    id: string;
    layoutVersionId: string;
    objectType: StructuralObjectType;
    displayName: string;
    internalCode: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    now: string;
  }): StructuralObject {
    const isBarrier = params.objectType !== "SCREEN" && params.objectType !== "EMERGENCY_EXIT";
    return {
      id: params.id,
      theatreId: "system",
      layoutVersionId: params.layoutVersionId,
      objectName: params.displayName,
      displayName: params.displayName,
      objectType: params.objectType,
      internalCode: params.internalCode,
      position: { x: params.x, y: params.y },
      width: params.width,
      height: params.height,
      rotation: 0,
      layer: 1,
      zIndex: 10,
      visibility: "VISIBLE",
      color: params.color,
      isLocked: false,
      metadata: {
        isStatic: true,
        isCollisionObstacle: isBarrier,
        isReservedArea: false,
      },
      geometry: {
        shape: "RECTANGLE",
        fillColor: params.color,
      },
      createdAt: params.now,
      updatedAt: params.now,
    };
  }

  /**
   * Helper to build strongly-typed seat grids for templates.
   */
  private static buildSeats(params: {
    prefix: string;
    total: number;
    cols: number;
    startX: number;
    startY: number;
    dx: number;
    dy: number;
    sectionResolver: (rowIdx: number, colNum: number) => {
      sectionId: string;
      seatType: SeatType;
      isAccessible?: boolean;
    };
  }): SeatDefinition[] {
    const { prefix, total, cols, startX, startY, dx, dy, sectionResolver } = params;
    return Array.from({ length: total }, (_, i) => {
      const rowIdx = Math.floor(i / cols);
      const rowChar = String.fromCharCode(65 + rowIdx);
      const colNum = (i % cols) + 1;
      const spec = sectionResolver(rowIdx, colNum);
      return {
        id: `${prefix}-${rowChar}${colNum}`,
        seatNumber: `${rowChar}${colNum}`,
        row: rowChar,
        column: colNum,
        sectionId: spec.sectionId,
        seatType: spec.seatType,
        coordinates: {
          x: startX + (colNum - 1) * dx,
          y: startY + rowIdx * dy,
        },
        isActive: true,
        isAccessible: Boolean(spec.isAccessible),
      };
    });
  }

  /**
   * Catalog of 8 built-in platform templates.
   */
  public static getBuiltInTemplates(): HallTemplateDefinition[] {
    const now = "2026-11-16T00:00:00Z";

    return [
      // 1. Small Theatre (40 Seats)
      {
        id: "tpl-built-in-small-theatre",
        name: "Art-House Small Theatre",
        code: "TPL_SMALL_THEATRE",
        category: "SMALL_THEATRE",
        description: "Intimate art-house screening room with 40 seats, accessible stalls and front screen.",
        isBuiltIn: true,
        versionNumber: 1,
        visibility: "PLATFORM",
        status: "ACTIVE",
        canvasSettings: {
          width: 800,
          height: 600,
          gridSize: 20,
          snapToGrid: true,
          showGrid: true,
          showLabels: true,
          theme: "dark",
        },
        gridConfig: {
          rows: 4,
          columns: 10,
          seatWidth: 32,
          seatHeight: 32,
          seatSpacingX: 12,
          seatSpacingY: 16,
          rowSpacing: 24,
          totalCapacity: 40,
        },
        sections: [
          {
            id: "sec-small-main",
            name: "Main Stalls",
            displayOrder: 1,
            seatCount: 40,
            seatType: "Standard",
            displayColor: "#38BDF8",
            rowLabels: ["A", "B", "C", "D"],
            seatsPerRow: 10,
          },
        ],
        seats: this.buildSeats({
          prefix: "seat-small",
          total: 40,
          cols: 10,
          startX: 180,
          startY: 220,
          dx: 44,
          dy: 56,
          sectionResolver: (r, c) => {
            const isWheelchair = r === 0 && (c === 1 || c === 10);
            return {
              sectionId: "sec-small-main",
              seatType: isWheelchair ? "Wheelchair" : "Standard",
              isAccessible: isWheelchair,
            };
          },
        }),
        structuralObjects: [
          this.makeStructuralObj({
            id: "struct-small-screen",
            layoutVersionId: "tpl-built-in-small-theatre",
            objectType: "SCREEN",
            displayName: "Screen 1 - 2K Micro",
            internalCode: "SCR-01",
            x: 250,
            y: 80,
            width: 300,
            height: 30,
            color: "#38BDF8",
            now,
          }),
          this.makeStructuralObj({
            id: "struct-small-exit",
            layoutVersionId: "tpl-built-in-small-theatre",
            objectType: "EMERGENCY_EXIT",
            displayName: "Fire Exit East",
            internalCode: "EXT-01",
            x: 680,
            y: 350,
            width: 40,
            height: 80,
            color: "#EF4444",
            now,
          }),
        ],
        createdAt: now,
        updatedAt: now,
      },

      // 2. Multiplex Standard (120 Seats)
      {
        id: "tpl-built-in-multiplex",
        name: "Standard Commercial Multiplex",
        code: "TPL_MULTIPLEX_STD",
        category: "MULTIPLEX",
        description: "Standard tiered commercial cinema hall with 120 seats across Executive and VIP sections.",
        isBuiltIn: true,
        versionNumber: 1,
        visibility: "PLATFORM",
        status: "ACTIVE",
        canvasSettings: {
          width: 1000,
          height: 800,
          gridSize: 20,
          snapToGrid: true,
          showGrid: true,
          showLabels: true,
          theme: "dark",
        },
        gridConfig: {
          rows: 8,
          columns: 15,
          seatWidth: 32,
          seatHeight: 32,
          seatSpacingX: 12,
          seatSpacingY: 16,
          rowSpacing: 24,
          totalCapacity: 120,
        },
        sections: [
          {
            id: "sec-multi-std",
            name: "Executive Stalls",
            displayOrder: 1,
            seatCount: 90,
            seatType: "Standard",
            displayColor: "#3B82F6",
            rowLabels: ["A", "B", "C", "D", "E", "F"],
            seatsPerRow: 15,
          },
          {
            id: "sec-multi-vip",
            name: "Royal Club",
            displayOrder: 2,
            seatCount: 30,
            seatType: "VIP",
            displayColor: "#F59E0B",
            rowLabels: ["G", "H"],
            seatsPerRow: 15,
          },
        ],
        seats: this.buildSeats({
          prefix: "seat-multi",
          total: 120,
          cols: 15,
          startX: 170,
          startY: 200,
          dx: 44,
          dy: 56,
          sectionResolver: (r, c) => {
            const isVip = r >= 6;
            const isWheelchair = r === 0 && (c === 1 || c === 2);
            return {
              sectionId: isVip ? "sec-multi-vip" : "sec-multi-std",
              seatType: isVip ? "VIP" : isWheelchair ? "Wheelchair" : "Standard",
              isAccessible: isWheelchair,
            };
          },
        }),
        structuralObjects: [
          this.makeStructuralObj({
            id: "struct-multi-screen",
            layoutVersionId: "tpl-built-in-multiplex",
            objectType: "SCREEN",
            displayName: "Silver Screen 4K",
            internalCode: "SCR-MULTI",
            x: 250,
            y: 70,
            width: 500,
            height: 40,
            color: "#38BDF8",
            now,
          }),
          this.makeStructuralObj({
            id: "struct-multi-exit",
            layoutVersionId: "tpl-built-in-multiplex",
            objectType: "EMERGENCY_EXIT",
            displayName: "Fire Exit West",
            internalCode: "EXT-MULTI",
            x: 60,
            y: 450,
            width: 40,
            height: 90,
            color: "#EF4444",
            now,
          }),
        ],
        createdAt: now,
        updatedAt: now,
      },

      // 3. Premium Recliner Lounge (60 Seats)
      {
        id: "tpl-built-in-premium",
        name: "Luxe Recliner Auditorium",
        code: "TPL_PREMIUM_LUXE",
        category: "PREMIUM",
        description: "Ultra-luxury VIP auditorium with 60 motorized recliners, personal tables, and butler call corridors.",
        isBuiltIn: true,
        versionNumber: 1,
        visibility: "PLATFORM",
        status: "ACTIVE",
        canvasSettings: {
          width: 900,
          height: 700,
          gridSize: 20,
          snapToGrid: true,
          showGrid: true,
          showLabels: true,
          theme: "dark",
        },
        gridConfig: {
          rows: 6,
          columns: 10,
          seatWidth: 44,
          seatHeight: 44,
          seatSpacingX: 20,
          seatSpacingY: 24,
          rowSpacing: 36,
          totalCapacity: 60,
        },
        sections: [
          {
            id: "sec-prem-luxe",
            name: "Director's Cut Lounge",
            displayOrder: 1,
            seatCount: 60,
            seatType: "Recliner",
            displayColor: "#F59E0B",
            rowLabels: ["A", "B", "C", "D", "E", "F"],
            seatsPerRow: 10,
          },
        ],
        seats: this.buildSeats({
          prefix: "seat-prem",
          total: 60,
          cols: 10,
          startX: 150,
          startY: 220,
          dx: 64,
          dy: 70,
          sectionResolver: () => ({
            sectionId: "sec-prem-luxe",
            seatType: "Recliner",
          }),
        }),
        structuralObjects: [
          this.makeStructuralObj({
            id: "struct-prem-screen",
            layoutVersionId: "tpl-built-in-premium",
            objectType: "SCREEN",
            displayName: "Christie 4K RGB Laser Screen",
            internalCode: "SCR-PREM",
            x: 200,
            y: 60,
            width: 500,
            height: 50,
            color: "#F59E0B",
            now,
          }),
          this.makeStructuralObj({
            id: "struct-prem-exit",
            layoutVersionId: "tpl-built-in-premium",
            objectType: "EMERGENCY_EXIT",
            displayName: "Luxe VIP Egress",
            internalCode: "EXT-PREM",
            x: 820,
            y: 380,
            width: 40,
            height: 90,
            color: "#EF4444",
            now,
          }),
        ],
        createdAt: now,
        updatedAt: now,
      },

      // 4. IMAX Large Format (180 Seats)
      {
        id: "tpl-built-in-imax",
        name: "IMAX Grand Geometry",
        code: "TPL_IMAX_GRAND",
        category: "IMAX",
        description: "Steep amphitheater rake with 180 seats, wall-to-wall screen curvature, and acoustic baffle geometry.",
        isBuiltIn: true,
        versionNumber: 1,
        visibility: "PLATFORM",
        status: "ACTIVE",
        canvasSettings: {
          width: 1200,
          height: 900,
          gridSize: 20,
          snapToGrid: true,
          showGrid: true,
          showLabels: true,
          theme: "dark",
        },
        gridConfig: {
          rows: 10,
          columns: 18,
          seatWidth: 32,
          seatHeight: 32,
          seatSpacingX: 12,
          seatSpacingY: 16,
          rowSpacing: 26,
          totalCapacity: 180,
        },
        sections: [
          {
            id: "sec-imax-main",
            name: "IMAX Arena",
            displayOrder: 1,
            seatCount: 180,
            seatType: "Standard",
            displayColor: "#06B6D4",
            rowLabels: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
            seatsPerRow: 18,
          },
        ],
        seats: this.buildSeats({
          prefix: "seat-imax",
          total: 180,
          cols: 18,
          startX: 180,
          startY: 220,
          dx: 44,
          dy: 58,
          sectionResolver: (r, c) => {
            const isWheelchair = r === 0 && (c === 1 || c === 18);
            return {
              sectionId: "sec-imax-main",
              seatType: isWheelchair ? "Wheelchair" : "Standard",
              isAccessible: isWheelchair,
            };
          },
        }),
        structuralObjects: [
          this.makeStructuralObj({
            id: "struct-imax-screen",
            layoutVersionId: "tpl-built-in-imax",
            objectType: "SCREEN",
            displayName: "IMAX Commercial Laser 75ft",
            internalCode: "SCR-IMAX",
            x: 200,
            y: 50,
            width: 800,
            height: 60,
            color: "#06B6D4",
            now,
          }),
          this.makeStructuralObj({
            id: "struct-imax-exit",
            layoutVersionId: "tpl-built-in-imax",
            objectType: "EMERGENCY_EXIT",
            displayName: "Fire Egress Arena North",
            internalCode: "EXT-IMAX",
            x: 60,
            y: 400,
            width: 40,
            height: 100,
            color: "#EF4444",
            now,
          }),
        ],
        createdAt: now,
        updatedAt: now,
      },

      // 5. 4DX Dynamic Motion (80 Seats)
      {
        id: "tpl-built-in-4dx",
        name: "4DX Dynamic Motion Theatre",
        code: "TPL_4DX_MOTION",
        category: "4DX",
        description: "Specialized 80-seat motion pods grouped in 4-seat clusters with environmental fans, fog, and water lines.",
        isBuiltIn: true,
        versionNumber: 1,
        visibility: "PLATFORM",
        status: "ACTIVE",
        canvasSettings: {
          width: 950,
          height: 750,
          gridSize: 20,
          snapToGrid: true,
          showGrid: true,
          showLabels: true,
          theme: "dark",
        },
        gridConfig: {
          rows: 8,
          columns: 10,
          seatWidth: 36,
          seatHeight: 36,
          seatSpacingX: 16,
          seatSpacingY: 20,
          rowSpacing: 30,
          totalCapacity: 80,
        },
        sections: [
          {
            id: "sec-4dx-motion",
            name: "4DX Motion Arena",
            displayOrder: 1,
            seatCount: 80,
            seatType: "Standard",
            displayColor: "#10B981",
            rowLabels: ["A", "B", "C", "D", "E", "F", "G", "H"],
            seatsPerRow: 10,
          },
        ],
        seats: this.buildSeats({
          prefix: "seat-4dx",
          total: 80,
          cols: 10,
          startX: 200,
          startY: 200,
          dx: 54,
          dy: 62,
          sectionResolver: () => ({
            sectionId: "sec-4dx-motion",
            seatType: "Standard",
          }),
        }),
        structuralObjects: [
          this.makeStructuralObj({
            id: "struct-4dx-screen",
            layoutVersionId: "tpl-built-in-4dx",
            objectType: "SCREEN",
            displayName: "4DX Silver Screen",
            internalCode: "SCR-4DX",
            x: 240,
            y: 60,
            width: 480,
            height: 40,
            color: "#10B981",
            now,
          }),
          this.makeStructuralObj({
            id: "struct-4dx-exit",
            layoutVersionId: "tpl-built-in-4dx",
            objectType: "EMERGENCY_EXIT",
            displayName: "Emergency Egress South",
            internalCode: "EXT-4DX",
            x: 80,
            y: 400,
            width: 40,
            height: 80,
            color: "#EF4444",
            now,
          }),
        ],
        createdAt: now,
        updatedAt: now,
      },

      // 6. Open Air / Festival (150 Seats)
      {
        id: "tpl-built-in-open-air",
        name: "Open-Air Festival Lawn",
        code: "TPL_OPEN_AIR",
        category: "OPEN_AIR",
        description: "Wide-spread festival terrace with 150 deck seats, double perimeter aisles, and outdoor truss screen.",
        isBuiltIn: true,
        versionNumber: 1,
        visibility: "PLATFORM",
        status: "ACTIVE",
        canvasSettings: {
          width: 1100,
          height: 850,
          gridSize: 20,
          snapToGrid: true,
          showGrid: true,
          showLabels: true,
          theme: "dark",
        },
        gridConfig: {
          rows: 10,
          columns: 15,
          seatWidth: 32,
          seatHeight: 32,
          seatSpacingX: 14,
          seatSpacingY: 18,
          rowSpacing: 26,
          totalCapacity: 150,
        },
        sections: [
          {
            id: "sec-openair-lawn",
            name: "Festival Deck",
            displayOrder: 1,
            seatCount: 150,
            seatType: "Standard",
            displayColor: "#8B5CF6",
            rowLabels: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
            seatsPerRow: 15,
          },
        ],
        seats: this.buildSeats({
          prefix: "seat-open",
          total: 150,
          cols: 15,
          startX: 180,
          startY: 220,
          dx: 48,
          dy: 56,
          sectionResolver: () => ({
            sectionId: "sec-openair-lawn",
            seatType: "Standard",
          }),
        }),
        structuralObjects: [
          this.makeStructuralObj({
            id: "struct-open-screen",
            layoutVersionId: "tpl-built-in-open-air",
            objectType: "SCREEN",
            displayName: "Festival Inflatable MegaScreen",
            internalCode: "SCR-OPEN",
            x: 250,
            y: 60,
            width: 600,
            height: 50,
            color: "#8B5CF6",
            now,
          }),
          this.makeStructuralObj({
            id: "struct-open-exit",
            layoutVersionId: "tpl-built-in-open-air",
            objectType: "EMERGENCY_EXIT",
            displayName: "Perimeter Gate East",
            internalCode: "EXT-OPEN",
            x: 960,
            y: 400,
            width: 50,
            height: 100,
            color: "#EF4444",
            now,
          }),
        ],
        createdAt: now,
        updatedAt: now,
      },

      // 7. Mini Private Screening (24 Seats)
      {
        id: "tpl-built-in-mini",
        name: "Private Screening Salon",
        code: "TPL_MINI_SALON",
        category: "MINI_THEATRE",
        description: "Compact 24-seat private boutique theatre tailored for film premieres, cast screenings, and executive suites.",
        isBuiltIn: true,
        versionNumber: 1,
        visibility: "PLATFORM",
        status: "ACTIVE",
        canvasSettings: {
          width: 700,
          height: 550,
          gridSize: 20,
          snapToGrid: true,
          showGrid: true,
          showLabels: true,
          theme: "dark",
        },
        gridConfig: {
          rows: 3,
          columns: 8,
          seatWidth: 38,
          seatHeight: 38,
          seatSpacingX: 18,
          seatSpacingY: 20,
          rowSpacing: 34,
          totalCapacity: 24,
        },
        sections: [
          {
            id: "sec-mini-salon",
            name: "Salon Club",
            displayOrder: 1,
            seatCount: 24,
            seatType: "VIP",
            displayColor: "#EC4899",
            rowLabels: ["A", "B", "C"],
            seatsPerRow: 8,
          },
        ],
        seats: this.buildSeats({
          prefix: "seat-mini",
          total: 24,
          cols: 8,
          startX: 140,
          startY: 200,
          dx: 56,
          dy: 70,
          sectionResolver: () => ({
            sectionId: "sec-mini-salon",
            seatType: "VIP",
          }),
        }),
        structuralObjects: [
          this.makeStructuralObj({
            id: "struct-mini-screen",
            layoutVersionId: "tpl-built-in-mini",
            objectType: "SCREEN",
            displayName: "Sony Crystal LED 4K",
            internalCode: "SCR-MINI",
            x: 200,
            y: 60,
            width: 300,
            height: 35,
            color: "#EC4899",
            now,
          }),
          this.makeStructuralObj({
            id: "struct-mini-exit",
            layoutVersionId: "tpl-built-in-mini",
            objectType: "EMERGENCY_EXIT",
            displayName: "Private Suite Egress",
            internalCode: "EXT-MINI",
            x: 580,
            y: 300,
            width: 35,
            height: 70,
            color: "#EF4444",
            now,
          }),
        ],
        createdAt: now,
        updatedAt: now,
      },

      // 8. Grand Auditorium (250 Seats)
      {
        id: "tpl-built-in-auditorium",
        name: "Grand Premiere Auditorium",
        code: "TPL_GRAND_AUDITORIUM",
        category: "AUDITORIUM",
        description: "Massive 250-seat flagship auditorium with Stalls and Balcony sections, dual emergency egress corridors, and stage.",
        isBuiltIn: true,
        versionNumber: 1,
        visibility: "PLATFORM",
        status: "ACTIVE",
        canvasSettings: {
          width: 1300,
          height: 950,
          gridSize: 20,
          snapToGrid: true,
          showGrid: true,
          showLabels: true,
          theme: "dark",
        },
        gridConfig: {
          rows: 12,
          columns: 21,
          seatWidth: 32,
          seatHeight: 32,
          seatSpacingX: 12,
          seatSpacingY: 16,
          rowSpacing: 24,
          totalCapacity: 250,
        },
        sections: [
          {
            id: "sec-aud-stalls",
            name: "Ground Stalls",
            displayOrder: 1,
            seatCount: 168,
            seatType: "Standard",
            displayColor: "#3B82F6",
            rowLabels: ["A", "B", "C", "D", "E", "F", "G", "H"],
            seatsPerRow: 21,
          },
          {
            id: "sec-aud-balcony",
            name: "Upper Balcony",
            displayOrder: 2,
            seatCount: 82,
            seatType: "VIP",
            displayColor: "#F59E0B",
            rowLabels: ["I", "J", "K", "L"],
            seatsPerRow: 21,
          },
        ],
        seats: this.buildSeats({
          prefix: "seat-aud",
          total: 250,
          cols: 21,
          startX: 180,
          startY: 220,
          dx: 44,
          dy: 54,
          sectionResolver: (r, c) => {
            const isBalcony = r >= 8;
            const isWheelchair = r === 0 && (c === 1 || c === 21);
            return {
              sectionId: isBalcony ? "sec-aud-balcony" : "sec-aud-stalls",
              seatType: isBalcony ? "VIP" : isWheelchair ? "Wheelchair" : "Standard",
              isAccessible: isWheelchair,
            };
          },
        }),
        structuralObjects: [
          this.makeStructuralObj({
            id: "struct-aud-screen",
            layoutVersionId: "tpl-built-in-auditorium",
            objectType: "SCREEN",
            displayName: "Barco 4K Laser Cinema Screen 60ft",
            internalCode: "SCR-AUD",
            x: 250,
            y: 60,
            width: 800,
            height: 50,
            color: "#3B82F6",
            now,
          }),
          this.makeStructuralObj({
            id: "struct-aud-exit-1",
            layoutVersionId: "tpl-built-in-auditorium",
            objectType: "EMERGENCY_EXIT",
            displayName: "Emergency Egress Stalls West",
            internalCode: "EXT-AUD-W",
            x: 60,
            y: 400,
            width: 40,
            height: 100,
            color: "#EF4444",
            now,
          }),
          this.makeStructuralObj({
            id: "struct-aud-exit-2",
            layoutVersionId: "tpl-built-in-auditorium",
            objectType: "EMERGENCY_EXIT",
            displayName: "Emergency Egress Balcony East",
            internalCode: "EXT-AUD-E",
            x: 1180,
            y: 650,
            width: 40,
            height: 100,
            color: "#EF4444",
            now,
          }),
        ],
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  /**
   * Applies Template Inheritance:
   * Merges base platform template with custom theatre overrides.
   */
  public static applyTemplateInheritance(
    baseTemplate: HallTemplateDefinition,
    overrides: Partial<CreateTemplatePayload>
  ): HallTemplateDefinition {
    return {
      ...baseTemplate,
      id: `tpl-custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      theatreId: overrides.theatreId,
      name: overrides.name || `${baseTemplate.name} (Custom)`,
      code: overrides.code || `${baseTemplate.code}_CUSTOM`,
      category: overrides.category || baseTemplate.category,
      description: overrides.description || baseTemplate.description,
      isBuiltIn: false,
      parentTemplateId: baseTemplate.id,
      versionNumber: 1,
      visibility: "THEATRE",
      status: "ACTIVE",
      canvasSettings: {
        ...baseTemplate.canvasSettings,
        ...(overrides.canvasSettings || {}),
      },
      gridConfig: {
        ...baseTemplate.gridConfig,
        ...(overrides.gridConfig || {}),
      },
      sections: overrides.sections || baseTemplate.sections,
      seats: overrides.seats || baseTemplate.seats,
      structuralObjects: overrides.structuralObjects || baseTemplate.structuralObjects,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Pure generator producing isolated LayoutDefinition and LayoutVersion blueprints.
   */
  public static generateLayoutDefinitionFromTemplate(
    template: HallTemplateDefinition,
    payload: GenerateLayoutFromTemplatePayload,
    actorId: string
  ): {
    definition: LayoutDefinition;
    version: LayoutVersion;
    structuralObjects: StructuralObject[];
  } {
    const { theatreId, targetHallId, layoutName, layoutDescription } = payload;
    const now = new Date().toISOString();

    const layoutDefinitionId = `layout-${targetHallId}-${Math.random().toString(36).substring(2, 7)}`;
    const versionId = `ver-${layoutDefinitionId}-v1`;

    const sections: HallSectionDefinition[] = template.sections.map((s, idx) => ({
      ...s,
      id: `sec-${layoutDefinitionId}-${idx + 1}`,
    }));

    const sectionIdOldToNew = new Map<string, string>();
    template.sections.forEach((s, idx) => {
      sectionIdOldToNew.set(s.id, sections[idx].id);
    });

    const seats: SeatDefinition[] = template.seats.map((seat, idx) => ({
      ...seat,
      id: `seat-${versionId}-${idx + 1}`,
      sectionId: sectionIdOldToNew.get(seat.sectionId) || sections[0].id,
    }));

    const structuralObjects: StructuralObject[] = template.structuralObjects.map((obj, idx) => ({
      ...obj,
      id: `struct-${versionId}-${idx + 1}`,
      theatreId,
      layoutVersionId: versionId,
      createdAt: now,
      updatedAt: now,
    }));

    const version: LayoutVersion = {
      id: versionId,
      layoutDefinitionId,
      theatreId,
      versionNumber: 1,
      name: `${layoutName} (v1 Initial from Template)`,
      status: "DRAFT",
      gridConfig: {
        rows: template.gridConfig.rows,
        columns: template.gridConfig.columns,
        totalCapacity: seats.length,
      },
      sections,
      seats,
      walkways: [],
      vipZones: [],
      wheelchairAreas: [],
      emergencyExits: [],
      metadata: {
        createdBy: actorId,
        updatedBy: actorId,
        seatCountSummary: {
          standard: seats.filter((s) => s.seatType === "Standard").length,
          vip: seats.filter((s) => s.seatType === "VIP").length,
          recliner: seats.filter((s) => s.seatType === "Recliner").length,
          sofa: seats.filter((s) => s.seatType === "Couple").length,
          wheelchair: seats.filter((s) => s.seatType === "Wheelchair").length,
          total: seats.length,
        },
      },
      createdAt: now,
      updatedAt: now,
    };

    const definition: LayoutDefinition = {
      id: layoutDefinitionId,
      theatreId,
      hallId: targetHallId,
      name: layoutName,
      description: layoutDescription || `Generated from template '${template.name}'`,
      status: "DRAFT",
      totalVersionsCount: 1,
      activeDraftVersionId: versionId,
      currentPublishedVersionId: undefined,
      createdAt: now,
      updatedAt: now,
    };

    return { definition, version, structuralObjects };
  }
}
