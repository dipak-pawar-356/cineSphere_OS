import { ID } from "@/types";

export interface SupportTicket {
  id: ID;
  ticketNumber: string;
  theatreId: ID;
  customerName: string;
  customerEmail: string;
  category: "Ticket Refund" | "Concession Issue" | "Seat Hardware" | "Lost & Found" | "Audio/Video Feedback";
  subject: string;
  priority: "High" | "Medium" | "Urgent" | "Low";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  createdAt: string;
  assignedStaff: string;
}

export const THEATRE_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "tkt-001",
    ticketNumber: "TKT-PUN-4091",
    theatreId: "th-pun-001",
    customerName: "Aarav Sharma",
    customerEmail: "aarav.sharma@example.com",
    category: "Seat Hardware",
    subject: "Row Q Recliner 04 leg rest motor response slow",
    priority: "Medium",
    status: "In Progress",
    createdAt: "Today, 11:20 AM",
    assignedStaff: "Sunil Deshpande",
  },
  {
    id: "tkt-002",
    ticketNumber: "TKT-PUN-4092",
    theatreId: "th-pun-001",
    customerName: "Meenakshi Sundaram",
    customerEmail: "meenakshi.s@example.com",
    category: "Ticket Refund",
    subject: "Double charge verification on failed UPI attempt",
    priority: "High",
    status: "Resolved",
    createdAt: "Today, 09:45 AM",
    assignedStaff: "Pooja Gaikwad",
  },
  {
    id: "tkt-003",
    ticketNumber: "TKT-PUN-4093",
    theatreId: "th-pun-001",
    customerName: "Rohan Varma",
    customerEmail: "rohan.varma@example.com",
    category: "Lost & Found",
    subject: "Left sunglasses case in Hall 3 seat F-09",
    priority: "Low",
    status: "Open",
    createdAt: "Yesterday, 10:15 PM",
    assignedStaff: "Ramesh Pawar",
  },
];
