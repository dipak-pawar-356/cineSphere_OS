import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Film,
  Building2,
  Layers,
  Shield,
  Zap,
  TrendingUp,
  Ticket,
  Users,
  Compass,
  CheckCircle2,
  Calendar,
  Star,
  Quote,
  ChevronRight,
  Mail,
  Send,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { MovieCard } from "@/components/cards/movie-card";
import { TheatreCard } from "@/components/cards/theatre-card";
import { EventCard } from "@/components/cards/event-card";
import { FeatureCard } from "@/components/ui/feature-card";
import { DUMMY_MOVIES } from "@/lib/constants/movies";
import { DUMMY_THEATRES } from "@/lib/constants/theatres";
import { DUMMY_EVENTS } from "@/lib/constants/events";
import { DUMMY_FEATURES } from "@/lib/constants/features";
import { DUMMY_TESTIMONIALS } from "@/lib/constants/testimonials";
import { DUMMY_PARTNERS } from "@/lib/constants/partners";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "CineSphere OS — The Operating System for Modern Cinemas",
  description:
    "An enterprise multi-tenant platform to orchestrate multiplex circuits, 3D hall acoustics, automated scheduling, and omnichannel ticketing worldwide.",
};

export default function HomePage() {
  const featuredMovies = DUMMY_MOVIES.slice(0, 8);
  const popularTheatres = DUMMY_THEATRES.slice(0, 6);
  const upcomingEvents = DUMMY_EVENTS.slice(0, 4);

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28 pb-12 overflow-hidden">
        {/* Ambient Cinema Lighting Effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[400px] bg-gradient-to-b from-[#FBBF24]/10 via-[#2563EB]/10 to-transparent rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Top Architectural Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111827] border border-[#2A3445] shadow-lg animate-in fade-in-0 slide-in-from-top-4 duration-500">
            <span className="h-2 w-2 rounded-full bg-[#FBBF24] animate-pulse" />
            <span className="text-xs font-semibold text-[#CBD5E1]">
              Enterprise Cinema Orchestration Platform
            </span>
            <span className="text-[#64748B]">•</span>
            <span className="text-[#FBBF24] text-xs font-mono font-bold">
              v1.2 Architecture
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#F9FAFB] tracking-tight leading-[1.1]">
              The Operating System for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#FACC15] to-[#F59E0B]">
                Modern Cinemas
              </span>
            </h1>

            <p className="text-base sm:text-xl text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
              One unified platform to orchestrate multiplex chains, 3D auditorium acoustics, automated showtime scheduling, and omnichannel ticketing worldwide.
            </p>
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href={ROUTES.PUBLIC.MOVIES}>
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto gap-2 font-bold shadow-xl shadow-[#FBBF24]/20"
              >
                <Film className="h-4 w-4" />
                <span>Explore Movies</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href={ROUTES.PUBLIC.THEATRES}>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto gap-2 font-semibold"
              >
                <Building2 className="h-4 w-4 text-[#FBBF24]" />
                <span>Find Theatres</span>
              </Button>
            </Link>
          </div>

          {/* Hero Illustration & Future 3D Canvas Placeholder */}
          <div className="pt-10 max-w-5xl mx-auto">
            <div className="relative rounded-3xl bg-gradient-to-b from-[#161F2E] to-[#111827] border border-[#2A3445] p-3 sm:p-5 shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden group">
              {/* Fake 3D Projection Canvas Frame */}
              <div className="relative aspect-video w-full rounded-2xl bg-[#070B12] border border-[#2A3445]/60 overflow-hidden flex flex-col items-center justify-center text-center p-6">
                {/* Cinema Screen Light Arc */}
                <div className="absolute top-0 inset-x-8 h-2 rounded-b-full bg-gradient-to-r from-transparent via-[#FBBF24] to-transparent shadow-[0_0_50px_rgba(251,191,36,0.6)]" />

                {/* Center 3D Engine Preview Placeholder */}
                <div className="space-y-4 relative z-10 max-w-md">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mx-auto shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    <Boxes className="h-8 w-8 sm:h-10 sm:w-10 stroke-[1.4]" />
                  </div>

                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161F2E] border border-[#2A3445] text-xs font-mono text-[#FBBF24]">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>WebGL 3D Engine Preview</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Spatial 3D Auditorium Visualizer
                    </h3>
                    <p className="text-xs sm:text-sm text-[#94A3B8]">
                      Interactive 3D hall preview, Dolby Atmos speaker arrays, and seat sightline simulation launching in Phase 2.
                    </p>
                  </div>
                </div>

                {/* Bottom Frame Telemetry Bar */}
                <div className="absolute bottom-3 inset-x-4 flex items-center justify-between text-[11px] text-[#64748B] font-mono border-t border-[#2A3445]/60 pt-2">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    4K Christie Pure Laser Pipeline
                  </span>
                  <span className="hidden sm:inline">60 FPS Hardware Render Ready</span>
                  <span className="text-[#CBD5E1]">128-Ch Dolby Atmos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] text-center space-y-1 hover:border-[#FBBF24]/40 transition-colors">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#FBBF24]">150+</div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Theatres Circuit</div>
            <p className="text-[11px] text-[#94A3B8]">Connected Multiplexes</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] text-center space-y-1 hover:border-[#FBBF24]/40 transition-colors">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">650+</div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Auditoriums</div>
            <p className="text-[11px] text-[#94A3B8]">IMAX, 4DX, ScreenX</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] text-center space-y-1 hover:border-[#FBBF24]/40 transition-colors">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">50+</div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Metro Cities</div>
            <p className="text-[11px] text-[#94A3B8]">Global Entertainment Hubs</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] text-center space-y-1 hover:border-[#FBBF24]/40 transition-colors">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#38BDF8]">250K+</div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Bookings / Month</div>
            <p className="text-[11px] text-[#94A3B8]">Zero-Latency Ticketing</p>
          </div>

          <div className="col-span-2 lg:col-span-1 p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] text-center space-y-1 hover:border-[#FBBF24]/40 transition-colors">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">98%</div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Satisfaction</div>
            <p className="text-[11px] text-[#94A3B8]">Audited Patron Reviews</p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED MOVIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <SectionHeading
            badge="Now Showing & Premieres"
            title="Featured Theatrical Releases"
            subtitle="Curated blockbuster films screening across calibrated IMAX, Dolby Atmos, and 4DX screens."
          />
          <Link href={ROUTES.PUBLIC.MOVIES} className="shrink-0">
            <Button variant="outline" size="sm" className="gap-2">
              <span>View All Movies</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* 4. POPULAR THEATRES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <SectionHeading
            badge="Premium Auditoriums"
            title="Popular Cinema Complexes"
            subtitle="Explore world-class exhibition venues equipped with luxury recliner seating and gourmet dining."
          />
          <Link href={ROUTES.PUBLIC.THEATRES} className="shrink-0">
            <Button variant="outline" size="sm" className="gap-2">
              <span>View All Theatres</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Theatres Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularTheatres.map((theatre) => (
            <TheatreCard key={theatre.id} theatre={theatre} />
          ))}
        </div>
      </section>

      {/* 5. PLATFORM FEATURES (ENTERPRISE CAPABILITIES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="sm">
            Complete Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F9FAFB] tracking-tight">
            Engineered for Cinema Circuit Scale
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            Every module from laser projector telemetry to digital ticket scanners is integrated into a unified multi-tenant SaaS cloud.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DUMMY_FEATURES.map((feature) => (
            <FeatureCard key={feature.id} {...feature} />
          ))}
        </div>
      </section>

      {/* 6. UPCOMING EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <SectionHeading
            badge="Live Theatrical Simulcasts"
            title="Premieres, Concerts & Live Sports"
            subtitle="Experience global stadium events, Broadway musicals, and orchestra tributes on the big screen."
          />
          <Link href={ROUTES.PUBLIC.EVENTS} className="shrink-0">
            <Button variant="outline" size="sm" className="gap-2">
              <span>Explore Events</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* 7. WHY CHOOSE CINESPHERE OS (TIMELINE / ADVANTAGES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="success" size="sm">
            Circuit Advantage
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F9FAFB] tracking-tight">
            Why Operators Choose CineSphere OS
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8]">
            Traditional box office software is fragmented and legacy-bound. CineSphere OS delivers cloud-native velocity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">Sub-Second Velocity</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Handle sudden premiere ticket drops with edge-cached seat locks and 200,000 req/sec resilience.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">SOC 2 & PCI-DSS</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Hardware FIDO2 verification, dynamic QR admission passes, and cryptographic audit ledgers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#38BDF8]">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">Multi-Tenant Scale</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Complete data boundary partitioning between cinema chains with custom exhibitor branding.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#F59E0B]">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">Cloud & Edge Ready</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Offline-first POS scanner fallback keeps doors open even during temporary internet blackouts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#EF4444]">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">Enterprise SLA</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Dedicated 24/7 technical circuit monitoring with 99.99% contractual uptime guarantees.
            </p>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="sm">
            Circuit Endorsements
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F9FAFB] tracking-tight">
            Trusted by World-Class Exhibitors
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8]">
            Hear how theatre operators and patrons experience the next evolution of cinema software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DUMMY_TESTIMONIALS.map((review) => (
            <div
              key={review.id}
              className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col justify-between space-y-4 hover:border-[#FBBF24]/40 transition-colors"
            >
              <div className="space-y-3">
                {/* Star rating */}
                <div className="flex items-center gap-1 text-[#FBBF24]">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed italic">
                  &ldquo;{review.content}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#2A3445]/60 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="h-10 w-10 rounded-full object-cover border border-[#2A3445]"
                />
                <div>
                  <div className="font-bold text-white text-xs">{review.name}</div>
                  <div className="text-[11px] text-[#94A3B8]">{review.role}</div>
                  <div className="text-[10px] text-[#FBBF24] font-mono">{review.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. INDUSTRY PARTNERS (10 LOGOS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase font-bold tracking-widest text-[#94A3B8]">
            Industry Technology & Studio Standard Integrations
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {DUMMY_PARTNERS.map((partner) => (
            <div
              key={partner.id}
              className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] flex flex-col items-center justify-center text-center space-y-1 hover:border-[#FBBF24]/50 transition-colors"
            >
              <div className="font-black text-sm text-white tracking-wider font-mono">
                {partner.logoText}
              </div>
              <div className="text-[10px] text-[#94A3B8] truncate w-full">
                {partner.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. NEWSLETTER & ADVANCE DROP SIGNUP */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#161F2E] via-[#111827] to-[#161F2E] border border-[#2A3445] p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="h-14 w-14 rounded-2xl bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mx-auto shadow-lg">
            <Mail className="h-7 w-7" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Get Notified for Advance Ticket Drops
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8]">
              Be the first to secure prime center-seat IMAX tickets for midnight blockbusters and film festival premieres.
            </p>
          </div>

          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Enter your email address..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
              disabled
            />
            <Button variant="primary" size="sm" disabled className="gap-2 shrink-0">
              <span>Subscribe</span>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>

          <p className="text-[10px] text-[#64748B]">
            Zero spam. Unsubscribe at any time. Protected by CineSphere Privacy Shield.
          </p>
        </div>
      </section>
    </div>
  );
}
