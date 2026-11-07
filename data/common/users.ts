import { Role } from "@/types";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  assignedEntity?: string;
  status: "Active" | "Inactive";
}

export const MOCK_USERS: DemoUser[] = [
  {
    id: "usr-super-1",
    name: "Vikram Singhania",
    email: "vikram.singhania@cinesphere.io",
    role: "Super Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    assignedEntity: "Global Platform Headquarters",
    status: "Active",
  },
  {
    id: "usr-theatre-1",
    name: "Rajesh Kulkarni",
    email: "gm.pune@cinesphere.io",
    role: "Theatre Admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
    assignedEntity: "CineSphere Grand Cinemas (Pune)",
    status: "Active",
  },
  {
    id: "usr-hall-1",
    name: "Deepak Shinde",
    email: "deepak.shinde@cinesphere.io",
    role: "Hall Manager",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    assignedEntity: "Screen 02 — IMAX with Laser",
    status: "Active",
  },
  {
    id: "usr-staff-1",
    name: "Sunita More",
    email: "sunita.m@cinesphere.io",
    role: "Staff",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    assignedEntity: "Entrance Turnstiles 1-4",
    status: "Active",
  },
  {
    id: "usr-cust-1",
    name: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    role: "Customer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    assignedEntity: "CineSphere VIP Member",
    status: "Active",
  },
];
