"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DUMMY_MOVIES } from "@/lib/constants/movies";
import {
  Film,
  Plus,
  Search,
  Filter,
  Star,
  Clock,
  Sparkles,
  Key,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminMoviesPage() {
  const [selectedGenre, setSelectedGenre] = useState("all");

  const filteredMovies = DUMMY_MOVIES.filter((m) => {
    if (selectedGenre === "all") return true;
    return m.genre.some((g) => g.toLowerCase() === selectedGenre.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Global Film Catalog & DCP Licensing"
        subtitle="48 Studio Releases, Distributor Contracts, KDM Encryption & Formats"
        description="Ingest theatrical releases, monitor distributor licensing terms, distribute KDM projection keys, and maintain rating certifications."
        badge="48 Active Titles"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <Plus className="h-4 w-4" /> Ingest New Film Asset (Disabled)
          </Button>
        }
      />

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active Releases", val: "48 Titles", sub: "Currently Playing" },
          { label: "Upcoming Pipeline", val: "16 Movies", sub: "KDM Ingest Pending" },
          { label: "Audio Languages", val: "8 Dialects", sub: "Multi-Track DCPs" },
          { label: "KDM Key Health", val: "100% Valid", sub: "Zero Expired Decryptions" },
        ].map((m, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">{m.label}</div>
            <div className="text-xl font-extrabold font-mono text-white">{m.val}</div>
            <div className="text-[11px] text-emerald-400">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {[
            { id: "all", label: "All Genres" },
            { id: "sci-fi", label: "Sci-Fi" },
            { id: "action", label: "Action" },
            { id: "thriller", label: "Thriller" },
            { id: "drama", label: "Drama" },
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGenre(g.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium capitalize ${
                selectedGenre === g.id
                  ? "bg-[#FBBF24] text-[#070B12] font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search movie titles... (disabled)"
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
            disabled
          />
        </div>
      </div>

      {/* Movies Table */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-5">Movie Title</th>
                <th className="py-3.5 px-5">Formats</th>
                <th className="py-3.5 px-5">Genre</th>
                <th className="py-3.5 px-5">Duration</th>
                <th className="py-3.5 px-5">Certification</th>
                <th className="py-3.5 px-5">Rating</th>
                <th className="py-3.5 px-5">Release Date</th>
                <th className="py-3.5 px-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {filteredMovies.map((mv) => (
                <tr key={mv.id} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Film className="h-4 w-4 text-[#FBBF24]" />
                      <span>{mv.title}</span>
                    </div>
                    <div className="text-[10px] text-[#64748B]">{mv.director}</div>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex flex-wrap gap-1">
                      {mv.formats.slice(0, 3).map((f, i) => (
                        <Badge key={i} variant="secondary" size="sm">{f}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-[#94A3B8]">{mv.genre.join(", ")}</td>
                  <td className="py-3.5 px-5 font-mono text-[#CBD5E1]">{mv.durationMinutes} min</td>
                  <td className="py-3.5 px-5">
                    <Badge variant="outline" size="sm">{mv.certification}</Badge>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-amber-400 font-bold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400" />
                    <span>{mv.rating}</span>
                  </td>
                  <td className="py-3.5 px-5 text-[#94A3B8] font-mono">{mv.releaseDate}</td>
                  <td className="py-3.5 px-5">
                    <Button variant="outline" size="sm" disabled className="h-7 text-xs px-2.5 border-[#2A3445]">
                      License (Disabled)
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#111827]/60 border-t border-[#2A3445] flex items-center justify-between text-xs text-[#94A3B8]">
          <span className="font-mono text-[11px]">Showing {filteredMovies.length} of 48 Active Theatrical Titles</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs border-[#2A3445]">Previous</Button>
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs border-[#2A3445]">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
