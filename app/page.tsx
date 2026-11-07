import React from "react";
import { HeroSection } from "@/components/sections/hero-section";
import { StatsStrip } from "@/components/sections/stats-strip";
import { FeaturedMoviesSection } from "@/components/sections/featured-movies-section";
import { PopularTheatresSection } from "@/components/sections/popular-theatres-section";
import { PlatformFeaturesSection } from "@/components/sections/platform-features-section";
import { UpcomingEventsSection } from "@/components/sections/upcoming-events-section";
import { CtaBannerSection } from "@/components/sections/cta-banner-section";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <StatsStrip />
      <FeaturedMoviesSection />
      <PopularTheatresSection />
      <PlatformFeaturesSection />
      <UpcomingEventsSection />
      <CtaBannerSection />
    </div>
  );
}
