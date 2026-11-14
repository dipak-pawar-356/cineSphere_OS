"use client";

import React from "react";
import Image from "next/image";
import { PublicTheatreView } from "@/types/public-theatre.types";
import { Star, MessageSquare, Camera, ShieldCheck } from "lucide-react";

export interface PublicTheatreReviewsPlaceholderProps {
  theatre: PublicTheatreView;
}

export function PublicTheatreReviewsPlaceholder({
  theatre,
}: PublicTheatreReviewsPlaceholderProps) {
  const { reviewsSummary, profile } = theatre;
  const { averageRating, totalReviews, ratingDistribution, customerPhotos, reviewListPlaceholder } =
    reviewsSummary;

  return (
    <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A3445] pb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400 fill-current" />
            <span>Patron Ratings & Experiences</span>
          </h3>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Verified guest reviews, auditorium comfort ratings, and concession dining feedback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#FBBF24] bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
            {totalReviews.toLocaleString()} Total Reviews
          </span>
        </div>
      </div>

      {/* Ratings Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#2A3445] flex flex-col items-center justify-center text-center space-y-2">
          <div className="text-4xl sm:text-5xl font-black font-mono text-white">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <p className="text-xs text-[#94A3B8]">
            Overall Rating across {profile.displayName}
          </p>
        </div>

        {/* Rating Distribution Bars */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#2A3445] space-y-2 col-span-1 md:col-span-2 flex flex-col justify-center text-xs">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingDistribution[stars as keyof typeof ratingDistribution] || 0;
            const pct = Math.round((count / totalReviews) * 100);

            return (
              <div key={stars} className="flex items-center gap-3">
                <span className="w-12 font-mono text-zinc-300 font-semibold flex items-center gap-1 shrink-0">
                  <span>{stars}</span>
                  <Star className="h-3 w-3 text-amber-400 fill-current" />
                </span>

                <div className="flex-1 h-2 rounded-full bg-[#1E293B] overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <span className="w-12 font-mono text-zinc-400 text-right shrink-0">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Experience Photos (Architectural Placeholder) */}
      {customerPhotos && customerPhotos.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-sky-400" />
              <span>Patron Experience Photos</span>
            </span>
            <span className="text-zinc-500 font-mono text-[11px]">
              {customerPhotos.length} Community Highlights
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {customerPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative h-28 rounded-xl overflow-hidden bg-black/40 border border-[#2A3445] group"
              >
                <Image
                  src={photo.url}
                  alt={photo.caption || "Guest Photo"}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black via-black/60 to-transparent text-[10px] text-zinc-200 truncate">
                    {photo.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Patron Feedback Highlights */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-emerald-400" />
            <span>Recent Verified Patron Feedback</span>
          </span>
          <span className="text-zinc-500 font-mono text-[11px]">
            Auto-moderated reviews
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {reviewListPlaceholder.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs truncate">
                    {rev.authorName}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] text-zinc-400">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <ShieldCheck className="h-3 w-3" /> Verified Ticket
                </span>
                <span className="font-mono">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
