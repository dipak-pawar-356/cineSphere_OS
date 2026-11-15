import {
  SeatTemplate,
  SeatCategoryRegistryItem,
  SeatGenerationConfig,
  BulkSeatGenerationResult,
  SeatMetadata,
  SeatAccessibility,
} from "@/types/seat-generator.types";
import { SeatGeneratorEngine } from "@/lib/engine/seat-generator-engine";
import { NotFoundError, ConflictError } from "@/lib/errors";

/**
 * ==============================================================================
 * CineSphere OS — Seat Generator & Category Repository
 * Phase 4 – Part 5 (Seat Generator) & Part 6 (Seat Categories)
 * ==============================================================================
 * Manages persistence and multi-tenant isolation for Seat Templates,
 * Coordinates, Metadata, Accessibility, and the dynamic Seat Category Registry.
 * ==============================================================================
 */

export class SeatGeneratorRepository {
  private static seatTemplatesStore = new Map<string, SeatTemplate>();
  private static categoryRegistryStore = new Map<string, SeatCategoryRegistryItem>();
  private static isInitialized = false;

  public static initializeSeeds(): void {
    if (this.isInitialized) return;

    // --------------------------------------------------------------------------
    // 1. Seed Dynamic Seat Categories per Theatre (Part 6)
    // --------------------------------------------------------------------------

    // A. Pune Galaxy Multiplex (th-pun-001)
    const puneCategories: Array<Omit<SeatCategoryRegistryItem, "createdAt" | "updatedAt">> = [
      {
        id: "cat-pun-vip",
        theatreId: "th-pun-001",
        code: "VIP",
        name: "VIP Prime",
        displayName: "VIP Prime Recliner Suite",
        description: "Ultra-luxury motor-reclining seat with personal butler service",
        color: "#EF4444", // Red
        priority: 1,
        visibility: "VISIBLE",
        accessibility: "STANDARD",
        isPremium: true,
        isDefault: false,
        status: "ACTIVE",
      },
      {
        id: "cat-pun-recliner",
        theatreId: "th-pun-001",
        code: "RECLINER",
        name: "Recliner Gold",
        displayName: "Gold Class Motor Recliner",
        description: "Full flat 180° recliners with USB charging",
        color: "#F59E0B", // Gold
        priority: 2,
        visibility: "VISIBLE",
        accessibility: "STANDARD",
        isPremium: true,
        isDefault: false,
        status: "ACTIVE",
      },
      {
        id: "cat-pun-executive",
        theatreId: "th-pun-001",
        code: "EXECUTIVE",
        name: "Executive Balcony",
        displayName: "Executive Balcony Club",
        description: "Elevated sightlines with premium rocker seating",
        color: "#10B981", // Green
        priority: 3,
        visibility: "VISIBLE",
        accessibility: "STANDARD",
        isPremium: false,
        isDefault: false,
        status: "ACTIVE",
      },
      {
        id: "cat-pun-standard",
        theatreId: "th-pun-001",
        code: "STANDARD",
        name: "Standard Club",
        displayName: "Standard Club Seat",
        description: "Plush cinema rocker seats with wide cup holders",
        color: "#3B82F6", // Blue
        priority: 4,
        visibility: "VISIBLE",
        accessibility: "STANDARD",
        isPremium: false,
        isDefault: true,
        status: "ACTIVE",
      },
      {
        id: "cat-pun-wheelchair",
        theatreId: "th-pun-001",
        code: "WHEELCHAIR",
        name: "Wheelchair Berth",
        displayName: "Accessible Wheelchair Berth",
        description: "Zero-step ADA compliant roll-in parking with companion seat",
        color: "#8B5CF6", // Purple
        priority: 5,
        visibility: "VISIBLE",
        accessibility: "WHEELCHAIR",
        isPremium: false,
        isDefault: false,
        status: "ACTIVE",
      },
    ];

    for (const cat of puneCategories) {
      this.categoryRegistryStore.set(cat.id, {
        ...cat,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // B. Mumbai Royale IMAX (th-mum-002)
    const mumbaiCategories: Array<Omit<SeatCategoryRegistryItem, "createdAt" | "updatedAt">> = [
      {
        id: "cat-mum-luxury",
        theatreId: "th-mum-002",
        code: "LUXURY",
        name: "Royale Luxury Suite",
        displayName: "Royale Luxury Suite",
        description: "Handcrafted Italian leather loungers with personal sound dome",
        color: "#8B5CF6", // Luxury Purple
        priority: 1,
        visibility: "VISIBLE",
        accessibility: "STANDARD",
        isPremium: true,
        isDefault: false,
        status: "ACTIVE",
      },
      {
        id: "cat-mum-executive",
        theatreId: "th-mum-002",
        code: "EXECUTIVE",
        name: "IMAX Prime",
        displayName: "IMAX Prime Rocker",
        description: "Optimized center-row geometry for dual laser 4K projection",
        color: "#6366F1", // Indigo
        priority: 2,
        visibility: "VISIBLE",
        accessibility: "STANDARD",
        isPremium: false,
        isDefault: false,
        status: "ACTIVE",
      },
      {
        id: "cat-mum-economy",
        theatreId: "th-mum-002",
        code: "ECONOMY",
        name: "Economy Standard",
        displayName: "Economy Tier",
        description: "Affordable standard cinema seating",
        color: "#64748B", // Slate
        priority: 3,
        visibility: "VISIBLE",
        accessibility: "STANDARD",
        isPremium: false,
        isDefault: true,
        status: "ACTIVE",
      },
    ];

    for (const cat of mumbaiCategories) {
      this.categoryRegistryStore.set(cat.id, {
        ...cat,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // C. Dubai Grand Screen (th-dxb-003)
    const dubaiCategories: Array<Omit<SeatCategoryRegistryItem, "createdAt" | "updatedAt">> = [
      {
        id: "cat-dxb-privatebox",
        theatreId: "th-dxb-003",
        code: "PRIVATE_BOX",
        name: "Majlis Private Box",
        displayName: "Majlis VIP Box Lounge",
        description: "Enclosed private box with concierge dining",
        color: "#EAB308", // Gold
        priority: 1,
        visibility: "VISIBLE",
        accessibility: "STANDARD",
        isPremium: true,
        isDefault: false,
        status: "ACTIVE",
      },
      {
        id: "cat-dxb-recliner",
        theatreId: "th-dxb-003",
        code: "RECLINER",
        name: "Grand Leather Recliner",
        displayName: "Grand Recliner",
        description: "Luxury reclining leather armchairs",
        color: "#F43F5E", // Rose
        priority: 2,
        visibility: "VISIBLE",
        accessibility: "STANDARD",
        isPremium: true,
        isDefault: false,
        status: "ACTIVE",
      },
      {
        id: "cat-dxb-economy",
        theatreId: "th-dxb-003",
        code: "ECONOMY",
        name: "Balcony Economy",
        displayName: "Balcony Economy Tier",
        description: "Upper balcony grand view seats",
        color: "#3B82F6", // Blue
        priority: 3,
        visibility: "VISIBLE",
        accessibility: "STANDARD",
        isPremium: false,
        isDefault: true,
        status: "ACTIVE",
      },
    ];

    for (const cat of dubaiCategories) {
      this.categoryRegistryStore.set(cat.id, {
        ...cat,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // --------------------------------------------------------------------------
    // 2. Seed Initial Seat Templates for Seeded Rows (Part 5)
    // --------------------------------------------------------------------------

    // Generate 10 seats for Pune Row A (row-pun-vip-a)
    const puneRowASeats = SeatGeneratorEngine.generateRowSeats(
      {
        rowId: "row-pun-vip-a",
        sectionId: "sec-pun-vip",
        theatreId: "th-pun-001",
        layoutVersionId: "ver-layout-pun-aud1-main-v4",
        seatCount: 10,
        seatWidth: 40,
        seatHeight: 40,
        spacing: 10,
        startX: 120,
        startY: 120,
        numbering: {
          style: "ALPHABETIC",
          startNumber: 1,
        },
        categoryCode: "VIP",
        accessibility: {
          wheelchairSeatIndices: [1],
          companionSeatIndices: [2],
        },
        geometry: {
          type: "CURVED",
          radius: 600,
          arcAngle: 30,
        },
      },
      {
        rowName: "A",
        sectionName: "VIP Red Suite",
        categoryName: "VIP Prime",
        categoryColor: "#EF4444",
      }
    );

    for (const s of puneRowASeats.seats) {
      this.seatTemplatesStore.set(s.id, s);
    }

    this.isInitialized = true;
  }

  // ----------------------------------------------------------------------------
  // Part 5: Seat Template Operations
  // ----------------------------------------------------------------------------

  public static generateSeats(
    config: SeatGenerationConfig,
    rowContext: {
      rowName: string;
      sectionName: string;
      categoryName?: string;
      categoryColor?: string;
    }
  ): BulkSeatGenerationResult {
    this.initializeSeeds();

    // Check if category exists in registry
    const category = this.findCategoryByCode(config.theatreId, config.categoryCode);
    const resolvedCatName = category ? category.displayName : rowContext.categoryName;
    const resolvedCatColor = category ? category.color : rowContext.categoryColor;

    const result = SeatGeneratorEngine.generateRowSeats(config, {
      ...rowContext,
      categoryName: resolvedCatName,
      categoryColor: resolvedCatColor,
    });

    for (const seat of result.seats) {
      this.seatTemplatesStore.set(seat.id, seat);
    }

    return result;
  }

  public static regenerateSeats(
    rowId: string,
    theatreId: string,
    config: SeatGenerationConfig,
    rowContext: {
      rowName: string;
      sectionName: string;
      categoryName?: string;
      categoryColor?: string;
    }
  ): BulkSeatGenerationResult {
    this.initializeSeeds();

    // Remove existing seats for this row
    this.deleteGeneratedSeats(rowId, theatreId);

    // Generate fresh seats
    return this.generateSeats(config, rowContext);
  }

  public static deleteGeneratedSeats(rowId: string, theatreId: string): number {
    this.initializeSeeds();
    let deletedCount = 0;

    for (const [id, seat] of this.seatTemplatesStore.entries()) {
      if (seat.rowId === rowId && seat.theatreId === theatreId) {
        this.seatTemplatesStore.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  public static loadSeatsByRow(rowId: string, theatreId: string): SeatTemplate[] {
    this.initializeSeeds();
    const seats: SeatTemplate[] = [];

    for (const seat of this.seatTemplatesStore.values()) {
      if (seat.rowId === rowId && seat.theatreId === theatreId) {
        seats.push(seat);
      }
    }

    return seats.sort((a, b) => a.columnNumber - b.columnNumber);
  }

  public static loadSeatsByVersion(layoutVersionId: string, theatreId: string): SeatTemplate[] {
    this.initializeSeeds();
    const seats: SeatTemplate[] = [];

    for (const seat of this.seatTemplatesStore.values()) {
      if (seat.layoutVersionId === layoutVersionId && seat.theatreId === theatreId) {
        seats.push(seat);
      }
    }

    return seats.sort((a, b) => a.columnNumber - b.columnNumber);
  }

  public static getSeatById(seatId: string, theatreId: string): SeatTemplate {
    this.initializeSeeds();
    const seat = this.seatTemplatesStore.get(seatId);
    if (!seat || seat.theatreId !== theatreId) {
      throw new NotFoundError(`Seat template '${seatId}' not found in theatre '${theatreId}'`);
    }
    return seat;
  }

  public static updateSeatMetadata(
    seatId: string,
    theatreId: string,
    updates: {
      metadata?: Partial<SeatMetadata>;
      accessibility?: Partial<SeatAccessibility>;
      coordinates?: Partial<SeatTemplate["coordinates"]>;
      categoryCode?: string;
      status?: SeatTemplate["status"];
    }
  ): SeatTemplate {
    this.initializeSeeds();
    const existing = this.getSeatById(seatId, theatreId);

    if (updates.categoryCode && updates.categoryCode !== existing.categoryCode) {
      const category = this.findCategoryByCode(theatreId, updates.categoryCode);
      if (category) {
        existing.categoryCode = category.code;
        existing.categoryName = category.displayName;
        existing.categoryColor = category.color;
      }
    }

    if (updates.status) {
      existing.status = updates.status;
    }

    if (updates.metadata) {
      existing.metadata = {
        ...existing.metadata,
        ...updates.metadata,
        updatedAt: new Date(),
      };
    }

    if (updates.accessibility) {
      existing.accessibility = {
        ...existing.accessibility,
        ...updates.accessibility,
        updatedAt: new Date(),
      };
    }

    if (updates.coordinates) {
      existing.coordinates = {
        ...existing.coordinates,
        ...updates.coordinates,
        updatedAt: new Date(),
      };
    }

    existing.updatedAt = new Date();
    this.seatTemplatesStore.set(seatId, existing);
    return existing;
  }

  // ----------------------------------------------------------------------------
  // Part 6: Seat Category Registry Operations
  // ----------------------------------------------------------------------------

  public static findCategoryByCode(theatreId: string, code: string): SeatCategoryRegistryItem | undefined {
    this.initializeSeeds();
    for (const cat of this.categoryRegistryStore.values()) {
      if (cat.theatreId === theatreId && cat.code.toUpperCase() === code.toUpperCase()) {
        return cat;
      }
    }
    return undefined;
  }

  public static loadCategories(theatreId: string, includeArchived = false): SeatCategoryRegistryItem[] {
    this.initializeSeeds();
    const categories: SeatCategoryRegistryItem[] = [];

    for (const cat of this.categoryRegistryStore.values()) {
      if (cat.theatreId === theatreId) {
        if (includeArchived || cat.status === "ACTIVE") {
          categories.push(cat);
        }
      }
    }

    return categories.sort((a, b) => a.priority - b.priority);
  }

  public static getCategoryById(categoryId: string, theatreId: string): SeatCategoryRegistryItem {
    this.initializeSeeds();
    const category = this.categoryRegistryStore.get(categoryId);
    if (!category || category.theatreId !== theatreId) {
      throw new NotFoundError(`Seat category '${categoryId}' not found in theatre '${theatreId}'`);
    }
    return category;
  }

  public static createCategory(
    category: Omit<SeatCategoryRegistryItem, "id" | "createdAt" | "updatedAt">
  ): SeatCategoryRegistryItem {
    this.initializeSeeds();

    // Check unique code within theatre
    const existing = this.findCategoryByCode(category.theatreId, category.code);
    if (existing) {
      throw new ConflictError(
        `Seat category with code '${category.code}' already exists in theatre '${category.theatreId}'`
      );
    }

    const id = `cat-${crypto.randomUUID()}`;
    const newCategory: SeatCategoryRegistryItem = {
      ...category,
      id,
      code: category.code.toUpperCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.categoryRegistryStore.set(id, newCategory);
    return newCategory;
  }

  public static updateCategory(
    categoryId: string,
    theatreId: string,
    updates: Partial<Omit<SeatCategoryRegistryItem, "id" | "theatreId" | "createdAt">>
  ): SeatCategoryRegistryItem {
    this.initializeSeeds();
    const existing = this.getCategoryById(categoryId, theatreId);

    if (updates.code && updates.code.toUpperCase() !== existing.code) {
      const duplicate = this.findCategoryByCode(theatreId, updates.code);
      if (duplicate && duplicate.id !== categoryId) {
        throw new ConflictError(
          `Category code '${updates.code}' is already in use in this theatre`
        );
      }
      existing.code = updates.code.toUpperCase();
    }

    if (updates.name !== undefined) existing.name = updates.name;
    if (updates.displayName !== undefined) existing.displayName = updates.displayName;
    if (updates.description !== undefined) existing.description = updates.description;
    if (updates.color !== undefined) existing.color = updates.color;
    if (updates.icon !== undefined) existing.icon = updates.icon;
    if (updates.priority !== undefined) existing.priority = updates.priority;
    if (updates.visibility !== undefined) existing.visibility = updates.visibility;
    if (updates.accessibility !== undefined) existing.accessibility = updates.accessibility;
    if (updates.isPremium !== undefined) existing.isPremium = updates.isPremium;
    if (updates.isDefault !== undefined) existing.isDefault = updates.isDefault;
    if (updates.status !== undefined) existing.status = updates.status;

    existing.updatedAt = new Date();
    this.categoryRegistryStore.set(categoryId, existing);
    return existing;
  }

  public static archiveCategory(categoryId: string, theatreId: string): SeatCategoryRegistryItem {
    return this.updateCategory(categoryId, theatreId, { status: "ARCHIVED" });
  }

  public static restoreCategory(categoryId: string, theatreId: string): SeatCategoryRegistryItem {
    return this.updateCategory(categoryId, theatreId, { status: "ACTIVE" });
  }

  public static duplicateCategory(categoryId: string, theatreId: string): SeatCategoryRegistryItem {
    this.initializeSeeds();
    const source = this.getCategoryById(categoryId, theatreId);

    const newCode = `${source.code}_COPY`.slice(0, 50);
    const newName = `${source.name} (Copy)`;
    const newDisplayName = `${source.displayName} (Copy)`;

    return this.createCategory({
      theatreId,
      code: newCode,
      name: newName,
      displayName: newDisplayName,
      description: source.description,
      color: source.color,
      icon: source.icon,
      priority: source.priority + 1,
      visibility: source.visibility,
      accessibility: source.accessibility,
      isPremium: source.isPremium,
      isDefault: false,
      status: "ACTIVE",
    });
  }
}
