"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import {
  HallTemplateDefinition,
  HallTemplateCategory,
  TemplateConfiguration,
  GenerateLayoutFromTemplateResult,
  TemplatePreviewResult,
  TemplateExportEnvelope,
  TemplateRegistryItem,
} from "@/types/hall-templates.types";
import {
  loadTemplatesAction,
  getTemplateDetailsAction,
  duplicateTemplateAction,
  archiveTemplateAction,
  restoreTemplateAction,
  previewTemplateAction,
  exportTemplateAction,
  importTemplateAction,
  syncInheritedTemplateAction,
  loadTemplateRegistryAction,
  generateLayoutFromTemplateAction,
  loadTemplateConfigAction,
} from "@/actions/hall-templates-actions";

export interface UseHallTemplatesOptions {
  theatreId: string;
  initialCategory?: HallTemplateCategory;
}

export function useHallTemplates({ theatreId, initialCategory }: UseHallTemplatesOptions) {
  const [templates, setTemplates] = useState<HallTemplateDefinition[]>([]);
  const [registry, setRegistry] = useState<TemplateRegistryItem[]>([]);
  const [preview, setPreview] = useState<TemplatePreviewResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<HallTemplateDefinition | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<HallTemplateCategory | undefined>(initialCategory);
  const [config, setConfig] = useState<TemplateConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const templateDetailCacheRef = useRef<Map<string, HallTemplateDefinition>>(new Map());

  const fetchTemplates = useCallback(
    async (category?: HallTemplateCategory) => {
      if (!theatreId) return;

      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await loadTemplatesAction({
          theatreId,
          category: category !== undefined ? category : selectedCategory,
        });
        if (res.success && res.data) {
          setTemplates(res.data);
          if (!selectedTemplate && res.data.length > 0) {
            setSelectedTemplate(res.data[0]);
          }
        } else {
          setErrorMessage(res.error?.message || "Failed to load templates.");
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load templates.");
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId, selectedCategory, selectedTemplate]
  );

  const selectTemplate = useCallback(
    async (templateId: string) => {
      if (!theatreId || !templateId) return;

      const found = templates.find((t) => t.id === templateId);
      if (found) {
        setSelectedTemplate(found);
        return found;
      }

      setIsLoading(true);
      try {
        const res = await getTemplateDetailsAction({
          theatreId,
          templateId,
        });
        if (res.success && res.data) {
          setSelectedTemplate(res.data);
          return res.data;
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load template details.");
      } finally {
        setIsLoading(false);
      }
      return null;
    },
    [theatreId, templates]
  );

  const duplicateTemplate = useCallback(
    async (params: { sourceTemplateId: string; newName: string; newCode: string; customNotes?: string }) => {
      if (!theatreId) throw new Error("Missing theatreId.");

      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await duplicateTemplateAction({
          theatreId,
          sourceTemplateId: params.sourceTemplateId,
          newName: params.newName,
          newCode: params.newCode,
          customNotes: params.customNotes,
        });
        if (res.success && res.data) {
          await fetchTemplates();
          setSelectedTemplate(res.data);
          return res.data;
        } else {
          throw new Error(res.error?.message || "Failed to duplicate template.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId, fetchTemplates]
  );

  const generateLayout = useCallback(
    async (params: {
      templateId: string;
      targetHallId: string;
      layoutName: string;
      layoutDescription?: string;
    }): Promise<GenerateLayoutFromTemplateResult> => {
      if (!theatreId) throw new Error("Missing theatreId.");

      setIsGenerating(true);
      setErrorMessage(null);
      try {
        const res = await generateLayoutFromTemplateAction({
          theatreId,
          templateId: params.templateId,
          targetHallId: params.targetHallId,
          layoutName: params.layoutName,
          layoutDescription: params.layoutDescription,
        });
        if (res.success && res.data) {
          return res.data;
        } else {
          throw new Error(res.error?.message || "Failed to generate layout from template.");
        }
      } finally {
        setIsGenerating(false);
      }
    },
    [theatreId]
  );

  const archiveTemplate = useCallback(
    async (templateId: string) => {
      if (!theatreId) return;

      setIsLoading(true);
      try {
        const res = await archiveTemplateAction({ theatreId, templateId });
        if (res.success) {
          await fetchTemplates();
        } else {
          setErrorMessage(res.error?.message || "Failed to archive template.");
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to archive template.");
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId, fetchTemplates]
  );

  const fetchConfig = useCallback(async () => {
    if (!theatreId) return;
    try {
      const res = await loadTemplateConfigAction({ theatreId });
      if (res.success && res.data) {
        setConfig(res.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load template configuration.");
    }
  }, [theatreId]);

  const restoreTemplate = useCallback(
    async (templateId: string) => {
      if (!theatreId) return;
      setIsLoading(true);
      try {
        const res = await restoreTemplateAction({ theatreId, templateId });
        if (res.success) {
          templateDetailCacheRef.current.delete(templateId);
          await fetchTemplates();
        } else {
          setErrorMessage(res.error?.message || "Failed to restore template.");
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to restore template.");
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId, fetchTemplates]
  );

  const previewTemplate = useCallback(
    async (templateId: string): Promise<TemplatePreviewResult | null> => {
      if (!theatreId || !templateId) return null;
      try {
        const res = await previewTemplateAction({ theatreId, templateId });
        if (res.success && res.data) {
          setPreview(res.data);
          return res.data;
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to preview template.");
      }
      return null;
    },
    [theatreId]
  );

  const exportTemplate = useCallback(
    async (templateId: string): Promise<TemplateExportEnvelope | null> => {
      if (!theatreId || !templateId) return null;
      try {
        const res = await exportTemplateAction({ theatreId, templateId });
        if (res.success && res.data) {
          return res.data;
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to export template.");
      }
      return null;
    },
    [theatreId]
  );

  const importTemplate = useCallback(
    async (params: { envelope: TemplateExportEnvelope; overrideName?: string; overrideCode?: string }) => {
      if (!theatreId) throw new Error("Missing theatreId.");
      setIsLoading(true);
      try {
        const res = await importTemplateAction({
          theatreId,
          envelope: params.envelope,
          overrideName: params.overrideName,
          overrideCode: params.overrideCode,
        });
        if (res.success && res.data) {
          await fetchTemplates();
          setSelectedTemplate(res.data);
          return res.data;
        }
        throw new Error(res.error?.message || "Failed to import template.");
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId, fetchTemplates]
  );

  const syncInheritedTemplate = useCallback(
    async (templateId: string, preserveCanvasOverrides = true, preserveSectionColors = true) => {
      if (!theatreId) throw new Error("Missing theatreId.");
      setIsLoading(true);
      try {
        const res = await syncInheritedTemplateAction({
          theatreId,
          templateId,
          preserveCanvasOverrides,
          preserveSectionColors,
        });
        if (res.success && res.data) {
          templateDetailCacheRef.current.delete(templateId);
          await fetchTemplates();
          setSelectedTemplate(res.data.template);
          return res.data;
        }
        throw new Error(res.error?.message || "Failed to sync inherited template.");
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId, fetchTemplates]
  );

  const fetchRegistry = useCallback(
    async (includeArchived = false) => {
      if (!theatreId) return [];
      try {
        const res = await loadTemplateRegistryAction({ theatreId, includeArchived });
        if (res.success && res.data) {
          setRegistry(res.data);
          return res.data;
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load template registry.");
      }
      return [];
    },
    [theatreId]
  );

  // Derived categories
  const builtInCount = useMemo(() => templates.filter((t) => t.isBuiltIn).length, [templates]);
  const customCount = useMemo(() => templates.filter((t) => !t.isBuiltIn).length, [templates]);

  return {
    templates,
    registry,
    preview,
    selectedTemplate,
    selectedCategory,
    config,
    isLoading,
    isGenerating,
    errorMessage,
    builtInCount,
    customCount,
    setSelectedCategory,
    fetchTemplates,
    fetchRegistry,
    selectTemplate,
    previewTemplate,
    duplicateTemplate,
    generateLayout,
    archiveTemplate,
    restoreTemplate,
    exportTemplate,
    importTemplate,
    syncInheritedTemplate,
    fetchConfig,
  };
}
