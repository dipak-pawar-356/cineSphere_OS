"use client";

import React from "react";
import { PublicTheatreView } from "@/types/public-theatre.types";

export interface PublicTheatreAboutProps {
  theatre: PublicTheatreView;
}

export function PublicTheatreAbout({ theatre }: PublicTheatreAboutProps) {
  const { profile, contact } = theatre;

  return (
    <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
      <div className="lg:col-span-2 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-white">
            About {profile.displayName}
          </h2>
          {profile.establishedYear && (
            <span className="px-2 py-0.5 rounded-full bg-[#111827] border border-[#2A3445] font-mono text-[10px] text-[#FBBF24]">
              Est. {profile.establishedYear}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-[#111827] border border-[#2A3445] font-mono text-[10px] text-[#94A3B8]">
            /{profile.slug}
          </span>
        </div>

        {profile.tagline && (
          <p className="text-[#FBBF24] font-semibold text-xs sm:text-sm">
            {profile.tagline}
          </p>
        )}

        <p className="text-[#CBD5E1] leading-relaxed text-xs sm:text-sm">
          {profile.aboutTheatre || profile.description}
        </p>

        {profile.languages.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[#94A3B8] mr-1 font-semibold">Languages:</span>
            {profile.languages.map((l) => (
              <span
                key={l.id}
                className={`px-2 py-0.5 rounded-md border text-[10px] font-medium ${
                  l.isPrimary
                    ? "bg-[#FBBF24]/15 border-[#FBBF24]/40 text-[#FBBF24]"
                    : "bg-[#111827] border-[#2A3445] text-[#CBD5E1]"
                }`}
              >
                {l.name}
                {l.isPrimary ? " ★" : ""}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-[#2A3445] pt-4 lg:pt-0 lg:pl-6">
        <div>
          <span className="text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider">
            Exhibition Classification
          </span>
          <p className="text-white font-semibold mt-1">
            {profile.ownershipModel} · {profile.screensCount} Auditoriums
          </p>
        </div>

        {contact.website && (
          <div>
            <span className="text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider">
              Official Website
            </span>
            <div className="mt-1">
              <a
                href={contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#38BDF8] hover:underline font-mono break-all text-xs"
              >
                {contact.website}
              </a>
            </div>
          </div>
        )}

        {contact.socialLinks.length > 0 && (
          <div>
            <span className="text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider block mb-1.5">
              Connect on Social
            </span>
            <div className="flex flex-wrap gap-1.5">
              {contact.socialLinks.map((soc) => (
                <a
                  key={soc.id}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#2A3445] text-[#CBD5E1] hover:text-[#FBBF24] hover:border-[#FBBF24]/40 transition-colors text-[11px] font-medium"
                >
                  {soc.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
