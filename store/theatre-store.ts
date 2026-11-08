"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { THEATRE_A, THEATRE_B } from "@/data/theatres/multi-tenant-theatres";
import {
  THEATRE_HALLS as SEED_HALLS,
  THEATRE_SHOWS as SEED_SHOWS,
  THEATRE_BOOKINGS as SEED_BOOKINGS,
  THEATRE_MOVIES as SEED_MOVIES,
  THEATRE_STAFF as SEED_STAFF,
  THEATRE_NOTIFICATIONS as SEED_NOTIFICATIONS,
} from "@/lib/constants/theatre-admin";
import { DynamicHallSectionConfig, Future3DHallConfig, HallStatus } from "@/types/hall.types";
import { SeatTemplateContainer } from "@/types/seat-generation.types";
import { generateAuditoriumSeatTemplate } from "@/lib/engine/seat-generation-engine";
import { GlobalMasterMovie } from "@/types/movie-management.types";
import {
  PricingProfile,
  BookingAvailabilityStatus,
  ShowSalesStatus,
} from "@/types/show-management.types";
import { ShowStatus, ShowSeat } from "@/types/show.types";
import { INITIAL_PRICING_PROFILES } from "@/lib/constants/initial-pricing-profiles";
import {
  calculateScheduleWindow,
  timeStringToMinutes,
  detectScheduleConflict,
} from "@/lib/engine/scheduling-engine";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Admin Multi-Tenant State Store
 * Scoped strictly to the authenticated Theatre Tenant.
 * Enforces zero cross-tenant access and provides reactive mutations for
 * profile, UPI configuration, halls, movies, shows, staff, media, and audit.
 * ==============================================================================
 */

export interface TheatreProfileState {
  id: string;
  name: string;
  slug: string;
  code: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  openingTime: string;
  closingTime: string;
  timezone: string;
  status: "Active" | "Maintenance" | "Renovating" | "Pending Approval";
  amenities: string[];
  latitude: number;
  longitude: number;
  rating: number;
  hallCount: number;
  heroImage: string;
  bannerImage: string;
  logo: string;
}

export interface PaymentRailConfig {
  businessName: string;
  merchantName: string;
  upiId: string;
  qrPlaceholder: string;
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  settlementPeriod: "T+0 Instant" | "T+1 Daily" | "Weekly";
  gateways: {
    razorpay: { enabled: boolean; keyIdMasked: string };
    phonepe: { enabled: boolean; merchantIdMasked: string };
    paytm: { enabled: boolean; midMasked: string };
    stripe: { enabled: boolean; pubKeyMasked: string };
  };
}

export interface ManagedHall {
  id: string;
  theatreId?: string;
  hallNumber: number;
  hallCode: string;
  name: string;
  screenType: "IMAX Laser" | "Dolby Cinema" | "4DX Dynamic" | "Prime Club" | "Royal Suite" | "Laser 4K" | "Standard" | "ScreenX" | "3D" | string;
  capacity: number;
  projectionType: string;
  soundSystem: string;
  aspectRatio: string;
  floorNumber: string;
  description: string;
  status: HallStatus;
  occupancyPercent: number;
  currentMovie?: string;
  currentShow?: string;
  image: string;
  sections: DynamicHallSectionConfig[];
  layout?: Future3DHallConfig;
  seatTemplate?: SeatTemplateContainer;
  createdAt?: string;
  updatedAt?: string;
}

export interface ManagedMovie {
  id: string;
  movieId?: string; // Reference to Platform Master Movie
  title: string;
  poster: string;
  backdrop: string;
  language: string;
  genre: string[];
  rating: string;
  runtime: string;
  releaseDate: string;
  status: "Now Showing" | "Upcoming" | "Archived";
  formats: ("2D" | "3D" | "IMAX" | "4DX" | "Dolby Atmos" | string)[];
  director: string;
  leadCast: string[];
  synopsis: string;
  trailerUrl?: string;
  kdmStatus?: "Valid" | "Pending" | "Expired";
  kdmKeyId?: string;
}

export interface ManagedShow {
  id: string;
  showCode?: string;
  slug?: string;
  movieId: string;
  movieTitle: string;
  moviePosterUrl?: string;
  movieBannerUrl?: string;
  movieDurationMinutes?: number;
  movieCertificate?: string;
  theatreId?: string;
  theatreName?: string;
  hallId: string;
  hallName: string;
  hallCode?: string;
  screenType?: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  intermissionMinutes?: number;
  cleaningBufferMinutes?: number;
  totalOccupiedMinutes?: number;
  language: string;
  format: "2D" | "3D" | "IMAX" | "4DX" | "Dolby Atmos" | "Dolby Cinema" | "ScreenX" | string;
  ticketPrice: number;
  seatsBooked: number;
  totalSeats: number;
  status: ShowStatus;
  bookingStatus?: BookingAvailabilityStatus;
  salesStatus?: ShowSalesStatus;
  pricingProfileId?: string;
  pricingProfileName?: string;
  sectionPricing?: Record<string, number>;
  seatsAvailable?: number;
  seatsBlocked?: number;
  occupancyPercent?: number;
  revenueEstimated?: number;
  seatInventory?: ShowSeat[];
  isConflict?: boolean;
  conflictReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MonitoredBooking {
  id: string;
  referenceCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  movieTitle: string;
  hallName: string;
  showTime: string;
  bookingDate: string;
  seats: string[];
  amount: number;
  paymentMethod: "UPI" | "Credit Card" | "Debit Card" | "Net Banking" | "Cash" | "Wallet";
  paymentStatus: "Paid" | "Pending" | "Refunded" | "Failed";
  bookingStatus: "Confirmed" | "Completed" | "Cancelled" | "Checked-in";
}

export interface ManagedStaff {
  id: string;
  employeeCode: string;
  name: string;
  avatar: string;
  designation: string;
  role: "Theatre Admin" | "Hall Manager" | "Ticket Counter Staff" | "Floor Staff" | "Food Court Staff" | "Projectionist" | "Support Staff";
  assignedHall: string;
  email: string;
  phone: string;
  joiningDate: string;
  shift: "Morning (08:00 - 16:30)" | "Evening (16:00 - 00:30)" | "Night Shift";
  status: "On Duty" | "Off Duty" | "On Leave";
}

export interface ManagedMediaAsset {
  id: string;
  title: string;
  category: "Logo" | "Banner" | "Gallery" | "Lobby" | "Hall" | "Promotional" | "Video";
  url: string;
  fileSize: string;
  dimensions?: string;
  uploadedAt: string;
}

export interface TheatreAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  module: string;
  details: string;
}

export interface TheatreState {
  activeTheatreId: string;
  profile: TheatreProfileState;
  paymentConfig: PaymentRailConfig;
  halls: ManagedHall[];
  movies: ManagedMovie[];
  shows: ManagedShow[];
  pricingProfiles: PricingProfile[];
  bookings: MonitoredBooking[];
  staff: ManagedStaff[];
  media: ManagedMediaAsset[];
  notifications: typeof SEED_NOTIFICATIONS;
  auditLogs: TheatreAuditLog[];

  // Tenant Isolation Actions
  switchTenant: (theatreId: string) => void;

  // Profile Management
  updateProfile: (updates: Partial<TheatreProfileState>) => void;

  // Payment & UPI Configuration
  updatePaymentConfig: (updates: Partial<PaymentRailConfig>) => void;

