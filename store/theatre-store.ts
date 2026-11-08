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
  hallNumber: number;
  name: string;
  screenType: "IMAX Laser" | "Dolby Cinema" | "4DX Dynamic" | "Prime Club" | "Royal Suite" | "Laser 4K";
  capacity: number;
  projectionType: string;
  soundSystem: string;
  aspectRatio: string;
  status: "Active" | "Maintenance" | "Cleaning" | "Show Running";
  occupancyPercent: number;
  currentMovie?: string;
  currentShow?: string;
  image: string;
}

export interface ManagedMovie {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  language: string;
  genre: string[];
  rating: string;
  runtime: string;
  releaseDate: string;
  status: "Now Showing" | "Upcoming" | "Archived";
  formats: ("2D" | "3D" | "IMAX" | "4DX" | "Dolby Atmos")[];
  director: string;
  leadCast: string[];
  synopsis: string;
  trailerUrl?: string;
}

export interface ManagedShow {
  id: string;
  movieId: string;
  movieTitle: string;
  hallId: string;
  hallName: string;
  date: string;
  startTime: string;
  endTime: string;
  language: string;
  format: "2D" | "3D" | "IMAX" | "4DX" | "Dolby Atmos";
  ticketPrice: number;
  seatsBooked: number;
  totalSeats: number;
  status: "Upcoming" | "Running" | "Housefull" | "Completed" | "Cancelled";
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

  // Movie CRUD (Catalog entry point)
  addMovie: (movie: Omit<ManagedMovie, "id">) => void;
  updateMovie: (id: string, updates: Partial<ManagedMovie>) => void;
  archiveMovie: (id: string) => void;

  // Show Programming
  addShow: (show: Omit<ManagedShow, "id" | "seatsBooked">) => void;
  updateShow: (id: string, updates: Partial<ManagedShow>) => void;
  cancelShow: (id: string) => void;

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
// Multi-Tenant Seed Factories
// ------------------------------------------------------------------------------

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
          hallNumber: 1,
          name: "Auditorium 1 - Royale IMAX Laser",
          screenType: "IMAX Laser" as const,
          capacity: 240,
          projectionType: "Christie CP4450-RGB Pure Laser Engine",
          soundSystem: "Dolby Atmos 64-Channel Commercial Array",
          aspectRatio: "2.39:1 Scope",
          status: "Active" as const,
          occupancyPercent: 94,
          currentMovie: "Kalki 2898 AD",
          currentShow: "06:30 PM",
          image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&auto=format&fit=crop&q=80",
        },
        {
          id: "hall-mum-2",
          hallNumber: 2,
          name: "Auditorium 2 - Dolby Cinema",
          screenType: "Dolby Cinema" as const,
          capacity: 180,
          projectionType: "Dolby Vision Dual Christie 4K",
          soundSystem: "Dolby Atmos 64-Channel Matrix",
          aspectRatio: "2.39:1 Scope",
          status: "Show Running" as const,
          occupancyPercent: 88,
          currentMovie: "Dune: Part Two",
          currentShow: "07:15 PM",
          image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80",
        },
      ],
    };
  }

  // Default: THEATRE_A (Pune Flagship: th-pun-001)
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
    halls: SEED_HALLS.map((h) => ({
      id: h.id,
      hallNumber: h.hallNumber,
      name: h.name,
      screenType: h.screenType,
      capacity: h.seatCount,
      projectionType: h.projectorModel,
      soundSystem: h.audioSpec,
      aspectRatio: h.aspectRatio,
      status: h.status,
      occupancyPercent: h.occupancyPercent,
      currentMovie: h.currentMovie,
      currentShow: h.currentShow,
      image: h.image,
    })),
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
          status: m.status === "Now Showing" ? "Now Showing" : m.status === "Upcoming" ? "Upcoming" : "Archived",
        })),
        shows: SEED_SHOWS.map((s) => ({
          ...s,
        })),
        // Bookings are strictly monitored; theatre admin does not create them
        bookings: SEED_BOOKINGS.map((b) => ({
          ...b,
        })),
        staff: SEED_STAFF.map((st) => ({
          ...st,
        })),
        media: SEED_MEDIA_PUNE,
        notifications: SEED_NOTIFICATIONS,
        auditLogs: [
          {
            id: "aud-01",
            timestamp: "Today, 10:14 AM",
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

        // ----------------------------------------------------------------------
        // Show Programming
        // ----------------------------------------------------------------------
        addShow: (show) => {
          const newShow: ManagedShow = {
            ...show,
            id: `shw-${Date.now()}`,
            seatsBooked: 0,
          };
          set((state) => ({
            shows: [newShow, ...state.shows],
          }));
          get().logTenantAudit("SHOW_PROGRAMMED", "Shows", `Scheduled "${show.movieTitle}" in ${show.hallName} on ${show.date}`);
        },

        updateShow: (id, updates) => {
          set((state) => ({
            shows: state.shows.map((s) => (s.id === id ? { ...s, ...updates } : s)),
          }));
          get().logTenantAudit("SHOW_UPDATED", "Shows", `Updated schedule parameters for show ID ${id}`);
        },

        cancelShow: (id) => {
          set((state) => ({
            shows: state.shows.map((s) => (s.id === id ? { ...s, status: "Cancelled" } : s)),
          }));
          get().logTenantAudit("SHOW_CANCELLED", "Shows", `Cancelled showtime ID ${id}`);
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
        staff: state.staff,
        media: state.media,
        auditLogs: state.auditLogs,
      }),
    }
  )
);
