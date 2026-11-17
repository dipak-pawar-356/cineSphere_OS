/**
 * ==============================================================================
 * CineSphere OS — Seat Inventory Integration Repository (Phase 4 – Part 13)
 * ==============================================================================
 * Multi-tenant repository managing immutable seat inventory snapshots,
 * individual seat items, show mappings, and theatre inventory policies.
 * ==============================================================================
 */

import {
  SeatInventoryHeader,
  SeatInventoryItem,
  InventoryMappingRecord,
  InventorySnapshotRecord,
  InventoryConfiguration,
  InventoryItemStatus,
} from "@/types/seat-inventory-integration.types";
import { TenantAccessError, NotFoundError } from "@/lib/errors/app-error";

export class SeatInventoryIntegrationRepository {
  private static instance: SeatInventoryIntegrationRepository | null = null;

  // In-memory multi-tenant storage
  private inventories: Map<string, SeatInventoryHeader> = new Map(); // Key: inventoryId
  private showToInventory: Map<string, string> = new Map();         // Key: showId -> inventoryId
  private items: Map<string, SeatInventoryItem[]> = new Map();       // Key: inventoryId -> items
  private mappings: Map<string, InventoryMappingRecord> = new Map(); // Key: showId
  private snapshots: Map<string, InventorySnapshotRecord[]> = new Map(); // Key: showId -> snapshots
  private configurations: Map<string, InventoryConfiguration> = new Map(); // Key: theatreId

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): SeatInventoryIntegrationRepository {
    if (!SeatInventoryIntegrationRepository.instance) {
      SeatInventoryIntegrationRepository.instance = new SeatInventoryIntegrationRepository();
    }
    return SeatInventoryIntegrationRepository.instance;
  }

  // ----------------------------------------------------------------------------
  // 1. Inventory Header & Items
  // ----------------------------------------------------------------------------

  public saveInventory(
    header: SeatInventoryHeader,
    itemsList: SeatInventoryItem[]
  ): void {
    this.inventories.set(header.id, header);
    this.showToInventory.set(header.showId, header.id);
    this.items.set(header.id, itemsList);

    const mapping: InventoryMappingRecord = {
      id: `map-${header.showId}`,
      theatreId: header.theatreId,
      showId: header.showId,
      hallId: header.hallId,
      layoutDefinitionId: header.layoutDefinitionId,
      layoutVersionId: header.layoutVersionId,
      layoutVersionNumber: header.layoutVersionNumber,
      inventoryId: header.id,
      mappingStatus: "BOUND",
      isLocked: true,
      createdAt: header.generatedAt,
    };
    this.mappings.set(header.showId, mapping);
  }

  public getInventoryByShow(showId: string, theatreId: string): SeatInventoryHeader | undefined {
    const invId = this.showToInventory.get(showId);
    if (!invId) return undefined;
    const inv = this.inventories.get(invId);
    if (!inv) return undefined;
    if (inv.theatreId !== theatreId) {
      throw new TenantAccessError(`Inventory for show '${showId}' does not belong to theatre '${theatreId}'.`);
    }
    return inv;
  }

  public getInventoryById(inventoryId: string, theatreId: string): SeatInventoryHeader | undefined {
    const inv = this.inventories.get(inventoryId);
    if (!inv) return undefined;
    if (inv.theatreId !== theatreId) {
      throw new TenantAccessError(`Inventory '${inventoryId}' does not belong to theatre '${theatreId}'.`);
    }
    return inv;
  }

  public getInventoryItems(inventoryId: string, theatreId: string): SeatInventoryItem[] {
    const inv = this.getInventoryById(inventoryId, theatreId);
    if (!inv) return [];
    return this.items.get(inventoryId) || [];
  }

  public updateSeatStatus(params: {
    inventoryId: string;
    internalSeatId: string;
    status: InventoryItemStatus;
    theatreId: string;
    lockedBy?: string;
    lockedUntil?: string;
    bookingId?: string;
    ticketId?: string;
  }): SeatInventoryItem {
    const { inventoryId, internalSeatId, status, theatreId, lockedBy, lockedUntil, bookingId, ticketId } = params;
    const itemsList = this.getInventoryItems(inventoryId, theatreId);
    const item = itemsList.find((i) => i.internalSeatId === internalSeatId);
    if (!item) {
      throw new NotFoundError(`Seat '${internalSeatId}' not found in inventory '${inventoryId}'.`);
    }

    item.status = status;
    item.lockedBy = lockedBy ?? item.lockedBy;
    item.lockedUntil = lockedUntil ?? item.lockedUntil;
    item.bookingId = bookingId ?? item.bookingId;
    item.ticketId = ticketId ?? item.ticketId;
    item.updatedAt = new Date().toISOString();

    // Recalculate header metrics
    const header = this.inventories.get(inventoryId);
    if (header) {
      header.availableSeats = itemsList.filter((i) => i.status === "AVAILABLE").length;
      header.bookedSeats = itemsList.filter((i) => i.status === "BOOKED").length;
      header.blockedSeats = itemsList.filter((i) => i.status === "BLOCKED" || i.status === "RESERVED").length;
      header.maintenanceSeats = itemsList.filter((i) => i.status === "MAINTENANCE").length;
      header.updatedAt = new Date().toISOString();
    }

    return item;
  }

  // ----------------------------------------------------------------------------
  // 2. Snapshots
  // ----------------------------------------------------------------------------

  public recordSnapshot(snapshot: InventorySnapshotRecord): void {
    const list = this.snapshots.get(snapshot.showId) || [];
    list.unshift(snapshot);
    this.snapshots.set(snapshot.showId, list);
  }

  public getSnapshots(showId: string, theatreId: string): InventorySnapshotRecord[] {
    const list = this.snapshots.get(showId) || [];
    return list.filter((s) => s.theatreId === theatreId);
  }

  // ----------------------------------------------------------------------------
  // 3. Configurations
  // ----------------------------------------------------------------------------

  public getConfiguration(theatreId: string): InventoryConfiguration {
    const existing = this.configurations.get(theatreId);
    if (!existing) {
      const standard: InventoryConfiguration = {
        theatreId,
        generationMode: "AUTOMATIC",
        maintenanceSeatsEnabled: true,
        validationMode: "STRICT",
        premiumSeatMetadataEnabled: true,
        defaultLockDurationSeconds: 600,
        allowRegenerationWithZeroBookings: true,
        updatedAt: new Date().toISOString(),
      };
      this.configurations.set(theatreId, standard);
      return standard;
    }
    return existing;
  }

  public updateConfiguration(
    theatreId: string,
    updates: Partial<InventoryConfiguration>
  ): InventoryConfiguration {
    const current = this.getConfiguration(theatreId);
    const updated: InventoryConfiguration = {
      ...current,
      ...updates,
      theatreId,
      updatedAt: new Date().toISOString(),
    };
    this.configurations.set(theatreId, updated);
    return updated;
  }

  // ----------------------------------------------------------------------------
  // Seed Data
  // ----------------------------------------------------------------------------

  private seedInitialData(): void {
    // 1. Pune Galaxy (th-pun-001) - Automatic, Maintenance ON, Strict
    this.configurations.set("th-pun-001", {
      theatreId: "th-pun-001",
      generationMode: "AUTOMATIC",
      maintenanceSeatsEnabled: true,
      validationMode: "STRICT",
      premiumSeatMetadataEnabled: true,
      defaultLockDurationSeconds: 600,
      allowRegenerationWithZeroBookings: true,
      updatedAt: "2026-11-16T00:00:00Z",
    });

    // 2. Mumbai IMAX (th-mum-002) - Manual Approval, Maintenance OFF
    this.configurations.set("th-mum-002", {
      theatreId: "th-mum-002",
      generationMode: "MANUAL_APPROVAL",
      maintenanceSeatsEnabled: false,
      validationMode: "STANDARD",
      premiumSeatMetadataEnabled: true,
      defaultLockDurationSeconds: 480,
      allowRegenerationWithZeroBookings: false,
      updatedAt: "2026-11-16T00:00:00Z",
    });

    // 3. Dubai Royale (th-dxb-003) - Automatic, Custom Validation, Premium Metadata
    this.configurations.set("th-dxb-003", {
      theatreId: "th-dxb-003",
      generationMode: "AUTOMATIC",
      maintenanceSeatsEnabled: true,
      validationMode: "STRICT",
      premiumSeatMetadataEnabled: true,
      defaultLockDurationSeconds: 900,
      allowRegenerationWithZeroBookings: true,
      updatedAt: "2026-11-16T00:00:00Z",
    });
  }
}

export const seatInventoryIntegrationRepository = SeatInventoryIntegrationRepository.getInstance();
