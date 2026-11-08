"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { usePlatformStore, type ManagedCity } from "@/store/platform-store";
import {
  MapPin,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Building2,
  Trash2,
  Edit,
  Globe,
  Compass,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminCitiesPage() {
  const { cities, addCity, toggleCityActive, deleteCity } = usePlatformStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form State
  const [cityName, setCityName] = useState("");
  const [stateName, setStateName] = useState("Maharashtra");
  const [tier, setTier] = useState<"Tier 1" | "Tier 2" | "Tier 3">("Tier 1");
  const [latitude, setLatitude] = useState("18.5204");
  const [longitude, setLongitude] = useState("73.8567");

  const filteredCities = cities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName.trim()) return;

    addCity({
      name: cityName,
      slug: cityName.toLowerCase().replace(/\s+/g, "-"),
      state: stateName,
      country: "India",
      tier,
      isActive: true,
      latitude: parseFloat(latitude) || 18.5204,
      longitude: parseFloat(longitude) || 73.8567,
    });

    setCityName("");
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Metropolitan Jurisdictions & City Governance"
        subtitle="Configure Geographic Territories, Tier Classifications, Geo Coordinates & Theatre Density"
        badge={`${cities.length} Active Regions`}
        badgeVariant="primary"
        actions={
          <Button
            onClick={() => setAddModalOpen(true)}
            variant="primary"
            size="sm"
            className="gap-2 text-xs font-bold"
          >
            <Plus className="h-4 w-4" /> Add Metropolitan Region
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Total Metros</div>
          <div className="text-2xl font-black font-mono text-white">{cities.length} Cities</div>
          <div className="text-[11px] text-[#FBBF24]">India Master Grid</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Tier 1 Metros</div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {cities.filter((c) => c.tier === "Tier 1").length} Metros
          </div>
          <div className="text-[11px] text-emerald-300">Mumbai, Pune, Bengaluru...</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Tier 2 / Emerging</div>
          <div className="text-2xl font-black font-mono text-cyan-400">
            {cities.filter((c) => c.tier !== "Tier 1").length} Metros
          </div>
          <div className="text-[11px] text-cyan-300">Fast Growth Territories</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Multiplex Coverage</div>
          <div className="text-2xl font-black font-mono text-white">25 Complexes</div>
          <div className="text-[11px] text-emerald-400">100% Operational</div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city, state..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-5">Metropolitan City</th>
                <th className="py-3.5 px-5">State & Country</th>
                <th className="py-3.5 px-5">Classification</th>
                <th className="py-3.5 px-5">GPS Coordinates</th>
                <th className="py-3.5 px-5">Connected Complexes</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {filteredCities.map((c) => (
                <tr key={c.id} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-white flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#FBBF24]" />
                    <span>{c.name}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="text-white font-medium">{c.state}</div>
                    <div className="text-[10px] text-[#94A3B8]">{c.country}</div>
                  </td>
                  <td className="py-3.5 px-5">
                    <Badge variant={c.tier === "Tier 1" ? "warning" : "secondary"} size="sm">
                      {c.tier}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-[11px] text-[#94A3B8]">
                    {c.latitude.toFixed(4)}° N, {c.longitude.toFixed(4)}° E
                  </td>
                  <td className="py-3.5 px-5 font-mono text-white font-bold">
                    {c.theatreCount} Theatres
                  </td>
                  <td className="py-3.5 px-5">
                    <Badge variant={c.isActive ? "success" : "danger"} size="sm">
                      {c.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        onClick={() => toggleCityActive(c.id)}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs border-[#2A3445]"
                      >
                        {c.isActive ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        onClick={() => deleteCity(c.id)}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-[#64748B] hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add City Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateCity}
            className="w-full max-w-md rounded-3xl bg-[#0B1220] border border-[#2A3445] p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#FBBF24]" /> Add Metropolitan Jurisdiction
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
                <label className="block text-[#94A3B8] font-bold mb-1">City Name</label>
                <input
                  type="text"
                  required
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder="e.g. Chandigarh, Lucknow, Kochi"
                  className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">State / Union Territory</label>
                <input
                  type="text"
                  required
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="e.g. Punjab, Uttar Pradesh, Kerala"
                  className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Tier Classification</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none"
                >
                  <option value="Tier 1">Tier 1 Metro (Megacity)</option>
                  <option value="Tier 2">Tier 2 Commercial Center</option>
                  <option value="Tier 3">Tier 3 Emerging Market</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Latitude</label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Longitude</label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none font-mono"
                  />
                </div>
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
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="text-xs font-bold"
              >
                Save City
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
