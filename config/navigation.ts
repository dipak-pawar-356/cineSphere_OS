import { ROUTES } from "@/config/routes";
import {
  LayoutDashboard,
  Film,
  Building2,
  Calendar,
  Ticket,
  Users,
  ShieldCheck,
  UserCheck,
  TrendingUp,
  BarChart3,
  FileText,
  Bell,
  Settings,
  User,
  Layers,
  Heart,
  Clock,
  Sparkles,
  HelpCircle,
  QrCode,
  Coffee,
  MapPin,
  Tag,
  History,
  Headphones,
  Image as ImageIcon,
  LogOut,
  CalendarDays,
  CreditCard,
} from "lucide-react";

export interface NavItemConfig {
  label: string;
  href: string;
  iconName?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  description?: string;
  roles?: string[];
  permissions?: string[];
  children?: NavItemConfig[];
}

export interface NavSectionConfig {
  title?: string;
  items: NavItemConfig[];
}

/**
 * Public Main Navigation Items
 */
export const PUBLIC_NAV_ITEMS: NavItemConfig[] = [
  { label: "Home", href: ROUTES.PUBLIC.HOME },
  { label: "Movies", href: ROUTES.PUBLIC.MOVIES },
  { label: "Theatres", href: ROUTES.PUBLIC.THEATRES },
  { label: "Events", href: ROUTES.PUBLIC.EVENTS },
  { label: "Offers", href: ROUTES.PUBLIC.OFFERS, badge: "Hot", badgeVariant: "warning" },
  { label: "Super Admin", href: ROUTES.SUPER_ADMIN.ROOT, badge: "HQ", badgeVariant: "primary" },
  { label: "Theatre Portal", href: ROUTES.THEATRE_ADMIN.ROOT, badge: "Operator", badgeVariant: "secondary" },
  { label: "Design System", href: ROUTES.PUBLIC.DESIGN_SYSTEM, badge: "UI", badgeVariant: "info" },
];

/**
 * Super Admin Navigation (Central Headquarters)
 */
