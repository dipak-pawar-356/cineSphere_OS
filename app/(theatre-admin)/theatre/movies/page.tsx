import React from "react";
import Link from "next/link";
import { THEATRE_MOVIES } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Film, Plus, Eye, Clock, Calendar, Sparkles, Filter } from "lucide-react";

export const metadata = {
  title: "Movie Fleet Management | CineSphere OS",
};

export default function TheatreMoviesPage() {
  const nowShowing = THEATRE_MOVIES.filter((m) => m.status === "Now Showing");
  const upcoming = THEATRE_MOVIES.filter((m) => m.status === "Upcoming" || m.status === "Special Screening");

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Licensed Feature Films & DCP Library"
        subtitle="12 Feature Titles • Studio Ingestion Active • KDM Decryption Verified"
        description="Manage currently screening films, verify digital cinema package (DCP) ingestion integrity, track KDM security keys, and inspect auditorium assignments."
        badge="12 Films Active"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <Plus className="h-4 w-4" /> Add Movie License (Phase 2)
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {["All Movies (12)", "Now Showing (8)", "Upcoming Releases (3)", "Special Screenings (1)"].map((tab, idx) => (
          <button
            key={tab}
            type="button"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              idx === 0
                ? "bg-[#FBBF24] text-[#070B12]"
                : "bg-[#111827] text-[#94A3B8] border border-[#2A3445] hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Movie Table */}
      <Card variant="elevated" className="overflow-hidden border-[#2A3445]">
        <div className="p-5 border-b border-[#2A3445] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
              Feature Films Exhibition Registry
            </h3>
            <p className="text-xs text-[#64748B]">Digital Cinema Packages loaded into Phoenix Marketcity TMS servers</p>
          </div>
          <span className="text-xs text-[#94A3B8] font-mono">{THEATRE_MOVIES.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-4">Film & Poster</th>
                <th className="py-3.5 px-4">Certification</th>
                <th className="py-3.5 px-4">Language</th>
                <th className="py-3.5 px-4">Genre</th>
                <th className="py-3.5 px-4">Runtime</th>
                <th className="py-3.5 px-4">Formats</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60">
              {THEATRE_MOVIES.map((movie) => (
                <tr key={movie.id} className="hover:bg-[#161F2E]/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-8 rounded-lg overflow-hidden bg-[#111827] shrink-0 border border-[#2A3445]">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-white block text-sm">{movie.title}</span>
                        <span className="text-[10px] text-[#64748B]">Dir: {movie.director}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#FBBF24]">
                    {movie.rating}
                  </td>
                  <td className="py-3.5 px-4 text-[#CBD5E1]">
                    {movie.language}
                  </td>
                  <td className="py-3.5 px-4 text-[#94A3B8]">
                    {movie.genre.join(", ")}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#CBD5E1]">
                    {movie.runtime}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {movie.formats.map((fmt) => (
                        <span key={fmt} className="text-[9px] px-1.5 py-0.2 rounded bg-[#111827] border border-[#2A3445] text-[#94A3B8] font-mono">
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        movie.status === "Now Showing"
                          ? "success"
                          : movie.status === "Special Screening"
                          ? "warning"
                          : "secondary"
                      }
                      size="sm"
                      dot={movie.status === "Now Showing"}
                    >
                      {movie.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/theatre/movies/${movie.id}`}>
                        <Button variant="outline" size="xs" className="gap-1 border-[#2A3445] text-xs">
                          <Eye className="h-3 w-3" /> View Details
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
