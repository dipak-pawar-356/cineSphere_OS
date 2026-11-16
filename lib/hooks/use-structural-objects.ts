"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  StructuralObject,
  StructuralObjectType,
  StructuralObjectValidationResult,
} from "@/types/structural-objects.types";
import {
  loadStructuralObjectsAction,
  createStructuralObjectAction,
  updateStructuralObjectAction,
  deleteStructuralObjectAction,
  duplicateStructuralObjectAction,
  reorderStructuralObjectsAction,
  toggleLockStructuralObjectAction,
  toggleVisibilityStructuralObjectAction,
  validateStructuralObjectsAction,
} from "@/actions/structural-object-actions";

interface UseStructuralObjectsOptions {
  theatreId: string;
  layoutVersionId: string;
  autoLoad?: boolean;
}

function parseErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message || fallback);
  }
  return fallback;
}

export function useStructuralObjects({
  theatreId,
  layoutVersionId,
  autoLoad = true,
}: UseStructuralObjectsOptions) {
  const [objects, setObjects] = useState<StructuralObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<StructuralObjectValidationResult | null>(null);

  // In-memory cache ref to optimize redundant fetches
  const objectsCacheRef = useRef<Map<string, StructuralObject[]>>(new Map());

  const refreshObjects = useCallback(async () => {
    if (!theatreId || !layoutVersionId) return;

    // Check cache first
    const cacheKey = `${theatreId}:${layoutVersionId}`;
    if (objectsCacheRef.current.has(cacheKey)) {
      setObjects(objectsCacheRef.current.get(cacheKey)!);
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await loadStructuralObjectsAction({ theatreId, layoutVersionId });
      if (res.success && res.data) {
        setObjects(res.data);
        objectsCacheRef.current.set(cacheKey, res.data);
      } else if (!res.success) {
        setError(parseErrorMessage(res.error, "Failed to load structural objects"));
      }
    } catch (err) {
      setError(parseErrorMessage(err, "Network error loading structural objects"));
    } finally {
      setIsLoading(false);
    }
  }, [theatreId, layoutVersionId]);

  useEffect(() => {
    if (autoLoad && theatreId && layoutVersionId) {
      refreshObjects();
    }
  }, [autoLoad, theatreId, layoutVersionId, refreshObjects]);

  const createObject = useCallback(
    async (
      input: Parameters<typeof createStructuralObjectAction>[0]
    ): Promise<StructuralObject | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await createStructuralObjectAction(input);
        if (res.success && res.data) {
          const created = res.data;
          setObjects((prev) => {
            const next = [...prev, created];
            const cacheKey = `${theatreId}:${layoutVersionId}`;
            objectsCacheRef.current.set(cacheKey, next);
            return next;
          });
          setSelectedObjectId(created.id);
          return created;
        } else {
          setError(parseErrorMessage(res.error, "Failed to create structural object"));
          return null;
        }
      } catch (err) {
        setError(parseErrorMessage(err, "Unexpected error creating structural object"));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId, layoutVersionId]
  );

  const updateObject = useCallback(
    async (
      id: string,
      input: Parameters<typeof updateStructuralObjectAction>[0]
    ): Promise<StructuralObject | null> => {
      // Optimistic update
      setObjects((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...(input as unknown as Partial<StructuralObject>) } : o))
      );

      try {
        const res = await updateStructuralObjectAction(input);
        if (res.success && res.data) {
          const updated = res.data;
          setObjects((prev) => {
            const next = prev.map((o) => (o.id === id ? updated : o));
            const cacheKey = `${theatreId}:${layoutVersionId}`;
            objectsCacheRef.current.set(cacheKey, next);
            return next;
          });
          return updated;
        } else {
          setError(parseErrorMessage(res.error, "Failed to update structural object"));
          refreshObjects(); // rollback
          return null;
        }
      } catch (err) {
        setError(parseErrorMessage(err, "Error updating structural object"));
        refreshObjects(); // rollback
        return null;
      }
    },
    [theatreId, layoutVersionId, refreshObjects]
  );

  const deleteObject = useCallback(
    async (id: string): Promise<boolean> => {
      // Optimistic delete
      setObjects((prev) => {
        const next = prev.filter((o) => o.id !== id);
        const cacheKey = `${theatreId}:${layoutVersionId}`;
        objectsCacheRef.current.set(cacheKey, next);
        return next;
      });
      if (selectedObjectId === id) setSelectedObjectId(null);

      try {
        const res = await deleteStructuralObjectAction({ id, theatreId });
        if (!res.success) {
          setError(parseErrorMessage(res.error, "Failed to delete structural object"));
          refreshObjects(); // rollback
          return false;
        }
        return true;
      } catch (err) {
        setError(parseErrorMessage(err, "Error deleting structural object"));
        refreshObjects(); // rollback
        return false;
      }
    },
    [theatreId, layoutVersionId, selectedObjectId, refreshObjects]
  );

  const duplicateObject = useCallback(
    async (id: string): Promise<StructuralObject | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await duplicateStructuralObjectAction({ id, theatreId });
        if (res.success && res.data) {
          const copy = res.data;
          setObjects((prev) => {
            const next = [...prev, copy];
            const cacheKey = `${theatreId}:${layoutVersionId}`;
            objectsCacheRef.current.set(cacheKey, next);
            return next;
          });
          setSelectedObjectId(copy.id);
          return copy;
        } else {
          setError(parseErrorMessage(res.error, "Failed to duplicate structural object"));
          return null;
        }
      } catch (err) {
        setError(parseErrorMessage(err, "Error duplicating structural object"));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId, layoutVersionId]
  );

  const reorderObjects = useCallback(
    async (orderedIds: string[]): Promise<StructuralObject[]> => {
      try {
        const res = await reorderStructuralObjectsAction({
          layoutVersionId,
          theatreId,
          orderedIds,
        });
        if (res.success && res.data) {
          setObjects(res.data);
          const cacheKey = `${theatreId}:${layoutVersionId}`;
          objectsCacheRef.current.set(cacheKey, res.data);
          return res.data;
        }
        return objects;
      } catch (err) {
        setError(parseErrorMessage(err, "Error reordering objects"));
        return objects;
      }
    },
    [layoutVersionId, theatreId, objects]
  );

  const toggleLock = useCallback(
    async (id: string) => {
      setObjects((prev) => prev.map((o) => (o.id === id ? { ...o, isLocked: !o.isLocked } : o)));
      try {
        const res = await toggleLockStructuralObjectAction({ id, theatreId });
        if (res.success && res.data) {
          const updated = res.data;
          setObjects((prev) => prev.map((o) => (o.id === id ? updated : o)));
        } else {
          refreshObjects();
        }
      } catch {
        refreshObjects();
      }
    },
    [theatreId, refreshObjects]
  );

  const toggleVisibility = useCallback(
    async (id: string) => {
      setObjects((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, visibility: o.visibility === "VISIBLE" ? "HIDDEN" : "VISIBLE" } : o
        )
      );
      try {
        const res = await toggleVisibilityStructuralObjectAction({ id, theatreId });
        if (res.success && res.data) {
          const updated = res.data;
          setObjects((prev) => prev.map((o) => (o.id === id ? updated : o)));
        } else {
          refreshObjects();
        }
      } catch {
        refreshObjects();
      }
    },
    [theatreId, refreshObjects]
  );

  const validate = useCallback(async (): Promise<StructuralObjectValidationResult | null> => {
    try {
      const res = await validateStructuralObjectsAction({ layoutVersionId, theatreId });
      if (res.success && res.data) {
        setValidationResult(res.data);
        return res.data;
      }
      return null;
    } catch {
      return null;
    }
  }, [layoutVersionId, theatreId]);

  // Memoized Selectors
  const selectedObject = useMemo(
    () => objects.find((o) => o.id === selectedObjectId) || null,
    [objects, selectedObjectId]
  );

  const screens = useMemo(
    () => objects.filter((o) => o.objectType === "SCREEN" && o.visibility === "VISIBLE"),
    [objects]
  );

  const emergencyExits = useMemo(
    () => objects.filter((o) => o.objectType === "EMERGENCY_EXIT" && o.visibility === "VISIBLE"),
    [objects]
  );

  const entrances = useMemo(
    () => objects.filter((o) => (o.objectType === "ENTRANCE" || o.objectType === "EXIT") && o.visibility === "VISIBLE"),
    [objects]
  );

  const collisionObstacles = useMemo(
    () => objects.filter((o) => o.metadata.isCollisionObstacle && o.visibility === "VISIBLE"),
    [objects]
  );

  const accessiblePaths = useMemo(
    () => objects.filter((o) => o.objectType === "ACCESSIBLE_PATH" && o.visibility === "VISIBLE"),
    [objects]
  );

  return {
    objects,
    selectedObjectId,
    setSelectedObjectId,
    selectedObject,
    isLoading,
    error,
    validationResult,
    refreshObjects,
    createObject,
    updateObject,
    deleteObject,
    duplicateObject,
    reorderObjects,
    toggleLock,
    toggleVisibility,
    validate,
    screens,
    emergencyExits,
    entrances,
    collisionObstacles,
    accessiblePaths,
    hasScreen: screens.length > 0,
    hasEmergencyExit: emergencyExits.length > 0,
  };
}