export const SUPER_ADMIN_NAV_SECTIONS: NavSectionConfig[] = [
  {
    title: "Core Overview",
    items: [
      {
        label: "Overview",
        href: ROUTES.SUPER_ADMIN.OVERVIEW,
        icon: LayoutDashboard,
        badge: "Live",
        badgeVariant: "success",
        description: "Circuit KPI telemetry and real-time operations",
      },
      {
        label: "Theatres Circuit",
        href: ROUTES.SUPER_ADMIN.THEATRES,
        icon: Building2,
        badge: "25 Chains",
        description: "Multi-tenant cinema complexes & locations",
      },
      {
        label: "Auditoriums & Halls",
        href: ROUTES.SUPER_ADMIN.HALLS,
        icon: Layers,
        badge: "110 Screens",
        description: "IMAX, 4DX, ScreenX, and Dolby Atmos screens",
      },
      {
        label: "Cities & Locations",
        href: ROUTES.SUPER_ADMIN.LOCATIONS,
        icon: MapPin,
        badge: "12 Cities",
        description: "Metropolitan jurisdictions, states & amenities",
      },
    ],
  },
  {
    title: "Catalog & Programming",
    items: [
      {
        label: "Movie Catalog",
        href: ROUTES.SUPER_ADMIN.MOVIES,
        icon: Film,
        badge: "48 Active",
        description: "Global releases, distributor metadata & ratings",
      },
      {
        label: "Show Schedules",
        href: ROUTES.SUPER_ADMIN.SHOWS,
        icon: Calendar,
        description: "Timetable programming and projection assignments",
      },
      {
        label: "Global Bookings",
        href: ROUTES.SUPER_ADMIN.BOOKINGS,
        icon: Ticket,
        badge: "124.8K",
        badgeVariant: "primary",
        description: "Cross-tenant ticketing ledger & refunds",
      },
      {
        label: "Events & Festivals",
        href: ROUTES.SUPER_ADMIN.EVENTS,
        icon: CalendarDays,
        description: "Concerts, premieres, and live stadium broadcasts",
      },
      {
        label: "Offers & Coupons",
        href: ROUTES.SUPER_ADMIN.OFFERS,
        icon: Tag,
        badge: "Promo",
        description: "Promotional campaigns, discounts & VIP codes",
      },
    ],
  },
  {
    title: "User Management",
    items: [
      {
        label: "Customers",
        href: ROUTES.SUPER_ADMIN.CUSTOMERS,
        icon: Users,
        badge: "385K",
        description: "Patron registry, loyalty tiers & profiles",
      },
      {
        label: "Theatre Admins",
        href: ROUTES.SUPER_ADMIN.ADMINS,
        icon: ShieldCheck,
        badge: "24",
        description: "Authorized cinema chain operators & hall managers",
      },
      {
        label: "Field Staff",
        href: ROUTES.SUPER_ADMIN.STAFF,
        icon: UserCheck,
        description: "Box office agents, ushers & technicians",
      },
    ],
  },
  {
    title: "Financials & Intelligence",
    items: [
      {
        label: "Revenue & Payments",
        href: ROUTES.SUPER_ADMIN.REVENUE,
        icon: TrendingUp,
        badge: "₹8.6 Cr",
        badgeVariant: "warning",
        description: "Box office split ledgers and concession yields",
      },
      {
        label: "Platform Analytics",
        href: ROUTES.SUPER_ADMIN.ANALYTICS,
        icon: BarChart3,
        description: "Audience demographics, heatmaps & peak hours",
      },
      {
        label: "Audit Reports",
        href: ROUTES.SUPER_ADMIN.REPORTS,
        icon: FileText,
        description: "Regulatory compliance and distributor tax filings",
      },
    ],
  },
  {
    title: "System & Control",
    items: [
      {
        label: "System Alerts",
        href: ROUTES.SUPER_ADMIN.NOTIFICATIONS,
        icon: Bell,
        badge: "3 Alerts",
        badgeVariant: "danger",
        description: "Projector telemetry alerts and security logs",
      },
      {
        label: "Audit Logs",
        href: ROUTES.SUPER_ADMIN.AUDIT_LOGS,
        icon: History,
        description: "Immutable security trail & admin activities",
      },
      {
        label: "Support Tickets",
        href: ROUTES.SUPER_ADMIN.SUPPORT_TICKETS,
        icon: Headphones,
        badge: "5 Urgent",
        description: "Exhibitor escalation desk & customer disputes",
      },
      {
        label: "Media Library",
        href: ROUTES.SUPER_ADMIN.MEDIA_LIBRARY,
        icon: ImageIcon,
        description: "Posters, banners, logos & 4K trailer assets",
      },
      {
        label: "HQ Settings",
        href: ROUTES.SUPER_ADMIN.SETTINGS,
        icon: Settings,
        description: "Multi-tenant policies, gateways & API keys",
      },
      {
        label: "Super Admin Profile",
        href: ROUTES.SUPER_ADMIN.PROFILE,
        icon: User,
        description: "Credentials, session keys & 2FA controls",
      },
    ],
  },
];

/**
 * Theatre Admin Navigation (Individual Chain Operator)
 */
