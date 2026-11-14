"use client";

import React, { useState } from "react";
import { Bookmark, Plus, Trash2, Check, Sparkles, X } from "lucide-react";
import { SavedSearchPreset, TheatreSearchFilters, TheatreSearchSortOption } from "@/types/theatre-search.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

interface SavedSearchesPopoverProps {
  presets: SavedSearchPreset[];
  activeFilters: TheatreSearchFilters;
  activeSort: TheatreSearchSortOption;
  onApplyPreset: (preset: SavedSearchPreset) => void;
  onSaveCurrentPreset: (name: string, description?: string) => Promise<void>;
  onDeletePreset: (presetId: string) => Promise<void>;
  className?: string;
}

export function SavedSearchesPopover({
  presets,
  activeFilters,
  activeSort,
  onApplyPreset,
  onSaveCurrentPreset,
  onDeletePreset,
  className,
}: SavedSearchesPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetDesc, setPresetDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;

    setIsSubmitting(true);
    try {
      await onSaveCurrentPreset(presetName.trim(), presetDesc.trim() || undefined);
      setPresetName("");
      setPresetDesc("");
      setIsSaving(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 border-[#2A3445] bg-[#0F172A] hover:bg-[#1E293B] text-xs font-semibold"
      >
        <Bookmark className="h-3.5 w-3.5 text-[#F59E0B]" />
        <span>Saved Searches</span>
        {presets.length > 0 && (
          <span className="ml-1 px-1.5 py-0.2 bg-[#F59E0B]/20 text-[#F59E0B] rounded-full text-[10px] font-mono">
            {presets.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-[#0F172A] border border-[#2A3445] rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in-50 duration-150">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
                <Bookmark className="h-4 w-4 text-[#F59E0B]" />
                Saved Search Presets
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#94A3B8] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Presets List */}
            <div className="max-h-64 overflow-y-auto divide-y divide-[#1E293B]/60 p-1">
              {presets.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#64748B]">
                  No saved presets yet. Save your active filter criteria for instant access.
                </div>
              ) : (
                presets.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 flex items-start justify-between gap-2 hover:bg-[#1E293B]/70 rounded-xl transition-colors group"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onApplyPreset(p);
                        setIsOpen(false);
                      }}
                      className="text-left flex-1 min-w-0"
                    >
                      <div className="text-xs font-bold text-white group-hover:text-[#F59E0B] transition-colors truncate">
                        {p.name}
                      </div>
                      {p.description && (
                        <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                          {p.description}
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeletePreset(p.id)}
                      className="p-1 rounded text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                      title="Delete preset"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Save Current Search Form */}
            <div className="p-3 bg-[#0B101D] border-t border-[#1E293B]">
              {!isSaving ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSaving(true)}
                  className="w-full text-xs font-bold border-dashed border-[#334155] text-[#94A3B8] hover:text-white hover:border-[#F59E0B]"
                >
                  <Plus className="h-3.5 w-3.5 mr-1 text-[#F59E0B]" />
                  Save Current Filter View
                </Button>
              ) : (
                <form onSubmit={handleSave} className="space-y-2">
                  <div className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-[#F59E0B]" />
                    Save Active Search
                  </div>

                  <input
                    type="text"
                    required
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Preset name (e.g. Pune Flagships)..."
                    className="w-full px-2.5 py-1.5 bg-[#1E293B] border border-[#334155] rounded-lg text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#F59E0B]"
                  />

                  <input
                    type="text"
                    value={presetDesc}
                    onChange={(e) => setPresetDesc(e.target.value)}
                    placeholder="Optional description..."
                    className="w-full px-2.5 py-1.5 bg-[#1E293B] border border-[#334155] rounded-lg text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#F59E0B]"
                  />

                  <div className="flex items-center gap-1.5 pt-1">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmitting || !presetName.trim()}
                      className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-[#070B12] text-xs font-bold py-1 h-7"
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSaving(false)}
                      className="text-xs py-1 h-7"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
