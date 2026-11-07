import React from "react";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { DUMMY_THEATRES } from "@/lib/constants/theatres";
import { TheatreCard } from "@/components/cards/theatre-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";

export function PopularTheatresSection() {
  const popularTheatres = DUMMY_THEATRES.filter((t) => t.isFeatured).slice(0, 4);

  return (
    <section className="py-20 relative bg-[#090E17]/60 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Signature Venues"
          title="Popular Luxury Multiplexes"
          subtitle="Flagship entertainment complexes equipped with laser projection, bespoke leather recliners, and gourmet concessions."
          action={
            <Link href="/theatres">
              <Button variant="outline" size="sm" className="group">
                <span>Explore All 8 Theatres</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularTheatres.map((theatre) => (
            <TheatreCard key={theatre.id} theatre={theatre} />
          ))}
        </div>
      </div>
    </section>
  );
}
