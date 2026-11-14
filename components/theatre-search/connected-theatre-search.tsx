"use client";

import React, { useState, useTransition } from "react";
import {
  TheatreSearchResultsPayload,
  SavedSearchPreset,
  TheatreSearchFilters,
  TheatreSearchSortOption,
} from "@/types/theatre-search.types";
import {
  searchTheatresAction,
  saveSearchPresetAction,
  deleteSearchPresetAction,
} from "@/actions/theatre-search-actions";
import { TheatreSearchWorkspace } from "./theatre-search-workspace";

interface ConnectedTheatreSearchProps {
  initialData: TheatreSearchResultsPayload;
  initialPresets: SavedSearchPreset[];
}

export function ConnectedTheatreSearch({
  initialData,
  initialPresets,
}: ConnectedTheatreSearchProps) {
  const [data, setData] = useState<TheatreSearchResultsPayload>(initialData);
  const [presets, setPresets] = useState<SavedSearchPreset[]>(initialPresets);
  const [isPending, startTransition] = useTransition();

  const handleSearch = async (
    query: string,
    filters: TheatreSearchFilters,
    sortBy: TheatreSearchSortOption,
    page: number
  ) => {
    startTransition(async () => {
      try {
        const res = await searchTheatresAction({
          query: query || undefined,
          filters,
          sortBy,
          page,
          pageSize: 12,
        });

        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to execute search:", err);
      }
    });
  };

  const handleSavePreset = async (name: string, description?: string) => {
    try {
      const res = await saveSearchPresetAction({
        name,
        description,
        filters: data.appliedFilters,
        sortBy: data.sortBy,
        sortDirection: "desc",
      });

      if (res.success && res.data) {
        const savedItem = res.data;
        setPresets((prev) => [savedItem, ...prev.filter((p) => p.id !== savedItem.id)]);
      }
    } catch (err) {
      console.error("Failed to save search preset:", err);
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    try {
      const res = await deleteSearchPresetAction({ presetId });
      if (res.success) {
        setPresets((prev) => prev.filter((p) => p.id !== presetId));
      }
    } catch (err) {
      console.error("Failed to delete search preset:", err);
    }
  };

  return (
    <TheatreSearchWorkspace
      initialData={data}
      savedPresets={presets}
      onSearch={handleSearch}
      onSavePreset={handleSavePreset}
      onDeletePreset={handleDeletePreset}
      isLoading={isPending}
    />
  );
}
