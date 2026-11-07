import React from "react";
import { PLATFORM_FEATURES } from "@/lib/constants/features";
import { FeatureCard } from "@/components/ui/feature-card";
import { SectionHeading } from "@/components/ui/section-heading";

export function PlatformFeaturesSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-amber-400/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          align="center"
          badge="Enterprise Architecture"
          title="Engineered for Modern Cinema Operations"
          subtitle="Everything required to orchestrate multi-city cinema circuits, predict ticket demand, and deliver unforgettable audience experiences."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
          {PLATFORM_FEATURES.map((feature) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              tagline={feature.tagline}
              iconName={feature.iconName}
              badge={feature.badge}
              metric={feature.metric}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
