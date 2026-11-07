import React from "react";
import Image from "next/image";
import { CURRENT_THEATRE } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ShieldCheck,
  Edit,
  Sparkles,
  Layers,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Theatre Profile | CineSphere OS",
};

export default function TheatreProfilePage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title={CURRENT_THEATRE.name}
        subtitle={`${CURRENT_THEATRE.code} • Established ${CURRENT_THEATRE.established}`}
        description="Comprehensive facility overview, licensing credentials, contact points, and operating schedule for this cinema complex."
        badge="Active Tenant"
        badgeVariant="success"
        actions={
          <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
            <Edit className="h-4 w-4" /> Edit Profile (Coming Soon)
          </Button>
        }
      />

      {/* Banner & Hero Visual */}
      <div className="relative rounded-3xl overflow-hidden border border-[#2A3445] h-64 sm:h-80 w-full bg-[#111827]">
        <img
          src={CURRENT_THEATRE.bannerImage}
          alt={CURRENT_THEATRE.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B12] via-transparent to-black/30" />
        <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-[#FBBF24] font-semibold">{CURRENT_THEATRE.tagline}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{CURRENT_THEATRE.name}</h2>
            <p className="text-xs text-[#CBD5E1] flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#FBBF24]" />
              {CURRENT_THEATRE.address}, {CURRENT_THEATRE.city}, {CURRENT_THEATRE.state} - {CURRENT_THEATRE.pinCode}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="solid" size="sm" className="font-bold">
              {CURRENT_THEATRE.totalScreens} Laser Screens
            </Badge>
            <Badge variant="outline" size="sm">
              {CURRENT_THEATRE.totalSeats} Total Seats
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Details & Location */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#FBBF24]" /> Basic Organization Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div>
                <span className="text-[#64748B]">Commercial Entity</span>
                <p className="font-semibold text-white mt-0.5">{CURRENT_THEATRE.name} Pvt. Ltd.</p>
              </div>
              <div>
                <span className="text-[#64748B]">Internal Tenant ID</span>
                <p className="font-mono font-semibold text-white mt-0.5">{CURRENT_THEATRE.id}</p>
              </div>
              <div>
                <span className="text-[#64748B]">Exhibitor Registration Code</span>
                <p className="font-mono font-semibold text-[#FBBF24] mt-0.5">{CURRENT_THEATRE.code}</p>
              </div>
              <div>
                <span className="text-[#64748B]">Operational Status</span>
                <p className="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Fully Operational
                </p>
              </div>
            </div>
          </Card>

          {/* Location & Map Placeholder */}
          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#FBBF24]" /> Venue Location & Geospatial Anchor
            </h3>

            <div className="rounded-2xl bg-[#111827] border border-[#2A3445] p-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-xl bg-[#161F2E] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mx-auto">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Level 4, Phoenix Marketcity Mall</h4>
                <p className="text-xs text-[#94A3B8] max-w-md mx-auto mt-1">
                  Viman Nagar, Nagar Road, Pune, Maharashtra 411014. GPS Coordinates: 18.5626° N, 73.9168° E
                </p>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="xs" disabled className="border-[#2A3445] text-xs">
                  Interactive Map Integration (Phase 2)
                </Button>
              </div>
            </div>
          </Card>

          {/* Operating Hours */}
          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#FBBF24]" /> Box Office & Complex Hours
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                <span className="text-[#94A3B8] font-semibold">Weekday Schedule (Mon - Thu)</span>
                <p className="text-base font-bold text-white font-mono">{CURRENT_THEATRE.openingTime} – 12:30 AM</p>
                <p className="text-[10px] text-[#64748B]">First showtime departs 09:15 AM</p>
              </div>
              <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                <span className="text-[#94A3B8] font-semibold">Weekend Schedule (Fri - Sun)</span>
                <p className="text-base font-bold text-white font-mono">{CURRENT_THEATRE.openingTime} – {CURRENT_THEATRE.closingTime}</p>
                <p className="text-[10px] text-amber-400">Midnight screenings active</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Contact & Quick Facilities */}
        <div className="space-y-6">
          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
              Contact Coordinates
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
                <Phone className="h-4 w-4 text-[#FBBF24] shrink-0" />
                <div>
                  <span className="text-[#64748B] block text-[10px]">Operations Desk</span>
                  <span className="font-mono font-semibold text-white">{CURRENT_THEATRE.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
                <Mail className="h-4 w-4 text-[#FBBF24] shrink-0" />
                <div>
                  <span className="text-[#64748B] block text-[10px]">General Manager Email</span>
                  <span className="font-mono font-semibold text-white">{CURRENT_THEATRE.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
                <Globe className="h-4 w-4 text-[#FBBF24] shrink-0" />
                <div>
                  <span className="text-[#64748B] block text-[10px]">Exhibitor Public URL</span>
                  <span className="font-mono font-semibold text-[#FBBF24] truncate block max-w-[200px]">
                    {CURRENT_THEATRE.website}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
              Key Amenities & Perks
            </h3>

            <ul className="space-y-2 text-xs">
              {CURRENT_THEATRE.amenities.slice(0, 6).map((amenity, i) => (
                <li key={i} className="flex items-center gap-2 text-[#CBD5E1]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FBBF24]" />
                  <span>{amenity}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

