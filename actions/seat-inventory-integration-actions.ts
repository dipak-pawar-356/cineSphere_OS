"use server";

import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { seatInventoryIntegrationService } from "@/lib/services/seat-inventory-integration.service";
import {
  generateInventorySchema,
  regenerateInventorySchema,
  syncInventorySchema,
  loadInventorySchema,
  validateInventorySchema,
  mapInventoryToShowSchema,
  updateSeatStatusSchema,
  loadInventoryConfigSchema,
  saveInventoryConfigSchema,
} from "@/lib/validation/seat-inventory-integration.validation";
import {
  SeatInventoryHeader,
  SeatInventoryItem,
  ValidateInventoryResult,
  InventoryConfiguration,
} from "@/types/seat-inventory-integration.types";

/**
 * ==============================================================================
 * CineSphere OS — Seat Inventory Integration Actions (Phase 4 – Part 13)
 * ==============================================================================
 * Protected server actions generating immutable show seat inventory snapshots
 * from active published layouts. Decouples operations from CAD layout authoring.
 * ==============================================================================
 */

export const generateInventoryAction = createProtectedAction<
  z.input<typeof generateInventorySchema>,
  { header: SeatInventoryHeader; items: SeatInventoryItem[] }
>(
  {
    actionName: "generateInventoryAction",
    schema: generateInventorySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_INVENTORY",
    auditAction: "GENERATE_INVENTORY",
  },
  async (input, context) => {
    return seatInventoryIntegrationService.generateInventory(context.actor, input);
  }
);

export const regenerateInventoryAction = createProtectedAction<
  z.input<typeof regenerateInventorySchema>,
  { header: SeatInventoryHeader; items: SeatInventoryItem[] }
>(
  {
    actionName: "regenerateInventoryAction",
    schema: regenerateInventorySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_INVENTORY",
    auditAction: "REGENERATE_INVENTORY",
  },
  async (input, context) => {
    return seatInventoryIntegrationService.regenerateInventory(context.actor, input);
  }
);

export const syncInventoryAction = createProtectedAction<
  z.input<typeof syncInventorySchema>,
  { syncedShowIds: string[]; skippedShowIds: string[] }
>(
  {
    actionName: "syncInventoryAction",
    schema: syncInventorySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_INVENTORY",
    auditAction: "SYNC_INVENTORY",
  },
  async (input, context) => {
    return seatInventoryIntegrationService.syncInventory(context.actor, input);
  }
);

export const loadInventoryAction = createProtectedAction<
  z.input<typeof loadInventorySchema>,
  { header: SeatInventoryHeader; items: SeatInventoryItem[] }
>(
  {
    actionName: "loadInventoryAction",
    schema: loadInventorySchema,
    rateLimitCategory: "BOOKING_REQUEST",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF", "CUSTOMER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_INVENTORY",
    auditAction: "LOAD_INVENTORY",
  },
  async (input, context) => {
    return seatInventoryIntegrationService.loadInventory(
      context.actor,
      input.showId,
      input.theatreId
    );
  }
);

export const validateInventoryAction = createProtectedAction<
  z.input<typeof validateInventorySchema>,
  ValidateInventoryResult
>(
  {
    actionName: "validateInventoryAction",
    schema: validateInventorySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_INVENTORY",
    auditAction: "VALIDATE_INVENTORY",
  },
  async (input, context) => {
    return seatInventoryIntegrationService.validateInventory(
      context.actor,
      input.showId,
      input.theatreId
    );
  }
);

export const mapInventoryToShowAction = createProtectedAction<
  z.input<typeof mapInventoryToShowSchema>,
  { header: SeatInventoryHeader; items: SeatInventoryItem[] }
>(
  {
    actionName: "mapInventoryToShowAction",
    schema: mapInventoryToShowSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_INVENTORY",
    auditAction: "MAP_INVENTORY",
  },
  async (input, context) => {
    return seatInventoryIntegrationService.generateInventory(context.actor, {
      theatreId: input.theatreId,
      showId: input.showId,
      hallId: input.hallId,
      layoutVersionId: input.layoutVersionId,
    });
  }
);

export const updateSeatInventoryStatusAction = createProtectedAction<
  z.input<typeof updateSeatStatusSchema>,
  SeatInventoryItem
>(
  {
    actionName: "updateSeatInventoryStatusAction",
    schema: updateSeatStatusSchema,
    rateLimitCategory: "BOOKING_REQUEST",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_INVENTORY",
    auditAction: "UPDATE_SEAT_STATUS",
  },
  async (input, context) => {
    return seatInventoryIntegrationService.updateSeatStatus(context.actor, input);
  }
);

export const loadInventoryConfigAction = createProtectedAction<
  z.input<typeof loadInventoryConfigSchema>,
  InventoryConfiguration
>(
  {
    actionName: "loadInventoryConfigAction",
    schema: loadInventoryConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_INVENTORY",
    auditAction: "LOAD_CONFIG",
  },
  async (input, context) => {
    return seatInventoryIntegrationService.getConfiguration(context.actor, input.theatreId);
  }
);

export const saveInventoryConfigAction = createProtectedAction<
  z.input<typeof saveInventoryConfigSchema>,
  InventoryConfiguration
>(
  {
    actionName: "saveInventoryConfigAction",
    schema: saveInventoryConfigSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "SEAT_INVENTORY",
    auditAction: "SAVE_CONFIG",
  },
  async (input, context) => {
    return seatInventoryIntegrationService.updateConfiguration(
      context.actor,
      input.theatreId,
      input
    );
  }
);
