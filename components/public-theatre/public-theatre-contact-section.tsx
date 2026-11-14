"use client";

import React from "react";
import { PublicTheatreView } from "@/types/public-theatre.types";
import {
  Phone,
  Mail,
  ShieldAlert,
  UserCheck,
  Globe,
  Share2,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Navigation,
} from "lucide-react";

export interface PublicTheatreContactSectionProps {
  theatre: PublicTheatreView;
}

export function PublicTheatreContactSection({ theatre }: PublicTheatreContactSectionProps) {
  const { contact, location, profile } = theatre;

  return (
    <div className="space-y-6">
      {/* 1. Location & Navigation */}
      <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#FBBF24]" />
            <span>Location, Directions & Navigation</span>
          </h3>
          <span className="text-xs font-mono text-[#94A3B8]">
            {location.city}, {location.state} • PIN {location.postalCode}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Complete Multiplex Address
              </div>
              <p className="text-sm text-white font-medium leading-relaxed">
                {location.completeAddress}
              </p>
              {location.landmark && (
                <p className="text-xs text-[#FBBF24]">
                  <span className="font-semibold">Prominent Landmark:</span> Near {location.landmark}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#94A3B8]">
              <span>
                Jurisdiction: <strong className="text-white">{location.state}, {location.country}</strong>
              </span>
              {location.coordinates && (
                <span className="font-mono text-[#CBD5E1]">
                  ({location.coordinates.latitude.toFixed(4)}° N, {location.coordinates.longitude.toFixed(4)}° E)
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-4">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#38BDF8]">
                Navigation & Turn-by-Turn Routing
              </div>
              <p className="text-xs text-[#94A3B8]">
                Open verified coordinates directly in your preferred navigation application for live traffic arrival.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {location.googleMapsUrl && (
                <a
                  href={location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-xs font-bold text-white transition-colors border border-[#334155]"
                >
                  <MapPin className="h-4 w-4 text-rose-400" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="h-3 w-3 text-[#94A3B8]" />
                </a>
              )}

              {location.navigationUrl && (
                <a
                  href={location.navigationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-[#FBBF24] transition-colors border border-amber-500/30"
                >
                  <Navigation className="h-4 w-4 text-[#FBBF24]" />
                  <span>Start Turn-by-Turn</span>
                  <ExternalLink className="h-3 w-3 text-[#FBBF24]/70" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Official Contact Channels */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Phone className="h-5 w-5 text-emerald-400" />
            <span>Official Contact Directory & Assistance Desks</span>
          </h3>
          <span className="text-xs font-mono text-[#94A3B8] bg-[#111827] px-2.5 py-1 rounded-lg border border-[#2A3445]">
            Verified Channels
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Primary Voice Desk */}
          {contact.primaryPhone && (
            <div className="p-5 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-3 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Phone className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> PRIMARY LINE
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{contact.primaryPhone.label}</h4>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Reservations & General Box Office Enquiries
                </p>
              </div>
              <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between">
                <span className="font-mono text-sm text-zinc-100 font-semibold">
                  {contact.primaryPhone.formatted}
                </span>
                <a
                  href={`tel:${contact.primaryPhone.number.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                >
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          )}

          {/* Guest Support Email */}
          {contact.supportEmail && (
            <div className="p-5 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-3 hover:border-sky-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Mail className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-sky-400 bg-sky-950/40 border border-sky-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> OFFICIAL SUPPORT
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{contact.supportEmail.label}</h4>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  {contact.supportEmail.department || "Guest Relations Desk"}
                </p>
              </div>
              <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-300 truncate max-w-[170px]">
                  {contact.supportEmail.email}
                </span>
                <a
                  href={`mailto:${contact.supportEmail.email}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-colors"
                >
                  <span>Send Mail</span>
                </a>
              </div>
            </div>
          )}

          {/* 24/7 Priority Emergency Desk */}
          {contact.emergencyDesk && (
            <div className="p-5 rounded-2xl bg-[#111827] border border-rose-500/30 space-y-3 bg-gradient-to-br from-[#111827] to-rose-950/20">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 rounded-full">
                  24/7 PRIORITY LINE
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{contact.emergencyDesk.label}</h4>
                <p className="text-xs text-rose-300/80 mt-0.5">
                  Officer: {contact.emergencyDesk.officer || "Incident Command Duty Officer"}
                </p>
              </div>
              <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-200 font-semibold">
                  {contact.emergencyDesk.phone}
                </span>
                <a
                  href={`tel:${contact.emergencyDesk.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors"
                >
                  <span>Emergency Call</span>
                </a>
              </div>
            </div>
          )}

          {/* Duty Manager Contact */}
          {contact.dutyManager && (
            <div className="p-5 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-3 hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <UserCheck className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-800/40 px-2 py-0.5 rounded-full">
                  DUTY ESCALATION
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {contact.dutyManager.name || "Operations Duty Manager"}
                </h4>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  {contact.dutyManager.designation} • {contact.dutyManager.department}
                </p>
              </div>
              <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs">
                <span className="font-mono text-zinc-300">
                  {contact.dutyManager.phone}
                </span>
                <span className="text-[11px] text-indigo-400 font-medium">On-Duty Floor Lead</span>
              </div>
            </div>
          )}

          {/* Official Website */}
          {contact.website && (
            <div className="p-5 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-3 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Globe className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  WEB PORTAL
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Official Multiplex Portal</h4>
                <p className="text-xs text-[#94A3B8] mt-0.5 truncate">{contact.website}</p>
              </div>
              <div className="pt-2 border-t border-[#1E293B] flex justify-end">
                <a
                  href={contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                >
                  <span>Visit Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Social Presence Hub */}
          {contact.socialLinks.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <Share2 className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-pink-400 bg-pink-950/40 border border-pink-800/40 px-2 py-0.5 rounded-full">
                  OFFICIAL SOCIALS
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Social Media Communities</h4>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Follow CineSphere for advance ticket drop alerts
                </p>
              </div>
              <div className="pt-2 border-t border-[#1E293B] flex flex-wrap items-center gap-2">
                {contact.socialLinks.map((soc) => (
                  <a
                    key={soc.id}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    <span className="font-medium text-[11px]">{soc.label}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
