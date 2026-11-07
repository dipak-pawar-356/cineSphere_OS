import React from "react";
import { HERO_STATS } from "@/lib/constants/dashboard-stats";
import { StatCard } from "@/components/ui/stat-card";
import { Building2, Monitor, Ticket, MapPin } from "lucide-react";

const STAT_ICONS = [
  <Building2 key="1" className="h-5 w-5" />,
  <Monitor key="2" className="h-5 w-5" />,
  <Ticket key="3" className="h-5 w-5" />,
  <MapPin key="4" className="h-5 w-5" />,
];

export function StatsStrip() {
  return (
    <section className="py-12 relative border-y border-white/5 bg-[#0B0F19]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {HERO_STATS.map((stat, idx) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              subtext={stat.subtext}
              icon={STAT_ICONS[idx]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
