"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { usePlatformStore, type ManagedAmenity } from "@/store/platform-store";
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Building2,
  Tag,
  Volume2,
  Film,
  Activity,
  Armchair,
  Accessibility,
  Coffee,
  Zap,
  Smile,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminAmenitiesPage() {
  const { amenities, addAmenity, toggleAmenityActive } = usePlatformStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ManagedAmenity["category"]>("Projection & Sound");
  const [description, setDescription] = useState("");

  const filteredAmenities = amenities.filter((a) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!a.name.toLowerCase().includes(q) && !a.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filterCategory !== "all" && a.category !== filterCategory) {
      return false;
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addAmenity({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category,
      iconName: "Sparkles",
      description,
      isActive: true,
    });

    setName("");
    setDescription("");
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Master Luxury Amenities Catalog"
        subtitle="Global Master Library of Hardware, Seating, Acoustic & Hospitality Specs for Theatre Enablement"
        badge={`${amenities.length} Master Amenities`}
        badgeVariant="primary"
        actions={
          <Button
            onClick={() => setAddModalOpen(true)}
            variant="primary"
            size="sm"
            className="gap-2 text-xs font-bold"
          >
            <Plus className="h-4 w-4" /> Add Master Amenity
          </Button>
        }
      />

      {/* Category Pills & Search */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {[
            "all",
            "Projection & Sound",
            "Seating & Comfort",
            "Hospitality & F&B",
            "Convenience",
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium ${
                filterCategory === cat ? "bg-[#FBBF24] text-[#070B12] font-bold" : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search amenities or features..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
          />
        </div>
      </div>

      {/* Master Amenities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAmenities.map((am) => (
          <div
            key={am.id}
            className="p-5 rounded-3xl bg-[#161F2E] border border-[#2A3445] flex flex-col justify-between hover:border-[#64748B] transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <Badge variant={am.isActive ? "success" : "danger"} size="sm">
                  {am.isActive ? "Enabled" : "Disabled"}
                </Badge>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm">{am.name}</h3>
                <div className="text-[10px] text-[#FBBF24] font-semibold uppercase mt-0.5">{am.category}</div>
                <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">{am.description}</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#2A3445]/60 flex items-center justify-between text-xs">
              <span className="text-[#64748B] font-mono text-[11px]">
                {am.theatresEquipped} Theatres Connected
              </span>
              <Button
                onClick={() => toggleAmenityActive(am.id)}
                variant="outline"
                size="sm"
                className="h-7 text-xs border-[#2A3445]"
              >
                {am.isActive ? "Disable" : "Enable"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Master Amenity Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md rounded-3xl bg-[#0B1220] border border-[#2A3445] p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#FBBF24]" /> Add Master Amenity
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="text-[#94A3B8] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Amenity Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ScreenX 270-Degree Panorama, Valet Parking"
                  className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none"
                >
                  <option value="Projection & Sound">Projection & Sound</option>
                  <option value="Seating & Comfort">Seating & Comfort</option>
                  <option value="Hospitality & F&B">Hospitality & F&B</option>
                  <option value="Convenience">Convenience</option>
                </select>
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the luxury feature..."
                  className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2A3445]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddModalOpen(false)}
                className="border-[#2A3445] text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="text-xs font-bold">
                Save Amenity
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