export const THEATRE_ADMIN_NAV_SECTIONS: NavSectionConfig[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: ROUTES.THEATRE_ADMIN.DASHBOARD,
        icon: LayoutDashboard,
        badge: "Live",
        badgeVariant: "success",
      },
    ],
  },
  {
    title: "Theatre Management",
    items: [
      {
        label: "Theatre Profile",
        href: ROUTES.THEATRE_ADMIN.PROFILE,
        icon: Building2,
      },
      {
        label: "Information & Legal",
        href: ROUTES.THEATRE_ADMIN.INFORMATION,
        icon: FileText,
      },
      {
        label: "Photo Gallery",
        href: ROUTES.THEATRE_ADMIN.GALLERY,
        icon: ImageIcon,
      },
      {
        label: "Amenities & Food",
        href: ROUTES.THEATRE_ADMIN.AMENITIES,
        icon: Coffee,
      },
    ],
  },
  {
    title: "Hall Management",
    items: [
      {
        label: "All Halls & Screens",
        href: ROUTES.THEATRE_ADMIN.HALLS,
        icon: Layers,
        badge: "5 Screens",
      },
      {
        label: "Hall Designer",
        href: ROUTES.THEATRE_ADMIN.HALL_DESIGNER,
        icon: Sparkles,
        badge: "Soon",
        badgeVariant: "warning",
      },
    ],
  },
  {
    title: "Movie & Show Ops",
    items: [
      {
        label: "Movies Catalog",
        href: ROUTES.THEATRE_ADMIN.MOVIES,
        icon: Film,
        badge: "12 Films",
      },
      {
        label: "All Shows",
        href: ROUTES.THEATRE_ADMIN.SHOWS,
        icon: Calendar,
      },
      {
        label: "Show Calendar",
        href: ROUTES.THEATRE_ADMIN.SHOW_CALENDAR,
        icon: CalendarDays,
      },
    ],
  },
  {
    title: "Booking Management",
    items: [
      {
        label: "All Bookings",
        href: ROUTES.THEATRE_ADMIN.BOOKINGS,
        icon: Ticket,
      },
      {
        label: "Today's Bookings",
        href: ROUTES.THEATRE_ADMIN.BOOKINGS_TODAY,
        icon: Clock,
        badge: "Today",
        badgeVariant: "primary",
      },
      {
        label: "Upcoming Bookings",
        href: ROUTES.THEATRE_ADMIN.BOOKINGS_UPCOMING,
        icon: Calendar,
      },
    ],
  },
  {
    title: "Customers & Staff",
    items: [
      {
        label: "Theatre Patrons",
        href: ROUTES.THEATRE_ADMIN.CUSTOMERS,
        icon: Users,
      },
      {
        label: "Staff Roster",
        href: ROUTES.THEATRE_ADMIN.STAFF,
        icon: UserCheck,
      },
      {
        label: "Hall Managers",
        href: ROUTES.THEATRE_ADMIN.STAFF_MANAGERS,
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "Financials & Yield",
    items: [
      {
        label: "Revenue Overview",
        href: ROUTES.THEATRE_ADMIN.REVENUE,
        icon: TrendingUp,
        badge: "₹4.8L",
        badgeVariant: "success",
      },
      {
        label: "Payment Reconciliation",
        href: ROUTES.THEATRE_ADMIN.PAYMENTS,
        icon: CreditCard,
      },
      {
        label: "Transactions Ledger",
        href: ROUTES.THEATRE_ADMIN.TRANSACTIONS,
        icon: History,
      },
    ],
  },
  {
    title: "Marketing & Community",
    items: [
      {
        label: "Offers & Coupons",
        href: ROUTES.THEATRE_ADMIN.OFFERS,
        icon: Tag,
      },
      {
        label: "Special Events",
        href: ROUTES.THEATRE_ADMIN.EVENTS,
        icon: Sparkles,
      },
    ],
  },
  {
    title: "Analytics & Intelligence",
    items: [
      {
        label: "Theatre Analytics",
        href: ROUTES.THEATRE_ADMIN.ANALYTICS,
        icon: BarChart3,
      },
      {
        label: "Audit Reports",
        href: ROUTES.THEATRE_ADMIN.REPORTS,
        icon: FileText,
      },
    ],
  },
  {
    title: "Support & Config",
    items: [
      {
        label: "Notifications",
        href: ROUTES.THEATRE_ADMIN.NOTIFICATIONS,
        icon: Bell,
        badge: "3 New",
        badgeVariant: "danger",
      },
      {
        label: "Hardware Support",
        href: ROUTES.THEATRE_ADMIN.SUPPORT,
        icon: Headphones,
      },
      {
        label: "Theatre Settings",
        href: ROUTES.THEATRE_ADMIN.SETTINGS,
        icon: Settings,
      },
    ],
  },
];

/**
 * Customer Navigation (Account & Bookings)
 */
export const CUSTOMER_NAV_ITEMS: NavItemConfig[] = [
  { label: "My Profile", href: ROUTES.CUSTOMER.ROOT, icon: User },
  { label: "Active Bookings", href: ROUTES.CUSTOMER.BOOKINGS, icon: Ticket, badge: "2" },
  { label: "Digital Tickets", href: ROUTES.CUSTOMER.TICKETS, icon: QrCode },
  { label: "Watchlist", href: ROUTES.CUSTOMER.WISHLIST, icon: Heart },
  { label: "Notifications", href: ROUTES.CUSTOMER.NOTIFICATIONS, icon: Bell },
  { label: "Preferences", href: ROUTES.CUSTOMER.SETTINGS, icon: Settings },
  { label: "Concierge Help", href: ROUTES.CUSTOMER.SUPPORT, icon: HelpCircle },
];

/**
 * Staff Terminal Navigation
 */
export const STAFF_NAV_ITEMS: NavItemConfig[] = [
  { label: "Shift Dashboard", href: ROUTES.STAFF.DASHBOARD, icon: LayoutDashboard },
  { label: "Gate Scanner", href: ROUTES.STAFF.TICKETS, icon: QrCode, badge: "POS" },
  { label: "F&B Concessions", href: ROUTES.STAFF.CONCESSIONS, icon: Coffee },
  { label: "Roster & Schedule", href: ROUTES.STAFF.SCHEDULE, icon: Clock },
];

/**
 * Comprehensive Footer Navigation
 */
export const FOOTER_SECTIONS = [
  {
    title: "Platform",
    items: [
      { label: "Explore Movies", href: ROUTES.PUBLIC.MOVIES },
      { label: "Cinema Complexes", href: ROUTES.PUBLIC.THEATRES },
      { label: "Live Premieres", href: ROUTES.PUBLIC.EVENTS },
      { label: "Special Offers", href: ROUTES.PUBLIC.OFFERS },
      { label: "Design System", href: ROUTES.PUBLIC.DESIGN_SYSTEM },
    ],
  },
  {
    title: "Solutions",
    items: [
      { label: "Super Admin HQ", href: ROUTES.SUPER_ADMIN.ROOT },
      { label: "Theatre Operations", href: ROUTES.THEATRE_ADMIN.ROOT },
      { label: "Staff Floor POS", href: ROUTES.STAFF.ROOT },
      { label: "Auditorium Telemetry", href: ROUTES.SUPER_ADMIN.HALLS },
      { label: "Revenue Settlement", href: ROUTES.SUPER_ADMIN.REVENUE },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About CineSphere", href: ROUTES.PUBLIC.ABOUT },
      { label: "Partner With Us", href: ROUTES.PUBLIC.CONTACT },
      { label: "Customer Concierge", href: ROUTES.PUBLIC.SUPPORT },
      { label: "Frequently Asked Questions", href: ROUTES.PUBLIC.FAQ },
    ],
  },
  {
    title: "Legal & Trust",
    items: [
      { label: "Privacy Policy", href: ROUTES.PUBLIC.PRIVACY_POLICY },
      { label: "Terms of Service", href: ROUTES.PUBLIC.TERMS_AND_CONDITIONS },
      { label: "Cookies Architecture", href: ROUTES.PUBLIC.COOKIES_POLICY },
      { label: "Security & 2FA", href: ROUTES.AUTH.LOGIN },
    ],
  },
];

