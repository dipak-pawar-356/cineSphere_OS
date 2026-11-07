import { ID } from "./common.types";

export type StaffRole =
  | "Theatre Admin"
  | "Hall Manager"
  | "Ticket Counter Staff"
  | "Floor Staff"
  | "Food Court Staff"
  | "Projectionist"
  | "Support Staff";

export type StaffShift =
  | "Morning (08:00 - 16:30)"
  | "Evening (16:00 - 00:30)"
  | "Night Shift"
  | "Rotational";

export type StaffStatus = "On Duty" | "Off Duty" | "On Leave" | "Terminated";

export interface Staff {
  id: ID;
  employeeCode: string;
  name: string;
  avatar: string;
  designation: string;
  role: StaffRole;
  theatreId: ID;
  assignedHall: string;
  email: string;
  phone: string;
  joiningDate: string;
  shift: StaffShift;
  status: StaffStatus;
}

