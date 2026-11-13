"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Trash2,
  Settings2,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  Building2,
  SlidersHorizontal,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmenityIconResolver } from "./amenity-icon-resolver";
import {
  AmenityAvailabilityBadge,
  AmenityPriorityBadge,
  AmenityVisibilityBadge,
} from "./amenity-status-badge";
import { TheatreAmenityAssignModal } from "./theatre-amenity-assign-modal";
import { TheatreAmenityEditModal } from "./theatre-amenity-edit-modal";
import { AmenityCatalogFormModal } from "./amenity-catalog-form-modal";
import type {
  TheatreAmenityWithCatalog,
  AmenityCatalogRecord,
  AmenityCategoryRecord,
  AssignAmenityToTheatreInput,
  UpdateTheatreAmenityInput,
  CreateAmenityCatalogInput,
  UpdateAmenityCatalogInput,
  AmenityAvailabilityMode,
} from "@/types/theatre-amenity.types";

interface TheatreAmenityWorkspaceProps {
  theatreId: string;
  theatreName: string;
  isSuperAdmin?: boolean;
  initialAssignments: TheatreAmenityWithCatalog[];
  allCatalog: AmenityCatalogRecord[];
  allCategories: AmenityCategoryRecord[];
  onAssignAmenity: (data: AssignAmenityToTheatreInput) => Promise<TheatreAmenityWithCatalog>;
  onUpdateAmenity: (data: UpdateTheatreAmenityInput) => Promise<TheatreAmenityWithCatalog>;
  onRemoveAmenity: (assignmentId: string, theatreId: string) => Promise<boolean>;
  onReorderAmenities: (theatreId: string, orderedAssignmentIds: string[]) => Promise<void>;
  onCreateCatalogItem?: (data: CreateAmenityCatalogInput) => Promise<AmenityCatalogRecord>;
  onUpdateCatalogItem?: (data: UpdateAmenityCatalogInput) => Promise<AmenityCatalogRecord>;
}

