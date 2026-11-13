import { BaseRepository } from "./base.repository";
import { paginateArray, type PaginatedResult } from "@/lib/performance/cache-strategy";
import type {
  AmenityCategoryRecord,
  AmenityCatalogRecord,
  TheatreAmenityRecord,
  AmenityMetadataRecord,
  AmenityVersionRecord,
  TheatreAmenityWithCatalog,
  TheatreAmenityFilterParams,
  AmenityCatalogFilterParams,
} from "@/types/theatre-amenity.types";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Amenities Repository (Phase 3 – Part 5)
 * ==============================================================================
 * Centralized catalog store, dynamic categories, tenant-scoped assignments,
 * facility metadata, optimistic concurrency, and audit version history.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// Initial Seed: 10 Dynamic Categories
// ------------------------------------------------------------------------------
const SEED_CATEGORIES: AmenityCategoryRecord[] = [
  {
    id: "cat-am-tech",
    code: "technology",
    name: "Technology",
    displayName: "Projection & Acoustics",
    description: "Cutting-edge laser projection, immersive audio, and broadcast hardware.",
    defaultIcon: "Tv",
    displayOrder: 1,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-am-comfort",
    code: "comfort",
    name: "Comfort",
    displayName: "Seating & Comfort",
    description: "Ergonomic recliners, climate-controlled auditoriums, and plush waiting areas.",
    defaultIcon: "Armchair",
    displayOrder: 2,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-am-access",
    code: "accessibility",
    name: "Accessibility",
    displayName: "Accessibility & Assistance",
    description: "Wheelchair accessibility, companion seating, tactile pathways, and elevators.",
    defaultIcon: "Accessibility",
    displayOrder: 3,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-am-food",
    code: "food-beverage",
    name: "Food & Beverage",
    displayName: "Dining & Concessions",
    description: "Artisanal cafes, food courts, in-seat gourmet butler dining, and snack bars.",
    defaultIcon: "Coffee",
    displayOrder: 4,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-am-premium",
    code: "premium-experience",
    name: "Premium Experience",
    displayName: "VIP & Luxury Suites",
    description: "Exclusive Director's Lounges, private screening suites, and concierge services.",
    defaultIcon: "Sparkles",
    displayOrder: 5,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-am-trans",
    code: "transportation",
    name: "Transportation",
    displayName: "Parking & Transit",
    description: "Dedicated valet, multi-level parking, EV charging bays, and metro links.",
    defaultIcon: "Car",
    displayOrder: 6,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-am-family",
    code: "family",
    name: "Family",
    displayName: "Family & Kids",
    description: "Arcades, interactive play zones, feeding suites, and booster cushions.",
    defaultIcon: "Smile",
    displayOrder: 7,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-am-util",
    code: "utilities",
    name: "Utilities",
    displayName: "Utilities & Convenience",
    description: "High-speed Wi-Fi, power banks, RO water dispensers, and clean restrooms.",
    defaultIcon: "Zap",
    displayOrder: 8,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-am-ent",
    code: "entertainment",
    name: "Entertainment",
    displayName: "Special Entertainment FX",
    description: "4DX environmental simulators, ScreenX 270-degree panorama, and VR alcoves.",
    defaultIcon: "Film",
    displayOrder: 9,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-am-safety",
    code: "safety",
    name: "Safety",
    displayName: "Health & Safety",
    description: "Medical first-aid desks, emergency defibrillators, and sanitized contact zones.",
    defaultIcon: "ShieldCheck",
    displayOrder: 10,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

// ------------------------------------------------------------------------------
// Initial Seed: 20 Centralized Catalog Amenities (Requested Examples)
// ------------------------------------------------------------------------------
const SEED_CATALOG: AmenityCatalogRecord[] = [
  {
    id: "am-cat-001",
    code: "parking",
    name: "Dedicated Parking",
    displayName: "Dedicated Multi-Level Parking",
    description: "Multi-level covered parking structure with security surveillance and valet drop-off.",
    categoryId: "cat-am-trans",
    categoryCode: "transportation",
    defaultIcon: "Car",
    customIconUrl: null,
    svgPlaceholder: "<svg>parking</svg>",
    iconLibraryPlaceholder: "lucide:car",
    priority: "HIGH",
    isFeatured: true,
    displayOrder: 1,
    status: "ACTIVE",
    localizedNames: { hi: "समर्पित पार्किंग", mr: "समर्पित पार्किंग" },
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-002",
    code: "wheelchair-access",
    name: "Wheelchair Access",
    displayName: "Wheelchair Accessible Auditoriums",
    description: "Step-free ramp ingress, companion seating slots, and elevator access across all screens.",
    categoryId: "cat-am-access",
    categoryCode: "accessibility",
    defaultIcon: "Accessibility",
    customIconUrl: null,
    svgPlaceholder: "<svg>wheelchair</svg>",
    iconLibraryPlaceholder: "lucide:accessibility",
    priority: "CRITICAL",
    isFeatured: true,
    displayOrder: 2,
    status: "ACTIVE",
    localizedNames: { hi: "व्हीलचेयर पहुंच", mr: "व्हीलचेअर प्रवेश" },
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-003",
    code: "lift",
    name: "Passenger Elevators",
    displayName: "High-Speed Passenger Elevators",
    description: "Spacious passenger elevators serving all multiplex levels and basement car park.",
    categoryId: "cat-am-access",
    categoryCode: "accessibility",
    defaultIcon: "ArrowUpDown",
    customIconUrl: null,
    svgPlaceholder: null,
    iconLibraryPlaceholder: "lucide:arrow-up-down",
    priority: "HIGH",
    isFeatured: false,
    displayOrder: 3,
    status: "ACTIVE",
    localizedNames: {},
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-004",
    code: "escalator",
    name: "Atrium Escalators",
    displayName: "Central Atrium Escalators",
    description: "Continuous moving escalators connecting mall concourse directly to cinema foyer.",
    categoryId: "cat-am-access",
    categoryCode: "accessibility",
    defaultIcon: "MoveUpRight",
    customIconUrl: null,
    svgPlaceholder: null,
    iconLibraryPlaceholder: "lucide:move-up-right",
    priority: "STANDARD",
    isFeatured: false,
    displayOrder: 4,
    status: "ACTIVE",
    localizedNames: {},
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-005",
    code: "food-court",
    name: "Gourmet Food Court",
    displayName: "Multi-Cuisine Concessions & Food Court",
    description: "Artisanal food hall featuring wood-fired pizzas, gourmet nachos, burgers, and confectionery.",
    categoryId: "cat-am-food",
    categoryCode: "food-beverage",
    defaultIcon: "Utensils",
    customIconUrl: null,
    svgPlaceholder: null,
    iconLibraryPlaceholder: "lucide:utensils",
    priority: "HIGH",
    isFeatured: true,
    displayOrder: 5,
    status: "ACTIVE",
    localizedNames: { hi: "फूड कोर्ट", mr: "फूड कोर्ट" },
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-006",
    code: "cafe",
    name: "Cinema Cafe",
    displayName: "Artisanal Coffee & Patisserie Bar",
    description: "Freshly brewed specialty Arabica coffee, mocktails, French pastries, and premium gelatos.",
    categoryId: "cat-am-food",
    categoryCode: "food-beverage",
    defaultIcon: "Coffee",
    customIconUrl: null,
    svgPlaceholder: null,
    iconLibraryPlaceholder: "lucide:coffee",
    priority: "STANDARD",
    isFeatured: false,
    displayOrder: 6,
    status: "ACTIVE",
    localizedNames: {},
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-007",
    code: "premium-lounge",
    name: "VIP Director's Lounge",
    displayName: "VIP Director's Lounge",
    description: "Exclusive leather lounge for premium ticket holders with private dining and concierge.",
    categoryId: "cat-am-premium",
    categoryCode: "premium-experience",
    defaultIcon: "Sparkles",
    customIconUrl: null,
    svgPlaceholder: null,
    iconLibraryPlaceholder: "lucide:sparkles",
    priority: "FEATURED",
    isFeatured: true,
    displayOrder: 7,
    status: "ACTIVE",
    localizedNames: { hi: "वीआईपी लाउंज", mr: "व्हीआयपी लाउंज" },
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-008",
    code: "recliner-seats",
    name: "Zero-Gravity Recliners",
    displayName: "Zero-Gravity Motorized Recliners",
    description: "Plush Nappa leather recliners with motorized footrest, lumbar support, and personal dining table.",
    categoryId: "cat-am-comfort",
    categoryCode: "comfort",
    defaultIcon: "Armchair",
    customIconUrl: null,
    svgPlaceholder: null,
    iconLibraryPlaceholder: "lucide:armchair",
    priority: "FEATURED",
    isFeatured: true,
    displayOrder: 8,
    status: "ACTIVE",
    localizedNames: { hi: "रिक्लाइनर सीटें", mr: "रिक्लाइनर सीट्स" },
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-009",
    code: "dolby-atmos",
    name: "Dolby Atmos Audio",
    displayName: "Dolby Atmos 64-Channel Spatial Audio",
    description: "Overhead ceiling surround speakers and tuned subwoofers creating moving 3D audio precision.",
    categoryId: "cat-am-tech",
    categoryCode: "technology",
    defaultIcon: "Volume2",
    customIconUrl: null,
    svgPlaceholder: null,
    iconLibraryPlaceholder: "lucide:volume-2",
    priority: "FEATURED",
    isFeatured: true,
    displayOrder: 9,
    status: "ACTIVE",
    localizedNames: {},
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-010",
    code: "imax",
    name: "IMAX Laser Experience",
    displayName: "IMAX with Laser",
    description: "Proprietary high-resolution dual 4K laser projection with custom 12-channel sound.",
    categoryId: "cat-am-tech",
    categoryCode: "technology",
    defaultIcon: "Film",
    customIconUrl: null,
    svgPlaceholder: null,
    iconLibraryPlaceholder: "lucide:film",
    priority: "FEATURED",
    isFeatured: true,
    displayOrder: 10,
    status: "ACTIVE",
    localizedNames: {},
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-011",
    code: "4dx",
    name: "4DX Dynamic Motion",
    displayName: "4DX Environmental Effects & Motion",
    description: "Synchronized motion chairs with wind, fog, lightning, water, and scent effects.",
    categoryId: "cat-am-ent",
    categoryCode: "entertainment",
    defaultIcon: "Zap",
    customIconUrl: null,
    svgPlaceholder: null,
    iconLibraryPlaceholder: "lucide:zap",
    priority: "FEATURED",
    isFeatured: true,
    displayOrder: 11,
    status: "ACTIVE",
    localizedNames: {},
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-012",
    code: "laser-projection",
    name: "Barco 4K Laser Projection",
    displayName: "Barco 4K RGB Laser Projection",
    description: "Ultra-high contrast, REC.2020 color gamut, and crystal clear brightness on massive silver screens.",
    categoryId: "cat-am-tech",
    categoryCode: "technology",
    defaultIcon: "Tv",
    customIconUrl: null,
    svgPlaceholder: null,
    iconLibraryPlaceholder: "lucide:tv",
    priority: "HIGH",
    isFeatured: false,
    displayOrder: 12,
    status: "ACTIVE",
    localizedNames: {},
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-013",
    code: "kids-zone",
    name: "Kids Play Zone",
    displayName: "Kids Interactive Play Zone & Arcade",
    description: "Dedicated supervised play alcove with safe climbing structures, slides, and retro arcade cabinets.",
    categoryId: "cat-am-family",
    categoryCode: "family",
    defaultIcon: "Smile",
    customIconUrl: null,
    svgPlaceholder: null,
    iconLibraryPlaceholder: "lucide:smile",
    priority: "STANDARD",
    isFeatured: false,
    displayOrder: 13,
    status: "ACTIVE",
    localizedNames: { hi: "बच्चों का खेल क्षेत्र", mr: "मुलांचा खेळ विभाग" },
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-014",
    code: "charging-points",
    name: "Mobile Charging Points",
    displayName: "High-Speed Device Charging Stations",
    description: "USB-C and MagSafe fast-charging hubs located at waiting lounges and premium recliner armrests.",
    categoryId: "cat-am-util",
    categoryCode: "utilities",
    defaultIcon: "BatteryCharging",
    customIconUrl: null,
    svgPlaceholder: null,
    iconLibraryPlaceholder: "lucide:battery-charging",
    priority: "STANDARD",
    isFeatured: false,
    displayOrder: 14,
    status: "ACTIVE",
    localizedNames: {},
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-015",
    code: "waiting-area",
    name: "Grand Foyer Lounge",
    displayName: "Air-Conditioned Waiting Foyer",
    description: "Architectural foyer with luxury banquette seating, ambient lighting, and live showtime displays.",
    categoryId: "cat-am-comfort",
    categoryCode: "comfort",
    defaultIcon: "Building",
    customIconUrl: null,
    svgPlaceholder: null,
    iconLibraryPlaceholder: "lucide:building",
    priority: "STANDARD",
    isFeatured: false,
    displayOrder: 15,
    status: "ACTIVE",
    localizedNames: {},
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-016",
    code: "restrooms",
    name: "Luxury Restrooms",
    displayName: "Accessible Restrooms & Powder Suite",
    description: "Touchless sanitary facilities, dedicated ADA-compliant cubicles, and baby-changing stations.",
    categoryId: "cat-am-util",
    categoryCode: "utilities",
    defaultIcon: "DoorClosed",
    customIconUrl: null,
    svgPlaceholder: null,
    iconLibraryPlaceholder: "lucide:door-closed",
    priority: "HIGH",
    isFeatured: false,
    displayOrder: 16,
    status: "ACTIVE",
    localizedNames: {},
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-017",
    code: "drinking-water",
    name: "Purified Drinking Water",
    displayName: "RO Purified Water Dispensers",
    description: "Complimentary UV & RO filtered chilled and ambient drinking water stations.",
    categoryId: "cat-am-util",
    categoryCode: "utilities",
    defaultIcon: "GlassWater",
    customIconUrl: null,
    svgPlaceholder: null,
    iconLibraryPlaceholder: "lucide:glass-water",
    priority: "HIGH",
    isFeatured: false,
    displayOrder: 17,
    status: "ACTIVE",
    localizedNames: {},
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-018",
    code: "ev-charging",
    name: "EV Charging Bays",
    displayName: "Fast DC Electric Vehicle (EV) Chargers",
    description: "60 kW CCS2 and Type-2 high-speed EV chargers in dedicated ground level parking bays.",
    categoryId: "cat-am-trans",
    categoryCode: "transportation",
    defaultIcon: "Zap",
    customIconUrl: null,
    svgPlaceholder: null,
    iconLibraryPlaceholder: "lucide:zap",
    priority: "HIGH",
    isFeatured: true,
    displayOrder: 18,
    status: "ACTIVE",
    localizedNames: { hi: "ईवी चार्जिंग", mr: "ईव्ही चार्जिंग" },
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-019",
    code: "wifi",
    name: "High-Speed Wi-Fi",
    displayName: "Gigabit Guest Wi-Fi",
    description: "Complimentary 500 Mbps Wi-Fi network throughout foyer, auditoriums, and concession counters.",
    categoryId: "cat-am-util",
    categoryCode: "utilities",
    defaultIcon: "Wifi",
    customIconUrl: null,
    svgPlaceholder: null,
    iconLibraryPlaceholder: "lucide:wifi",
    priority: "STANDARD",
    isFeatured: false,
    displayOrder: 19,
    status: "ACTIVE",
    localizedNames: { hi: "वाई-फाई", mr: "वाय-फाय" },
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "am-cat-020",
    code: "in-seat-dining",
    name: "In-Seat Butler Dining",
    displayName: "In-Seat Butler Gourmet Dining",
    description: "Direct-to-seat service for hot appetizers, beverages, and desserts ordered via seat QR code.",
    categoryId: "cat-am-premium",
    categoryCode: "premium-experience",
    defaultIcon: "ConciergeBell",
    customIconUrl: null,
    svgPlaceholder: null,
    iconLibraryPlaceholder: "lucide:concierge-bell",
    priority: "FEATURED",
    isFeatured: true,
    displayOrder: 20,
    status: "ACTIVE",
    localizedNames: { hi: "सीट पर भोजन सेवा", mr: "सीटवर जेवण सेवा" },
    localizedDescriptions: {},
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

// ------------------------------------------------------------------------------
// Initial Seed: Assignments for Flagship Complex th-pun-001 (Phoenix Marketcity)
// ------------------------------------------------------------------------------
const SEED_ASSIGNMENTS: TheatreAmenityRecord[] = [
  {
    id: "asgn-pun-001",
    theatreId: "th-pun-001",
    amenityId: "am-cat-001", // parking
    availability: "AVAILABLE",
    notes: "Basement level B2 & B3. Valet desk at West Gate.",
    displayOrder: 1,
    visibility: "PUBLIC",
    status: "ACTIVE",
    isFeatured: true,
    entityType: "THEATRE",
    entityId: "th-pun-001",
    assignedBy: "usr-super-1",
    updatedBy: "usr-th-pun",
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "asgn-pun-002",
    theatreId: "th-pun-001",
    amenityId: "am-cat-002", // wheelchair-access
    availability: "AVAILABLE",
    notes: "Companion seating reserved in Row E across Screens 01-08.",
    displayOrder: 2,
    visibility: "PUBLIC",
    status: "ACTIVE",
    isFeatured: true,
    entityType: "THEATRE",
    entityId: "th-pun-001",
    assignedBy: "usr-super-1",
    updatedBy: "usr-th-pun",
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "asgn-pun-008",
    theatreId: "th-pun-001",
    amenityId: "am-cat-008", // recliner-seats
    availability: "AVAILABLE",
    notes: "Gold & Royal Suite tiers in Screen 01, 02, 05.",
    displayOrder: 3,
    visibility: "PUBLIC",
    status: "ACTIVE",
    isFeatured: true,
    entityType: "THEATRE",
    entityId: "th-pun-001",
    assignedBy: "usr-super-1",
    updatedBy: "usr-th-pun",
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "asgn-pun-009",
    theatreId: "th-pun-001",
    amenityId: "am-cat-009", // dolby-atmos
    availability: "AVAILABLE",
    notes: "Tuned 64-channel array in Screens 01, 03, 04, 06.",
    displayOrder: 4,
    visibility: "PUBLIC",
    status: "ACTIVE",
    isFeatured: true,
    entityType: "THEATRE",
    entityId: "th-pun-001",
    assignedBy: "usr-super-1",
    updatedBy: "usr-th-pun",
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "asgn-pun-010",
    theatreId: "th-pun-001",
    amenityId: "am-cat-010", // imax
    availability: "AVAILABLE",
    notes: "Screen 02 Flagship Auditorium.",
    displayOrder: 5,
    visibility: "PUBLIC",
    status: "ACTIVE",
    isFeatured: true,
    entityType: "THEATRE",
    entityId: "th-pun-001",
    assignedBy: "usr-super-1",
    updatedBy: "usr-th-pun",
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "asgn-pun-018",
    theatreId: "th-pun-001",
    amenityId: "am-cat-018", // ev-charging
    availability: "AVAILABLE",
    notes: "4 bays in Basement B2 next to CineSphere Elevator Core.",
    displayOrder: 6,
    visibility: "PUBLIC",
    status: "ACTIVE",
    isFeatured: false,
    entityType: "THEATRE",
    entityId: "th-pun-001",
    assignedBy: "usr-super-1",
    updatedBy: "usr-th-pun",
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "asgn-pun-019",
    theatreId: "th-pun-001",
    amenityId: "am-cat-019", // wifi
    availability: "AVAILABLE",
    notes: "SSID: CineSphere-Guest (Login via ticket confirmation SMS).",
    displayOrder: 7,
    visibility: "PUBLIC",
    status: "ACTIVE",
    isFeatured: false,
    entityType: "THEATRE",
    entityId: "th-pun-001",
    assignedBy: "usr-super-1",
    updatedBy: "usr-th-pun",
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

// ------------------------------------------------------------------------------
// Initial Seed: Facility Metadata for th-pun-001
// ------------------------------------------------------------------------------
const SEED_METADATA: AmenityMetadataRecord[] = [
  {
    id: "meta-pun-001",
    theatreAmenityId: "asgn-pun-001", // parking
    theatreId: "th-pun-001",
    parkingCapacity: 450,
    evChargerCount: null,
    wifiSsid: null,
    wifiAvailability: null,
    accessibilityNotes: "Dedicated handicap parking near elevator lobby.",
    foodCourtInfo: null,
    waitingAreaDetails: null,
    customAttributes: { valetRateINR: 100, fourWheelerRatePerHourINR: 40 },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "meta-pun-018",
    theatreAmenityId: "asgn-pun-018", // ev-charging
    theatreId: "th-pun-001",
    parkingCapacity: null,
    evChargerCount: 4,
    wifiSsid: null,
    wifiAvailability: null,
    accessibilityNotes: null,
    foodCourtInfo: null,
    waitingAreaDetails: null,
    customAttributes: { connectorType: "CCS2 / Type 2", maxOutputKW: 60 },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "meta-pun-019",
    theatreAmenityId: "asgn-pun-019", // wifi
    theatreId: "th-pun-001",
    parkingCapacity: null,
    evChargerCount: null,
    wifiSsid: "CineSphere-Grand-Guest",
    wifiAvailability: "Uncapped 500 Mbps connection across entire theatre premises",
    accessibilityNotes: null,
    foodCourtInfo: null,
    waitingAreaDetails: null,
    customAttributes: { portalType: "Captive Portal", bandwidthMbps: 500 },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export class TheatreAmenityRepository extends BaseRepository<TheatreAmenityRecord> {
  protected entityName = "TheatreAmenity";

  private categoriesStore: Map<string, AmenityCategoryRecord> = new Map();
  private catalogStore: Map<string, AmenityCatalogRecord> = new Map();
  private assignmentStore: Map<string, TheatreAmenityRecord> = new Map();
  private metadataStore: Map<string, AmenityMetadataRecord> = new Map();
  private versionsStore: AmenityVersionRecord[] = [];

  constructor() {
    super();
    this.seed();
  }

  private seed(): void {
    SEED_CATEGORIES.forEach((cat) => this.categoriesStore.set(cat.id, { ...cat }));
    SEED_CATALOG.forEach((item) => this.catalogStore.set(item.id, { ...item }));
    SEED_ASSIGNMENTS.forEach((asgn) => this.assignmentStore.set(asgn.id, { ...asgn }));
    SEED_METADATA.forEach((meta) => this.metadataStore.set(meta.theatreAmenityId, { ...meta }));
  }

  // ----------------------------------------------------------------------------
  // BaseRepository Overrides
  // ----------------------------------------------------------------------------
  public async findById(id: string): Promise<TheatreAmenityRecord | null> {
    const item = this.assignmentStore.get(id);
    return item ? { ...item } : null;
  }

  public async findAll(): Promise<TheatreAmenityRecord[]> {
    return Array.from(this.assignmentStore.values()).map((a) => ({ ...a }));
  }

  public async create(data: TheatreAmenityRecord): Promise<TheatreAmenityRecord> {
    const record: TheatreAmenityRecord = { ...data };
    this.assignmentStore.set(record.id, record);
    return { ...record };
  }

  public async update(id: string, updates: Partial<TheatreAmenityRecord>): Promise<TheatreAmenityRecord> {
    const current = this.assignmentStore.get(id);
    if (!current) {
      throw new Error(`Assignment with ID '${id}' not found`);
    }
    const updated: TheatreAmenityRecord = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.assignmentStore.set(id, updated);
    return { ...updated };
  }

  public async delete(id: string): Promise<boolean> {
    this.metadataStore.delete(id);
    return this.assignmentStore.delete(id);
  }

  // ----------------------------------------------------------------------------
  // 1. Amenity Categories Methods
  // ----------------------------------------------------------------------------
  public async findAllCategories(): Promise<AmenityCategoryRecord[]> {
    return Array.from(this.categoriesStore.values())
      .filter((c) => c.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((c) => ({ ...c }));
  }

  public async findCategoryById(id: string): Promise<AmenityCategoryRecord | null> {
    const cat = this.categoriesStore.get(id);
    return cat ? { ...cat } : null;
  }

  public async findCategoryByCode(code: string): Promise<AmenityCategoryRecord | null> {
    const normalized = code.toLowerCase().trim();
    for (const cat of this.categoriesStore.values()) {
      if (cat.code.toLowerCase() === normalized) {
        return { ...cat };
      }
    }
    return null;
  }

  public async createCategory(data: Omit<AmenityCategoryRecord, "id" | "createdAt" | "updatedAt">): Promise<AmenityCategoryRecord> {
    const existing = await this.findCategoryByCode(data.code);
    if (existing) {
      throw new Error(`Amenity category with code '${data.code}' already exists`);
    }
    const id = `cat-am-${data.code.replace(/[^a-z0-9]+/g, "-")}`;
    const now = new Date().toISOString();
    const record: AmenityCategoryRecord = {
      id,
      ...data,
      displayName: data.displayName || data.name,
      createdAt: now,
      updatedAt: now,
    };
    this.categoriesStore.set(id, record);
    return { ...record };
  }

  // ----------------------------------------------------------------------------
  // 2. Amenity Catalog Methods (Super Admin Master)
  // ----------------------------------------------------------------------------
  public async findAllCatalog(params?: AmenityCatalogFilterParams): Promise<PaginatedResult<AmenityCatalogRecord>> {
    let items = Array.from(this.catalogStore.values());

    if (params?.categoryId) {
      items = items.filter((item) => item.categoryId === params.categoryId);
    }
    if (params?.categoryCode) {
      const code = params.categoryCode.toLowerCase();
      items = items.filter((item) => item.categoryCode.toLowerCase() === code);
    }
    if (params?.status) {
      items = items.filter((item) => item.status === params.status);
    }
    if (params?.priority) {
      items = items.filter((item) => item.priority === params.priority);
    }
    if (params?.isFeatured !== undefined) {
      items = items.filter((item) => item.isFeatured === params.isFeatured);
    }
    if (params?.query && params.query.trim()) {
      const q = params.query.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.displayName.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
      );
    }

    items.sort((a, b) => a.displayOrder - b.displayOrder);

    return paginateArray(items, {
      page: params?.page || 1,
      pageSize: params?.pageSize || 50,
    });
  }

  public async findCatalogById(id: string): Promise<AmenityCatalogRecord | null> {
    const item = this.catalogStore.get(id);
    return item ? { ...item } : null;
  }

  public async findCatalogByCode(code: string): Promise<AmenityCatalogRecord | null> {
    const normalized = code.toLowerCase().trim();
    for (const item of this.catalogStore.values()) {
      if (item.code.toLowerCase() === normalized) {
        return { ...item };
      }
    }
    return null;
  }

  public async createCatalogItem(
    data: Omit<AmenityCatalogRecord, "id" | "version" | "createdAt" | "updatedAt">
  ): Promise<AmenityCatalogRecord> {
    const existing = await this.findCatalogByCode(data.code);
    if (existing) {
      throw new Error(`Amenity catalog item with code '${data.code}' already exists`);
    }

    const id = `am-cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const record: AmenityCatalogRecord = {
      id,
      ...data,
      displayName: data.displayName || data.name,
      localizedNames: data.localizedNames || {},
      localizedDescriptions: data.localizedDescriptions || {},
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    this.catalogStore.set(id, record);
    return { ...record };
  }

  public async updateCatalogItemWithLock(params: {
    id: string;
    expectedVersion?: number;
    updates: Partial<Omit<AmenityCatalogRecord, "id" | "createdAt" | "version">>;
  }): Promise<AmenityCatalogRecord> {
    const current = this.catalogStore.get(params.id);
    if (!current) {
      throw new Error(`Catalog amenity '${params.id}' not found`);
    }

    if (params.expectedVersion !== undefined && current.version !== params.expectedVersion) {
      throw new Error(
        `Optimistic lock collision on AmenityCatalog '${params.id}'. Current version=${current.version}, expected=${params.expectedVersion}`
      );
    }

    const updated: AmenityCatalogRecord = {
      ...current,
      ...params.updates,
      version: current.version + 1,
      updatedAt: new Date().toISOString(),
    };
    this.catalogStore.set(params.id, updated);
    return { ...updated };
  }

  public async archiveCatalogItem(id: string): Promise<AmenityCatalogRecord> {
    return this.updateCatalogItemWithLock({
      id,
      updates: { status: "ARCHIVED" },
    });
  }

  // ----------------------------------------------------------------------------
  // 3. Theatre Amenity Assignments Methods (Tenant Scoped)
  // ----------------------------------------------------------------------------
  public async findAssignmentsByTheatre(theatreId: string, filters?: TheatreAmenityFilterParams): Promise<TheatreAmenityWithCatalog[]> {
    let assignments = Array.from(this.assignmentStore.values()).filter((a) => a.theatreId === theatreId);

    if (filters?.status) {
      assignments = assignments.filter((a) => a.status === filters.status);
    }
    if (filters?.availability) {
      assignments = assignments.filter((a) => a.availability === filters.availability);
    }
    if (filters?.visibility) {
      assignments = assignments.filter((a) => a.visibility === filters.visibility);
    }
    if (filters?.isFeatured !== undefined) {
      assignments = assignments.filter((a) => a.isFeatured === filters.isFeatured);
    }

    // Enrich with catalog details & category
    const enriched: TheatreAmenityWithCatalog[] = [];
    for (const asgn of assignments) {
      const catalog = this.catalogStore.get(asgn.amenityId);
      if (!catalog) continue;

      if (filters?.categoryCode && catalog.categoryCode.toLowerCase() !== filters.categoryCode.toLowerCase()) {
        continue;
      }

      if (filters?.query && filters.query.trim()) {
        const q = filters.query.toLowerCase().trim();
        const matches =
          catalog.name.toLowerCase().includes(q) ||
          catalog.displayName.toLowerCase().includes(q) ||
          (asgn.notes && asgn.notes.toLowerCase().includes(q));
        if (!matches) continue;
      }

      const category = this.categoriesStore.get(catalog.categoryId);
      const metadata = this.metadataStore.get(asgn.id) || null;

      enriched.push({
        ...asgn,
        amenity: { ...catalog },
        category: category ? { ...category } : null,
        metadata: metadata ? { ...metadata } : null,
      });
    }

    enriched.sort((a, b) => a.displayOrder - b.displayOrder);
    return enriched;
  }

  public async findAssignmentByTheatreAndAmenity(theatreId: string, amenityId: string): Promise<TheatreAmenityRecord | null> {
    for (const asgn of this.assignmentStore.values()) {
      if (asgn.theatreId === theatreId && asgn.amenityId === amenityId) {
        return { ...asgn };
      }
    }
    return null;
  }

  public async assignAmenity(
    data: Omit<TheatreAmenityRecord, "id" | "version" | "createdAt" | "updatedAt">,
    metadata?: Partial<Omit<AmenityMetadataRecord, "id" | "theatreAmenityId" | "theatreId" | "createdAt" | "updatedAt">>
  ): Promise<TheatreAmenityWithCatalog> {
    const existing = await this.findAssignmentByTheatreAndAmenity(data.theatreId, data.amenityId);
    if (existing) {
      throw new Error(`Amenity is already assigned to theatre '${data.theatreId}'`);
    }

    const catalog = this.catalogStore.get(data.amenityId);
    if (!catalog) {
      throw new Error(`Catalog amenity '${data.amenityId}' not found`);
    }

    const assignmentId = `asgn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const record: TheatreAmenityRecord = {
      id: assignmentId,
      ...data,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    this.assignmentStore.set(assignmentId, record);

    let savedMetadata: AmenityMetadataRecord | null = null;
    if (metadata) {
      savedMetadata = {
        id: `meta-${assignmentId}`,
        theatreAmenityId: assignmentId,
        theatreId: data.theatreId,
        parkingCapacity: metadata.parkingCapacity ?? null,
        evChargerCount: metadata.evChargerCount ?? null,
        wifiSsid: metadata.wifiSsid ?? null,
        wifiAvailability: metadata.wifiAvailability ?? null,
        accessibilityNotes: metadata.accessibilityNotes ?? null,
        foodCourtInfo: metadata.foodCourtInfo ?? null,
        waitingAreaDetails: metadata.waitingAreaDetails ?? null,
        customAttributes: metadata.customAttributes || {},
        createdAt: now,
        updatedAt: now,
      };
      this.metadataStore.set(assignmentId, savedMetadata);
    }

    const category = this.categoriesStore.get(catalog.categoryId);

    return {
      ...record,
      amenity: { ...catalog },
      category: category ? { ...category } : null,
      metadata: savedMetadata ? { ...savedMetadata } : null,
    };
  }

  public async updateAssignmentWithLock(params: {
    assignmentId: string;
    theatreId: string;
    expectedVersion?: number;
    updates: Partial<Omit<TheatreAmenityRecord, "id" | "theatreId" | "amenityId" | "createdAt" | "version">>;
    metadata?: Partial<Omit<AmenityMetadataRecord, "id" | "theatreAmenityId" | "theatreId" | "createdAt" | "updatedAt">>;
  }): Promise<TheatreAmenityWithCatalog> {
    const current = this.assignmentStore.get(params.assignmentId);
    if (!current) {
      throw new Error(`Assignment with ID '${params.assignmentId}' not found`);
    }
    if (current.theatreId !== params.theatreId) {
      throw new Error(`Cross-tenant security violation: Assignment does not belong to theatre '${params.theatreId}'`);
    }

    if (params.expectedVersion !== undefined && current.version !== params.expectedVersion) {
      throw new Error(
        `Optimistic lock collision on TheatreAmenity '${params.assignmentId}'. Current version=${current.version}, expected=${params.expectedVersion}`
      );
    }

    const now = new Date().toISOString();
    const updated: TheatreAmenityRecord = {
      ...current,
      ...params.updates,
      version: current.version + 1,
      updatedAt: now,
    };
    this.assignmentStore.set(params.assignmentId, updated);

    let savedMetadata = this.metadataStore.get(params.assignmentId) || null;
    if (params.metadata) {
      savedMetadata = {
        id: savedMetadata?.id || `meta-${params.assignmentId}`,
        theatreAmenityId: params.assignmentId,
        theatreId: params.theatreId,
        parkingCapacity: params.metadata.parkingCapacity !== undefined ? params.metadata.parkingCapacity : savedMetadata?.parkingCapacity ?? null,
        evChargerCount: params.metadata.evChargerCount !== undefined ? params.metadata.evChargerCount : savedMetadata?.evChargerCount ?? null,
        wifiSsid: params.metadata.wifiSsid !== undefined ? params.metadata.wifiSsid : savedMetadata?.wifiSsid ?? null,
        wifiAvailability: params.metadata.wifiAvailability !== undefined ? params.metadata.wifiAvailability : savedMetadata?.wifiAvailability ?? null,
        accessibilityNotes: params.metadata.accessibilityNotes !== undefined ? params.metadata.accessibilityNotes : savedMetadata?.accessibilityNotes ?? null,
        foodCourtInfo: params.metadata.foodCourtInfo !== undefined ? params.metadata.foodCourtInfo : savedMetadata?.foodCourtInfo ?? null,
        waitingAreaDetails: params.metadata.waitingAreaDetails !== undefined ? params.metadata.waitingAreaDetails : savedMetadata?.waitingAreaDetails ?? null,
        customAttributes: params.metadata.customAttributes || savedMetadata?.customAttributes || {},
        createdAt: savedMetadata?.createdAt || now,
        updatedAt: now,
      };
      this.metadataStore.set(params.assignmentId, savedMetadata);
    }

    const catalog = this.catalogStore.get(updated.amenityId)!;
    const category = this.categoriesStore.get(catalog.categoryId);

    return {
      ...updated,
      amenity: { ...catalog },
      category: category ? { ...category } : null,
      metadata: savedMetadata ? { ...savedMetadata } : null,
    };
  }

  public async reorderAssignments(theatreId: string, orderedAssignmentIds: string[]): Promise<TheatreAmenityRecord[]> {
    const updated: TheatreAmenityRecord[] = [];
    const now = new Date().toISOString();

    orderedAssignmentIds.forEach((id, index) => {
      const current = this.assignmentStore.get(id);
      if (current && current.theatreId === theatreId) {
        const next: TheatreAmenityRecord = {
          ...current,
          displayOrder: index + 1,
          updatedAt: now,
        };
        this.assignmentStore.set(id, next);
        updated.push({ ...next });
      }
    });

    return updated;
  }

  // ----------------------------------------------------------------------------
  // 4. Version History & Audit Trail
  // ----------------------------------------------------------------------------
  public async recordVersion(data: Omit<AmenityVersionRecord, "id" | "createdAt">): Promise<AmenityVersionRecord> {
    const record: AmenityVersionRecord = {
      id: `am-ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.versionsStore.unshift(record);
    return { ...record };
  }

  public async getVersionHistory(params: {
    amenityId?: string;
    theatreAmenityId?: string;
    theatreId?: string;
  }): Promise<AmenityVersionRecord[]> {
    let items = [...this.versionsStore];
    if (params.amenityId) {
      items = items.filter((v) => v.amenityId === params.amenityId);
    }
    if (params.theatreAmenityId) {
      items = items.filter((v) => v.theatreAmenityId === params.theatreAmenityId);
    }
    if (params.theatreId) {
      items = items.filter((v) => v.theatreId === params.theatreId);
    }
    return items.map((v) => ({ ...v }));
  }

  // ----------------------------------------------------------------------------
  // 5. Multi-Faceted Search & Pagination with Pre-Pagination Tenant Isolation
  // ----------------------------------------------------------------------------
  public async searchAndPaginate(params: TheatreAmenityFilterParams): Promise<PaginatedResult<TheatreAmenityWithCatalog>> {
    const targetTheatreId = params.scopedTenantId || params.theatreId;
    if (!targetTheatreId) {
      throw new Error("Theatre ID or scoped tenant ID must be provided for theatre amenity search");
    }

    const items = await this.findAssignmentsByTheatre(targetTheatreId, params);

    return paginateArray(items, {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    });
  }
}

export const theatreAmenityRepository = new TheatreAmenityRepository();
