export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  isExternal?: boolean;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/movies" },
  { label: "Theatres", href: "/theatres" },
  { label: "Events", href: "/events" },
  { label: "Offers", href: "/offers", badge: "Hot" },
  { label: "Dashboard", href: "/dashboard", badge: "Admin" },
  { label: "Design System", href: "/design-system", badge: "UI" },
];

export const AVAILABLE_CITIES = [
  { id: "nyc", name: "New York", state: "NY", count: 28 },
  { id: "la", name: "Los Angeles", state: "CA", count: 24 },
  { id: "sf", name: "San Francisco", state: "CA", count: 18 },
  { id: "chi", name: "Chicago", state: "IL", count: 22 },
  { id: "atl", name: "Atlanta", state: "GA", count: 14 },
  { id: "bos", name: "Boston", state: "MA", count: 12 },
  { id: "dal", name: "Dallas", state: "TX", count: 16 },
  { id: "sea", name: "Seattle", state: "WA", count: 16 },
];

export const DASHBOARD_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", iconName: "LayoutDashboard" },
  { label: "Theatres", href: "/dashboard?tab=theatres", iconName: "Building2", badge: "150+" },
  { label: "Halls", href: "/dashboard?tab=halls", iconName: "Box", badge: "650+" },
  { label: "Movies", href: "/dashboard?tab=movies", iconName: "Film" },
  { label: "Bookings", href: "/dashboard?tab=bookings", iconName: "Ticket", badge: "Live" },
  { label: "Users", href: "/dashboard?tab=users", iconName: "Users" },
  { label: "Reports", href: "/dashboard?tab=reports", iconName: "BarChart3" },
  { label: "Settings", href: "/dashboard?tab=settings", iconName: "Settings" },
];
