import { UserRole, RoleMetadata } from "../types/role.types";
import { ROLE_LANDING_ROUTES, PROTECTED_ROUTE_PREFIXES } from "../constants/auth-routes";

export const ROLE_DEFINITIONS: Record<UserRole, RoleMetadata> = {
  SUPER_ADMIN: {
    role: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Platform owner with unrestricted governance across all cinema circuits, revenue streams, and security configurations.",
    hierarchyLevel: 100,
    landingRoute: ROLE_LANDING_ROUTES.SUPER_ADMIN,
    allowedRoutePrefixes: ["/dashboard", "/theatre", "/hall", "/staff", "/profile"],
    isTenantScoped: false,
    color: "#F59E0B", // Amber
  },
  THEATRE_ADMIN: {
    role: "THEATRE_ADMIN",
    label: "Theatre Admin",
    description: "Exhibitor administrator with total control over their specific theatre complex, halls, shows, pricing, and revenue.",
    hierarchyLevel: 80,
    landingRoute: ROLE_LANDING_ROUTES.THEATRE_ADMIN,
    allowedRoutePrefixes: ["/theatre"],
    isTenantScoped: true,
    color: "#38BDF8", // Sky Blue
  },
  HALL_MANAGER: {
    role: "HALL_MANAGER",
    label: "Hall Manager",
    description: "Floor supervisor managing assigned auditorium hardware calibrations, schedule transitions, and seat maintenance.",
    hierarchyLevel: 60,
    landingRoute: ROLE_LANDING_ROUTES.HALL_MANAGER,
    allowedRoutePrefixes: ["/theatre/halls", "/hall"],
    isTenantScoped: true,
    color: "#A855F7", // Purple
  },
  STAFF: {
    role: "STAFF",
    label: "Cinema Staff",
    description: "Front-of-house box office and usher personnel scanning QR tickets, operating concessions, and assisting patrons.",
    hierarchyLevel: 40,
    landingRoute: ROLE_LANDING_ROUTES.STAFF,
    allowedRoutePrefixes: ["/staff"],
    isTenantScoped: true,
    color: "#10B981", // Emerald
  },
  CUSTOMER: {
    role: "CUSTOMER",
    label: "Patron / Customer",
    description: "Movie enthusiast booking show tickets, managing wishlists, reviewing order receipts, and customizing preferences.",
    hierarchyLevel: 10,
    landingRoute: ROLE_LANDING_ROUTES.CUSTOMER,
    allowedRoutePrefixes: ["/profile"],
    isTenantScoped: false,
    color: "#6366F1", // Indigo
  },
};

