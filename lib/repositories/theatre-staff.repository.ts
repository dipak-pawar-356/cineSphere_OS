import { BaseRepository } from "./base.repository";
import type {
  RoleTemplateRecord,
  TheatreRoleRecord,
  TheatrePermissionRecord,
  StaffDepartmentRecord,
  TheatreStaffRecord,
  StaffRoleAssignmentRecord,
  StaffRoleHistoryRecord,
  FutureShiftPlaceholderRecord,
  StaffMemberWithRoles,
  TheatreRoleWithPermissions,
  TheatreStaffOrganizationBundle,
  PermissionCatalogItem,
  StaffSearchFilters,
  CreateStaffInput,
  InviteStaffInput,
  UpdateStaffInput,
  AssignRoleInput,
  RemoveRoleInput,
  UpdateRolePermissionsInput,
  CreateTheatreRoleInput,
  UpdateTheatreRoleInput,
  InstantiateRoleFromTemplateInput,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "@/types/theatre-staff.types";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Staff & Dynamic RBAC Repository (Phase 3 – Part 10)
 * ==============================================================================
 * In-memory repository providing complete multi-tenant staff management, dynamic
 * custom roles, platform role template catalogs, permission grants, departments,
 * and immutable role assignment transition logs.
 * Pre-seeded with Theatre A (Pune), Theatre B (Mumbai/US), and Theatre C (Dubai).
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Standard Platform Permission Catalog
// ------------------------------------------------------------------------------
export const PLATFORM_PERMISSION_CATALOG: PermissionCatalogItem[] = [
  // Dashboard & Analytics
  { key: "dashboard:view", module: "DASHBOARD", label: "View Executive Dashboard", description: "Access real-time KPI overview and summary widgets" },
  { key: "analytics:view", module: "DASHBOARD", label: "View Operational Analytics", description: "Inspect audience demographics and occupancy heatmaps" },

  // Bookings & Box Office
  { key: "bookings:create", module: "BOOKINGS", label: "Create Box Office Bookings", description: "Issue walk-in ticketing reservations at cashier counter" },
  { key: "bookings:read", module: "BOOKINGS", label: "View Booking Records", description: "Inspect booking transactions, customer seats, and invoices" },
  { key: "bookings:cancel", module: "BOOKINGS", label: "Cancel Bookings", description: "Authorize ticket cancellations per refund policy" },
  { key: "bookings:refund", module: "BOOKINGS", label: "Process Booking Refunds", description: "Trigger wallet/gateway credit refund reconciliations" },

  // Payments & Financials
  { key: "payments:view", module: "PAYMENTS", label: "View Payment Transactions", description: "Inspect UPI, card, and POS settlement transactions" },
  { key: "payments:refund", module: "PAYMENTS", label: "Execute Payment Voids", description: "Void uncollected transactions and issue ledger reversals" },

  // Movies & Programming
  { key: "movies:read", module: "MOVIES", label: "Browse Movie Library", description: "View licensed films, censorship ratings, and metadata" },
  { key: "movies:manage", module: "MOVIES", label: "Manage Movie Catalog", description: "Schedule film ingest, trailers, and exhibition agreements" },

  // Shows & Schedules
  { key: "shows:read", module: "SHOWS", label: "View Showtimes Calendar", description: "Inspect scheduled show runs, auditorium mappings, and status" },
  { key: "shows:create", module: "SHOWS", label: "Schedule New Shows", description: "Program daily and weekly showtimes across auditoriums" },
  { key: "shows:cancel", module: "SHOWS", label: "Cancel Scheduled Shows", description: "Cancel screenings and trigger automated customer notifications" },

  // Reports & Financial Audits
  { key: "reports:read", module: "REPORTS", label: "View Operational Reports", description: "Read daily box office collection and tax compliance sheets" },
  { key: "reports:export", module: "REPORTS", label: "Export Financial Reports", description: "Download raw CSV/PDF audit logs and accountant summaries" },

  // Halls & Technical Hardware
  { key: "halls:read", module: "HALLS", label: "View Auditoriums", description: "Inspect hall seating configurations, sound systems, and 4K projectors" },
  { key: "halls:manage", module: "HALLS", label: "Manage Auditoriums & Layouts", description: "Edit hall capacity, sound profiles, and tier geometries" },
  { key: "halls:calibrate", module: "HALLS", label: "Calibrate Projection Hardware", description: "Trigger laser alignment, Dolby Atmos testing, and bulb checks" },
  { key: "seats:block_maintenance", module: "HALLS", label: "Block Seats for Maintenance", description: "Temporarily hold broken seats out of customer booking pools" },

  // Tickets & Gate Validation
  { key: "tickets:scan", module: "TICKETS", label: "Scan QR Barcodes", description: "Inspect physical or mobile QR tickets at entry turnstiles" },
  { key: "tickets:validate", module: "TICKETS", label: "Validate Gate Entry", description: "Admit patrons and track real-time auditorium headcounts" },

  // Settings & Configuration
  { key: "settings:read", module: "SETTINGS", label: "View Theatre Configuration", description: "Inspect operating hours, refund rules, and feature flags" },
  { key: "settings:update", module: "SETTINGS", label: "Update Theatre Configuration", description: "Modify business rules, booking windows, and tax setups" },

  // Media & Branding
  { key: "media:view", module: "MEDIA", label: "View Digital Signage Media", description: "Inspect posters, trailers, and lobby display playlists" },
  { key: "media:manage", module: "MEDIA", label: "Upload & Assign Media", description: "Upload hero banners and assign digital lobby displays" },

  // Business & Legal
  { key: "business:view", module: "BUSINESS", label: "View Legal Business Profile", description: "Inspect GSTIN, tax registration, and ownership credentials" },
  { key: "business:update", module: "BUSINESS", label: "Update Business Profile", description: "Modify signatory records and upload statutory compliance files" },

  // Staff & Crew Organization
  { key: "staff:read", module: "STAFF", label: "View Crew Roster", description: "Inspect staff directory, department structures, and roles" },
  { key: "staff:manage", module: "STAFF", label: "Manage Staff & Crew", description: "Onboard, invite, update, suspend, and archive staff members" },
  { key: "staff:roles_manage", module: "STAFF", label: "Manage Roles & Permissions", description: "Create custom roles and assign granular security privilege sets" },
];

// ------------------------------------------------------------------------------
// 2. Platform Role Templates
// ------------------------------------------------------------------------------
const PLATFORM_ROLE_TEMPLATES: RoleTemplateRecord[] = [
  {
    id: "tmpl-theatre-admin",
    templateCode: "TEMPLATE_THEATRE_ADMIN",
    name: "Theatre Administrator",
    category: "MANAGEMENT",
    description: "Complete operational ownership of the single theatre complex. Oversees programming, staff, and settings.",
    defaultPermissions: PLATFORM_PERMISSION_CATALOG.map((p) => p.key),
    suggestedDepartment: "Administration",
    hierarchyLevel: 5,
    isPlatformStandard: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "tmpl-hall-manager",
    templateCode: "TEMPLATE_HALL_MGR",
    name: "Hall Manager",
    category: "OPERATIONS",
    description: "Responsible for auditorium uptime, technical readiness, screening start/stop, and physical seat checks.",
    defaultPermissions: [
      "dashboard:view",
      "halls:read",
      "halls:calibrate",
      "seats:block_maintenance",
      "shows:read",
      "tickets:scan",
      "tickets:validate",
    ],
    suggestedDepartment: "Operations",
    hierarchyLevel: 3,
    isPlatformStandard: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "tmpl-ticket-counter",
    templateCode: "TEMPLATE_TICKET_COUNTER",
    name: "Ticket Counter Staff",
    category: "BOX_OFFICE",
    description: "Front-of-house box office agent issuing tickets, validating bookings, and managing physical queues.",
    defaultPermissions: [
      "dashboard:view",
      "bookings:create",
      "bookings:read",
      "shows:read",
      "tickets:scan",
      "tickets:validate",
    ],
    suggestedDepartment: "Operations",
    hierarchyLevel: 1,
    isPlatformStandard: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "tmpl-support-staff",
    templateCode: "TEMPLATE_SUPPORT_STAFF",
    name: "Support Staff",
    category: "CUSTOMER_SUPPORT",
    description: "Patron concierge handling booking inquiries, customer assistance, and accessibility accommodations.",
    defaultPermissions: [
      "dashboard:view",
      "bookings:read",
      "shows:read",
      "tickets:validate",
    ],
    suggestedDepartment: "Customer Support",
    hierarchyLevel: 1,
    isPlatformStandard: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "tmpl-projection",
    templateCode: "TEMPLATE_PROJECTION",
    name: "Projection Staff",
    category: "TECHNICAL",
    description: "Projectionist managing high-end Christie/Barco laser equipment, lens focus, and audio decibel calibration.",
    defaultPermissions: [
      "halls:read",
      "halls:calibrate",
      "shows:read",
    ],
    suggestedDepartment: "Projection",
    hierarchyLevel: 2,
    isPlatformStandard: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "tmpl-security",
    templateCode: "TEMPLATE_SECURITY",
    name: "Security Staff",
    category: "SECURITY",
    description: "Foyer security officer validating age credentials for 'A' rated screenings and managing entrance turnstiles.",
    defaultPermissions: [
      "tickets:scan",
      "tickets:validate",
      "shows:read",
    ],
    suggestedDepartment: "Security",
    hierarchyLevel: 1,
    isPlatformStandard: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "tmpl-maintenance",
    templateCode: "TEMPLATE_MAINTENANCE",
    name: "Maintenance Staff",
    category: "FACILITIES",
    description: "Facility engineer repairing recliner hydraulics, HVAC systems, and physical aisle illuminations.",
    defaultPermissions: [
      "halls:read",
      "seats:block_maintenance",
    ],
    suggestedDepartment: "Maintenance",
    hierarchyLevel: 1,
    isPlatformStandard: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "tmpl-cleaner",
    templateCode: "TEMPLATE_CLEANER",
    name: "Cleaner & Housekeeping",
    category: "OPERATIONS",
    description: "Turnaround sanitation crew preparing auditoriums between screenings.",
    defaultPermissions: [
      "shows:read",
    ],
    suggestedDepartment: "Operations",
    hierarchyLevel: 1,
    isPlatformStandard: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "tmpl-food-court",
    templateCode: "TEMPLATE_FOOD_COURT",
    name: "Food Court Staff",
    category: "HOSPITALITY",
    description: "Concession counter crew managing popcorn machines, gourmet snacks, and in-theatre meal pickup.",
    defaultPermissions: [
      "dashboard:view",
      "shows:read",
    ],
    suggestedDepartment: "Food Court",
    hierarchyLevel: 1,
    isPlatformStandard: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "tmpl-operations-mgr",
    templateCode: "TEMPLATE_OPERATIONS_MGR",
    name: "Operations Manager",
    category: "OPERATIONS",
    description: "General floor operations director managing rosters, crowd logistics, and inter-departmental workflows.",
    defaultPermissions: [
      "dashboard:view",
      "analytics:view",
      "bookings:read",
      "bookings:cancel",
      "shows:read",
      "shows:create",
      "halls:read",
      "staff:read",
      "reports:read",
    ],
    suggestedDepartment: "Operations",
    hierarchyLevel: 4,
    isPlatformStandard: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "tmpl-supervisor",
    templateCode: "TEMPLATE_SUPERVISOR",
    name: "Floor Supervisor",
    category: "OPERATIONS",
    description: "Direct shift lead coordinating ticket counters, door attendants, and customer flow.",
    defaultPermissions: [
      "dashboard:view",
      "bookings:read",
      "shows:read",
      "tickets:scan",
      "tickets:validate",
      "staff:read",
    ],
    suggestedDepartment: "Operations",
    hierarchyLevel: 2,
    isPlatformStandard: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "tmpl-cashier",
    templateCode: "TEMPLATE_CASHIER",
    name: "Box Office Cashier",
    category: "FINANCE",
    description: "Counter cashier handling cash drawers, credit card terminals, and daily counter drawer balancing.",
    defaultPermissions: [
      "bookings:create",
      "bookings:read",
      "payments:view",
      "shows:read",
    ],
    suggestedDepartment: "Operations",
    hierarchyLevel: 1,
    isPlatformStandard: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
];

// ------------------------------------------------------------------------------
// Seed Theatres Data (Theatre A, Theatre B, Theatre C)
// ------------------------------------------------------------------------------

export class TheatreStaffRepository extends BaseRepository<TheatreStaffRecord> {
  protected entityName = "TheatreStaff";
  protected tableName = "theatre_staff";

  private templatesStore: Map<string, RoleTemplateRecord> = new Map();
  private rolesStore: Map<string, TheatreRoleRecord> = new Map();
  private permissionsStore: Map<string, TheatrePermissionRecord> = new Map(); // id -> record
  private departmentsStore: Map<string, StaffDepartmentRecord> = new Map(); // id -> record
  private staffStore: Map<string, TheatreStaffRecord> = new Map(); // id -> record
  private assignmentsStore: Map<string, StaffRoleAssignmentRecord> = new Map(); // id -> record
  private historyStore: StaffRoleHistoryRecord[] = [];
  private shiftsStore: Map<string, FutureShiftPlaceholderRecord> = new Map();

  constructor() {
    super();
    this.seed();
  }

  private seed(): void {
    // 1. Seed Platform Role Templates
    PLATFORM_ROLE_TEMPLATES.forEach((tmpl) => {
      this.templatesStore.set(tmpl.id, { ...tmpl });
    });

    // 2. Seed Theatre A: Pune Flagship (th-pun-001)
    // Departments
    const depPunOps: StaffDepartmentRecord = {
      id: "dept-pun-ops",
      theatreId: "th-pun-001",
      code: "DEP-PUN-OPS",
      name: "Operations",
      departmentType: "OPERATIONS",
      description: "Auditorium logistics, crowd flow, and floor ushering.",
      departmentHeadId: null,
      isCustom: false,
      status: "ACTIVE",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    const depPunFood: StaffDepartmentRecord = {
      id: "dept-pun-food",
      theatreId: "th-pun-001",
      code: "DEP-PUN-FOOD",
      name: "Food Court & Concessions",
      departmentType: "FOOD_COURT",
      description: "Gourmet concessions, butler pantry, and snacks.",
      departmentHeadId: null,
      isCustom: false,
      status: "ACTIVE",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    const depPunSec: StaffDepartmentRecord = {
      id: "dept-pun-sec",
      theatreId: "th-pun-001",
      code: "DEP-PUN-SEC",
      name: "Security & Safety",
      departmentType: "SECURITY",
      description: "Turnstile security, bag screening, and age verification.",
      departmentHeadId: null,
      isCustom: false,
      status: "ACTIVE",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    [depPunOps, depPunFood, depPunSec].forEach((d) => this.departmentsStore.set(d.id, d));

    // Roles for Pune: Theatre Admin, Hall Manager, VIP Lounge Manager (Custom), Snack Manager (Custom), Security
    const rolePunAdmin: TheatreRoleRecord = {
      id: "role-pun-admin",
      theatreId: "th-pun-001",
      templateId: "tmpl-theatre-admin",
      roleCode: "THEATRE_ADMIN",
      name: "Theatre Administrator",
      description: "General Manager of Pune Flagship.",
      isCustom: false,
      isSystemDefault: true,
      hierarchyLevel: 5,
      status: "ACTIVE",
      createdBy: "usr-super-1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    const rolePunHallMgr: TheatreRoleRecord = {
      id: "role-pun-hallmgr",
      theatreId: "th-pun-001",
      templateId: "tmpl-hall-manager",
      roleCode: "HALL_MANAGER",
      name: "Hall Manager",
      description: "Auditorium calibration and operational management.",
      isCustom: false,
      isSystemDefault: true,
      hierarchyLevel: 3,
      status: "ACTIVE",
      createdBy: "usr-super-1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    const rolePunVipMgr: TheatreRoleRecord = {
      id: "role-pun-vipmgr",
      theatreId: "th-pun-001",
      templateId: null,
      roleCode: "VIP_LOUNGE_MGR",
      name: "VIP Lounge Manager",
      description: "Specialized manager for luxury CineSphere VIP recliner lounge.",
      isCustom: true,
      isSystemDefault: false,
      hierarchyLevel: 3,
      status: "ACTIVE",
      createdBy: "usr-th-pun",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    const rolePunSnackMgr: TheatreRoleRecord = {
      id: "role-pun-snackmgr",
      theatreId: "th-pun-001",
      templateId: null,
      roleCode: "SNACK_MGR",
      name: "Snack Manager",
      description: "Concessions counter and hot beverage kitchen supervisor.",
      isCustom: true,
      isSystemDefault: false,
      hierarchyLevel: 2,
      status: "ACTIVE",
      createdBy: "usr-th-pun",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    const rolePunSec: TheatreRoleRecord = {
      id: "role-pun-sec",
      theatreId: "th-pun-001",
      templateId: "tmpl-security",
      roleCode: "SECURITY_STAFF",
      name: "Security Staff",
      description: "Premises security and entrance checkpoint staff.",
      isCustom: false,
      isSystemDefault: true,
      hierarchyLevel: 1,
      status: "ACTIVE",
      createdBy: "usr-th-pun",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    [rolePunAdmin, rolePunHallMgr, rolePunVipMgr, rolePunSnackMgr, rolePunSec].forEach((r) =>
      this.rolesStore.set(r.id, r)
    );

    // Permissions for Pune Roles
    this.grantRolePermissions("role-pun-admin", "th-pun-001", ["bookings:read", "movies:read", "reports:read", "staff:read", "staff:manage", "settings:read", "halls:read"]);
    this.grantRolePermissions("role-pun-hallmgr", "th-pun-001", ["halls:read", "halls:calibrate", "shows:read", "tickets:validate"]);
    this.grantRolePermissions("role-pun-vipmgr", "th-pun-001", ["bookings:read", "tickets:validate", "shows:read"]);
    this.grantRolePermissions("role-pun-snackmgr", "th-pun-001", ["dashboard:view", "shows:read"]);
    this.grantRolePermissions("role-pun-sec", "th-pun-001", ["tickets:scan", "tickets:validate"]);

    // Staff Members for Pune
    const stPun1: TheatreStaffRecord = {
      id: "st-pun-001",
      theatreId: "th-pun-001",
      employeeCode: "EMP-PUN-001",
      firstName: "Rajesh",
      lastName: "Sharma",
      displayName: "Rajesh Sharma",
      email: "rajesh.sharma@cinesphere.in",
      phone: "+91 98200 11223",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
      designation: "General Manager",
      departmentId: "dept-pun-ops",
      employmentStatus: "ACTIVE",
      joiningDate: new Date("2025-06-01"),
      resignationDate: null,
      reportingManagerId: null,
      emergencyContact: { name: "Sunita Sharma", relationship: "Spouse", phone: "+91 98200 99887" },
      notes: "Founding general manager of Pune Flagship.",
      metadata: {},
      createdBy: "usr-super-1",
      updatedBy: "usr-super-1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    const stPun2: TheatreStaffRecord = {
      id: "st-pun-002",
      theatreId: "th-pun-001",
      employeeCode: "EMP-PUN-002",
      firstName: "Anita",
      lastName: "Desai",
      displayName: "Anita Desai",
      email: "anita.desai@cinesphere.in",
      phone: "+91 98201 22334",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80",
      designation: "Senior Hall Manager",
      departmentId: "dept-pun-ops",
      employmentStatus: "ACTIVE",
      joiningDate: new Date("2025-08-15"),
      resignationDate: null,
      reportingManagerId: "st-pun-001",
      emergencyContact: { name: "Ramesh Desai", relationship: "Father", phone: "+91 98201 88776" },
      notes: "Certified Dolby Atmos sound technician.",
      metadata: {},
      createdBy: "usr-th-pun",
      updatedBy: "usr-th-pun",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    const stPun3: TheatreStaffRecord = {
      id: "st-pun-003",
      theatreId: "th-pun-001",
      employeeCode: "EMP-PUN-003",
      firstName: "Vikram",
      lastName: "Malhotra",
      displayName: "Vikram Malhotra",
      email: "vikram.m@cinesphere.in",
      phone: "+91 98202 33445",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80",
      designation: "VIP Lounge Lead",
      departmentId: "dept-pun-food",
      employmentStatus: "ACTIVE",
      joiningDate: new Date("2025-10-01"),
      resignationDate: null,
      reportingManagerId: "st-pun-001",
      emergencyContact: null,
      notes: "Oversees fine-dining cinema experiences.",
      metadata: {},
      createdBy: "usr-th-pun",
      updatedBy: "usr-th-pun",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    [stPun1, stPun2, stPun3].forEach((s) => this.staffStore.set(s.id, s));

    // Role Assignments for Pune
    this.assignRoleDirect("st-pun-001", "role-pun-admin", "th-pun-001", true, "usr-super-1");
    this.assignRoleDirect("st-pun-002", "role-pun-hallmgr", "th-pun-001", true, "usr-th-pun");
    this.assignRoleDirect("st-pun-003", "role-pun-vipmgr", "th-pun-001", true, "usr-th-pun");

    // 3. Seed Theatre B: Mumbai / North American Circuit (th-mum-001)
    // Departments
    const depMumMgmt: StaffDepartmentRecord = {
      id: "dept-mum-mgmt",
      theatreId: "th-mum-001",
      code: "DEP-MUM-MGMT",
      name: "Management",
      departmentType: "ADMINISTRATION",
      description: "Circuit management and audit operations.",
      departmentHeadId: null,
      isCustom: false,
      status: "ACTIVE",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    const depMumProj: StaffDepartmentRecord = {
      id: "dept-mum-proj",
      theatreId: "th-mum-001",
      code: "DEP-MUM-PROJ",
      name: "Projection Engineering",
      departmentType: "PROJECTION",
      description: "Laser optical engineers and digital sound specialists.",
      departmentHeadId: null,
      isCustom: false,
      status: "ACTIVE",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    [depMumMgmt, depMumProj].forEach((d) => this.departmentsStore.set(d.id, d));

    // Roles for Theatre B: Cinema Manager, Projection Engineer, Food Court Supervisor, Customer Care
    const roleMumMgr: TheatreRoleRecord = {
      id: "role-mum-mgr",
      theatreId: "th-mum-001",
      templateId: "tmpl-theatre-admin",
      roleCode: "CINEMA_MANAGER",
      name: "Cinema Manager",
      description: "International theatre director.",
      isCustom: true,
      isSystemDefault: true,
      hierarchyLevel: 5,
      status: "ACTIVE",
      createdBy: "usr-super-1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    const roleMumProj: TheatreRoleRecord = {
      id: "role-mum-proj",
      theatreId: "th-mum-001",
      templateId: "tmpl-projection",
      roleCode: "PROJECTION_ENGINEER",
      name: "Projection Engineer",
      description: "Head of optical and sound engineering.",
      isCustom: true,
      isSystemDefault: false,
      hierarchyLevel: 3,
      status: "ACTIVE",
      createdBy: "usr-super-1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    [roleMumMgr, roleMumProj].forEach((r) => this.rolesStore.set(r.id, r));

    // Theatre B permissions: Reports, Payments, Bookings
    this.grantRolePermissions("role-mum-mgr", "th-mum-001", ["reports:read", "reports:export", "payments:view", "bookings:read", "bookings:create"]);

    const stMum1: TheatreStaffRecord = {
      id: "st-mum-101",
      theatreId: "th-mum-001",
      employeeCode: "EMP-MUM-101",
      firstName: "Carlos",
      lastName: "Mendez",
      displayName: "Carlos Mendez",
      email: "carlos.mendez@cinesphere.com",
      phone: "+1 212 555 0199",
      avatarUrl: null,
      designation: "Executive Director",
      departmentId: "dept-mum-mgmt",
      employmentStatus: "ACTIVE",
      joiningDate: new Date("2025-04-10"),
      resignationDate: null,
      reportingManagerId: null,
      emergencyContact: null,
      notes: null,
      metadata: {},
      createdBy: "usr-super-1",
      updatedBy: "usr-super-1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    this.staffStore.set(stMum1.id, stMum1);
    this.assignRoleDirect("st-mum-101", "role-mum-mgr", "th-mum-001", true, "usr-super-1");

    // 4. Seed Theatre C: Dubai CineSphere (th-dxb-001)
    // Departments
    const depDxbOps: StaffDepartmentRecord = {
      id: "dept-dxb-ops",
      theatreId: "th-dxb-001",
      code: "DEP-DXB-OPS",
      name: "Operations & Turnaround",
      departmentType: "OPERATIONS",
      description: "Turnstile control and theater sanitization.",
      departmentHeadId: null,
      isCustom: false,
      status: "ACTIVE",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    this.departmentsStore.set(depDxbOps.id, depDxbOps);

    // Roles for Theatre C: Operations Head, Projection Lead, Technical Manager, Cleaner
    const roleDxbOpsHead: TheatreRoleRecord = {
      id: "role-dxb-opshead",
      theatreId: "th-dxb-001",
      templateId: null,
      roleCode: "OPERATIONS_HEAD",
      name: "Operations Head",
      description: "Managing UAE luxury complex operations.",
      isCustom: true,
      isSystemDefault: true,
      hierarchyLevel: 5,
      status: "ACTIVE",
      createdBy: "usr-super-1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    this.rolesStore.set(roleDxbOpsHead.id, roleDxbOpsHead);

    // Theatre C permissions: Bookings, Shows, Hall Management
    this.grantRolePermissions("role-dxb-opshead", "th-dxb-001", ["bookings:read", "bookings:create", "shows:read", "shows:create", "halls:read", "halls:manage"]);

    const stDxb1: TheatreStaffRecord = {
      id: "st-dxb-201",
      theatreId: "th-dxb-001",
      employeeCode: "EMP-DXB-201",
      firstName: "Tariq",
      lastName: "Al-Mansoor",
      displayName: "Tariq Al-Mansoor",
      email: "tariq.mansoor@cinesphere.ae",
      phone: "+971 4 300 1234",
      avatarUrl: null,
      designation: "Head of Operations",
      departmentId: "dept-dxb-ops",
      employmentStatus: "ACTIVE",
      joiningDate: new Date("2025-01-15"),
      resignationDate: null,
      reportingManagerId: null,
      emergencyContact: null,
      notes: "GCC cinema operations lead.",
      metadata: {},
      createdBy: "usr-super-1",
      updatedBy: "usr-super-1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    this.staffStore.set(stDxb1.id, stDxb1);
    this.assignRoleDirect("st-dxb-201", "role-dxb-opshead", "th-dxb-001", true, "usr-super-1");
  }

  private grantRolePermissions(roleId: string, theatreId: string, permissionKeys: string[], actorId = "usr-super-1"): void {
    permissionKeys.forEach((key) => {
      const permItem = PLATFORM_PERMISSION_CATALOG.find((p) => p.key === key);
      const permRecord: TheatrePermissionRecord = {
        id: `perm-${roleId}-${key.replace(/:/g, "_")}`,
        theatreId,
        roleId,
        permissionKey: key,
        module: permItem?.module || "CUSTOM",
        isGranted: true,
        grantedBy: actorId,
        grantedAt: new Date(),
      };
      this.permissionsStore.set(permRecord.id, permRecord);
    });
  }

  private assignRoleDirect(staffId: string, roleId: string, theatreId: string, isPrimary: boolean, actorId: string): void {
    const assignmentId = `assign-${staffId}-${roleId}`;
    const record: StaffRoleAssignmentRecord = {
      id: assignmentId,
      theatreId,
      staffId,
      roleId,
      isPrimary,
      assignedBy: actorId,
      assignedAt: new Date(),
      expiresAt: null,
    };
    this.assignmentsStore.set(assignmentId, record);
    this.historyStore.push({
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      theatreId,
      staffId,
      previousRoleId: null,
      newRoleId: roleId,
      changeType: "ASSIGNED",
      reason: "Initial role assignment upon onboarding",
      changedBy: actorId,
      changedRole: "SUPER_ADMIN",
      createdAt: new Date(),
    });
  }

  // ----------------------------------------------------------------------------
  // Base Repository Implementation
  // ----------------------------------------------------------------------------
  public async findById(id: string): Promise<TheatreStaffRecord | null> {
    const s = this.staffStore.get(id);
    return s ? { ...s } : null;
  }

  public async findAll(): Promise<TheatreStaffRecord[]> {
    return Array.from(this.staffStore.values()).map((s) => ({ ...s }));
  }

  public async create(data: TheatreStaffRecord): Promise<TheatreStaffRecord> {
    this.staffStore.set(data.id, { ...data });
    return { ...data };
  }

  public async update(id: string, data: Partial<TheatreStaffRecord>): Promise<TheatreStaffRecord | null> {
    const existing = this.staffStore.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.staffStore.set(id, updated);
    return { ...updated };
  }

  public async delete(id: string): Promise<boolean> {
    const existing = this.staffStore.get(id);
    if (!existing) return false;
    this.staffStore.delete(id);
    // Cleanup assignments
    for (const [assignId, assign] of this.assignmentsStore.entries()) {
      if (assign.staffId === id) {
        this.assignmentsStore.delete(assignId);
      }
    }
    return true;
  }

  // ----------------------------------------------------------------------------
  // Staff Queries & Search
  // ----------------------------------------------------------------------------
  public async findByTheatre(theatreId: string): Promise<TheatreStaffRecord[]> {
    return Array.from(this.staffStore.values())
      .filter((s) => s.theatreId === theatreId)
      .map((s) => ({ ...s }));
  }

  public async findByEmployeeCode(theatreId: string, employeeCode: string): Promise<TheatreStaffRecord | null> {
    const found = Array.from(this.staffStore.values()).find(
      (s) => s.theatreId === theatreId && s.employeeCode.toUpperCase() === employeeCode.toUpperCase()
    );
    return found ? { ...found } : null;
  }

  public async findByEmail(email: string): Promise<TheatreStaffRecord | null> {
    const found = Array.from(this.staffStore.values()).find(
      (s) => s.email.toLowerCase() === email.toLowerCase()
    );
    return found ? { ...found } : null;
  }

  public async searchStaff(filters: StaffSearchFilters): Promise<{
    items: StaffMemberWithRoles[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let allStaff = Array.from(this.staffStore.values());

    if (filters.theatreId) {
      allStaff = allStaff.filter((s) => s.theatreId === filters.theatreId);
    }

    if (filters.employmentStatus && filters.employmentStatus !== "ALL") {
      allStaff = allStaff.filter((s) => s.employmentStatus === filters.employmentStatus);
    }

    if (filters.departmentId) {
      allStaff = allStaff.filter((s) => s.departmentId === filters.departmentId);
    }

    if (filters.roleId) {
      const staffIdsWithRole = new Set(
        Array.from(this.assignmentsStore.values())
          .filter((a) => a.roleId === filters.roleId)
          .map((a) => a.staffId)
      );
      allStaff = allStaff.filter((s) => staffIdsWithRole.has(s.id));
    }

    if (filters.query && filters.query.trim()) {
      const q = filters.query.trim().toLowerCase();
      allStaff = allStaff.filter((s) => {
        const matchesName =
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.displayName.toLowerCase().includes(q);
        const matchesCode = s.employeeCode.toLowerCase().includes(q);
        const matchesEmail = s.email.toLowerCase().includes(q);
        const matchesPhone = s.phone.toLowerCase().includes(q);
        const matchesDesignation = s.designation.toLowerCase().includes(q);
        return matchesName || matchesCode || matchesEmail || matchesPhone || matchesDesignation;
      });
    }

    const total = allStaff.length;
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginatedStaff = allStaff.slice(start, start + limit);

    const items: StaffMemberWithRoles[] = [];
    for (const s of paginatedStaff) {
      const populated = await this.populateStaffWithRoles(s);
      items.push(populated);
    }

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  public async getStaffWithRoles(staffId: string): Promise<StaffMemberWithRoles | null> {
    const s = this.staffStore.get(staffId);
    if (!s) return null;
    return this.populateStaffWithRoles(s);
  }

  private async populateStaffWithRoles(s: TheatreStaffRecord): Promise<StaffMemberWithRoles> {
    const assignments = Array.from(this.assignmentsStore.values()).filter((a) => a.staffId === s.id);
    const roles: TheatreRoleRecord[] = [];
    let primaryRole: TheatreRoleRecord | null = null;
    const permissionKeysSet = new Set<string>();

    for (const a of assignments) {
      const r = this.rolesStore.get(a.roleId);
      if (r) {
        roles.push({ ...r });
        if (a.isPrimary) {
          primaryRole = { ...r };
        }
        // Collect permissions
        const perms = Array.from(this.permissionsStore.values()).filter(
          (p) => p.roleId === r.id && p.isGranted
        );
        perms.forEach((p) => permissionKeysSet.add(p.permissionKey));
      }
    }

    const department = s.departmentId ? this.departmentsStore.get(s.departmentId) || null : null;

    return {
      ...s,
      primaryRole,
      roles,
      department: department ? { ...department } : null,
      permissions: Array.from(permissionKeysSet),
    };
  }

  // ----------------------------------------------------------------------------
  // Bundle Aggregator
  // ----------------------------------------------------------------------------
  public async getStaffBundle(theatreId: string): Promise<TheatreStaffOrganizationBundle> {
    const staffRecords = Array.from(this.staffStore.values()).filter((s) => s.theatreId === theatreId);
    const populatedStaff: StaffMemberWithRoles[] = [];
    for (const s of staffRecords) {
      populatedStaff.push(await this.populateStaffWithRoles(s));
    }

    const rolesRecords = Array.from(this.rolesStore.values()).filter((r) => r.theatreId === theatreId);
    const populatedRoles: TheatreRoleWithPermissions[] = [];
    for (const r of rolesRecords) {
      const perms = Array.from(this.permissionsStore.values()).filter((p) => p.roleId === r.id);
      const activeCount = Array.from(this.assignmentsStore.values()).filter(
        (a) => a.roleId === r.id && a.theatreId === theatreId
      ).length;
      populatedRoles.push({
        ...r,
        permissions: perms.map((p) => ({ ...p })),
        activeStaffCount: activeCount,
      });
    }

    const departments = Array.from(this.departmentsStore.values())
      .filter((d) => d.theatreId === theatreId)
      .map((d) => ({ ...d }));

    const templates = Array.from(this.templatesStore.values()).map((t) => ({ ...t }));

    const totalStaffCount = staffRecords.length;
    const activeStaffCount = staffRecords.filter((s) => s.employmentStatus === "ACTIVE").length;
    const suspendedStaffCount = staffRecords.filter((s) => s.employmentStatus === "SUSPENDED").length;

    return {
      theatreId,
      staff: populatedStaff,
      roles: populatedRoles,
      departments,
      templates,
      totalStaffCount,
      activeStaffCount,
      suspendedStaffCount,
    };
  }

  // ----------------------------------------------------------------------------
  // Role Templates (Platform Catalog)
  // ----------------------------------------------------------------------------
  public async getTemplates(): Promise<RoleTemplateRecord[]> {
    return Array.from(this.templatesStore.values()).map((t) => ({ ...t }));
  }

  public async getTemplateById(templateId: string): Promise<RoleTemplateRecord | null> {
    const t = this.templatesStore.get(templateId);
    return t ? { ...t } : null;
  }

  // ----------------------------------------------------------------------------
  // Theatre Roles (Tenant-Owned)
  // ----------------------------------------------------------------------------
  public async getRolesByTheatre(theatreId: string): Promise<TheatreRoleRecord[]> {
    return Array.from(this.rolesStore.values())
      .filter((r) => r.theatreId === theatreId && r.status !== "ARCHIVED")
      .map((r) => ({ ...r }));
  }

  public async getRoleById(roleId: string): Promise<TheatreRoleRecord | null> {
    const r = this.rolesStore.get(roleId);
    return r ? { ...r } : null;
  }

  public async createRole(data: CreateTheatreRoleInput, actorId = "usr-system"): Promise<TheatreRoleRecord> {
    const roleId = `role-${data.theatreId}-${data.roleCode.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`;
    const newRole: TheatreRoleRecord = {
      id: roleId,
      theatreId: data.theatreId,
      templateId: data.templateId || null,
      roleCode: data.roleCode.toUpperCase(),
      name: data.name,
      description: data.description || null,
      isCustom: true,
      isSystemDefault: false,
      hierarchyLevel: data.hierarchyLevel || 1,
      status: "ACTIVE",
      createdBy: actorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.rolesStore.set(roleId, newRole);

    if (data.permissions && data.permissions.length > 0) {
      this.grantRolePermissions(roleId, data.theatreId, data.permissions, actorId);
    }

    return { ...newRole };
  }

  public async updateRole(roleId: string, data: UpdateTheatreRoleInput): Promise<TheatreRoleRecord | null> {
    const existing = this.rolesStore.get(roleId);
    if (!existing) return null;
    const updated: TheatreRoleRecord = {
      ...existing,
      name: data.name !== undefined ? data.name : existing.name,
      description: data.description !== undefined ? data.description : existing.description,
      hierarchyLevel: data.hierarchyLevel !== undefined ? data.hierarchyLevel : existing.hierarchyLevel,
      status: data.status !== undefined ? data.status : existing.status,
      updatedAt: new Date(),
    };
    this.rolesStore.set(roleId, updated);
    return { ...updated };
  }

  public async instantiateRoleFromTemplate(
    input: InstantiateRoleFromTemplateInput,
    actorId = "usr-system"
  ): Promise<TheatreRoleRecord> {
    const template = this.templatesStore.get(input.templateId);
    if (!template) {
      throw new Error(`Platform template '${input.templateId}' does not exist.`);
    }

    const roleCode = `${template.templateCode.replace("TEMPLATE_", "")}_${Date.now().toString(36).toUpperCase()}`;
    const roleId = `role-${input.theatreId}-${Date.now().toString(36)}`;
    const newRole: TheatreRoleRecord = {
      id: roleId,
      theatreId: input.theatreId,
      templateId: template.id,
      roleCode,
      name: input.customName || template.name,
      description: input.customDescription || template.description,
      isCustom: false,
      isSystemDefault: false,
      hierarchyLevel: input.customHierarchyLevel || template.hierarchyLevel,
      status: "ACTIVE",
      createdBy: actorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.rolesStore.set(roleId, newRole);

    const permissionsToGrant = input.overriddenPermissions || template.defaultPermissions;
    this.grantRolePermissions(roleId, input.theatreId, permissionsToGrant, actorId);

    return { ...newRole };
  }

  // ----------------------------------------------------------------------------
  // Role Permissions
  // ----------------------------------------------------------------------------
  public async getRolePermissions(roleId: string): Promise<TheatrePermissionRecord[]> {
    return Array.from(this.permissionsStore.values())
      .filter((p) => p.roleId === roleId)
      .map((p) => ({ ...p }));
  }

  public async updateRolePermissions(
    input: UpdateRolePermissionsInput,
    actorId = "usr-system"
  ): Promise<TheatrePermissionRecord[]> {
    // Revoke existing for this role
    for (const [permId, perm] of this.permissionsStore.entries()) {
      if (perm.roleId === input.roleId) {
        this.permissionsStore.delete(permId);
      }
    }

    const results: TheatrePermissionRecord[] = [];
    for (const p of input.permissions) {
      const permId = `perm-${input.roleId}-${p.permissionKey.replace(/:/g, "_")}`;
      const record: TheatrePermissionRecord = {
        id: permId,
        theatreId: input.theatreId,
        roleId: input.roleId,
        permissionKey: p.permissionKey,
        module: p.module,
        isGranted: p.isGranted,
        grantedBy: actorId,
        grantedAt: new Date(),
      };
      this.permissionsStore.set(permId, record);
      results.push({ ...record });
    }
    return results;
  }

  // ----------------------------------------------------------------------------
  // Role Assignments & History
  // ----------------------------------------------------------------------------
  public async assignRole(
    input: AssignRoleInput,
    actorId = "usr-system",
    actorRole = "THEATRE_ADMIN"
  ): Promise<StaffRoleAssignmentRecord> {
    const existingStaff = this.staffStore.get(input.staffId);
    if (!existingStaff) throw new Error("Staff member not found");
    const existingRole = this.rolesStore.get(input.roleId);
    if (!existingRole) throw new Error("Role not found");

    if (input.isPrimary) {
      // Clear other primary flags
      for (const assign of this.assignmentsStore.values()) {
        if (assign.staffId === input.staffId && assign.isPrimary) {
          assign.isPrimary = false;
        }
      }
    }

    const assignmentId = `assign-${input.staffId}-${input.roleId}`;
    const assignmentRecord: StaffRoleAssignmentRecord = {
      id: assignmentId,
      theatreId: input.theatreId,
      staffId: input.staffId,
      roleId: input.roleId,
      isPrimary: input.isPrimary !== undefined ? input.isPrimary : true,
      assignedBy: actorId,
      assignedAt: new Date(),
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    };
    this.assignmentsStore.set(assignmentId, assignmentRecord);

    // Record Role History
    this.historyStore.push({
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      theatreId: input.theatreId,
      staffId: input.staffId,
      previousRoleId: null,
      newRoleId: input.roleId,
      changeType: "ASSIGNED",
      reason: input.reason || "Staff role assigned",
      changedBy: actorId,
      changedRole: actorRole,
      createdAt: new Date(),
    });

    return { ...assignmentRecord };
  }

  public async removeRole(
    input: RemoveRoleInput,
    actorId = "usr-system",
    actorRole = "THEATRE_ADMIN"
  ): Promise<boolean> {
    const assignmentId = `assign-${input.staffId}-${input.roleId}`;
    const exists = this.assignmentsStore.get(assignmentId);
    if (!exists) return false;

    this.assignmentsStore.delete(assignmentId);

    // Record Role History
    this.historyStore.push({
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      theatreId: input.theatreId,
      staffId: input.staffId,
      previousRoleId: input.roleId,
      newRoleId: "REVOKED",
      changeType: "REVOKED",
      reason: input.reason || "Staff role unassigned",
      changedBy: actorId,
      changedRole: actorRole,
      createdAt: new Date(),
    });

    return true;
  }

  public async getRoleHistory(theatreId: string, staffId: string): Promise<StaffRoleHistoryRecord[]> {
    return this.historyStore
      .filter((h) => h.theatreId === theatreId && h.staffId === staffId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((h) => ({ ...h }));
  }

  // ----------------------------------------------------------------------------
  // Departments
  // ----------------------------------------------------------------------------
  public async getDepartmentsByTheatre(theatreId: string): Promise<StaffDepartmentRecord[]> {
    return Array.from(this.departmentsStore.values())
      .filter((d) => d.theatreId === theatreId)
      .map((d) => ({ ...d }));
  }

  public async getDepartmentById(deptId: string): Promise<StaffDepartmentRecord | null> {
    const d = this.departmentsStore.get(deptId);
    return d ? { ...d } : null;
  }

  public async createDepartment(data: CreateDepartmentInput): Promise<StaffDepartmentRecord> {
    const deptId = `dept-${data.theatreId}-${data.code.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`;
    const newDept: StaffDepartmentRecord = {
      id: deptId,
      theatreId: data.theatreId,
      code: data.code.toUpperCase(),
      name: data.name,
      departmentType: data.departmentType || "OPERATIONS",
      description: data.description || null,
      departmentHeadId: data.departmentHeadId || null,
      isCustom: true,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.departmentsStore.set(deptId, newDept);
    return { ...newDept };
  }

  public async updateDepartment(deptId: string, data: UpdateDepartmentInput): Promise<StaffDepartmentRecord | null> {
    const existing = this.departmentsStore.get(deptId);
    if (!existing) return null;
    const updated: StaffDepartmentRecord = {
      ...existing,
      name: data.name !== undefined ? data.name : existing.name,
      description: data.description !== undefined ? data.description : existing.description,
      departmentHeadId: data.departmentHeadId !== undefined ? data.departmentHeadId : existing.departmentHeadId,
      status: data.status !== undefined ? data.status : existing.status,
      updatedAt: new Date(),
    };
    this.departmentsStore.set(deptId, updated);
    return { ...updated };
  }

  // ----------------------------------------------------------------------------
  // Future Shift Placeholder
  // ----------------------------------------------------------------------------
  public async getShiftsByStaff(staffId: string): Promise<FutureShiftPlaceholderRecord[]> {
    return Array.from(this.shiftsStore.values())
      .filter((s) => s.staffId === staffId)
      .map((s) => ({ ...s }));
  }

  public async registerFutureShiftPlaceholder(
    data: Omit<FutureShiftPlaceholderRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<FutureShiftPlaceholderRecord> {
    const id = `shift-${data.staffId}-${Date.now().toString(36)}`;
    const record: FutureShiftPlaceholderRecord = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.shiftsStore.set(id, record);
    return { ...record };
  }
}

export const theatreStaffRepository = new TheatreStaffRepository();
