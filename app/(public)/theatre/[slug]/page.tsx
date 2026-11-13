"use client";

import React, { useState, useMemo, use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCityStore } from "@/store/city-store";
import {
  getAllPublishedTheatres,
  getAllPublishedMovies,
  getAllPublishedShows,
} from "@/lib/engine/customer-discovery-engine";
import { getPublicTheatreMediaAction } from "@/actions/theatre-media-actions";
import { TheatrePublicMediaView } from "@/types/theatre-media.types";
import { getPublicTheatreProfileAction } from "@/actions/theatre-profile-actions";
import { PublicTheatreProfileView } from "@/types/theatre-profile.types";
import { getPublicTheatreLocationAction } from "@/actions/theatre-location-actions";
import { PublicTheatreLocationView } from "@/types/theatre-location.types";
import { getPublicTheatreAmenitiesAction } from "@/actions/theatre-amenity-actions";
import { PublicTheatreAmenityDTO } from "@/types/theatre-amenity.types";
import { getPublicTheatreContactsAction } from "@/actions/theatre-contact-actions";
import { PublicTheatreContactDirectoryBundle } from "@/types/theatre-contact.types";
import { AmenityIconResolver } from "@/components/theatre-amenity/amenity-icon-resolver";
import { SOCIAL_PLATFORM_LABELS, THEATRE_CATEGORY_LABELS } from "@/lib/validation/theatre-profile.validation";
import {
  CustomerTheatreDTO,
  CustomerMovieDTO,
  CustomerShowDTO,
} from "@/types/customer-discovery.types";
import { FormatBadge } from "@/components/badges/format-badge";
import { GalleryPlaceholder } from "@/components/media";
import {
  Building2,
  MapPin,
  Star,
  Monitor,
  CheckCircle2,
  Car,
  Utensils,
  Accessibility,
  Boxes,
  Film,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Ticket,
  Layers,
  ChevronRight,
  ShieldCheck,
  Armchair,
  Navigation,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  Share2,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

export interface TheatreDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function TheatreDetailPage({ params }: TheatreDetailPageProps) {
  const { slug } = use(params);
  const { selectedCity } = useCityStore();

  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [publicMedia, setPublicMedia] = useState<TheatrePublicMediaView | null>(null);
  const [publicProfile, setPublicProfile] = useState<PublicTheatreProfileView | null>(null);
  const [publicLocation, setPublicLocation] = useState<PublicTheatreLocationView | null>(null);
  const [publicAmenities, setPublicAmenities] = useState<PublicTheatreAmenityDTO[]>([]);
  const [publicContacts, setPublicContacts] = useState<PublicTheatreContactDirectoryBundle | null>(null);

  const allTheatres = useMemo(() => getAllPublishedTheatres(), []);
  const allMovies = useMemo(() => getAllPublishedMovies(), []);
  const allShows = useMemo(() => getAllPublishedShows(), []);

  // 1. Resolve Theatre
  const theatre: CustomerTheatreDTO = useMemo(() => {
    return (
      allTheatres.find((t) => t.slug === slug || t.id === slug) ||
      allTheatres[0]
    );
  }, [allTheatres, slug]);

  useEffect(() => {
    let cancelled = false;
    const key = theatre.id || theatre.slug;
    void Promise.all([
      getPublicTheatreMediaAction({ theatreIdOrSlug: key }, { role: "CUSTOMER" }),
      getPublicTheatreProfileAction({ theatreIdOrSlug: key }, { role: "CUSTOMER" }),
      getPublicTheatreLocationAction({ theatreIdOrSlug: key }, { role: "CUSTOMER" }),
      getPublicTheatreAmenitiesAction({ theatreIdOrSlug: key }, { role: "CUSTOMER" }),
      getPublicTheatreContactsAction({ theatreIdOrSlug: key }),
    ]).then(([mediaRes, profileRes, locationRes, amenitiesRes, contactsRes]) => {
      if (cancelled) return;
      if (mediaRes.success && mediaRes.data) {
        setPublicMedia(mediaRes.data);
      }
      if (profileRes.success) {
        setPublicProfile(profileRes.data || null);
      }
      if (locationRes.success) {
        setPublicLocation(locationRes.data || null);
      }
      if (amenitiesRes.success && amenitiesRes.data) {
        setPublicAmenities(amenitiesRes.data);
      }
      if (contactsRes.success && contactsRes.data) {
        setPublicContacts(contactsRes.data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [theatre.id, theatre.slug]);

  // 2. Resolve shows scheduled for this theatre
  const theatreShows: CustomerShowDTO[] = useMemo(() => {
    const directMatches = allShows.filter(
      (s) => s.theatreId === theatre.id || s.theatreName === theatre.name
    );

    if (directMatches.length > 0) {
      return directMatches;
    }

    // Synthesize fallback shows mapped to this theatre and the top published movies
    return allMovies.slice(0, 3).flatMap((m, mIdx) => [
      {
        id: `show-${theatre.slug}-m${mIdx}-1`,
        showCode: `SH-${theatre.slug.toUpperCase()}-1`,
        movieId: m.id,
        movieTitle: m.title,
        moviePosterUrl: m.poster,
        movieBannerUrl: m.banner,
        movieDurationMinutes: m.durationMinutes,
        movieCertificate: m.certification,
        theatreId: theatre.id,
        theatreName: theatre.name,
        theatreCity: theatre.city,
        theatreAddress: theatre.address,
        hallId: "hall-1",
        hallName: "Auditorium 1 - IMAX Laser",
        screenType: "IMAX Laser",
        date: "2026-11-14",
        startTime: "10:30 AM",
        endTime: "01:15 PM",
        language: m.languages[0] || "English",
        format: "IMAX 2D",
        ticketPrice: theatre.startingPrice || 220,
        totalSeats: 100,
        availableSeats: 82,
        seatsBooked: 18,
        status: "Scheduled" as const,
        sectionPricing: {
          Silver: 200,
          Gold: 280,
          Platinum: 380,
          VIP: 550,
        },
      },
      {
        id: `show-${theatre.slug}-m${mIdx}-2`,
        showCode: `SH-${theatre.slug.toUpperCase()}-2`,
        movieId: m.id,
        movieTitle: m.title,
        moviePosterUrl: m.poster,
        movieBannerUrl: m.banner,
        movieDurationMinutes: m.durationMinutes,
        movieCertificate: m.certification,
        theatreId: theatre.id,
        theatreName: theatre.name,
        theatreCity: theatre.city,
        theatreAddress: theatre.address,
        hallId: "hall-2",
        hallName: "Auditorium 2 - Dolby Atmos",
        screenType: "Dolby Cinema",
        date: "2026-11-14",
        startTime: "02:45 PM",
        endTime: "05:30 PM",
        language: m.languages[0] || "English",
        format: "Dolby Atmos",
        ticketPrice: (theatre.startingPrice || 220) + 60,
        totalSeats: 120,
        availableSeats: 94,
        seatsBooked: 26,
        status: "Scheduled" as const,
        sectionPricing: {
          Silver: 240,
          Gold: 320,
          Platinum: 420,
          VIP: 600,
        },
      },
      {
        id: `show-${theatre.slug}-m${mIdx}-3`,
        showCode: `SH-${theatre.slug.toUpperCase()}-3`,
        movieId: m.id,
        movieTitle: m.title,
        moviePosterUrl: m.poster,
        movieBannerUrl: m.banner,
        movieDurationMinutes: m.durationMinutes,
        movieCertificate: m.certification,
        theatreId: theatre.id,
        theatreName: theatre.name,
        theatreCity: theatre.city,
        theatreAddress: theatre.address,
        hallId: "hall-1",
        hallName: "Auditorium 1 - IMAX Laser",
        screenType: "IMAX Laser",
        date: "2026-11-14",
        startTime: "07:15 PM",
        endTime: "10:00 PM",
        language: m.languages[0] || "English",
        format: "IMAX 2D",
        ticketPrice: (theatre.startingPrice || 220) + 80,
        totalSeats: 100,
        availableSeats: 45,
        seatsBooked: 55,
        status: "Scheduled" as const,
        sectionPricing: {
          Silver: 280,
          Gold: 360,
          Platinum: 480,
          VIP: 680,
        },
      },
    ]);
  }, [allShows, allMovies, theatre]);

  // 3. Group shows by Movie
  const moviesWithShows = useMemo(() => {
    const movieMap = new Map<
      string,
      {
        movie: CustomerMovieDTO;
        shows: CustomerShowDTO[];
      }
    >();

    theatreShows.forEach((show) => {
      // Format Filter
      if (
        selectedFormat !== "All" &&
        !show.format.toLowerCase().includes(selectedFormat.toLowerCase())
      ) {
        return;
      }

      if (!movieMap.has(show.movieId)) {
        const foundMovie =
          allMovies.find((m) => m.id === show.movieId || m.title === show.movieTitle) || {
            id: show.movieId,
            slug: show.movieId,
            title: show.movieTitle,
            poster: show.moviePosterUrl,
            banner: show.movieBannerUrl,
            synopsis: "Theatrical presentation running at this complex.",
            genre: ["Action", "Sci-Fi"],
            languages: [show.language as string],
            durationMinutes: show.movieDurationMinutes,
            rating: 9.1,
            certification: show.movieCertificate,
            formats: [show.format as string],
            releaseDate: "2026-11-01",
            status: "Now Showing" as const,
          };

        movieMap.set(show.movieId, {
          movie: foundMovie,
          shows: [],
        });
      }

      movieMap.get(show.movieId)!.shows.push(show);
    });

    return Array.from(movieMap.values());
  }, [theatreShows, allMovies, selectedFormat]);

  // 7-Day Date Tabs Generator
  const dateTabs = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isToday = i === 0;
      const isTomorrow = i === 1;
      const label = isToday
        ? "Today"
        : isTomorrow
        ? "Tomorrow"
        : d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      days.push({
        id: isToday ? "Today" : `Day-${i}`,
        label,
        dayNum,
      });
    }
    return days;
  }, []);

  // Formats available at this theatre
  const availableFormats = useMemo(() => {
    const set = new Set<string>(["All"]);
    theatre.screenTypes.forEach((f) => set.add(f));
    return Array.from(set);
  }, [theatre]);

  // Halls list
  const hallsList = useMemo(() => {
    return [
      {
        id: "hall-1",
        name: "Hall 1 - IMAX Laser",
        screenType: "IMAX Commercial Laser",
        capacity: 100,
        soundSystem: "IMAX 12-Channel High-Dynamic Precision Array",
        projectionType: "IMAX Dual 4K Laser",
        status: "Operational",
      },
      {
        id: "hall-2",
        name: "Hall 2 - Dolby Cinema",
        screenType: "Dolby Cinema",
        capacity: 120,
        soundSystem: "Dolby Atmos 64-Channel Spatial Audio",
        projectionType: "Dolby Vision Dual 4K Laser",
        status: "Operational",
      },
      {
        id: "hall-3",
        name: "Hall 3 - 4DX Dynamic",
        screenType: "4DX Motion Simulator",
        capacity: 80,
        soundSystem: "Dolby 7.1 Surround",
        projectionType: "Christie 4K Digital Laser",
        status: "Operational",
      },
      {
        id: "hall-4",
        name: "Hall 4 - Royal VIP Suite",
        screenType: "VIP Recliner Suite",
        capacity: 48,
        soundSystem: "JBL Master Cinema Audio",
        projectionType: "Barco 4K Laser",
        status: "Operational",
      },
    ].slice(0, theatre.hallCount || 4);
  }, [theatre]);

  return (
    <div className="space-y-10 pb-16">
      {/* 1. TOP BREADCRUMBS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <nav className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-[#64748B]" />
          <Link href="/theatres" className="hover:text-white transition-colors">
            Cinema Complexes
          </Link>
          <ChevronRight className="h-3 w-3 text-[#64748B]" />
          <span className="text-[#FBBF24] font-medium truncate">{theatre.name}</span>
        </nav>
      </div>

      {/* 2. THEATRE HERO BANNER */}
      <div className="relative w-full h-[320px] sm:h-[440px] bg-[#070B12] overflow-hidden">
        <Image
          src={
            publicMedia?.heroImage?.url ||
            publicMedia?.banner?.url ||
            theatre.banner
          }
          alt={publicMedia?.heroImage?.metadata.altText || theatre.name}
          fill
          unoptimized
          priority
          sizes="100vw"
          className="object-cover object-center opacity-45 brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B12] via-[#070B12]/60 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 w-full">
            {/* Logo Avatar */}
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] flex items-center justify-center font-black text-[#070B12] text-2xl shadow-2xl border-4 border-[#070B12] shrink-0 overflow-hidden">
              {publicMedia?.logo?.url || publicProfile?.branding.logo?.url ? (
                <Image
                  src={(publicMedia?.logo?.url || publicProfile?.branding.logo?.url)!}
                  alt={
                    publicMedia?.logo?.metadata.altText ||
                    publicProfile?.branding.logo?.metadata.altText ||
                    `${theatre.name} Logo`
                  }
                  fill
                  unoptimized
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <span>{theatre.chain?.charAt(0) || "C"}</span>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#111827] border border-[#2A3445] text-[#FBBF24]">
                  {publicProfile?.chainName || theatre.chain || "CineSphere Circuit"}
                </span>
                {publicProfile && (
                  <span className="text-xs px-2 py-0.5 rounded bg-[#111827] border border-[#2A3445] text-[#CBD5E1]">
                    {publicProfile.theatreType === "CUSTOM" && publicProfile.customTheatreType
                      ? publicProfile.customTheatreType
                      : THEATRE_CATEGORY_LABELS[publicProfile.theatreType]}
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                  Multi-Tenant Calibrated
                </span>
                <div className="flex items-center gap-1 text-xs text-[#FBBF24] font-bold">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{theatre.rating.toFixed(1)}</span>
                  <span className="text-[#94A3B8] font-normal">
                    ({theatre.reviewsCount || 1200} reviews)
                  </span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {publicProfile?.displayName || theatre.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#CBD5E1]">
                <MapPin className="h-4 w-4 text-[#FBBF24] shrink-0" />
                <span>
                  {publicLocation?.completeAddress ||
                    `${theatre.address}, ${theatre.city}, ${theatre.state}`}
                </span>
                {publicLocation?.landmark && (
                  <span className="text-[#FBBF24] font-medium">
                    (Near {publicLocation.landmark})
                  </span>
                )}
                {publicLocation?.googleMapsUrl && (
                  <a
                    href={publicLocation.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#FBBF24] hover:underline font-semibold ml-1 text-xs"
                    aria-label="View on Google Maps"
                  >
                    <span>Maps</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {publicLocation?.navigationLink && (
                  <a
                    href={publicLocation.navigationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-400 hover:underline font-semibold ml-1.5 text-xs"
                    aria-label="Turn-by-turn directions"
                  >
                    <Navigation className="h-3 w-3" />
                    <span>Directions</span>
                  </a>
                )}
              </div>
            </div>

            {/* Direct Quick Book Action */}
            <div className="pt-2 sm:pt-0 shrink-0">
              <Link href={`/booking/${theatreShows[0]?.id || "show-pun-001"}`}>
                <Button variant="primary" size="md" className="font-bold shadow-lg shadow-amber-400/20 gap-2">
                  <Ticket className="h-4 w-4" /> Book Next Show
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Quick Specs Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
            <div className="text-[10px] text-[#94A3B8] uppercase font-bold">Auditorium Fleet</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5">
              {publicProfile?.screensCount || theatre.hallCount || 4} Screens
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
            <div className="text-[10px] text-[#94A3B8] uppercase font-bold">Flagship Hall</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#FBBF24] mt-0.5">
              {theatre.screenTypes[0] || "IMAX Laser"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
            <div className="text-[10px] text-[#94A3B8] uppercase font-bold">
              {publicProfile ? "Total Seating Capacity" : "Starting Ticket Price"}
            </div>
            <div className="text-xl sm:text-2xl font-mono text-emerald-400 font-bold mt-0.5">
              {publicProfile
                ? `${publicProfile.totalSeatingCapacity} Seats`
                : `₹${theatre.startingPrice || 200}`}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
            <div className="text-[10px] text-[#94A3B8] uppercase font-bold">Active Daily Schedule</div>
            <div className="text-xl sm:text-2xl font-mono text-white font-bold mt-0.5">
              {theatreShows.length} Shows
            </div>
          </div>
        </div>

        {/* Dynamic Decoupled Public Theatre Profile Card */}
        {publicProfile && (
          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            <div className="lg:col-span-2 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-white">About {publicProfile.displayName}</h2>
                {publicProfile.establishedYear && (
                  <span className="px-2 py-0.5 rounded-full bg-[#111827] border border-[#2A3445] font-mono text-[10px] text-[#FBBF24]">
                    Est. {publicProfile.establishedYear}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-[#111827] border border-[#2A3445] font-mono text-[10px] text-[#94A3B8]">
                  /{publicProfile.publicSlug}
                </span>
              </div>
              {publicProfile.tagline && (
                <p className="text-[#FBBF24] font-semibold">{publicProfile.tagline}</p>
              )}
              <p className="text-[#CBD5E1] leading-relaxed">
                {publicProfile.aboutTheatre || publicProfile.fullDescription || publicProfile.shortDescription}
              </p>
              {publicProfile.languages.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[#94A3B8] mr-1">Languages:</span>
                  {publicProfile.languages.map((l) => (
                    <span
                      key={l.id}
                      className={`px-2 py-0.5 rounded-md border text-[10px] font-medium ${
                        l.isPrimary
                          ? "bg-[#FBBF24]/15 border-[#FBBF24]/40 text-[#FBBF24]"
                          : "bg-[#111827] border-[#2A3445] text-[#CBD5E1]"
                      }`}
                    >
                      {l.displayName}
                      {l.isPrimary ? " ★" : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 border-t lg:border-t-0 lg:border-l border-[#2A3445] pt-4 lg:pt-0 lg:pl-6">
              <div>
                <span className="text-[#94A3B8] text-[10px] uppercase font-bold">
                  Venue Classification & Capacity
                </span>
                <p className="text-white font-semibold mt-1">
                  {publicProfile.ownershipModel} · {publicProfile.screensCount} Screens (~
                  {publicProfile.averageCapacityPerScreen} seats/hall)
                </p>
              </div>
              {publicProfile.website && (
                <div>
                  <span className="text-[#94A3B8] text-[10px] uppercase font-bold">Official Website</span>
                  <div>
                    <a
                      href={publicProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#38BDF8] hover:underline font-mono break-all"
                    >
                      {publicProfile.website}
                    </a>
                  </div>
                </div>
              )}
              {publicProfile.socialLinks.length > 0 && (
                <div>
                  <span className="text-[#94A3B8] text-[10px] uppercase font-bold block mb-1.5">
                    Connect With Cinema
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {publicProfile.socialLinks.map((soc) => (
                      <a
                        key={soc.id}
                        href={soc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#2A3445] text-[#CBD5E1] hover:text-[#FBBF24] hover:border-[#FBBF24]/40 transition-colors text-[11px]"
                      >
                        {soc.platform === "CUSTOM"
                          ? soc.customPlatformName
                          : SOCIAL_PLATFORM_LABELS[soc.platform]}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. DATE TABS & FORMAT FILTER STRIP */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A3445] pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#FBBF24]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Select Screening Date:
              </span>
            </div>

            {/* Format Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs text-[#94A3B8] mr-1 hidden sm:inline">Format:</span>
              {availableFormats.map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setSelectedFormat(fmt)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                    selectedFormat === fmt
                      ? "bg-[#FBBF24] text-[#070B12] font-bold"
                      : "bg-[#161F2E] text-[#94A3B8] hover:text-white border border-[#2A3445]"
                  )}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* 7-Day Date Tab Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {dateTabs.map((dt) => {
              const isSelected = selectedDate === dt.id;
              return (
                <button
                  key={dt.id}
                  type="button"
                  onClick={() => setSelectedDate(dt.id)}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[85px] py-2 px-3 rounded-xl border text-center transition-all cursor-pointer shrink-0",
                    isSelected
                      ? "bg-[#FBBF24] text-[#070B12] border-[#FBBF24] shadow-md shadow-[#FBBF24]/20 font-bold"
                      : "bg-[#161F2E] text-[#94A3B8] border-[#2A3445] hover:text-white hover:border-[#38BDF8]"
                  )}
                >
                  <span className="text-[11px] font-bold uppercase">{dt.label}</span>
                  <span className="text-xs font-mono font-semibold">{dt.dayNum}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. MOVIES PLAYING AT THIS THEATRE (JOURNEY 3 CONVERGENCE) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Film className="h-5 w-5 text-[#FBBF24]" />
                <span>Now Screening at {theatre.name}</span>
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Select any scheduled showtime to enter the unified Show seat map.
              </p>
            </div>

            <Badge variant="warning" size="sm" className="font-mono">
              {moviesWithShows.length} Films Running
            </Badge>
          </div>

          {moviesWithShows.length > 0 ? (
            <div className="space-y-6">
              {moviesWithShows.map(({ movie, shows }) => (
                <div
                  key={movie.id}
                  className="rounded-3xl bg-[#161F2E] border border-[#2A3445] p-5 sm:p-6 space-y-5 shadow-xl hover:border-[#2A3445]/90 transition-all"
                >
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {/* Movie Poster */}
                    <Link
                      href={`/movie/${movie.slug}`}
                      className="relative h-36 w-24 sm:h-44 sm:w-30 rounded-xl overflow-hidden shrink-0 border border-[#2A3445] shadow-lg group block"
                    >
                      <Image
                        src={movie.poster}
                        alt={movie.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Movie Metadata & Showtimes */}
                    <div className="space-y-4 flex-1 min-w-0">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                            {movie.certification}
                          </span>
                          <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                            <Clock className="h-3 w-3 text-[#FBBF24]" />
                            {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m
                          </span>
                          <span className="text-xs text-[#94A3B8]">•</span>
                          <span className="text-xs text-[#94A3B8]">
                            {movie.languages.join(", ")}
                          </span>
                        </div>

                        <Link href={`/movie/${movie.slug}`}>
                          <h3 className="text-lg sm:text-xl font-bold text-white hover:text-[#FBBF24] transition-colors leading-snug">
                            {movie.title}
                          </h3>
                        </Link>

                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {movie.genre.map((g) => (
                            <span
                              key={g}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-[#111827] text-[#94A3B8] border border-[#2A3445]"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Showtime Pills for this Movie */}
                      <div className="space-y-2 pt-2 border-t border-[#2A3445]/60">
                        <div className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider font-semibold">
                          Available Showtimes:
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {shows.map((show) => {
                            const isAlmostFull = show.availableSeats < 25;
                            return (
                              <Link
                                key={show.id}
                                href={`/booking/${show.id}`}
                                className="group/btn p-3 rounded-xl bg-[#111827] border border-[#2A3445] hover:border-[#FBBF24] transition-all flex flex-col justify-between space-y-1.5 hover:shadow-lg hover:shadow-amber-400/5 cursor-pointer"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-sm font-bold text-white group-hover/btn:text-[#FBBF24] transition-colors">
                                    {show.startTime}
                                  </span>
                                  <FormatBadge format={show.format} size="xs" />
                                </div>

                                <div className="text-[10px] text-[#94A3B8] truncate">
                                  {show.hallName}
                                </div>

                                <div className="flex items-center justify-between pt-1 border-t border-[#1E293B] text-[10px]">
                                  <span className="font-mono font-bold text-amber-400">
                                    ₹{show.ticketPrice}
                                  </span>
                                  <span
                                    className={cn(
                                      "px-1.5 py-0.5 rounded text-[9px] font-semibold",
                                      isAlmostFull
                                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    )}
                                  >
                                    {isAlmostFull ? "Filling Fast" : "Available"}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[#111827] border border-[#2A3445] space-y-2">
              <Film className="h-8 w-8 text-[#64748B] mx-auto" />
              <h3 className="text-base font-bold text-white">No shows matching filter</h3>
              <p className="text-xs text-[#94A3B8]">
                Try selecting &quot;All&quot; formats or picking another date.
              </p>
            </div>
          )}
        </div>

        {/* 6. AUDITORIUM / HALL FLEET BREAKDOWN */}
        <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Monitor className="h-5 w-5 text-[#38BDF8]" />
              <span>Auditorium Fleet & Projection Systems</span>
            </h3>
            <span className="text-xs font-mono text-[#94A3B8]">
              {hallsList.length} Active Screens
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hallsList.map((hall) => (
              <div
                key={hall.id}
                className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <span>{hall.name}</span>
                    <Badge variant="primary" size="sm">
                      {hall.screenType}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">
                    Capacity: {hall.capacity} Seats • {hall.soundSystem}
                  </div>
                  <div className="text-[10px] text-[#64748B]">
                    Projection: {hall.projectionType}
                  </div>
                </div>

                <span
                  className="h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0"
                  title="Screen Operational"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 7. AMENITIES: FOOD COURT, PARKING, ACCESSIBILITY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
              <Utensils className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-base">Gourmet Food Court</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Artisan cinema dining, craft appetizers, gourmet flavored popcorn, and seat-level waiter delivery available across all auditoriums.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#38BDF8]">
              <Car className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-base">Parking & Valet</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Dedicated multiplex parking structure with EV fast charging bays, 4-hour ticket validation, and executive valet drop-off at entrance.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-emerald-400">
              <Accessibility className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-base">Accessibility Services</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Elevator access to all tiers, wheelchair companion spaces, Dolby Fidelio closed-caption devices, and assistive audio receivers.
            </p>
          </div>
        </div>

        {/* 7b. LOCATION, ADDRESS & NAVIGATION (Phase 3 Part 4) */}
        <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#FBBF24]" />
              <span>Location, Directions & Navigation</span>
            </h3>
            {publicLocation && (
              <span className="text-xs font-mono text-[#94A3B8]">
                {publicLocation.city}, {publicLocation.state} • PIN {publicLocation.postalCode}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  Complete Multiplex Address
                </div>
                <p className="text-sm text-white font-medium leading-relaxed">
                  {publicLocation?.completeAddress ||
                    publicLocation?.formattedAddress ||
                    `${theatre.address}, ${theatre.city}, ${theatre.state}`}
                </p>
                {publicLocation?.landmark && (
                  <p className="text-xs text-[#FBBF24]">
                    <span className="font-semibold">Prominent Landmark:</span> Near {publicLocation.landmark}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#94A3B8]">
                <span>
                  Jurisdiction: <strong className="text-white">{publicLocation?.state || theatre.state}, {publicLocation?.country || "India"}</strong>
                </span>
                {publicLocation?.coordinates && (
                  <span className="font-mono text-[#CBD5E1]">
                    ({publicLocation.coordinates.latitude.toFixed(4)}° N, {publicLocation.coordinates.longitude.toFixed(4)}° E)
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
                  Access synchronized Google Maps routing and navigation directions directly on your smartphone.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {publicLocation?.googleMapsUrl ? (
                  <a
                    href={publicLocation.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-xs font-bold text-white transition-colors border border-[#334155]"
                  >
                    <MapPin className="h-4 w-4 text-rose-400" />
                    <span>Open in Google Maps</span>
                    <ExternalLink className="h-3 w-3 text-[#94A3B8]" />
                  </a>
                ) : (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${theatre.name} ${theatre.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-xs font-bold text-white transition-colors border border-[#334155]"
                  >
                    <MapPin className="h-4 w-4 text-rose-400" />
                    <span>Open in Google Maps</span>
                    <ExternalLink className="h-3 w-3 text-[#94A3B8]" />
                  </a>
                )}

                {publicLocation?.navigationLink && (
                  <a
                    href={publicLocation.navigationLink}
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

        {/* 7b. DYNAMIC AMENITIES, ACOUSTICS & GUEST FACILITIES (Phase 3 Part 5) */}
        {publicAmenities.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#FBBF24]" />
                <span>Amenities, Comfort & Guest Facilities</span>
              </h3>
              <span className="text-xs font-mono text-[#94A3B8]">
                {publicAmenities.length} Verified Facilities
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicAmenities.map((am) => (
                <div
                  key={am.assignmentId}
                  className="p-5 rounded-2xl bg-[#111827] border border-[#2A3445] flex items-start gap-4 hover:border-zinc-700 transition-all"
                >
                  <div className="h-10 w-10 rounded-xl bg-[#161F2E] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] shrink-0">
                    <AmenityIconResolver iconName={am.icon} className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{am.displayName}</h4>
                      {am.isFeatured && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
                          ★ Featured
                        </span>
                      )}
                    </div>
                    <span className="inline-block text-[10px] text-[#38BDF8] font-semibold uppercase tracking-wider">
                      {am.category}
                    </span>
                    {am.description && (
                      <p className="text-xs text-[#94A3B8] line-clamp-2">{am.description}</p>
                    )}
                    {am.notes && (
                      <p className="text-[11px] text-[#FBBF24] font-medium pt-0.5">
                        📍 {am.notes}
                      </p>
                    )}
                    {am.metadata && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-zinc-400">
                        {am.metadata.parkingCapacity && (
                          <span className="bg-[#0B1220] px-1.5 py-0.5 rounded border border-[#1E293B]">
                            {am.metadata.parkingCapacity} Bays
                          </span>
                        )}
                        {am.metadata.evChargerCount && (
                          <span className="bg-[#0B1220] px-1.5 py-0.5 rounded border border-[#1E293B] text-emerald-400">
                            {am.metadata.evChargerCount} EV Fast Chargers
                          </span>
                        )}
                        {am.metadata.wifiSsid && (
                          <span className="bg-[#0B1220] px-1.5 py-0.5 rounded border border-[#1E293B] text-sky-400">
                            Wi-Fi: {am.metadata.wifiSsid}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. VENUE GALLERY & FUTURE WALKTHROUGH PREVIEWS */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#FBBF24]" />
              <span>Venue Gallery & Architectural Showcase</span>
            </h3>
            {publicMedia?.gallery && publicMedia.gallery.length > 0 && (
              <span className="text-xs font-mono text-[#94A3B8]">
                {publicMedia.gallery.length} Active Photos
              </span>
            )}
          </div>

          {publicMedia?.gallery && publicMedia.gallery.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {publicMedia.gallery.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-2xl bg-[#111827] border border-[#2A3445] overflow-hidden group hover:border-[#FBBF24]/50 transition-colors"
                >
                  <div className="relative h-44 w-full bg-[#070B12] overflow-hidden">
                    <Image
                      src={photo.url}
                      alt={photo.metadata.altText || photo.title}
                      fill
                      unoptimized
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 space-y-0.5">
                    <h4 className="text-xs font-bold text-white truncate">{photo.title}</h4>
                    {photo.metadata.caption && (
                      <p className="text-[11px] text-[#94A3B8] truncate">{photo.metadata.caption}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <GalleryPlaceholder count={4} />
          )}

          {/* Prepared Banner & Cover Highlight + Future Video Tour Strip */}
          {publicMedia && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {publicMedia.coverImage && (
                <div className="rounded-2xl bg-[#111827] border border-[#2A3445] p-3 flex items-center gap-3">
                  <div className="relative h-14 w-20 rounded-xl overflow-hidden bg-[#070B12] shrink-0">
                    <Image
                      src={publicMedia.coverImage.url}
                      alt={publicMedia.coverImage.metadata.altText}
                      fill
                      unoptimized
                      loading="lazy"
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono text-[#FBBF24] uppercase font-bold">Venue Cover Showcase</div>
                    <div className="text-xs font-bold text-white truncate">{publicMedia.coverImage.title}</div>
                  </div>
                </div>
              )}

              {publicMedia.futureVideoPlaceholders.slice(0, 2).map((stub) => (
                <div
                  key={stub.subtype}
                  className="rounded-2xl bg-[#111827]/70 border border-dashed border-[#2A3445] p-3 flex flex-col justify-center space-y-1"
                >
                  <div className="text-[10px] font-mono text-[#38BDF8] uppercase font-bold">
                    Future Video Slot ({stub.aspectRatio})
                  </div>
                  <div className="text-xs font-bold text-white truncate">{stub.label}</div>
                  <div className="text-[10px] text-[#94A3B8] truncate">{stub.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 9. OFFICIAL CONTACT DIRECTORY & SUPPORT CHANNELS (Phase 3 Part 6) */}
        {publicContacts && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Phone className="h-5 w-5 text-emerald-400" />
                <span>Official Contact Directory & Response Desks</span>
              </h3>
              <span className="text-xs font-mono text-[#94A3B8]">
                {publicContacts.allPublicContacts.length} Verified Channels
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Primary Voice Desk */}
              {publicContacts.primaryPhone && (
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
                    <h4 className="text-sm font-bold text-white">{publicContacts.primaryPhone.title}</h4>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      {publicContacts.primaryPhone.businessHours || "Standard Business Hours"}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between">
                    <span className="font-mono text-sm text-zinc-100 font-semibold">
                      {publicContacts.primaryPhone.phone?.formattedPhone}
                    </span>
                    <a
                      href={`tel:${publicContacts.primaryPhone.phone?.countryCode}${publicContacts.primaryPhone.phone?.phoneNumber}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                    >
                      <span>Call Now</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Guest Support Email */}
              {publicContacts.supportEmail && (
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
                    <h4 className="text-sm font-bold text-white">{publicContacts.supportEmail.title}</h4>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      {publicContacts.supportEmail.email?.department || "Patron Assistance Desk"}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between">
                    <span className="font-mono text-xs text-zinc-300 truncate max-w-[170px]">
                      {publicContacts.supportEmail.email?.email}
                    </span>
                    <a
                      href={`mailto:${publicContacts.supportEmail.email?.email}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-colors"
                    >
                      <span>Send Mail</span>
                    </a>
                  </div>
                </div>
              )}

              {/* 24/7 Emergency Desk */}
              {publicContacts.emergencyDesk && (
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
                    <h4 className="text-sm font-bold text-white">{publicContacts.emergencyDesk.title}</h4>
                    <p className="text-xs text-rose-300/80 mt-0.5">
                      Officer: {publicContacts.emergencyDesk.emergencyContact?.contactPersonName} (
                      {publicContacts.emergencyDesk.emergencyContact?.roleOrDesignation})
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between">
                    <span className="font-mono text-xs text-zinc-200 font-semibold">
                      {publicContacts.emergencyDesk.emergencyContact?.primaryPhone}
                    </span>
                    <a
                      href={`tel:${publicContacts.emergencyDesk.emergencyContact?.primaryPhone}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors"
                    >
                      <span>Emergency Call</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Duty Manager Contact */}
              {publicContacts.dutyManager && (
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
                      {publicContacts.dutyManager.managerContact?.managerName}
                    </h4>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      {publicContacts.dutyManager.managerContact?.designation} • {publicContacts.dutyManager.managerContact?.department}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs">
                    <span className="font-mono text-zinc-300">
                      {publicContacts.dutyManager.managerContact?.phone}
                    </span>
                    <a
                      href={`mailto:${publicContacts.dutyManager.managerContact?.email}`}
                      className="text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>Direct Mail</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Official Website */}
              {publicContacts.officialWebsite && (
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
                    <h4 className="text-sm font-bold text-white">{publicContacts.officialWebsite.title}</h4>
                    <p className="text-xs text-[#94A3B8] mt-0.5 truncate">
                      {publicContacts.officialWebsite.website?.url}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#1E293B] flex justify-end">
                    <a
                      href={publicContacts.officialWebsite.website?.url}
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
              {publicContacts.socialLinks.length > 0 && (
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
                    <h4 className="text-sm font-bold text-white">Social Media & Communities</h4>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Connect with CineSphere on official platforms
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#1E293B] flex flex-wrap items-center gap-2">
                    {publicContacts.socialLinks.map((soc) => (
                      <a
                        key={soc.id}
                        href={soc.socialLink?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                      >
                        <span className="font-medium text-[11px]">{soc.socialLink?.platform}</span>
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
