"use client";

import { useState, useCallback, useMemo } from "react";
import {
  HallTemplateDefinition,
  HallTemplateCategory,
  TemplateConfiguration,
  GenerateLayoutFromTemplateResult,
} from "@/types/hall-templates.types";
import {
  loadTemplatesAction,
  getTemplateDetailsAction,
  duplicateTemplateAction,
  archiveTemplateAction,
  generateLayoutFromTemplateAction,
  loadTemplateConfigAction,
} from "@/actions/hall-templates-actions";

export interface UseHallTemplatesOptions {
  theatreId: string;
  initialCategory?: HallTemplateCategory;
}

export function useHallTemplates({ theatreId, initialCategory }: UseHallTemplatesOptions) {
  const [templates, setTemplates] = useState<HallTemplateDefinition[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<HallTemplateDefinition | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<HallTemplateCategory | undefined>(initialCategory);
  const [config, setConfig] = useState<TemplateConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Derived categories
  const builtInCount = useMemo(() => templates.filter((t) => t.isBuiltIn).length, [templates]);
  const customCount = useMemo(() => templates.filter((t) => !t.isBuiltIn).length, [templates]);

  return {
    templates,
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
    selectTemplate,
    duplicateTemplate,
    generateLayout,
    archiveTemplate,
    fetchConfig,
  };
}
