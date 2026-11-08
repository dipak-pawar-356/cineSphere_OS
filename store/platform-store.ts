"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DUMMY_THEATRES } from "@/lib/constants/theatres";

/**
 * ==============================================================================
 * CineSphere OS - Super Admin Platform State Store
 * Centralized reactive store managing platform governance, approvals, subscriptions,
 * amenities, geographic jurisdictions, global settings, and audit logs.
 * ==============================================================================
 */

export type TheatreApprovalStatus =
  | "Active"
  | "Pending Approval"
  | "Suspended"
  | "Maintenance"
  | "Rejected";

export interface ManagedTheatre {
  id: string;
  slug: string;
  name: string;
  chain: string;
  logo: string;
  banner: string;
  address: string;
  city: string;
  state: string;
  pinCode?: string;
  country: string;
  rating: number;
  hallCount: number;
  screenTypes: string[];
  pricingTier: string;
  status: TheatreApprovalStatus;
  adminName: string;
  adminEmail: string;
  contactNumber: string;
  gstNumber: string;
  subscriptionPlan: "Free" | "Starter" | "Professional" | "Enterprise";
  subscriptionRenewal: string;
  grossRevenueMonthly: number;
  totalBookings: number;
  registeredDate: string;
  rejectionReason?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: "Free" | "Starter" | "Professional" | "Enterprise";
  priceMonthly: number;
  billingPeriod: "Monthly" | "Annual";
  screensAllowed: string;
  commissionPercent: number;
  features: string[];
  activeTheatresCount: number;
  status: "Active" | "Legacy" | "Promotional";
}

export interface ManagedCity {
  id: string;
  name: string;
  slug: string;
  state: string;
  country: string;
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  theatreCount: number;
  isActive: boolean;
  latitude: number;
  longitude: number;
}

export interface ManagedAmenity {
  id: string;
  slug: string;
  name: string;
  category: "Projection & Sound" | "Seating & Comfort" | "Hospitality & F&B" | "Convenience";
  iconName: string;
  description: string;
  theatresEquipped: number;
  isActive: boolean;
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  description: string;
  priority: "Urgent" | "High" | "Normal";
  audience: "All Users" | "Theatre Admins" | "Staff Members" | "Customers";
  publishDate: string;
  expiryDate: string;
  status: "Active" | "Scheduled" | "Expired";
  author: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  theatreName: string;
  submitterEmail: string;
  subject: string;
  category: "Hardware / Projection" | "Settlements & UPI" | "Ticketing" | "Platform Bug" | "Feature Request";
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformAuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  module: string;
  description: string;
  ipAddress: string;
  device: string;
}

export interface PlatformSettings {
  appName: string;
  tagline: string;
  logoUrl: string;
  maintenanceMode: boolean;
  defaultCurrency: string;
  currencySymbol: string;
  timezone: string;
  convenienceFeePerSeat: number;
  gstPercent: number;
  twoFactorEnforced: boolean;
  sessionTimeoutMinutes: number;
  smtpHost: string;
  smsGateway: string;
  apiKeyLive: string;
}

interface PlatformState {
  theatres: ManagedTheatre[];
  subscriptions: SubscriptionPlan[];
  cities: ManagedCity[];
  amenities: ManagedAmenity[];
  announcements: PlatformAnnouncement[];
  supportTickets: SupportTicket[];
  auditLogs: PlatformAuditLog[];
  settings: PlatformSettings;

  // Actions
  approveTheatre: (id: string) => void;
  rejectTheatre: (id: string, reason?: string) => void;
  suspendTheatre: (id: string) => void;
  activateTheatre: (id: string) => void;
  updateTheatre: (id: string, partial: Partial<ManagedTheatre>) => void;
  deleteTheatre: (id: string) => void;

  addCity: (city: Omit<ManagedCity, "id" | "theatreCount">) => void;
  toggleCityActive: (id: string) => void;
  deleteCity: (id: string) => void;

  addAmenity: (amenity: Omit<ManagedAmenity, "id" | "theatresEquipped">) => void;
  toggleAmenityActive: (id: string) => void;

  addAnnouncement: (announcement: Omit<PlatformAnnouncement, "id">) => void;
  deleteAnnouncement: (id: string) => void;

  updateTicketStatus: (id: string, status: SupportTicket["status"]) => void;
  assignTicket: (id: string, assignee: string) => void;

  updateSettings: (partial: Partial<PlatformSettings>) => void;
  logAuditEvent: (action: string, module: string, description: string) => void;
}

