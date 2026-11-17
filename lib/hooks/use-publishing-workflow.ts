"use client";

import { useState, useCallback } from "react";
import {
  PublishingStatusRecord,
  PublishingHistoryEntry,
  PublishingConfiguration,
  ShowLayoutAssignment,
} from "@/types/publishing-workflow.types";
import {
  publishVersionWorkflowAction,
  unpublishVersionWorkflowAction,
  loadPublishStatusAction,
  loadPublishHistoryAction,
  loadPublishingConfigAction,
  savePublishingConfigAction,
  assignLayoutToShowAction,
  getLayoutForShowAction,
  migrateShowLayoutAction,
} from "@/actions/publishing-workflow-actions";

export interface UsePublishingWorkflowOptions {
  theatreId: string;
  layoutDefinitionId?: string;
}

export function usePublishingWorkflow({ theatreId, layoutDefinitionId }: UsePublishingWorkflowOptions) {
  const [publishStatus, setPublishStatus] = useState<PublishingStatusRecord | null>(null);
  const [publishHistory, setPublishHistory] = useState<PublishingHistoryEntry[]>([]);
  const [publishConfig, setPublishConfig] = useState<PublishingConfiguration | null>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isUnpublishing, setIsUnpublishing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStatus = useCallback(
    async (targetDefId?: string) => {
      const defId = targetDefId || layoutDefinitionId;
      if (!theatreId || !defId) return;

      try {
        const res = await loadPublishStatusAction({
          theatreId,
          layoutDefinitionId: defId,
        });
        if (res.success && res.data) {
          setPublishStatus(res.data);
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load publishing status.");
      }
    },
    [theatreId, layoutDefinitionId]
  );

  const fetchHistory = useCallback(
    async (targetDefId?: string) => {
      const defId = targetDefId || layoutDefinitionId;
      if (!theatreId || !defId) return;

      try {
        const res = await loadPublishHistoryAction({
          theatreId,
          layoutDefinitionId: defId,
        });
        if (res.success && res.data) {
          setPublishHistory(res.data);
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load publishing history.");
      }
    },
    [theatreId, layoutDefinitionId]
  );

  const fetchConfig = useCallback(async () => {
    if (!theatreId) return;
    try {
      const res = await loadPublishingConfigAction({ theatreId });
      if (res.success && res.data) {
        setPublishConfig(res.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load publishing configuration.");
    }
  }, [theatreId]);

  const publishVersion = useCallback(
    async (params: { versionId: string; publishNotes?: string; targetDefId?: string }) => {
      const defId = params.targetDefId || layoutDefinitionId;
      if (!theatreId || !defId || !params.versionId) throw new Error("Missing parameters for publishing.");

      setIsPublishing(true);
      setErrorMessage(null);
      try {
        const res = await publishVersionWorkflowAction({
          theatreId,
          layoutDefinitionId: defId,
          versionId: params.versionId,
          publishNotes: params.publishNotes,
        });
        if (res.success && res.data) {
          await fetchStatus(defId);
          await fetchHistory(defId);
          return res.data;
        } else {
          throw new Error(res.error?.message || "Publishing failed.");
        }
      } finally {
        setIsPublishing(false);
      }
    },
    [theatreId, layoutDefinitionId, fetchStatus, fetchHistory]
  );

  const unpublishVersion = useCallback(
    async (params: { versionId: string; notes?: string; targetDefId?: string }) => {
      const defId = params.targetDefId || layoutDefinitionId;
      if (!theatreId || !defId || !params.versionId) throw new Error("Missing parameters for unpublishing.");

      setIsUnpublishing(true);
      setErrorMessage(null);
      try {
        const res = await unpublishVersionWorkflowAction({
          theatreId,
          layoutDefinitionId: defId,
          versionId: params.versionId,
          notes: params.notes,
        });
        if (res.success && res.data) {
          setPublishStatus(res.data);
          await fetchHistory(defId);
          return res.data;
        } else {
          throw new Error(res.error?.message || "Unpublish failed.");
        }
      } finally {
        setIsUnpublishing(false);
      }
    },
    [theatreId, layoutDefinitionId, fetchHistory]
  );

  const updateConfig = useCallback(
    async (updates: Partial<PublishingConfiguration>) => {
      if (!theatreId) return;
      try {
        const res = await savePublishingConfigAction({
          theatreId,
          ...updates,
        });
        if (res.success && res.data) {
          setPublishConfig(res.data);
          return res.data;
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to save publishing configuration.");
      }
    },
    [theatreId]
  );

  return {
    publishStatus,
    publishHistory,
    publishConfig,
    isPublishing,
    isUnpublishing,
    errorMessage,
    fetchStatus,
    fetchHistory,
    fetchConfig,
    publishVersion,
    unpublishVersion,
    updateConfig,
  };
}
