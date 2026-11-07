export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    github: string;
    docs: string;
  };
  keywords: string[];
}

export const siteConfig: SiteConfig = {
  name: "CineSphere OS",
  tagline: "The Operating System for Modern Cinemas",
  description:
    "Enterprise-grade Multi-Tenant SaaS platform to orchestrate multiplex chains, 3D hall acoustics, automated scheduling, and omnichannel ticketing.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://cinesphere.io",
  ogImage: "/images/og-image.png",
  links: {
    github: "https://github.com/dipak-pawar-356/cineSphere_OS",
    docs: "https://docs.cinesphere.io",
  },
  keywords: [
    "Cinema Management",
    "Multiplex SaaS",
    "Movie Scheduling",
    "Theatre Operations",
    "Ticketing Architecture",
    "Dolby Atmos",
    "IMAX",
    "Multi-Tenant OS",
  ],
};
