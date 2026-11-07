export interface PlatformFeature {
  id: string;
  title: string;
  description: string;
  tagline: string;
  iconName: string;
  badge?: string;
  metric?: string;
}

export const PLATFORM_FEATURES: PlatformFeature[] = [
  {
    id: "multi-theatre",
    title: "Multi-Theatre Network",
    description:
      "Centralized oversight for national multiplex chains, regional franchises, and boutique cinema labs in a single unified dashboard.",
    tagline: "Enterprise multiplex orchestration",
    iconName: "Building2",
    badge: "Scale Ready",
    metric: "Unlimited Venues",
  },
  {
    id: "hall-designer-3d",
    title: "3D Hall Designer",
    description:
      "Interactive 3D hall architect to visualize screen curvatures, acoustic dead zones, Dolby Atmos speaker cones, and sightline ergonomics.",
    tagline: "Next-gen spatial cinema modeling",
    iconName: "Box",
    badge: "Interactive Preview",
    metric: "Millimeter Precision",
  },
  {
    id: "analytics",
    title: "Predictive Analytics & Yield",
    description:
      "Real-time revenue metrics, occupancy velocity tracking, weather-correlated demand forecasting, and automated concession yield metrics.",
    tagline: "Real-time decision intelligence",
    iconName: "TrendingUp",
    badge: "Real-time BI",
    metric: "99.4% Accuracy",
  },
  {
    id: "bookings",
    title: "Omnichannel Bookings",
    description:
      "High-concurrency ticket reservation engine supporting millions of concurrent patrons across mobile apps, kiosks, and web checkouts.",
    tagline: "Sub-second checkout pipeline",
    iconName: "Ticket",
    badge: "High Throughput",
    metric: "12K Bookings / sec",
  },
  {
    id: "seat-management",
    title: "Dynamic Seat Management",
    description:
      "Custom tiered seat layouts: VIP recliners, loungers, companion spaces, wheelchair accessible stalls, and dynamic price surging.",
    tagline: "Granular zoning & tiering",
    iconName: "Armchair",
    badge: "Dynamic Tiers",
    metric: "Instant Re-zoning",
  },
  {
    id: "scheduling",
    title: "Intelligent Movie Scheduling",
    description:
      "Drag-and-drop showtime matrix with automatic gap balancing, distributor split compliance, cleaning buffers, and trailer allocation.",
    tagline: "Automated showtime matrix",
    iconName: "CalendarClock",
    badge: "Smart Sync",
    metric: "Zero Conflict Scheduling",
  },
  {
    id: "payments",
    title: "Unified Global Payments",
    description:
      "Global payment orchestration supporting multi-currency cards, digital wallets, gift cards, split bills, and instant refund processing.",
    tagline: "Zero friction financial flows",
    iconName: "CreditCard",
    badge: "PCI-DSS Level 1",
    metric: "99.99% Uptime",
  },
  {
    id: "customer-management",
    title: "Patron CRM & Loyalty",
    description:
      "Holistic viewer profiles tracking cinema visit frequency, flavor preferences, membership loyalty tiers, and personalized promotions.",
    tagline: "Hyper-personalized guest experiences",
    iconName: "Users",
    badge: "Retention Engine",
    metric: "+34% Repeat Visits",
  },
  {
    id: "ai-hall-design",
    title: "AI Assisted Hall Design",
    description:
      "Algorithmic acoustic optimization that automatically calculates optimal speaker positioning, laser throw distance, and lux distribution.",
    tagline: "Machine learning acoustics",
    iconName: "Sparkles",
    badge: "CineSphere AI",
    metric: "THX & IMAX Certified",
  },
];

export const DUMMY_FEATURES = PLATFORM_FEATURES;
