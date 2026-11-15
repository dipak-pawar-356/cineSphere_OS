"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  HallSection,
  HallRow,
  SectionOrderingDirection,
  SectionGeometryType,
  RowGeometryType,
  RowNumberingStrategy,
  RowAccessibilityType,
} from "@/types/section-row-designer.types";
import {
  listSectionsAction,
  createSectionAction,
  updateSectionAction,
  deleteSectionAction,
  duplicateSectionAction,
  reorderSectionsAction,
  createRowAction,
  updateRowAction,
  deleteRowAction,
  duplicateRowAction,
  reorderRowsAction,
} from "@/actions/section-row-actions";

export interface UseSectionRowDesignerOptions {
  theatreId: string;
  layoutVersionId?: string;
  initialSections?: HallSection[];
  onMutationSuccess?: (action: string, entityName: string) => void;
  onError?: (errorMessage: string) => void;
}

export function useSectionRowDesigner({
  theatreId,
  layoutVersionId,
  initialSections = [],
  onMutationSuccess,
  onError,
}: UseSectionRowDesignerOptions) {
  const [sections, setSections] = useState<HallSection[]>(initialSections);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In-memory version cache to prevent redundant re-fetching
  const versionCache = useRef<Map<string, HallSection[]>>(new Map());

  // ----------------------------------------------------------------------------
  // 1. Data Loading with Cache
  // ----------------------------------------------------------------------------
  const loadSections = useCallback(
    async (forceRefresh = false) => {
      if (!layoutVersionId) return;

      if (!forceRefresh && versionCache.current.has(layoutVersionId)) {
        setSections(versionCache.current.get(layoutVersionId)!);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const res = await listSectionsAction({ theatreId, layoutVersionId });
        if (res.success && res.data) {
          setSections(res.data);
          versionCache.current.set(layoutVersionId, res.data);
        } else {
          const err = res.error?.message || "Failed to load sections.";
          setError(err);
          onError?.(err);
        }
      } catch (err: any) {
        const msg = err.message || "Failed to load sections.";
        setError(msg);
        onError?.(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId, layoutVersionId, onError]
  );

  useEffect(() => {
    if (layoutVersionId) {
      loadSections();
    }
  }, [layoutVersionId, loadSections]);

  // ----------------------------------------------------------------------------
  // 2. Section Operations (Part 3)
  // ----------------------------------------------------------------------------
  const createSection = useCallback(
    async (
      input: Omit<HallSection, "id" | "rows" | "createdAt" | "updatedAt">
    ): Promise<HallSection | null> => {
      if (!layoutVersionId) return null;
      setIsSaving(true);
      setError(null);
      try {
        const res = await createSectionAction(input as any);
        if (res.success && res.data) {
          const created = res.data;
          setSections((prev) => {
            const next = [...prev, created];
            versionCache.current.set(layoutVersionId, next);
            return next;
          });
          onMutationSuccess?.("CREATE_SECTION", created.name);
          return created;
        } else {
          const err = res.error?.message || "Failed to create section.";
          setError(err);
          onError?.(err);
          return null;
        }
      } catch (err: any) {
        const msg = err.message || "Failed to create section.";
        setError(msg);
        onError?.(msg);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [layoutVersionId, onMutationSuccess, onError]
  );

  const updateSection = useCallback(
    async (
      sectionId: string,
      updates: Partial<Omit<HallSection, "id" | "layoutVersionId" | "theatreId" | "rows">>
    ): Promise<HallSection | null> => {
      setIsSaving(true);
      setError(null);
      try {
        const res = await updateSectionAction({ theatreId, sectionId, updates });
        if (res.success && res.data) {
          const updated = res.data;
          setSections((prev) => {
            const next = prev.map((s) => (s.id === sectionId ? updated : s));
            if (layoutVersionId) versionCache.current.set(layoutVersionId, next);
            return next;
          });
          onMutationSuccess?.("UPDATE_SECTION", updated.name);
          return updated;
        } else {
          const err = res.error?.message || "Failed to update section.";
          setError(err);
          onError?.(err);
          return null;
        }
      } catch (err: any) {
        const msg = err.message || "Failed to update section.";
        setError(msg);
        onError?.(msg);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [theatreId, layoutVersionId, onMutationSuccess, onError]
  );

  const deleteSection = useCallback(
    async (sectionId: string): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        const res = await deleteSectionAction({ theatreId, sectionId });
        if (res.success) {
          setSections((prev) => {
            const next = prev.filter((s) => s.id !== sectionId);
            if (layoutVersionId) versionCache.current.set(layoutVersionId, next);
            return next;
          });
          if (selectedSectionId === sectionId) {
            setSelectedSectionId(null);
            setSelectedRowId(null);
          }
          onMutationSuccess?.("DELETE_SECTION", sectionId);
          return true;
        } else {
          const err = res.error?.message || "Failed to delete section.";
          setError(err);
          onError?.(err);
          return false;
        }
      } catch (err: any) {
        const msg = err.message || "Failed to delete section.";
        setError(msg);
        onError?.(msg);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [theatreId, layoutVersionId, selectedSectionId, onMutationSuccess, onError]
  );

  const duplicateSection = useCallback(
    async (sectionId: string): Promise<HallSection | null> => {
      setIsSaving(true);
      setError(null);
      try {
        const res = await duplicateSectionAction({ theatreId, sectionId });
        if (res.success && res.data) {
          const dup = res.data;
          setSections((prev) => {
            const next = [...prev, dup];
            if (layoutVersionId) versionCache.current.set(layoutVersionId, next);
            return next;
          });
          onMutationSuccess?.("DUPLICATE_SECTION", dup.name);
          return dup;
        } else {
          const err = res.error?.message || "Failed to duplicate section.";
          setError(err);
          onError?.(err);
          return null;
        }
      } catch (err: any) {
        const msg = err.message || "Failed to duplicate section.";
        setError(msg);
        onError?.(msg);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [theatreId, layoutVersionId, onMutationSuccess, onError]
  );

  const reorderSections = useCallback(
    async (sectionId: string, direction: SectionOrderingDirection): Promise<HallSection[]> => {
      if (!layoutVersionId) return sections;
      setIsSaving(true);
      setError(null);
      try {
        const res = await reorderSectionsAction({
          theatreId,
          layoutVersionId,
          sectionId,
          direction,
        });
        if (res.success && res.data) {
          setSections(res.data);
          versionCache.current.set(layoutVersionId, res.data);
          onMutationSuccess?.("REORDER_SECTIONS", direction);
          return res.data;
        } else {
          const err = res.error?.message || "Failed to reorder sections.";
          setError(err);
          onError?.(err);
          return sections;
        }
      } catch (err: any) {
        const msg = err.message || "Failed to reorder sections.";
        setError(msg);
        onError?.(msg);
        return sections;
      } finally {
        setIsSaving(false);
      }
    },
    [theatreId, layoutVersionId, sections, onMutationSuccess, onError]
  );

  // ----------------------------------------------------------------------------
  // 3. Row Operations (Part 4)
  // ----------------------------------------------------------------------------
  const createRow = useCallback(
    async (
      sectionId: string,
      input: Omit<HallRow, "id" | "seats" | "createdAt" | "updatedAt">
    ): Promise<HallRow | null> => {
      setIsSaving(true);
      setError(null);
      try {
        const res = await createRowAction(input as any);
        if (res.success && res.data) {
          const created = res.data;
          setSections((prev) => {
            const next = prev.map((s) =>
              s.id === sectionId ? { ...s, rows: [...s.rows, created] } : s
            );
            if (layoutVersionId) versionCache.current.set(layoutVersionId, next);
            return next;
          });
          onMutationSuccess?.("CREATE_ROW", created.rowName);
          return created;
        } else {
          const err = res.error?.message || "Failed to create row.";
          setError(err);
          onError?.(err);
          return null;
        }
      } catch (err: any) {
        const msg = err.message || "Failed to create row.";
        setError(msg);
        onError?.(msg);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [layoutVersionId, onMutationSuccess, onError]
  );

  const updateRow = useCallback(
    async (
      sectionId: string,
      rowId: string,
      updates: Partial<Omit<HallRow, "id" | "sectionId" | "theatreId">>
    ): Promise<HallRow | null> => {
      setIsSaving(true);
      setError(null);
      try {
        const res = await updateRowAction({ theatreId, rowId, updates });
        if (res.success && res.data) {
          const updated = res.data;
          setSections((prev) => {
            const next = prev.map((s) =>
              s.id === sectionId
                ? { ...s, rows: s.rows.map((r) => (r.id === rowId ? updated : r)) }
                : s
            );
            if (layoutVersionId) versionCache.current.set(layoutVersionId, next);
            return next;
          });
          onMutationSuccess?.("UPDATE_ROW", updated.rowName);
          return updated;
        } else {
          const err = res.error?.message || "Failed to update row.";
          setError(err);
          onError?.(err);
          return null;
        }
      } catch (err: any) {
        const msg = err.message || "Failed to update row.";
        setError(msg);
        onError?.(msg);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [theatreId, layoutVersionId, onMutationSuccess, onError]
  );

  const deleteRow = useCallback(
    async (sectionId: string, rowId: string): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        const res = await deleteRowAction({ theatreId, rowId });
        if (res.success) {
          setSections((prev) => {
            const next = prev.map((s) =>
              s.id === sectionId
                ? { ...s, rows: s.rows.filter((r) => r.id !== rowId) }
                : s
            );
            if (layoutVersionId) versionCache.current.set(layoutVersionId, next);
            return next;
          });
          if (selectedRowId === rowId) setSelectedRowId(null);
          onMutationSuccess?.("DELETE_ROW", rowId);
          return true;
        } else {
          const err = res.error?.message || "Failed to delete row.";
          setError(err);
          onError?.(err);
          return false;
        }
      } catch (err: any) {
        const msg = err.message || "Failed to delete row.";
        setError(msg);
        onError?.(msg);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [theatreId, layoutVersionId, selectedRowId, onMutationSuccess, onError]
  );

  const duplicateRow = useCallback(
    async (sectionId: string, rowId: string): Promise<HallRow | null> => {
      setIsSaving(true);
      setError(null);
      try {
        const res = await duplicateRowAction({ theatreId, rowId });
        if (res.success && res.data) {
          const dup = res.data;
          setSections((prev) => {
            const next = prev.map((s) =>
              s.id === sectionId ? { ...s, rows: [...s.rows, dup] } : s
            );
            if (layoutVersionId) versionCache.current.set(layoutVersionId, next);
            return next;
          });
          onMutationSuccess?.("DUPLICATE_ROW", dup.rowName);
          return dup;
        } else {
          const err = res.error?.message || "Failed to duplicate row.";
          setError(err);
          onError?.(err);
          return null;
        }
      } catch (err: any) {
        const msg = err.message || "Failed to duplicate row.";
        setError(msg);
        onError?.(msg);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [theatreId, layoutVersionId, onMutationSuccess, onError]
  );

  const reorderRows = useCallback(
    async (sectionId: string, rowId: string, direction: "UP" | "DOWN"): Promise<HallRow[]> => {
      setIsSaving(true);
      setError(null);
      try {
        const res = await reorderRowsAction({
          theatreId,
          sectionId,
          rowId,
          direction,
        });
        if (res.success && res.data) {
          setSections((prev) => {
            const next = prev.map((s) => (s.id === sectionId ? { ...s, rows: res.data! } : s));
            if (layoutVersionId) versionCache.current.set(layoutVersionId, next);
            return next;
          });
          onMutationSuccess?.("REORDER_ROWS", direction);
          return res.data;
        } else {
          const err = res.error?.message || "Failed to reorder rows.";
          setError(err);
          onError?.(err);
          return [];
        }
      } catch (err: any) {
        const msg = err.message || "Failed to reorder rows.";
        setError(msg);
        onError?.(msg);
        return [];
      } finally {
        setIsSaving(false);
      }
    },
    [theatreId, layoutVersionId, onMutationSuccess, onError]
  );

  // ----------------------------------------------------------------------------
  // 4. Memoized Aggregate Metrics & Selectors (Performance)
  // ----------------------------------------------------------------------------
  const totalSeats = useMemo(() => {
    return sections.reduce(
      (secSum, sec) => secSum + sec.rows.reduce((rowSum, r) => rowSum + r.seatCount, 0),
      0
    );
  }, [sections]);

  const totalRows = useMemo(() => {
    return sections.reduce((sum, sec) => sum + sec.rows.length, 0);
  }, [sections]);

  const selectedSection = useMemo(() => {
    return sections.find((s) => s.id === selectedSectionId) || null;
  }, [sections, selectedSectionId]);

  const selectedRow = useMemo(() => {
    if (!selectedSection || !selectedRowId) return null;
    return selectedSection.rows.find((r) => r.id === selectedRowId) || null;
  }, [selectedSection, selectedRowId]);

  const sectionsByCategory = useMemo(() => {
    const map: Record<string, HallSection[]> = {};
    sections.forEach((sec) => {
      if (!map[sec.seatCategory]) map[sec.seatCategory] = [];
      map[sec.seatCategory].push(sec);
    });
    return map;
  }, [sections]);

  const wheelchairRows = useMemo(() => {
    const list: HallRow[] = [];
    sections.forEach((sec) => {
      sec.rows.forEach((r) => {
        if (r.accessibility === "WHEELCHAIR") list.push(r);
      });
    });
    return list;
  }, [sections]);

  return {
    // State
    sections,
    selectedSectionId,
    selectedRowId,
    selectedSection,
    selectedRow,
    isLoading,
    isSaving,
    error,

    // Metrics
    totalSeats,
    totalRows,
    sectionsByCategory,
    wheelchairRows,

    // Selection
    setSelectedSectionId,
    setSelectedRowId,

    // Operations
    loadSections,
    createSection,
    updateSection,
    deleteSection,
    duplicateSection,
    reorderSections,
    createRow,
    updateRow,
    deleteRow,
    duplicateRow,
    reorderRows,
  };
}