export function TheatreAmenityWorkspace({
  theatreId,
  theatreName,
  isSuperAdmin = false,
  initialAssignments,
  allCatalog,
  allCategories,
  onAssignAmenity,
  onUpdateAmenity,
  onRemoveAmenity,
  onReorderAmenities,
  onCreateCatalogItem,
  onUpdateCatalogItem,
}: TheatreAmenityWorkspaceProps) {
  const [assignments, setAssignments] = useState<TheatreAmenityWithCatalog[]>(initialAssignments);
  const [catalog, setCatalog] = useState<AmenityCatalogRecord[]>(allCatalog);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<TheatreAmenityWithCatalog | null>(null);
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [editingCatalogItem, setEditingCatalogItem] = useState<AmenityCatalogRecord | null>(null);

  // Feedback banner
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Unassigned Catalog items for this theatre
  const assignedAmenityIds = useMemo(
    () => new Set(assignments.map((a) => a.amenityId)),
    [assignments]
  );
  const unassignedCatalog = useMemo(
    () => catalog.filter((c) => !assignedAmenityIds.has(c.id) && c.status === "ACTIVE"),
    [catalog, assignedAmenityIds]
  );

  // Filtered Assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      if (selectedCategoryCode !== "all" && item.amenity.categoryCode !== selectedCategoryCode) {
        return false;
      }
      if (selectedAvailability !== "all" && item.availability !== selectedAvailability) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          item.amenity.name.toLowerCase().includes(q) ||
          item.amenity.displayName.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [assignments, selectedCategoryCode, selectedAvailability, searchQuery]);

  // Statistics
  const availableCount = assignments.filter((a) => a.availability === "AVAILABLE").length;
  const maintenanceCount = assignments.filter((a) => a.availability === "UNDER_MAINTENANCE").length;
  const tempUnavailableCount = assignments.filter(
    (a) => a.availability === "TEMPORARILY_UNAVAILABLE" || a.availability === "SEASONAL"
  ).length;

  const showFeedback = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Reordering handlers
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= assignments.length) return;

    const reordered = [...assignments];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // Update local display orders
    const updated = reordered.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
    setAssignments(updated);

    try {
      await onReorderAmenities(
        theatreId,
        updated.map((u) => u.id)
      );
      showFeedback("Amenity display sequence updated.");
    } catch {
      showFeedback("Failed to update sequence.", "error");
      setAssignments(assignments);
    }
  };

  // Assignment Handlers
  const handleAssign = async (data: AssignAmenityToTheatreInput) => {
    try {
      const created = await onAssignAmenity(data);
      setAssignments((prev) => [...prev, created].sort((a, b) => a.displayOrder - b.displayOrder));
      showFeedback(`Enabled '${created.amenity.displayName}' for this cinema.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to assign amenity.";
      showFeedback(msg, "error");
      throw err;
    }
  };

  const handleUpdate = async (data: UpdateTheatreAmenityInput) => {
    try {
      const updated = await onUpdateAmenity(data);
      setAssignments((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      showFeedback(`Updated configuration for '${updated.amenity.displayName}'.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update amenity.";
      showFeedback(msg, "error");
      throw err;
    }
  };

  const handleRemove = async (assignmentId: string, name: string) => {
    if (!confirm(`Are you sure you want to disable '${name}' for this theatre?`)) return;
    try {
      await onRemoveAmenity(assignmentId, theatreId);
      setAssignments((prev) => prev.filter((item) => item.id !== assignmentId));
      showFeedback(`Removed '${name}' from active amenities.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove amenity.";
      showFeedback(msg, "error");
    }
  };

  // Catalog item handlers (Super Admin)
  const handleSaveCatalogItem = async (data: CreateAmenityCatalogInput | UpdateAmenityCatalogInput) => {
    if ("id" in data && onUpdateCatalogItem) {
      const updated = await onUpdateCatalogItem(data);
      setCatalog((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      showFeedback(`Updated Master Amenity '${updated.displayName}'.`);
    } else if (onCreateCatalogItem) {
      const created = await onCreateCatalogItem(data as CreateAmenityCatalogInput);
      setCatalog((prev) => [...prev, created]);
      showFeedback(`Created Master Amenity '${created.displayName}'.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-950/70 border-emerald-800 text-emerald-300"
              : "bg-red-950/70 border-red-800 text-red-300"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:opacity-75"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Command Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="elevated" className="p-4 flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-zinc-400">Enabled Amenities</p>
            <p className="text-xl font-bold text-white">{assignments.length}</p>
          </div>
        </Card>

        <Card variant="elevated" className="p-4 flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-zinc-400">Available Now</p>
            <p className="text-xl font-bold text-emerald-400">{availableCount}</p>
          </div>
        </Card>

        <Card variant="elevated" className="p-4 flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-zinc-400">In Maintenance</p>
            <p className="text-xl font-bold text-rose-400">{maintenanceCount}</p>
          </div>
        </Card>

        <Card variant="elevated" className="p-4 flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-zinc-400">Global Master Pool</p>
            <p className="text-xl font-bold text-sky-400">{catalog.length}</p>
          </div>
        </Card>
      </div>

      {/* Action Controls & Filters */}
      <Card variant="basic" className="p-4 space-y-4 border-[#2A3445]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search amenities, acoustics, seating, or local notes..."
              className="w-full h-10 pl-10 pr-4 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="h-10 px-3 text-xs rounded-xl bg-[#0F1523] border border-[#26334D] text-zinc-300 focus:outline-none focus:border-red-500"
            >
              <option value="all">All Availability Modes</option>
              <option value="AVAILABLE">Available</option>
              <option value="TEMPORARILY_UNAVAILABLE">Temporarily Unavailable</option>
              <option value="SEASONAL">Seasonal</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            </select>

            <Button
              onClick={() => setAssignModalOpen(true)}
              variant="primary"
              size="sm"
              className="gap-2 text-xs font-bold shrink-0"
              disabled={unassignedCatalog.length === 0}
            >
              <Plus className="h-4 w-4" /> Enable Amenity
            </Button>

            {isSuperAdmin && onCreateCatalogItem && (
              <Button
                onClick={() => {
                  setEditingCatalogItem(null);
                  setCatalogModalOpen(true);
                }}
                variant="outline"
                size="sm"
                className="gap-2 text-xs shrink-0"
              >
                <SlidersHorizontal className="h-4 w-4" /> Add Master
              </Button>
            )}
          </div>
        </div>

        {/* Dynamic Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#1E293B]">
          <button
            onClick={() => setSelectedCategoryCode("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCategoryCode === "all"
                ? "bg-red-950/80 text-red-300 border border-red-800"
                : "bg-[#111827] text-zinc-400 border border-[#1E293B] hover:text-white"
            }`}
          >
            All Categories
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryCode(cat.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategoryCode === cat.code
                  ? "bg-red-950/80 text-red-300 border border-red-800"
                  : "bg-[#111827] text-zinc-400 border border-[#1E293B] hover:text-white"
              }`}
            >
              {cat.displayName}
            </button>
          ))}
        </div>
      </Card>

      {/* Amenity Fleet Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
          <span>
            Showing <strong className="text-white">{filteredAssignments.length}</strong> of {assignments.length} configured facilities for <span className="text-zinc-200">{theatreName}</span>
          </span>
          {unassignedCatalog.length > 0 && (
            <span className="text-amber-400 text-[11px]">
              + {unassignedCatalog.length} catalog options ready to enable
            </span>
          )}
        </div>

        {filteredAssignments.length === 0 ? (
          <Card variant="basic" className="p-12 text-center space-y-3 border-[#2A3445]">
            <div className="h-12 w-12 rounded-2xl bg-[#161F2E] border border-[#2A3445] text-zinc-500 mx-auto flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-white">No Matching Amenities</h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              No amenities match your current filters. Click &quot;Enable Amenity&quot; to add new facilities from the global catalog.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((item, index) => (
              <Card
                key={item.id}
                variant="elevated"
                className="p-5 flex flex-col justify-between gap-4 border-[#2A3445] hover:border-zinc-700 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-[#111827] border border-[#26334D] flex items-center justify-center text-amber-400 shrink-0">
                    <AmenityIconResolver iconName={item.amenity.defaultIcon} className="h-5 w-5" />
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-white truncate">
                        {item.amenity.displayName}
                      </h4>
                      <AmenityAvailabilityBadge availability={item.availability} />
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {item.amenity.description}
                    </p>

                    {item.notes && (
                      <p className="text-[11px] text-amber-400/90 bg-amber-950/20 border border-amber-900/30 px-2 py-1 rounded-md mt-1">
                        📍 {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Facility Metadata Chips */}
                {item.metadata && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1E293B] text-[11px] text-zinc-400">
                    {item.metadata.parkingCapacity && (
                      <span className="bg-[#111827] px-2 py-0.5 rounded border border-[#26334D]">
                        🚗 {item.metadata.parkingCapacity} Bays
                      </span>
                    )}
                    {item.metadata.evChargerCount && (
                      <span className="bg-[#111827] px-2 py-0.5 rounded border border-[#26334D] text-emerald-400">
                        ⚡ {item.metadata.evChargerCount} EV Chargers
                      </span>
                    )}
                    {item.metadata.wifiSsid && (
                      <span className="bg-[#111827] px-2 py-0.5 rounded border border-[#26334D] text-sky-400">
                        📶 {item.metadata.wifiSsid}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1E293B]">
                  <div className="flex items-center gap-1.5">
                    <AmenityPriorityBadge priority={item.amenity.priority} />
                    <AmenityVisibilityBadge visibility={item.visibility} />
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Reorder Controls */}
                    <button
                      type="button"
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-[#1E293B] disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, "down")}
                      disabled={index === assignments.length - 1}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-[#1E293B] disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingAssignment(item)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1E293B]"
                      title="Edit Local Settings"
                    >
                      <Settings2 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id, item.amenity.displayName)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                      title="Disable from Theatre"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <TheatreAmenityAssignModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSubmit={handleAssign}
        theatreId={theatreId}
        unassignedCatalog={unassignedCatalog}
      />

      <TheatreAmenityEditModal
        isOpen={Boolean(editingAssignment)}
        onClose={() => setEditingAssignment(null)}
        onSubmit={handleUpdate}
        assignment={editingAssignment}
      />

      {isSuperAdmin && (
        <AmenityCatalogFormModal
          isOpen={catalogModalOpen}
          onClose={() => setCatalogModalOpen(false)}
          onSubmit={handleSaveCatalogItem}
          categories={allCategories}
          initialData={editingCatalogItem}
        />
      )}
    </div>
  );
}
