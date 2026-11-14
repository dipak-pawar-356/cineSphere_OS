"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  Building2,
  X,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FilterX,
} from "lucide-react";
import {
  TheatreSearchResultsPayload,
  TheatreSearchFilters,
  TheatreSearchSortOption,
  SavedSearchPreset,
  TheatreSearchSuggestion,
} from "@/types/theatre-search.types";
import { TheatreSearchBar } from "./theatre-search-bar";
import { TheatreFilterPanel } from "./theatre-filter-panel";
import { TheatreSearchSortDropdown } from "./theatre-search-sort-dropdown";
import { SavedSearchesPopover } from "./saved-searches-popover";
import { TheatreSearchCard } from "./theatre-search-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";

interface TheatreSearchWorkspaceProps {
  initialData: TheatreSearchResultsPayload;
  savedPresets: SavedSearchPreset[];
  onSearch: (
    query: string,
    filters: TheatreSearchFilters,
    sortBy: TheatreSearchSortOption,
    page: number
  ) => Promise<void>;
  onSavePreset: (name: string, description?: string) => Promise<void>;
  onDeletePreset: (presetId: string) => Promise<void>;
  isLoading?: boolean;
}

export function TheatreSearchWorkspace({
  initialData,
  savedPresets,
  onSearch,
  onSavePreset,
  onDeletePreset,
  isLoading = false,
}: TheatreSearchWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState(initialData.appliedFilters.query || "");
  const [activeFilters, setActiveFilters] = useState<TheatreSearchFilters>(initialData.appliedFilters);
  const [activeSort, setActiveSort] = useState<TheatreSearchSortOption>(initialData.sortBy);
  const [currentPage, setCurrentPage] = useState(initialData.pagination.page);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Trigger search update
  const executeSearch = (
    queryText: string,
    filtersToApply: TheatreSearchFilters,
    sortOption: TheatreSearchSortOption,
    page: number = 1
  ) => {
    setCurrentPage(page);
    onSearch(queryText, filtersToApply, sortOption, page);
  };

  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
  };

  const handleQuerySubmit = (val: string) => {
    executeSearch(val, activeFilters, activeSort, 1);
  };

  const handleFiltersChange = (newFilters: TheatreSearchFilters) => {
    setActiveFilters(newFilters);
    executeSearch(searchQuery, newFilters, activeSort, 1);
  };

  const handleSortChange = (newSort: TheatreSearchSortOption) => {
    setActiveSort(newSort);
    executeSearch(searchQuery, activeFilters, newSort, 1);
  };

  const handleResetFilters = () => {
    const emptyFilters: TheatreSearchFilters = {
      theatreType: "ALL",
      chainType: "ALL",
    };
    setActiveFilters(emptyFilters);
    setSearchQuery("");
    executeSearch("", emptyFilters, activeSort, 1);
  };

  const handleApplyPreset = (preset: SavedSearchPreset) => {
    setActiveFilters(preset.filters);
    setActiveSort(preset.sortBy);
    executeSearch(preset.filters.query || searchQuery, preset.filters, preset.sortBy, 1);
  };

  const handlePageChange = (page: number) => {
    executeSearch(searchQuery, activeFilters, activeSort, page);
  };

  // Remove individual filter chip
  const removeFilterChip = (type: string, value: string) => {
    const updated = { ...activeFilters };
    if (type === "status" && updated.statuses) {
      updated.statuses = updated.statuses.filter((s) => s !== value);
      if (updated.statuses.length === 0) delete updated.statuses;
    } else if (type === "city" && updated.cities) {
      updated.cities = updated.cities.filter((c) => c !== value);
      if (updated.cities.length === 0) delete updated.cities;
    } else if (type === "state" && updated.states) {
      updated.states = updated.states.filter((s) => s !== value);
      if (updated.states.length === 0) delete updated.states;
    } else if (type === "amenity" && updated.amenities) {
      updated.amenities = updated.amenities.filter((a) => a !== value);
      if (updated.amenities.length === 0) delete updated.amenities;
    } else if (type === "theatreType") {
      updated.theatreType = "ALL";
    } else if (type === "chainType") {
      updated.chainType = "ALL";
    }
    handleFiltersChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* 1. Master Control Header: Search Bar & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <TheatreSearchBar
            value={searchQuery}
            onChange={handleQueryChange}
            onSearch={handleQuerySubmit}
          />
        </div>

        <div className="flex items-center gap-2 justify-between sm:justify-start">
          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 border-[#2A3445] bg-[#0F172A] text-xs font-semibold"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#F59E0B]" />
            Filters
          </Button>

          {/* Saved Searches Popover */}
          <SavedSearchesPopover
            presets={savedPresets}
            activeFilters={activeFilters}
            activeSort={activeSort}
            onApplyPreset={handleApplyPreset}
            onSaveCurrentPreset={onSavePreset}
            onDeletePreset={onDeletePreset}
          />

          {/* Sort Dropdown */}
          <TheatreSearchSortDropdown
            value={activeSort}
            onChange={handleSortChange}
          />
        </div>
      </div>

      {/* 2. Active Filter Chips & Results Count Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[#94A3B8] font-medium">
            Showing <strong className="text-white">{initialData.pagination.totalResults}</strong> venues
            <span className="text-[#64748B] ml-1 font-mono">({initialData.tookMs}ms)</span>
          </span>

          {/* Active Chips */}
          {activeFilters.statuses?.map((st) => (
            <span
              key={st}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1E293B] border border-[#334155] text-white text-[11px]"
            >
              Status: {st}
              <button
                type="button"
                onClick={() => removeFilterChip("status", st)}
                className="hover:text-[#EF4444]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {activeFilters.cities?.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1E293B] border border-[#334155] text-white text-[11px]"
            >
              City: {c}
              <button
                type="button"
                onClick={() => removeFilterChip("city", c)}
                className="hover:text-[#EF4444]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {activeFilters.theatreType && activeFilters.theatreType !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1E293B] border border-[#334155] text-white text-[11px]">
              Type: {activeFilters.theatreType}
              <button
                type="button"
                onClick={() => removeFilterChip("theatreType", "")}
                className="hover:text-[#EF4444]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {activeFilters.amenities?.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1E293B] border border-[#334155] text-pink-400 text-[11px]"
            >
              {a}
              <button
                type="button"
                onClick={() => removeFilterChip("amenity", a)}
                className="hover:text-[#EF4444]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Clear All shortcut */}
        {(activeFilters.statuses?.length ||
          activeFilters.cities?.length ||
          activeFilters.amenities?.length ||
          (activeFilters.theatreType && activeFilters.theatreType !== "ALL")) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[11px] text-[#94A3B8] hover:text-[#F59E0B] transition-colors font-medium flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* 3. Main Body: Filter Sidebar + Search Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Panel */}
        <div className="hidden lg:block lg:col-span-1 sticky top-6">
          <TheatreFilterPanel
            filters={activeFilters}
            onChange={handleFiltersChange}
            onReset={handleResetFilters}
            facets={initialData.facets}
          />
        </div>

        {/* Mobile Filter Drawer Modal */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-50">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <TheatreFilterPanel
                filters={activeFilters}
                onChange={handleFiltersChange}
                onReset={handleResetFilters}
                facets={initialData.facets}
                isMobileDrawer={true}
                onCloseMobile={() => setIsMobileFilterOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="lg:col-span-3 space-y-6">
          {initialData.items.length === 0 ? (
            /* Graceful Empty State */
            <div className="p-12 text-center bg-[#0F172A]/80 border border-[#2A3445] rounded-2xl flex flex-col items-center justify-center space-y-4">
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-[#334155] text-[#94A3B8]">
                <FilterX className="h-8 w-8 text-[#F59E0B]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No Matching Theatres Found</h3>
                <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
                  We could not find any theatres matching your active search and filter criteria. Try adjusting your search query or clearing specific filters.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs font-bold border-[#F59E0B]/50 text-[#F59E0B] hover:bg-[#F59E0B]/10"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reset All Filters
              </Button>
            </div>
          ) : (
            <>
              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {initialData.items.map((theatre) => (
                  <TheatreSearchCard key={theatre.theatreId} theatre={theatre} />
                ))}
              </div>

              {/* Pagination Controls */}
              {initialData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-[#1E293B] pt-4 text-xs text-[#94A3B8]">
                  <div>
                    Page <strong className="text-white">{initialData.pagination.page}</strong> of{" "}
                    <strong className="text-white">{initialData.pagination.totalPages}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!initialData.pagination.hasPrevPage}
                      onClick={() => handlePageChange(initialData.pagination.page - 1)}
                      className="border-[#2A3445] bg-[#0F172A] text-xs h-8 px-2.5"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                      Previous
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!initialData.pagination.hasNextPage}
                      onClick={() => handlePageChange(initialData.pagination.page + 1)}
                      className="border-[#2A3445] bg-[#0F172A] text-xs h-8 px-2.5"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
