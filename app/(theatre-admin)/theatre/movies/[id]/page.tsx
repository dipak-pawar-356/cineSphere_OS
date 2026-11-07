import React from "react";
import Link from "next/link";
import { THEATRE_MOVIES, THEATRE_SHOWS } from "@/lib/constants/theatre-admin";
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
  Ticket,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Movie Operational Details | CineSphere OS",
};

export default async function TheatreMovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const movie = THEATRE_MOVIES.find((m) => m.id === resolvedParams.id) || THEATRE_MOVIES[0];
  const scheduledShows = THEATRE_SHOWS.filter((s) => s.movieId === movie.id);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-2">
        <Link href={ROUTES.THEATRE_ADMIN.MOVIES}>
          <Button variant="ghost" size="xs" className="gap-1 text-xs text-[#94A3B8]">
            <ArrowLeft className="h-3 w-3" /> Back to Movies Roster
          </Button>
        </Link>
      </div>

      <PageHeader
        title={movie.title}
        subtitle={`${movie.language} • ${movie.runtime} • Rating: ${movie.rating}`}
        description={movie.synopsis}
        badge={movie.status}
        badgeVariant={movie.status === "Now Showing" ? "success" : "warning"}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
              <Lock className="h-4 w-4" /> KDM Decryption Key: Active
            </Button>
            <Button variant="primary" size="sm" disabled className="gap-1.5 font-bold">
              Edit Showtimes (Phase 2)
            </Button>
          </div>
        }
      />

      {/* Movie Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card variant="elevated" className="overflow-hidden p-0 border-[#2A3445]">
            <div className="relative h-96 w-full bg-[#111827]">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div>
                <span className="text-[#64748B]">Director</span>
                <p className="font-semibold text-white mt-0.5">{movie.director}</p>
              </div>
              <div>
                <span className="text-[#64748B]">Starring Cast</span>
                <p className="font-semibold text-white mt-0.5">{movie.leadCast.join(", ")}</p>
              </div>
              <div>
                <span className="text-[#64748B]">Genres</span>
                <p className="font-semibold text-white mt-0.5">{movie.genre.join(" • ")}</p>
              </div>
              <div>
                <span className="text-[#64748B]">Approved Exhibition Formats</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {movie.formats.map((f) => (
                    <Badge key={f} variant="outline" size="sm">{f}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Scheduled Shows in this Complex */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
                  Scheduled Dispatches at Phoenix Marketcity
                </h3>
                <p className="text-xs text-[#64748B]">Auditorium allocations and occupancy status</p>
              </div>
              <span className="text-xs font-mono text-[#FBBF24] font-bold">{scheduledShows.length} Shows Today</span>
            </div>

            {scheduledShows.length > 0 ? (
              <div className="space-y-3">
                {scheduledShows.map((show) => (
                  <div key={show.id} className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{show.hallName}</span>
                        <Badge variant="warning" size="sm">{show.format}</Badge>
                      </div>
                      <span className="text-xs text-[#FBBF24] font-mono font-semibold block">
                        {show.startTime} – {show.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-[10px] text-[#64748B] block">Ticket Base</span>
                        <span className="text-sm font-bold font-mono text-white">₹{show.ticketPrice}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#64748B] block">Occupancy</span>
                        <span className="text-sm font-bold font-mono text-emerald-400">{show.seatsBooked}/{show.totalSeats}</span>
                      </div>
                      <Badge variant={show.status === "Running" ? "success" : "secondary"} size="sm">
                        {show.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8]">No showtimes currently active today for this title.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

