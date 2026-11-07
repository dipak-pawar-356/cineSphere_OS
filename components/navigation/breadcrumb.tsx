"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "HQ Dashboard",
  overview: "Overview",
  theatres: "Theatres Circuit",
  theatre: "Theatre Portal",
  halls: "Auditoriums & Halls",
  movies: "Movie Catalog",
  movie: "Movie",
  shows: "Show Schedules",
  bookings: "Bookings Ledger",
  customers: "Patrons",
  admins: "Tenant Admins",
  staff: "Field Staff",
  revenue: "Revenue Splits",
  analytics: "Platform Analytics",
  reports: "Audit Reports",
  notifications: "System Alerts",
  settings: "Configuration",
  profile: "Profile",
  events: "Premieres & Events",
  offers: "Promotions & Offers",
  about: "About Us",
  contact: "Contact & Partnership",
  support: "Help Center",
  faq: "Frequently Asked Questions",
  "privacy-policy": "Privacy Policy",
  "terms-and-conditions": "Terms of Service",
  "cookies-policy": "Cookies Policy",
  "design-system": "Design System",
  tickets: "Digital Tickets",
  wishlist: "Watchlist",
  concessions: "Concessions POS",
  schedule: "Shift Schedule",
  login: "Sign In",
  register: "Register",
};

export function Breadcrumb({ items, showHome = true, className }: BreadcrumbProps) {
  const pathname = usePathname();

  // If items not provided, automatically generate from pathname
  const generatedItems: BreadcrumbItem[] = React.useMemo(() => {
    if (items && items.length > 0) return items;
    if (!pathname || pathname === "/") return [];

    const segments = pathname.split("/").filter(Boolean);
    let accumPath = "";

    return segments.map((segment) => {
      accumPath += `/${segment}`;
      const cleanSegment = decodeURIComponent(segment);
      const label =
        ROUTE_LABELS[cleanSegment.toLowerCase()] ||
        cleanSegment
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());

      return {
        label,
        href: accumPath,
      };
    });
  }, [items, pathname]);

  if (generatedItems.length === 0 && !showHome) return null;

  return (
    <nav
      aria-label="Breadcrumb Navigation"
      className={cn("flex items-center gap-1.5 text-xs text-[#94A3B8]", className)}
    >
      {showHome && (
        <>
          <Link
            href="/"
            aria-label="Home"
            className="flex items-center text-[#94A3B8] hover:text-[#FBBF24] transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-[#FBBF24]"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
          {generatedItems.length > 0 && (
            <ChevronRight className="h-3 w-3 text-[#64748B] shrink-0" />
          )}
        </>
      )}

      {generatedItems.map((item, index) => {
        const isLast = index === generatedItems.length - 1;

        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-[#F9FAFB] transition-colors font-medium truncate max-w-[150px] sm:max-w-xs"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? "page" : undefined}
                className={cn(
                  "truncate max-w-[180px] sm:max-w-sm",
                  isLast ? "font-bold text-[#F9FAFB]" : "text-[#94A3B8]"
                )}
              >
                {item.label}
              </span>
            )}

            {!isLast && <ChevronRight className="h-3 w-3 text-[#64748B] shrink-0" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