// ------------------------------------------------------------------------------
// Seed Data Initialization
// ------------------------------------------------------------------------------

const INITIAL_THEATRES: ManagedTheatre[] = [
  ...DUMMY_THEATRES.map((th, idx) => ({
    id: th.id,
    slug: th.slug,
    name: th.name,
    chain: th.chain,
    logo: th.logo,
    banner: th.banner,
    address: th.address,
    city: th.city,
    state: th.state,
    pinCode: th.pinCode || "411014",
    country: th.country || "India",
    rating: th.rating,
    hallCount: th.hallCount,
    screenTypes: th.screenTypes,
    pricingTier: th.pricingTier,
    status: (idx === 1 ? "Pending Approval" : idx === 3 ? "Suspended" : "Active") as TheatreApprovalStatus,
    adminName: idx === 1 ? "Vikram Malhotra" : "Rajesh Sharma",
    adminEmail: idx === 1 ? "vikram.m@wavecinemas.in" : "rajesh.sharma@cinesphere.com",
    contactNumber: th.contact?.phone || "+91 20 6689 0000",
    gstNumber: th.gstNumber || `27AABCP${1000 + idx}C1Z5`,
    subscriptionPlan: (idx === 0 ? "Enterprise" : idx === 1 ? "Starter" : "Professional") as any,
    subscriptionRenewal: "2027-03-31",
    grossRevenueMonthly: 4820000 + idx * 350000,
    totalBookings: 12450 + idx * 820,
    registeredDate: "2026-01-15",
  })),
  {
    id: "th-sur-991",
    slug: "cinewave-diamond-surat",
    name: "CineWave Diamond City Multiplex",
    chain: "CineWave Cinemas",
    logo: "/placeholders/theatre-1.jpg",
    banner: "/placeholders/hero-banner.jpg",
    address: "VR Mall, Dumas Road, Magdalla",
    city: "Surat",
    state: "Gujarat",
    pinCode: "395007",
    country: "India",
    rating: 4.6,
    hallCount: 6,
    screenTypes: ["IMAX with Laser", "Dolby Atmos", "4DX"],
    pricingTier: "Luxury",
    status: "Pending Approval",
    adminName: "Jayesh Patel",
    adminEmail: "jayesh.p@cinewave.in",
    contactNumber: "+91 261 458 9000",
    gstNumber: "24AAECW9812K1Z9",
    subscriptionPlan: "Enterprise",
    subscriptionRenewal: "2027-01-01",
    grossRevenueMonthly: 0,
    totalBookings: 0,
    registeredDate: "2026-11-08",
  },
  {
    id: "th-jai-992",
    slug: "starlight-heritage-jaipur",
    name: "Starlight Heritage Cinema Palace",
    chain: "Starlight Theatres",
    logo: "/placeholders/theatre-2.jpg",
    banner: "/placeholders/hero-banner.jpg",
    address: "World Trade Park, Malviya Nagar",
    city: "Jaipur",
    state: "Rajasthan",
    pinCode: "302017",
    country: "India",
    rating: 4.8,
    hallCount: 5,
    screenTypes: ["Dolby Cinema", "Laser 4K"],
    pricingTier: "Premium",
    status: "Pending Approval",
    adminName: "Harshvardhan Rathore",
    adminEmail: "harsh.r@starlight.co.in",
    contactNumber: "+91 141 398 2200",
    gstNumber: "08AAGCS4412B1Z3",
    subscriptionPlan: "Professional",
    subscriptionRenewal: "2027-02-15",
    grossRevenueMonthly: 0,
    totalBookings: 0,
    registeredDate: "2026-11-07",
  },
];

