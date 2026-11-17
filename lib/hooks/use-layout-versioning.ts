"use client";

import { useState, useCallback } from "react";
import {
  VersionHistoryItem,
  VersionComparisonDiff,
  VersionPolicy,
  VersionChangeEvent,
} from "@/types/layout-versioning.types";
import {
  loadVersionHistoryAction,
  createLayoutDraftVersionAction,
  compareVersionsAction,
  rollbackVersionAction,
  loadVersionPolicyAction,
  saveVersionPolicyAction,
  loadChangeEventsAction,
  loadVersionMetadataAction,
  updateVersionMetadataAction,
} from "@/actions/layout-versioning-actions";

export interface UseLayoutVersioningOptions {
  theatreId: string;
  layoutDefinitionId?: string;
}

export function useLayoutVersioning({ theatreId, layoutDefinitionId }: UseLayoutVersioningOptions) {
  const [historyItems, setHistoryItems] = useState<VersionHistoryItem[]>([]);
  const [currentPolicy, setCurrentPolicy] = useState<VersionPolicy | null>(null);
  const [activeComparison, setActiveComparison] = useState<VersionComparisonDiff | null>(null);
  const [changeEvents, setChangeEvents] = useState<VersionChangeEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [isRollingBack, setIsRollingBack] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchHistory = useCallback(
    async (targetDefId?: string) => {
      const defId = targetDefId || layoutDefinitionId;
      if (!theatreId || !defId) return;

      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await loadVersionHistoryAction({
          theatreId,
          layoutDefinitionId: defId,
        });
        if (res.success && res.data) {
          setHistoryItems(res.data);
        } else {
          setErrorMessage(res.error?.message || "Failed to load version history.");
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load version history.");
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId, layoutDefinitionId]
  );

  const createDraft = useCallback(
    async (params: { notes: string; sourceVersionId?: string; targetDefId?: string }) => {
      const defId = params.targetDefId || layoutDefinitionId;
      if (!theatreId || !defId) throw new Error("Missing theatreId or layoutDefinitionId.");

      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await createLayoutDraftVersionAction({
          theatreId,
          layoutDefinitionId: defId,
          notes: params.notes,
          sourceVersionId: params.sourceVersionId,
        });
        if (res.success && res.data) {
          await fetchHistory(defId);
          return res.data;
        } else {
          throw new Error(res.error?.message || "Failed to create draft version.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId, layoutDefinitionId, fetchHistory]
  );

  const compare = useCallback(
    async (sourceVersionId: string, targetVersionId: string) => {
      if (!theatreId || !sourceVersionId || !targetVersionId) return null;

      setIsComparing(true);
      setErrorMessage(null);
      try {
        const res = await compareVersionsAction({
          theatreId,
          sourceVersionId,
          targetVersionId,
        });
        if (res.success && res.data) {
          setActiveComparison(res.data);
          return res.data;
        } else {
          setErrorMessage(res.error?.message || "Failed to compare versions.");
          return null;
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to compare versions.");
        return null;
      } finally {
        setIsComparing(false);
      }
    },
    [theatreId]
  );

  const rollback = useCallback(
    async (targetVersionId: string, notes: string, targetDefId?: string) => {
      const defId = targetDefId || layoutDefinitionId;
      if (!theatreId || !defId || !targetVersionId) throw new Error("Missing required parameters for rollback.");

      setIsRollingBack(true);
      setErrorMessage(null);
      try {
        const res = await rollbackVersionAction({
          theatreId,
          layoutDefinitionId: defId,
          targetVersionId,
          notes,
        });
        if (res.success && res.data) {
          await fetchHistory(defId);
          return res.data;
        } else {
          throw new Error(res.error?.message || "Failed to rollback version.");
        }
      } finally {
        setIsRollingBack(false);
      }
    },
    [theatreId, layoutDefinitionId, fetchHistory]
  );

  const fetchPolicy = useCallback(async () => {
    if (!theatreId) return;
    try {
      const res = await loadVersionPolicyAction({ theatreId });
      if (res.success && res.data) {
        setCurrentPolicy(res.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load version policy.");
    }
  }, [theatreId]);

  const updatePolicy = useCallback(
    async (updates: Partial<VersionPolicy>) => {
      if (!theatreId) return;
      try {
        const res = await saveVersionPolicyAction({
          theatreId,
          ...updates,
        });
        if (res.success && res.data) {
          setCurrentPolicy(res.data);
          return res.data;
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to update version policy.");
      }
    },
    [theatreId]
  );

  const fetchChangeEvents = useCallback(
    async (versionId: string) => {
      if (!theatreId || !versionId) return;
      try {
        const res = await loadChangeEventsAction({ theatreId, versionId });
        if (res.success && res.data) {
          setChangeEvents(res.data);
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load change events.");
      }
    },
    [theatreId]
  );

  const fetchVersionMetadata = useCallback(
    async (versionId: string) => {
      if (!theatreId || !versionId) return undefined;
      try {
        const res = await loadVersionMetadataAction({ theatreId, versionId });
        if (res.success) {
          return res.data;
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load version metadata.");
      }
      return undefined;
    },
    [theatreId]
  );

  const updateVersionMetadata = useCallback(
    async (versionId: string, metadata: { labels?: string[]; tags?: string[]; authorNotes?: string }) => {
      if (!theatreId || !versionId) return undefined;
      try {
        const res = await updateVersionMetadataAction({
          theatreId,
          versionId,
          ...metadata,
        });
        if (res.success) {
          return res.data;
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to update version metadata.");
      }
      return undefined;
    },
    [theatreId]
  );

  return {
    historyItems,
    currentPolicy,
    activeComparison,
    changeEvents,
    isLoading,
    isComparing,
    isRollingBack,
    errorMessage,
    fetchHistory,
    createDraft,
    compare,
    rollback,
    fetchPolicy,
    updatePolicy,
    fetchChangeEvents,
    fetchVersionMetadata,
    updateVersionMetadata,
    setActiveComparison,
  };
}