  // Hall Management (Phase 2 Part 5)
  addHall: (hall: Omit<ManagedHall, "id" | "occupancyPercent">) => { success: boolean; error?: string };
  updateHall: (id: string, updates: Partial<ManagedHall>) => { success: boolean; error?: string };
  archiveHall: (id: string) => void;
  activateHall: (id: string) => void;
  deactivateHall: (id: string) => void;
  duplicateHall: (id: string) => { success: boolean; newId?: string; error?: string };
  deleteHall: (id: string) => void;
  generateSeatsForHall: (hallId: string) => { success: boolean; template?: SeatTemplateContainer; error?: string };
  regenerateSeatsForHall: (hallId: string) => { success: boolean; template?: SeatTemplateContainer; error?: string };
  deleteSeatsForHall: (hallId: string) => { success: boolean; error?: string };

  // Movie Catalog Operations (Layer 2 - Scoped to Theatre)
  addMovie: (movie: Omit<ManagedMovie, "id">) => void;
  updateMovie: (id: string, updates: Partial<ManagedMovie>) => void;
  archiveMovie: (id: string) => void;
  linkGlobalMovie: (
    movie: GlobalMasterMovie,
    options?: {
      formats?: string[];
      language?: string;
      status?: "Now Showing" | "Upcoming";
    }
  ) => { success: boolean; error?: string };
  unlinkMovie: (id: string) => void;
  updateMovieScreeningStatus: (id: string, status: "Now Showing" | "Upcoming" | "Archived") => void;

  // Pricing Profiles (Phase 2 Part 8)
  addPricingProfile: (profile: Omit<PricingProfile, "id" | "createdAt" | "updatedAt">) => void;
  updatePricingProfile: (id: string, updates: Partial<PricingProfile>) => void;
  deletePricingProfile: (id: string) => void;

  // Show Programming (Phase 2 Part 8)
  addShow: (show: Omit<ManagedShow, "id" | "seatsBooked">) => { success: boolean; show?: ManagedShow; error?: string };
  updateShow: (id: string, updates: Partial<ManagedShow>) => { success: boolean; show?: ManagedShow; error?: string };
  cancelShow: (id: string, reason?: string) => void;
  archiveShow: (id: string) => void;
  duplicateShow: (id: string, newDate?: string, newStartTime?: string) => { success: boolean; show?: ManagedShow; error?: string };

  // Staff Management
  addStaff: (staffMember: Omit<ManagedStaff, "id">) => void;
  toggleStaffStatus: (id: string) => void;
  updateStaffRole: (id: string, role: ManagedStaff["role"]) => void;

  // Media Library
  uploadMedia: (asset: Omit<ManagedMediaAsset, "id" | "uploadedAt">) => void;
  deleteMedia: (id: string) => void;

  // Operational Notifications & Audit
  markNotificationRead: (id: string) => void;
  logTenantAudit: (action: string, module: string, details: string) => void;
}

// ------------------------------------------------------------------------------
// Multi-Tenant Seed Factories with Dynamic Section Allocations
// ------------------------------------------------------------------------------

export const DEFAULT_3D_CONFIG: Future3DHallConfig = {
  cameraPresets: [
    {
      id: "cam-center-eye",
      name: "Center Sweetspot (Row E)",
      position: [0, 4.5, 14],
      target: [0, 2, 0],
      fov: 60,
      description: "Direct view towards center screen from middle tier",
    },
    {
      id: "cam-screen-view",
      name: "Screen Projection Horizon",
      position: [0, 1.5, 1],
      target: [0, 5, 20],
      fov: 75,
      description: "Perspective looking back into the auditorium from screen",
    },
    {
      id: "cam-vip-tier",
      name: "VIP Tier Perspective",
      position: [-5, 6, 18],
      target: [0, 3, 0],
      fov: 55,
      description: "Elevation view from VIP Recliner zone",
    },
  ],
  defaultCamera: "cam-center-eye",
  screenCurvature: 0.18,
  screenTiltDegrees: 4.5,
  eyeLevelOffsetMeters: 1.2,
  stageElevationMeters: 0.8,
  rowTierElevationMeters: 0.35,
  walkways: [
    { afterColumn: 10, label: "Center Aisle Egress" },
  ],
  emergencyExits: [
    { position: "front-left", label: "Exit 1 (Stage Left)" },
    { position: "front-right", label: "Exit 2 (Stage Right)" },
    { position: "rear-right", label: "Exit 3 (Lobby Concourse)" },
  ],
  accessibilitySlots: [
    { sectionId: "sec-a", seatCount: 2, rampAccess: true },
  ],
  seatPitchMeters: 0.95,
  rowSpacingMeters: 1.1,
};

const SEED_MEDIA_PUNE: ManagedMediaAsset[] = [
  {
    id: "med-01",
    title: "Flagship Foyer Panorama",
    category: "Lobby",
    url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80",
    fileSize: "2.4 MB",
    dimensions: "3840x2160",
    uploadedAt: "2026-10-15",
  },
  {
    id: "med-02",
    title: "IMAX Laser Hall 1 Screen View",
    category: "Hall",
    url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80",
    fileSize: "3.1 MB",
    dimensions: "4096x2160",
    uploadedAt: "2026-10-18",
  },
  {
    id: "med-03",
    title: "VIP Recliner Pod Experience",
    category: "Gallery",
    url: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=1200&auto=format&fit=crop&q=80",
    fileSize: "1.8 MB",
    dimensions: "2560x1440",
    uploadedAt: "2026-10-22",
  },
  {
    id: "med-04",
    title: "Official Multiplex Logo (OLED Dark)",
    category: "Logo",
    url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&auto=format&fit=crop&q=80",
    fileSize: "420 KB",
    dimensions: "800x800",
    uploadedAt: "2026-09-01",
  },
  {
    id: "med-05",
    title: "Grand Billboard Header Banner",
    category: "Banner",
    url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80",
    fileSize: "4.2 MB",
    dimensions: "1920x640",
    uploadedAt: "2026-09-01",
  },
  {
    id: "med-06",
    title: "Gourmet Butler Concession Menu Banner",
    category: "Promotional",
    url: "https://images.unsplash.com/photo-1585647347384-2593bc35786b?w=1200&auto=format&fit=crop&q=80",
    fileSize: "1.9 MB",
    dimensions: "1920x1080",
    uploadedAt: "2026-10-28",
  },
];

