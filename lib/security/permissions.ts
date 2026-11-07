export enum Permission {
  // Tenant & Organization
  MANAGE_TENANTS = "tenant:manage",
  VIEW_TENANTS = "tenant:view",

  // Theatres & Auditoriums
  MANAGE_THEATRES = "theatre:manage",
  VIEW_THEATRES = "theatre:view",
  MANAGE_HALLS = "hall:manage",
  CALIBRATE_HARDWARE = "hardware:calibrate",

  // Movies & Programming
  MANAGE_MOVIES = "movie:manage",
  SCHEDULE_SHOWS = "show:schedule",

  // Bookings & Operations
  CREATE_BOOKINGS = "booking:create",
  VIEW_ALL_BOOKINGS = "booking:view_all",
  CANCEL_BOOKING = "booking:cancel",
  SCAN_TICKET = "ticket:scan",

  // Financial & Reports
  VIEW_FINANCIALS = "finance:view",
  EXPORT_REPORTS = "reports:export",
}

export interface UserPermissionContext {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: Permission[];
}
