import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Compass,
  Shield,
  Layers,
  Sparkles,
  Award,
  Users,
  Target,
  Eye,
  CheckCircle2,
  Clock,
  Film,
  Boxes,
} from "lucide-react";

export const metadata = {
  title: "About Us | CineSphere OS",
  description: "The platform story, mission, and architecture behind CineSphere OS.",
};

const CORE_VALUES = [
  {
    icon: Sparkles,
    title: "Cinematic Fidelity First",
    desc: "We build for pure theatrical immersion. Whether calibrating laser throw geometry or 128-channel Dolby Atmos audio curves, quality is uncompromising.",
  },
  {
    icon: Shield,
    title: "Exhibitor Sovereignty",
    desc: "Every cinema circuit owns its patron data, custom pricing models, and private tenant encryption keys with zero platform vendor lock-in.",
  },
  {
    icon: Compass,
    title: "Sub-Second Engineering",
    desc: "Zero-latency seat locks and offline-first POS scanner caches guarantee that opening-night blockbuster ticket rushes process flawlessly.",
  },
  {
    icon: Users,
    title: "Patron Hospitality",
    desc: "From effortless Apple Wallet passes to gourmet seat-level dining delivery, every interaction feels bespoke and premium.",
  },
];

const TIMELINE = [
  { year: "2024", title: "Architecture Blueprint", desc: "Formed by seasoned cinema engineers and SaaS architects to replace fragmented legacy box office systems with a unified cloud-native OS." },
  { year: "2025", title: "Circuit Alpha & Hardware Lab", desc: "Validated real-time laser projector SNMP telemetry across 12 flagship IMAX and Dolby Atmos auditoriums with sub-10ms response times." },
  { year: "2026", title: "Multi-Tenant Enterprise Launch", desc: "Phase 1 architecture release supporting 150+ multiplexes, 650+ screens, multi-currency revenue settlements, and floor usher terminals." },
  { year: "2027", title: "Spatial 3D & Global Expansion", desc: "Rollout of interactive WebGL 3D auditorium seat previews, predictive yield modeling, and international festival distribution networks." },
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Header */}
      <PageHeader
        title="The Operating System for Modern Cinemas"
        subtitle="Platform Story, Mission & Architectural Vision"
        description="CineSphere OS is an enterprise-grade multi-tenant platform engineered to orchestrate cinema chains, 3D hall acoustics, automated scheduling, and omnichannel ticketing worldwide."
        badge="Enterprise Story"
        badgeVariant="primary"
      />

      {/* 1. PLATFORM STORY & MISSION / VISION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FBBF24]">
              Our Genesis
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Why We Built CineSphere OS
            </h2>
            <p className="text-sm text-[#CBD5E1] leading-relaxed">
              For decades, movie theatres operated on fragmented, on-premises legacy software designed in the 1990s. Box office terminals frequently disconnected during blockbuster rushes, distributor royalty reconciliations took weeks of manual spreadsheets, and patrons suffered clunky booking interfaces.
            </p>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              CineSphere OS was founded with a singular purpose: to treat the modern cinema multiplex as a high-precision, mission-critical computing environment. We combined cloud-native multi-tenancy, real-time hardware telemetry, and consumer-grade luxury design into one unified operating system.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#161F2E] border border-[#2A3445] space-y-1">
              <div className="text-xs font-bold text-[#FBBF24] flex items-center gap-1.5">
                <Target className="h-4 w-4" /> Mission
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Empower cinema operators worldwide with frictionless, resilient, and beautifully designed management infrastructure.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#161F2E] border border-[#2A3445] space-y-1">
              <div className="text-xs font-bold text-[#38BDF8] flex items-center gap-1.5">
                <Eye className="h-4 w-4" /> Vision
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Become the global software standard powering every projector, speaker, and ticket turnstile across modern entertainment circuits.
              </p>
            </div>
          </div>
        </div>

        {/* Illustration Canvas Placeholder */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#161F2E] to-[#111827] border border-[#2A3445] p-8 text-center space-y-6 shadow-2xl">
          <div className="h-20 w-20 rounded-2xl bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mx-auto shadow-xl">
            <Boxes className="h-10 w-10 stroke-[1.4]" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Cloud-Native Cinema Infrastructure
            </h3>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
              Decoupled micro-services handling seat locks, offline turnstile verifications, and Christie/Barco laser hardware handshakes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left pt-2 border-t border-[#2A3445]/60 text-xs">
            <div className="p-3 rounded-lg bg-[#070B12]/60 border border-[#2A3445]">
              <div className="text-[10px] text-[#94A3B8] uppercase">Latency</div>
              <div className="font-mono font-bold text-emerald-400 mt-0.5">&lt; 18ms Edge</div>
            </div>
            <div className="p-3 rounded-lg bg-[#070B12]/60 border border-[#2A3445]">
              <div className="text-[10px] text-[#94A3B8] uppercase">Throughput</div>
              <div className="font-mono font-bold text-[#FBBF24] mt-0.5">250K / sec</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CORE VALUES */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Our Architectural Core Values
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            The foundational principles that guide every feature and interface decision we make.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CORE_VALUES.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3 hover:border-[#FBBF24]/40 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white text-base">{val.title}</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{val.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. PLATFORM TIMELINE */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Evolution & Milestones
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            From initial research and laser projection protocols to global circuit deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {TIMELINE.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3 relative overflow-hidden"
            >
              <div className="text-3xl font-extrabold font-mono text-[#FBBF24] tracking-tight">
                {item.year}
              </div>
              <h3 className="font-bold text-white text-sm">{item.title}</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
