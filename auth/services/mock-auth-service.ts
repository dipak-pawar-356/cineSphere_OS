import { AuthUser } from "../types/user.types";
import { UserRole } from "../types/role.types";
import { getRolePermissions } from "../permissions/rbac-matrix";

export const MOCK_USERS: Record<string, AuthUser> = {
  SUPER_ADMIN: {
    id: "usr-super-001",
    clerkId: "user_2superadmin_cinesphere",
    email: "superadmin@cinesphere.io",
    displayName: "Vikramaditya Singhania",
    role: "SUPER_ADMIN",
    theatreId: null,
    theatreName: null,
    isEmailVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
    permissions: getRolePermissions("SUPER_ADMIN"),
    status: "ACTIVE",
  },

  THEATRE_ADMIN_PUNE: {
    id: "usr-admin-pune-01",
    clerkId: "user_2admin_pune_cinesphere",
    email: "rajesh.kulkarni@cinesphere.com",
    displayName: "Rajesh Kulkarni (Pune Admin)",
    role: "THEATRE_ADMIN",
    theatreId: "th-pun-001",
    theatreName: "CineSphere Grand Cinemas (Pune)",
    isEmailVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
    permissions: getRolePermissions("THEATRE_ADMIN"),
    status: "ACTIVE",
  },

  THEATRE_ADMIN_MUMBAI: {
    id: "usr-admin-mum-01",
    clerkId: "user_2admin_mumbai_cinesphere",
    email: "ananya.deshmukh@cinesphere.com",
    displayName: "Ananya Deshmukh (Mumbai Admin)",
    role: "THEATRE_ADMIN",
    theatreId: "th-mum-001",
    theatreName: "CineSphere Royale Palladium (Mumbai)",
    isEmailVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80",
    permissions: getRolePermissions("THEATRE_ADMIN"),
    status: "ACTIVE",
  },

  HALL_MANAGER: {
    id: "usr-mgr-pune-01",
    clerkId: "user_2mgr_pune_cinesphere",
    email: "rohan.shinde@cinesphere.com",
    displayName: "Rohan Shinde (Hall Manager)",
    role: "HALL_MANAGER",
    theatreId: "th-pun-001",
    theatreName: "CineSphere Grand Cinemas (Pune)",
    isEmailVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80",
    permissions: getRolePermissions("HALL_MANAGER"),
    status: "ACTIVE",
  },

  STAFF: {
    id: "usr-staff-pune-01",
    clerkId: "user_2staff_pune_cinesphere",
    email: "priya.sharma@cinesphere.com",
    displayName: "Priya Sharma (Box Office & Gate)",
    role: "STAFF",
    theatreId: "th-pun-001",
    theatreName: "CineSphere Grand Cinemas (Pune)",
    isEmailVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80",
    permissions: getRolePermissions("STAFF"),
    status: "ACTIVE",
  },

  CUSTOMER: {
    id: "usr-cust-001",
    clerkId: "user_2cust_aarav_cinesphere",
    email: "aarav.mehta@gmail.com",
    displayName: "Aarav Mehta (Patron)",
    role: "CUSTOMER",
    theatreId: null,
    theatreName: null,
    isEmailVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80",
    permissions: getRolePermissions("CUSTOMER"),
    status: "ACTIVE",
  },
};

export function getMockUserByRole(role: UserRole): AuthUser {
  if (role === "SUPER_ADMIN") return MOCK_USERS.SUPER_ADMIN;
  if (role === "THEATRE_ADMIN") return MOCK_USERS.THEATRE_ADMIN_PUNE;
  if (role === "HALL_MANAGER") return MOCK_USERS.HALL_MANAGER;
  if (role === "STAFF") return MOCK_USERS.STAFF;
  return MOCK_USERS.CUSTOMER;
}

