export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
}

export const DUMMY_TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    name: "Arthur Pendelton",
    role: "VP of Circuit Operations",
    company: "Apex Cinema Group (48 Locations)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    content: "Migrating 48 multiplexes to CineSphere OS unified our laser projector telemetry and slashed ticket queue friction by 68%. The multi-tenant architecture is rock solid.",
    rating: 5,
  },
  {
    id: "test-2",
    name: "Helena Rostova",
    role: "Chief Technology Officer",
    company: "Lumière Heritage Theatres",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
    content: "The 3D Hall Designer and automated Dolby Atmos calibration workflows saved our engineering staff hundreds of manual testing hours. Truly the operating system for modern venues.",
    rating: 5,
  },
  {
    id: "test-3",
    name: "Marcus Sterling",
    role: "General Manager",
    company: "Starlight Megaplex Times Square",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    content: "During opening weekend for major superhero releases, our ushers processed 2,400 patrons per hour using the offline fast-pass scanners with zero dropped connections.",
    rating: 5,
  },
  {
    id: "test-4",
    name: "Sophia Zhang",
    role: "VP of Concessions & Hospitality",
    company: "MetroStar Entertainment",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
    content: "Concession mobile order fulfillment through the kitchen display POS jumped by 34% within the first month. Seat-level delivery is a massive revenue multiplier.",
    rating: 5,
  },
  {
    id: "test-5",
    name: "David K. Vance",
    role: "Exhibition Director",
    company: "BFI IMAX Southbank",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    content: "CineSphere OS understands high-end projection formats. From laser throw angle diagnostics to KDM key dispatch, it’s built by people who genuinely know cinema.",
    rating: 5,
  },
  {
    id: "test-6",
    name: "Rachel Simmons",
    role: "CineClub VIP Member",
    company: "Frequent Patron (84 Bookings/yr)",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    content: "The booking experience is unbelievably sleek and fast. Instant Apple Wallet pass downloads and no annoying banner ads. It feels like Apple built a cinema app.",
    rating: 5,
  },
];

