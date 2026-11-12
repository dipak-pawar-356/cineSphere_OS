"use client";

import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  archiveTheatreProfileAction,
  createTheatreProfileAction,
  getTheatreProfileDetailAction,
  hideTheatreProfileAction,
  publishTheatreProfileAction,
  retrieveTheatreProfilesAction,
  rollbackTheatreProfileVersionAction,
  updateTheatreLanguagesAction,
  updateTheatreProfileAction,
  updateTheatreSocialLinksAction,
} from "@/actions/theatre-profile-actions";
import {
  SOCIAL_PLATFORM_LABELS,
  SUPPORTED_PROFILE_LANGUAGES,
  THEATRE_CATEGORY_LABELS,
} from "@/lib/validation/theatre-profile.validation";
import {
  CreateTheatreProfileInput,
  PaginatedTheatreProfileResult,
  TheatreCategoryType,
  TheatreLanguageInput,
  TheatreOwnershipModel,
  TheatreProfileBundle,
  TheatreProfileStatus,
  TheatreSocialLinkInput,
  UpdateTheatreProfileInput,
} from "@/types/theatre-profile.types";
import {
  ProfileCompletionMeter,
  ProfileStatusBadge,
  TheatreCategoryBadge,
} from "./profile-status-badge";
import { TheatreLanguagesSocialPanel } from "./theatre-languages-social-panel";
import {
  Archive,
  Building2,
  CheckCircle2,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  History,
  Languages,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

const LazyProfileFormModal = dynamic(
  () => import("./theatre-profile-form-modal").then((m) => m.TheatreProfileFormModal),
  { ssr: false }
);
const LazyProfileVersionModal = dynamic(
  () => import("./theatre-profile-version-modal").then((m) => m.TheatreProfileVersionModal),
  { ssr: false }
);

interface TheatreProfileWorkspaceProps {
  theatreId: string;
  actorRole: "SUPER_ADMIN" | "THEATRE_ADMIN";
  actorUserId: string;
  actorName: string;
  enableFleetExplorer?: boolean;
  defaultView?: "overview" | "social" | "explorer" | "audits";
}

export function TheatreProfileWorkspace({
  theatreId,
  actorRole,
  actorUserId,
  actorName,
  enableFleetExplorer = false,
  defaultView = "overview",
}: TheatreProfileWorkspaceProps) {
  const [selectedTheatreId, setSelectedTheatreId] = useState(theatreId);
  const [bundle, setBundle] = useState<TheatreProfileBundle | null>(null);
  const [explorer, setExplorer] = useState<PaginatedTheatreProfileResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"overview" | "social" | "explorer" | "audits">(
    defaultView
  );
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  // Fleet search & filter state
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<TheatreCategoryType | "ALL">("ALL");
  const [filterOwnership, setFilterOwnership] = useState<TheatreOwnershipModel | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<TheatreProfileStatus | "ALL">("ALL");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [filterYearFrom, setFilterYearFrom] = useState("");
  const [page, setPage] = useState(1);

  // Lazy Modals
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("edit");
  const [versionOpen, setVersionOpen] = useState(false);
  const [versionTab, setVersionTab] = useState<"versions" | "completion">("versions");

  const actorContext = React.useMemo(
    () => ({
      userId: actorUserId,
      name: actorName,
      role: actorRole,
      theatreId: actorRole === "THEATRE_ADMIN" ? theatreId : selectedTheatreId,
    }),
    [actorName, actorRole, actorUserId, selectedTheatreId, theatreId]
  );

  const showNotice = (text: string, ok = true) => {
    setNotice({ ok, text });
    setTimeout(() => setNotice(null), 5000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const targetId = actorRole === "THEATRE_ADMIN" ? theatreId : selectedTheatreId;
      const [detailRes, listRes] = await Promise.all([
        targetId
          ? getTheatreProfileDetailAction({ theatreId: targetId }, actorContext)
          : Promise.resolve(null),
        retrieveTheatreProfilesAction(
          {
            query: query.trim() || undefined,
            theatreType: filterType,
            ownershipModel: filterOwnership,
            status: filterStatus,
            languageCode: filterLanguage.trim() || undefined,
            establishedYearFrom: filterYearFrom ? Number(filterYearFrom) : undefined,
            page,
            pageSize: 6,
          },
          actorContext
        ),
      ]);

      if (detailRes && detailRes.success && detailRes.data) {
        setBundle(detailRes.data);
      } else {
        setBundle(null);
      }

      if (listRes.success && listRes.data) {
        setExplorer(listRes.data);
      }
    } finally {
      setLoading(false);
    }
  }, [
    actorContext,
    actorRole,
    filterLanguage,
    filterOwnership,
    filterStatus,
    filterType,
    filterYearFrom,
    page,
    query,
    selectedTheatreId,
    theatreId,
  ]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreateProfile = async (input: CreateTheatreProfileInput) => {
    const res = await createTheatreProfileAction(input, actorContext);
    if (res.success && res.data) {
      showNotice(`Initialized profile '${res.data.displayName}' cleanly.`);
      await loadData();
      return { success: true };
    }
    return { success: false, error: res.error?.message };
  };

  const handleUpdateProfile = async (input: UpdateTheatreProfileInput) => {
    const res = await updateTheatreProfileAction(input, actorContext);
    if (res.success && res.data) {
      showNotice(`Updated profile to v${res.data.version} cleanly.`);
      await loadData();
      return { success: true };
    }
    return { success: false, error: res.error?.message };
  };

  const handleStatusChange = async (action: "publish" | "hide" | "archive") => {
    if (!bundle?.profile) return;
    const targetId = bundle.profile.theatreId;
    const res =
      action === "publish"
        ? await publishTheatreProfileAction({ theatreId: targetId }, actorContext)
        : action === "hide"
        ? await hideTheatreProfileAction({ theatreId: targetId }, actorContext)
        : await archiveTheatreProfileAction({ theatreId: targetId }, actorContext);

    if (res.success && res.data) {
      showNotice(`Profile status updated to ${res.data.status}.`);
      await loadData();
    } else {
      showNotice(res.error?.message || "Unable to update profile status.", false);
    }
  };

  const handleSaveLanguages = async (languages: TheatreLanguageInput[]) => {
    if (!bundle?.profile) return { success: false, error: "Profile not loaded" };
    const res = await updateTheatreLanguagesAction(
      { theatreId: bundle.profile.theatreId, languages },
      actorContext
    );
    if (res.success) {
      await loadData();
      return { success: true };
    }
    return { success: false, error: res.error?.message };
  };

  const handleSaveSocialLinks = async (socialLinks: TheatreSocialLinkInput[]) => {
    if (!bundle?.profile) return { success: false, error: "Profile not loaded" };
    const res = await updateTheatreSocialLinksAction(
      { theatreId: bundle.profile.theatreId, socialLinks },
      actorContext
    );
    if (res.success) {
      await loadData();
      return { success: true };
    }
    return { success: false, error: res.error?.message };
  };

  const handleRollbackVersion = async (versionNumber: number) => {
    if (!bundle?.profile) return { success: false, error: "Profile not loaded" };
    const res = await rollbackTheatreProfileVersionAction(
      {
        theatreId: bundle.profile.theatreId,
        versionNumber,
      },
      actorContext
    );
    if (res.success) {
      await loadData();
      return { success: true };
    }
    return { success: false, error: res.error?.message };
  };

  const profile = bundle?.profile || null;
  const isReadOnly = profile?.status === "ARCHIVED";

  return (
    <div className="space-y-6">
      {notice && (
        <div
          role="status"
          className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center gap-2 ${
            notice.ok
              ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/70 border-rose-500/40 text-rose-200"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{notice.text}</span>
        </div>
      )}

      {/* Top Navigation & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3445] pb-3">
        <div
          role="tablist"
          aria-label="Theatre profile workspace sections"
          className="flex flex-wrap gap-1.5"
        >
          {(
            [
              { id: "overview", label: "Public & Business Profile", icon: Building2 },
              { id: "social", label: "Languages & Social Links", icon: Languages },
              ...(enableFleetExplorer
                ? [{ id: "explorer", label: "Fleet Profile Search", icon: Search } as const]
                : []),
              {
                id: "audits",
                label: `Profile Audits (${bundle?.recentAudits.length || 0})`,
                icon: Layers,
              },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={viewMode === t.id}
                onClick={() => setViewMode(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === t.id
                    ? "bg-[#FBBF24] text-[#070B12] font-bold shadow"
                    : "bg-[#111827] text-[#94A3B8] border border-[#2A3445] hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => void loadData()}
            className="border-[#2A3445] gap-1.5"
          >
            <RefreshCw className="h-3 w-3" /> Sync
          </Button>
          {profile ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => {
                  setVersionTab("versions");
                  setVersionOpen(true);
                }}
                className="border-[#2A3445] gap-1.5"
              >
                <History className="h-3.5 w-3.5 text-[#FBBF24]" /> v{profile.version} History
              </Button>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="primary"
                  size="xs"
                  onClick={() => {
                    setFormMode("edit");
                    setFormOpen(true);
                  }}
                  className="gap-1.5 font-bold"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              )}
            </>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="xs"
              onClick={() => {
                setFormMode("create");
                setFormOpen(true);
              }}
              className="gap-1.5 font-bold"
            >
              <Plus className="h-3.5 w-3.5" /> Create Profile
            </Button>
          )}
        </div>
      </div>

      {loading && !profile && viewMode !== "explorer" ? (
        <div className="py-12 text-center text-xs text-[#94A3B8]">
          Loading decoupled theatre profile workspace...
        </div>
      ) : (
        <>
          {/* VIEW 1: Overview, Branding Integration, Completion Score & Business Info */}
          {viewMode === "overview" && profile && (
            <div className="space-y-6">
              {/* Branding Banner + Logo Integration from Branding Module */}
              <div className="relative rounded-3xl overflow-hidden border border-[#2A3445] bg-[#111827] min-h-[210px]">
                {bundle?.brandingPreview.banner && (
                  <Image
                    src={bundle.brandingPreview.banner.url}
                    alt={bundle.brandingPreview.banner.metadata.altText || profile.displayName}
                    fill
                    unoptimized
                    loading="lazy"
                    className="object-cover opacity-45"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#070B12]/95 via-[#070B12]/75 to-transparent" />
                <div className="relative z-10 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 rounded-2xl bg-[#0B1220] border border-[#2A3445] overflow-hidden shrink-0 flex items-center justify-center">
                      {bundle?.brandingPreview.logo ? (
                        <Image
                          src={bundle.brandingPreview.logo.url}
                          alt={bundle.brandingPreview.logo.metadata.altText || profile.theatreName}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <Building2 className="h-7 w-7 text-[#FBBF24]" />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black text-white">{profile.displayName}</h3>
                        <ProfileStatusBadge status={profile.status} />
                        <TheatreCategoryBadge
                          theatreType={profile.theatreType}
                          customLabel={profile.customTheatreType}
                        />
                      </div>
                      <p className="text-xs text-[#FBBF24] font-medium">
                        {profile.tagline || profile.shortDescription}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#94A3B8]">
                        <span>Legal: {profile.legalName}</span>
                        <span>•</span>
                        <span>Public Slug: /{profile.publicSlug}</span>
                        {profile.establishedYear && (
                          <>
                            <span>•</span>
                            <span>Est. {profile.establishedYear}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Completion Meter & Status Actions */}
                  <div className="space-y-3 min-w-[230px]">
                    <button
                      type="button"
                      onClick={() => {
                        setVersionTab("completion");
                        setVersionOpen(true);
                      }}
                      className="w-full text-left p-3 rounded-2xl bg-[#070B12]/80 border border-[#2A3445] hover:border-[#FBBF24]/50 transition-colors"
                    >
                      <ProfileCompletionMeter score={profile.completionScore} />
                    </button>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {profile.status !== "PUBLISHED" && (
                        <Button
                          type="button"
                          variant="primary"
                          size="xs"
                          onClick={() => void handleStatusChange("publish")}
                          className="gap-1 font-bold"
                        >
                          <Eye className="h-3 w-3" /> Publish
                        </Button>
                      )}
                      {profile.status === "PUBLISHED" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => void handleStatusChange("hide")}
                          className="border-[#2A3445] gap-1"
                        >
                          <EyeOff className="h-3 w-3" /> Hide
                        </Button>
                      )}
                      {actorRole === "SUPER_ADMIN" && profile.status !== "ARCHIVED" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => void handleStatusChange("archive")}
                          className="border-rose-500/40 text-rose-300 gap-1"
                        >
                          <Archive className="h-3 w-3" /> Archive
                        </Button>
                      )}
                      <Link href={`/theatre/${profile.internalTheatreSlug}`} target="_blank">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          className="border-[#2A3445] gap-1"
                        >
                          <ExternalLink className="h-3 w-3" /> Public Page
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Information + Description Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card variant="elevated" className="lg:col-span-2 p-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#FBBF24] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> About Theatre & Public Copy
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[#64748B]">Short Discovery Summary</span>
                      <p className="text-white font-medium mt-0.5">
                        {profile.shortDescription || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#64748B]">About Theatre Narrative</span>
                      <p className="text-[#CBD5E1] mt-0.5 leading-relaxed">
                        {profile.aboutTheatre || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#64748B]">Full Profile Description</span>
                      <p className="text-[#94A3B8] mt-0.5 leading-relaxed">
                        {profile.fullDescription || "—"}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card variant="elevated" className="p-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#38BDF8] flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> Business & Capacity Metrics
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#2A3445]">
                      <span className="text-[#94A3B8]">Ownership Model</span>
                      <span className="font-bold text-white">{profile.ownershipModel}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#2A3445]">
                      <span className="text-[#94A3B8]">Screens Count</span>
                      <span className="font-mono font-bold text-white">
                        {profile.screensCount} Screens
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#2A3445]">
                      <span className="text-[#94A3B8]">Total Capacity</span>
                      <span className="font-mono font-bold text-white">
                        {profile.totalSeatingCapacity} Seats
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#2A3445]">
                      <span className="text-[#94A3B8]">Avg. Capacity / Screen</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {profile.averageCapacityPerScreen} Seats
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#2A3445]">
                      <span className="text-[#94A3B8]">Primary Language</span>
                      <span className="font-mono font-bold text-[#FBBF24]">
                        {profile.languages.find((l) => l.isPrimary)?.displayName ||
                          profile.primaryLanguageCode}
                      </span>
                    </div>
                    <div className="pt-1">
                      <span className="text-[#94A3B8] block">Official Website</span>
                      <span className="font-mono text-[#38BDF8] break-all">
                        {profile.website || "Not configured"}
                      </span>
                    </div>
                    <div className="pt-1">
                      <span className="text-[#94A3B8] block">Active Social Channels</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {profile.socialLinks.map((s) => (
                          <span
                            key={s.id}
                            className="px-2 py-0.5 rounded bg-[#111827] border border-[#2A3445] text-[10px] text-white"
                          >
                            {s.platform === "CUSTOM"
                              ? s.customPlatformName
                              : SOCIAL_PLATFORM_LABELS[s.platform]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* VIEW 2: Languages & Social Links Manager */}
          {viewMode === "social" && profile && (
            <TheatreLanguagesSocialPanel
              languages={profile.languages}
              socialLinks={profile.socialLinks}
              readOnly={isReadOnly}
              onSaveLanguages={handleSaveLanguages}
              onSaveSocialLinks={handleSaveSocialLinks}
            />
          )}

          {/* VIEW 3: Super Admin Fleet Profile Directory with Search & Multi-Filters */}
          {viewMode === "explorer" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3 text-xs">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
                    <input
                      aria-label="Search theatre profiles by name, legal name, type, language, or website"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search Theatre Name, Legal Name, Type, Language, or Website..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <select
                      aria-label="Filter by theatre type"
                      value={filterType}
                      onChange={(e) => {
                        setFilterType(e.target.value as TheatreCategoryType | "ALL");
                        setPage(1);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
                    >
                      <option value="ALL">All Types</option>
                      {Object.entries(THEATRE_CATEGORY_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Filter by ownership model"
                      value={filterOwnership}
                      onChange={(e) => {
                        setFilterOwnership(e.target.value as TheatreOwnershipModel | "ALL");
                        setPage(1);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
                    >
                      <option value="ALL">Chain & Independent</option>
                      <option value="CHAIN">Chain Circuit</option>
                      <option value="INDEPENDENT">Independent</option>
                    </select>

                    <select
                      aria-label="Filter by profile status"
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value as TheatreProfileStatus | "ALL");
                        setPage(1);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                      <option value="HIDDEN">Hidden</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>

                    <select
                      aria-label="Filter by supported language"
                      value={filterLanguage}
                      onChange={(e) => {
                        setFilterLanguage(e.target.value);
                        setPage(1);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
                    >
                      <option value="">All Languages</option>
                      {SUPPORTED_PROFILE_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.displayName}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      aria-label="Filter established year from"
                      value={filterYearFrom}
                      onChange={(e) => {
                        setFilterYearFrom(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Est. Year ≥"
                      className="w-28 px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(explorer?.items || []).map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-3 hover:border-[#FBBF24]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">
                          {item.displayName}
                        </h4>
                        <p className="text-[11px] text-[#94A3B8] truncate">{item.legalName}</p>
                      </div>
                      <ProfileStatusBadge status={item.status} size="xs" />
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <TheatreCategoryBadge
                        theatreType={item.theatreType}
                        customLabel={item.customTheatreType}
                      />
                      <span className="px-2 py-0.5 rounded-full bg-[#070B12] border border-[#2A3445] font-mono text-[#94A3B8]">
                        {item.ownershipModel}
                      </span>
                      {item.establishedYear && (
                        <span className="px-2 py-0.5 rounded-full bg-[#070B12] border border-[#2A3445] font-mono text-[#94A3B8]">
                          Est. {item.establishedYear}
                        </span>
                      )}
                    </div>

                    <ProfileCompletionMeter score={item.completionScore} compact />

                    <div className="flex items-center justify-between pt-2 border-t border-[#2A3445] text-[11px]">
                      <span className="font-mono text-[#94A3B8]">
                        {item.screensCount} Screens · {item.languages.length} Langs
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          setSelectedTheatreId(item.theatreId);
                          setViewMode("overview");
                        }}
                        className="border-[#2A3445] text-[#FBBF24]"
                      >
                        Inspect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] flex items-center justify-between text-xs text-[#94A3B8]">
                <span className="font-mono">
                  Matching Profiles: <strong className="text-white">{explorer?.total || 0}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={!explorer?.hasPrev}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <span className="font-mono text-white">
                    Page {explorer?.page || 1} / {explorer?.totalPages || 1}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={!explorer?.hasNext}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: Profile Audit Ledger */}
          {viewMode === "audits" && (
            <div className="space-y-3">
              {(bundle?.recentAudits || []).map((a) => (
                <div
                  key={a.id}
                  className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="font-mono text-[#FBBF24]">{a.eventType}</span>
                      <span>· {a.summary}</span>
                    </div>
                    <div className="text-[11px] text-[#94A3B8] mt-0.5">
                      Actor: {a.actorName || a.actorId} ({a.actorRole})
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[#64748B]">
                    {new Date(a.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Lazy Modals */}
      <LazyProfileFormModal
        isOpen={formOpen}
        mode={formMode}
        theatreId={actorRole === "THEATRE_ADMIN" ? theatreId : selectedTheatreId}
        initialProfile={profile}
        onClose={() => setFormOpen(false)}
        onCreate={handleCreateProfile}
        onUpdate={handleUpdateProfile}
      />

      <LazyProfileVersionModal
        isOpen={versionOpen}
        profile={profile}
        versions={bundle?.versions || []}
        initialTab={versionTab}
        onClose={() => setVersionOpen(false)}
        onRollbackVersion={isReadOnly ? undefined : handleRollbackVersion}
      />
    </div>
  );
}

