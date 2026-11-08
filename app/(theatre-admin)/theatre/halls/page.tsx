"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useTheatreStore, ManagedHall } from "@/store/theatre-store";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HallModal } from "@/components/theatre/hall-modal";
import { HallTableView } from "@/components/theatre/hall-table-view";
import { getCategoryDesignTokens } from "@/lib/constants/seating-design-system";
import {
  Layers,
  Sparkles,
  Tv,
  Volume2,
  CheckCircle2,
  Eye,
  SlidersHorizontal,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Copy,
  Edit2,
  Archive,
  Power,
  RotateCcw,
  Armchair,
} from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function TheatreHallsPage() {
  const {
    profile,
    halls,
    addHall,
    updateHall,
    duplicateHall,
    activateHall,
    deactivateHall,
    archiveHall,
    deleteHall,
  } = useTheatreStore();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<ManagedHall | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [capacityFilter, setCapacityFilter] = useState<"ALL" | "SMALL" | "MEDIUM" | "LARGE">("ALL");
  const [screenTypeFilter, setScreenTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter Logic
  const filteredHalls = useMemo(() => {
    return halls.filter((hall) => {
      // 1. Search Query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = hall.name.toLowerCase().includes(query);
        const matchesCode = hall.hallCode?.toLowerCase().includes(query);
        const matchesProjection = hall.projectionType.toLowerCase().includes(query);
        const matchesSound = hall.soundSystem.toLowerCase().includes(query);
        const matchesStatus = hall.status.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesProjection && !matchesSound && !matchesStatus) {
          return false;
        }
      }

      // 2. Capacity Filter
      if (capacityFilter === "SMALL" && hall.capacity >= 100) return false;
      if (capacityFilter === "MEDIUM" && (hall.capacity < 100 || hall.capacity > 200)) return false;
      if (capacityFilter === "LARGE" && hall.capacity <= 200) return false;

      // 3. Screen Type Filter
      if (screenTypeFilter !== "ALL" && hall.screenType !== screenTypeFilter) return false;

      // 4. Status Filter
      if (statusFilter !== "ALL" && hall.status !== statusFilter) return false;

      return true;
    });
  }, [halls, searchTerm, capacityFilter, screenTypeFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredHalls.length / itemsPerPage) || 1;
  const paginatedHalls = filteredHalls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // KPIs
  const totalHalls = halls.length;
  const activeHalls = halls.filter((h) => h.status === "Active" || h.status === "Show Running").length;
  const maintenanceHalls = halls.filter((h) => h.status === "Maintenance" || h.status === "Cleaning").length;
  const totalSeats = halls.reduce((acc, h) => acc + h.capacity, 0);

  // Modal Handlers
  const handleOpenCreate = () => {
    setEditingHall(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (hall: ManagedHall) => {
    setEditingHall(hall);
    setIsModalOpen(true);
  };

  const handleSaveHall = (formData: Omit<ManagedHall, "id" | "occupancyPercent">) => {
    if (editingHall) {
      updateHall(editingHall.id, formData);
    } else {
      addHall(formData);
    }
  };

  const handleToggleStatus = (id: string) => {
    const target = halls.find((h) => h.id === id);
    if (!target) return;
    if (target.status === "Active" || target.status === "Show Running") {
      deactivateHall(id);
    } else {
      activateHall(id);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setCapacityFilter("ALL");
    setScreenTypeFilter("ALL");
    setStatusFilter("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Auditoriums & Hall Fleet Management"
        subtitle={`${profile.name} • ${totalHalls} Commercial Screens`}
        description="Configure dynamic seating tiers, hardware calibration, live 2D floor plans, and capacity balance across all complex auditoriums."
        badge={`${activeHalls} Active Screens`}
        badgeVariant="success"
        actions={
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="gap-2 font-bold bg-[#FBBF24] hover:bg-[#F59E0B] text-black shadow-lg shadow-[#FBBF24]/10"
            >
              <Plus className="h-4 w-4" /> Create Auditorium
            </Button>
          </div>
        }
      />

      {/* Capacity & Screen Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="elevated" className="p-4 space-y-1 bg-[#111827] border-[#1E293B]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Total Screens</span>
          <div className="text-2xl font-black font-mono text-white">{totalHalls} Screens</div>
          <span className="text-[10px] text-[#64748B]">Multi-Tier Seating Fleet</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1 bg-[#111827] border-[#1E293B]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Active Halls</span>
          <div className="text-2xl font-black font-mono text-emerald-400">{activeHalls} Active</div>
          <span className="text-[10px] text-emerald-400">Zero unhandled outages</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1 bg-[#111827] border-[#1E293B]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Maintenance & Draft</span>
          <div className="text-2xl font-black font-mono text-amber-400">
            {halls.filter((h) => h.status === "Maintenance" || h.status === "Draft").length} Halls
          </div>
          <span className="text-[10px] text-[#64748B]">Routine laser/sound audit</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1 bg-[#111827] border-[#1E293B]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Total Complex Capacity</span>
          <div className="text-2xl font-black font-mono text-[#FBBF24]">{totalSeats} Seats</div>
          <span className="text-[10px] text-[#94A3B8]">100% capacity balance verified</span>
        </Card>
      </div>

      {/* Search, Filter & View Controls Bar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <Input
              type="text"
              placeholder="Search by name, code, projection, sound, status..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-9 text-xs bg-[#0B0F19] border-[#2A3445] text-white focus:border-amber-400"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center p-1 rounded-xl bg-[#0B0F19] border border-[#2A3445]">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                  viewMode === "grid"
                    ? "bg-[#1E293B] text-amber-400 font-bold"
                    : "text-[#94A3B8] hover:text-white"
                }`}
                title="Grid Cards View"
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden md:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                  viewMode === "table"
                    ? "bg-[#1E293B] text-amber-400 font-bold"
                    : "text-[#94A3B8] hover:text-white"
                }`}
                title="Enterprise Table View"
              >
                <List className="h-4 w-4" />
                <span className="hidden md:inline">Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#1E293B] text-xs">
          <div className="flex items-center gap-1.5 text-[#94A3B8]">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-semibold">Filters:</span>
          </div>

          {/* Capacity Filter */}
          <select
            value={capacityFilter}
            onChange={(e) => {
              setCapacityFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="h-8 px-2.5 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Capacities</option>
            <option value="SMALL">&lt; 100 Seats</option>
            <option value="MEDIUM">100 – 200 Seats</option>
            <option value="LARGE">&gt; 200 Seats</option>
          </select>

          {/* Screen Type Filter */}
          <select
            value={screenTypeFilter}
            onChange={(e) => {
              setScreenTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8 px-2.5 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Screen Types</option>
            <option value="IMAX Laser">IMAX Laser</option>
            <option value="Dolby Cinema">Dolby Cinema</option>
            <option value="4DX Dynamic">4DX Dynamic</option>
            <option value="Prime Club">Prime Club</option>
            <option value="Royal Suite">Royal Suite</option>
            <option value="Laser 4K">Laser 4K</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8 px-2.5 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Show Running">Show Running</option>
            <option value="Draft">Draft</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Archived">Archived</option>
          </select>

          {(searchTerm || capacityFilter !== "ALL" || screenTypeFilter !== "ALL" || statusFilter !== "ALL") && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleResetFilters}
              className="gap-1 text-[#94A3B8] hover:text-white"
            >
              <RotateCcw className="h-3 w-3" /> Clear Filters
            </Button>
          )}

          <div className="ml-auto text-xs text-[#64748B] font-mono">
            Showing {filteredHalls.length} of {halls.length} screens
          </div>
        </div>
      </div>

      {/* Main Content: Grid or Table */}
      {viewMode === "table" ? (
        <HallTableView
          halls={paginatedHalls}
          onEdit={handleOpenEdit}
          onDuplicate={(id) => duplicateHall(id)}
          onToggleStatus={handleToggleStatus}
          onArchive={(id) => archiveHall(id)}
          onDelete={(id) => deleteHall(id)}
        />
      ) : (
        <div className="space-y-6">
          {paginatedHalls.length === 0 ? (
            <div className="p-12 text-center bg-[#0F172A] rounded-2xl border border-dashed border-[#2A3445] space-y-3">
              <Armchair className="h-10 w-10 text-[#64748B] mx-auto" />
              <p className="text-sm font-semibold text-white">No Auditoriums Found</p>
              <p className="text-xs text-[#94A3B8]">
                Adjust your search queries or filter settings to locate auditoriums in this complex.
              </p>
              <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2">
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedHalls.map((hall) => {
                const sections = hall.sections || [];
                const isOnline = hall.status === "Active" || hall.status === "Show Running";

                return (
                  <Card
                    key={hall.id}
                    variant="elevated"
                    className="overflow-hidden bg-[#111827] border-[#1E293B] hover:border-[#2A3445] transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Card Header & Media */}
                      <div className="relative h-44 w-full bg-[#0B0F19] overflow-hidden">
                        <img
                          src={hall.image}
                          alt={hall.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-black/40" />

                        {/* Top Screen Number & Code Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <Badge variant="solid" size="sm" className="font-bold bg-black/80 backdrop-blur-md">
                            Screen 0{hall.hallNumber}
                          </Badge>
                          <Badge variant="outline" size="sm" className="font-mono text-[#FBBF24] border-[#FBBF24]/40 bg-black/60 backdrop-blur-md">
                            {hall.hallCode}
                          </Badge>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <Badge
                            variant={isOnline ? "success" : hall.status === "Maintenance" ? "warning" : "secondary"}
                            size="sm"
                            dot
                          >
                            {hall.status}
                          </Badge>
                        </div>

                        {/* Bottom Screen Label */}
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-[#FBBF24] tracking-wider font-bold">
                              {hall.screenType}
                            </span>
                            <h3 className="text-base font-bold text-white leading-tight">{hall.name}</h3>
                          </div>
                        </div>
                      </div>

                      {/* Hardware & Capacity Specs */}
                      <div className="p-5 space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-3 text-xs bg-[#0B0F19] p-3 rounded-xl border border-[#1E293B]">
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase font-bold">Capacity</span>
                            <p className="font-mono font-bold text-white text-sm mt-0.5">{hall.capacity} Seats</p>
                          </div>
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase font-bold">Occupancy Fill</span>
                            <p className="font-mono font-bold text-emerald-400 text-sm mt-0.5">{hall.occupancyPercent}%</p>
                          </div>
                        </div>

                        {/* Projection & Sound Systems */}
                        <div className="space-y-1.5 text-xs text-[#94A3B8]">
                          <div className="flex items-center gap-2">
                            <Tv className="h-3.5 w-3.5 text-[#38BDF8] shrink-0" />
                            <span className="truncate">{hall.projectionType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-3.5 w-3.5 text-[#FBBF24] shrink-0" />
                            <span className="truncate">{hall.soundSystem}</span>
                          </div>
                        </div>

                        {/* Dynamic Sections Breakdown */}
                        <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                            <span>Seating Tiers ({sections.length})</span>
                            <span className="font-mono text-emerald-400">100% Balanced</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {sections.map((sec) => {
                              const tokens = getCategoryDesignTokens(sec.category);
                              return (
                                <span
                                  key={sec.id}
                                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                                  style={{
                                    backgroundColor: `${tokens.color}20`,
                                    color: tokens.color,
                                  }}
                                >
                                  {sec.name.split("-")[0].trim()} ({sec.seatCount})
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-4 bg-[#0F172A] border-t border-[#1E293B] flex items-center justify-between gap-2">
                      <Link href={`/theatre/halls/${hall.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="xs"
                          className="w-full gap-1.5 border-[#2A3445] text-xs text-white hover:bg-[#1E293B]"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Details
                        </Button>
                      </Link>

                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => handleOpenEdit(hall)}
                        className="h-8 w-8 p-0 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                        title="Edit Auditorium"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => duplicateHall(hall.id)}
                        className="h-8 w-8 p-0 text-[#38BDF8] hover:text-sky-300 hover:bg-sky-400/10"
                        title="Duplicate Auditorium"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => handleToggleStatus(hall.id)}
                        className={`h-8 w-8 p-0 ${
                          isOnline
                            ? "text-emerald-400 hover:text-rose-400 hover:bg-rose-500/10"
                            : "text-[#64748B] hover:text-emerald-400 hover:bg-emerald-400/10"
                        }`}
                        title={isOnline ? "Deactivate Hall" : "Activate Hall"}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[#1E293B] text-xs text-[#94A3B8]">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="xs"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="border-[#2A3445]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="xs"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="border-[#2A3445]"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Auditorium Modal */}
      <HallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveHall}
        initialHall={editingHall}
        existingHalls={halls}
      />
    </div>
  );
}