const INITIAL_SUBSCRIPTIONS: SubscriptionPlan[] = [
  {
    id: "sub-free",
    name: "Free",
    priceMonthly: 0,
    billingPeriod: "Monthly",
    screensAllowed: "Up to 2 Screens",
    commissionPercent: 5.5,
    features: ["Standard 2D Booking", "Basic Box Office POS", "Standard Email Support", "Daily Reconciliation"],
    activeTheatresCount: 3,
    status: "Active",
  },
  {
    id: "sub-starter",
    name: "Starter",
    priceMonthly: 14999,
    billingPeriod: "Monthly",
    screensAllowed: "Up to 5 Screens",
    commissionPercent: 4.0,
    features: [
      "Dynamic CAD Seating Layouts",
      "UPI Instant QR Settlements",
      "WhatsApp m-Ticket Dispatches",
      "Automated Daily Tax Filings",
      "Standard Analytics",
    ],
    activeTheatresCount: 8,
    status: "Active",
  },
  {
    id: "sub-professional",
    name: "Professional",
    priceMonthly: 34999,
    billingPeriod: "Monthly",
    screensAllowed: "Up to 12 Screens",
    commissionPercent: 2.8,
    features: [
      "All Starter Features",
      "Dynamic Demand Pricing Engine",
      "Concession Butler iPad Ordering",
      "Multi-Auditorium Turnstile Sync",
      "Priority 24/7 Phone Helpline",
      "Custom Brand Color Themes",
    ],
    activeTheatresCount: 12,
    status: "Active",
  },
  {
    id: "sub-enterprise",
    name: "Enterprise",
    priceMonthly: 79999,
    billingPeriod: "Monthly",
    screensAllowed: "Unlimited Screens",
    commissionPercent: 1.5,
    features: [
      "All Professional Features",
      "Zero-Latency Concurrency Seat Locks",
      "Direct Razorpay/Stripe Nodal Split",
      "Dedicated Technical Account Manager",
      "Custom Subdomain Branding",
      "Distributor KDM Automated Ingestion",
      "Unlimited Audit Log Retention",
    ],
    activeTheatresCount: 4,
    status: "Active",
  },
];

const INITIAL_CITIES: ManagedCity[] = [
  { id: "city-pun", name: "Pune", slug: "pune", state: "Maharashtra", country: "India", tier: "Tier 1", theatreCount: 6, isActive: true, latitude: 18.5204, longitude: 73.8567 },
  { id: "city-mum", name: "Mumbai", slug: "mumbai", state: "Maharashtra", country: "India", tier: "Tier 1", theatreCount: 8, isActive: true, latitude: 19.076, longitude: 72.8777 },
  { id: "city-blr", name: "Bengaluru", slug: "bengaluru", state: "Karnataka", country: "India", tier: "Tier 1", theatreCount: 5, isActive: true, latitude: 12.9716, longitude: 77.5946 },
  { id: "city-del", name: "New Delhi", slug: "delhi", state: "Delhi NCR", country: "India", tier: "Tier 1", theatreCount: 4, isActive: true, latitude: 28.6139, longitude: 77.209 },
  { id: "city-hyd", name: "Hyderabad", slug: "hyderabad", state: "Telangana", country: "India", tier: "Tier 1", theatreCount: 3, isActive: true, latitude: 17.385, longitude: 78.4867 },
  { id: "city-chn", name: "Chennai", slug: "chennai", state: "Tamil Nadu", country: "India", tier: "Tier 1", theatreCount: 2, isActive: true, latitude: 13.0827, longitude: 80.2707 },
  { id: "city-ahm", name: "Ahmedabad", slug: "ahmedabad", state: "Gujarat", country: "India", tier: "Tier 2", theatreCount: 2, isActive: true, latitude: 23.0225, longitude: 72.5714 },
  { id: "city-sur", name: "Surat", slug: "surat", state: "Gujarat", country: "India", tier: "Tier 2", theatreCount: 1, isActive: true, latitude: 21.1702, longitude: 72.8311 },
  { id: "city-jai", name: "Jaipur", slug: "jaipur", state: "Rajasthan", country: "India", tier: "Tier 2", theatreCount: 1, isActive: true, latitude: 26.9124, longitude: 75.7873 },
];

