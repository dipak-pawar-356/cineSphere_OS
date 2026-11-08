"use client";

import React, { useState } from "react";
import { GlobalMasterMovie } from "@/types/movie-management.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  X,
  Film,
  Star,
  Clock,
  Calendar,
  Globe,
  Layers,
  Sparkles,
  Users,
  Video,
  Award,
  Building2,
  ExternalLink,
  Play,
  Share2,
} from "lucide-react";

interface MasterMovieDetailModalProps {
  movie: GlobalMasterMovie | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (movie: GlobalMasterMovie) => void;
}

export function MasterMovieDetailModal({
  movie,
  isOpen,
  onClose,
  onEdit,
}: MasterMovieDetailModalProps) {
  const [activeMediaTab, setActiveMediaTab] = useState<"trailer" | "gallery">("trailer");

  if (!isOpen || !movie) return null;

  const durationFormatted = `${Math.floor(movie.durationMinutes / 60)}h ${movie.durationMinutes % 60}m`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0B1220] border border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Banner Hero Header */}
        <div className="relative h-64 w-full bg-[#070B12] overflow-hidden shrink-0">
          <img
            src={movie.bannerUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover opacity-40 blur-xs scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/60 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-[#94A3B8] hover:text-white backdrop-blur-sm transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Floating Movie Overview Info */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end gap-5">
            <div className="h-40 w-28 rounded-2xl overflow-hidden border-2 border-amber-400/30 shadow-2xl bg-[#111827] shrink-0">
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-1.5 flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={movie.status === "Now Showing" ? "success" : "warning"} size="sm">
                  {movie.status}
                </Badge>
                <Badge variant="outline" size="sm" className="font-mono text-amber-400 border-amber-400/30">
                  {movie.certificate}
                </Badge>
                <div className="flex items-center gap-1 font-mono text-amber-400 font-bold text-xs bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  <Star className="h-3 w-3 fill-amber-400" />
                  <span>{movie.rating}</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white truncate">
                {movie.title}
              </h2>

              {movie.originalTitle && movie.originalTitle !== movie.title && (
                <div className="text-xs text-[#94A3B8] italic">
                  Original Title: {movie.originalTitle}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8] font-mono">
                <span className="flex items-center gap-1 text-white">
                  <Clock className="h-3.5 w-3.5 text-amber-400" /> {durationFormatted} ({movie.durationMinutes}m)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-white">
                  <Calendar className="h-3.5 w-3.5 text-sky-400" /> {movie.releaseDate}
                </span>
                <span>•</span>
                <span>{movie.country}</span>
              </div>
            </div>

            {onEdit && (
              <div className="hidden sm:block shrink-0 pb-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onEdit(movie);
                  }}
                  className="font-bold text-xs shadow-lg shadow-amber-400/20"
                >
                  Edit Master Film
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Architectural Invariant Box */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <span className="font-bold text-white block">Platform Master Film Entity</span>
              <p className="text-[#94A3B8]">
                This movie record is shared across all registered theatres in CineSphere OS. Individual cinema complexes link to this title and schedule shows with their own halls and dynamic pricing without duplicating movie metadata.
              </p>
            </div>
          </div>

          {/* Formats, Languages & Genres */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#0F172A] border border-[#1E293B]">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-[#64748B] font-bold block">
                Exhibition Formats
              </span>
              <div className="flex flex-wrap gap-1">
                {movie.formats.map((f, i) => (
                  <Badge key={i} variant="primary" size="sm" className="font-mono text-[10px]">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-[#64748B] font-bold block">
                Audio Languages
              </span>
              <div className="flex flex-wrap gap-1">
                {movie.availableLanguages.map((l, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-[11px] bg-[#111827] text-sky-300 border border-[#2A3445]"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-[#64748B] font-bold block">
                Genres
              </span>
              <div className="flex flex-wrap gap-1">
                {movie.genres.map((g, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-[11px] bg-[#111827] text-purple-300 border border-[#2A3445]"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#94A3B8]">
              Theatrical Narrative Synopsis
            </h4>
            <p className="text-white text-xs leading-relaxed bg-[#0F172A] p-4 rounded-2xl border border-[#1E293B]">
              {movie.synopsis}
            </p>
          </div>

          {/* Cast & Crew Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cast */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <Users className="h-4 w-4 text-amber-400" />
                Principal Cast ({movie.cast.length})
              </h4>
              <div className="space-y-2">
                {movie.cast.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0F172A] border border-[#1E293B]"
                  >
                    <div className="h-9 w-9 rounded-full overflow-hidden bg-[#1E293B] shrink-0 border border-[#2A3445]">
                      <img src={c.profileImage} alt={c.actorName} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">{c.actorName}</div>
                      <div className="text-[11px] text-[#94A3B8] truncate">{c.characterName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Crew */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <Award className="h-4 w-4 text-purple-400" />
                Directorial & Production Crew ({movie.crew.length})
              </h4>
              <div className="space-y-2">
                {movie.crew.map((cr) => (
                  <div
                    key={cr.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F172A] border border-[#1E293B]"
                  >
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
            </div>
          </div>

          {/* Production House & Meta */}
          <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#1E293B] grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase">Production House</span>
              <span className="font-bold text-white">{movie.productionHouse || "Studio Flagship"}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase">Theatrical Distributor</span>
              <span className="font-bold text-white">{movie.distributor || "Domestic Distribution"}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase">IMDb Score</span>
              <span className="font-bold text-amber-400">{movie.imdbRating || "8.5"}/10</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase">Registered Timestamp</span>
              <span className="text-[#94A3B8]">{movie.createdAt.split("T")[0]}</span>
            </div>
          </div>

          {/* Video Trailers & Assets */}
          {movie.trailers && movie.trailers.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <Video className="h-4 w-4 text-amber-400" />
                Theatrical Video Assets ({movie.trailers.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {movie.trailers.map((tr) => (
                  <div
                    key={tr.id}
                    className="p-3 rounded-2xl bg-[#0F172A] border border-[#1E293B] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                        <Play className="h-4 w-4 fill-amber-400" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{tr.title}</div>
                        <div className="text-[10px] text-[#64748B] font-mono">
                          {tr.platform} • {tr.duration}
                        </div>
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1E293B] flex items-center justify-between bg-[#0F172A]">
          <span className="text-[11px] text-[#64748B] font-mono">
            Unique Movie ID: {movie.id} • Slug: {movie.slug}
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="border-[#2A3445] text-xs">
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
}

