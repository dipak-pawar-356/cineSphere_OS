"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PublicTheatreView } from "@/types/public-theatre.types";
import { Sparkles, X, ChevronLeft, ChevronRight } from "lucide-react";

export interface PublicTheatreGallerySectionProps {
  theatre: PublicTheatreView;
}

export function PublicTheatreGallerySection({ theatre }: PublicTheatreGallerySectionProps) {
  const { branding } = theatre;
  const gallery = branding.gallery;

  const [activeModalIdx, setActiveModalIdx] = useState<number | null>(null);

  if (!gallery || gallery.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#FBBF24]" />
            <span>Venue Gallery & Architectural Showcase</span>
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Explore high-resolution auditorium interiors, VIP lounges, and acoustic architecture.
          </p>
        </div>

        <span className="text-xs font-mono text-[#94A3B8] bg-[#111827] px-2.5 py-1 rounded-lg border border-[#2A3445]">
          {gallery.length} Active Photos
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {gallery.map((photo, idx) => (
          <div
            key={photo.id}
            onClick={() => setActiveModalIdx(idx)}
            className="rounded-2xl bg-[#111827] border border-[#2A3445] overflow-hidden group hover:border-[#FBBF24]/50 transition-colors cursor-pointer"
          >
            <div className="relative h-48 w-full bg-[#070B12] overflow-hidden">
              <Image
                src={photo.url}
                alt={photo.title}
                fill
                unoptimized
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3 space-y-0.5">
              <h4 className="text-xs font-bold text-white truncate">{photo.title}</h4>
              {photo.caption && (
                <p className="text-[11px] text-[#94A3B8] truncate">{photo.caption}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeModalIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveModalIdx(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#070B12] rounded-2xl border border-[#2A3445] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModalIdx(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative aspect-video w-full bg-black">
              <Image
                src={gallery[activeModalIdx].url}
                alt={gallery[activeModalIdx].title}
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            <div className="p-4 bg-[#111827] border-t border-[#2A3445] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{gallery[activeModalIdx].title}</h4>
                {gallery[activeModalIdx].caption && (
                  <p className="text-xs text-[#94A3B8] mt-0.5">{gallery[activeModalIdx].caption}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveModalIdx((prev) =>
                      prev !== null && prev > 0 ? prev - 1 : gallery.length - 1
                    )
                  }
                  className="p-1.5 rounded-lg bg-[#161F2E] border border-[#2A3445] text-white hover:bg-[#2A3445] transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-mono text-[#94A3B8]">
                  {activeModalIdx + 1} / {gallery.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setActiveModalIdx((prev) =>
                      prev !== null && prev < gallery.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="p-1.5 rounded-lg bg-[#161F2E] border border-[#2A3445] text-white hover:bg-[#2A3445] transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
