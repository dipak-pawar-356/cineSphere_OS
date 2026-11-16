"use client";

import { useState, useCallback, useEffect } from "react";
import {
  GeometrySettings,
  GeometryTransformCommand,
  LayoutPublishPreflightResult,
  SymmetryAxis,
  AlignType,
  DistributeType,
  BaseLayoutObject,
} from "@/types/geometry-layout.types";
import {
  loadGeometrySettingsAction,
  saveGeometrySettingsAction,
  applyTransformAction,
  mirrorLayoutAction,
  duplicateSelectionAction,
  validateLayoutBeforePublishAction,
} from "@/actions/geometry-layout-actions";
import { GeometryEngine } from "@/lib/engine/geometry-engine";

interface UseGeometryEngineOptions {
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

export function useGeometryEngine({
  theatreId,
  layoutVersionId,
  autoLoad = true,
}: UseGeometryEngineOptions) {
  const [settings, setSettings] = useState<GeometrySettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [preflightResult, setPreflightResult] = useState<LayoutPublishPreflightResult | null>(null);
  const [isPreflightValidating, setIsPreflightValidating] = useState<boolean>(false);

  // Command History Pipeline for Undo / Redo
  const [undoStack, setUndoStack] = useState<GeometryTransformCommand[]>([]);
  const [redoStack, setRedoStack] = useState<GeometryTransformCommand[]>([]);

  const loadSettings = useCallback(async () => {
    if (!theatreId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await loadGeometrySettingsAction({ theatreId });
      if (res.success && res.data) {
        setSettings(res.data);
      } else if (!res.success) {
        setError(parseErrorMessage(res.error, "Failed to load geometry settings"));
      }
    } catch (err) {
      setError(parseErrorMessage(err, "Network error loading geometry settings"));
    } finally {
      setIsLoading(false);
    }
  }, [theatreId]);

  useEffect(() => {
    if (autoLoad && theatreId) {
      loadSettings();
    }
  }, [autoLoad, theatreId, loadSettings]);

  const saveSettings = useCallback(
    async (
      updated: Parameters<typeof saveGeometrySettingsAction>[0]
    ): Promise<GeometrySettings | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await saveGeometrySettingsAction(updated);
        if (res.success && res.data) {
          setSettings(res.data);
          return res.data;
        } else {
          setError(parseErrorMessage(res.error, "Failed to save geometry settings"));
          return null;
        }
      } catch (err) {
        setError(parseErrorMessage(err, "Error saving geometry settings"));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const applyTransform = useCallback(
    async (
      commandInput: Parameters<typeof applyTransformAction>[0]
    ): Promise<GeometryTransformCommand | null> => {
      try {
        const res = await applyTransformAction(commandInput);
        if (res.success && res.data) {
          const applied = res.data;
          setUndoStack((prev) => [...prev, applied]);
          setRedoStack([]); // clear redo on new action
          return applied;
        } else {
          setError(parseErrorMessage(res.error, "Transformation failed"));
          return null;
        }
      } catch (err) {
        setError(parseErrorMessage(err, "Error executing geometry transformation"));
        return null;
      }
    },
    []
  );

  const mirrorLayout = useCallback(
    async (axis: SymmetryAxis, axisCoord?: number): Promise<number> => {
      setIsLoading(true);
      try {
        const res = await mirrorLayoutAction({
          layoutVersionId,
          theatreId,
          axis,
          axisCoord,
        });
        if (res.success && res.data) {
          return res.data.mirroredObjectsCount;
        }
        return 0;
      } catch {
        return 0;
      } finally {
        setIsLoading(false);
      }
    },
    [layoutVersionId, theatreId]
  );

  const duplicateSelection = useCallback(
    async (objectIds: string[], offsetDx = 30, offsetDy = 30): Promise<BaseLayoutObject[]> => {
      try {
        const res = await duplicateSelectionAction({
          layoutVersionId,
          theatreId,
          objectIds,
          offsetDx,
          offsetDy,
        });
        if (res.success && res.data) {
          return res.data;
        }
        return [];
      } catch {
        return [];
      }
    },
    [layoutVersionId, theatreId]
  );

  const runPreflightCheck = useCallback(async (): Promise<LayoutPublishPreflightResult | null> => {
    setIsPreflightValidating(true);
    try {
      const res = await validateLayoutBeforePublishAction({
        layoutVersionId,
        theatreId,
      });
      if (res.success && res.data) {
        setPreflightResult(res.data);
        return res.data;
      }
      return null;
    } catch {
      return null;
    } finally {
      setIsPreflightValidating(false);
    }
  }, [layoutVersionId, theatreId]);

  // Spatial alignment utilities
  const alignSelected = useCallback(
    <T extends { position: { x: number; y: number }; width: number; height: number }>(
      items: T[],
      alignType: AlignType
    ): T[] => {
      return GeometryEngine.alignObjects(items, alignType);
    },
    []
  );

  const distributeSelected = useCallback(
    <T extends { position: { x: number; y: number }; width: number; height: number }>(
      items: T[],
      distributeType: DistributeType
    ): T[] => {
      return GeometryEngine.distributeObjects(items, distributeType);
    },
    []
  );

  return {
    settings,
    isLoading,
    error,
    preflightResult,
    isPreflightValidating,
    undoStack,
    redoStack,
    loadSettings,
    saveSettings,
    applyTransform,
    mirrorLayout,
    duplicateSelection,
    runPreflightCheck,
    alignSelected,
    distributeSelected,
  };
}