const INITIAL_AMENITIES: ManagedAmenity[] = [
  { id: "am-1", slug: "barco-4k-laser", name: "Barco 4K Laser Projection", category: "Projection & Sound", iconName: "Sparkles", description: "Ultra-sharp 4K HDR laser clarity with high-contrast color gamut.", theatresEquipped: 24, isActive: true },
  { id: "am-2", slug: "dolby-atmos-64", name: "Dolby Atmos 64-Channel Spatial Audio", category: "Projection & Sound", iconName: "Volume2", description: "Immersive multi-dimensional audio moving all around the listener.", theatresEquipped: 22, isActive: true },
  { id: "am-3", slug: "imax-laser", name: "IMAX with Laser", category: "Projection & Sound", iconName: "Film", description: "Dual 4K laser projection with custom 12-channel sound.", theatresEquipped: 8, isActive: true },
  { id: "am-4", slug: "4dx-dynamic", name: "4DX Dynamic Motion & Environmental FX", category: "Seating & Comfort", iconName: "Activity", description: "Motion-synchronized seats with wind, water, scent, and snow.", theatresEquipped: 6, isActive: true },
  { id: "am-5", slug: "recliners", name: "Zero-Gravity Ultra Recliners", category: "Seating & Comfort", iconName: "Armchair", description: "Full-grain motorized Italian recliners with USB fast charging.", theatresEquipped: 18, isActive: true },
  { id: "am-6", slug: "wheelchair-access", name: "Accessible Ramps & Wheelchair Companion Bays", category: "Convenience", iconName: "Accessibility", description: "Step-free ramp entry and designated companion wheelchair bays.", theatresEquipped: 25, isActive: true },
  { id: "am-7", slug: "butler-dining", name: "Gourmet In-Seat Butler Dining", category: "Hospitality & F&B", iconName: "Coffee", description: "Chef-curated gourmet dining delivered discreetly to seat.", theatresEquipped: 14, isActive: true },
  { id: "am-8", slug: "ev-charging", name: "Electric Vehicle (EV) Hyperchargers", category: "Convenience", iconName: "Zap", description: "Dedicated 60kW DC fast charging stations in cinema parking.", theatresEquipped: 12, isActive: true },
  { id: "am-9", slug: "kids-play-zone", name: "Kids Play Zone & Foyer Arcade", category: "Hospitality & F&B", iconName: "Smile", description: "Safe supervised play arena with arcade gaming machines.", theatresEquipped: 10, isActive: true },
];

const INITIAL_ANNOUNCEMENTS: PlatformAnnouncement[] = [
  {
    id: "anc-01",
    title: "Mandatory CBFC Holographic Watermarking Compliance",
    description: "All digital cinema packages (DCPs) must implement the new 2026 CBFC anti-piracy forensic watermark before public exhibitions.",
    priority: "Urgent",
    audience: "Theatre Admins",
    publishDate: "2026-11-05",
    expiryDate: "2026-11-30",
    status: "Active",
    author: "Super Admin HQ",
  },
  {
    id: "anc-02",
    title: "Scheduled Core Database Maintenance & Redis Cache Upgrade",
    description: "Nightly maintenance window on Nov 15 between 02:00 AM and 03:30 AM IST. Turnstile offline cache mode will automatically engage.",
    priority: "High",
    audience: "All Users",
    publishDate: "2026-11-08",
    expiryDate: "2026-11-16",
    status: "Active",
    author: "Platform Engineering",
  },
  {
    id: "anc-03",
    title: "Diwali 2026 Blockbuster Surge: Capacity Auto-Scaling Enabled",
    description: "Serverless concurrency limits have been elevated 4x for Pushpa 3 and Avatar 3 pre-bookings across all metropolitan circuits.",
    priority: "Normal",
    audience: "Theatre Admins",
    publishDate: "2026-11-01",
    expiryDate: "2026-11-20",
    status: "Active",
    author: "Operations Directorate",
  },
];

const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "tkt-101",
    ticketNumber: "TKT-CS-2026-881",
    theatreName: "PVR Phoenix Marketcity, Pune",
    submitterEmail: "gm.phoenix@pvrcinemas.com",
    subject: "Dolby Atmos DSP Processor firmware calibration error on Screen 3",
    category: "Hardware / Projection",
    priority: "Critical",
    status: "In Progress",
    assignedTo: "Acoustic Support Team",
    createdAt: "2026-11-08 09:15",
    updatedAt: "2026-11-08 14:30",
  },
  {
    id: "tkt-102",
    ticketNumber: "TKT-CS-2026-882",
    theatreName: "INOX Megaplex, Malad, Mumbai",
    submitterEmail: "ops.inox@inoxmovies.com",
    subject: "UPI Settlement webhook retry delayed during high-volume matinee rush",
    category: "Settlements & UPI",
    priority: "High",
    status: "Open",
    assignedTo: "FinTech Engineering",
    createdAt: "2026-11-08 11:45",
    updatedAt: "2026-11-08 11:45",
  },
  {
    id: "tkt-103",
    ticketNumber: "TKT-CS-2026-883",
    theatreName: "CineWave Diamond City, Surat",
    submitterEmail: "jayesh.p@cinewave.in",
    subject: "Requesting onboarding KYC verification review for 6 auditorium screens",
    category: "Platform Bug",
    priority: "Medium",
    status: "Open",
    assignedTo: "Super Admin HQ",
    createdAt: "2026-11-08 13:20",
    updatedAt: "2026-11-08 13:20",
  },
  {
    id: "tkt-104",
    ticketNumber: "TKT-CS-2026-884",
    theatreName: "Miraj IMAX Cinema, Bengaluru",
    submitterEmail: "admin@mirajcinemas.com",
    subject: "Inquiry on bulk concessional student passes API for university week",
    category: "Feature Request",
    priority: "Low",
    status: "Resolved",
    assignedTo: "Product Growth",
    createdAt: "2026-11-06 16:00",
    updatedAt: "2026-11-07 10:15",
  },
];

