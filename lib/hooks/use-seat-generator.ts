"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  SeatTemplate,
  SeatCategoryRegistryItem,
  SeatGenerationConfig,
  BulkSeatGenerationResult,
  SeatMetadata,
  SeatAccessibility,
} from "@/types/seat-generator.types";
import {
  generateSeatsAction,
  regenerateSeatsAction,
  deleteGeneratedSeatsAction,
  loadSeatsAction,
  updateSeatMetadataAction,
  createCategoryAction,
  updateCategoryAction,
  archiveCategoryAction,
  restoreCategoryAction,
  duplicateCategoryAction,
  loadCategoriesAction,
} from "@/actions/seat-generator-actions";

interface UseSeatGeneratorOptions {
  theatreId: string;
  layoutVersionId: string;
  initialRowId?: string;
}

function parseErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message || fallback);
  }
  return fallback;
}

export function useSeatGenerator({
  theatreId,
  layoutVersionId,
  initialRowId,
}: UseSeatGeneratorOptions) {
  const [selectedRowId, setSelectedRowId] = useState<string | null>(initialRowId || null);
  const [seats, setSeats] = useState<SeatTemplate[]>([]);
  const [categories, setCategories] = useState<SeatCategoryRegistryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // In-memory cache ref per row to avoid redundant network round-trips
  const rowSeatsCacheRef = useRef<Map<string, SeatTemplate[]>>(new Map());

  // Load category registry for theatre
  const refreshCategories = useCallback(async () => {
    try {
      const res = await loadCategoriesAction({ theatreId, includeArchived: true });
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err: unknown) {
      console.error("Failed to load seat categories:", err);
    }
  }, [theatreId]);

  // Load seats for current selected row
  const refreshSeats = useCallback(
    async (rowId: string, bypassCache = false) => {
      if (!bypassCache && rowSeatsCacheRef.current.has(rowId)) {
        setSeats(rowSeatsCacheRef.current.get(rowId)!);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const res = await loadSeatsAction({ theatreId, rowId });
        if (res.success && res.data) {
          setSeats(res.data);
          rowSeatsCacheRef.current.set(rowId, res.data);
        } else if (!res.success) {
          setError(parseErrorMessage(res.error, "Failed to load seats"));
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading seats");
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId]
  );

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  useEffect(() => {
    if (selectedRowId) {
      refreshSeats(selectedRowId);
    } else {
      setSeats([]);
    }
  }, [selectedRowId, refreshSeats]);

  // Generate seats for a row
  const generateSeats = useCallback(
    async (
      config: SeatGenerationConfig,
      rowContext: {
        rowName: string;
        sectionName: string;
        categoryName?: string;
        categoryColor?: string;
      }
    ): Promise<BulkSeatGenerationResult | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await generateSeatsAction({
          theatreId,
          layoutVersionId,
          sectionId: config.sectionId,
          rowId: config.rowId,
          rowName: rowContext.rowName,
          sectionName: rowContext.sectionName,
          categoryCode: config.categoryCode,
          categoryName: rowContext.categoryName,
          categoryColor: rowContext.categoryColor,
          seatCount: config.seatCount,
          seatWidth: config.seatWidth,
          seatHeight: config.seatHeight,
          spacing: config.spacing,
          startX: config.startX,
          startY: config.startY,
          rotation: config.rotation ?? 0,
          numbering: config.numbering,
          accessibility: config.accessibility,
          geometry: config.geometry,
        });

        if (res.success && res.data) {
          rowSeatsCacheRef.current.set(config.rowId, res.data.seats);
          if (selectedRowId === config.rowId) {
            setSeats(res.data.seats);
          }
          return res.data;
        } else {
          setError(parseErrorMessage(res.error, "Failed to generate seats"));
          return null;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error generating seats";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId, layoutVersionId, selectedRowId]
  );

  // Regenerate seats
  const regenerateSeats = useCallback(
    async (
      rowId: string,
      config: SeatGenerationConfig,
      rowContext: {
        rowName: string;
        sectionName: string;
        categoryName?: string;
        categoryColor?: string;
      }
    ): Promise<BulkSeatGenerationResult | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await regenerateSeatsAction({
          theatreId,
          layoutVersionId,
          sectionId: config.sectionId,
          rowId,
          rowName: rowContext.rowName,
          sectionName: rowContext.sectionName,
          categoryCode: config.categoryCode,
          categoryName: rowContext.categoryName,
          categoryColor: rowContext.categoryColor,
          seatCount: config.seatCount,
          seatWidth: config.seatWidth,
          seatHeight: config.seatHeight,
          spacing: config.spacing,
          startX: config.startX,
          startY: config.startY,
          rotation: config.rotation ?? 0,
          numbering: config.numbering,
          accessibility: config.accessibility,
          geometry: config.geometry,
        });

        if (res.success && res.data) {
          rowSeatsCacheRef.current.set(rowId, res.data.seats);
          if (selectedRowId === rowId) {
            setSeats(res.data.seats);
          }
          return res.data;
        } else {
          setError(parseErrorMessage(res.error, "Failed to regenerate seats"));
          return null;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error regenerating seats";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId, layoutVersionId, selectedRowId]
  );

  // Delete generated seats for a row
  const deleteGeneratedSeats = useCallback(
    async (rowId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await deleteGeneratedSeatsAction({
          theatreId,
          layoutVersionId,
          rowId,
        });

        if (res.success) {
          rowSeatsCacheRef.current.delete(rowId);
          if (selectedRowId === rowId) {
            setSeats([]);
          }
          return true;
        } else {
          setError(parseErrorMessage(res.error, "Failed to delete seats"));
          return false;
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error deleting seats");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId, layoutVersionId, selectedRowId]
  );

  // Update single seat metadata
  const updateSeatMetadata = useCallback(
    async (
      seatId: string,
      updates: {
        metadata?: Partial<SeatMetadata>;
        accessibility?: Partial<SeatAccessibility>;
        coordinates?: Partial<SeatTemplate["coordinates"]>;
        categoryCode?: string;
        status?: SeatTemplate["status"];
      }
    ) => {
      // Optimistic update
      setSeats((prev) =>
        prev.map((s) => {
          if (s.id !== seatId) return s;
          return {
            ...s,
            categoryCode: updates.categoryCode || s.categoryCode,
            status: updates.status || s.status,
            metadata: updates.metadata ? { ...s.metadata, ...updates.metadata } : s.metadata,
            accessibility: updates.accessibility
              ? { ...s.accessibility, ...updates.accessibility }
              : s.accessibility,
            coordinates: updates.coordinates
              ? { ...s.coordinates, ...updates.coordinates }
              : s.coordinates,
          };
        })
      );

      try {
        const res = await updateSeatMetadataAction({
          theatreId,
          layoutVersionId,
          seatId,
          categoryCode: updates.categoryCode,
          status: updates.status,
          metadata: updates.metadata,
          accessibility: updates.accessibility,
          coordinates: updates.coordinates,
        });

        if (res.success && res.data) {
          // Sync with returned data
          setSeats((prev) => prev.map((s) => (s.id === seatId ? res.data! : s)));
          if (selectedRowId && rowSeatsCacheRef.current.has(selectedRowId)) {
            const cached = rowSeatsCacheRef.current.get(selectedRowId)!;
            rowSeatsCacheRef.current.set(
              selectedRowId,
              cached.map((s) => (s.id === seatId ? res.data! : s))
            );
          }
          return res.data;
        }
      } catch (err: unknown) {
        console.error("Failed to update seat metadata:", err);
        // Rollback by refreshing from server
        if (selectedRowId) refreshSeats(selectedRowId, true);
      }
      return null;
    },
    [theatreId, layoutVersionId, selectedRowId, refreshSeats]
  );

  // Category CRUD
  const createCategory = useCallback(
    async (category: Omit<SeatCategoryRegistryItem, "id" | "createdAt" | "updatedAt">) => {
      try {
        const res = await createCategoryAction(category);
        if (res.success && res.data) {
          setCategories((prev) => [...prev, res.data!].sort((a, b) => a.priority - b.priority));
          return res.data;
        } else {
          setError(parseErrorMessage(res.error, "Failed to create category"));
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error creating category");
      }
      return null;
    },
    []
  );

  const updateCategory = useCallback(
    async (
      categoryId: string,
      updates: Partial<Omit<SeatCategoryRegistryItem, "id" | "theatreId" | "createdAt">>
    ) => {
      try {
        const res = await updateCategoryAction({ theatreId, categoryId, updates });
        if (res.success && res.data) {
          setCategories((prev) =>
            prev.map((c) => (c.id === categoryId ? res.data! : c)).sort((a, b) => a.priority - b.priority)
          );
          return res.data;
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error updating category");
      }
      return null;
    },
    [theatreId]
  );

  const archiveCategory = useCallback(
    async (categoryId: string) => {
      try {
        const res = await archiveCategoryAction({ theatreId, categoryId });
        if (res.success && res.data) {
          setCategories((prev) => prev.map((c) => (c.id === categoryId ? res.data! : c)));
          return true;
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error archiving category");
      }
      return false;
    },
    [theatreId]
  );

  const restoreCategory = useCallback(
    async (categoryId: string) => {
      try {
        const res = await restoreCategoryAction({ theatreId, categoryId });
        if (res.success && res.data) {
          setCategories((prev) => prev.map((c) => (c.id === categoryId ? res.data! : c)));
          return true;
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error restoring category");
      }
      return false;
    },
    [theatreId]
  );

  const duplicateCategory = useCallback(
    async (categoryId: string) => {
      try {
        const res = await duplicateCategoryAction({ theatreId, categoryId });
        if (res.success && res.data) {
          setCategories((prev) => [...prev, res.data!].sort((a, b) => a.priority - b.priority));
          return res.data;
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error duplicating category");
      }
      return null;
    },
    [theatreId]
  );

  // Memoized Aggregate Metrics
  const metrics = useMemo(() => {
    let wheelchairCount = 0;
    let companionCount = 0;
    const seatsByCategory: Record<string, number> = {};

    for (const seat of seats) {
      if (seat.accessibility.accessibilityType === "WHEELCHAIR") {
        wheelchairCount++;
      } else if (seat.accessibility.accessibilityType === "COMPANION") {
        companionCount++;
      }

      const cat = seat.categoryCode || "STANDARD";
      seatsByCategory[cat] = (seatsByCategory[cat] || 0) + 1;
    }

    const activeCategoryList = categories.filter((c) => c.status === "ACTIVE");

    return {
      totalGeneratedSeats: seats.length,
      wheelchairCount,
      companionCount,
      seatsByCategory,
      activeCategoryList,
    };
  }, [seats, categories]);

  return {
    seats,
    categories,
    selectedRowId,
    setSelectedRowId,
    isLoading,
    error,
    metrics,
    refreshSeats,
    refreshCategories,
    generateSeats,
    regenerateSeats,
    deleteGeneratedSeats,
    updateSeatMetadata,
    createCategory,
    updateCategory,
    archiveCategory,
    restoreCategory,
    duplicateCategory,
  };
}
