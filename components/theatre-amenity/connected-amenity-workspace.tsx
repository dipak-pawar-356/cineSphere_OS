"use client";

import React, { useState, useEffect } from "react";
import { TheatreAmenityWorkspace } from "./theatre-amenity-workspace";
import {
  assignAmenityToTheatreAction,
  updateTheatreAmenityAction,
  removeTheatreAmenityAction,
  reorderTheatreAmenitiesAction,
  createAmenityCatalogAction,
  updateAmenityCatalogAction,
  getTheatreAmenityBundleAction,
} from "@/actions/theatre-amenity-actions";
import type {
  TheatreAmenityWithCatalog,
  AmenityCatalogRecord,
  AmenityCategoryRecord,
  AssignAmenityToTheatreInput,
  UpdateTheatreAmenityInput,
  CreateAmenityCatalogInput,
  UpdateAmenityCatalogInput,
} from "@/types/theatre-amenity.types";

interface ConnectedAmenityWorkspaceProps {
  theatreId: string;
  theatreName?: string;
  isSuperAdmin?: boolean;
  initialBundle?: {
    assignments: TheatreAmenityWithCatalog[];
    categories: AmenityCategoryRecord[];
  };
  initialCatalog?: AmenityCatalogRecord[];
}

export function ConnectedAmenityWorkspace({
  theatreId,
  theatreName = "Cinema Complex",
  isSuperAdmin = false,
  initialBundle,
  initialCatalog = [],
}: ConnectedAmenityWorkspaceProps) {
  const [loading, setLoading] = useState(!initialBundle);
  const [assignments, setAssignments] = useState<TheatreAmenityWithCatalog[]>(
    initialBundle?.assignments || []
  );
  const [categories, setCategories] = useState<AmenityCategoryRecord[]>(
    initialBundle?.categories || []
  );
  const [catalog, setCatalog] = useState<AmenityCatalogRecord[]>(initialCatalog);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const bundleRes = await getTheatreAmenityBundleAction({ theatreId });
        if (bundleRes.success && bundleRes.data && mounted) {
          setAssignments(bundleRes.data.assignments);
          setCategories(bundleRes.data.categories);
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load amenities");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (!initialBundle) {
      load();
    }
    return () => {
      mounted = false;
    };
  }, [theatreId, initialBundle]);

  const handleAssignAmenity = async (data: AssignAmenityToTheatreInput) => {
    const res = await assignAmenityToTheatreAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to assign amenity");
    }
    return res.data;
  };

  const handleUpdateAmenity = async (data: UpdateTheatreAmenityInput) => {
    const res = await updateTheatreAmenityAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to update amenity");
    }
    return res.data;
  };

  const handleRemoveAmenity = async (assignmentId: string, thId: string) => {
    const res = await removeTheatreAmenityAction({ assignmentId, theatreId: thId });
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to remove amenity");
    }
    return true;
  };

  const handleReorderAmenities = async (thId: string, orderedAssignmentIds: string[]) => {
    const res = await reorderTheatreAmenitiesAction({ theatreId: thId, orderedAssignmentIds });
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to reorder amenities");
    }
  };

  const handleCreateCatalogItem = async (data: CreateAmenityCatalogInput) => {
    const res = await createAmenityCatalogAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to create master catalog amenity");
    }
    return res.data;
  };

  const handleUpdateCatalogItem = async (data: UpdateAmenityCatalogInput) => {
    const res = await updateAmenityCatalogAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to update master catalog amenity");
    }
    return res.data;
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-zinc-400 bg-[#0F1523] rounded-2xl border border-[#26334D]">
        <div className="animate-spin h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-3" />
        Loading cinema amenities and facilities...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-xs text-red-400 bg-red-950/40 rounded-2xl border border-red-900">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <TheatreAmenityWorkspace
      theatreId={theatreId}
      theatreName={theatreName}
      isSuperAdmin={isSuperAdmin}
      initialAssignments={assignments}
      allCatalog={catalog}
      allCategories={categories}
      onAssignAmenity={handleAssignAmenity}
      onUpdateAmenity={handleUpdateAmenity}
      onRemoveAmenity={handleRemoveAmenity}
      onReorderAmenities={handleReorderAmenities}
      onCreateCatalogItem={handleCreateCatalogItem}
      onUpdateCatalogItem={handleUpdateCatalogItem}
    />
  );
}
