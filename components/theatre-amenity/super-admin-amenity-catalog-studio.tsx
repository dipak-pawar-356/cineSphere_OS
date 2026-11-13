"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  Edit,
  Archive,
  Tag,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AmenityIconResolver } from "./amenity-icon-resolver";
import { AmenityPriorityBadge, AmenityStatusBadge } from "./amenity-status-badge";
import { AmenityCatalogFormModal } from "./amenity-catalog-form-modal";
import {
  createAmenityCatalogAction,
  updateAmenityCatalogAction,
  archiveAmenityCatalogAction,
} from "@/actions/theatre-amenity-actions";
import type {
  AmenityCatalogRecord,
  AmenityCategoryRecord,
  CreateAmenityCatalogInput,
  UpdateAmenityCatalogInput,
} from "@/types/theatre-amenity.types";

interface SuperAdminAmenityCatalogStudioProps {
  initialCatalog: AmenityCatalogRecord[];
  categories: AmenityCategoryRecord[];
}

export function SuperAdminAmenityCatalogStudio({
  initialCatalog,
  categories,
}: SuperAdminAmenityCatalogStudioProps) {
  const [catalog, setCatalog] = useState<AmenityCatalogRecord[]>(initialCatalog);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AmenityCatalogRecord | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filteredCatalog = catalog.filter((item) => {
    if (selectedCategoryCode !== "all" && item.categoryCode !== selectedCategoryCode) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matches =
        item.name.toLowerCase().includes(q) ||
        item.displayName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));
      if (!matches) return false;
    }
    return true;
  });

  const handleSave = async (data: CreateAmenityCatalogInput | UpdateAmenityCatalogInput) => {
    if ("id" in data) {
      const res = await updateAmenityCatalogAction(data);
      if (!res.success || !res.data) throw new Error(res.error?.message || "Failed to update");
      setCatalog((prev) => prev.map((c) => (c.id === res.data!.id ? res.data! : c)));
      setNotice(`Updated '${res.data.displayName}' in global catalog.`);
    } else {
      const res = await createAmenityCatalogAction(data);
      if (!res.success || !res.data) throw new Error(res.error?.message || "Failed to create");
      setCatalog((prev) => [...prev, res.data!]);
      setNotice(`Created '${res.data.displayName}' in global catalog.`);
    }
    setTimeout(() => setNotice(null), 4000);
  };

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Archive catalog amenity '${name}' globally?`)) return;
    const res = await archiveAmenityCatalogAction({ id });
    if (res.success && res.data) {
      setCatalog((prev) => prev.map((c) => (c.id === id ? res.data! : c)));
      setNotice(`Archived '${name}'.`);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Luxury Amenities Catalog"
        subtitle="Global Master Library of Hardware, Seating, Acoustic & Hospitality Specs for Circuit Enablement"
        badge={`${catalog.length} Master Amenities`}
        badgeVariant="primary"
        actions={
          <Button
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
            variant="primary"
            size="sm"
            className="gap-2 text-xs font-bold"
          >
            <Plus className="h-4 w-4" /> Add Master Amenity
          </Button>
        }
      />

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs font-semibold text-emerald-300">
          ✓ {notice}
        </div>
      )}

      {/* Category Pills & Search */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          <button
            onClick={() => setSelectedCategoryCode("all")}
            className={`px-3 py-1.5 rounded-lg capitalize font-medium ${
              selectedCategoryCode === "all"
                ? "bg-[#FBBF24] text-[#070B12] font-bold"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryCode(cat.code)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium ${
                selectedCategoryCode === cat.code
                  ? "bg-[#FBBF24] text-[#070B12] font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {cat.displayName}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search master amenities..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Master Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCatalog.map((item) => (
          <Card
            key={item.id}
            variant="elevated"
            className="p-5 flex flex-col justify-between border-[#2A3445] hover:border-zinc-700 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-amber-400">
                  <AmenityIconResolver iconName={item.defaultIcon} className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <AmenityPriorityBadge priority={item.priority} />
                  <AmenityStatusBadge status={item.status} />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm">{item.displayName}</h3>
                <div className="text-[10px] text-[#FBBF24] font-semibold uppercase mt-0.5">
                  {item.categoryCode} • Code: {item.code}
                </div>
                <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>

              {item.localizedNames && Object.keys(item.localizedNames).length > 0 && (
                <div className="pt-2 text-[10px] text-zinc-500 flex flex-wrap gap-1.5">
                  {Object.entries(item.localizedNames).map(([lang, val]) => (
                    <span key={lang} className="bg-[#111827] px-1.5 py-0.5 rounded border border-[#26334D]">
                      {lang}: {val}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-[#2A3445]/60 flex items-center justify-between text-xs">
              <span className="text-[#64748B] font-mono text-[11px]">
                Order: #{item.displayOrder}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => {
                    setEditingItem(item);
                    setModalOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-[#2A3445] gap-1"
                >
                  <Edit className="h-3 w-3" /> Edit
                </Button>
                {item.status !== "ARCHIVED" && (
                  <Button
                    onClick={() => handleArchive(item.id, item.displayName)}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-[#2A3445] text-rose-400 hover:text-rose-300"
                  >
                    Archive
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AmenityCatalogFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        categories={categories}
        initialData={editingItem}
      />
    </div>
  );
}
