"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { PageHeader } from "@/components/layout/page-header";
import { useTheatreStore, type TheatreProfileState } from "@/store/theatre-store";
import {
  getTheatreLifecycleDetailAction,
  updateTheatreLifecycleAction,
} from "@/actions/theatre-lifecycle-actions";
import {
  ManagedTheatreEntity,
  UpdateTheatreInput,
} from "@/types/theatre-lifecycle.types";
import { LifecycleStatusBadge } from "@/components/theatre-lifecycle";

const LazyCreateEditTheatreModal = dynamic(
  () => import("@/components/theatre-lifecycle/create-edit-theatre-modal").then((m) => m.CreateEditTheatreModal),
  { ssr: false }
);
const LazyTheatreProfileWorkspace = dynamic(
  () => import("@/components/theatre-profile/theatre-profile-workspace").then((m) => m.TheatreProfileWorkspace),
  { ssr: false }
);
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
  CheckCircle2,
  X,
  Save,
  Compass,
} from "lucide-react";

export default function TheatreProfilePage() {
  const { profile, updateProfile } = useTheatreStore();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [lifecycleModalOpen, setLifecycleModalOpen] = useState(false);
  const [lifecycleTheatre, setLifecycleTheatre] = useState<ManagedTheatreEntity | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const loadLifecycleEntity = useCallback(async () => {
    const res = await getTheatreLifecycleDetailAction(
      { theatreId: "th-pun-001" },
      { userId: "usr-theatre-1", role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
    );
    if (res.success && res.data) {
      setLifecycleTheatre(res.data.theatre);
    }
  }, []);

  useEffect(() => {
    void loadLifecycleEntity();
  }, [loadLifecycleEntity]);

  const handleLifecycleSaveEdit = async (theatreId: string, input: UpdateTheatreInput) => {
    const res = await updateTheatreLifecycleAction(
      { ...input, theatreId },
      { userId: "usr-theatre-1", role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
    );
    if (res.success && res.data) {
      setLifecycleTheatre(res.data);
      setFeedbackNotice(`Lifecycle profile updated to version v${res.data.version} cleanly.`);
      setTimeout(() => setFeedbackNotice(null), 4000);
      return { success: true };
    }
    return { success: false, error: res.error?.message || "Update failed" };
  };

  // Form edit state
  const [formData, setFormData] = useState<TheatreProfileState>({ ...profile });

  const availableAmenitiesList = [
    "Barco 4K Laser Projection",
    "Dolby Atmos 64-Channel Spatial Audio",
    "IMAX with Laser",
    "4DX Dynamic Motion & Environmental FX",
    "Zero-Gravity Ultra Recliners",
    "Gourmet In-Seat Butler Dining",
    "Fast Electric Vehicle (EV) Charging Stations",
    "Dedicated Valet Drop-off & Retrieval",
    "Accessible Ramps & Companion Wheelchair Seating",
    "High-Speed Wi-Fi & Lounge Bar",
    "Dolby Cinema",
    "ScreenX 270-Degree Panorama",
  ];

  const handleEditClick = () => {
    setFormData({ ...profile });
    setEditModalOpen(true);
  };

  const toggleAmenity = (amenity: string) => {
    const exists = formData.amenities.includes(amenity);
    if (exists) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((a) => a !== amenity),
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity],
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setEditModalOpen(false);
    setFeedbackNotice("Theatre profile and operating parameters updated successfully.");
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title={profile.name}
        subtitle={`${profile.code} • Established Benchmark Facility`}
        description="Comprehensive facility overview, licensing credentials, contact points, coordinates, and operating schedule for this cinema complex."
        badge={profile.status}
        badgeVariant={profile.status === "Active" ? "success" : "warning"}
        actions={
          <div className="flex items-center gap-2">
            {lifecycleTheatre && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLifecycleModalOpen(true)}
                className="gap-2 border-[#2A3445] text-xs font-semibold text-white hover:border-[#FBBF24]/50"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Governance Profile (v{lifecycleTheatre.version})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="gap-2 border-[#2A3445] text-white hover:border-[#FBBF24]/50"
            >
              <Edit className="h-4 w-4 text-[#FBBF24]" /> Edit Profile
            </Button>
          </div>
        }
      />

      {lifecycleTheatre && (
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <LifecycleStatusBadge status={lifecycleTheatre.status} size="sm" />
            <span className="font-mono text-[#94A3B8]">
              Public ID: <strong className="text-white">{lifecycleTheatre.publicId}</strong> · Slug:{" "}
              <strong className="text-[#FBBF24]">/{lifecycleTheatre.slug}</strong>
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className={lifecycleTheatre.capabilities.allowBookings ? "text-emerald-400" : "text-rose-400"}>
              Bookings: {lifecycleTheatre.capabilities.allowBookings ? "Active" : "Locked"}
            </span>
            <span className={lifecycleTheatre.capabilities.allowPayments ? "text-emerald-400" : "text-rose-400"}>
              Payments: {lifecycleTheatre.capabilities.allowPayments ? "Active" : "Locked"}
            </span>
          </div>
        </div>
      )}

      {feedbackNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Decoupled Theatre Profile Studio (Phase 3 - Part 3) */}
      <LazyTheatreProfileWorkspace
        theatreId="th-pun-001"
        actorRole="THEATRE_ADMIN"
        actorUserId="usr-theatre-1"
        actorName="Rajesh Deshmukh"
        defaultView="overview"
      />

      {/* Banner & Hero Visual */}
      <div className="relative rounded-3xl overflow-hidden border border-[#2A3445] h-64 sm:h-80 w-full bg-[#111827]">
        <Image
          src={profile.bannerImage}
          alt={profile.name}
          fill
          unoptimized
          loading="lazy"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B12] via-transparent to-black/30" />
        <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-[#FBBF24] font-semibold">{profile.tagline}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{profile.name}</h2>
            <p className="text-xs text-[#CBD5E1] flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#FBBF24]" />
              {profile.address}, {profile.city}, {profile.state} - {profile.pinCode}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="solid" size="sm" className="font-bold">
              {profile.hallCount} Laser Screens
            </Badge>
            <Badge variant="outline" size="sm">
              Rating: {profile.rating} / 5.0
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Details & Location */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated" className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#FBBF24]" /> Organization & Identity
              </h3>
              <span className="text-xs font-mono text-[#64748B]">Slug: {profile.slug}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
              <div>
                <span className="text-[#64748B]">Operating Cinema Name</span>
                <p className="font-semibold text-white mt-0.5">{profile.name}</p>
              </div>
              <div>
                <span className="text-[#64748B]">Internal Tenant ID</span>
                <p className="font-mono font-semibold text-white mt-0.5">{profile.id}</p>
              </div>
              <div>
                <span className="text-[#64748B]">Exhibitor Registration Code</span>
                <p className="font-mono font-semibold text-[#FBBF24] mt-0.5">{profile.code}</p>
              </div>
              <div>
                <span className="text-[#64748B]">Operational Status</span>
                <p className="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> {profile.status}
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[#64748B]">Facility Description</span>
                <p className="text-[#CBD5E1] mt-0.5 leading-relaxed">{profile.description}</p>
              </div>
            </div>
          </Card>

          {/* Location & GPS Coordinates */}
          <Card variant="elevated" className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#38BDF8]" /> Geographic Coordinates & Address
              </h3>
              <Badge variant="outline" size="sm" className="font-mono border-[#2A3445]">
                {profile.latitude.toFixed(4)}° N, {profile.longitude.toFixed(4)}° E
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#64748B]">Physical Address</span>
                <p className="font-semibold text-white mt-0.5">{profile.address}</p>
              </div>
              <div>
                <span className="text-[#64748B]">City & State</span>
                <p className="font-semibold text-white mt-0.5">
                  {profile.city}, {profile.state} ({profile.country})
                </p>
              </div>
              <div>
                <span className="text-[#64748B]">PIN / Postal Code</span>
                <p className="font-mono font-semibold text-white mt-0.5">{profile.pinCode}</p>
              </div>
              <div>
                <span className="text-[#64748B]">Operational Timezone</span>
                <p className="font-mono font-semibold text-white mt-0.5">{profile.timezone}</p>
              </div>
            </div>

            {/* Visual Location Map Placeholder */}
            <div className="mt-3 p-4 rounded-2xl bg-[#070B12] border border-[#2A3445] flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#FBBF24]" /> High-Accuracy Cinema Pin
                </span>
                <p className="text-[11px] text-[#94A3B8]">
                  Coordinates used for patron distance calculations and navigation deep-links.
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[#111827] border border-[#2A3445] text-xs font-mono text-[#FBBF24]">
                Lat: {profile.latitude} / Lng: {profile.longitude}
              </div>
            </div>
          </Card>

          {/* Master Amenities Equipped */}
          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#FBBF24]" /> Equipped Amenities & Highlights
            </h3>

            <div className="flex flex-wrap gap-2 pt-1">
              {profile.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-xs text-[#CBD5E1] flex items-center gap-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FBBF24]" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Contact & Operating Hours */}
        <div className="space-y-6">
          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
              <Phone className="h-4 w-4 text-emerald-400" /> Direct Contact Rails
            </h3>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-[#94A3B8] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#64748B]">Guest Helpline</span>
                  <p className="font-semibold text-white">{profile.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-[#94A3B8] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#64748B]">Manager Desk Email</span>
                  <p className="font-semibold text-white">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-4 w-4 text-[#94A3B8] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#64748B]">Multiplex Portal</span>
                  <p className="font-semibold text-[#38BDF8] truncate max-w-[200px]">{profile.website}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#FBBF24]" /> Daily Operating Schedule
            </h3>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-[#2A3445]/60">
                <span className="text-[#CBD5E1]">Box Office Opens</span>
                <span className="font-mono font-bold text-white">{profile.openingTime}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#2A3445]/60">
                <span className="text-[#CBD5E1]">Last Show Cut-off</span>
                <span className="font-mono font-bold text-white">{profile.closingTime}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[#CBD5E1]">Operational Days</span>
                <span className="font-bold text-emerald-400">All 7 Days (365 Days)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#111827] border border-[#2A3445] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-[#FBBF24]" />
                <h3 className="text-lg font-bold text-white">Edit Theatre Profile</h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Theatre Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#FBBF24]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono focus:outline-none focus:border-[#FBBF24]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-medium">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#FBBF24]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-medium">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#FBBF24]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-medium">Physical Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#FBBF24]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#FBBF24]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">State</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#FBBF24]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono focus:outline-none focus:border-[#FBBF24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#FBBF24]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Desk Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#FBBF24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Opening Time</label>
                  <input
                    type="text"
                    value={formData.openingTime}
                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Closing Time</label>
                  <input
                    type="text"
                    value={formData.closingTime}
                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono"
                  />
                </div>
              </div>

              {/* Amenities Multi-Select */}
              <div className="space-y-2 pt-2 border-t border-[#2A3445]">
                <label className="text-[#94A3B8] font-medium">Equipped Amenities (Select from Master List)</label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-[#070B12] border border-[#2A3445]">
                  {availableAmenitiesList.map((am) => {
                    const isSelected = formData.amenities.includes(am);
                    return (
                      <button
                        type="button"
                        key={am}
                        onClick={() => toggleAmenity(am)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                          isSelected
                            ? "bg-[#FBBF24] text-[#070B12] font-bold"
                            : "bg-[#111827] text-[#94A3B8] hover:text-white"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "} {am}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A3445]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditModalOpen(false)}
                  className="border-[#2A3445] text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-[#E50914] text-white font-bold"
                >
                  Save Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lifecycleModalOpen && (
        <LazyCreateEditTheatreModal
          isOpen={lifecycleModalOpen}
          mode="edit"
          initialTheatre={lifecycleTheatre}
          actorRole="THEATRE_ADMIN"
          onClose={() => setLifecycleModalOpen(false)}
          onSaveEdit={handleLifecycleSaveEdit}
        />
      )}
    </div>
  );
}