const INITIAL_AUDIT_LOGS: PlatformAuditLog[] = [
  {
    id: "log-01",
    timestamp: "2026-11-08 18:45:12",
    user: "Super Admin Root",
    role: "SUPER_ADMIN",
    action: "SYSTEM_CONFIG_UPDATED",
    module: "Settings",
    description: "Elevated transaction booking fee to ₹35.00 across all non-waived circuits.",
    ipAddress: "103.21.144.12",
    device: "MacBook Pro (macOS 15.1) Chrome 132.0",
  },
  {
    id: "log-02",
    timestamp: "2026-11-08 17:30:00",
    user: "Super Admin Root",
    role: "SUPER_ADMIN",
    action: "THEATRE_ACTIVATED",
    module: "Theatres",
    description: "Approved onboarding license for CineSphere Grand Cinemas, Pune (th-pun-001).",
    ipAddress: "103.21.144.12",
    device: "MacBook Pro (macOS 15.1) Chrome 132.0",
  },
  {
    id: "log-03",
    timestamp: "2026-11-08 15:10:45",
    user: "Security Daemon",
    role: "SYSTEM",
    action: "SECURITY_ROTATION",
    module: "Security",
    description: "Rotated webhook signing secrets for Razorpay and PhonePe nodal gateways.",
    ipAddress: "10.0.4.15",
    device: "Internal Kubernetes Cluster node-04",
  },
];

const INITIAL_SETTINGS: PlatformSettings = {
  appName: "CineSphere OS",
  tagline: "The Operating System for Modern Cinemas",
  logoUrl: "/placeholders/logo.svg",
  maintenanceMode: false,
  defaultCurrency: "INR",
  currencySymbol: "₹",
  timezone: "Asia/Kolkata",
  convenienceFeePerSeat: 35.0,
  gstPercent: 18.0,
  twoFactorEnforced: true,
  sessionTimeoutMinutes: 60,
  smtpHost: "smtp.cinesphere.io",
  smsGateway: "MSG91 High Priority Cinema Rail",
  apiKeyLive: "cs_live_928173918274910284710294819284",
};

