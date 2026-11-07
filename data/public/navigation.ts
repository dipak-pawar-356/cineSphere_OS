import { NavigationItem, NavigationSection } from "@/types";

export const PUBLIC_NAV_ITEMS: NavigationItem[] = [
  { label: "Movies", href: "/movies", description: "Explore currently running and upcoming movies" },
  { label: "Theatres", href: "/theatres", description: "Discover luxury cinemas, auditoriums and amenities" },
  { label: "Events", href: "/events", description: "Live sports, comedy specials and concert screenings" },
  { label: "Offers", href: "/offers", description: "Festive deals, student passes, and dining vouchers" },
  { label: "About", href: "/about", description: "The vision behind CineSphere Cinema Management Platform" },
  { label: "Contact", href: "/contact", description: "Get in touch with enterprise sales and guest relations" },
];

export const PUBLIC_FOOTER_SECTIONS: NavigationSection[] = [
  {
    title: "Cinematic Experiences",
    items: [
      { label: "IMAX with Laser", href: "/theatres" },
      { label: "Dolby Cinema & Atmos", href: "/theatres" },
      { label: "4DX Dynamic Motion", href: "/theatres" },
      { label: "ScreenX 270° Panorama", href: "/theatres" },
      { label: "Royal Suite Loungers", href: "/theatres" },
    ],
  },
  {
    title: "Platform Modules",
    items: [
      { label: "Super Admin Console", href: "/admin" },
      { label: "Theatre Operations", href: "/theatre" },
      { label: "Hall & Screen Control", href: "/theatre/halls" },
      { label: "Ticketing & Bookings", href: "/theatre/bookings" },
      { label: "Analytics & Box Office", href: "/theatre/analytics" },
    ],
  },
  {
    title: "Explore",
    items: [
      { label: "Now Showing Movies", href: "/movies" },
      { label: "Upcoming Premieres", href: "/movies" },
      { label: "Live Events & Concerts", href: "/events" },
      { label: "Promotions & Offers", href: "/offers" },
      { label: "Partner Cinema Locator", href: "/theatres" },
    ],
  },
  {
    title: "Legal & Support",
    items: [
      { label: "Frequently Asked Questions", href: "/contact" },
      { label: "Privacy Policy", href: "/contact" },
      { label: "Terms of Service", href: "/contact" },
      { label: "Ticket Refund Policy", href: "/contact" },
      { label: "Corporate Inquiries", href: "/contact" },
    ],
  },
];