function getInitialTenantData(theatreId: string) {
  if (theatreId === "th-mum-001") {
    return {
      profile: {
        id: THEATRE_B.id,
        name: THEATRE_B.name,
        slug: THEATRE_B.slug,
        code: THEATRE_B.code || "CSP-MUM-01",
        tagline: THEATRE_B.tagline || "Ultra-Luxury Flagship Multiplex",
        description: THEATRE_B.description || "West India Premier Multiplex",
        address: THEATRE_B.address,
        city: THEATRE_B.city,
        state: THEATRE_B.state,
        pinCode: THEATRE_B.pinCode || "400013",
        country: THEATRE_B.country || "India",
        phone: THEATRE_B.contact?.phone || "+91 22 4322 8800",
        email: THEATRE_B.contact?.email || "palladium.mumbai@cinesphere.com",
        website: THEATRE_B.contact?.website || "https://cinesphere.os/mumbai",
        openingTime: THEATRE_B.openingTime || "08:00 AM",
        closingTime: THEATRE_B.closingTime || "02:00 AM",
        timezone: THEATRE_B.timezone || "Asia/Kolkata",
        status: (THEATRE_B.status as any) || "Active",
        amenities: (THEATRE_B.amenities as string[]) || [
          "IMAX with Laser",
          "Dolby Atmos 64-Channel Spatial Audio",
          "Zero-Gravity Ultra Recliners",
          "Gourmet In-Seat Butler Dining",
          "Dedicated Valet Drop-off & Retrieval",
        ],
        latitude: 18.9932,
        longitude: 72.8258,
        rating: THEATRE_B.rating,
        hallCount: THEATRE_B.hallCount,
        heroImage: THEATRE_B.banner,
        bannerImage: THEATRE_B.banner,
        logo: THEATRE_B.logo,
      },
      paymentConfig: {
        businessName: "CineSphere Royale Palladium LLP",
        merchantName: THEATRE_B.upiDetails?.merchantName || "CineSphere Royale Mumbai",
        upiId: THEATRE_B.upiDetails?.upiId || "palladium.mumbai@hdfcbank",
        qrPlaceholder: THEATRE_B.upiDetails?.qrPlaceholder || "",
        bankName: THEATRE_B.upiDetails?.bankName || "HDFC Bank, Lower Parel",
        accountNumberMasked: THEATRE_B.upiDetails?.accountNumberMasked || "••••••••7732",
        ifscCode: THEATRE_B.upiDetails?.ifscCode || "HDFC0000060",
        settlementPeriod: (THEATRE_B.upiDetails?.settlementPeriod as any) || "T+0 Instant",
        gateways: {
          razorpay: { enabled: true, keyIdMasked: "rzp_live_••••••••8114" },
          phonepe: { enabled: true, merchantIdMasked: "M220199420" },
          paytm: { enabled: false, midMasked: "••••••••1940" },
          stripe: { enabled: true, pubKeyMasked: "pk_live_••••••••5519" },
        },
      },
      halls: [
        {
          id: "hall-mum-1",
          theatreId: "th-mum-001",
          hallNumber: 1,
          hallCode: "MUM-IMAX-01",
          name: "Auditorium 1 - Royale IMAX Laser",
          screenType: "IMAX Laser" as const,
          capacity: 240,
          projectionType: "Christie CP4450-RGB Pure Laser Engine",
          soundSystem: "Dolby Atmos 64-Channel Commercial Array",
          aspectRatio: "1.90:1 IMAX",
          floorNumber: "Floor 4 (Multiplex Concourse)",
          description: "Our signature flagship IMAX screen equipped with pure 4K RGB laser illumination.",
          status: "Active" as HallStatus,
          occupancyPercent: 94,
          currentMovie: "Kalki 2898 AD",
          currentShow: "06:30 PM",
          image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&auto=format&fit=crop&q=80",
          sections: [
            {
              id: "sec-mum-1a",
              name: "Section A - VIP Recliner",
              displayName: "VIP Recliner Tier",
              seatCount: 40,
              category: "VIP Recliner",
              sortOrder: 1,
              visibility: true,
              status: "Active" as const,
              rows: ["A", "B"],
              seatsPerRow: 20,
            },
            {
              id: "sec-mum-1b",
              name: "Section B - Platinum Club",
              displayName: "Platinum Club Tier",
              seatCount: 100,
              category: "Platinum",
              sortOrder: 2,
              visibility: true,
              status: "Active" as const,
              rows: ["C", "D", "E", "F", "G"],
              seatsPerRow: 20,
            },
            {
              id: "sec-mum-1c",
              name: "Section C - Gold Prime",
              displayName: "Gold Prime Tier",
              seatCount: 100,
              category: "Gold",
              sortOrder: 3,
              visibility: true,
              status: "Active" as const,
              rows: ["H", "I", "J", "K", "L"],
              seatsPerRow: 20,
            },
          ] satisfies DynamicHallSectionConfig[],
          layout: DEFAULT_3D_CONFIG,
          seatTemplate: generateAuditoriumSeatTemplate({
            hallId: "hall-mum-1",
            theatreId: "th-mum-001",
            capacity: 240,
            sections: [
              {
                id: "sec-mum-1a",
                name: "Section A - VIP Recliner",
                displayName: "VIP Recliner Tier",
                seatCount: 40,
                category: "VIP Recliner",
                sortOrder: 1,
                visibility: true,
                status: "Active" as const,
                rows: ["A", "B"],
                seatsPerRow: 20,
              },
              {
                id: "sec-mum-1b",
                name: "Section B - Platinum Club",
                displayName: "Platinum Club Tier",
                seatCount: 100,
                category: "Platinum",
                sortOrder: 2,
                visibility: true,
                status: "Active" as const,
                rows: ["C", "D", "E", "F", "G"],
                seatsPerRow: 20,
              },
              {
                id: "sec-mum-1c",
                name: "Section C - Gold Prime",
                displayName: "Gold Prime Tier",
                seatCount: 100,
                category: "Gold",
                sortOrder: 3,
                visibility: true,
                status: "Active" as const,
                rows: ["H", "I", "J", "K", "L"],
                seatsPerRow: 20,
              },
            ],
            name: "Royale IMAX Laser Seat Template",
          }),
          createdAt: "2026-08-15T10:00:00Z",
          updatedAt: "2026-11-01T15:30:00Z",
        },
        {
          id: "hall-mum-2",
          theatreId: "th-mum-001",
          hallNumber: 2,
          hallCode: "MUM-DOLBY-02",
          name: "Auditorium 2 - Dolby Cinema",
          screenType: "Dolby Cinema" as const,
          capacity: 180,
          projectionType: "Dolby Vision Dual Christie 4K",
          soundSystem: "Dolby Atmos 64-Channel Matrix",
          aspectRatio: "2.39:1 Scope",
          floorNumber: "Floor 4 (South Wing)",
          description: "Dual Christie 4K laser projection delivering 1,000,000:1 contrast ratio.",
          status: "Show Running" as HallStatus,
          occupancyPercent: 88,
          currentMovie: "Dune: Part Two",
          currentShow: "07:15 PM",
          image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80",
          sections: [
            {
              id: "sec-mum-2a",
              name: "Section A - Motorized Recliner",
              displayName: "Recliner Suite",
              seatCount: 40,
              category: "Recliner",
              sortOrder: 1,
              visibility: true,
              status: "Active" as const,
              rows: ["A", "B"],
              seatsPerRow: 20,
            },
            {
              id: "sec-mum-2b",
              name: "Section B - Executive Gold",
              displayName: "Gold Tier",
              seatCount: 60,
              category: "Gold",
              sortOrder: 2,
              visibility: true,
              status: "Active" as const,
              rows: ["C", "D", "E"],
              seatsPerRow: 20,
            },
            {
              id: "sec-mum-2c",
              name: "Section C - Standard Silver",
              displayName: "Silver Tier",
              seatCount: 80,
              category: "Silver",
              sortOrder: 3,
              visibility: true,
              status: "Active" as const,
              rows: ["F", "G", "H", "I"],
              seatsPerRow: 20,
            },
          ] satisfies DynamicHallSectionConfig[],
          layout: DEFAULT_3D_CONFIG,
          seatTemplate: generateAuditoriumSeatTemplate({
            hallId: "hall-mum-2",
            theatreId: "th-mum-001",
            capacity: 180,
            sections: [
              {
                id: "sec-mum-2a",
                name: "Section A - Motorized Recliner",
                displayName: "Recliner Suite",
                seatCount: 40,
                category: "Recliner",
                sortOrder: 1,
                visibility: true,
                status: "Active" as const,
                rows: ["A", "B"],
                seatsPerRow: 20,
              },
              {
                id: "sec-mum-2b",
                name: "Section B - Executive Gold",
                displayName: "Gold Tier",
                seatCount: 60,
                category: "Gold",
                sortOrder: 2,
                visibility: true,
                status: "Active" as const,
                rows: ["C", "D", "E"],
                seatsPerRow: 20,
              },
              {
                id: "sec-mum-2c",
                name: "Section C - Standard Silver",
                displayName: "Silver Tier",
                seatCount: 80,
                category: "Silver",
                sortOrder: 3,
                visibility: true,
                status: "Active" as const,
                rows: ["F", "G", "H", "I"],
                seatsPerRow: 20,
              },
            ],
            name: "Dolby Cinema Seat Template",
          }),
          createdAt: "2026-08-20T10:00:00Z",
          updatedAt: "2026-11-01T15:30:00Z",
        },
      ],
    };
  }

  // Default: THEATRE_A (Pune Flagship: th-pun-001)
  const SEED_PUNE_SECTIONS: Record<string, DynamicHallSectionConfig[]> = {
    "hall-01": [
      {
        id: "sec-p1a",
        name: "Section A - VIP Recliner",
        displayName: "VIP Recliner Tier",
        seatCount: 40,
        category: "VIP Recliner",
        sortOrder: 1,
        visibility: true,
        status: "Active" as const,
        rows: ["A", "B"],
        seatsPerRow: 20,
      },
      {
        id: "sec-p1b",
        name: "Section B - Platinum Club",
        displayName: "Platinum Tier",
        seatCount: 90,
        category: "Platinum",
        sortOrder: 2,
        visibility: true,
        status: "Active" as const,
        rows: ["C", "D", "E"],
        seatsPerRow: 30,
      },
      {
        id: "sec-p1c",
        name: "Section C - Gold Executive",
        displayName: "Gold Tier",
        seatCount: 120,
        category: "Gold",
        sortOrder: 3,
        visibility: true,
        status: "Active" as const,
        rows: ["F", "G", "H", "I"],
        seatsPerRow: 30,
      },
    ],
    "hall-02": [
      {
        id: "sec-p2a",
        name: "Section A - Motorized Recliner",
        displayName: "Recliner Suite",
        seatCount: 30,
        category: "Recliner",
        sortOrder: 1,
        visibility: true,
        status: "Active" as const,
        rows: ["A", "B"],
        seatsPerRow: 15,
      },
      {
        id: "sec-p2b",
        name: "Section B - Gold Executive",
        displayName: "Gold Tier",
        seatCount: 70,
        category: "Gold",
        sortOrder: 2,
        visibility: true,
        status: "Active" as const,
        rows: ["C", "D"],
        seatsPerRow: 35,
      },
      {
        id: "sec-p2c",
        name: "Section C - Silver Standard",
        displayName: "Silver Tier",
        seatCount: 80,
        category: "Silver",
        sortOrder: 3,
        visibility: true,
        status: "Active" as const,
        rows: ["E", "F"],
        seatsPerRow: 40,
      },
    ],
    "hall-03": [
      {
        id: "sec-p3a",
        name: "Section A - Platinum 4DX",
        displayName: "Platinum Motion Zone",
        seatCount: 48,
        category: "Platinum",
        sortOrder: 1,
        visibility: true,
        status: "Active" as const,
        rows: ["A", "B", "C"],
        seatsPerRow: 16,
      },
      {
        id: "sec-p3b",
        name: "Section B - Gold 4DX",
        displayName: "Gold Motion Zone",
        seatCount: 72,
        category: "Gold",
        sortOrder: 2,
        visibility: true,
        status: "Active" as const,
        rows: ["D", "E", "F"],
        seatsPerRow: 24,
      },
    ],
    "hall-04": [
      {
        id: "sec-p4a",
        name: "Section A - Silver",
        displayName: "Front Silver",
        seatCount: 20,
        category: "Silver",
        sortOrder: 1,
        visibility: true,
        status: "Active" as const,
        rows: ["A", "B"],
        seatsPerRow: 10,
      },
      {
        id: "sec-p4b",
        name: "Section B - Gold",
        displayName: "Center Gold",
        seatCount: 30,
        category: "Gold",
        sortOrder: 2,
        visibility: true,
        status: "Active" as const,
        rows: ["C", "D", "E"],
        seatsPerRow: 10,
      },
      {
        id: "sec-p4c",
        name: "Section C - Platinum",
        displayName: "Upper Platinum",
        seatCount: 50,
        category: "Platinum",
        sortOrder: 3,
        visibility: true,
        status: "Active" as const,
        rows: ["F", "G", "H", "I", "J"],
        seatsPerRow: 10,
      },
    ],
    "hall-05": [
      {
        id: "sec-p5a",
        name: "Section A - Royal Suite Lounger",
        displayName: "Royal Pods",
        seatCount: 24,
        category: "Royal Suite",
        sortOrder: 1,
        visibility: true,
        status: "Active" as const,
        rows: ["A", "B"],
        seatsPerRow: 12,
      },
      {
        id: "sec-p5b",
        name: "Section B - VIP Recliner",
        displayName: "VIP Recliners",
        seatCount: 36,
        category: "VIP Recliner",
        sortOrder: 2,
        visibility: true,
        status: "Active" as const,
        rows: ["C", "D", "E"],
        seatsPerRow: 12,
      },
    ],
    "hall-06": [
      {
        id: "sec-p6a",
        name: "Section A - Gold Executive",
        displayName: "Gold Tier",
        seatCount: 60,
        category: "Gold",
        sortOrder: 1,
        visibility: true,
        status: "Active" as const,
        rows: ["A", "B", "C"],
        seatsPerRow: 20,
      },
      {
        id: "sec-p6b",
        name: "Section B - Silver Standard",
        displayName: "Silver Tier",
        seatCount: 100,
        category: "Silver",
        sortOrder: 2,
        visibility: true,
        status: "Active" as const,
        rows: ["D", "E", "F", "G", "H"],
        seatsPerRow: 20,
      },
    ],
  };

  return {
    profile: {
      id: THEATRE_A.id,
      name: THEATRE_A.name,
      slug: THEATRE_A.slug,
      code: THEATRE_A.code || "CSG-PUN-01",
      tagline: THEATRE_A.tagline || "The Benchmark of Experiential Exhibition",
      description: THEATRE_A.description || "Our premier West India flagship cinema featuring Barco 4K Laser Projection.",
      address: THEATRE_A.address,
      city: THEATRE_A.city,
      state: THEATRE_A.state,
      pinCode: THEATRE_A.pinCode || "411014",
      country: THEATRE_A.country || "India",
      phone: THEATRE_A.contact?.phone || "+91 20 6689 4500",
      email: THEATRE_A.contact?.email || "guestrelations.pune@cinesphere.com",
      website: THEATRE_A.contact?.website || "https://cinesphere.os/pune",
      openingTime: THEATRE_A.openingTime || "08:30 AM",
      closingTime: THEATRE_A.closingTime || "01:30 AM",
      timezone: THEATRE_A.timezone || "Asia/Kolkata",
      status: (THEATRE_A.status as any) || "Active",
      amenities: (THEATRE_A.amenities as string[]) || [
        "Barco 4K Laser Projection",
        "Dolby Atmos 64-Channel Spatial Audio",
        "IMAX with Laser",
        "Zero-Gravity Ultra Recliners",
        "Gourmet In-Seat Butler Dining",
        "Dedicated Valet Drop-off & Retrieval",
      ],
      latitude: 18.5626,
      longitude: 73.9168,
      rating: THEATRE_A.rating,
      hallCount: THEATRE_A.hallCount,
      heroImage: THEATRE_A.banner,
      bannerImage: THEATRE_A.banner,
      logo: THEATRE_A.logo,
    },
    paymentConfig: {
      businessName: "CineSphere Multiplex Operations India Pvt Ltd",
      merchantName: THEATRE_A.upiDetails?.merchantName || "CineSphere Grand Cinemas Pune",
      upiId: THEATRE_A.upiDetails?.upiId || "cinesphere.pune@icici",
      qrPlaceholder: THEATRE_A.upiDetails?.qrPlaceholder || "",
      bankName: THEATRE_A.upiDetails?.bankName || "ICICI Bank, Viman Nagar",
      accountNumberMasked: THEATRE_A.upiDetails?.accountNumberMasked || "••••••••4810",
      ifscCode: THEATRE_A.upiDetails?.ifscCode || "ICIC0001042",
      settlementPeriod: (THEATRE_A.upiDetails?.settlementPeriod as any) || "T+0 Instant",
      gateways: {
        razorpay: { enabled: true, keyIdMasked: "rzp_live_••••••••9021" },
        phonepe: { enabled: true, merchantIdMasked: "M19830219" },
        paytm: { enabled: false, midMasked: "••••••••4481" },
        stripe: { enabled: true, pubKeyMasked: "pk_live_••••••••1290" },
      },
    },
    halls: SEED_HALLS.map((h, idx) => {
      const hallSections = SEED_PUNE_SECTIONS[h.id] || [
        {
          id: `sec-${h.id}-1`,
          name: "Section A - General Admission",
          displayName: "General Tier",
          seatCount: h.seatCount,
          category: "Gold",
          sortOrder: 1,
          visibility: true,
          status: "Active" as const,
          rows: ["A", "B", "C", "D"],
          seatsPerRow: Math.ceil(h.seatCount / 4),
        },
      ];

      let seatTemplate: SeatTemplateContainer | undefined;
      try {
        seatTemplate = generateAuditoriumSeatTemplate({
          hallId: h.id,
          theatreId: "th-pun-001",
          capacity: h.seatCount,
          sections: hallSections,
          name: `${h.name} Reusable Seat Template`,
        });
      } catch (e) {
        // fallback
      }

      return {
        id: h.id,
        theatreId: "th-pun-001",
        hallNumber: h.hallNumber,
        hallCode: `PUN-H0${h.hallNumber}`,
        name: h.name,
        screenType: h.screenType,
        capacity: h.seatCount,
        projectionType: h.projectorModel,
        soundSystem: h.audioSpec,
        aspectRatio: h.aspectRatio,
        floorNumber: idx < 3 ? "Floor 2 (Main Deck)" : "Floor 3 (VIP Level)",
        description: `${h.screenType} auditorium featuring ${h.projectorModel} and ${h.audioSpec}.`,
        status: h.status as HallStatus,
        occupancyPercent: h.occupancyPercent,
        currentMovie: h.currentMovie,
        currentShow: h.currentShow,
        image: h.image,
        sections: hallSections,
        layout: DEFAULT_3D_CONFIG,
        seatTemplate,
        createdAt: "2026-09-01T10:00:00Z",
        updatedAt: "2026-11-05T12:00:00Z",
      };
    }),
  };
}

