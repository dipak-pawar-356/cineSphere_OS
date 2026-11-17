"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import {
  ExtensionManifest,
  EnterpriseFeatureDefinition,
  EnterpriseFeatureKey,
  EnterpriseHallConfiguration,
  ThreeDConfigurationRecord,
  CollaborationConfigurationRecord,
  LayoutSceneGraph,
  AiLayoutSuggestion,
  HallDesignerDomainEvent,
  HallDesignerExtensionCategory,
  IoTDeviceDescriptor,
} from "@/types/enterprise-hall-designer.types";
import {
  loadExtensionConfigurationAction,
  enableEnterpriseFeatureAction,
  disableEnterpriseFeatureAction,
  loadEnterpriseSettingsAction,
  compileLayoutSceneGraphAction,
  saveThreeDConfigAction,
  saveCollaborationConfigAction,
  getAiLayoutSuggestionsAction,
  loadHallDomainEventsAction,
} from "@/actions/enterprise-hall-designer-actions";

export interface UseEnterpriseHallDesignerOptions {
  theatreId: string;
  hallId?: string;
}

export function useEnterpriseHallDesigner({
  theatreId,
  hallId,
}: UseEnterpriseHallDesignerOptions) {
  const [settings, setSettings] = useState<EnterpriseHallConfiguration | null>(null);
  const [extensions, setExtensions] = useState<Array<ExtensionManifest & { isEnabledForTheatre: boolean }>>([]);
  const [featuresCatalog, setFeaturesCatalog] = useState<EnterpriseFeatureDefinition[]>([]);
  const [iotDevices, setIotDevices] = useState<IoTDeviceDescriptor[]>([]);
  const [sceneGraph, setSceneGraph] = useState<LayoutSceneGraph | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AiLayoutSuggestion[]>([]);
  const [domainEvents, setDomainEvents] = useState<HallDesignerDomainEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sceneCacheRef = useRef<Map<string, LayoutSceneGraph>>(new Map());

  const loadSettings = useCallback(async () => {
    if (!theatreId) return null;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await loadEnterpriseSettingsAction({ theatreId });
      if (res.success && res.data) {
        setSettings(res.data);
        return res.data;
      }
      setErrorMessage(res.error?.message || "Failed to load enterprise settings.");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load enterprise settings.");
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [theatreId]);

  const loadExtensions = useCallback(
    async (category?: HallDesignerExtensionCategory) => {
      if (!theatreId) return null;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await loadExtensionConfigurationAction({ theatreId, category });
        if (res.success && res.data) {
          setExtensions(res.data.extensions);
          setFeaturesCatalog(res.data.featuresCatalog);
          setIotDevices(res.data.iotDevices);
          return res.data;
        }
        setErrorMessage(res.error?.message || "Failed to load extension configuration.");
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load extension configuration.");
      } finally {
        setIsLoading(false);
      }
      return null;
    },
    [theatreId]
  );

  const toggleFeature = useCallback(
    async (featureKey: EnterpriseFeatureKey, enable: boolean) => {
      if (!theatreId) return null;
      setIsLoading(true);
      try {
        const action = enable ? enableEnterpriseFeatureAction : disableEnterpriseFeatureAction;
        const res = await action({ theatreId, featureKey });
        if (res.success && res.data) {
          setSettings(res.data);
          await loadExtensions();
          return res.data;
        }
        setErrorMessage(res.error?.message || `Failed to toggle feature '${featureKey}'.`);
      } finally {
        setIsLoading(false);
      }
      return null;
    },
    [theatreId, loadExtensions]
  );

  const compileSceneGraph = useCallback(
    async (params?: { targetHallId?: string; layoutVersionId?: string; forceRefresh?: boolean }) => {
      const activeHall = params?.targetHallId || hallId;
      if (!theatreId || !activeHall) return null;

      const cacheKey = `${theatreId}:${activeHall}:${params?.layoutVersionId || "latest"}`;
      if (!params?.forceRefresh && sceneCacheRef.current.has(cacheKey)) {
        const cached = sceneCacheRef.current.get(cacheKey)!;
        setSceneGraph(cached);
        return cached;
      }

      setIsLoading(true);
      try {
        const res = await compileLayoutSceneGraphAction({
          theatreId,
          hallId: activeHall,
          layoutVersionId: params?.layoutVersionId,
        });
        if (res.success && res.data) {
          sceneCacheRef.current.set(cacheKey, res.data);
          setSceneGraph(res.data);
          return res.data;
        }
        setErrorMessage(res.error?.message || "Failed to compile layout scene graph.");
      } finally {
        setIsLoading(false);
      }
      return null;
    },
    [theatreId, hallId]
  );

  const saveThreeDConfig = useCallback(
    async (updates: Partial<ThreeDConfigurationRecord>) => {
      if (!theatreId) return null;
      const res = await saveThreeDConfigAction({ ...updates, theatreId });
      if (res.success && res.data) {
        setSettings((prev) => (prev ? { ...prev, threeDConfig: res.data! } : prev));
        return res.data;
      }
      return null;
    },
    [theatreId]
  );

  const saveCollaborationConfig = useCallback(
    async (updates: Partial<CollaborationConfigurationRecord>) => {
      if (!theatreId) return null;
      const res = await saveCollaborationConfigAction({ ...updates, theatreId });
      if (res.success && res.data) {
        setSettings((prev) => (prev ? { ...prev, collaborationConfig: res.data! } : prev));
        return res.data;
      }
      return null;
    },
    [theatreId]
  );

  const fetchAiSuggestions = useCallback(
    async (targetHallId?: string, layoutVersionId?: string) => {
      const activeHall = targetHallId || hallId;
      if (!theatreId || !activeHall) return [];
      const res = await getAiLayoutSuggestionsAction({
        theatreId,
        hallId: activeHall,
        layoutVersionId,
      });
      if (res.success && res.data) {
        setAiSuggestions(res.data);
        return res.data;
      }
      return [];
    },
    [theatreId, hallId]
  );

  const fetchDomainEvents = useCallback(
    async (limit = 50) => {
      if (!theatreId) return [];
      const res = await loadHallDomainEventsAction({ theatreId, limit });
      if (res.success && res.data) {
        setDomainEvents(res.data);
        return res.data;
      }
      return [];
    },
    [theatreId]
  );

  const enabledExtensionsCount = useMemo(
    () => extensions.filter((e) => e.isEnabledForTheatre).length,
    [extensions]
  );

  return {
    settings,
    extensions,
    featuresCatalog,
    iotDevices,
    sceneGraph,
    aiSuggestions,
    domainEvents,
    enabledExtensionsCount,
    isLoading,
    errorMessage,
    loadSettings,
    loadExtensions,
    toggleFeature,
    compileSceneGraph,
    saveThreeDConfig,
    saveCollaborationConfig,
    fetchAiSuggestions,
    fetchDomainEvents,
  };
}
