"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { usePlatformStore } from "@/store/platform-store";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Film,
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  Users,
  Video,
  Star,
  Globe,
  Layers,
  Award,
  Play,
  ExternalLink,
  Edit,
  Building2,
} from "lucide-react";
import { MasterMovieFormModal } from "@/components/movies/master-movie-form-modal";

export default function SuperAdminMovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { movies, updateMasterMovie } = usePlatformStore();
  const [editModalOpen, setEditModalOpen] = useState(false);

  const movie = movies.find((m) => m.id === resolvedParams.id) || movies[0];

  if (!movie) {
    return (
      <div className="p-12 text-center text-[#94A3B8]">
        <Film className="h-10 w-10 mx-auto text-amber-400 mb-3 opacity-50" />
        <h3 className="text-base font-bold text-white">Film Asset Not Found</h3>
        <Link href="/dashboard/movies">
          <Button variant="outline" size="sm" className="mt-4 border-[#2A3445]">
            Back to Global Library
          </Button>
        </Link>
      </div>
    );
  }

  const durationFormatted = `${Math.floor(movie.durationMinutes / 60)}h ${movie.durationMinutes % 60}m`;

  return (
    <div className="space-y-8 pb-16">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard/movies">
          <Button variant="ghost" size="xs" className="gap-1.5 text-xs text-[#94A3B8]">
            <ArrowLeft className="h-3 w-3" /> Back to Master Film Library
          </Button>
        </Link>
      </div>

      {/* Hero Marquee Card */}
      <div className="relative rounded-3xl overflow-hidden border border-[#1E293B] bg-[#070B12] shadow-2xl">
        <div className="relative h-72 w-full">
          <img
            src={movie.bannerUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover opacity-35 blur-xs scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/50 to-transparent" />

          {/* Floating Hero Info */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div className="flex items-end gap-5">
              <div className="h-44 w-32 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-2xl bg-[#111827] shrink-0">
                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-2 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={movie.status === "Now Showing" ? "success" : "warning"} size="sm">
                    {movie.status}
                  </Badge>
                  <Badge variant="outline" size="sm" className="font-mono text-amber-400 border-amber-400/30">
                    {movie.certificate}
                  </Badge>
                  <div className="flex items-center gap-1 font-mono text-amber-400 font-bold text-xs bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                    <Star className="h-3 w-3 fill-amber-400" />
                    <span>{movie.rating}</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white">{movie.title}</h1>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8] font-mono">
                  <span className="flex items-center gap-1 text-white">
                    <Clock className="h-3.5 w-3.5 text-amber-400" /> {durationFormatted}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-white">
                    <Calendar className="h-3.5 w-3.5 text-sky-400" /> {movie.releaseDate}
                  </span>
                  <span>•</span>
                  <span>{movie.country}</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setEditModalOpen(true)}
              className="gap-1.5 font-bold shadow-lg shadow-amber-400/20 self-start sm:self-end"
            >
              <Edit className="h-3.5 w-3.5" /> Edit Master Metadata
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Formats & Meta */}
        <div className="space-y-6">
          <Card variant="elevated" className="p-5 bg-[#0F172A] border-[#1E293B] space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-amber-400" />
              Technical Specifications
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#64748B] block">Exhibition Formats</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {movie.formats.map((f, i) => (
                    <Badge key={i} variant="primary" size="sm" className="font-mono text-[10px]">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-[#64748B] block">Audio Languages</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {movie.availableLanguages.map((l, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-[#111827] border border-[#2A3445] text-sky-300 text-[11px]">
                      {l}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-[#64748B] block">Genres</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {movie.genres.map((g, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-[#111827] border border-[#2A3445] text-purple-300 text-[11px]">
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#1E293B] space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Production:</span>
                  <span className="text-white font-medium">{movie.productionHouse || "Studio"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Distributor:</span>
                  <span className="text-white font-medium">{movie.distributor || "Domestic"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Primary Audio:</span>
                  <span className="text-amber-400 font-bold">{movie.primaryLanguage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Registry Slug:</span>
                  <span className="text-[#94A3B8]">{movie.slug}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 2 Columns: Narrative, Cast, Crew, Trailers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Synopsis */}
          <Card variant="elevated" className="p-6 bg-[#0F172A] border-[#1E293B] space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-[#94A3B8]">
              Theatrical Narrative Synopsis
            </h3>
            <p className="text-[#CBD5E1] text-xs leading-relaxed">
              {movie.synopsis}
            </p>
          </Card>

          {/* Cast */}
          <Card variant="elevated" className="p-6 bg-[#0F172A] border-[#1E293B] space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
              <Users className="h-4 w-4 text-amber-400" />
              Principal Cast Members ({movie.cast.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {movie.cast.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0B0F19] border border-[#1E293B]">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-[#111827] border border-[#2A3445] shrink-0">
                    <img src={c.profileImage} alt={c.actorName} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate">{c.actorName}</div>
                    <div className="text-[11px] text-[#94A3B8] truncate">{c.characterName}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Crew */}
          <Card variant="elevated" className="p-6 bg-[#0F172A] border-[#1E293B] space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
              <Award className="h-4 w-4 text-purple-400" />
              Directorial & Creative Crew ({movie.crew.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {movie.crew.map((cr) => (
                <div key={cr.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F19] border border-[#1E293B]">
                  <div>
                    <div className="font-bold text-white">{cr.name}</div>
                    <div className="text-[11px] text-[#64748B]">{cr.role}</div>
                  </div>
                  <Badge variant="secondary" size="sm">
                    {cr.role}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Video Trailers */}
          {movie.trailers && movie.trailers.length > 0 && (
            <Card variant="elevated" className="p-6 bg-[#0F172A] border-[#1E293B] space-y-4">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <Video className="h-4 w-4 text-amber-400" />
                Theatrical Video Trailers ({movie.trailers.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {movie.trailers.map((tr) => (
                  <div key={tr.id} className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                        <Play className="h-4 w-4 fill-amber-400" />
                      </div>
                      <div>
                        <div className="font-bold text-white truncate">{tr.title}</div>
                        <div className="text-[10px] text-[#64748B] font-mono">{tr.platform} • {tr.duration}</div>
                      </div>
                    </div>
                    <a
                      href={tr.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#2A3445] text-white hover:text-amber-400 flex items-center gap-1 text-[11px]"
                    >
                      <span>Play</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <MasterMovieFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        initialMovie={movie}
        onSave={(updated) => updateMasterMovie(movie.id, updated as any)}
      />
    </div>
  );
}
