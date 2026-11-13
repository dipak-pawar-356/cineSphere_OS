"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  PaginatedTheatreLocationResult,
  SearchTheatreLocationFilters,
  TheatreLocationBundle,
  TheatreLocationRecord,
  TheatreLocationVersionRecord,
} from "@/types/theatre-location.types";
import {
  archiveTheatreLocationAction,
  getTheatreLocationDetailAction,
  publishTheatreLocationAction,
  retrieveTheatreLocationsAction,
  verifyTheatreLocationAction,
} from "@/actions/theatre-location-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LocationStatusBadge,
  LocationVerificationBadge,
} from "./location-status-badge";
import { TheatreCoordinatesPanel } from "./theatre-coordinates-panel";
import {
  MapPin,
  Building2,
  Compass,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  History,
  Edit,
  Plus,
  Search,
  Filter,
  Layers,
  ExternalLink,
  Navigation,
  Globe,
  Radio,
  RefreshCw,
  Archive,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const LazyTheatreLocationFormModal = dynamic(
  () =>
    import("./theatre-location-form-modal").then(
      (m) => m.TheatreLocationFormModal
    ),
  { ssr: false }
);

const LazyTheatreLocationVersionModal = dynamic(
  () =>
    import("./theatre-location-version-modal").then(
      (m) => m.TheatreLocationVersionModal
    ),
  { ssr: false }
);

export interface TheatreLocationWorkspaceProps {
  theatreId: string;
  actorRole: "SUPER_ADMIN" | "THEATRE_ADMIN";
  actorUserId: string;
  actorName?: string;
  enableFleetExplorer?: boolean;
  defaultView?: "overview" | "explorer";
}

export function TheatreLocationWorkspace({
  theatreId,
  actorRole,
  actorUserId,
  actorName,
  enableFleetExplorer = false,
  defaultView = "overview",
}: TheatreLocationWorkspaceProps) {
  const [activeView, setActiveView] = useState<"overview" | "explorer">(defaultView);

  // Single Theatre Bundle State
  const [activeBundle, setActiveBundle] = useState<TheatreLocationBundle | null>(null);
  const [isLoadingBundle, setIsLoadingBundle] = useState(true);

  // Fleet Explorer State
  const [fleetLocations, setFleetLocations] = useState<PaginatedTheatreLocationResult | null>(null);
  const [isLoadingFleet, setIsLoadingFleet] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedVerification, setSelectedVerification] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<"CREATE" | "EDIT">("EDIT");

  // Notifications
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load Primary Location Bundle for specified theatre
  const loadPrimaryLocation = useCallback(async () => {
    setIsLoadingBundle(true);
    try {
      const res = await retrieveTheatreLocationsAction(
        {
          theatreId,
          pageSize: 1,
        },
        {
          role: actorRole,
          userId: actorUserId,
          theatreId: actorRole === "THEATRE_ADMIN" ? theatreId : undefined,
        }
      );
      if (res.success && res.data && res.data.items.length > 0) {
        setActiveBundle(res.data.items[0]);
      } else {
        setActiveBundle(null);
      }
    } catch (err: unknown) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to load location details.",
      });
    } finally {
      setIsLoadingBundle(false);
    }
  }, [theatreId, actorRole, actorUserId]);

  // Load Fleet Locations for Explorer
  const loadFleetLocations = useCallback(async () => {
    setIsLoadingFleet(true);
    try {
      const filters: SearchTheatreLocationFilters = {
        query: searchQuery || undefined,
        city: selectedCity !== "ALL" ? selectedCity : undefined,
        status: selectedStatus !== "ALL" ? (selectedStatus as any) : undefined,
        verificationStatus:
          selectedVerification !== "ALL" ? (selectedVerification as any) : undefined,
        page: currentPage,
        pageSize: 8,
      };

      const res = await retrieveTheatreLocationsAction(filters, {
        role: actorRole,
        userId: actorUserId,
        theatreId: actorRole === "THEATRE_ADMIN" ? theatreId : undefined,
      });

      if (res.success && res.data) {
        setFleetLocations(res.data);
      }
    } catch (err: unknown) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to load fleet locations.",
      });
    } finally {
      setIsLoadingFleet(false);
    }
  }, [
    searchQuery,
    selectedCity,
    selectedStatus,
    selectedVerification,
    currentPage,
    actorRole,
    actorUserId,
    theatreId,
  ]);

  useEffect(() => {
    void loadPrimaryLocation();
  }, [loadPrimaryLocation]);

  useEffect(() => {
    if (activeView === "explorer" || enableFleetExplorer) {
      void loadFleetLocations();
    }
  }, [activeView, enableFleetExplorer, loadFleetLocations]);

  // Actions
  const handleVerify = async (decision: "VERIFY" | "REJECT") => {
    if (!activeBundle?.location) return;
    try {
      const res = await verifyTheatreLocationAction(
        {
          locationId: activeBundle.location.id,
          theatreId: activeBundle.location.theatreId,
          decision,
          notes: `Verified by ${actorName || "Super Admin"}`,
        },
        {
          role: "SUPER_ADMIN",
          userId: actorUserId,
        }
      );
      if (res.success && res.data) {
        setNotice({
          type: "success",
          text: `Location successfully marked as ${res.data.verificationStatus}.`,
        });
        await loadPrimaryLocation();
      } else {
        setNotice({
          type: "error",
          text: res.error?.message || "Failed to update verification status.",
        });
      }
    } catch (err: unknown) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Verification action failed.",
      });
    }
  };

  const handlePublish = async () => {
    if (!activeBundle?.location) return;
    try {
      const res = await publishTheatreLocationAction(
        {
          locationId: activeBundle.location.id,
          theatreId: activeBundle.location.theatreId,
          targetStatus: "PUBLISHED",
          reason: "Published to public storefront",
        },
        {
          role: actorRole,
          userId: actorUserId,
          theatreId: actorRole === "THEATRE_ADMIN" ? theatreId : undefined,
        }
      );
      if (res.success && res.data) {
        setNotice({
          type: "success",
          text: `Location '${res.data.locationName}' is now PUBLISHED and visible to patrons.`,
        });
        await loadPrimaryLocation();
      } else {
        setNotice({
          type: "error",
          text: res.error?.message || "Failed to publish location.",
        });
      }
    } catch (err: unknown) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Publish action failed.",
      });
    }
  };

  const handleArchive = async () => {
    if (!activeBundle?.location) return;
    const confirmed = window.confirm(
      "Are you sure you want to archive this physical location? Archived locations are frozen in read-only mode."
    );
    if (!confirmed) return;

    try {
      const res = await archiveTheatreLocationAction(
        {
          locationId: activeBundle.location.id,
          theatreId: activeBundle.location.theatreId,
          targetStatus: "ARCHIVED",
          reason: "Decommissioned or archived via management console",
        },
        {
          role: actorRole,
          userId: actorUserId,
          theatreId: actorRole === "THEATRE_ADMIN" ? theatreId : undefined,
        }
      );
      if (res.success && res.data) {
        setNotice({
          type: "success",
          text: `Location '${res.data.locationName}' is now ARCHIVED.`,
        });
        await loadPrimaryLocation();
      } else {
        setNotice({
          type: "error",
          text: res.error?.message || "Failed to archive location.",
        });
      }
    } catch (err: unknown) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Archive action failed.",
      });
    }
  };

  const loc = activeBundle?.location;
  const coords = activeBundle?.coordinates;
  const geo = activeBundle?.geoMetadata;

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {notice && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            notice.type === "error"
              ? "bg-rose-950/80 border-rose-500/40 text-rose-200"
              : "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === "error" ? (
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="p-1 hover:text-white" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* View Switcher for Super Admin */}
      {enableFleetExplorer && (
        <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <Button
              variant={activeView === "overview" ? "primary" : "outline"}
              size="xs"
              onClick={() => setActiveView("overview")}
              className="gap-1.5 font-bold text-xs"
            >
              <Building2 className="h-3.5 w-3.5" /> Selected Cinema Location
            </Button>
            <Button
              variant={activeView === "explorer" ? "primary" : "outline"}
              size="xs"
              onClick={() => setActiveView("explorer")}
              className="gap-1.5 font-bold text-xs"
            >
              <Layers className="h-3.5 w-3.5" /> Circuit Location Directory
            </Button>
          </div>

          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              setFormModalMode("CREATE");
              setIsFormModalOpen(true);
            }}
            className="gap-1.5 border-[#334155] text-xs font-semibold text-[#CBD5E1]"
          >
            <Plus className="h-3.5 w-3.5 text-[#FBBF24]" /> Add New Branch
          </Button>
        </div>
      )}

      {/* OVERVIEW VIEW */}
      {activeView === "overview" && (
        <div className="space-y-6">
          {isLoadingBundle ? (
            <div className="py-16 text-center text-xs text-[#94A3B8]">
              Loading theatre location & spatial coordinates profile...
            </div>
          ) : !loc ? (
            <Card variant="elevated" className="p-8 text-center space-y-4">
              <MapPin className="h-10 w-10 text-amber-400 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-white">No Physical Location Registered</h3>
                <p className="text-xs text-[#94A3B8] max-w-md mx-auto mt-1">
                  This cinema complex does not have an address or geographic profile. Add one to enable patron discovery and Google Maps routing.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setFormModalMode("CREATE");
                  setIsFormModalOpen(true);
                }}
                className="gap-2 font-bold text-xs"
              >
                <Plus className="h-4 w-4" /> Register Location Profile
              </Button>
            </Card>
          ) : (
            <>
              {/* Header Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Branch Identity Card */}
                <Card variant="elevated" className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                      Branch Identity
                    </span>
                    {loc.isPrimary && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-base text-white truncate">
                    {loc.locationName}
                  </div>
                  <p className="text-xs text-[#94A3B8] truncate">{loc.displayAddress}</p>
                </Card>

                {/* 2. Verification Card */}
                <Card variant="elevated" className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                      Verification
                    </span>
                    <LocationVerificationBadge status={loc.verificationStatus} size="xs" />
                  </div>
                  <div className="text-xs text-[#CBD5E1] truncate">
                    {loc.verifiedAt
                      ? `Verified on ${new Date(loc.verifiedAt).toLocaleDateString()}`
                      : "Pending Super Admin Review"}
                  </div>
                  {actorRole === "SUPER_ADMIN" && loc.verificationStatus !== "VERIFIED" && (
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => handleVerify("VERIFY")}
                        className="gap-1 text-[11px] font-bold h-7 px-2"
                      >
                        <ShieldCheck className="h-3 w-3" /> Verify
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleVerify("REJECT")}
                        className="text-[11px] border-rose-500/40 text-rose-400 h-7 px-2"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </Card>

                {/* 3. Publication Status Card */}
                <Card variant="elevated" className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                      Visibility
                    </span>
                    <LocationStatusBadge status={loc.status} size="xs" />
                  </div>
                  <div className="text-xs text-[#CBD5E1] truncate">
                    {loc.status === "PUBLISHED"
                      ? "Live on public theatre page"
                      : "Hidden from patrons"}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {loc.status !== "PUBLISHED" && loc.status !== "ARCHIVED" && (
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={handlePublish}
                        className="gap-1 text-[11px] font-bold h-7 px-2"
                      >
                        <Eye className="h-3 w-3" /> Publish
                      </Button>
                    )}
                    {loc.status !== "ARCHIVED" && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={handleArchive}
                        className="gap-1 text-[11px] border-slate-500/40 text-slate-300 h-7 px-2"
                      >
                        <Archive className="h-3 w-3" /> Archive
                      </Button>
                    )}
                  </div>
                </Card>

                {/* 4. Version Card */}
                <Card variant="elevated" className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                      Version Audit
                    </span>
                    <span className="font-mono text-xs font-bold text-[#FBBF24]">v{loc.version}</span>
                  </div>
                  <div className="text-xs text-[#CBD5E1]">
                    Updated {new Date(loc.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="pt-1">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setIsVersionModalOpen(true)}
                      className="gap-1 text-[11px] border-[#334155] text-[#CBD5E1] h-7 px-2"
                    >
                      <History className="h-3 w-3" /> Version History
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Physical Address Details Card */}
              <Card variant="elevated" className="p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Physical Address & Hierarchy</h3>
                      <p className="text-xs text-[#94A3B8]">
                        Structured address credentials for navigation, invoices, and patron discovery.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      setFormModalMode("EDIT");
                      setIsFormModalOpen(true);
                    }}
                    className="gap-1.5 border-[#334155] text-xs font-semibold"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit Address
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-3">
                    <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
                      <span className="text-[#94A3B8]">Address Line 1</span>
                      <span className="font-semibold text-white text-right max-w-xs">{loc.addressLine1}</span>
                    </div>
                    {loc.addressLine2 && (
                      <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
                        <span className="text-[#94A3B8]">Address Line 2</span>
                        <span className="font-semibold text-white text-right">{loc.addressLine2}</span>
                      </div>
                    )}
                    {loc.area && (
                      <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
                        <span className="text-[#94A3B8]">Area / Locality</span>
                        <span className="font-semibold text-white">{loc.area}</span>
                      </div>
                    )}
                    {loc.landmark && (
                      <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
                        <span className="text-[#94A3B8]">Landmark</span>
                        <span className="font-semibold text-[#FBBF24]">{loc.landmark}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
                      <span className="text-[#94A3B8]">City</span>
                      <span className="font-semibold text-white">{loc.city}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
                      <span className="text-[#94A3B8]">State</span>
                      <span className="font-semibold text-white">{loc.state}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
                      <span className="text-[#94A3B8]">Postal PIN Code</span>
                      <span className="font-mono font-bold text-white">{loc.postalCode}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
                      <span className="text-[#94A3B8]">Country</span>
                      <span className="font-semibold text-white">{loc.country}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#090D16] border border-[#1E293B] space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    Standard Formatted Address
                  </div>
                  <div className="text-xs text-[#E2E8F0] font-medium">
                    {loc.formattedAddress || loc.addressLine1}
                  </div>
                </div>
              </Card>

              {/* Coordinates Panel */}
              <TheatreCoordinatesPanel
                location={loc}
                coordinates={coords}
                onEditCoordinates={() => {
                  setFormModalMode("EDIT");
                  setIsFormModalOpen(true);
                }}
                readOnly={loc.status === "ARCHIVED"}
              />

              {/* Service Area & Geospatial Readiness Card */}
              {geo && (
                <Card variant="elevated" className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Radio className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Geospatial Catchment & Proximity Readiness</h3>
                      <p className="text-xs text-[#94A3B8]">
                        Configured parameters for future radius search, delivery radius, and spatial index matching.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-1">
                      <div className="text-[11px] text-[#94A3B8]">Catchment Service Radius</div>
                      <div className="text-sm font-mono font-bold text-white">
                        {geo.serviceRadiusKm} km
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-1">
                      <div className="text-[11px] text-[#94A3B8]">Regional Timezone</div>
                      <div className="text-sm font-mono font-semibold text-white">
                        {geo.timezone}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-1">
                      <div className="text-[11px] text-[#94A3B8]">Served Postal Zones</div>
                      <div className="text-xs font-mono text-[#FBBF24] truncate">
                        {geo.servedPostalCodes.length > 0
                          ? geo.servedPostalCodes.join(", ")
                          : "Primary PIN only"}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* EXPLORER VIEW (Multi-Cinema Circuit Discovery) */}
      {activeView === "explorer" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <Card variant="elevated" className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by city, area, PIN code, landmark, or cinema name..."
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#0F172A] border border-[#1E293B] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
                />
              </div>

              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter by location status"
                  className="w-full h-9 px-3 rounded-xl bg-[#0F172A] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#FBBF24]"
                >
                  <option value="ALL">All Publication Statuses</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedVerification}
                  onChange={(e) => {
                    setSelectedVerification(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter by verification state"
                  className="w-full h-9 px-3 rounded-xl bg-[#0F172A] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#FBBF24]"
                >
                  <option value="ALL">All Verification States</option>
                  <option value="VERIFIED">Verified Only</option>
                  <option value="UNVERIFIED">Unverified Only</option>
                  <option value="PENDING_REVIEW">Review Pending</option>
                  <option value="REJECTED">Rejected Only</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Location Cards Grid */}
          {isLoadingFleet ? (
            <div className="py-16 text-center text-xs text-[#94A3B8]">
              Loading circuit locations...
            </div>
          ) : !fleetLocations || fleetLocations.items.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#64748B]">
              No cinema locations matching the specified filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fleetLocations.items.map((bundle) => {
                const bLoc = bundle.location;
                const bCoords = bundle.coordinates;
                return (
                  <Card key={bLoc.id} variant="elevated" className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">
                            {bundle.theatreName}
                          </h4>
                          {bLoc.isPrimary && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-[#FBBF24] border border-amber-500/40">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#94A3B8] mt-0.5">
                          {bLoc.locationName} • {bLoc.city}, {bLoc.state}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <LocationStatusBadge status={bLoc.status} size="xs" />
                        <LocationVerificationBadge status={bLoc.verificationStatus} size="xs" />
                      </div>
                    </div>

                    <p className="text-xs text-[#CBD5E1] line-clamp-2">
                      {bLoc.formattedAddress || bLoc.addressLine1}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1E293B] text-xs">
                      <div className="font-mono text-[11px] text-[#94A3B8]">
                        PIN: {bLoc.postalCode} • v{bLoc.version}
                      </div>

                      <div className="flex items-center gap-2">
                        {bLoc.googleMapsUrl && (
                          <a
                            href={bLoc.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-white transition-colors"
                            title="Open Google Maps"
                            aria-label="Open Google Maps link"
                          >
                            <MapPin className="h-3.5 w-3.5 text-rose-400" />
                          </a>
                        )}

                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => {
                            setActiveBundle(bundle);
                            setActiveView("overview");
                          }}
                          className="text-xs font-semibold"
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {fleetLocations && fleetLocations.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-[#94A3B8]">
                Showing page {fleetLocations.page} of {fleetLocations.totalPages} ({fleetLocations.total} locations)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  disabled={!fleetLocations.hasPrev}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="gap-1 border-[#334155] text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  disabled={!fleetLocations.hasNext}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="gap-1 border-[#334155] text-xs"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lazy Modals */}
      {isFormModalOpen && (
        <LazyTheatreLocationFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          theatreId={theatreId}
          initialBundle={formModalMode === "EDIT" ? activeBundle : null}
          onSaved={(saved) => {
            setNotice({
              type: "success",
              text: `Location '${saved.locationName}' saved successfully.`,
            });
            void loadPrimaryLocation();
            if (enableFleetExplorer) {
              void loadFleetLocations();
            }
          }}
          actorRole={actorRole}
          actorUserId={actorUserId}
        />
      )}

      {isVersionModalOpen && loc && (
        <LazyTheatreLocationVersionModal
          isOpen={isVersionModalOpen}
          onClose={() => setIsVersionModalOpen(false)}
          location={loc}
          versions={[]}
          onRolledBack={(updated) => {
            setNotice({
              type: "success",
              text: `Rolled back to version v${updated.version}.`,
            });
            void loadPrimaryLocation();
          }}
          actorRole={actorRole}
          actorUserId={actorUserId}
        />
      )}
    </div>
  );
}
