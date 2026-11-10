"use client";

import { useState, useMemo, useCallback } from "react";
import { computeVirtualSlice } from "@/lib/performance/cache-strategy";

/**
 * Reusable Performance Virtualization Hook (Placeholder Architecture)
 * Prevents unnecessary DOM node rendering when displaying thousands of audit logs or tickets.
 */
export function useVirtualWindow<T>(
  items: T[],
  options?: {
    rowHeightPx?: number;
    viewportHeightPx?: number;
    overscanCount?: number;
  }
) {
  const rowHeightPx = options?.rowHeightPx ?? 56;
  const viewportHeightPx = options?.viewportHeightPx ?? 480;
  const overscanCount = options?.overscanCount ?? 5;

  const [scrollTopPx, setScrollTopPx] = useState(0);

  const windowSlice = useMemo(
    () =>
      computeVirtualSlice(
        items,
        scrollTopPx,
        viewportHeightPx,
        rowHeightPx,
        overscanCount
      ),
    [items, scrollTopPx, viewportHeightPx, rowHeightPx, overscanCount]
  );

  const onScroll = useCallback((scrollTop: number) => {
    setScrollTopPx(scrollTop);
  }, []);

  return {
    ...windowSlice,
    onScroll,
  };
}