export const useTheatreStore = create<TheatreState>()(
  persist(
    (set, get) => {
      const initial = getInitialTenantData("th-pun-001");

      return {
        activeTheatreId: "th-pun-001",
        profile: initial.profile,
        paymentConfig: initial.paymentConfig,
        halls: initial.halls,
        movies: SEED_MOVIES.map((m) => ({
          ...m,
          formats: m.formats as ("2D" | "3D" | "IMAX" | "4DX" | "Dolby Atmos")[],
          status: m.status as "Now Showing" | "Upcoming" | "Archived",
        })),
        pricingProfiles: INITIAL_PRICING_PROFILES,
        shows: SEED_SHOWS.map((s, idx) => {
          const profile = INITIAL_PRICING_PROFILES[idx % INITIAL_PRICING_PROFILES.length];
          const duration = 150;
          const intermission = 15;
          const cleaning = 20;
          const window = calculateScheduleWindow(s.startTime, duration, intermission, cleaning);
          return {
            ...s,
            showCode: `SH-PUN-0${idx + 1}-${s.format.replace(/\s+/g, "")}-${timeStringToMinutes(s.startTime)}`,
            slug: `pune-phoenix-${s.hallId}-${timeStringToMinutes(s.startTime)}`,
            theatreId: "th-pun-001",
            theatreName: "CineSphere Grand Cinemas (Phoenix Marketcity)",
            durationMinutes: duration,
            intermissionMinutes: intermission,
            cleaningBufferMinutes: cleaning,
            totalOccupiedMinutes: window.totalOccupiedMinutes,
            pricingProfileId: profile.id,
            pricingProfileName: profile.name,
            sectionPricing: profile.tierPricing,
            bookingStatus: s.status === "Cancelled" ? ("Cancelled" as const) : s.status === "Housefull" ? ("Sold Out" as const) : ("Booking Open" as const),
            salesStatus: s.status === "Cancelled" ? ("Off Sale" as const) : s.status === "Housefull" ? ("Sold Out" as const) : ("On Sale" as const),
            seatsAvailable: Math.max(0, s.totalSeats - s.seatsBooked),
            seatsBlocked: 0,
            occupancyPercent: s.totalSeats > 0 ? Math.round((s.seatsBooked / s.totalSeats) * 100) : 0,
            revenueEstimated: s.seatsBooked * s.ticketPrice,
            createdAt: "2026-11-01T08:00:00Z",
            updatedAt: "2026-11-05T12:00:00Z",
            format: s.format as "2D" | "3D" | "IMAX" | "4DX" | "Dolby Atmos",
            status: s.status as ShowStatus,
          };
        }),
        bookings: SEED_BOOKINGS.map((b) => ({
          ...b,
          paymentMethod: b.paymentMethod as MonitoredBooking["paymentMethod"],
          paymentStatus: b.paymentStatus as MonitoredBooking["paymentStatus"],
          bookingStatus: b.bookingStatus as MonitoredBooking["bookingStatus"],
        })),
        staff: SEED_STAFF.map((st) => ({
          ...st,
          role: st.role as ManagedStaff["role"],
          shift: st.shift as ManagedStaff["shift"],
          status: st.status as ManagedStaff["status"],
        })),
        media: SEED_MEDIA_PUNE,
        notifications: SEED_NOTIFICATIONS,
        auditLogs: [
          {
            id: "aud-01",
            timestamp: "Today, 10:45 AM",
            actor: "Rajesh Kulkarni",
            role: "Theatre Admin",
            action: "UPI_CONFIG_VERIFIED",
            module: "Payments",
            details: "Verified VPA cinesphere.pune@icici with ICICI Corporate Rail",
          },
          {
            id: "aud-02",
            timestamp: "Yesterday, 04:30 PM",
            actor: "Rajesh Kulkarni",
            role: "Theatre Admin",
            action: "SHOW_SCHEDULED",
            module: "Shows",
            details: "Programmed Pushpa 2: The Rule in Hall 1 IMAX (10:30 AM)",
          },
        ],

        // ----------------------------------------------------------------------
        // Tenant Isolation Switcher (for QA & verification between cinema venues)
        // ----------------------------------------------------------------------
        switchTenant: (theatreId: string) => {
          const tenantData = getInitialTenantData(theatreId);
          set({
            activeTheatreId: theatreId,
            profile: tenantData.profile,
            paymentConfig: tenantData.paymentConfig,
            halls: tenantData.halls,
          });
          get().logTenantAudit("TENANT_SWITCHED", "System", `Switched active context to tenant ${theatreId}`);
        },

        // ----------------------------------------------------------------------
        // Profile Management
        // ----------------------------------------------------------------------
        updateProfile: (updates) => {
          set((state) => ({
            profile: { ...state.profile, ...updates },
          }));
          get().logTenantAudit("PROFILE_UPDATED", "Profile", "Updated theatre operating details");
        },

        // ----------------------------------------------------------------------
        // Payment & UPI Configuration
        // ----------------------------------------------------------------------
        updatePaymentConfig: (updates) => {
          set((state) => ({
            paymentConfig: { ...state.paymentConfig, ...updates },
          }));
          get().logTenantAudit("PAYMENT_CONFIG_UPDATED", "UPI", "Updated merchant payment rails");
        },

        // ----------------------------------------------------------------------
        // Hall Management (Phase 2 Part 5)
        // ----------------------------------------------------------------------
        addHall: (hallData) => {
          const sections = hallData.sections || [];
          const totalSectionSeats = sections.reduce((acc, s) => acc + (Number(s.seatCount) || 0), 0);
          if (totalSectionSeats !== Number(hallData.capacity)) {
            return {
              success: false,
              error: `Capacity Mismatch: Hall capacity (${hallData.capacity}) does not match configured section seats (${totalSectionSeats}).`,
            };
          }

          let seatTemplate: SeatTemplateContainer | undefined;
          try {
            seatTemplate = generateAuditoriumSeatTemplate({
              hallId: `hall-${Date.now()}`,
              theatreId: get().activeTheatreId,
              capacity: Number(hallData.capacity),
              sections,
              name: `${hallData.name} Reusable Seat Template`,
            });
          } catch (e) {
            // fallback
          }

          const newHall: ManagedHall = {
            ...hallData,
            id: `hall-${Date.now()}`,
            theatreId: get().activeTheatreId,
            hallCode: hallData.hallCode || `H0${hallData.hallNumber}`,
            floorNumber: hallData.floorNumber || "Floor 1",
            description: hallData.description || "",
            status: hallData.status || "Active",
            occupancyPercent: 0,
            image: hallData.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
            layout: hallData.layout || DEFAULT_3D_CONFIG,
            seatTemplate,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            halls: [newHall, ...state.halls],
          }));

          get().logTenantAudit("HALL_CREATED", "Halls", `Created auditorium "${newHall.name}" (${newHall.hallCode}) with capacity ${newHall.capacity}`);
          return { success: true };
        },

        updateHall: (id, updates) => {
          const current = get().halls.find((h) => h.id === id);
          if (!current) return { success: false, error: "Auditorium not found." };

          const targetCapacity = updates.capacity !== undefined ? Number(updates.capacity) : current.capacity;
          const targetSections = updates.sections !== undefined ? updates.sections : current.sections || [];

          if (targetSections.length > 0) {
            const totalSectionSeats = targetSections.reduce((acc, s) => acc + (Number(s.seatCount) || 0), 0);
            if (totalSectionSeats !== targetCapacity) {
              return {
                success: false,
                error: `Capacity Mismatch: Hall capacity (${targetCapacity}) does not match configured section seats (${totalSectionSeats}).`,
              };
            }
          }

          let seatTemplate = current.seatTemplate;
          if (targetSections.length > 0) {
            try {
              seatTemplate = generateAuditoriumSeatTemplate({
                hallId: current.id,
                theatreId: current.theatreId || get().activeTheatreId,
                capacity: targetCapacity,
                sections: targetSections,
                name: `${updates.name || current.name} Reusable Seat Template`,
              });
            } catch (e) {
              // fallback
            }
          }

          set((state) => ({
            halls: state.halls.map((h) => (h.id === id ? { ...h, ...updates, seatTemplate, updatedAt: new Date().toISOString() } : h)),
          }));

          get().logTenantAudit("HALL_UPDATED", "Halls", `Updated configuration for "${current.name}"`);
          return { success: true };
        },

        archiveHall: (id) => {
          const current = get().halls.find((h) => h.id === id);
          set((state) => ({
            halls: state.halls.map((h) => (h.id === id ? { ...h, status: "Archived" } : h)),
          }));
          get().logTenantAudit("HALL_ARCHIVED", "Halls", `Archived auditorium "${current?.name || id}"`);
        },

        activateHall: (id) => {
          const current = get().halls.find((h) => h.id === id);
          set((state) => ({
            halls: state.halls.map((h) => (h.id === id ? { ...h, status: "Active" } : h)),
          }));
          get().logTenantAudit("HALL_ACTIVATED", "Halls", `Activated auditorium "${current?.name || id}"`);
        },

        deactivateHall: (id) => {
          const current = get().halls.find((h) => h.id === id);
          set((state) => ({
            halls: state.halls.map((h) => (h.id === id ? { ...h, status: "Inactive" } : h)),
          }));
          get().logTenantAudit("HALL_DEACTIVATED", "Halls", `Deactivated auditorium "${current?.name || id}"`);
        },

        duplicateHall: (id) => {
          const original = get().halls.find((h) => h.id === id);
          if (!original) return { success: false, error: "Original auditorium not found." };

          const newId = `hall-${Date.now()}`;
          const nextHallNumber = Math.max(...get().halls.map((h) => h.hallNumber), 0) + 1;
          let duplicatedTemplate: SeatTemplateContainer | undefined;
          if (original.sections && original.sections.length > 0) {
            try {
              duplicatedTemplate = generateAuditoriumSeatTemplate({
                hallId: newId,
                theatreId: original.theatreId || get().activeTheatreId,
                capacity: original.capacity,
                sections: original.sections,
                name: `${original.name} (Copy) Reusable Seat Template`,
              });
            } catch (e) {
              // fallback
            }
          }

          const duplicated: ManagedHall = {
            ...original,
            id: newId,
            name: `${original.name} (Copy)`,
            hallCode: `${original.hallCode || "H"}-COPY`,
            hallNumber: nextHallNumber,
            status: "Draft",
            occupancyPercent: 0,
            currentMovie: undefined,
            currentShow: undefined,
            sections: original.sections.map((s, idx) => ({
              ...s,
              id: `sec-${newId}-${idx + 1}`,
            })),
            seatTemplate: duplicatedTemplate,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            halls: [...state.halls, duplicated],
          }));

          get().logTenantAudit("HALL_DUPLICATED", "Halls", `Duplicated "${original.name}" into "${duplicated.name}" (${duplicated.hallCode})`);
          return { success: true, newId };
        },

        deleteHall: (id) => {
          const current = get().halls.find((h) => h.id === id);
          set((state) => ({
            halls: state.halls.filter((h) => h.id !== id),
          }));
          get().logTenantAudit("HALL_DELETED", "Halls", `Deleted auditorium "${current?.name || id}"`);
        },

        generateSeatsForHall: (hallId) => {
          const current = get().halls.find((h) => h.id === hallId);
          if (!current) return { success: false, error: "Auditorium not found." };

          try {
            const template = generateAuditoriumSeatTemplate({
              hallId: current.id,
              theatreId: current.theatreId || get().activeTheatreId,
              capacity: current.capacity,
              sections: current.sections,
              name: `${current.name} Reusable Seat Template`,
            });

            set((state) => ({
              halls: state.halls.map((h) =>
                h.id === hallId ? { ...h, seatTemplate: template, updatedAt: new Date().toISOString() } : h
              ),
            }));

            get().logTenantAudit(
              "SEATS_GENERATED",
              "Halls",
              `Automatically generated ${template.totalGeneratedSeats} seat records for "${current.name}" (${current.hallCode})`
            );

            return { success: true, template };
          } catch (err: any) {
            return { success: false, error: err.message || "Failed to generate seat matrix." };
          }
        },

        regenerateSeatsForHall: (hallId) => {
          const current = get().halls.find((h) => h.id === hallId);
          if (!current) return { success: false, error: "Auditorium not found." };

          try {
            const template = generateAuditoriumSeatTemplate({
              hallId: current.id,
              theatreId: current.theatreId || get().activeTheatreId,
              capacity: current.capacity,
              sections: current.sections,
              name: `${current.name} Reusable Seat Template`,
            });

            set((state) => ({
              halls: state.halls.map((h) =>
                h.id === hallId ? { ...h, seatTemplate: template, updatedAt: new Date().toISOString() } : h
              ),
            }));

            get().logTenantAudit(
              "SEATS_REGENERATED",
              "Halls",
              `Regenerated deterministic seat template (${template.totalGeneratedSeats} seats) for "${current.name}" (${current.hallCode})`
            );

            return { success: true, template };
          } catch (err: any) {
            return { success: false, error: err.message || "Failed to regenerate seat matrix." };
          }
        },

        deleteSeatsForHall: (hallId) => {
          const current = get().halls.find((h) => h.id === hallId);
          if (!current) return { success: false, error: "Auditorium not found." };

          set((state) => ({
            halls: state.halls.map((h) =>
              h.id === hallId ? { ...h, seatTemplate: undefined, updatedAt: new Date().toISOString() } : h
            ),
          }));

          get().logTenantAudit(
            "SEATS_DELETED",
            "Halls",
            `Deleted seat template for auditorium "${current.name}" (${current.hallCode})`
          );

          return { success: true };
        },

        // ----------------------------------------------------------------------
        // Movie Catalog (Entry Point CRUD)
        // ----------------------------------------------------------------------
        addMovie: (movie) => {
          const newMovie: ManagedMovie = {
            ...movie,
            id: `mov-${Date.now()}`,
          };
          set((state) => ({
            movies: [newMovie, ...state.movies],
          }));
          get().logTenantAudit("MOVIE_ADDED", "Catalog", `Added exhibition print for "${movie.title}"`);
        },

        updateMovie: (id, updates) => {
          set((state) => ({
            movies: state.movies.map((m) => (m.id === id ? { ...m, ...updates } : m)),
          }));
          get().logTenantAudit("MOVIE_UPDATED", "Catalog", `Updated movie ID ${id}`);
        },

        archiveMovie: (id) => {
          set((state) => ({
            movies: state.movies.map((m) => (m.id === id ? { ...m, status: "Archived" } : m)),
          }));
          get().logTenantAudit("MOVIE_ARCHIVED", "Catalog", `Archived exhibition license for movie ID ${id}`);
        },

        linkGlobalMovie: (globalMovie, options) => {
          // Check if already linked
          const exists = get().movies.some(
            (m) => m.movieId === globalMovie.id || m.title.toLowerCase() === globalMovie.title.toLowerCase()
          );
          if (exists) {
            return { success: false, error: `"${globalMovie.title}" is already in your theatre exhibition catalog.` };
          }

          const runtimeFormatted = `${Math.floor(globalMovie.durationMinutes / 60)}h ${globalMovie.durationMinutes % 60}m`;
          const activeTheatre = get().activeTheatreId;

          const linkedMovie: ManagedMovie = {
            id: `th-mov-${activeTheatre}-${globalMovie.id}`,
            movieId: globalMovie.id,
            title: globalMovie.title,
            poster: globalMovie.posterUrl,
            backdrop: globalMovie.bannerUrl,
            language: options?.language || globalMovie.primaryLanguage,
            genre: globalMovie.genres,
            rating: globalMovie.certificate,
            runtime: runtimeFormatted,
            releaseDate: globalMovie.releaseDate,
            status: options?.status || (globalMovie.status === "Upcoming" ? "Upcoming" : "Now Showing"),
            formats: options?.formats || globalMovie.formats,
            director: globalMovie.crew.find((c) => c.role === "Director")?.name || "Acclaimed Filmmaker",
            leadCast: globalMovie.cast.slice(0, 4).map((c) => c.actorName),
            synopsis: globalMovie.synopsis,
            trailerUrl: globalMovie.trailers[0]?.videoUrl,
            kdmStatus: "Valid",
            kdmKeyId: `KDM-${activeTheatre.slice(0, 6).toUpperCase()}-${globalMovie.id.slice(0, 6).toUpperCase()}`,
          };

          set((state) => ({
            movies: [linkedMovie, ...state.movies],
          }));

          get().logTenantAudit(
            "MOVIE_LINKED",
            "Catalog",
            `Acquired exhibition screening license for Master Movie "${globalMovie.title}"`
          );
          return { success: true };
        },

        unlinkMovie: (id) => {
          const target = get().movies.find((m) => m.id === id);
          set((state) => ({
            movies: state.movies.filter((m) => m.id !== id),
          }));
          get().logTenantAudit(
            "MOVIE_UNLINKED",
            "Catalog",
            `Removed exhibition license for "${target?.title || id}"`
          );
        },

        updateMovieScreeningStatus: (id, status) => {
          const target = get().movies.find((m) => m.id === id);
          set((state) => ({
            movies: state.movies.map((m) => (m.id === id ? { ...m, status } : m)),
          }));
          get().logTenantAudit(
            "MOVIE_STATUS_CHANGED",
            "Catalog",
            `Changed screening status of "${target?.title || id}" to ${status}`
          );
        },

        // ----------------------------------------------------------------------
        // ----------------------------------------------------------------------
        // Pricing Profiles (Phase 2 Part 8)
        // ----------------------------------------------------------------------
        addPricingProfile: (profile) => {
          const newProfile: PricingProfile = {
            ...profile,
            id: `pp-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({
            pricingProfiles: [newProfile, ...state.pricingProfiles],
          }));
          get().logTenantAudit(
            "PRICING_PROFILE_CREATED",
            "Pricing",
            `Created pricing profile "${profile.name}"`
          );
        },

        updatePricingProfile: (id, updates) => {
          set((state) => ({
            pricingProfiles: state.pricingProfiles.map((p) =>
              p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
            ),
          }));
          get().logTenantAudit(
            "PRICING_PROFILE_UPDATED",
            "Pricing",
            `Updated pricing profile ID ${id}`
          );
        },

        deletePricingProfile: (id) => {
          const target = get().pricingProfiles.find((p) => p.id === id);
          set((state) => ({
            pricingProfiles: state.pricingProfiles.filter((p) => p.id !== id),
          }));
          get().logTenantAudit(
            "PRICING_PROFILE_DELETED",
            "Pricing",
            `Deleted pricing profile "${target?.name || id}"`
          );
        },

        // ----------------------------------------------------------------------
        // Show Programming (Phase 2 Part 8)
        // ----------------------------------------------------------------------
        addShow: (show) => {
          const showId = `shw-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const duration = show.durationMinutes || 150;
          const intermission = show.intermissionMinutes ?? 15;
          const cleaning = show.cleaningBufferMinutes ?? 20;
          const window = calculateScheduleWindow(show.startTime, duration, intermission, cleaning);

          const hall = get().halls.find((h) => h.id === show.hallId);
          const totalSeats = show.totalSeats || hall?.capacity || 200;

          // Resolve Pricing Profile
          const pricingProfile =
            get().pricingProfiles.find((p) => p.id === show.pricingProfileId) ||
            get().pricingProfiles[0] ||
            INITIAL_PRICING_PROFILES[0];

          // Check for conflicts
          const conflict = detectScheduleConflict(
            {
              hallId: show.hallId,
              date: show.date,
              startTime: show.startTime,
              durationMinutes: duration,
              intermissionMinutes: intermission,
              cleaningBufferMinutes: cleaning,
            },
            get().shows
          );

          if (conflict.hasConflict) {
            return { success: false, error: conflict.message };
          }

          const newShow: ManagedShow = {
            ...show,
            id: showId,
            showCode:
              show.showCode ||
              `SH-${show.hallId.toUpperCase()}-${timeStringToMinutes(show.startTime)}`,
            slug: `${show.hallId}-${timeStringToMinutes(show.startTime)}`,
            theatreId: get().activeTheatreId,
            theatreName: get().profile.name,
            hallName: show.hallName || hall?.name || "Auditorium",
            hallCode: hall?.hallCode,
            screenType: hall?.screenType,
            endTime: show.endTime || window.endTimeFormatted,
            durationMinutes: duration,
            intermissionMinutes: intermission,
            cleaningBufferMinutes: cleaning,
            totalOccupiedMinutes: window.totalOccupiedMinutes,
            pricingProfileId: pricingProfile.id,
            pricingProfileName: pricingProfile.name,
            sectionPricing: pricingProfile.tierPricing,
            ticketPrice: show.ticketPrice || pricingProfile.tierPricing["Silver"] || 250,
            seatsBooked: 0,
            totalSeats,
            seatsAvailable: totalSeats,
            seatsBlocked: 0,
            occupancyPercent: 0,
            revenueEstimated: 0,
            status: show.status || "Scheduled",
            bookingStatus: show.bookingStatus || "Booking Open",
            salesStatus: show.salesStatus || "On Sale",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            shows: [newShow, ...state.shows],
          }));

          get().logTenantAudit(
            "SHOW_PROGRAMMED",
            "Shows",
            `Scheduled "${show.movieTitle}" in ${newShow.hallName} on ${show.date} at ${newShow.startTime}`
          );

          return { success: true, show: newShow };
        },

        updateShow: (id, updates) => {
          const current = get().shows.find((s) => s.id === id);
          if (!current) return { success: false, error: "Show not found." };

          const startTime = updates.startTime || current.startTime;
          const duration = updates.durationMinutes || current.durationMinutes || 150;
          const intermission = updates.intermissionMinutes ?? current.intermissionMinutes ?? 15;
          const cleaning = updates.cleaningBufferMinutes ?? current.cleaningBufferMinutes ?? 20;
          const window = calculateScheduleWindow(startTime, duration, intermission, cleaning);

          const updatedShow: ManagedShow = {
            ...current,
            ...updates,
            startTime,
            endTime: window.endTimeFormatted,
            durationMinutes: duration,
            intermissionMinutes: intermission,
            cleaningBufferMinutes: cleaning,
            totalOccupiedMinutes: window.totalOccupiedMinutes,
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            shows: state.shows.map((s) => (s.id === id ? updatedShow : s)),
          }));

          get().logTenantAudit(
            "SHOW_UPDATED",
            "Shows",
            `Updated schedule parameters for show ID ${id}`
          );

          return { success: true, show: updatedShow };
        },

        cancelShow: (id, reason = "Operational Adjustment") => {
          const target = get().shows.find((s) => s.id === id);
          set((state) => ({
            shows: state.shows.map((s) =>
              s.id === id
                ? {
                    ...s,
                    status: "Cancelled" as const,
                    bookingStatus: "Cancelled" as const,
                    salesStatus: "Off Sale" as const,
                  }
                : s
            ),
          }));
          get().logTenantAudit(
            "SHOW_CANCELLED",
            "Shows",
            `Cancelled showtime "${target?.movieTitle || id}" (${reason})`
          );
        },

        archiveShow: (id) => {
          const target = get().shows.find((s) => s.id === id);
          set((state) => ({
            shows: state.shows.map((s) =>
              s.id === id
                ? {
                    ...s,
                    status: "Archived" as const,
                    bookingStatus: "Booking Closed" as const,
                    salesStatus: "Off Sale" as const,
                  }
                : s
            ),
          }));
          get().logTenantAudit(
            "SHOW_ARCHIVED",
            "Shows",
            `Archived showtime "${target?.movieTitle || id}"`
          );
        },

        duplicateShow: (id, newDate, newStartTime) => {
          const source = get().shows.find((s) => s.id === id);
          if (!source) return { success: false, error: "Source show not found." };

          const date = newDate || source.date;
          const startTime = newStartTime || source.startTime;

          return get().addShow({
            ...source,
            date,
            startTime,
            status: "Scheduled",
            bookingStatus: "Booking Open",
            salesStatus: "On Sale",
          });
        },

        // ----------------------------------------------------------------------
        // Staff Management
        // ----------------------------------------------------------------------
        addStaff: (staffMember) => {
          const newMember: ManagedStaff = {
            ...staffMember,
            id: `stf-${Date.now()}`,
          };
          set((state) => ({
            staff: [newMember, ...state.staff],
          }));
          get().logTenantAudit("STAFF_ADDED", "Staff", `Onboarded employee ${staffMember.name} as ${staffMember.role}`);
        },

        toggleStaffStatus: (id) => {
          set((state) => ({
            staff: state.staff.map((st) => {
              if (st.id === id) {
                const nextStatus: ManagedStaff["status"] =
                  st.status === "On Duty" ? "Off Duty" : st.status === "Off Duty" ? "On Leave" : "On Duty";
                return { ...st, status: nextStatus };
              }
              return st;
            }),
          }));
          get().logTenantAudit("STAFF_STATUS_CHANGED", "Staff", `Toggled duty status for staff ID ${id}`);
        },

        updateStaffRole: (id, role) => {
          set((state) => ({
            staff: state.staff.map((st) => (st.id === id ? { ...st, role } : st)),
          }));
          get().logTenantAudit("STAFF_ROLE_UPDATED", "Staff", `Reassigned role to ${role} for staff ID ${id}`);
        },

        // ----------------------------------------------------------------------
        // Media Library
        // ----------------------------------------------------------------------
        uploadMedia: (asset) => {
          const newAsset: ManagedMediaAsset = {
            ...asset,
            id: `med-${Date.now()}`,
            uploadedAt: new Date().toISOString().split("T")[0],
          };
          set((state) => ({
            media: [newAsset, ...state.media],
          }));
          get().logTenantAudit("MEDIA_UPLOADED", "Media", `Uploaded creative asset "${asset.title}"`);
        },

        deleteMedia: (id) => {
          set((state) => ({
            media: state.media.filter((m) => m.id !== id),
          }));
          get().logTenantAudit("MEDIA_DELETED", "Media", `Removed media asset ID ${id}`);
        },

        // ----------------------------------------------------------------------
        // Notifications & Audit Trail
        // ----------------------------------------------------------------------
        markNotificationRead: (id) => {
          set((state) => ({
            notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
          }));
        },

        logTenantAudit: (action, module, details) => {
          const newLog: TheatreAuditLog = {
            id: `aud-${Date.now()}`,
            timestamp: "Just now",
            actor: get().profile.email || "Theatre Admin",
            role: "Theatre Admin",
            action,
            module,
            details,
          };
          set((state) => ({
            auditLogs: [newLog, ...state.auditLogs.slice(0, 49)],
          }));
        },
      };
    },
    {
      name: "cinesphere-theatre-storage",
      partialize: (state) => ({
        activeTheatreId: state.activeTheatreId,
        profile: state.profile,
        paymentConfig: state.paymentConfig,
        halls: state.halls,
        movies: state.movies,
        shows: state.shows,
        pricingProfiles: state.pricingProfiles,
        staff: state.staff,
        media: state.media,
        auditLogs: state.auditLogs,
      }),
    }
  )
);
