"use client";

import React, { useState } from "react";
import {
  TheatreCoordinatesRecord,
  TheatreLocationRecord,
} from "@/types/theatre-location.types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CoordinateSourceBadge } from "./location-status-badge";
import {
  Compass,
  MapPin,
  ExternalLink,
  Navigation,
  Crosshair,
  Hash,
  Globe,
  Car,
  Footprints,
  Bus,
} from "lucide-react";

export interface TheatreCoordinatesPanelProps {
  location: TheatreLocationRecord;
  coordinates?: TheatreCoordinatesRecord | null;
  onEditCoordinates?: () => void;
  readOnly?: boolean;
}

export function TheatreCoordinatesPanel({
  location,
  coordinates,
  onEditCoordinates,
  readOnly = false,
}: TheatreCoordinatesPanelProps) {
  const hasCoords = coordinates && coordinates.latitude !== undefined && coordinates.longitude !== undefined;

  return (
    <Card variant="elevated" className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FBBF24]">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Geographic Coordinates & Navigation</h3>
            <p className="text-xs text-[#94A3B8]">
              Spatial telemetry, GPS pins, geohash indexing, and routing links.
            </p>
          </div>
        </div>

        {!readOnly && onEditCoordinates && (
          <Button
            variant="outline"
            size="xs"
            onClick={onEditCoordinates}
            className="border-[#2A3445] text-xs font-medium"
          >
            Update Coordinates
          </Button>
        )}
      </div>

      {hasCoords ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
              <span className="flex items-center gap-1.5 font-medium">
                <Crosshair className="h-3 w-3 text-emerald-400" /> Latitude
              </span>
              <CoordinateSourceBadge source={coordinates.coordinateSource} />
            </div>
            <div className="font-mono text-sm font-bold text-white">
              {coordinates.latitude.toFixed(6)}° N
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
              <span className="flex items-center gap-1.5 font-medium">
                <Crosshair className="h-3 w-3 text-cyan-400" /> Longitude
              </span>
              <span className="text-[10px] text-[#64748B]">WGS84</span>
            </div>
            <div className="font-mono text-sm font-bold text-white">
              {coordinates.longitude.toFixed(6)}° E
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
              <span className="flex items-center gap-1.5 font-medium">
                <Hash className="h-3 w-3 text-[#FBBF24]" /> Geohash Index
              </span>
              <span className="text-[10px] text-[#64748B]">8-char</span>
            </div>
            <div className="font-mono text-sm font-bold text-[#FBBF24]">
              {coordinates.geohash || "Not generated"}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
              <span className="flex items-center gap-1.5 font-medium">
                <Globe className="h-3 w-3 text-purple-400" /> Spatial Point
              </span>
              <span className="text-[10px] text-[#64748B]">SRID 4326</span>
            </div>
            <div className="font-mono text-[11px] font-semibold text-[#CBD5E1] truncate" title={coordinates.spatialIndexPlaceholder || ""}>
              {coordinates.spatialIndexPlaceholder || "ST_MakePoint"}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[#0F172A]/60 border border-dashed border-[#1E293B] text-center space-y-2">
          <MapPin className="h-8 w-8 text-[#64748B] mx-auto" />
          <p className="text-xs text-[#94A3B8]">No geographical coordinates assigned to this complex location.</p>
          {!readOnly && onEditCoordinates && (
            <Button
              variant="primary"
              size="xs"
              onClick={onEditCoordinates}
              className="mt-2"
            >
              Pin Coordinates
            </Button>
          )}
        </div>
      )}

      {/* Navigation Routing & Deep Links */}
      <div className="space-y-3 pt-2 border-t border-[#1E293B]">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider text-[#94A3B8]">
          Navigation Deep Links
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          {location.googleMapsUrl && (
            <a
              href={location.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-xs font-semibold text-white transition-colors border border-[#334155]"
            >
              <MapPin className="h-3.5 w-3.5 text-rose-400" />
              <span>Google Maps</span>
              <ExternalLink className="h-3 w-3 text-[#94A3B8]" />
            </a>
          )}

          {location.navigationLink && (
            <a
              href={location.navigationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-xs font-semibold text-[#FBBF24] transition-colors border border-amber-500/30"
            >
              <Navigation className="h-3.5 w-3.5 text-[#FBBF24]" />
              <span>Turn-by-Turn Navigation</span>
              <ExternalLink className="h-3 w-3 text-[#FBBF24]/70" />
            </a>
          )}

          {location.drivingDirectionsUrl && (
            <a
              href={location.drivingDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-xs font-semibold text-[#CBD5E1] transition-colors border border-[#334155]"
            >
              <Car className="h-3.5 w-3.5 text-blue-400" />
              <span>Driving Route</span>
            </a>
          )}

          {location.transitDirectionsUrl && (
            <a
              href={location.transitDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-xs font-semibold text-[#CBD5E1] transition-colors border border-[#334155]"
            >
              <Bus className="h-3.5 w-3.5 text-teal-400" />
              <span>Public Transit</span>
            </a>
          )}

          {location.walkingDirectionsUrl && (
            <a
              href={location.walkingDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-xs font-semibold text-[#CBD5E1] transition-colors border border-[#334155]"
            >
              <Footprints className="h-3.5 w-3.5 text-emerald-400" />
              <span>Walking Route</span>
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
