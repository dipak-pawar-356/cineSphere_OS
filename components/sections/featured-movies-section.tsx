import React from "react";
import Link from "next/link";
import { ArrowRight, Film } from "lucide-react";
import { DUMMY_MOVIES } from "@/lib/constants/movies";
import { MovieCard } from "@/components/cards/movie-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";

export function FeaturedMoviesSection() {
  const featuredMovies = DUMMY_MOVIES.filter((m) => m.isFeatured).slice(0, 4);

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Now Showing"
          title="Featured Blockbusters & Premieres"
          subtitle="Explore the latest IMAX, 4DX and Dolby Atmos theatrical releases playing across our nationwide cinema network."
          action={
            <Link href="/movies">
              <Button variant="outline" size="sm" className="group">
                <span>View All 10 Movies</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          }
        />

        {/* Horizontal Cards Layout as requested */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featuredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} variant="horizontal" />
          ))}
        </div>
      </div>
    </section>
  );
}
