"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import {
  SeatInventoryHeader,
  SeatInventoryItem,
  InventoryItemStatus,
  ValidateInventoryResult,
  InventoryConfiguration,
  InventorySnapshotRecord,
  TicketSeatInventoryReference,
} from "@/types/seat-inventory-integration.types";
import {
  loadInventoryAction,
  generateInventoryAction,
  regenerateInventoryAction,
  validateInventoryAction,
  updateSeatInventoryStatusAction,
  batchUpdateSeatStatusesAction,
  listInventorySnapshotsAction,
  getTicketSeatMappingAction,
  loadInventoryConfigAction,
} from "@/actions/seat-inventory-integration-actions";

export interface UseSeatInventoryIntegrationOptions {
  theatreId: string;
  showId?: string;
  hallId?: string;
}

export function useSeatInventoryIntegration({
  theatreId,
  showId,
  hallId,
}: UseSeatInventoryIntegrationOptions) {
  const [header, setHeader] = useState<SeatInventoryHeader | null>(null);
  const [items, setItems] = useState<SeatInventoryItem[]>([]);
  const [snapshots, setSnapshots] = useState<InventorySnapshotRecord[]>([]);
  const [config, setConfig] = useState<InventoryConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inventoryCacheRef = useRef<Map<string, { header: SeatInventoryHeader; items: SeatInventoryItem[] }>>(new Map());

  const fetchInventory = useCallback(
    async (targetShowId?: string) => {
      const activeShowId = targetShowId || showId;
      if (!theatreId || !activeShowId) return;

      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await loadInventoryAction({
          theatreId,
          showId: activeShowId,
        });
        if (res.success && res.data) {
          setHeader(res.data.header);
          setItems(res.data.items);
        } else {
          setErrorMessage(res.error?.message || "Failed to load show seat inventory.");
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load show seat inventory.");
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId, showId]
  );

  const generateInventory = useCallback(
    async (params: { targetShowId?: string; targetHallId?: string; layoutVersionId?: string }) => {
      const activeShowId = params.targetShowId || showId;
      const activeHallId = params.targetHallId || hallId;
      if (!theatreId || !activeShowId || !activeHallId) {
        throw new Error("Missing theatreId, showId, or hallId.");
      }

      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await generateInventoryAction({
          theatreId,
          showId: activeShowId,
          hallId: activeHallId,
          layoutVersionId: params.layoutVersionId,
        });
        if (res.success && res.data) {
          setHeader(res.data.header);
          setItems(res.data.items);
          return res.data;
        } else {
          throw new Error(res.error?.message || "Failed to generate seat inventory.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId, showId, hallId]
  );

  const regenerateInventory = useCallback(
    async (params: { targetShowId?: string; reason: string; forceOverride?: boolean }) => {
      const activeShowId = params.targetShowId || showId;
      if (!theatreId || !activeShowId) throw new Error("Missing theatreId or showId.");

      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await regenerateInventoryAction({
          theatreId,
          showId: activeShowId,
          reason: params.reason,
          forceOverrideWithZeroBookings: params.forceOverride,
        });
        if (res.success && res.data) {
          setHeader(res.data.header);
          setItems(res.data.items);
          return res.data;
        } else {
          throw new Error(res.error?.message || "Failed to regenerate seat inventory.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId, showId]
  );

  const validateInventory = useCallback(
    async (targetShowId?: string): Promise<ValidateInventoryResult | null> => {
      const activeShowId = targetShowId || showId;
      if (!theatreId || !activeShowId) return null;

      try {
        const res = await validateInventoryAction({
          theatreId,
          showId: activeShowId,
        });
        if (res.success && res.data) {
          return res.data;
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to validate inventory.");
      }
      return null;
    },
    [theatreId, showId]
  );

  const setSeatStatus = useCallback(
    async (internalSeatId: string, status: InventoryItemStatus) => {
      const activeShowId = showId;
      if (!theatreId || !activeShowId) return;

      setIsUpdating(true);
      try {
        const res = await updateSeatInventoryStatusAction({
          theatreId,
          showId: activeShowId,
          internalSeatId,
          status,
        });
        if (res.success && res.data) {
          const updatedItem = res.data;
          setItems((prev) =>
            prev.map((item) => (item.internalSeatId === internalSeatId ? updatedItem : item))
          );
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to update seat status.");
      } finally {
        setIsUpdating(false);
      }
    },
    [theatreId, showId]
  );

  const fetchConfig = useCallback(async () => {
    if (!theatreId) return;
    try {
      const res = await loadInventoryConfigAction({ theatreId });
      if (res.success && res.data) {
        setConfig(res.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load inventory configuration.");
    }
  }, [theatreId]);

  const batchSetSeatStatuses = useCallback(
    async (updates: Array<{ internalSeatId: string; status: InventoryItemStatus }>) => {
      const activeShowId = showId;
      if (!theatreId || !activeShowId || updates.length === 0) return null;

      setIsUpdating(true);
      try {
        const res = await batchUpdateSeatStatusesAction({
          theatreId,
          showId: activeShowId,
          updates,
        });
        if (res.success && res.data) {
          const updatedMap = new Map(res.data.items.map((item) => [item.internalSeatId, item]));
          setItems((prev) => prev.map((item) => updatedMap.get(item.internalSeatId) || item));
          inventoryCacheRef.current.delete(`${theatreId}:${activeShowId}`);
          return res.data;
        }
        setErrorMessage(res.error?.message || "Failed to batch update seat statuses.");
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to batch update seat statuses.");
      } finally {
        setIsUpdating(false);
      }
      return null;
    },
    [theatreId, showId]
  );

  const fetchSnapshots = useCallback(
    async (targetShowId?: string) => {
      if (!theatreId) return [];
      try {
        const res = await listInventorySnapshotsAction({
          theatreId,
          showId: targetShowId || showId,
        });
        if (res.success && res.data) {
          setSnapshots(res.data);
          return res.data;
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load inventory snapshots.");
      }
      return [];
    },
    [theatreId, showId]
  );

  const fetchTicketSeatMapping = useCallback(
    async (internalSeatId: string, targetShowId?: string): Promise<TicketSeatInventoryReference | null> => {
      const activeShowId = targetShowId || showId;
      if (!theatreId || !activeShowId) return null;
      try {
        const res = await getTicketSeatMappingAction({
          theatreId,
          showId: activeShowId,
          internalSeatId,
        });
        if (res.success && res.data) {
          return res.data;
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to resolve ticket seat mapping.");
      }
      return null;
    },
    [theatreId, showId]
  );

  // Derived metrics
  const availableCount = useMemo(() => items.filter((i) => i.status === "AVAILABLE").length, [items]);
  const bookedCount = useMemo(() => items.filter((i) => i.status === "BOOKED").length, [items]);
  const maintenanceCount = useMemo(() => items.filter((i) => i.status === "MAINTENANCE").length, [items]);
  const wheelchairCount = useMemo(() => items.filter((i) => i.isWheelchair).length, [items]);

  return {
    header,
    items,
    snapshots,
    config,
    isLoading,
    isUpdating,
    errorMessage,
    availableCount,
    bookedCount,
    maintenanceCount,
    wheelchairCount,
    fetchInventory,
    generateInventory,
    regenerateInventory,
    validateInventory,
    setSeatStatus,
    batchSetSeatStatuses,
    fetchSnapshots,
    fetchTicketSeatMapping,
    fetchConfig,
  };
}