export const usePlatformStore = create<PlatformState>()(
  persist(
    (set, get) => ({
      theatres: INITIAL_THEATRES,
      subscriptions: INITIAL_SUBSCRIPTIONS,
      cities: INITIAL_CITIES,
      amenities: INITIAL_AMENITIES,
      announcements: INITIAL_ANNOUNCEMENTS,
      supportTickets: INITIAL_SUPPORT_TICKETS,
      auditLogs: INITIAL_AUDIT_LOGS,
      settings: INITIAL_SETTINGS,

      // Theatre Operations
      approveTheatre: (id: string) => {
        set((state) => {
          const target = state.theatres.find((t) => t.id === id);
          const updated = state.theatres.map((t) =>
            t.id === id ? { ...t, status: "Active" as TheatreApprovalStatus } : t
          );
          return {
            theatres: updated,
            auditLogs: [
              {
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
                user: "Super Admin",
                role: "SUPER_ADMIN",
                action: "THEATRE_APPROVED",
                module: "Theatres",
                description: `Approved operational license for ${target?.name || id}. Theatre Admin notified.`,
                ipAddress: "127.0.0.1",
                device: "Super Admin Console",
              },
              ...state.auditLogs,
            ],
          };
        });
      },

      rejectTheatre: (id: string, reason?: string) => {
        set((state) => {
          const target = state.theatres.find((t) => t.id === id);
          const updated = state.theatres.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "Rejected" as TheatreApprovalStatus,
                  rejectionReason: reason || "Compliance documentation verification unfulfilled.",
                }
              : t
          );
          return {
            theatres: updated,
            auditLogs: [
              {
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
                user: "Super Admin",
                role: "SUPER_ADMIN",
                action: "THEATRE_REJECTED",
                module: "Theatres",
                description: `Rejected registration for ${target?.name || id}. Reason: ${reason || "Documentation mismatch"}`,
                ipAddress: "127.0.0.1",
                device: "Super Admin Console",
              },
              ...state.auditLogs,
            ],
          };
        });
      },

      suspendTheatre: (id: string) => {
        set((state) => {
          const target = state.theatres.find((t) => t.id === id);
          return {
            theatres: state.theatres.map((t) =>
              t.id === id ? { ...t, status: "Suspended" as TheatreApprovalStatus } : t
            ),
            auditLogs: [
              {
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
                user: "Super Admin",
                role: "SUPER_ADMIN",
                action: "THEATRE_SUSPENDED",
                module: "Theatres",
                description: `Temporarily suspended ticketing rail and booking ingress for ${target?.name || id}.`,
                ipAddress: "127.0.0.1",
                device: "Super Admin Console",
              },
              ...state.auditLogs,
            ],
          };
        });
      },

      activateTheatre: (id: string) => {
        set((state) => {
          const target = state.theatres.find((t) => t.id === id);
          return {
            theatres: state.theatres.map((t) =>
              t.id === id ? { ...t, status: "Active" as TheatreApprovalStatus } : t
            ),
            auditLogs: [
              {
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
                user: "Super Admin",
                role: "SUPER_ADMIN",
                action: "THEATRE_REACTIVATED",
                module: "Theatres",
                description: `Restored full active booking status for ${target?.name || id}.`,
                ipAddress: "127.0.0.1",
                device: "Super Admin Console",
              },
              ...state.auditLogs,
            ],
          };
        });
      },

      updateTheatre: (id: string, partial: Partial<ManagedTheatre>) => {
        set((state) => ({
          theatres: state.theatres.map((t) => (t.id === id ? { ...t, ...partial } : t)),
        }));
      },

      deleteTheatre: (id: string) => {
        set((state) => ({
          theatres: state.theatres.filter((t) => t.id !== id),
        }));
      },

      // Geographic Operations
      addCity: (city) => {
        const newCity: ManagedCity = {
          ...city,
          id: `city-${Date.now()}`,
          theatreCount: 0,
        };
        set((state) => ({
          cities: [newCity, ...state.cities],
        }));
      },

      toggleCityActive: (id: string) => {
        set((state) => ({
          cities: state.cities.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)),
        }));
      },

      deleteCity: (id: string) => {
        set((state) => ({
          cities: state.cities.filter((c) => c.id !== id),
        }));
      },

      // Amenities Operations
      addAmenity: (amenity) => {
        const newAmenity: ManagedAmenity = {
          ...amenity,
          id: `am-${Date.now()}`,
          theatresEquipped: 0,
        };
        set((state) => ({
          amenities: [newAmenity, ...state.amenities],
        }));
      },

      toggleAmenityActive: (id: string) => {
        set((state) => ({
          amenities: state.amenities.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)),
        }));
      },

      // Announcements Operations
      addAnnouncement: (announcement) => {
        const newAnc: PlatformAnnouncement = {
          ...announcement,
          id: `anc-${Date.now()}`,
        };
        set((state) => ({
          announcements: [newAnc, ...state.announcements],
        }));
      },

      deleteAnnouncement: (id: string) => {
        set((state) => ({
          announcements: state.announcements.filter((a) => a.id !== id),
        }));
      },

      // Support Ticket Operations
      updateTicketStatus: (id: string, status) => {
        set((state) => ({
          supportTickets: state.supportTickets.map((t) =>
            t.id === id
              ? { ...t, status, updatedAt: new Date().toISOString().replace("T", " ").slice(0, 16) }
              : t
          ),
        }));
      },

      assignTicket: (id: string, assignee: string) => {
        set((state) => ({
          supportTickets: state.supportTickets.map((t) =>
            t.id === id
              ? { ...t, assignedTo: assignee, updatedAt: new Date().toISOString().replace("T", " ").slice(0, 16) }
              : t
          ),
        }));
      },

      // Settings Operations
      updateSettings: (partial) => {
        set((state) => ({
          settings: { ...state.settings, ...partial },
        }));
      },

      // Audit Logger
      logAuditEvent: (action: string, module: string, description: string) => {
        set((state) => ({
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
              user: "Super Admin",
              role: "SUPER_ADMIN",
              action,
              module,
              description,
              ipAddress: "127.0.0.1",
              device: "Super Admin Console",
            },
            ...state.auditLogs,
          ],
        }));
      },
    }),
    {
      name: "cinesphere-super-admin-storage",
      partialize: (state) => ({
        theatres: state.theatres,
        cities: state.cities,
        amenities: state.amenities,
        announcements: state.announcements,
        settings: state.settings,
      }),
    }
  )
);
